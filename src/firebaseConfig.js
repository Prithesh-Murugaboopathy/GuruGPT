// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
