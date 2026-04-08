import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import OpportunityCard from '../components/OpportunityCard';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { Heart } from 'lucide-react';

export default function Saved() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: savedOpportunities = [] } = useQuery({
    queryKey: ['savedOpportunities', user?.email],
    queryFn: () => user ? base44.entities.SavedOpportunity.filter({ student_id: user.email }) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities', 'approved'],
    queryFn: () => base44.entities.Opportunity.filter({ status: 'approved' }),
    initialData: []
  });

  const savedIds = savedOpportunities.map(s => s.opportunity_id);
  const savedOpps = opportunities.filter(opp => savedIds.includes(opp.id));

  const handleToggleSave = async (oppId) => {
    if (!user) return;
    
    const existing = savedOpportunities.find(s => s.opportunity_id === oppId);
    if (existing) {
      await base44.entities.SavedOpportunity.delete(existing.id);
    }
    queryClient.invalidateQueries({ queryKey: ['savedOpportunities'] });
  };

  return (
    <div>
      <PageHeader title="Saved" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {savedOpps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOpps.map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isSaved={true}
                onToggleSave={() => handleToggleSave(opp.id)}
                onClick={() => navigate(createPageUrl('OpportunityDetail') + '?id=' + opp.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={Heart} title="No saved opportunities" subtitle="Tap the heart icon on any opportunity to save it here" />
        )}
      </div>
    </div>
  );
}