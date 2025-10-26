// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDOKwyJ3gHkUDv8-67ptUjFPYIYMYftdYs",
  authDomain: "hackpsuui.firebaseapp.com",
  projectId: "hackpsuui",
  storageBucket: "hackpsuui.firebasestorage.app",
  messagingSenderId: "701369414303",
  appId: "1:701369414303:web:4500d5e9d0d7e0e82ba8aa",
  measurementId: "G-64HGV4KXDX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore, Auth, and Analytics
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
