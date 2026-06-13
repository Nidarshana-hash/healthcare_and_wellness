// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { getStorage } from "firebase/storage";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChpiU6xrxdt3odfuofvbDtCoGAuRkXJ7A",
  authDomain: "healthcare-app-78272.firebaseapp.com",
  projectId: "healthcare-app-78272",
  storageBucket: "healthcare-app-78272.firebasestorage.app",
  messagingSenderId: "671921231135",
  appId: "1:671921231135:web:8e9b12148f659372b78c2a",
  measurementId: "G-E8EDLYZZ3M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
setPersistence(auth, browserLocalPersistence);