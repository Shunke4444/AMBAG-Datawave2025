// get-token.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyCWDZiFwURvOecnl5UgzwuBEHLo4DBtEY4",
  authDomain: "ambag-auth.firebaseapp.com",
};

const email = process.env.FIREBASE_EMAIL;
const password = process.env.FIREBASE_PASSWORD;

if (!email || !password) {
  console.error("❌ FIREBASE_EMAIL or FIREBASE_PASSWORD environment variable not set.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, email, password)
  .then(async (userCred) => {
    const token = await userCred.user.getIdToken();
    console.log("✅ Firebase ID Token:");
    console.log(token);
  })
  .catch((err) => {
    console.error("❌ Error logging in:", err.message);
  });