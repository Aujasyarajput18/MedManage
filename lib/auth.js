// Bug fix: import was incorrectly placed mid-file — moved to top
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { clearDemoData } from './demo';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(result.user);
  return result.user;
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email, password, name) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await ensureUserDoc(result.user, name);
  return result.user;
}

export async function signOut() {
  clearDemoData();
  await firebaseSignOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

async function ensureUserDoc(user, displayName = null) {
  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:      user.uid,
      name:     displayName || user.displayName || 'User',
      email:    user.email,
      photoURL: user.photoURL || null,
      fcmToken: null,
      createdAt: serverTimestamp(),
      streak:   0,
      points:   0,
      settings: {
        notifications:  true,
        theme:          'dark',
        language:       'en',
        snoozeMinutes:  10,
        autoLogoutMins: 30,
      },
    });
  }
}
