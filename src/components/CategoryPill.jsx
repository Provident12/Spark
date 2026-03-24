import React from 'react';
import { Cpu, Heart, Palette, Leaf, Briefcase, Users, GraduationCap, Stethoscope, Scale, Landmark, Pencil, Brain, Globe, Megaphone, Trophy, Hotel, Building2, ShoppingBag, Ship, UtensilsCrossed, PawPrint, Handshake, DollarSign, Ruler } from 'lucide-react';

const categoryIcons = {
  'Finance & Banking': DollarSign,
  'Technology': Cpu,
  'Healthcare': Stethoscope,
  'Law & Policy': Scale,
  'Education & Tutoring': GraduationCap,
  'Hospitality & Tourism': Hotel,
  'Media & Journalism': Megaphone,
  'Arts & Culture': Palette,
  'Environment & Conservation': Leaf,
  'Social Services & NGO': Heart,
  'Government & Public Sector': Landmark,
  'Sports & Recreation': Trophy,
  'Marketing & Advertising': Globe,
  'Architecture & Design': Ruler,
  'Retail & Commerce': ShoppingBag,
  'Logistics & Trade': Ship,
  'Food & Beverage': UtensilsCrossed,
  'Animal Welfare': PawPrint,
  'Community Service': Handshake,
};

const categoryColors = {
  'Finance & Banking': 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  'Technology': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'Healthcare': 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  'Law & Policy': 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  'Education & Tutoring': 'bg-green-100 text-green-700 hover:bg-green-200',
  'Hospitality & Tourism': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  'Media & Journalism': 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  'Arts & Culture': 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200',
  'Environment & Conservation': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  'Social Services & NGO': 'bg-rose-100 text-rose-700 hover:bg-rose-200',
  'Government & Public Sector': 'bg-sky-100 text-sky-700 hover:bg-sky-200',
  'Sports & Recreation': 'bg-lime-100 text-lime-700 hover:bg-lime-200',
  'Marketing & Advertising': 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  'Architecture & Design': 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  'Retail & Commerce': 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  'Logistics & Trade': 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  'Food & Beverage': 'bg-red-100 text-red-700 hover:bg-red-200',
  'Animal Welfare': 'bg-violet-100 text-violet-700 hover:bg-violet-200',
  'Community Service': 'bg-teal-100 text-teal-700 hover:bg-teal-200',
};

export default function CategoryPill({ category, onClick, isSelected }) {
  const Icon = categoryIcons[category] || Briefcase;
  const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
        isSelected ? 'ring-2 ring-red-400 ' + colorClass : colorClass
      }`}
    >
      <Icon className="w-4 h-4" />
      {category}
    </button>
  );
}
