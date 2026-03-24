// In-memory CRUD engine + user state management for mock mode
// Entity data is shared via server (all browsers see the same data)
// Session/auth stays in localStorage (each browser has its own login)

const STORE_KEY = 'mock_store';
const NEXT_ID_KEY = 'mock_next_id';
const SESSION_KEY = 'mock_session';

// ── Persistent store with in-memory cache ────────────────────

let store = {};
let nextId = 1000;
let lastFetchTime = 0;
let fetchPromise = null;
const CACHE_TTL = 2000; // Only re-fetch from server every 2 seconds

async function loadStore() {
  const now = Date.now();
  // Return cached data if fresh enough
  if (now - lastFetchTime < CACHE_TTL && lastFetchTime > 0) return;

  // Deduplicate concurrent fetches — if one is already in-flight, reuse it
  if (fetchPromise) {
    await fetchPromise;
    return;
  }

  fetchPromise = _doLoadStore();
  try {
    await fetchPromise;
  } finally {
    fetchPromise = null;
  }
}

async function _doLoadStore() {
  try {
    const res = await fetch('/mock-api/data');
    if (res.ok) {
      const data = await res.json();
      store = data.store || {};
      nextId = data.nextId || 1000;
      lastFetchTime = Date.now();
      return;
    }
  } catch {
    // Server not available — fall back to localStorage
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) store = JSON.parse(raw);
  } catch {
    store = {};
  }
  try {
    const rawId = localStorage.getItem(NEXT_ID_KEY);
    if (rawId) nextId = parseInt(rawId, 10);
  } catch {
    nextId = 1000;
  }
  lastFetchTime = Date.now();
}

async function saveStore() {
  // After writing, update the cache timestamp so subsequent reads use in-memory data
  lastFetchTime = Date.now();
  try {
    const res = await fetch('/mock-api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store, nextId }),
    });
    if (res.ok) return;
  } catch {
    // Server not available — fall back to localStorage
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
  localStorage.setItem(NEXT_ID_KEY, String(nextId));
}

// ── Session (localStorage — per browser) ─────────────────────

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return { email: session.email, full_name: session.full_name, role: session.role };
}

export function getCurrentUserEmail() {
  const session = getSession();
  return session?.email || null;
}

export function getCurrentRole() {
  const session = getSession();
  return session?.roleKey || null;
}

export function getIsAuthenticated() {
  return getSession() !== null;
}

// ── Entity Store ────────────────────────────────────────────

export function initEntity(entityName, seedRecords = []) {
  // This is now a no-op for initial setup — data loads on demand from server
  // Only seed if the store doesn't have this entity yet (checked on first access)
  if (!store[entityName]) {
    store[entityName] = [];
  }
}

export function createEntityProxy(entityName) {
  return {
    async filter(query = {}) {
      await loadStore();
      const records = store[entityName] || [];
      return records.filter(record =>
        Object.entries(query).every(([key, value]) =>
          String(record[key]) === String(value)
        )
      );
    },

    async list() {
      await loadStore();
      return [...(store[entityName] || [])];
    },

    async create(data) {
      await loadStore();
      const newRecord = {
        ...data,
        id: String(nextId++),
        created_date: new Date().toISOString(),
        created_by: data.created_by || getCurrentUserEmail(),
      };
      store[entityName] = store[entityName] || [];
      store[entityName].push(newRecord);
      await saveStore();
      return { ...newRecord };
    },

    async update(id, data) {
      await loadStore();
      const records = store[entityName] || [];
      const index = records.findIndex(r => String(r.id) === String(id));
      if (index === -1) throw new Error(`Record ${id} not found in ${entityName}`);
      records[index] = { ...records[index], ...data };
      await saveStore();
      return { ...records[index] };
    },

    async delete(id) {
      await loadStore();
      const records = store[entityName] || [];
      const index = records.findIndex(r => String(r.id) === String(id));
      if (index === -1) throw new Error(`Record ${id} not found in ${entityName}`);
      records.splice(index, 1);
      await saveStore();
      return { success: true };
    },

    async get(id) {
      await loadStore();
      const records = store[entityName] || [];
      const record = records.find(r => String(r.id) === String(id));
      if (!record) throw new Error(`Record ${id} not found in ${entityName}`);
      return { ...record };
    },
  };
}

// ── User Accounts (persisted in shared store) ──────────────

export async function registerUser({ email, password, full_name, roleKey }) {
  await loadStore();
  if (!store._user_accounts) store._user_accounts = [];

  const existing = store._user_accounts.find(a => a.email === email);
  if (existing) throw new Error('Email already registered');

  const role = roleKey === 'admin' ? 'admin' : 'user';
  store._user_accounts.push({
    email,
    password,
    full_name,
    roleKey,
    role,
    created_date: new Date().toISOString(),
  });
  await saveStore();

  // Auto-login after registration
  localStorage.setItem(SESSION_KEY, JSON.stringify({ roleKey, email, full_name, role }));
}

// Master admin account — always available, survives data resets
const MASTER_ADMIN = { email: 'admin@spark.com', password: 'admin', full_name: 'Admin', roleKey: 'admin', role: 'admin' };

export async function authenticateUser(email, password) {
  // Check master admin first
  if (email === MASTER_ADMIN.email && password === MASTER_ADMIN.password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      roleKey: MASTER_ADMIN.roleKey,
      email: MASTER_ADMIN.email,
      full_name: MASTER_ADMIN.full_name,
      role: MASTER_ADMIN.role,
    }));
    return { email: MASTER_ADMIN.email, full_name: MASTER_ADMIN.full_name, role: MASTER_ADMIN.role };
  }

  await loadStore();
  if (!store._user_accounts) store._user_accounts = [];

  const account = store._user_accounts.find(
    a => a.email === email && a.password === password
  );
  if (!account) throw new Error('Invalid email or password');

  // Save session
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    roleKey: account.roleKey,
    email: account.email,
    full_name: account.full_name,
    role: account.role,
  }));

  return { email: account.email, full_name: account.full_name, role: account.role };
}

// ── Utility to clear all data ───────────────────────────────

export async function clearAllData() {
  store = {};
  nextId = 1000;
  lastFetchTime = 0;
  // Clear server
  try {
    await fetch('/mock-api/data', { method: 'DELETE' });
  } catch {
    // Server not available
  }
  // Clear localStorage too
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(NEXT_ID_KEY);
  localStorage.removeItem(SESSION_KEY);
}
