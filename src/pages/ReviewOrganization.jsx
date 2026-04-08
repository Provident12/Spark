import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, XCircle, Globe, Mail, Phone, User, Briefcase, Linkedin, FileText, ExternalLink, ShieldAlert, ShieldCheck, Square, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { DetailSkeleton } from '@/components/LoadingSkeleton';

export default function ReviewOrganization() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('id');

  const [organization, setOrganization] = useState(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState({
    website_verified: false,
    linkedin_verified: false,
    contact_verified: false,
    docs_reviewed: false,
    no_red_flags: false,
  });

  useEffect(() => {
    if (orgId) {
      base44.entities.Organization.filter({ id: orgId }).then(orgs => {
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
          setNotes(orgs[0].admin_notes || '');
          if (orgs[0].admin_checklist) {
            setChecklist(prev => ({ ...prev, ...orgs[0].admin_checklist }));
          }
        }
      });
    }
  }, [orgId]);

  const handleSuspend = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }
    setLoading(true);
    const opps = await base44.entities.Opportunity.filter({ organization_id: orgId });
    await Promise.all([
      base44.entities.Organization.update(orgId, {
        ...organization,
        verification_status: 'suspended',
        rejection_reason: rejectionReason,
        admin_notes: notes,
        admin_checklist: checklist
      }),
      ...opps
        .filter(opp => opp.status === 'approved' || opp.status === 'pending')
        .map(opp => base44.entities.Opportunity.update(opp.id, { status: 'suspended' })),
    ]);
    await base44.entities.Notification.create({
      recipient_email: organization.created_by,
      recipient_type: 'org',
      type: 'org_suspended',
      title: 'Organization Suspended',
      message: `Your organization "${organization.name}" has been suspended. Reason: ${rejectionReason}. All active listings have been paused. Please contact support if you believe this is an error.`,
      read: false,
      created_date: new Date().toISOString()
    });
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
    queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    setLoading(false);
    toast.success('Organization suspended');
    navigate(createPageUrl('AdminDashboard'));
  };

  const handleApprove = async () => {
    setLoading(true);
    await Promise.all([
      base44.entities.Organization.update(orgId, {
        ...organization,
        verification_status: 'approved',
        admin_notes: notes,
        admin_checklist: checklist
      }),
      base44.entities.Notification.create({
        recipient_email: organization.created_by,
        recipient_type: 'org',
        type: 'org_approved',
        title: 'Organization Approved',
        message: `Your organization "${organization.name}" has been approved. You can now post opportunities.`,
        read: false,
        created_date: new Date().toISOString()
      }),
    ]);
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
    setLoading(false);
    toast.success('Organization approved');
    navigate(createPageUrl('AdminDashboard'));
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setLoading(true);
    await Promise.all([
      base44.entities.Organization.update(orgId, {
        ...organization,
        verification_status: 'rejected',
        rejection_reason: rejectionReason,
        admin_notes: notes,
        admin_checklist: checklist
      }),
      base44.entities.Notification.create({
        recipient_email: organization.created_by,
        recipient_type: 'org',
        type: 'org_rejected',
        title: 'Organization Not Approved',
        message: `Your organization "${organization.name}" was not approved. Reason: ${rejectionReason}. You can update your details and resubmit.`,
        read: false,
        created_date: new Date().toISOString()
      }),
    ]);
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
    setLoading(false);
    toast.success('Organization rejected');
    navigate(createPageUrl('AdminDashboard'));
  };

  if (!organization) return (
    <div>
      <PageHeader title="Review Organization" onBack={() => navigate(createPageUrl('AdminDashboard'))} />
      <div className="max-w-4xl mx-auto px-6 py-8"><DetailSkeleton /></div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Review Organization" onBack={() => navigate(createPageUrl('AdminDashboard'))} />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {/* Status badge */}
        {organization.verification_status !== 'pending' && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
            organization.verification_status === 'approved' ? 'bg-green-50 border-green-200' :
            organization.verification_status === 'suspended' ? 'bg-orange-50 border-orange-200' :
            'bg-red-50 border-red-200'
          }`}>
            {organization.verification_status === 'approved' && <ShieldCheck className="w-5 h-5 text-green-600" />}
            {organization.verification_status === 'suspended' && <ShieldAlert className="w-5 h-5 text-orange-600" />}
            {organization.verification_status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
            <span className={`text-sm font-medium capitalize ${
              organization.verification_status === 'approved' ? 'text-green-800' :
              organization.verification_status === 'suspended' ? 'text-orange-800' :
              'text-red-800'
            }`}>
              Status: {organization.verification_status}
            </span>
          </div>
        )}

        <Card className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{organization.name}</h2>

          <div className="space-y-4">
            {organization.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</h3>
                <p className="text-gray-700">{organization.description}</p>
              </div>
            )}

            {organization.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="w-4 h-4 shrink-0" />
                <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                  {organization.website}
                </a>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</h3>
            <div className="space-y-2">
              {organization.contact_name && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 shrink-0" />
                  <span>{organization.contact_name}</span>
                </div>
              )}

              {organization.job_title && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>{organization.job_title}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{organization.contact_email}</span>
              </div>

              {organization.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{organization.phone}</span>
                </div>
              )}

              {organization.mentor_linkedin && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Linkedin className="w-4 h-4 shrink-0" />
                  <a href={organization.mentor_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                    {organization.mentor_linkedin}
                  </a>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Verification Documents */}
        {organization.verification_docs && organization.verification_docs.length > 0 && (
          <Card className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Verification Documents</h3>
            <div className="space-y-2">
              {organization.verification_docs.map((doc, idx) => (
                <a
                  key={idx}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{doc.name}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
          </Card>
        )}
        {(!organization.verification_docs || organization.verification_docs.length === 0) && (
          <Card className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700">No verification documents uploaded. Consider requesting documentation before approving.</p>
            </div>
          </Card>
        )}

        {/* Review Checklist */}
        <Card className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Verification Checklist</h3>
          <div className="space-y-2">
            {[
              { key: 'website_verified', label: 'Website verified — domain is active and matches organization claims' },
              { key: 'linkedin_verified', label: 'Mentor LinkedIn verified — profile is real and matches contact info' },
              { key: 'contact_verified', label: 'Contact details verified — email domain, phone number appear legitimate' },
              { key: 'docs_reviewed', label: 'Verification documents reviewed — uploaded docs support legitimacy' },
              { key: 'no_red_flags', label: 'No red flags — no signs of fraud, scam, or inappropriate content' },
            ].map(item => (
              <button
                key={item.key}
                type="button"
                className="flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              >
                {checklist[item.key]
                  ? <CheckSquare className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  : <Square className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                }
                <span className={`text-sm leading-relaxed ${checklist[item.key] ? 'text-gray-900' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Complete this checklist before approving. Checklist state is saved with your decision.</p>
        </Card>

        <Card className="bg-white rounded-2xl shadow-md p-6">
          <div className="space-y-4">
            <div>
              <Label>Admin Notes (optional)</Label>
              <Textarea
                placeholder="Add internal notes about this review..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            {(organization.verification_status === 'pending' || organization.verification_status === 'approved') && (
              <>
                <div>
                  <Label>{organization.verification_status === 'approved' ? 'Suspension Reason (required)' : 'Rejection Reason (required if rejecting)'}</Label>
                  <Textarea
                    placeholder={organization.verification_status === 'approved'
                      ? "Explain why this organization is being suspended..."
                      : "Explain why this organization is being rejected..."}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {organization.verification_status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleReject}
                      disabled={loading}
                      variant="outline"
                      className="flex-1 py-6 rounded-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={loading}
                      className="flex-1 py-6 rounded-full bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}

                {organization.verification_status === 'approved' && (
                  <div className="pt-2">
                    <Button
                      onClick={handleSuspend}
                      disabled={loading}
                      variant="outline"
                      className="w-full py-6 rounded-full border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <ShieldAlert className="w-5 h-5 mr-2" />
                      Suspend Organization
                    </Button>
                    <p className="text-xs text-gray-400 text-center mt-2">This will suspend all active listings from this organization.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}