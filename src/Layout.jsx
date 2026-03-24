import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Read the actual roleKey from session (org, student, admin)
      // u.role only stores 'user' or 'admin', which doesn't distinguish org vs student
      try {
        const session = JSON.parse(localStorage.getItem('mock_session'));
        setUserRole(session?.roleKey || u?.role);
      } catch {
        setUserRole(u?.role);
      }
    }).catch(() => {
      setUser(null);
      setUserRole(null);
    });
  }, []);

  // Hide navbar on login/signup pages
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && (
        <Navbar currentPageName={currentPageName} user={user} userRole={userRole} />
      )}
      <main className="animate-fade-in">
        {children}
      </main>
    </div>
  );
}
