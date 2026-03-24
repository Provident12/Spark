import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, MapPin, Clock, Calendar, CheckCircle2, Bookmark, Users, Flag } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { format } from 'date-fns';
import ApplicationFormModal from '../components/ApplicationFormModal';
import { useQueryClient } from '@tanstack/react-query';

const categoryColors = {
  'Finance & Banking': 'bg-orange-100 text-orange-800',
  'Technology': 'bg-blue-100 text-blue-800',
  'Healthcare': 'bg-pink-100 text-pink-800',
  'Law & Policy': 'bg-amber-100 text-amber-800',
  'Education & Tutoring': 'bg-green-100 text-green-800',
  'Hospitality & Tourism': 'bg-yellow-100 text-yellow-800',
  'Media & Journalism': 'bg-indigo-100 text-indigo-800',
  'Arts & Culture': 'bg-fuchsia-100 text-fuchsia-800',
  'Environment & Conservation': 'bg-emerald-100 text-emerald-800',
  'Social Services & NGO': 'bg-rose-100 text-rose-800',
  'Government & Public Sector': 'bg-sky-100 text-sky-800',
  'Sports & Recreation': 'bg-lime-100 text-lime-800',
  'Marketing & Advertising': 'bg-purple-100 text-purple-800',
  'Architecture & Design': 'bg-slate-100 text-slate-800',
  'Retail & Commerce': 'bg-teal-100 text-teal-800',
  'Logistics & Trade': 'bg-cyan-100 text-cyan-800',
  'Food & Beverage': 'bg-red-100 text-red-800',
  'Animal Welfare': 'bg-violet-100 text-violet-800',
  'Community Service': 'bg-teal-100 text-teal-800',
  'Science & Research': 'bg-blue-100 text-blue-800',
  'Real Estate & Property': 'bg-stone-100 text-stone-800',
  'Startup & Entrepreneurship': 'bg-orange-100 text-orange-800',
};

