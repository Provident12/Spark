// Firebase client — same API surface as base44 SDK / mock client
// Swaps in Firebase Auth, Firestore, and Storage under the hood

import { auth, db, storage } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocsFromCache,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ── Auth ────────────────────────────────────────────────────────

// Cache user profile from Firestore so we don't re-fetch every call
let cachedUserProfile = null;

async function getUserProfile(uid) {
  if (cachedUserProfile && cachedUserProfile.uid === uid) return cachedUserProfile;
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    cachedUserProfile = { uid, ...snap.data() };
    return cachedUserProfile;
  }
  return null;
}

function clearProfileCache() {
  cachedUserProfile = null;
}

const authMethods = {
  async me() {
    const user = auth.currentUser;
    if (!user) {
      const error = new Error('Not authenticated');
      error.status = 401;
      throw error;
    }
    const profile = await getUserProfile(user.uid);
    return {
      email: user.email,
      full_name: profile?.full_name || user.displayName || '',
      role: profile?.role || 'user',
      roleKey: profile?.roleKey || 'student',
      uid: user.uid,
    };
  },

  async isAuthenticated() {
    return !!auth.currentUser;
  },

  logout(redirectUrl) {
    clearProfileCache();
    signOut(auth).then(() => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = '/';
      }
    });
  },

  redirectToLogin(returnUrl) {
    window.location.href = `/login${returnUrl ? '?returnTo=' + encodeURIComponent(returnUrl) : ''}`;
  },

  async register({ email, password, full_name }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Fire-and-forget — don't block on display name update
    updateProfile(cred.user, { displayName: full_name }).catch(() => {});
    return { email, full_name, role: 'user' };
  },

  async loginViaEmailPassword({ email, password }) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(cred.user.uid);
    return {
      email: cred.user.email,
      full_name: profile?.full_name || cred.user.displayName || '',
      role: profile?.role || 'user',
    };
  },
};

// ── Firestore Entity Proxy ──────────────────────────────────────
// With persistence enabled, writes go to local IndexedDB first.
// We fire-and-forget writes (don't await server confirmation) so the UI stays fast.
// Reads try cache first, then fall back to server.

function createEntityProxy(entityName) {
  const col = () => collection(db, entityName);

  return {
    async filter(queryObj = {}) {
      // Filtering by id means a direct document lookup — far faster than a collection query
      if (queryObj.id) {
        try {
          const snap = await getDoc(doc(db, entityName, queryObj.id));
          if (!snap.exists()) return [];
          return [{ id: snap.id, ...snap.data() }];
        } catch { return []; }
      }
      const constraints = Object.entries(queryObj).map(
        ([key, value]) => where(key, '==', value)
      );
      const q = query(col(), ...constraints);
      // Try cache first for speed, fall back to server
      try {
        const cached = await getDocsFromCache(q);
        if (!cached.empty) return cached.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {}
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async list() {
      try {
        const cached = await getDocsFromCache(query(col()));
        if (!cached.empty) return cached.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {}
      const snap = await getDocs(col());
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async create(data) {
      const currentUser = auth.currentUser;
      const record = {
        ...data,
        created_date: new Date().toISOString(),
        created_by: data.created_by || currentUser?.email || null,
      };
      // Pre-generate ID so we can use setDoc (fire-and-forget)
      const docRef = doc(col());
      // Don't await — writes to local cache instantly, syncs to server in background
      setDoc(docRef, record).catch(err => console.error(`Firestore create ${entityName}:`, err));
      return { id: docRef.id, ...record };
    },

    async update(id, data) {
      const docRef = doc(db, entityName, id);
      // Fire-and-forget — local cache updates instantly
      updateDoc(docRef, data).catch(err => console.error(`Firestore update ${entityName}:`, err));
      return { id, ...data };
    },

    async delete(id) {
      deleteDoc(doc(db, entityName, id)).catch(err => console.error(`Firestore delete ${entityName}:`, err));
      return { success: true };
    },

    async get(id) {
      const snap = await getDoc(doc(db, entityName, id));
      if (!snap.exists()) throw new Error(`Record ${id} not found in ${entityName}`);
      return { id: snap.id, ...snap.data() };
    },
  };
}

// ── File Upload (Firebase Storage) ──────────────────────────────

const integrations = {
  Core: {
    async UploadFile({ file }) {
      const uid = auth.currentUser?.uid || 'anonymous';
      const path = `uploads/${uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { file_url: url };
    },
  },
};

// ── Assemble client ─────────────────────────────────────────────

export function createFirebaseClient() {
  return {
    auth: authMethods,
    appLogs: {
      async logUserInApp(pageName) {
        // No-op — add Firebase Analytics later if needed
      },
    },
    entities: {
      StudentProfile: createEntityProxy('StudentProfile'),
      Organization: createEntityProxy('Organization'),
      Opportunity: createEntityProxy('Opportunity'),
      Application: createEntityProxy('Application'),
      SavedOpportunity: createEntityProxy('SavedOpportunity'),
      Notification: createEntityProxy('Notification'),
      InterviewSlot: createEntityProxy('InterviewSlot'),
      Message: createEntityProxy('Message'),
      Report: createEntityProxy('Report'),
    },
    integrations,
  };
}
