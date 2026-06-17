import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "loginvirtualcourses-97b13.firebaseapp.com",
  projectId: "loginvirtualcourses-97b13",
  storageBucket: "loginvirtualcourses-97b13.firebasestorage.app",
  messagingSenderId: "811366351346",
  appId: "1:811366351346:web:6113a2b6226efa1a5c6b6b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export {auth,provider}