# Class Royale - Login Page Demo

A gamified schooling experience app login page built with React, Tailwind CSS, and modern web technologies.

## Features

- 🎨 **Modern Design**: Dark theme with royal gold accents and smooth animations
- 📱 **Mobile-First**: Responsive design that works perfectly on all devices
- 🔐 **Mock Authentication**: Simulated Canvas OAuth2 and email validation
- 📁 **File Upload**: Mock .ics schedule file upload functionality
- 💾 **Persistence**: Demo data stored in localStorage
- ⚡ **Smooth UX**: Dopamine-friendly interactions with subtle animations

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## Demo Flow

1. **Enter Email**: Use any `.edu` email address (e.g., `student@university.edu`)
2. **Authorize Canvas**: Click to simulate Canvas OAuth2 authorization
3. **Upload Schedule**: Upload any `.ics` file to simulate schedule import
4. **Enter the Royale**: Complete the flow to access the dashboard

## Project Structure

```
src/
├── components/
│   ├── LoginPage.jsx      # Main login page component
│   ├── CanvasModal.jsx    # Canvas OAuth simulation modal
│   └── Dashboard.jsx      # Placeholder dashboard
├── App.jsx                # Main app component with routing
├── main.jsx              # React app entry point
└── index.css             # Global styles and Tailwind imports
```

## Technologies Used

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Custom Animations** - Smooth transitions and micro-interactions

## Design System

- **Colors**: Dark background (#0e0e10), royal gold accents, vibrant green highlights
- **Typography**: Cinzel font for royal branding, clean sans-serif for body text
- **Animations**: Fade-in effects, button glows, floating particles
- **Layout**: Mobile-first card design with backdrop blur effects

## Future Integrations

This demo is designed to easily integrate with:
- **Firebase Authentication** - Replace mock auth with real Firebase
- **Canvas API** - Real OAuth2 integration with Canvas LMS
- **File Processing** - Actual .ics file parsing and schedule import
- **Backend Services** - Connect to your preferred backend solution

## Development Notes

- All authentication is mocked for demo purposes
- Data persists in localStorage for session continuity
- Responsive design works on desktop and mobile
- Clean, modular code ready for production integration


