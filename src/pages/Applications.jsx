import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  FileText, ExternalLink, ClipboardList, Calendar,
  CheckCircle2, Circle, Clock, XCircle, ChevronDown, ChevronUp,
  Download, LogOut
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '../components/EmptyState';
import MessageThread from '@/components/MessageThread';
import { toast } from 'sonner';
import { emailInterviewSlotSelected } from '../utils/emailService';

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

const STAGES_ORDER = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_completed', 'hired'];
const STAGE_LABELS = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview',
  interview_completed: 'Interview Done',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};
const STAGE_COLORS = {
  applied: 'bg-gray-100 text-gray-800',
  under_review: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interview_scheduled: 'bg-amber-100 text-amber-800',
  interview_completed: 'bg-teal-100 text-teal-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-500',
};

function generateICS(slot, opportunityTitle, orgName) {
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
    `SUMMARY:Interview - ${opportunityTitle}`,
    `DESCRIPTION:Interview with ${orgName} for ${opportunityTitle}`,
    slot.location ? `LOCATION:${slot.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-${opportunityTitle.replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function ProgressTracker({ currentStage }) {
  if (currentStage === 'rejected' || currentStage === 'withdrawn') {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          currentStage === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <XCircle className={`w-4 h-4 ${currentStage === 'rejected' ? 'text-red-500' : 'text-gray-400'}`} />
        </div>
        <span className={`text-sm font-medium ${currentStage === 'rejected' ? 'text-red-600' : 'text-gray-500'}`}>
          {STAGE_LABELS[currentStage]}
        </span>
      </div>
    );
  }

  const currentIdx = STAGES_ORDER.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1 py-2 overflow-x-auto">
      {STAGES_ORDER.map((stage, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;

        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                isPast ? 'bg-green-100' : isCurrent ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {isPast ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-red-500" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-gray-300" />
                )}
              </div>
              <span className={`text-[10px] leading-tight text-center whitespace-nowrap ${
                isPast ? 'text-green-600 font-medium' : isCurrent ? 'text-red-600 font-semibold' : 'text-gray-400'
              }`}>
                {STAGE_LABELS[stage]}
              </span>
            </div>
            {idx < STAGES_ORDER.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-3 mt-[-12px] ${isPast ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ApplicationCard({ app, interviewSlots, onWithdraw, onSelectSlot, onUnselectSlot, queryClient, currentUserEmail, currentUserName }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const stage = app.status || 'applied';
  const isTerminal = stage === 'hired' || stage === 'rejected' || stage === 'withdrawn';

  // Interview slots for this application
  const appSlots = interviewSlots.filter(s => s.application_id === app.id);
  const currentRound = appSlots.length > 0 ? Math.max(...appSlots.map(s => s.round || 1)) : 0;
  const currentSlots = appSlots.filter(s => (s.round || 1) === currentRound);
  const selectedSlot = currentSlots.find(s => s.selected);
  const needsSelection = stage === 'interview_scheduled' && !selectedSlot && currentSlots.length > 0;

  return (
    <Card className={`bg-white rounded-2xl shadow-sm overflow-hidden ${needsSelection ? 'ring-2 ring-amber-300' : ''}`}>
      <div className="p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 mb-0.5">{app.opportunity_title}</h3>
            <p className="text-gray-500 text-sm">{app.organization_name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Badge className={STAGE_COLORS[stage] || 'bg-gray-100 text-gray-800'}>
              {STAGE_LABELS[stage] || stage}
            </Badge>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        <ProgressTracker currentStage={stage} />

        <p className="text-xs text-gray-400 mt-1">
          Submitted {app.created_date ? format(new Date(app.created_date), 'MMM d, yyyy') : ''}
        </p>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 space-y-4">
          {/* Interview slot selection */}
          {needsSelection && (
            <div className="pt-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <p className="text-sm font-semibold text-amber-800">
                  Select an interview time {currentRound > 1 ? `(Round ${currentRound})` : ''}
                </p>
                <div className="space-y-2">
                  {currentSlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => onSelectSlot(app, slot)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors text-left"
                    >
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-sm text-gray-800">
                        {format(new Date(slot.date), 'EEEE, MMM d, yyyy')} · {slot.start_time} – {slot.end_time}
                        {slot.location && <span className="text-gray-500"> · {slot.location}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Confirmed interview */}
          {selectedSlot && (
            <div className="pt-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
                <p className="text-sm font-semibold text-green-800">
                  Interview confirmed {currentRound > 1 ? `(Round ${currentRound})` : ''}
                </p>
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(selectedSlot.date), 'EEEE, MMM d, yyyy')} · {selectedSlot.start_time} – {selectedSlot.end_time}
                  {selectedSlot.location && ` · ${selectedSlot.location}`}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-300"
                    onClick={() => generateICS(selectedSlot, app.opportunity_title, app.organization_name)}
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Add to Calendar (.ics)
                  </Button>
                  {stage === 'interview_scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-500 border-gray-300 hover:text-red-600 hover:border-red-300"
                      onClick={() => onUnselectSlot(app, selectedSlot)}
                    >
                      Change Selection
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rejection reason */}
          {stage === 'rejected' && app.rejection_message && (
            <div className="pt-4">
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs font-medium text-red-600 mb-0.5">Reason</p>
                <p className="text-sm text-red-700">{app.rejection_message}</p>
              </div>
            </div>
          )}

          {/* Hired message */}
          {stage === 'hired' && (
            <div className="pt-4">
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  Congratulations! You've been selected. The organisation will contact you with next steps.
                </p>
              </div>
            </div>
          )}

          {/* Messaging */}
          <MessageThread
            applicationId={app.id}
            currentUserEmail={currentUserEmail}
            currentUserName={currentUserName}
            otherUserName={app.organization_name || 'Organisation'}
            otherUserEmail={app.created_by_org || ''}
            recipientType="org"
          />

          {/* Documents & actions */}
          <div className="flex gap-2 flex-wrap pt-2">
            {app.application_file_url && (
              <Button variant="outline" size="sm" onClick={() => openFileUrl(app.application_file_url)}>
                <FileText className="w-4 h-4 mr-1" /> Application
              </Button>
            )}
            {app.resume_url && (
              <Button variant="outline" size="sm" onClick={() => openFileUrl(app.resume_url)}>
                <FileText className="w-4 h-4 mr-1" /> Resume
              </Button>
            )}
            <Button variant="outline" size="sm"
              onClick={() => navigate(createPageUrl('OpportunityDetail') + '?id=' + app.opportunity_id)}>
              <ExternalLink className="w-4 h-4 mr-1" /> View Opportunity
            </Button>

            {!isTerminal && (
              <Button variant="outline" size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 ml-auto"
                disabled={withdrawing}
                onClick={async () => {
                  setWithdrawing(true);
                  await onWithdraw(app);
                  setWithdrawing(false);
                }}>
                <LogOut className="w-4 h-4 mr-1" /> Withdraw
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function Applications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', user?.email],
    queryFn: () => user ? base44.entities.Application.filter({ student_id: user.email }) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: interviewSlots = [] } = useQuery({
    queryKey: ['interviewSlots', 'student', user?.email],
    queryFn: () => user ? base44.entities.InterviewSlot.filter({ student_id: user.email }) : [],
    enabled: !!user,
    initialData: []
  });

  const handleWithdraw = async (app) => {
    try {
      await base44.entities.Application.update(app.id, { status: 'withdrawn' });
      // Notify org
      await base44.entities.Notification.create({
        recipient_email: app.created_by_org || '',
        recipient_type: 'org',
        type: 'application_withdrawn',
        title: 'Application Withdrawn',
        message: `${app.student_name} has withdrawn their application for "${app.opportunity_title}".`,
        opportunity_id: app.opportunity_id,
        application_id: app.id,
        read: false,
        created_date: new Date().toISOString(),
      });
      toast.success('Application withdrawn');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    } catch {
      toast.error('Failed to withdraw');
    }
  };

  const handleSelectSlot = async (app, slot) => {
    try {
      // Mark this slot as selected
      await base44.entities.InterviewSlot.update(slot.id, { selected: true });
      // Notify org
      await base44.entities.Notification.create({
        recipient_email: app.created_by_org || '',
        recipient_type: 'org',
        type: 'interview_slot_selected',
        title: 'Interview Time Selected',
        message: `${app.student_name} selected ${format(new Date(slot.date), 'MMM d')} ${slot.start_time}–${slot.end_time} for "${app.opportunity_title}".`,
        opportunity_id: app.opportunity_id,
        application_id: app.id,
        read: false,
        created_date: new Date().toISOString(),
      });
      emailInterviewSlotSelected({
        orgEmail: app.created_by_org || '',
        orgName: app.organization_name,
        studentName: app.student_name,
        opportunityTitle: app.opportunity_title,
        date: slot.date,
        startTime: slot.start_time,
        endTime: slot.end_time,
        location: slot.location,
      });
      toast.success('Time slot confirmed! Download the .ics file to add it to your calendar.');
      queryClient.invalidateQueries({ queryKey: ['interviewSlots'] });
    } catch {
      toast.error('Failed to select slot');
    }
  };

  const handleUnselectSlot = async (app, slot) => {
    try {
      await base44.entities.InterviewSlot.update(slot.id, { selected: false });
      // Notify org
      await base44.entities.Notification.create({
        recipient_email: app.created_by_org || '',
        recipient_type: 'org',
        type: 'interview_slot_changed',
        title: 'Interview Time Changed',
        message: `${app.student_name} has unselected their interview time for "${app.opportunity_title}" and needs to pick a new slot.`,
        opportunity_id: app.opportunity_id,
        application_id: app.id,
        read: false,
        created_date: new Date().toISOString(),
      });
      toast.success('Selection cleared. Please choose a new time slot.');
      queryClient.invalidateQueries({ queryKey: ['interviewSlots'] });
    } catch {
      toast.error('Failed to change selection');
    }
  };

  // Sort: active first, then terminal
  const sorted = [...applications].sort((a, b) => {
    const terminalStages = ['hired', 'rejected', 'withdrawn'];
    const aTerminal = terminalStages.includes(a.status);
    const bTerminal = terminalStages.includes(b.status);
    if (aTerminal !== bTerminal) return aTerminal ? 1 : -1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  return (
    <div>
      <PageHeader title="My Applications" />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {applications.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
        )}

        <div className="space-y-3">
          {sorted.map(app => (
            <ApplicationCard
              key={app.id}
              app={app}
              interviewSlots={interviewSlots}
              onWithdraw={handleWithdraw}
              onSelectSlot={handleSelectSlot}
              onUnselectSlot={handleUnselectSlot}
              queryClient={queryClient}
              currentUserEmail={user?.email}
              currentUserName={user?.full_name || 'Student'}
            />
          ))}
        </div>

        {applications.length === 0 && (
          <EmptyState icon={ClipboardList} title="No applications yet" subtitle="Apply to opportunities and track your progress here" />
        )}
      </div>
    </div>
  );
}
