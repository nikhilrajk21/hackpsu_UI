import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileFrame from './MobileFrame'
import CanvasModal from './CanvasModal'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
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
        const parsedClasses = parseICSFile(text)
        await uploadClassesToFirebase(parsedClasses)
        setFileUploaded(true)
        saveToLocalStorage()
        
        // Automatically navigate to landing page after successful upload
        setTimeout(() => {
          navigate('/landing')
        }, 1000) // Small delay to show success state
        
      } catch (error) {
        console.error('Error parsing ICS file:', error)
        alert('Error parsing ICS file. Please try again.')
        setIsLoading(false)
      }
    }
  }

  const parseICSFile = (icsText) => {
    const jcalData = ICAL.parse(icsText)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents('vevent')
    
    const classes = []
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    vevents.forEach(vevent => {
      const event = new ICAL.Event(vevent)
      const startDate = event.startDate.toJSDate()
      const endDate = event.endDate.toJSDate()
      
      // Only include events in the next week
      if (startDate >= now && startDate <= nextWeek) {
        const start = DateTime.fromJSDate(startDate).setZone("America/New_York")
        const end = DateTime.fromJSDate(endDate).setZone("America/New_York")
        
        classes.push({
          summary: event.summary || 'Untitled Class',
          location: event.location || 'N/A',
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

  const uploadClassesToFirebase = async (classes) => {
    const batch = []
    const batchSize = 20
    
    for (let i = 0; i < classes.length; i += batchSize) {
      const batchClasses = classes.slice(i, i + batchSize)
      const promises = batchClasses.map(classData => 
        addDoc(collection(db, 'classSchedules'), classData)
      )
      await Promise.all(promises)
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
      navigate('/landing')
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
