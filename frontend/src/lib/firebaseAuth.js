import { signInWithEmailAndPassword } from "firebase/auth";
export async function loginWithFirebase(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCred.user.getIdToken();
    return { token, user: userCred.user };
  } catch (err) {
    throw new Error(err.message);
  }
}
// firebaseAuth.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWDZiFwURvOecnl5UgzwuBEHLo4DBtEY4",
  authDomain: "ambag-auth.firebaseapp.com",
  projectId: "ambag-auth",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function signupWithFirebase(email, password) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCred.user.getIdToken();
    return { token, user: userCred.user };
  } catch (err) {
    throw new Error(err.message);
  }
}

export { auth };
