// Firebase Configuration
// IMPORTANT: Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export default app;

// NOTE: For Email OTP authentication, you need to enable Email/Password provider
// in Firebase Console > Authentication > Sign-in method > Email/Password > Enable
// 
// Firebase does NOT support direct email OTP out of the box for web apps.
// We'll implement a custom OTP system using Firebase Cloud Functions.
// See the setup instructions below.
