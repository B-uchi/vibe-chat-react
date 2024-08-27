// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'vibe-chat-9a724.firebaseapp.com',
  projectId: 'vibe-chat-9a724',
  storageBucket: 'vibe-chat-9a724.appspot.com',
  messagingSenderId: '1065916851031',
  appId: '1:1065916851031:web:b23b40703109d762479412',
  measurementId: 'G-7BZED2M8TB',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

