import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const ClassAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Query classes for the selected date
    const q = query(
      collection(db, 'classSchedules'),
      orderBy('startTime', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const classesData = [];
      querySnapshot.forEach((doc) => {
        const classData = doc.data();
        const classDate = new Date(classData.startTime).toISOString().split('T')[0];
        
        if (classDate === selectedDate) {
          classesData.push({
            id: doc.id,
            ...classData,
            attended: classData.attended || false,
            attendanceTime: classData.attendanceTime || null
          });
        }
      });
      setClasses(classesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const markAttendance = async (classId, attended) => {
    try {
      const classRef = doc(db, 'classSchedules', classId);
      await updateDoc(classRef, {
        attended: attended,
        attendanceTime: attended ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const getAttendanceStatus = (classData) => {
    const now = new Date();
    const startTime = new Date(classData.startTime);
    const endTime = new Date(classData.endTime);
    
    if (now < startTime) {
      return { status: 'upcoming', color: 'text-blue-500', bgColor: 'bg-blue-100' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'current', color: 'text-green-500', bgColor: 'bg-green-100' };
    } else {
      return { status: 'past', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">Class Attendance</h1>
        
        {/* Date Selector */}
        <div className="mb-4">
          <label htmlFor="date-select" className="block text-sm font-medium text-gray-300 mb-2">
            Select Date:
          </label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">No classes scheduled for this date</p>
          </div>
        ) : (
          classes.map((classData) => {
            const attendanceStatus = getAttendanceStatus(classData);
            
            return (
              <div
                key={classData.id}
                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                  classData.attended 
                    ? 'bg-green-900 border-green-500' 
                    : attendanceStatus.bgColor + ' border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {classData.summary}
                    </h3>
                    <div className="space-y-1 text-gray-300">
                      <p className="flex items-center">
                        <span className="w-4 h-4 mr-2">📍</span>
                        {classData.location}
                      </p>
                      <p className="flex items-center">
                        <span className="w-4 h-4 mr-2">🕐</span>
                        {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                      </p>
                      <p className="flex items-center">
                        <span className="w-4 h-4 mr-2">📅</span>
                        {classData.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      attendanceStatus.status === 'upcoming' ? 'bg-blue-500 text-white' :
                      attendanceStatus.status === 'current' ? 'bg-green-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {attendanceStatus.status === 'upcoming' ? 'Upcoming' :
                       attendanceStatus.status === 'current' ? 'In Progress' :
                       'Completed'}
                    </span>
                    
                    {/* Attendance Button */}
                    {attendanceStatus.status !== 'upcoming' && (
                      <button
                        onClick={() => markAttendance(classData.id, !classData.attended)}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          classData.attended
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {classData.attended ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    )}
                    
                    {/* Attendance Time */}
                    {classData.attended && classData.attendanceTime && (
                      <p className="text-xs text-gray-400">
                        Attended at: {formatTime(classData.attendanceTime.toDate())}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      {classes.length > 0 && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Daily Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{classes.length}</p>
              <p className="text-gray-400">Total Classes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {classes.filter(c => c.attended).length}
              </p>
              <p className="text-gray-400">Attended</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {classes.filter(c => !c.attended).length}
              </p>
              <p className="text-gray-400">Missed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassAttendance;
