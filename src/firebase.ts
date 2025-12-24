import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // Use your custom domain instead of the default firebaseapp.com URL
  // This ensures your app and the auth iframe use the same domain, fixing redirect issues
  authDomain: "wallpaint.in",
  projectId: "wallpaint-1b4e9",
  storageBucket: "wallpaint-1b4e9.firebasestorage.app",
  messagingSenderId: "656873300886",
  appId: "1:656873300886:web:22a3073f85cc05d326f3b7",
  measurementId: "G-VXF82LV21C",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
