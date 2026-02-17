
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBx61X57YElIwr2eawtmZprChlG0PjgLJQ",
  authDomain: "wasil-d47d3.firebaseapp.com",
  projectId: "wasil-d47d3",
  storageBucket: "wasil-d47d3.firebasestorage.app",
  messagingSenderId: "489513639502",
  appId: "1:489513639502:web:2639d4957e318bbaed2d1f",
  measurementId: "G-LRP00JKMNX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
