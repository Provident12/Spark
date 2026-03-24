import React from 'react';

export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 max-w-sm">{subtitle}</p>}
    </div>
  );
}
