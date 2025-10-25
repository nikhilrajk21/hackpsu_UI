import React from 'react'

const MobileFrame = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-bg to-gray-800 flex items-center justify-center p-8">
      {/* iPhone 16 Frame */}
      <div className="phone-frame p-2">
        <div className="phone-screen bg-phone-bg w-[375px] h-[812px] relative">
          {/* Dynamic Island */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full z-10"></div>
          
          {/* Status Bar */}
          <div className="absolute top-12 left-6 right-6 flex justify-between items-center text-white text-sm font-semibold z-10">
            <span className="text-base">9:41</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
              <div className="w-6 h-3 border border-white rounded-sm relative">
                <div className="w-4 h-2 bg-white rounded-sm absolute top-0.5 left-0.5"></div>
              </div>
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
          
          {/* App Content */}
          <div className="h-full pt-16 pb-4 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileFrame


