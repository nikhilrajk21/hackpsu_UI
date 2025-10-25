import React, { useState, useEffect } from 'react'

const CanvasModal = ({ onSuccess, onClose }) => {
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const steps = [
    {
      title: "Connecting to Canvas",
      description: "Establishing secure connection to your Canvas account...",
      icon: "🔗"
    },
    {
      title: "Requesting Permissions",
      description: "Class Royale needs access to your course data and assignments...",
      icon: "🔐"
    },
    {
      title: "Authorization Complete",
      description: "Successfully connected to Canvas! You can now sync your courses.",
      icon: "✅"
    }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1)
      } else {
        setIsLoading(false)
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [step, onSuccess])

  const handleStartAuth = () => {
    setIsLoading(true)
    setStep(0)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-vibrant-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Canvas Authorization</h2>
          <p className="text-gray-400 mb-6">
            Connect your Canvas account to sync courses and assignments
          </p>

          {!isLoading ? (
            <div className="space-y-4">
              <div className="text-left bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">What we'll access:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Your course list and enrollment</li>
                  <li>• Assignment due dates and grades</li>
                  <li>• Course announcements and updates</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartAuth}
                  className="flex-1 py-3 px-4 bg-vibrant-blue hover:bg-cyan-600 text-white rounded-xl transition-colors button-glow"
                >
                  Authorize
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-vibrant-blue rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-2xl">{steps[step].icon}</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {steps[step].title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {steps[step].description}
                </p>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-vibrant-blue to-vibrant-green h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CanvasModal
