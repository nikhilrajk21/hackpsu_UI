import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileFrame from './MobileFrame'
import StackedClassCard from './StackedClassCard'
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
    
    console.log('Querying classes for today:', startOfDay, 'to', endOfDay)
    
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
      console.log('Found', classes.length, 'classes for today:', classes)
      setTodayClasses(classes)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching classes:', error)
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

  const goToDashboard = () => {
    navigate('/dashboard')
  }

  const handleClassClick = (classData) => {
    console.log('Class clicked:', classData)
    // You can add more functionality here, like showing class details
  }

  if (loading) {
    return (
      <MobileFrame>
        <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your classes...</p>
          </div>
        </div>
      </MobileFrame>
    )
  }

  return (
    <MobileFrame>
      <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating particles */}
          <div className="absolute top-20 left-8 w-2 h-2 bg-green-400 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-40 right-12 w-1 h-1 bg-cyan-400 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-60 left-16 w-1.5 h-1.5 bg-green-300 rounded-full animate-float opacity-30" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-80 right-8 w-1 h-1 bg-emerald-400 rounded-full animate-float opacity-50" style={{animationDelay: '3s'}}></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col p-3">
          {/* App Header (mobile style) */}
          <header className="w-full flex items-center justify-between py-3 px-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vibrant-green to-vibrant-blue flex items-center justify-center text-white font-bold">
                CR
              </div>
              <div>
                <div className="text-lg font-bold text-white">Class Royale</div>
                <div className="text-xs text-gray-400">{DateTime.now().toFormat('EEEE, MMM d')}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 bg-gray-700/60 text-white rounded-lg text-sm">Profile</button>
            </div>
          </header>

          {/* Top stack area */}
          <div className="w-full mt-3">
            <div className="mb-2 text-sm text-gray-300 px-2">Upcoming classes</div>
            <div className="px-2">
              <div className="w-full">
                <StackedClassCard
                  classes={todayClasses}
                  onClassClick={handleClassClick}
                />
              </div>
            </div>
          </div>

          {/* Remainder content */}
          <div className="flex-1 mt-4 overflow-auto px-2">
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
              <h2 className="text-sm font-medium text-gray-300">Summary</h2>
              <p className="text-xs text-gray-400 mt-2">{todayClasses.length} classes today</p>
            </div>
          </div>

          {/* Footer (mobile nav) */}
          <footer className="w-full mt-3 pb-3">
            <div className="w-full bg-gray-900/40 backdrop-blur-sm rounded-xl p-2 flex justify-around items-center">
              <button className="flex flex-col items-center text-xs text-gray-300">
                <span className="text-lg">🏠</span>
                Home
              </button>
              <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-xs text-gray-300">
                <span className="text-lg">📋</span>
                Dashboard
              </button>
              <button className="flex flex-col items-center text-xs text-gray-300">
                <span className="text-lg">⚙️</span>
                Settings
              </button>
            </div>
          </footer>
        </div>
      </div>
    </MobileFrame>
  )
}

export default LandingPage
