import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import LocationSelector from '../components/LocationSelector';
import EmptyState from '@/components/EmptyState';

export default function Landing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState('all');

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities', 'approved'],
    queryFn: () => base44.entities.Opportunity.filter({ status: 'approved' }),
    initialData: []
  });

  const { data: savedOpportunities = [] } = useQuery({
    queryKey: ['savedOpportunities', user?.email],
    queryFn: () => user ? base44.entities.SavedOpportunity.filter({ student_id: user.email }) : [],
    enabled: !!user,
    initialData: []
  });

  const savedIds = savedOpportunities.map(s => s.opportunity_id);

  const handleToggleSave = async (oppId) => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const existing = savedOpportunities.find(s => s.opportunity_id === oppId);
    if (existing) {
      await base44.entities.SavedOpportunity.delete(existing.id);
    } else {
      await base44.entities.SavedOpportunity.create({ student_id: user.email, opportunity_id: oppId });
    }
    queryClient.invalidateQueries({ queryKey: ['savedOpportunities'] });
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (searchQuery && !opp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !opp.organization_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (typeFilter !== 'all' && opp.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && opp.category !== categoryFilter) return false;
    if (locationFilter !== 'all' && opp.location !== locationFilter) return false;
    if (ageFilter !== 'all') {
      const filterAge = Number(ageFilter);
      const oppMin = opp.min_age || 0;
      const oppMax = opp.max_age || 99;
      if (filterAge < oppMin || filterAge > oppMax) return false;
    }
    if (paidFilter === 'paid' && !opp.is_paid) return false;
    if (paidFilter === 'unpaid' && opp.is_paid) return false;
    return true;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Next Opportunity
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Internships and volunteering opportunities for Hong Kong students
          </p>
          <div className="max-w-2xl mx-auto relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search opportunities by title or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-white rounded-xl shadow-lg border-0 text-base"
            />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 overflow-x-auto hide-scrollbar">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-auto bg-red-500 text-white border-0 rounded-full">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Volunteering">Volunteering</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-auto bg-white border border-gray-300 rounded-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Finance & Banking">Finance & Banking</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Law & Policy">Law & Policy</SelectItem>
              <SelectItem value="Education & Tutoring">Education & Tutoring</SelectItem>
              <SelectItem value="Hospitality & Tourism">Hospitality & Tourism</SelectItem>
              <SelectItem value="Media & Journalism">Media & Journalism</SelectItem>
              <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
              <SelectItem value="Environment & Conservation">Environment & Conservation</SelectItem>
              <SelectItem value="Social Services & NGO">Social Services & NGO</SelectItem>
              <SelectItem value="Government & Public Sector">Government & Public Sector</SelectItem>
              <SelectItem value="Sports & Recreation">Sports & Recreation</SelectItem>
              <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
              <SelectItem value="Architecture & Design">Architecture & Design</SelectItem>
              <SelectItem value="Retail & Commerce">Retail & Commerce</SelectItem>
              <SelectItem value="Logistics & Trade">Logistics & Trade</SelectItem>
              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
              <SelectItem value="Animal Welfare">Animal Welfare</SelectItem>
              <SelectItem value="Community Service">Community Service</SelectItem>
              <SelectItem value="Science & Research">Science & Research</SelectItem>
              <SelectItem value="Real Estate & Property">Real Estate & Property</SelectItem>
              <SelectItem value="Startup & Entrepreneurship">Startup & Entrepreneurship</SelectItem>
            </SelectContent>
          </Select>

          <LocationSelector value={locationFilter} onChange={setLocationFilter} />

          <Select value={ageFilter} onValueChange={setAgeFilter}>
            <SelectTrigger className="w-auto bg-white border border-gray-300 rounded-full">
              <SelectValue placeholder="Age" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              {[13, 14, 15, 16, 17, 18, 19].map(age => (
                <SelectItem key={age} value={String(age)}>{age} years old</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paidFilter} onValueChange={setPaidFilter}>
            <SelectTrigger className="w-auto bg-white border border-gray-300 rounded-full">
              <SelectValue placeholder="Compensation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Opportunity Grid */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">{filteredOpportunities.length} opportunities</p>
        </div>

        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isSaved={savedIds.includes(opp.id)}
                onToggleSave={() => handleToggleSave(opp.id)}
                onClick={() => navigate(createPageUrl('OpportunityDetail') + '?id=' + opp.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={SearchIcon} title="No opportunities found" subtitle="Try adjusting your filters or search terms" />
        )}
      </section>
    </div>
  );
}
