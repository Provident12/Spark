import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OpportunityCard from '../components/OpportunityCard';
import LocationSelector from '../components/LocationSelector';
import EmptyState from '@/components/EmptyState';

export default function StudentHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState('all');

  const categories = ['Finance & Banking', 'Technology', 'Healthcare', 'Law & Policy', 'Education & Tutoring', 'Hospitality & Tourism', 'Media & Journalism', 'Arts & Culture', 'Environment & Conservation', 'Social Services & NGO', 'Government & Public Sector', 'Sports & Recreation', 'Marketing & Advertising', 'Architecture & Design', 'Retail & Commerce', 'Logistics & Trade', 'Food & Beverage', 'Animal Welfare', 'Community Service', 'Science & Research', 'Real Estate & Property', 'Startup & Entrepreneurship'];

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u) {
        base44.entities.StudentProfile.filter({ created_by: u.email }).then((profiles) => {
          if (profiles.length > 0) {
            setProfile(profiles[0]);
          }
        });
      }
    });
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

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', user?.email],
    queryFn: () => user ? base44.entities.Application.filter({ student_id: user.email }) : [],
    enabled: !!user,
    initialData: []
  });

  const savedIds = savedOpportunities.map((s) => s.opportunity_id);

  const handleToggleSave = async (oppId) => {
    if (!user) return;

    const existing = savedOpportunities.find((s) => s.opportunity_id === oppId);
    if (existing) {
      await base44.entities.SavedOpportunity.delete(existing.id);
    } else {
      await base44.entities.SavedOpportunity.create({ student_id: user.email, opportunity_id: oppId });
    }
    queryClient.invalidateQueries({ queryKey: ['savedOpportunities'] });
  };

  const filteredOpportunities = opportunities.filter((opp) => {
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

    // Ages 13-14: only show volunteering and educational opportunities (no paid internships)
    if (profile?.age && profile.age <= 14) {
      if (opp.is_paid) return false;
      if (opp.type === 'Internship') return false;
    }

    const matchesSchoolRestriction = !opp.restricted_schools ||
      opp.restricted_schools.length === 0 ||
      (profile?.school && opp.restricted_schools.some((s) => s.trim().toLowerCase() === profile.school.trim().toLowerCase()));
    if (!matchesSchoolRestriction) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Age restriction notice for 13-14 */}
      {profile?.age && profile.age <= 14 && (
        <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-700 leading-relaxed">
            As you are {profile.age} years old, you can browse volunteering and educational opportunities. Paid internships will become available when you turn 15.
          </p>
        </div>
      )}

      {/* Profile Completion */}
      {user && profile && profile.profile_completion < 100 && (
        <Card
          className="bg-white rounded-2xl shadow-md p-5 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate(createPageUrl('ProfileBuilder'))}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Complete your profile</h3>
              <Progress value={profile.profile_completion} className="h-2 mb-1" />
              <p className="text-sm text-gray-500">{profile.profile_completion}%</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
          </div>
        </Card>
      )}

      {/* Your Applications */}
      {applications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">Your Applications</h3>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{applications.length}</span>
            </div>
            <Button variant="link" className="text-red-500" onClick={() => navigate(createPageUrl('Applications'))}>
              View all
            </Button>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <Card key={app.id} className="bg-orange-50 rounded-2xl p-4 border-0 cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => navigate(createPageUrl('Applications'))}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{app.opportunity_title}</h4>
                    <p className="text-sm text-gray-600">{app.organization_name}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Browse Opportunities */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Browse Opportunities</h3>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white border border-gray-300 rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-4">
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
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
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

        {/* Results */}
        <p className="text-gray-600 text-sm mb-4">{filteredOpportunities.length} opportunities</p>

        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opp) => (
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
          <EmptyState icon={Search} title="No opportunities found" subtitle="Try adjusting your filters or search terms" />
        )}
      </div>
    </div>
  );
}
