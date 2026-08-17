import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId || undefined);
  } catch (e) {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
  }
})();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const sanitizeForFirestore = <T>(obj: T): T => {
  if (obj === undefined) return null as unknown as T;
  return JSON.parse(JSON.stringify(obj, (_key, value) => (value === undefined ? null : value)));
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isUnavailable = error instanceof Error && (error.message.includes('unavailable') || error.message.includes('offline'));
  if (isUnavailable) {
    console.warn(`Firestore is offline/unavailable during ${operationType} on ${path}. Operating in offline mode.`);
    return;
  }
  console.warn(`Firestore warning during ${operationType} on ${path}:`, error);
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc
};
export type { User };
