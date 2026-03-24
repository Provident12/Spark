import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createMockClient } from './mock/mockClient.js';

const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

let base44Instance;
if (isMockMode) {
  base44Instance = createMockClient();
} else {
  const { appId, token, functionsVersion, appBaseUrl } = appParams;
  base44Instance = createClient({
    appId,
    token,
    functionsVersion,
    serverUrl: '',
    requiresAuth: false,
    appBaseUrl
  });
}

export const base44 = base44Instance;
