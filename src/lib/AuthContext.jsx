import React, { createContext, useState, useContext, useEffect } from 'react';
import { backendMode } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { auth as firebaseAuth } from '@/api/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/api/firebase.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    if (backendMode === 'firebase') {
      initFirebase();
    } else {
      checkAppState();
    }
  }, []);

  // ── Firebase auth listener ──────────────────────────────────
  const initFirebase = () => {
    setAppPublicSettings({ id: 'firebase-app', public_settings: {} });
    setIsLoadingPublicSettings(false);

    onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        // Set user instantly from Firebase Auth — zero network wait
        setUser({
          email: firebaseUser.email,
          full_name: firebaseUser.displayName || '',
          role: 'user',
          uid: firebaseUser.uid,
        });
        setIsAuthenticated(true);
        // Enrich with Firestore role in background (non-blocking)
        getDoc(doc(db, 'users', firebaseUser.uid)).then(snap => {
          if (snap.exists()) {
            const profile = snap.data();
            setUser(prev => ({ ...prev, ...profile, uid: firebaseUser.uid }));
          }
        }).catch(() => {});
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });
  };

  // ── Mock / Base44 auth flow ─────────────────────────────────
  const checkAppState = async () => {
    if (backendMode === 'mock') {
      setAppPublicSettings({ id: 'mock-app', public_settings: {} });
      setIsLoadingPublicSettings(false);
      await checkUserAuth();
      return;
    }

    // Base44 flow
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      const { createAxiosClient } = await import('@base44/sdk/dist/utils/axios-client');
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: { 'X-App-Id': appParams.appId },
        token: appParams.token,
        interceptResponses: true
      });

      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);

        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);

        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          setAuthError({
            type: reason === 'auth_required' ? 'auth_required'
              : reason === 'user_not_registered' ? 'user_not_registered'
              : reason,
            message: reason === 'auth_required' ? 'Authentication required'
              : reason === 'user_not_registered' ? 'User not registered for this app'
              : appError.message
          });
        } else {
          setAuthError({ type: 'unknown', message: appError.message || 'Failed to load app' });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({ type: 'unknown', message: error.message || 'An unexpected error occurred' });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);

      if (backendMode === 'mock') return;

      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    import('firebase/auth').then(({ signOut }) => {
      signOut(firebaseAuth).then(() => {
        if (shouldRedirect) window.location.href = '/';
      });
    });
  };

  const navigateToLogin = () => {
    window.location.href = `/login?returnTo=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
