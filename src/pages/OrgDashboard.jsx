import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Clock, Plus, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

export default function OrgDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    if (user) {
      base44.entities.Organization.filter({ created_by: user.email }).then(orgs => {
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
        }
      });
    }
  }, [user]);

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities', organization?.id],
    queryFn: () => organization ? base44.entities.Opportunity.filter({ organization_id: organization.id }) : [],
    enabled: !!organization,
    initialData: []
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ['applications', 'org'],
    queryFn: () => base44.entities.Application.list(),
    initialData: []
  });

  const myOpportunityIds = opportunities.map(o => o.id);
  const applications = allApplications.filter(app => myOpportunityIds.includes(app.opportunity_id));

  const stats = {
    activeListings: opportunities.filter(o => o.status === 'approved').length,
    totalApplicants: applications.length,
    pendingReview: opportunities.filter(o => o.status === 'pending').length
  };

  const activeApplicants = applications.filter(a => !['rejected', 'withdrawn', 'hired'].includes(a.status));
  const hiredCount = applications.filter(a => a.status === 'hired').length;

  if (!organization) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold mb-4">Organization Registration Required</h1>
        <p className="text-gray-600 mb-6 text-center">Please register your organization to start posting opportunities</p>
        <Button onClick={() => navigate(createPageUrl('OrgRegistration'))} className="bg-red-500 hover:bg-red-600">
          Register Organization
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={organization.name} rightAction={
        <div className="flex items-center gap-2">
          {organization.verification_status === 'approved' && <Badge className="bg-teal-100 text-teal-800">Verified</Badge>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(createPageUrl('OrgRegistration') + '?id=' + organization.id)}
            className="rounded-full"
          >
            Edit Organization
          </Button>
        </div>
      } />

      <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Verification Status Banner */}
      {organization.verification_status === 'pending' && (
        <Card className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Verification Pending</p>
              <p className="text-sm text-amber-700">Your organization is being reviewed by our admin team. You'll be able to post opportunities once approved.</p>
            </div>
          </div>
        </Card>
      )}
      {organization.verification_status === 'suspended' && (
        <Card className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-800">Organization Suspended</p>
              {organization.rejection_reason && (
                <p className="text-sm text-orange-700 mt-1">Reason: {organization.rejection_reason}</p>
              )}
              <p className="text-sm text-orange-700 mt-2">
                Your organization has been suspended. All listings have been paused. Please contact support if you believe this is an error.
              </p>
            </div>
          </div>
        </Card>
      )}
      {organization.verification_status === 'rejected' && (
        <Card className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800">Verification Rejected</p>
              {organization.rejection_reason && (
                <p className="text-sm text-red-700 mt-1">Reason: {organization.rejection_reason}</p>
              )}
              <p className="text-sm text-red-700 mt-2">
                Please update your organization details and resubmit for verification.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full"
                  onClick={() => navigate(createPageUrl('OrgRegistration') + '?id=' + organization.id)}
                >
                  Edit & Resubmit
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <FileText className="w-5 h-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
          <p className="text-xs text-gray-600">Active Listings</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <Users className="w-5 h-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalApplicants}</p>
          <p className="text-xs text-gray-600">Total Applicants</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <Clock className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{activeApplicants.length}</p>
          <p className="text-xs text-gray-600">In Pipeline</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{hiredCount}</p>
          <p className="text-xs text-gray-600">Hired</p>
        </Card>
      </div>

      {/* Your Listings */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Your Listings</h3>
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600 rounded-full disabled:opacity-50"
            onClick={() => navigate(createPageUrl('PostOpportunity'))}
            disabled={organization.verification_status !== 'approved' || organization.verification_status === 'suspended'}
          >
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>

        <div className="space-y-3">
          {opportunities.map(opp => (
            <Card
              key={opp.id}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(createPageUrl('ManageApplicants') + '?id=' + opp.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{opp.title}</h4>
                    <Badge className={
                      opp.status === 'approved' ? 'bg-green-100 text-green-800' :
                      opp.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      opp.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {opp.status === 'approved' ? 'Active' : opp.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {applications.filter(app => app.opportunity_id === opp.id).length} applicants
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(createPageUrl('PostOpportunity') + '?id=' + opp.id)}
                  className="text-red-500"
                >
                  Edit
                </Button>
              </div>

              {/* Rejection feedback banner */}
              {opp.status === 'rejected' && (
                <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  {opp.admin_feedback && (
                    <p className="text-sm text-red-700 leading-relaxed">
                      <span className="font-medium">Feedback:</span> {opp.admin_feedback}
                    </p>
                  )}
                  <p className="text-xs text-red-600 mt-1.5">You can edit your opportunity and resubmit for review.</p>
                  <Button
                    size="sm"
                    className="mt-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs px-4"
                    onClick={() => navigate(createPageUrl('PostOpportunity') + '?id=' + opp.id)}
                  >
                    Edit & Resubmit
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Applicants are managed per-listing via ManageApplicants */}
      </div>
    </div>
  );
}