import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { base44, backendMode } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GraduationCap, Building2, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { requestNotificationPermission } from '../utils/browserNotify';

// Static imports for Firebase — avoids slow dynamic import() at runtime
let firebaseDb, firebaseAuth, firestoreDoc, firestoreGetDoc, firestoreSetDoc;
if (backendMode === 'firebase') {
  const fb = await import('@/api/firebase.js');
  const fs = await import('firebase/firestore');
  firebaseDb = fb.db;
  firebaseAuth = fb.auth;
  firestoreDoc = fs.doc;
  firestoreGetDoc = fs.getDoc;
  firestoreSetDoc = fs.setDoc;
}

async function getPostLoginRoute(email, roleKey) {
  if (roleKey === 'admin') return '/AdminDashboard';

  const entityProxy = backendMode === 'mock'
    ? (await import('@/api/mock/mockStore.js')).createEntityProxy
    : (name) => base44.entities[name];

  try {
    const profiles = await entityProxy('StudentProfile').filter({ created_by: email });
    if (profiles && profiles.length > 0) return '/StudentHome';
  } catch {}

  try {
    const orgs = await entityProxy('Organization').filter({ created_by: email });
    if (orgs && orgs.length > 0) return '/OrgDashboard';
  } catch {}

  if (roleKey === 'org') return '/OrgRegistration';
  return '/ProfileBuilder';
}

