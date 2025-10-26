# Firebase Integration Setup Guide

This guide will help you set up Firebase integration for your Class Royale project to manage class schedules and attendance tracking.

## Prerequisites

1. Firebase project set up at [Firebase Console](https://console.firebase.google.com/)
2. Firestore database enabled
3. Service account key downloaded from Firebase Console

## Setup Instructions

### 1. Firebase Configuration

The Firebase configuration is already set up in `src/firebase.js` with your provided credentials.

### 2. ICS Parser Setup

To parse ICS files and upload class schedules to Firebase:

1. **Install dependencies for the ICS parser:**
   ```bash
   cd hackpsu_UI/ics-parser
   npm install
   ```

2. **Create service account key:**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in the `ics-parser` directory

3. **Add your ICS file:**
   - Place your `schedule.ics` file in the `ics-parser` directory

4. **Run the parser:**
   ```bash
   npm run parse
   ```

### 3. Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to classSchedules collection
    match /classSchedules/{document} {
      allow read, write: if true; // Adjust based on your auth requirements
    }
  }
}
```

### 4. Data Structure

The ICS parser creates documents in the `classSchedules` collection with the following structure:

```javascript
{
  summary: "Class Name",
  location: "Room/Location",
  date: "Mon, 15 Jan 2024",
  start: "09:00 AM",
  end: "10:30 AM",
  startTime: Date, // JavaScript Date object
  endTime: Date,   // JavaScript Date object
  dayOfWeek: 1,    // 1-7 (Monday-Sunday)
  isRecurring: true,
  originalEventId: "unique-id",
  attended: false, // Added by UI component
  attendanceTime: null, // Added by UI component
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Features

### Class Attendance Component

The `ClassAttendance` component provides:

- **Date Selection**: View classes for any specific date
- **Real-time Updates**: Live sync with Firestore
- **Attendance Tracking**: Mark classes as attended/missed
- **Status Indicators**: Visual status for upcoming, current, and past classes
- **Daily Summary**: Statistics for the selected date

### Dashboard Integration

The dashboard now includes:
- Tab navigation between Dashboard and Class Attendance
- Seamless integration with existing UI design
- Mobile-responsive layout

## Usage

1. **Upload Schedule**: Run the ICS parser to populate your Firestore database
2. **View Classes**: Navigate to the "Class Attendance" tab in the dashboard
3. **Track Attendance**: Mark classes as attended when they occur
4. **Monitor Progress**: View daily summaries and attendance statistics

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**: 
   - Verify your service account key is correctly placed
   - Check Firestore database is enabled
   - Ensure security rules allow read/write access

2. **ICS Parsing Issues**:
   - Verify the ICS file format is valid
   - Check timezone settings (currently set to "America/New_York")
   - Ensure the file is named `schedule.ics` and placed in the correct directory

3. **UI Not Loading Classes**:
   - Check browser console for Firebase connection errors
   - Verify Firestore security rules
   - Ensure data was successfully uploaded to the database

### Development Tips

- Use Firebase Console to monitor data uploads
- Check browser developer tools for real-time updates
- Test with different dates to verify data structure
- Consider adding authentication for production use

## Next Steps

Consider implementing:
- User authentication and personal schedules
- Assignment tracking integration
- Gamification features (points, streaks, achievements)
- Push notifications for upcoming classes
- Analytics and progress visualization
