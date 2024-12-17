import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";  // Import auth functions
import { getAnalytics } from "firebase/analytics";  // Optional: For analytics if needed

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBroq_RMszC9P3pANH2dCiNyfcWh3YjjtA",
  authDomain: "llm-circuit-last.firebaseapp.com",
  projectId: "llm-circuit-last",
  storageBucket: "llm-circuit-last.firebasestorage.app",
  messagingSenderId: "473733742258",
  appId: "1:473733742258:web:4557fb62b5ec7faec113ab",
  measurementId: "G-BBD6DNF411"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Initialize Firebase Auth
const analytics = getAnalytics(app);  // Optional: Firebase analytics

// Export auth for use in other parts of the app
export { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut };

// Import the functions you need from the SDKs you need

