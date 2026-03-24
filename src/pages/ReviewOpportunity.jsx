import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, XCircle, MapPin, Clock, Calendar, Wifi, School, HelpCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { format } from 'date-fns';

export default function ReviewOpportunity() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const oppId = searchParams.get('id');

  const [opportunity, setOpportunity] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (oppId) {
      base44.entities.Opportunity.filter({ id: oppId }).then(opps => {
        if (opps.length > 0) {
          setOpportunity(opps[0]);
          setFeedback(opps[0].admin_feedback || '');
        }
      });
    }
  }, [oppId]);

  const handleApprove = async () => {
    setLoading(true);
    await base44.entities.Opportunity.update(oppId, {
      status: 'approved',
      admin_feedback: feedback
    });
    await base44.entities.Notification.create({
      recipient_email: opportunity.created_by,
      recipient_type: 'org',
      type: 'opportunity_approved',
      title: 'Opportunity Approved',
      message: `Your opportunity "${opportunity.title}" has been approved and is now live for students to apply.`,
      opportunity_id: oppId,
      read: false,
      created_date: new Date().toISOString()
    });
    queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    setLoading(false);
    toast.success('Opportunity approved');
    navigate(createPageUrl('AdminDashboard'));
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback for the rejection');
      return;
    }
    setLoading(true);
    await base44.entities.Opportunity.update(oppId, {
      status: 'rejected',
      admin_feedback: feedback
    });
    await base44.entities.Notification.create({
      recipient_email: opportunity.created_by,
      recipient_type: 'org',
      type: 'opportunity_rejected',
      title: 'Opportunity Not Approved',
      message: `Your opportunity "${opportunity.title}" was not approved. Feedback: ${feedback}. You can edit and resubmit.`,
      opportunity_id: oppId,
      read: false,
      created_date: new Date().toISOString()
    });
    queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    setLoading(false);
    toast.success('Opportunity rejected');
    navigate(createPageUrl('AdminDashboard'));
  };

  if (!opportunity) return (
    <div>
      <PageHeader title="Review Opportunity" onBack={() => navigate(createPageUrl('AdminDashboard'))} />
      <div className="max-w-4xl mx-auto px-6 py-8"><DetailSkeleton /></div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Review Opportunity" onBack={() => navigate(createPageUrl('AdminDashboard'))} />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        <Card className="bg-white rounded-2xl shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{opportunity.title}</h2>
            <p className="text-gray-600">{opportunity.organization_name}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-800">{opportunity.type}</Badge>
            <Badge className="bg-purple-100 text-purple-800">{opportunity.category}</Badge>
            {opportunity.is_paid && <Badge className="bg-green-100 text-green-800">Paid</Badge>}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{opportunity.location || 'Not specified'}</span>
            </div>
            {opportunity.is_remote && (
              <div className="flex items-center gap-2 text-gray-600">
                <Wifi className="w-4 h-4 shrink-0" />
                <span>Remote</span>
              </div>
            )}
            {opportunity.duration && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{opportunity.duration}</span>
              </div>
            )}
            {opportunity.deadline && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Deadline: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
              </div>
            )}
            {(opportunity.min_age || opportunity.max_age) && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 shrink-0" />
                <span>Ages {opportunity.min_age || '13'}–{opportunity.max_age || '19'}</span>
              </div>
            )}
          </div>

          {opportunity.description && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{opportunity.description}</p>
            </div>
          )}

          {opportunity.responsibilities && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Responsibilities</h3>
              <p className="text-gray-700 whitespace-pre-line">{opportunity.responsibilities}</p>
            </div>
          )}

          {opportunity.requirements && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Requirements</h3>
              <p className="text-gray-700 whitespace-pre-line">{opportunity.requirements}</p>
            </div>
          )}

          {/* School Restrictions */}
          {opportunity.restricted_schools && opportunity.restricted_schools.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">School Restrictions</h3>
              <div className="flex items-start gap-2 text-gray-600">
                <School className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {opportunity.restricted_schools.map((school, idx) => (
                    <Badge key={idx} className="bg-gray-100 text-gray-700 font-normal">{school}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Application Questions */}
          {opportunity.application_questions && opportunity.application_questions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Application Questions</h3>
              <div className="space-y-2">
                {opportunity.application_questions.map((q, idx) => (
                  <div key={q.id || idx} className="flex items-start gap-2 text-gray-600">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {q.question}
                      {q.required && <span className="text-red-500 ml-1">*</span>}
                      <span className="text-gray-400 ml-1 text-xs">({q.type})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="bg-white rounded-2xl shadow-md p-6">
          <div className="space-y-4">
            <div>
              <Label>Admin Feedback (visible to organization if rejected)</Label>
              <Textarea
                placeholder="Provide feedback or reasons for rejection..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1"
              />
            </div>

            {opportunity.status === 'pending' && (
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
          </div>
        </Card>
      </div>
    </div>
  );
}