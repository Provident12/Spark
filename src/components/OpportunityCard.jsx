import React from 'react';
import { Heart, MapPin, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const categoryColors = {
  'Finance & Banking': 'bg-orange-100 text-orange-800 border-orange-200',
  'Technology': 'bg-blue-100 text-blue-800 border-blue-200',
  'Healthcare': 'bg-pink-100 text-pink-800 border-pink-200',
  'Law & Policy': 'bg-amber-100 text-amber-800 border-amber-200',
  'Education & Tutoring': 'bg-green-100 text-green-800 border-green-200',
  'Hospitality & Tourism': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Media & Journalism': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Arts & Culture': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'Environment & Conservation': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Social Services & NGO': 'bg-rose-100 text-rose-800 border-rose-200',
  'Government & Public Sector': 'bg-sky-100 text-sky-800 border-sky-200',
  'Sports & Recreation': 'bg-lime-100 text-lime-800 border-lime-200',
  'Marketing & Advertising': 'bg-purple-100 text-purple-800 border-purple-200',
  'Architecture & Design': 'bg-slate-100 text-slate-800 border-slate-200',
  'Retail & Commerce': 'bg-teal-100 text-teal-800 border-teal-200',
  'Logistics & Trade': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Food & Beverage': 'bg-red-100 text-red-800 border-red-200',
  'Animal Welfare': 'bg-violet-100 text-violet-800 border-violet-200',
  'Community Service': 'bg-teal-100 text-teal-800 border-teal-200',
};

const topBarColors = {
  'Finance & Banking': 'bg-orange-400',
  'Technology': 'bg-blue-400',
  'Healthcare': 'bg-pink-400',
  'Law & Policy': 'bg-amber-400',
  'Education & Tutoring': 'bg-green-400',
  'Hospitality & Tourism': 'bg-yellow-400',
  'Media & Journalism': 'bg-indigo-400',
  'Arts & Culture': 'bg-fuchsia-400',
  'Environment & Conservation': 'bg-emerald-400',
  'Social Services & NGO': 'bg-rose-400',
  'Government & Public Sector': 'bg-sky-400',
  'Sports & Recreation': 'bg-lime-400',
  'Marketing & Advertising': 'bg-purple-400',
  'Architecture & Design': 'bg-slate-400',
  'Retail & Commerce': 'bg-teal-400',
  'Logistics & Trade': 'bg-cyan-400',
  'Food & Beverage': 'bg-red-400',
  'Animal Welfare': 'bg-violet-400',
  'Community Service': 'bg-teal-400',
};

export default function OpportunityCard({ opportunity, isSaved, onToggleSave, onClick }) {
  return (
    <Card
      className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col h-full border border-gray-200"
      onClick={onClick}
    >
      {/* Top color bar */}
      <div className={`h-1.5 ${topBarColors[opportunity.category] || 'bg-gray-300'}`} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-2">{opportunity.title}</h3>
            <p className="text-gray-500 text-sm">{opportunity.organization_name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -mt-1 -mr-2"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-gray-400'}`} />
          </Button>
        </div>

        {/* Description excerpt */}
        {opportunity.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{opportunity.description}</p>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{opportunity.location || 'Remote'}</span>
            </div>
            {(opportunity.min_age || opportunity.max_age) && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{opportunity.min_age || '13'}–{opportunity.max_age || '19'}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className={`text-xs ${categoryColors[opportunity.category] || 'bg-gray-100 text-gray-800'} border`}>
              {opportunity.category}
            </Badge>
            {opportunity.is_paid && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                Paid
              </Badge>
            )}
            {opportunity.duration && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                {opportunity.duration}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
