import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  User, FileText, Users, Mail, ChevronDown, ChevronUp,
  Eye, UserCheck, Calendar, CheckCircle2, XCircle, Plus, Trash2, Clock, Download
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import MessageThread from '@/components/MessageThread';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { emailInterviewScheduled, emailApplicationHired, emailApplicationRejected } from '../utils/emailService';

const STAGES = {
  applied: { label: 'Applied', color: 'bg-gray-100 text-gray-700', order: 0 },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', order: 1 },
  shortlisted: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-700', order: 2 },
  interview_scheduled: { label: 'Interview Scheduled', color: 'bg-amber-100 text-amber-700', order: 3 },
  interview_completed: { label: 'Interview Done', color: 'bg-teal-100 text-teal-700', order: 4 },
  hired: { label: 'Hired', color: 'bg-green-100 text-green-700', order: 5 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', order: 6 },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-500', order: 7 },
};

function openFileUrl(url) {
  if (url.startsWith('data:')) {
    const [header, base64] = url.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    window.open(URL.createObjectURL(blob), '_blank');
  } else {
    window.open(url, '_blank');
  }
}

function generateICS(slot, opportunityTitle, studentName) {
  const dateStr = slot.date.replace(/-/g, '');
  const startStr = slot.start_time.replace(/:/g, '');
  const endStr = slot.end_time.replace(/:/g, '');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Spark//Interview//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dateStr}T${startStr}00`,
    `DTEND:${dateStr}T${endStr}00`,
    `SUMMARY:Interview - ${studentName} - ${opportunityTitle}`,
    `DESCRIPTION:Interview with ${studentName} for ${opportunityTitle}`,
    slot.location ? `LOCATION:${slot.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-${studentName.replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function ApplicantCard({ app, profile, interviewSlots, onAction, opportunityTitle, currentUserEmail, currentUserName }) {
  const [expanded, setExpanded] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectMessage, setRejectMessage] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showHireConfirm, setShowHireConfirm] = useState(false);
  const [newSlots, setNewSlots] = useState([{ date: '', start_time: '', end_time: '', location: '' }]);
  const [loading, setLoading] = useState(false);

  const stage = app.status || 'applied';
  const stageInfo = STAGES[stage] || STAGES.applied;
  const isTerminal = stage === 'hired' || stage === 'rejected' || stage === 'withdrawn';

  // Interview slots for this application
  const appSlots = interviewSlots.filter(s => s.application_id === app.id);
  const selectedSlot = appSlots.find(s => s.selected);
  const interviewRound = appSlots.length > 0 ? Math.max(...appSlots.map(s => s.round || 1)) : 0;

  const handleAction = async (action, data = {}) => {
    setLoading(true);
    await onAction(app, action, data);
    setLoading(false);
    setShowRejectForm(false);
    setShowScheduleForm(false);
    setShowHireConfirm(false);
    setRejectMessage('');
  };

  const addSlotRow = () => {
    setNewSlots([...newSlots, { date: '', start_time: '', end_time: '', location: '' }]);
  };

  const removeSlotRow = (idx) => {
    if (newSlots.length > 1) {
      setNewSlots(newSlots.filter((_, i) => i !== idx));
    }
  };

  const updateSlotRow = (idx, field, value) => {
    const updated = [...newSlots];
    updated[idx] = { ...updated[idx], [field]: value };
    setNewSlots(updated);
  };

  const canSchedule = newSlots.every(s => s.date && s.start_time && s.end_time);

  return (
    <Card className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header — always visible */}
      <div
        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">{app.student_name}</h3>
              <Badge className={stageInfo.color}>{stageInfo.label}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {profile && (
                <span className="text-sm text-gray-500">
                  {profile.age && `Age ${profile.age}`}
                  {profile.age && profile.school && ' · '}
                  {profile.school}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 space-y-4">
          {/* Contact */}
          <div className="pt-4">
            <a
              href={`mailto:${app.student_id}`}
              className="inline-flex items-center gap-1.5 text-sm text-red-500 font-medium hover:underline"
            >
              <Mail className="w-4 h-4" />
              {app.student_id}
            </a>
            <p className="text-xs text-gray-400 mt-1">
              Applied {app.created_date ? format(new Date(app.created_date), 'MMM d, yyyy') : ''}
            </p>
          </div>

          {/* Profile details */}
          {profile && (
            <div className="space-y-3">
              {profile.bio && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Personal Statement</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map(i => (
                      <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">{i}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {(app.application_file_url || app.resume_url) && (
            <div className="flex gap-2">
              {app.application_file_url && (
                <Button variant="outline" size="sm" onClick={() => openFileUrl(app.application_file_url)}>
                  <FileText className="w-4 h-4 mr-1.5" /> Application
                </Button>
              )}
              {app.resume_url && (
                <Button variant="outline" size="sm" onClick={() => openFileUrl(app.resume_url)}>
                  <FileText className="w-4 h-4 mr-1.5" /> Resume
                </Button>
              )}
            </div>
          )}

          {/* Scheduled interviews */}
          {appSlots.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Interview {interviewRound > 1 ? `(Round ${interviewRound})` : ''}
              </p>
              <div className="space-y-1.5">
                {appSlots.filter(s => s.round === interviewRound).map(slot => (
                  <div
                    key={slot.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      slot.selected ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>
                      {format(new Date(slot.date), 'EEE, MMM d')} · {slot.start_time} – {slot.end_time}
                      {slot.location && ` · ${slot.location}`}
                    </span>
                    {slot.selected && <CheckCircle2 className="w-4 h-4 ml-auto text-green-600" />}
                  </div>
                ))}
              </div>
              {selectedSlot && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-green-700 border-green-300"
                  onClick={() => generateICS(selectedSlot, opportunityTitle, app.student_name)}
                >
                  <Download className="w-4 h-4 mr-1.5" /> Add to Calendar (.ics)
                </Button>
              )}
              {!selectedSlot && stage === 'interview_scheduled' && (
                <p className="text-xs text-amber-600 mt-1.5">Waiting for student to pick a time slot</p>
              )}
            </div>
          )}

          {/* Messaging */}
          <MessageThread
            applicationId={app.id}
            currentUserEmail={currentUserEmail}
            currentUserName={currentUserName}
            otherUserName={app.student_name || app.student_id}
            otherUserEmail={app.student_id}
            recipientType="student"
          />

          {/* Rejection reason (if rejected) */}
          {stage === 'rejected' && app.rejection_message && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs font-medium text-red-600 mb-0.5">Rejection reason</p>
              <p className="text-sm text-red-700">{app.rejection_message}</p>
            </div>
          )}

          {/* Action Buttons */}
          {!isTerminal && (
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap gap-2">
                {stage === 'applied' && (
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" disabled={loading}
                    onClick={() => handleAction('under_review')}>
                    <Eye className="w-4 h-4 mr-1.5" /> Mark as Under Review
                  </Button>
                )}
                {(stage === 'applied' || stage === 'under_review') && (
                  <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50" disabled={loading}
                    onClick={() => handleAction('shortlisted')}>
                    <UserCheck className="w-4 h-4 mr-1.5" /> Shortlist
                  </Button>
                )}
                {(stage === 'shortlisted' || stage === 'interview_completed') && (
                  <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50" disabled={loading}
                    onClick={() => setShowScheduleForm(true)}>
                    <Calendar className="w-4 h-4 mr-1.5" /> Schedule Interview
                  </Button>
                )}
                {stage === 'interview_scheduled' && selectedSlot && (
                  <Button size="sm" variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50" disabled={loading}
                    onClick={() => handleAction('interview_completed')}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Interview Done
                  </Button>
                )}
                {(stage === 'shortlisted' || stage === 'interview_completed') && (
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" disabled={loading}
                    onClick={() => setShowHireConfirm(true)}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Hire
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={loading}
                  onClick={() => setShowRejectForm(true)}>
                  <XCircle className="w-4 h-4 mr-1.5" /> Reject
                </Button>
              </div>

              {/* Schedule Interview Form */}
              {showScheduleForm && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <p className="text-sm font-semibold text-amber-800">
                    Schedule Interview {interviewRound > 0 ? `(Round ${interviewRound + 1})` : ''}
                  </p>
                  <p className="text-xs text-amber-600">Add one or more time slots. The student will choose one.</p>
                  {newSlots.map((slot, idx) => {
                    const TIME_OPTIONS = [
                      '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
                      '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
                      '16:00','16:30','17:00','17:30','18:00','18:30','19:00'
                    ];
                    return (
                    <div key={idx} className="p-3 bg-white border border-amber-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-700">Slot {idx + 1}</span>
                        {newSlots.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={() => removeSlotRow(idx)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">Date</label>
                        <Input type="date" value={slot.date} onChange={e => updateSlotRow(idx, 'date', e.target.value)}
                          className="h-10 text-sm" min={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-0.5 block">From</label>
                          <select
                            value={slot.start_time}
                            onChange={e => {
                              updateSlotRow(idx, 'start_time', e.target.value);
                              // Auto-set end time to 1 hour later if not set
                              if (!slot.end_time) {
                                const startIdx = TIME_OPTIONS.indexOf(e.target.value);
                                if (startIdx >= 0 && startIdx + 2 < TIME_OPTIONS.length) {
                                  updateSlotRow(idx, 'end_time', TIME_OPTIONS[startIdx + 2]);
                                }
                              }
                            }}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white"
                          >
                            <option value="">Select time</option>
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => {
                                const hour = parseInt(h);
                                return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
                              })}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-0.5 block">To</label>
                          <select
                            value={slot.end_time}
                            onChange={e => updateSlotRow(idx, 'end_time', e.target.value)}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white"
                          >
                            <option value="">Select time</option>
                            {TIME_OPTIONS.filter(t => !slot.start_time || t > slot.start_time).map(t => (
                              <option key={t} value={t}>{t.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => {
                                const hour = parseInt(h);
                                return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
                              })}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">Location (optional)</label>
                        <Input placeholder="e.g. Office address, Zoom link, Google Meet" value={slot.location} onChange={e => updateSlotRow(idx, 'location', e.target.value)}
                          className="h-10 text-sm" />
                      </div>
                    </div>
                    );
                  })}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={addSlotRow} className="text-amber-700">
                      <Plus className="w-4 h-4 mr-1" /> Add another slot
                    </Button>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={!canSchedule || loading}
                      onClick={() => handleAction('schedule_interview', { slots: newSlots, round: interviewRound + 1 })}>
                      Send to Student
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowScheduleForm(false); setNewSlots([{ date: '', start_time: '', end_time: '', location: '' }]); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Hire Confirmation */}
              {showHireConfirm && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                  <p className="text-sm font-semibold text-green-800">Confirm Hire</p>
                  <p className="text-sm text-green-700">
                    Are you sure you want to hire <span className="font-medium">{app.student_name}</span>? They will be notified by email and in-app.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" disabled={loading}
                      onClick={() => handleAction('hired')}>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Yes, Hire
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowHireConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {showRejectForm && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                  <p className="text-sm font-semibold text-red-800">Reject Applicant</p>
                  <Textarea
                    placeholder="Provide a reason for the student (optional but recommended)..."
                    value={rejectMessage}
                    onChange={e => setRejectMessage(e.target.value)}
                    className="min-h-20 text-sm bg-white"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" disabled={loading}
                      onClick={() => handleAction('rejected', { message: rejectMessage })}>
                      Confirm Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowRejectForm(false); setRejectMessage(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function ManageApplicants() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const opportunityId = searchParams.get('id');
  const [filterStage, setFilterStage] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const { data: opportunity } = useQuery({
    queryKey: ['opportunity', opportunityId],
    queryFn: async () => {
      const opps = await base44.entities.Opportunity.filter({ id: opportunityId });
      return opps[0];
    },
    enabled: !!opportunityId
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', opportunityId],
    queryFn: () => base44.entities.Application.filter({ opportunity_id: opportunityId }),
    enabled: !!opportunityId,
    initialData: []
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['studentProfiles'],
    queryFn: () => base44.entities.StudentProfile.list(),
    initialData: []
  });

  const { data: interviewSlots = [] } = useQuery({
    queryKey: ['interviewSlots', opportunityId],
    queryFn: () => base44.entities.InterviewSlot.filter({ opportunity_id: opportunityId }),
    enabled: !!opportunityId,
    initialData: []
  });

  const getStudentProfile = (studentId) => allProfiles.find(p => p.created_by === studentId);

  const handleAction = async (app, action, data = {}) => {
    try {
      if (action === 'schedule_interview') {
        // Create interview slots
        for (const slot of data.slots) {
          await base44.entities.InterviewSlot.create({
            application_id: app.id,
            opportunity_id: opportunityId,
            student_id: app.student_id,
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            location: slot.location,
            round: data.round,
            selected: false,
          });
        }
        await base44.entities.Application.update(app.id, { status: 'interview_scheduled' });

        // Notify student
        await base44.entities.Notification.create({
          recipient_email: app.student_id,
          recipient_type: 'student',
          type: 'interview_scheduled',
          title: 'Interview Scheduled',
          message: `You have been invited to an interview for "${app.opportunity_title}". Please select a time slot.`,
          opportunity_id: opportunityId,
          application_id: app.id,
          read: false,
          created_date: new Date().toISOString(),
        });
        emailInterviewScheduled({
          studentEmail: app.student_id,
          studentName: app.student_name,
          opportunityTitle: app.opportunity_title,
          organizationName: opportunity?.organization_name || app.organization_name,
          slots: data.slots,
        });
        toast.success('Interview slots sent to student');
      } else if (action === 'rejected') {
        await base44.entities.Application.update(app.id, {
          status: 'rejected',
          rejection_message: data.message || '',
        });
        await base44.entities.Notification.create({
          recipient_email: app.student_id,
          recipient_type: 'student',
          type: 'application_rejected',
          title: 'Application Update',
          message: data.message
            ? `Your application for "${app.opportunity_title}" was not selected. Reason: ${data.message}`
            : `Your application for "${app.opportunity_title}" was not selected.`,
          opportunity_id: opportunityId,
          application_id: app.id,
          read: false,
          created_date: new Date().toISOString(),
        });
        emailApplicationRejected({
          studentEmail: app.student_id,
          studentName: app.student_name,
          opportunityTitle: app.opportunity_title,
          organizationName: opportunity?.organization_name || app.organization_name,
          reason: data.message,
        });
        toast.success('Applicant rejected');
      } else if (action === 'hired') {
        await base44.entities.Application.update(app.id, { status: 'hired' });
        await base44.entities.Notification.create({
          recipient_email: app.student_id,
          recipient_type: 'student',
          type: 'application_hired',
          title: 'Congratulations!',
          message: `You have been selected for "${app.opportunity_title}"! The organisation will contact you with next steps.`,
          opportunity_id: opportunityId,
          application_id: app.id,
          read: false,
          created_date: new Date().toISOString(),
        });
        emailApplicationHired({
          studentEmail: app.student_id,
          studentName: app.student_name,
          opportunityTitle: app.opportunity_title,
          organizationName: opportunity?.organization_name || app.organization_name,
        });
        toast.success('Applicant hired!');
      } else {
        // Generic stage update (under_review, shortlisted, interview_completed)
        await base44.entities.Application.update(app.id, { status: action });

        const stageLabel = STAGES[action]?.label || action;
        await base44.entities.Notification.create({
          recipient_email: app.student_id,
          recipient_type: 'student',
          type: 'application_status_update',
          title: 'Application Update',
          message: `Your application for "${app.opportunity_title}" has been updated to: ${stageLabel}.`,
          opportunity_id: opportunityId,
          application_id: app.id,
          read: false,
          created_date: new Date().toISOString(),
        });
        toast.success(`Status updated to ${stageLabel}`);
      }
      queryClient.invalidateQueries({ queryKey: ['applications', opportunityId] });
      queryClient.invalidateQueries({ queryKey: ['interviewSlots', opportunityId] });
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Filter
  const filteredApps = filterStage === 'all'
    ? applications
    : applications.filter(a => (a.status || 'applied') === filterStage);

  // Count by stage
  const stageCounts = {};
  applications.forEach(a => {
    const s = a.status || 'applied';
    stageCounts[s] = (stageCounts[s] || 0) + 1;
  });

  if (!opportunity) return (
    <div>
      <PageHeader title="Applicants" onBack={() => navigate(createPageUrl('OrgDashboard'))} />
      <div className="max-w-4xl mx-auto px-6 py-8"><ListSkeleton count={3} /></div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={opportunity.title}
        subtitle={`${applications.length} applicant${applications.length !== 1 ? 's' : ''}`}
        onBack={() => navigate(createPageUrl('OrgDashboard'))}
      />

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Stage filter pills */}
        {applications.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 hide-scrollbar">
            <button
              onClick={() => setFilterStage('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterStage === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({applications.length})
            </button>
            {Object.entries(STAGES)
              .filter(([key]) => stageCounts[key])
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setFilterStage(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filterStage === key ? 'bg-gray-900 text-white' : `${info.color} hover:opacity-80`
                  }`}
                >
                  {info.label} ({stageCounts[key]})
                </button>
              ))}
          </div>
        )}

        {/* Applicant cards */}
        <div className="space-y-3">
          {filteredApps.map(app => (
            <ApplicantCard
              key={app.id}
              app={app}
              profile={getStudentProfile(app.student_id)}
              interviewSlots={interviewSlots}
              onAction={handleAction}
              opportunityTitle={opportunity.title}
              currentUserEmail={user?.email}
              currentUserName={user?.full_name || 'Organisation'}
            />
          ))}
        </div>

        {applications.length === 0 && (
          <EmptyState icon={Users} title="No applications yet" subtitle="Applicants will appear here once students apply" />
        )}

        {applications.length > 0 && filteredApps.length === 0 && (
          <EmptyState icon={Users} title="No applicants in this stage" subtitle="Try a different filter" />
        )}
      </div>
    </div>
  );
}
