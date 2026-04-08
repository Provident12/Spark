import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import MockLoginScreen from '@/components/MockLoginScreen';
import DevToolbar from '@/components/DevToolbar';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Pages that can be viewed without authentication
const PUBLIC_PAGES = ['Landing', 'Search', 'OpportunityDetail'];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
};

const RedirectIfAuthenticated = ({ children }) => {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Check for post-auth route (set by registration/login before Firebase auth fires)
    const postAuthRoute = sessionStorage.getItem('spark_post_auth_route');
    if (postAuthRoute === '__pending__') {
      // Login handler is still computing the route — wait
      return (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      );
    }
    if (postAuthRoute) {
      sessionStorage.removeItem('spark_post_auth_route');
      return <Navigate to={postAuthRoute} replace />;
    }
    const params = new URLSearchParams(location.search);
    const returnTo = params.get('returnTo');
    return <Navigate to={returnTo || "/"} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show spinner only while loading public settings (brief initial load)
  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle non-auth errors
  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      {/* Login / Signup routes — redirect away if already logged in */}
      <Route path="/login" element={<RedirectIfAuthenticated><MockLoginScreen initialView="login" /></RedirectIfAuthenticated>} />
      <Route path="/signup" element={<RedirectIfAuthenticated><MockLoginScreen initialView="register" /></RedirectIfAuthenticated>} />
      <Route path="/terms" element={<LayoutWrapper currentPageName="TermsOfService"><TermsOfService /></LayoutWrapper>} />
      <Route path="/privacy" element={<LayoutWrapper currentPageName="PrivacyPolicy"><PrivacyPolicy /></LayoutWrapper>} />

      {/* Main page route */}
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />

      {/* All other page routes */}
      {Object.entries(Pages).map(([path, Page]) => {
        const isPublic = PUBLIC_PAGES.includes(path);
        const element = (
          <LayoutWrapper currentPageName={path}>
            <Page />
          </LayoutWrapper>
        );

        return (
          <Route
            key={path}
            path={`/${path}`}
            element={isPublic ? element : <ProtectedRoute>{element}</ProtectedRoute>}
          />
        );
      })}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AppRoutes />
        </Router>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
        {import.meta.env.VITE_MOCK_MODE === 'true' && <DevToolbar />}
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
