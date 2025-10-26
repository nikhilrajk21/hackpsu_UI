import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileFrame from './MobileFrame'
import { BiSolidDashboard } from 'react-icons/bi'
import { FcFlashOn } from 'react-icons/fc'
import { BsFillDropletFill, BsFillPeopleFill } from 'react-icons/bs'
import { FaShopify } from 'react-icons/fa'
import { MdLeaderboard } from 'react-icons/md'
import ClassAttendance from './ClassAttendance'

const Dashboard = () => {
  const [userData, setUserData] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const navigate = useNavigate()

  useEffect(() => {
    const savedData = localStorage.getItem('classRoyaleDemo')
    if (savedData) {
      setUserData(JSON.parse(savedData))
    } else {
      navigate('/')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('classRoyaleDemo')
    navigate('/')
  }

  if (!userData) {
    return (
      <MobileFrame>
        <div className="h-full bg-phone-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-blue"></div>
        </div>
      </MobileFrame>
    )
  }

  return (
    <MobileFrame>
      <div className="h-full bg-gradient-to-br from-dark-bg via-phone-bg to-gray-800 p-4 overflow-y-auto">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-royal font-bold vibrant-gradient">
                Welcome to Class Royale
              </h1>
              <p className="text-gray-400 text-sm">Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-sm"
            >
              Logout
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Class Attendance
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <>
              {/* Demo Info */}
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 mb-4">
                <h2 className="text-lg font-bold text-white mb-3">Demo Status</h2>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <div className="w-2 h-2 bg-vibrant-green rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-white">Email Verified</span>
                    </div>
                    <p className="text-gray-400 text-xs">{userData.email}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <div className="w-2 h-2 bg-vibrant-green rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-white">Canvas Connected</span>
                    </div>
                    <p className="text-gray-400 text-xs">Authorization complete</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <div className="w-2 h-2 bg-vibrant-green rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-white">Schedule Uploaded</span>
                    </div>
                    <p className="text-gray-400 text-xs">.ics file processed</p>
                  </div>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <h2 className="text-lg font-bold text-white mb-3">Coming Soon</h2>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="text-xl mr-3">🏆</div>
                      <div>
                        <h3 className="font-medium text-white text-sm">Achievement System</h3>
                        <p className="text-gray-400 text-xs">Earn points and badges for completing assignments</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="text-xl mr-3">⚔️</div>
                      <div>
                        <h3 className="font-medium text-white text-sm">Class Battles</h3>
                        <p className="text-gray-400 text-xs">Compete with classmates in academic competitions</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="text-xl mr-3">📊</div>
                      <div>
                        <h3 className="font-medium text-white text-sm">Progress Tracking</h3>
                        <p className="text-gray-400 text-xs">Visualize your academic journey with analytics</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="text-xl mr-3">👑</div>
                      <div>
                        <h3 className="font-medium text-white text-sm">Leaderboards</h3>
                        <p className="text-gray-400 text-xs">See how you rank among your peers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700/30">
              <ClassAttendance />
            </div>
          )}
        </div>
        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-700/50 max-w-md mx-auto w-full">
          <div className="flex justify-around items-center py-1 w-full">
            <button 
              className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${activeTab === 'dashboard' ? 'text-vibrant-blue' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BiSolidDashboard className="text-2xl" />
              <span className="text-[10px]">Dashboard</span>
            </button>
            <button 
              className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${activeTab === 'streak' ? 'text-vibrant-blue' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('streak')}
            >
              <FcFlashOn className="text-2xl" />
              <span className="text-[10px]">Streak</span>
            </button>
            <button 
              className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${activeTab === 'elixir' ? 'text-vibrant-blue' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('elixir')}
            >
              <BsFillDropletFill className="text-2xl text-vibrant-blue" />
              <span className="text-[10px]">Elixir</span>
            </button>
            <button 
              className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${activeTab === 'team' ? 'text-vibrant-blue' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('team')}
            >
              <BsFillPeopleFill className="text-2xl" />
              <span className="text-[10px]">Team</span>
            </button>
            <button 
              className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${activeTab === 'shop' ? 'text-vibrant-blue' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('shop')}
            >
              <FaShopify className="text-2xl" />
              <span className="text-[10px]">Shop</span>
            </button>
            <button 
              className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${activeTab === 'leaderboard' ? 'text-vibrant-blue' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <MdLeaderboard className="text-2xl" />
              <span className="text-[10px]">Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  )
}

export default Dashboard
