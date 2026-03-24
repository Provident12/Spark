// Assembles the mock base44 client with the same API surface as the real SDK

import {
  initEntity,
  createEntityProxy,
  getCurrentUser,
  getIsAuthenticated,
  logout as mockLogout,
  registerUser,
  authenticateUser,
} from './mockStore.js';

import {
  studentProfiles,
  organizations,
  opportunities,
  applications,
  savedOpportunities,
} from './seedData.js';

export function createMockClient() {
  // Initialize entity stores with seed data
  initEntity('StudentProfile', studentProfiles);
  initEntity('Organization', organizations);
  initEntity('Opportunity', opportunities);
  initEntity('Application', applications);
  initEntity('SavedOpportunity', savedOpportunities);
  initEntity('Notification', []);
  initEntity('InterviewSlot', []);
  initEntity('Message', []);
  initEntity('Report', []);

  return {
    auth: {
      async me() {
        if (!getIsAuthenticated()) {
          const error = new Error('Not authenticated');
          error.status = 401;
          throw error;
        }
        return { ...getCurrentUser() };
      },

      async isAuthenticated() {
        return getIsAuthenticated();
      },

      logout(redirectUrl) {
        mockLogout();
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = '/';
        }
      },

      redirectToLogin(returnUrl) {
        // In mock mode, navigate to landing where MockLoginScreen will render
        window.location.href = '/';
      },

      async register({ email, password, full_name }) {
        await registerUser({ email, password, full_name, roleKey: 'student' });
        return { email, full_name, role: 'user' };
      },

      async loginViaEmailPassword({ email, password }) {
        return await authenticateUser(email, password);
      },
    },

    // NavigationTracker uses base44.appLogs (top-level, not under auth)
    appLogs: {
      async logUserInApp(pageName) {
        // No-op in mock mode
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

    integrations: {
      Core: {
        async UploadFile({ file }) {
          // Convert file to base64 data URL so it persists across reloads and role switches
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          return { file_url: dataUrl };
        },
      },
    },
  };
}
