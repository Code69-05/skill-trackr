import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBkHljy155uUbAlEvpmU-RCw2mNaAyZo8k",
  authDomain: "skill-trackr.firebaseapp.com",
  projectId: "skill-trackr",
  storageBucket: "skill-trackr.firebasestorage.app",
  messagingSenderId: "134750731033",
  appId: "1:134750731033:web:1be865c2c083192bb32388"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);


