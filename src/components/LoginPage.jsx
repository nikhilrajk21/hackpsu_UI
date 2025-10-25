import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileFrame from './MobileFrame'
import CanvasModal from './CanvasModal'

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.name.endsWith('.ics')) {
      setFileUploaded(true)
      saveToLocalStorage()
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
    if (emailValid && canvasAuthorized && fileUploaded) {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      navigate('/dashboard')
    }
  }

  const canContinue = emailValid && canvasAuthorized && fileUploaded

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
        <div className="relative z-10 h-full flex flex-col justify-center p-6">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 card-glow animate-fade-in border border-gray-700/30">
            {/* Logo and tagline */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-royal font-bold vibrant-gradient mb-2">
                Class Royale
              </h1>
              <p className="text-gray-300 text-sm">
                Gamify your classes. Earn your crown.
              </p>
            </div>

            {/* Email input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your university email"
                className={`w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 transition-all duration-300 ${
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
            <div className="mb-4">
              <button
                onClick={handleCanvasAuth}
                disabled={!emailValid}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className={`block w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
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
                      Schedule Uploaded
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
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
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
