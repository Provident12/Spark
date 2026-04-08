import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createMockClient } from './mock/mockClient.js';
import { createFirebaseClient } from './firebaseClient.js';

const mode = import.meta.env.VITE_MOCK_MODE === 'true'
  ? 'mock'
  : import.meta.env.VITE_BACKEND === 'base44'
    ? 'base44'
    : 'firebase'; // Default to firebase

let base44Instance;
if (mode === 'mock') {
  base44Instance = createMockClient();
} else if (mode === 'base44') {
  const { appId, token, functionsVersion, appBaseUrl } = appParams;
  base44Instance = createClient({
    appId,
    token,
    functionsVersion,
    serverUrl: '',
    requiresAuth: false,
    appBaseUrl
  });
} else {
  base44Instance = createFirebaseClient();
}

export const base44 = base44Instance;
export const backendMode = mode;
