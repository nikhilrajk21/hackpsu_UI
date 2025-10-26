import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileFrame from './MobileFrame'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '../firebase'
import { DateTime } from 'luxon'

const LandingPage = () => {
  const [todayClasses, setTodayClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    // Query today's classes
    const q = query(
      collection(db, 'classSchedules'),
      where('startTime', '>=', startOfDay),
      where('startTime', '<', endOfDay),
      orderBy('startTime', 'asc')
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const classes = []
      querySnapshot.forEach((doc) => {
        classes.push({
          id: doc.id,
          ...doc.data()
        })
      })
      setTodayClasses(classes)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getClassStatus = (classData) => {
    const now = new Date()
    const startTime = new Date(classData.startTime)
    const endTime = new Date(classData.endTime)
    
    if (now < startTime) {
      return { status: 'upcoming', color: 'text-blue-400', bgColor: 'bg-blue-500/20' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'current', color: 'text-green-400', bgColor: 'bg-green-500/20' }
    } else {
      return { status: 'completed', color: 'text-gray-400', bgColor: 'bg-gray-500/20' }
    }
  }

  const goToDashboard = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <MobileFrame>
        <div className="h-full bg-gradient-to-br from-dark-bg via-phone-bg to-gray-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      </MobileFrame>
    )
  }

  return (
    <MobileFrame>
      <div className="h-full bg-gradient-to-br from-dark-bg via-phone-bg to-gray-800 relative overflow-hidden">
        {/* Floating Islands Background */}
        <div className="absolute inset-0">
          {/* Large Island */}
          <div className="absolute top-10 left-4 w-32 h-20 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-sm animate-float"></div>
          <div className="absolute top-10 left-4 w-32 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full animate-float"></div>
          
          {/* Medium Island */}
          <div className="absolute top-32 right-6 w-24 h-16 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-full blur-sm animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-32 right-6 w-24 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          
          {/* Small Islands */}
          <div className="absolute top-60 left-8 w-16 h-12 bg-gradient-to-br from-green-600/30 to-emerald-600/30 rounded-full blur-sm animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-60 left-8 w-16 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          
          <div className="absolute top-80 right-12 w-20 h-14 bg-gradient-to-br from-yellow-600/30 to-orange-600/30 rounded-full blur-sm animate-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-80 right-12 w-20 h-14 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col p-4">
          {/* Header */}
          <div className="text-center mb-6 mt-8">
            <h1 className="text-4xl font-royal font-bold text-vibrant-green mb-2 tracking-wide">
              Welcome to Class Royale
            </h1>
            <p className="text-gray-300 text-lg">
              Your academic adventure begins today!
            </p>
          </div>

          {/* Today's Classes */}
          <div className="flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Today's Classes
            </h2>
            
            {todayClasses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-gray-400 text-lg mb-2">No classes today!</p>
                <p className="text-gray-500 text-sm">Enjoy your free day, champion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayClasses.map((classData) => {
                  const status = getClassStatus(classData)
                  
                  return (
                    <div
                      key={classData.id}
                      className={`p-6 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 ${
                        status.bgColor
                      } border-gray-600/30`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {classData.summary}
                          </h3>
                          <div className="space-y-1 text-gray-300">
                            <p className="flex items-center text-sm">
                              <span className="w-4 h-4 mr-2">📍</span>
                              {classData.location}
                            </p>
                            <p className="flex items-center text-sm">
                              <span className="w-4 h-4 mr-2">🕐</span>
                              {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            status.status === 'upcoming' ? 'bg-blue-500 text-white' :
                            status.status === 'current' ? 'bg-green-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {status.status === 'upcoming' ? 'Upcoming' :
                             status.status === 'current' ? 'In Progress' :
                             'Completed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={goToDashboard}
              className="w-full py-4 px-6 bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 button-glow"
            >
              Enter Dashboard
            </button>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Ready to start your academic journey?
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  )
}

export default LandingPage
