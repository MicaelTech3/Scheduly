import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAZwkQxRHk3Y5f4ljKYXjdK2TfvOFN0ZOs",
  authDomain: "scheduly-studio.firebaseapp.com",
  projectId: "scheduly-studio",
  storageBucket: "scheduly-studio.firebasestorage.app",
  messagingSenderId: "203150814267",
  appId: "1:203150814267:web:972684ba56d5e43db6401e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// E-mail autorizado como Dev master
export const DEV_EMAIL = "micaelbardimtech@gmail.com"; // TROQUE pelo seu e-mail
