import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Silent anonymous sign-in for demo mode
let authReady = false;
const authPromise = signInAnonymously(auth)
  .then(() => { authReady = true; })
  .catch((err) => {
    console.warn('Anonymous auth failed — Firestore/Storage writes may not work:', err.message);
    authReady = true;
  });

export const waitForAuth = () => (authReady ? Promise.resolve() : authPromise);

export const useAuthReady = () => {
  const [ready, setReady] = useState(authReady);

  useEffect(() => {
    if (authReady) { setReady(true); return; }
    const unsubscribe = onAuthStateChanged(auth, () => setReady(true));
    return unsubscribe;
  }, []);

  return ready;
};

export const uploadFileToStorage = async (
  file: File,
  path: string
): Promise<string> => {
  await waitForAuth();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
};
