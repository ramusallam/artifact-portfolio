import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useState, useEffect } from 'react';

// Hardcoded for demo — Firebase config is public (not a secret)
const firebaseConfig = {
  apiKey: 'AIzaSyCcm85cc4eK2TWemAHJWlAaFbqDbZ971uM',
  authDomain: 'gen-lang-client-0796756578.firebaseapp.com',
  projectId: 'gen-lang-client-0796756578',
  storageBucket: 'gen-lang-client-0796756578.firebasestorage.app',
  messagingSenderId: '576655504377',
  appId: '1:576655504377:web:1b93c32144428bcce1c328',
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
    console.warn('Anonymous auth failed:', err.message);
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