export default function MockLoginScreen({ initialView }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const roleParam = searchParams.get('role');

  const [view, setView] = useState(initialView || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState(roleParam || 'student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (initialView) setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (roleParam) setSelectedRole(roleParam);
  }, [roleParam]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setError('');
    setLoading(true);

    // Signal RedirectIfAuthenticated to wait while we compute the route
    sessionStorage.setItem('spark_post_auth_route', '__pending__');

    try {
      let route;
      if (backendMode === 'mock') {
        const { authenticateUser } = await import('@/api/mock/mockStore.js');
        const user = await authenticateUser(email.trim(), password.trim());
        requestNotificationPermission();
        const session = JSON.parse(localStorage.getItem('mock_session'));
        route = (returnTo && returnTo !== '/' && returnTo !== encodeURIComponent('/'))
          ? returnTo
          : await getPostLoginRoute(user.email, session?.roleKey);
      } else {
        // Firebase mode
        const result = await base44.auth.loginViaEmailPassword({
          email: email.trim(),
          password: password.trim(),
        });
        requestNotificationPermission();

        // Fetch user profile to determine role
        let roleKey = 'student';
        try {
          const uid = firebaseAuth.currentUser?.uid;
          if (uid) {
            const userDoc = await firestoreGetDoc(firestoreDoc(firebaseDb, 'users', uid));
            if (userDoc.exists()) {
              roleKey = userDoc.data().roleKey || 'student';
            }
          }
        } catch {}

        route = (returnTo && returnTo !== '/' && returnTo !== encodeURIComponent('/'))
          ? returnTo
          : await getPostLoginRoute(result.email, roleKey);
      }

      // Store final route and navigate — RedirectIfAuthenticated will pick it up
      sessionStorage.setItem('spark_post_auth_route', route);
      navigate(route, { replace: true });
    } catch (err) {
      sessionStorage.removeItem('spark_post_auth_route');
      const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password'
        : err.code === 'auth/user-not-found' ? 'No account found with this email'
        : err.code === 'auth/wrong-password' ? 'Invalid email or password'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later.'
        : err.message || 'Login failed';
      setError(msg);
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) return;
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);

    // Determine route BEFORE auth fires — prevents RedirectIfAuthenticated race
    const profileRoute = selectedRole === 'org' ? '/OrgRegistration' : '/ProfileBuilder';
    sessionStorage.setItem('spark_post_auth_route', profileRoute);

    try {
      if (backendMode === 'mock') {
        const { registerUser } = await import('@/api/mock/mockStore.js');
        await registerUser({
          email: email.trim(),
          password: password.trim(),
          full_name: fullName.trim(),
          roleKey: selectedRole,
        });
      } else {
        // Firebase: create account + store profile in Firestore
        await base44.auth.register({
          email: email.trim(),
          password: password.trim(),
          full_name: fullName.trim(),
        });

        // Fire-and-forget — writes to local cache instantly, syncs in background
        const uid = firebaseAuth.currentUser?.uid;
        if (uid) {
          firestoreSetDoc(firestoreDoc(firebaseDb, 'users', uid), {
            email: email.trim(),
            full_name: fullName.trim(),
            roleKey: selectedRole,
            role: selectedRole === 'admin' ? 'admin' : 'user',
            created_date: new Date().toISOString(),
          }).catch(err => console.error('User profile write:', err));
        }
      }

      if (returnTo) {
        sessionStorage.setItem('spark_returnTo', returnTo);
      }
      navigate(profileRoute, { replace: true });
    } catch (err) {
      sessionStorage.removeItem('spark_post_auth_route');
      const msg = err.code === 'auth/email-already-in-use' ? 'Email already registered'
        : err.code === 'auth/weak-password' ? 'Password must be at least 6 characters'
        : err.code === 'auth/invalid-email' ? 'Please enter a valid email address'
        : err.message || 'Registration failed';
      setError(msg);
      setLoading(false);
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') action();
  };

  // ── Register View ──
  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full mt-[-40px]">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
            <p className="text-gray-600 text-sm">Register to get started</p>
          </div>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Enter your name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => handleKeyDown(e, handleRegister)} className="pl-10" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRole('student')}
                    className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedRole === 'student' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <GraduationCap className={`w-5 h-5 ${selectedRole === 'student' ? 'text-red-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${selectedRole === 'student' ? 'text-red-700' : 'text-gray-600'}`}>Student</span>
                  </button>
                  <button
                    onClick={() => setSelectedRole('org')}
                    className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedRole === 'org' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 ${selectedRole === 'org' ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${selectedRole === 'org' ? 'text-orange-700' : 'text-gray-600'}`}>Organization</span>
                  </button>
                </div>
              </div>

              {/* Privacy Disclaimer */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                  I have read and agree to Spark's{' '}
                  <Link to="/terms" target="_blank" className="text-red-500 font-medium hover:underline">Terms of Service</Link> and{' '}
                  <Link to="/privacy" target="_blank" className="text-red-500 font-medium hover:underline">Privacy Policy</Link>,
                  including Spark's collection, use, and sharing of my personal data as described in it.
                  {selectedRole === 'student' && ' If I am under 18, I confirm that I have obtained consent from my parent or legal guardian to use the Platform where required.'}
                  {selectedRole === 'org' && ' As an organization representative, I confirm that I am authorized to register on behalf of my organization and that all information provided is accurate.'}
                </label>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <Button className="w-full bg-red-500 hover:bg-red-600 text-white" disabled={!fullName.trim() || !email.trim() || !password.trim() || !agreedToTerms || loading} onClick={handleRegister}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button onClick={() => { setView('login'); setError(''); }} className="text-red-500 font-medium hover:underline">Log in</button>
              </p>
            </div>
          </Card>

          <Link to="/" className="flex items-center justify-center gap-1.5 mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // ── Login View (default) ──
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full mt-[-40px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-gray-600 text-sm">Log in to your account</p>
        </div>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => handleKeyDown(e, handleLogin)} className="pl-10" />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button className="w-full bg-red-500 hover:bg-red-600 text-white" disabled={!email.trim() || !password.trim() || loading} onClick={handleLogin}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button onClick={() => { setView('register'); setError(''); }} className="text-red-500 font-medium hover:underline">Sign up</button>
            </p>
          </div>
        </Card>

        <Link to="/" className="flex items-center justify-center gap-1.5 mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Browse
        </Link>
      </div>
    </div>
  );
}
