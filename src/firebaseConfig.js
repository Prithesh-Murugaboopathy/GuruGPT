// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFzK8Zrk7iETKaO7cMR4YEHo_BQiG1LTA",
  authDomain: "guru-gpt-6a709.firebaseapp.com",
  projectId: "guru-gpt-6a709",
  storageBucket: "guru-gpt-6a709.appspot.com",
  messagingSenderId: "9422377333",
  appId: "1:9422377333:web:d17f53449370c41d3e833c",
  measurementId: "G-QVCEDYYQFR",
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export the auth and db objects
export { auth, db };
