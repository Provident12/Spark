// Firebase configuration and initialization
// Firebase configuration and initialization
// Free (Spark) plan: Auth + Firestore only
// Blaze plan: add getStorage import + export when upgrading

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDTZi-J_yMLaKCAFdmMvtQz3_L5Yv2xQEg",
  authDomain: "spark-ef09d.firebaseapp.com",
  projectId: "spark-ef09d",
  storageBucket: "spark-ef09d.firebasestorage.app",
  messagingSenderId: "863725378731",
  appId: "1:863725378731:web:c2d53008751a631ebdabee"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable offline persistence — caches Firestore data in IndexedDB for faster reads
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const storage = getStorage(app);

export default app;
