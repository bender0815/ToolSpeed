import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears to be offline.');
    }
    return false;
  }
}

// Error handling helper required by Firebase integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Wrappers
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
};

export const signOutUser = () => firebaseSignOut(auth);

export type { User };

// Firestore Helper Functions for User Tools, Lathes, and Saved Jobs
export async function syncUserToolsToFirestore(userId: string, tools: any[]) {
  try {
    for (const tool of tools) {
      const toolRef = doc(db, 'users', userId, 'tools', tool.id);
      await setDoc(toolRef, { ...tool, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/tools`);
  }
}

export async function fetchUserToolsFromFirestore(userId: string): Promise<any[]> {
  try {
    const colRef = collection(db, 'users', userId, 'tools');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((docSnap) => docSnap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/tools`);
  }
}

export async function deleteUserToolFromFirestore(userId: string, toolId: string) {
  try {
    const toolRef = doc(db, 'users', userId, 'tools', toolId);
    await deleteDoc(toolRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/tools/${toolId}`);
  }
}

export async function syncUserLathesToFirestore(userId: string, lathes: any[]) {
  try {
    for (const lathe of lathes) {
      const latheRef = doc(db, 'users', userId, 'lathes', lathe.id);
      await setDoc(latheRef, { ...lathe, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/lathes`);
  }
}

export async function fetchUserLathesFromFirestore(userId: string): Promise<any[]> {
  try {
    const colRef = collection(db, 'users', userId, 'lathes');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((docSnap) => docSnap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/lathes`);
  }
}

export async function syncUserJobsToFirestore(userId: string, jobs: any[]) {
  try {
    for (const job of jobs) {
      const jobRef = doc(db, 'users', userId, 'jobs', job.id);
      await setDoc(jobRef, { ...job, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/jobs`);
  }
}

export async function fetchUserJobsFromFirestore(userId: string): Promise<any[]> {
  try {
    const colRef = collection(db, 'users', userId, 'jobs');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((docSnap) => docSnap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/jobs`);
  }
}

export async function deleteUserJobFromFirestore(userId: string, jobId: string) {
  try {
    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/jobs/${jobId}`);
  }
}

export async function syncUserMaterialsToFirestore(userId: string, materials: any[]) {
  try {
    for (const mat of materials) {
      const matRef = doc(db, 'users', userId, 'custom_materials', mat.id);
      await setDoc(matRef, { ...mat, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/custom_materials`);
  }
}

export async function fetchUserMaterialsFromFirestore(userId: string): Promise<any[]> {
  try {
    const colRef = collection(db, 'users', userId, 'custom_materials');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((docSnap) => docSnap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/custom_materials`);
  }
}

export async function deleteUserMaterialFromFirestore(userId: string, materialId: string) {
  try {
    const matRef = doc(db, 'users', userId, 'custom_materials', materialId);
    await deleteDoc(matRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/custom_materials/${materialId}`);
  }
}

