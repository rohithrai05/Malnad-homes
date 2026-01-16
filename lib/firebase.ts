
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBf_BFY8vbf_j9H4ydtXUKzaPRqURFbOyg",
  authDomain: "malnad-homes.firebaseapp.com",
  projectId: "malnad-homes",
  storageBucket: "malnad-homes.firebasestorage.app",
  messagingSenderId: "99615498958",
  appId: "1:99615498958:web:3c0e86f8c9e32950e0a69f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;
