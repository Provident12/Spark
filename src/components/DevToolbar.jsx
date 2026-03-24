import React, { useState } from 'react';
import { getCurrentRole, getSession, clearAllData, logout } from '@/api/mock/mockStore';

export default function DevToolbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const session = getSession();
  const currentRoleKey = getCurrentRole();

  const roleLabels = { student: 'Student', org: 'Organization', admin: 'Admin' };
  const roleColors = { student: '#ef4444', org: '#f97316', admin: '#6366f1' };
  const roleIcons = { student: '\uD83C\uDF93', org: '\uD83C\uDFE2', admin: '\uD83D\uDEE1\uFE0F' };

  const label = roleLabels[currentRoleKey] || 'Unknown';
  const color = roleColors[currentRoleKey] || '#6b7280';
  const icon = roleIcons[currentRoleKey] || '\uD83D\uDC64';

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 9999,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {isExpanded && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          padding: '12px',
          marginBottom: '8px',
          minWidth: '200px',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
            padding: '0 4px',
          }}>
            Dev Mode
          </div>

          {session && (
            <div style={{
              padding: '8px',
              background: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '8px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                {session.full_name}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {session.email}
              </div>
            </div>
          )}

          <button
            onClick={async () => { await clearAllData(); window.location.href = '/'; }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              color: '#ef4444',
            }}
          >
            <span>{'\uD83D\uDDD1\uFE0F'}</span>
            <div>Reset All Data</div>
          </button>

          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              color: '#6b7280',
            }}
          >
            <span>{'\uD83D\uDEAA'}</span>
            <div>Log Out</div>
          </button>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '999px',
          border: '2px solid ' + color,
          background: 'white',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          color: color,
          float: 'right',
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
        <span style={{ fontSize: '10px', opacity: 0.5 }}>
          {isExpanded ? '\u25BC' : '\u25B2'}
        </span>
      </button>
    </div>
  );
}