export default function OpportunityDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oppId = searchParams.get('id');

  const [user, setUser] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const queryClient = useQueryClient();

  const shouldAutoApply = searchParams.get('apply') === 'true';

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u && oppId) {
        base44.entities.Application.filter({ student_id: u.email, opportunity_id: oppId }).then(apps => {
          const alreadyApplied = apps.length > 0;
          setHasApplied(alreadyApplied);
          if (shouldAutoApply && !alreadyApplied) {
            setShowApplicationModal(true);
          }
        });
        base44.entities.SavedOpportunity.filter({ student_id: u.email, opportunity_id: oppId }).then(saved => {
          setIsSaved(saved.length > 0);
        });
        base44.entities.StudentProfile.filter({ created_by: u.email }).then(profiles => {
          if (profiles.length > 0) {
            setStudentProfile(profiles[0]);
          }
        });
      }
    }).catch(() => setUser(null));

    if (oppId) {
      base44.entities.Opportunity.filter({ id: oppId }).then(opps => {
        if (opps.length > 0) {
          setOpportunity(opps[0]);
          base44.entities.Organization.filter({ id: opps[0].organization_id }).then(orgs => {
            if (orgs.length > 0) setOrganization(orgs[0]);
          });
        }
      });
    }
  }, [oppId]);

  const handleApply = () => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent('/OpportunityDetail?id=' + oppId + '&apply=true')}`);
      return;
    }
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    setHasApplied(true);
    queryClient.invalidateQueries({ queryKey: ['applications'] });
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent('/OpportunityDetail?id=' + oppId)}`);
      return;
    }

    if (isSaved) {
      const saved = await base44.entities.SavedOpportunity.filter({ student_id: user.email, opportunity_id: oppId });
      if (saved.length > 0) {
        await base44.entities.SavedOpportunity.delete(saved[0].id);
        setIsSaved(false);
      }
    } else {
      await base44.entities.SavedOpportunity.create({ student_id: user.email, opportunity_id: oppId });
      setIsSaved(true);
    }
  };

  if (!opportunity) return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to opportunities
      </button>
      <DetailSkeleton />
    </div>
  );

  // Check school restriction
  const isSchoolRestricted = opportunity.restricted_schools &&
                            opportunity.restricted_schools.length > 0 &&
                            (!studentProfile?.school || !opportunity.restricted_schools.some(s => s.trim().toLowerCase() === studentProfile.school.trim().toLowerCase()));
  const canApply = !hasApplied && !isSchoolRestricted;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back link */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to opportunities
      </button>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Organization */}
        <div className="flex items-center gap-3 mb-4">
          {organization?.logo && (
            <img src={organization.logo} alt={organization.name} className="w-12 h-12 rounded-lg" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{opportunity.organization_name}</h3>
              {organization?.verification_status === 'approved' && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{opportunity.title}</h1>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge className={categoryColors[opportunity.category] || 'bg-gray-100 text-gray-800'}>
            {opportunity.category}
          </Badge>
          {opportunity.is_paid && (
            <Badge className="bg-green-100 text-green-800">Paid</Badge>
          )}
          {opportunity.duration && (
            <Badge className="bg-amber-100 text-amber-800">{opportunity.duration}</Badge>
          )}
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{opportunity.location || 'Remote'}</span>
          </div>
          {opportunity.duration && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{opportunity.duration}</span>
            </div>
          )}
          {opportunity.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Apply by {format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
            </div>
          )}
          {(opportunity.min_age || opportunity.max_age) && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Ages {opportunity.min_age || '13'}–{opportunity.max_age || '19'}</span>
            </div>
          )}
        </div>

        {/* About this role */}
        {opportunity.description && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About this role</h2>
            <p className="text-gray-700 leading-relaxed">{opportunity.description}</p>
          </div>
        )}

        {/* What you will do */}
        {opportunity.responsibilities && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">What you will do</h2>
            <div className="space-y-2">
              {opportunity.responsibilities.split('\n').map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {opportunity.requirements && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Requirements</h2>
            <div className="space-y-2">
              {opportunity.requirements.split('\n').map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-teal-500 font-bold">•</span>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About the organisation */}
        {opportunity.about_organization && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About the organisation</h2>
            <p className="text-gray-700 leading-relaxed">{opportunity.about_organization}</p>
          </div>
        )}
      </Card>

      {/* School Restriction Notice */}
      {isSchoolRestricted && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>School Restriction:</strong> This opportunity is only available to students from {opportunity.restricted_schools.join(', ')}.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={handleApply}
          disabled={hasApplied || isSchoolRestricted}
          className={`px-8 py-3 rounded-lg text-base font-semibold ${
            hasApplied || isSchoolRestricted
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {hasApplied ? 'Applied' : isSchoolRestricted ? 'Not Available' : 'Apply Now'}
        </Button>
        <Button variant="outline" className="px-6 py-3 rounded-lg" onClick={handleToggleSave}>
          <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      </div>

      {/* Report Section */}
      <div className="mt-4">
        {!showReportForm ? (
          <button
            onClick={() => {
              if (!user) {
                navigate(`/login?returnTo=${encodeURIComponent('/OpportunityDetail?id=' + oppId)}`);
                return;
              }
              setShowReportForm(true);
            }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Report this listing
          </button>
        ) : (
          <Card className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500" />
              Report this listing
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="">Select a reason...</option>
                  <option value="suspicious_org">Suspicious organization</option>
                  <option value="misleading_info">Misleading information</option>
                  <option value="inappropriate_content">Inappropriate content</option>
                  <option value="scam_fraud">Potential scam or fraud</option>
                  <option value="safety_concern">Safety concern</option>
                  <option value="illegal_activity">Illegal activity</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Details (optional)</label>
                <Textarea
                  placeholder="Provide any additional details that would help us investigate..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="min-h-20"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => { setShowReportForm(false); setReportReason(''); setReportDetails(''); }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-red-500 hover:bg-red-600 text-white"
                  disabled={!reportReason || submittingReport}
                  onClick={async () => {
                    setSubmittingReport(true);
                    try {
                      await base44.entities.Report.create({
                        reporter_email: user.email,
                        reporter_name: user.full_name || user.email,
                        opportunity_id: oppId,
                        opportunity_title: opportunity.title,
                        organization_id: opportunity.organization_id,
                        organization_name: opportunity.organization_name,
                        reason: reportReason,
                        details: reportDetails,
                        status: 'pending',
                        created_date: new Date().toISOString()
                      });
                      toast.success('Report submitted. Our team will review it.');
                      setShowReportForm(false);
                      setReportReason('');
                      setReportDetails('');
                    } catch {
                      toast.error('Failed to submit report');
                    } finally {
                      setSubmittingReport(false);
                    }
                  }}
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Application Form Modal */}
      {showApplicationModal && (
        <ApplicationFormModal
          open={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          opportunity={opportunity}
          studentProfile={studentProfile}
          user={user}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}
