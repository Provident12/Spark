import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';
import {
  Home, ClipboardList, Heart, User,
  LayoutDashboard, FileText, Settings
} from 'lucide-react';
import NotificationBell from './NotificationBell';


function NavLink({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Link>
  );
}

export default function Navbar({ currentPageName, user, userRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  const returnParam = encodeURIComponent(currentPath);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="shrink-0">
          <span className="text-3xl font-extrabold text-gray-900">Spark</span>
        </Link>

        {/* Right: Navigation */}
        <nav className="flex items-center gap-1">
          {/* Unauthenticated */}
          {!user && (
            <>
              <NavLink to="/" label="Browse" active={currentPageName === 'Landing'} />
              <NavLink to={`/signup?role=org&returnTo=${returnParam}`} label="List a Role" active={false} />
              <div className="ml-1 flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => navigate(`/login?returnTo=${returnParam}`)}
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => navigate(`/signup?returnTo=${returnParam}`)}
                >
                  Sign Up
                </Button>
              </div>
            </>
          )}

          {/* Student */}
          {user && userRole === 'student' && (
            <>
              <NavLink to={createPageUrl('StudentHome')} icon={Home} label="Home" active={currentPageName === 'StudentHome'} />
              <NavLink to={createPageUrl('Applications')} icon={ClipboardList} label="Applications" active={currentPageName === 'Applications'} />
              <NavLink to={createPageUrl('Saved')} icon={Heart} label="Saved" active={currentPageName === 'Saved'} />
              <NavLink to={createPageUrl('Profile')} icon={User} label="Profile" active={currentPageName === 'Profile'} />
              <NavLink to={createPageUrl('Settings')} icon={Settings} label="" active={currentPageName === 'Settings'} />
            </>
          )}

          {/* Organization */}
          {user && userRole === 'org' && (
            <>
              <NavLink to={createPageUrl('OrgDashboard')} icon={LayoutDashboard} label="Dashboard" active={currentPageName === 'OrgDashboard'} />
              <NavLink to={createPageUrl('PostOpportunity')} icon={FileText} label="Post" active={currentPageName === 'PostOpportunity'} />
              <NavLink to={createPageUrl('Settings')} icon={Settings} label="Settings" active={currentPageName === 'Settings'} />
            </>
          )}

          {/* Admin */}
          {user && userRole === 'admin' && (
            <>
              <NavLink to={createPageUrl('AdminDashboard')} icon={LayoutDashboard} label="Dashboard" active={currentPageName === 'AdminDashboard'} />
              <NavLink
                to={createPageUrl('AdminDashboard')}
                icon={FileText}
                label="Reviews"
                active={['ReviewOrganization', 'ReviewOpportunity'].includes(currentPageName)}
              />
              <NavLink to={createPageUrl('Settings')} icon={Settings} label="Settings" active={currentPageName === 'Settings'} />
            </>
          )}

          {/* Notification bell + Logout for authenticated users */}
          {user && (
            <div className="flex items-center gap-1 ml-2">
              <NotificationBell userEmail={user.email} userRole={userRole} />
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  import('@/api/base44Client').then(({ base44 }) => base44.auth.logout());
                }}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
