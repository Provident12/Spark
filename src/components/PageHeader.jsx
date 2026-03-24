import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  children,
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        {rightAction}
      </div>
      {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
      {children}
    </div>
  );
}
