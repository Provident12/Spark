import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, Clock, CheckCircle2, ChevronRight, Mail, Phone, Globe, Flag, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/lib/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(createPageUrl('Landing'));
    }
  }, [user]);

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
    initialData: []
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.Opportunity.list(),
    initialData: []
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list(),
    initialData: []
  });

  const pendingOrgs = organizations.filter(o => o.verification_status === 'pending');
  const approvedOrgs = organizations.filter(o => o.verification_status === 'approved');
  const suspendedOrgs = organizations.filter(o => o.verification_status === 'suspended');
  const pendingOpps = opportunities.filter(o => o.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const stats = {
    pendingOrgs: pendingOrgs.length,
    pendingOpps: pendingOpps.length,
    totalOrgs: approvedOrgs.length,
    totalOpps: opportunities.filter(o => o.status === 'approved').length,
    pendingReports: pendingReports.length,
    suspendedOrgs: suspendedOrgs.length
  };

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Manage Spark platform" />

      <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <Clock className="w-5 h-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.pendingOrgs}</p>
          <p className="text-xs text-gray-600">Orgs Pending</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <Clock className="w-5 h-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.pendingOpps}</p>
          <p className="text-xs text-gray-600">Listings Pending</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <Flag className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
          <p className="text-xs text-gray-600">Reports</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <Building2 className="w-5 h-5 text-teal-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrgs}</p>
          <p className="text-xs text-gray-600">Active Orgs</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <FileText className="w-5 h-5 text-teal-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalOpps}</p>
          <p className="text-xs text-gray-600">Active Listings</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.suspendedOrgs}</p>
          <p className="text-xs text-gray-600">Suspended</p>
        </Card>
      </div>

      {/* Pending Organizations */}
      {pendingOrgs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Organizations Pending Review</h3>
          <div className="space-y-3">
            {pendingOrgs.map(org => (
              <Card 
                key={org.id}
                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(createPageUrl('ReviewOrganization') + '?id=' + org.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{org.name}</h4>
                    <p className="text-sm text-gray-600">{org.contact_email}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Opportunities */}
      {pendingOpps.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Opportunity Listings Pending Review</h3>
          <div className="space-y-3">
            {pendingOpps.map(opp => (
              <Card 
                key={opp.id}
                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(createPageUrl('ReviewOpportunity') + '?id=' + opp.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{opp.title}</h4>
                    <p className="text-sm text-gray-600">{opp.organization_name}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Reports */}
      {pendingReports.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            Flagged Reports
          </h3>
          <div className="space-y-3">
            {pendingReports.map(report => (
              <Card key={report.id} className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{report.opportunity_title}</h4>
                    <p className="text-sm text-gray-600">{report.organization_name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 text-xs capitalize">{report.reason?.replace(/_/g, ' ')}</Badge>
                      <span className="text-xs text-gray-400">by {report.reporter_email}</span>
                    </div>
                    {report.details && (
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{report.details}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-gray-500 border-gray-300 rounded-full text-xs"
                      onClick={async () => {
                        await base44.entities.Report.update(report.id, { status: 'dismissed' });
                        window.location.reload();
                      }}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                      onClick={() => navigate(createPageUrl('ReviewOrganization') + '?id=' + report.organization_id)}
                    >
                      Review Org
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pendingOrgs.length === 0 && pendingOpps.length === 0 && pendingReports.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-3" />
          <p className="text-gray-600">All caught up! No pending reviews.</p>
        </div>
      )}

      {/* Active Organizations */}
      {approvedOrgs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Active Organizations</h3>
          <div className="space-y-3">
            {approvedOrgs.map(org => (
              <Card
                key={org.id}
                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(createPageUrl('ReviewOrganization') + '?id=' + org.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{org.name}</h4>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    {org.contact_name && (
                      <p className="text-sm text-gray-600">{org.contact_name}{org.job_title ? ` - ${org.job_title}` : ''}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {opportunities.filter(o => o.organization_id === org.id && o.status === 'approved').length} listings
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  {org.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{org.contact_email}</span>
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                  {org.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Globe className="w-3.5 h-3.5" />
                      <span className="truncate">{org.website}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Suspended Organizations */}
      {suspendedOrgs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            Suspended Organizations
          </h3>
          <div className="space-y-3">
            {suspendedOrgs.map(org => (
              <Card
                key={org.id}
                className="bg-orange-50 border border-orange-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(createPageUrl('ReviewOrganization') + '?id=' + org.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{org.name}</h4>
                      <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>
                    </div>
                    {org.rejection_reason && (
                      <p className="text-sm text-orange-700">Reason: {org.rejection_reason}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}