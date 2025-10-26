import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileFrame from './MobileFrame'
import CanvasModal from './CanvasModal'
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import ICAL from 'ical.js'
import { DateTime } from 'luxon'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [canvasAuthorized, setCanvasAuthorized] = useState(false)
  const [fileUploaded, setFileUploaded] = useState(false)
  const [showCanvasModal, setShowCanvasModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Check localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('classRoyaleDemo')
    if (savedData) {
      const data = JSON.parse(savedData)
      setEmail(data.email || '')
      setEmailValid(data.emailValid || false)
      setCanvasAuthorized(data.canvasAuthorized || false)
      setFileUploaded(data.fileUploaded || false)
    }
  }, [])

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.includes('.edu')
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    setEmailValid(validateEmail(value))
  }

  const handleCanvasAuth = () => {
    setShowCanvasModal(true)
  }

  const handleCanvasSuccess = () => {
    setCanvasAuthorized(true)
    setShowCanvasModal(false)
    saveToLocalStorage()
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file && file.name.endsWith('.ics')) {
      setIsLoading(true)
      try {
        const text = await file.text()
        console.log('ICS file content loaded, length:', text.length)
        
        // Use relaxed parsing by default for demos (includes events on same calendar day)
        const parsedClasses = parseICSFile(text, true)
        console.log('Parsed classes (relaxed):', parsedClasses.length, parsedClasses)

        if (parsedClasses.length === 0) {
          alert('No classes found in the ICS file. Please check the file format.')
          setIsLoading(false)
          return
        }

        await uploadClassesToFirebase(parsedClasses)
        console.log('Classes uploaded to Firebase successfully')
        
        setFileUploaded(true)
        saveToLocalStorage()
        
        // Automatically navigate to dashboard after successful upload
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000) // Small delay to show success state
        
      } catch (error) {
        console.error('Error parsing ICS file:', error)
        alert(`Error parsing ICS file: ${error.message}. Please try again.`)
        setIsLoading(false)
      }
    }
  }

  const parseICSFile = (icsText, relaxed = false) => {
    const jcalData = ICAL.parse(icsText)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents('vevent')
    
  const classes = []
  // Use Luxon in America/New_York to compute the time window (avoids JS Date timezone pitfalls)
  const nowNY = DateTime.now().setZone('America/New_York')
  const bufferMinutes = 15
  const nowWithBuffer = nowNY.minus({ minutes: bufferMinutes })
  const nextWeek = nowNY.plus({ days: 7 })

  console.debug('parseICSFile() found vevents count:', vevents.length)
  console.debug('parseICSFile() nowWithBuffer (NY):', nowWithBuffer.toISO(), 'nextWeek (NY):', nextWeek.toISO(), 'relaxed?', relaxed)

    vevents.forEach(vevent => {
      const event = new ICAL.Event(vevent)
  const startDate = event.startDate.toJSDate()
  const endDate = event.endDate.toJSDate()

  // Convert event start to NY zone using Luxon and compare
  const startDT = DateTime.fromJSDate(startDate).setZone('America/New_York')
  const endDT = DateTime.fromJSDate(endDate).setZone('America/New_York')
  let inRange
  if (relaxed) {
    // relaxed: include events from start of today (NY) up to the end of nextWeek
    inRange = startDT >= nowNY.startOf('day') && startDT <= nextWeek.endOf('day')
  } else {
    inRange = startDT >= nowWithBuffer && startDT <= nextWeek
  }
  console.debug('Event:', event.summary, 'startDate (NY):', startDT.toISO(), 'inRange?', inRange)
  if (inRange) {
    const start = startDT
    const end = endDT
        
        // Extract course info from summary (e.g., "CMPSC 221 - LEC")
        const summary = event.summary || 'Untitled Class'
        const courseMatch = summary.match(/^([A-Z]+)\s+(\d+[A-Z]?)\s*-\s*(.+)$/)
        
        classes.push({
          summary: summary,
          courseCode: courseMatch ? `${courseMatch[1]} ${courseMatch[2]}` : summary,
          courseType: courseMatch ? courseMatch[3] : 'Class',
          location: event.location || 'TBA',
          date: start.toFormat("ccc, dd LLL yyyy"),
          start: start.toFormat("hh:mm a"),
          end: end.toFormat("hh:mm a"),
          startTime: start.toJSDate(),
          endTime: end.toJSDate(),
          dayOfWeek: start.weekday,
          isRecurring: !!event.component.getFirstPropertyValue('rrule'),
          originalEventId: event.uid || event.summary,
          attended: false,
          attendanceTime: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    })

    return classes.sort((a, b) => a.startTime - b.startTime)
  }

  const clearExistingData = async () => {
    try {
      console.log('Clearing existing class schedule data...')
      const snapshot = await getDocs(collection(db, 'classSchedules'));
      console.log('Found', snapshot.docs.length, 'existing documents to delete')
      
      if (snapshot.docs.length === 0) {
        console.log('No existing data to clear')
        return
      }
      
      const deletePromises = snapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'classSchedules', docSnapshot.id))
      );
      await Promise.all(deletePromises);
      console.log('Successfully cleared', snapshot.docs.length, 'existing documents');
    } catch (error) {
      console.error('Error clearing existing data:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  const uploadClassesToFirebase = async (classes) => {
    try {
      // Clear existing data first
      await clearExistingData();
      
      console.log('Uploading', classes.length, 'classes to Firebase...')
      const batchSize = 20
      
      for (let i = 0; i < classes.length; i += batchSize) {
        const batchClasses = classes.slice(i, i + batchSize)
        const promises = batchClasses.map(classData => 
          addDoc(collection(db, 'classSchedules'), classData)
        )
        await Promise.all(promises)
        console.log(`Uploaded batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(classes.length/batchSize)}`)
      }
      
      console.log('All classes uploaded successfully!')
    } catch (error) {
      console.error('Error uploading classes to Firebase:', error)
      throw error; // Re-throw to handle in calling function
    }
  }

  const saveToLocalStorage = () => {
    const data = {
      email,
      emailValid,
      canvasAuthorized,
      fileUploaded
    }
    localStorage.setItem('classRoyaleDemo', JSON.stringify(data))
  }

  const handleContinue = async () => {
    if (emailValid && fileUploaded) {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      navigate('/dashboard')
    }
  }

  const canContinue = emailValid && fileUploaded && !isLoading

  return (
    <MobileFrame>
      <div className="h-full bg-gradient-to-br from-dark-bg via-phone-bg to-gray-800 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-vibrant-blue rounded-full animate-float opacity-30"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-vibrant-pink rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-vibrant-purple rounded-full animate-float opacity-20" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 h-full flex flex-col justify-center p-4">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 card-glow animate-fade-in border border-gray-700/30">
            {/* Logo and tagline */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-royal font-bold text-vibrant-green mb-3 tracking-wide">
                Class Royale
              </h1>
              <p className="text-gray-300 text-base">
                Gamify your classes. Earn your crown.
              </p>
            </div>

            {/* Email input */}
            <div className="mb-6">
              <label className="block text-base font-medium text-gray-300 mb-3">
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your university email"
                className={`w-full px-5 py-4 rounded-xl bg-gray-800/50 border-2 transition-all duration-300 text-base ${
                  emailValid 
                    ? 'border-vibrant-green focus:border-vibrant-green' 
                    : email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-600 focus:border-vibrant-blue'
                } text-white placeholder-gray-400 focus:outline-none`}
              />
              {email && !emailValid && (
                <p className="text-red-400 text-xs mt-1">Please enter a valid .edu email address</p>
              )}
              {emailValid && (
                <div className="flex items-center text-vibrant-green text-xs mt-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Valid university email
                </div>
              )}
            </div>

            {/* Canvas Authorization */}
            <div className="mb-6">
              <button
                onClick={handleCanvasAuth}
                disabled={!emailValid}
                className={`w-full py-4 px-5 rounded-xl font-medium text-base transition-all duration-300 ${
                  canvasAuthorized
                    ? 'bg-vibrant-green text-white'
                    : emailValid
                      ? 'bg-vibrant-blue hover:bg-cyan-600 text-white button-glow'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canvasAuthorized ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Canvas Authorized
                  </div>
                ) : (
                  'Authorize Canvas Account'
                )}
              </button>
            </div>

            {/* File Upload */}
            <div className="mb-8">
              <label className="block text-base font-medium text-gray-300 mb-3">
                Upload Schedule (.ics file)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".ics"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`block w-full py-4 px-5 rounded-xl font-medium text-base transition-all duration-300 cursor-pointer ${
                    fileUploaded
                      ? 'bg-vibrant-green text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white border-2 border-dashed border-gray-500 hover:border-vibrant-blue'
                  }`}
                >
                  {fileUploaded ? (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Schedule Uploaded - Redirecting...
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Schedule...
                    </div>
                  ) : (
                    'Upload .ics File'
                  )}
                </label>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!canContinue || isLoading}
              className={`w-full py-5 px-6 rounded-xl font-bold text-xl transition-all duration-300 ${
                canContinue && !isLoading
                  ? 'bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-purple-600 hover:to-pink-600 text-white button-glow transform hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entering the Royale...
                </div>
              ) : (
                'Enter the Royale'
              )}
            </button>
          </div>
        </div>
      </div>

        {/* Canvas Modal */}
        {showCanvasModal && (
          <CanvasModal
            onSuccess={handleCanvasSuccess}
            onClose={() => setShowCanvasModal(false)}
          />
        )}
    </MobileFrame>
  )
}

export default LoginPage
