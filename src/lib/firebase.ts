// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuBu4XiyFzlvdWsFTfaB-Jbt-AIHqP0Os",
  authDomain: "lifesync-4d5da.firebaseapp.com",
  projectId: "lifesync-4d5da",
  storageBucket: "lifesync-4d5da.firebasestorage.app",
  messagingSenderId: "855268479053",
  appId: "1:855268479053:web:03bb38d3cf69ca387d0c04",
  measurementId: "G-ZK07PCTZ2Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider to work with any domain
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
