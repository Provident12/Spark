import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (user) {
      try {
        const session = JSON.parse(localStorage.getItem('mock_session'));
        setUserRole(session?.roleKey || user?.role);
      } catch {
        setUserRole(user?.role);
      }
    } else {
      setUserRole(null);
    }
  }, [user]);

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
