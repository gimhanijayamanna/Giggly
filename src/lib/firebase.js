import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "giggly-350a3.firebaseapp.com",
    projectId: "giggly-350a3",
    storageBucket: "giggly-350a3.firebasestorage.app",
    messagingSenderId: "212656212376",
    appId: "1:212656212376:web:27dc4f86dbc614485143ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();