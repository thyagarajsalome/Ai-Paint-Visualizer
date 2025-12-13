import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEWG3DlL5SuAoeKDUC8un9Yq7wtQgBcYk",
  authDomain: "wallpaint-1b4e9.firebaseapp.com",
  projectId: "wallpaint-1b4e9",
  storageBucket: "wallpaint-1b4e9.firebasestorage.app",
  messagingSenderId: "656873300886",
  appId: "1:656873300886:web:22a3073f85cc05d326f3b7",
  measurementId: "G-VXF82LV21C",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
