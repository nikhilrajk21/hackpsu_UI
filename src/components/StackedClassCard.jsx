import React, { useState, useEffect } from 'react';

const StackedClassCard = ({ classes, onClassClick, onRemoveClass }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);
  // local copy so component can remove items if parent doesn't manage them
  const [localClasses, setLocalClasses] = useState(classes || []);
  const [removingIds, setRemovingIds] = useState([]);

  if (!classes || classes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-gray-400 text-lg mb-2">No classes today!</p>
          <p className="text-gray-500 text-sm">Enjoy your free day, champion!</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString) => {
    let dt
    // Firestore Timestamp has toDate(), Luxon DateTime etc. Normalize to JS Date
    if (dateString && typeof dateString.toDate === 'function') {
      dt = dateString.toDate()
    } else if (dateString instanceof Date) {
      dt = dateString
    } else if (typeof dateString === 'string') {
      dt = new Date(dateString)
    } else {
      // unknown shape
      try { dt = new Date(dateString) } catch { dt = new Date() }
    }

    return dt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getClassStatus = (classData) => {
    const now = new Date();
    const normalize = (t) => {
      if (!t) return new Date(0)
      if (typeof t.toDate === 'function') return t.toDate()
      if (t instanceof Date) return t
      return new Date(t)
    }

    const startTime = normalize(classData.startTime)
    const endTime = normalize(classData.endTime)
    
    if (now < startTime) {
      return { status: 'upcoming', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'current', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' };
    } else {
      return { status: 'completed', color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' };
    }
  };

  // sync local classes when prop changes (allows local removal if parent doesn't handle it)
  useEffect(() => {
    setLocalClasses(classes || []);
  }, [classes]);

  // When local classes update, pick the most relevant expandedIndex (current or next upcoming)
  useEffect(() => {
    if (!localClasses || localClasses.length === 0) return
    const now = new Date()
    const normalize = (t) => (t && typeof t.toDate === 'function') ? t.toDate() : (t instanceof Date ? t : new Date(t))
    const idx = localClasses.findIndex(c => normalize(c.endTime) >= now)
    setExpandedIndex(idx === -1 ? 0 : idx)
    setShowMore(false)
  }, [localClasses])

  const handleDone = (classId) => {
    // If parent provided a handler, delegate removal to parent
    if (typeof onRemoveClass === 'function') {
      onRemoveClass(classId);
      return;
    }

    // Local removal with animation: mark removing, then filter out after duration
    setRemovingIds(prev => [...prev, classId]);
    setTimeout(() => {
      setLocalClasses(prev => prev.filter(c => c.id !== classId));
      setRemovingIds(prev => prev.filter(id => id !== classId));
      setExpandedIndex(0);
    }, 500); // match CSS transition duration
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Stack Container - show dropdown when expanded, otherwise show top card */}
      <div className="relative h-auto">
        {(showMore ? localClasses : [localClasses[expandedIndex]]).map((classData, index) => {
          const originalIndex = showMore ? index : expandedIndex;
          if (!classData) return null;
          const status = getClassStatus(classData);
          const isExpanded = originalIndex === expandedIndex;
          // compute offsets for stacked mode
          const offsetIndex = originalIndex - expandedIndex;
          const stackOffset = (showMore ? index : 0) * 8; // push subsequent cards down when expanded
          const scale = isExpanded ? 1 : Math.max(1 - Math.abs(offsetIndex) * 0.03, 0.88);
          const opacity = isExpanded ? 1 : Math.max(1 - Math.abs(offsetIndex) * 0.18, 0.5);
          const zIndex = localClasses.length - originalIndex;
          const isRemoving = removingIds.includes(classData.id);

          return (
            <div
              key={classData.id}
              className={`relative transition-all duration-500 cursor-pointer ${isRemoving ? 'translate-x-48 opacity-0' : ''} ${
                isExpanded ? 'hover:scale-105' : 'hover:scale-102'
              }`}
              style={{
                transform: showMore ? undefined : `translateY(${stackOffset}px) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
                marginTop: showMore ? (index === 0 ? '0' : '0.5rem') : undefined,
              }}
              onClick={() => {
                if (showMore) {
                  setExpandedIndex(originalIndex);
                  setShowMore(false);
                } else {
                  setShowMore(!showMore);
                }

                if (onClassClick) onClassClick(classData);
              }}
            >
              <div className={`rounded-2xl border-2 backdrop-blur-sm p-6 ${
                status.bgColor
              } ${status.borderColor} ${
                isExpanded ? 'shadow-2xl shadow-green-500/20' : 'shadow-lg'
              }`}>
                {/* Course Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${isExpanded ? 'text-white' : 'text-gray-300'} mb-1`}>
                      {classData.courseCode}
                    </h3>
                    <p className={`text-sm ${isExpanded ? 'text-gray-300' : 'text-gray-400'}`}>
                      {classData.courseType}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    status.status === 'upcoming' ? 'bg-cyan-500 text-white' :
                    status.status === 'current' ? 'bg-green-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {status.status === 'upcoming' ? 'Upcoming' :
                     status.status === 'current' ? 'Now' :
                     'Done'}
                  </div>
                </div>

                {/* Class Details */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="w-4 h-4 mr-2 text-gray-400">🕐</span>
                    <span className={isExpanded ? 'text-gray-300' : 'text-gray-400'}>
                      {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <span className="w-4 h-4 mr-2 text-gray-400">📍</span>
                    <span className={isExpanded ? 'text-gray-300' : 'text-gray-400'}>
                      {classData.location}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="flex items-center text-sm">
                      <span className="w-4 h-4 mr-2 text-gray-400">📅</span>
                      <span className="text-gray-300">
                        {classData.date}
                      </span>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-600/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {localClasses.length} classes today
                      </span>
                      <div className="flex space-x-2">
                        {status.status === 'current' && (
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                            Mark Present
                          </button>
                        )}
                        <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors">
                          Details
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDone(classData.id); }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stack Indicator */}
      {localClasses.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {localClasses.map((_, index) => (
            <button
              key={index}
              onClick={() => { setExpandedIndex(index); setShowMore(false); }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === expandedIndex 
                  ? 'bg-green-400 w-6' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StackedClassCard;
