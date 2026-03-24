import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { sendBrowserNotification } from '../utils/browserNotify';
import { emailNewApplication, emailApplicationConfirmation, emailParentNotification } from '../utils/emailService';

export default function ApplicationFormModal({ 
  open, 
  onClose, 
  opportunity, 
  studentProfile, 
  user,
  onSuccess 
}) {
  const [answers, setAnswers] = useState({});
  const [parentInfo, setParentInfo] = useState({
    parent_guardian_name: '',
    parent_guardian_email: '',
    parent_guardian_phone: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate PDF with jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      let y = 20;
      
      // Title
      doc.setFontSize(18);
      doc.text('Application Form', 20, y);
      y += 10;
      
      // Opportunity info
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(opportunity.title, 20, y);
      y += 5;
      doc.text(opportunity.organization_name, 20, y);
      y += 5;
      doc.text(`Applied: ${new Date().toLocaleDateString()}`, 20, y);
      y += 15;
      
      // Student Info
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Student Information', 20, y);
      y += 8;
      
      doc.setFontSize(10);
      const displayName = studentProfile?.full_name || user.full_name;
      doc.text(`Name: ${displayName}`, 20, y);
      y += 6;
      doc.text(`Email: ${user.email}`, 20, y);
      y += 6;
      
      // Parent/Guardian Info
      if (parentInfo.parent_guardian_name || parentInfo.parent_guardian_email || parentInfo.parent_guardian_phone) {
        y += 3;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Parent/Guardian Information', 20, y);
        y += 6;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        if (parentInfo.parent_guardian_name) {
          doc.text(`Name: ${parentInfo.parent_guardian_name}`, 20, y);
          y += 6;
        }
        if (parentInfo.parent_guardian_email) {
          doc.text(`Email: ${parentInfo.parent_guardian_email}`, 20, y);
          y += 6;
        }
        if (parentInfo.parent_guardian_phone) {
          doc.text(`Phone: ${parentInfo.parent_guardian_phone}`, 20, y);
          y += 6;
        }
      }
      
      if (studentProfile) {
        if (studentProfile.age) {
          doc.text(`Age: ${studentProfile.age}`, 20, y);
          y += 6;
        }
        if (studentProfile.school) {
          doc.text(`School: ${studentProfile.school}`, 20, y);
          y += 6;
        }
        if (studentProfile.bio) {
          doc.text('Bio:', 20, y);
          y += 5;
          const bioLines = doc.splitTextToSize(studentProfile.bio, 170);
          doc.text(bioLines, 20, y);
          y += bioLines.length * 5 + 3;
        }
        if (studentProfile.skills && studentProfile.skills.length > 0) {
          doc.text(`Skills: ${studentProfile.skills.join(', ')}`, 20, y);
          y += 6;
        }
        if (studentProfile.interests && studentProfile.interests.length > 0) {
          doc.text(`Interests: ${studentProfile.interests.join(', ')}`, 20, y);
          y += 6;
        }
      }
      
      // Custom Questions
      if (opportunity.application_questions && opportunity.application_questions.length > 0) {
        y += 5;
        doc.setFontSize(14);
        doc.text('Application Questions', 20, y);
        y += 8;
        
        doc.setFontSize(10);
        opportunity.application_questions.forEach((q, idx) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          doc.setFont(undefined, 'bold');
          const questionText = `${idx + 1}. ${q.question}${q.required ? ' *' : ''}`;
          const qLines = doc.splitTextToSize(questionText, 170);
          doc.text(qLines, 20, y);
          y += qLines.length * 5 + 3;
          
          doc.setFont(undefined, 'normal');
          const answer = answers[q.id] || 'No answer provided';
          const aLines = doc.splitTextToSize(answer, 170);
          doc.text(aLines, 20, y);
          y += aLines.length * 5 + 8;
        });
      }
      
      // Convert to blob and upload
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], `application_${user.full_name}_${Date.now()}.pdf`, { type: 'application/pdf' });
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Upload resume if provided
      let resumeUrl = null;
      if (resumeFile) {
        const { file_url: resume_url } = await base44.integrations.Core.UploadFile({ file: resumeFile });
        resumeUrl = resume_url;
      }
      
      // Create application
      await base44.entities.Application.create({
        student_id: user.email,
        student_name: studentProfile?.full_name || user.full_name,
        opportunity_id: opportunity.id,
        opportunity_title: opportunity.title,
        organization_name: opportunity.organization_name,
        created_by_org: opportunity.created_by,
        status: 'applied',
        application_file_url: file_url,
        resume_url: resumeUrl,
        parent_guardian_name: parentInfo.parent_guardian_name,
        parent_guardian_email: parentInfo.parent_guardian_email,
        parent_guardian_phone: parentInfo.parent_guardian_phone
      });
      
      // Create notification for the organization
      await base44.entities.Notification.create({
        recipient_email: opportunity.created_by,
        recipient_type: 'org',
        type: 'new_application',
        title: 'New Application Received',
        message: `${studentProfile?.full_name || user.full_name} has applied for "${opportunity.title}".`,
        opportunity_id: opportunity.id,
        read: false,
        created_date: new Date().toISOString()
      });

      // Create confirmation notification for the student
      await base44.entities.Notification.create({
        recipient_email: user.email,
        recipient_type: 'student',
        type: 'application_confirmed',
        title: 'Application Submitted',
        message: `Your application for "${opportunity.title}" at ${opportunity.organization_name} has been submitted successfully. You will be notified when the organization reviews your application.`,
        opportunity_id: opportunity.id,
        read: false,
        created_date: new Date().toISOString()
      });

      // Browser push notification for the student
      sendBrowserNotification(
        'Application Submitted',
        `Your application for "${opportunity.title}" at ${opportunity.organization_name} has been sent.`
      );

      // Email notifications
      emailNewApplication({
        orgEmail: opportunity.created_by,
        orgName: opportunity.organization_name,
        studentName: studentProfile?.full_name || user.full_name,
        opportunityTitle: opportunity.title,
      });
      emailApplicationConfirmation({
        studentEmail: user.email,
        studentName: studentProfile?.full_name || user.full_name,
        opportunityTitle: opportunity.title,
        organizationName: opportunity.organization_name,
      });
      // Notify parent if under-18 and parent email provided
      if (parentInfo.parent_guardian_email) {
        emailParentNotification({
          parentEmail: parentInfo.parent_guardian_email,
          parentName: parentInfo.parent_guardian_name,
          studentName: studentProfile?.full_name || user.full_name,
          opportunityTitle: opportunity.title,
          organizationName: opportunity.organization_name,
        });
      }

      toast.success('Application submitted!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const questions = opportunity?.application_questions || [];
  const hasQuestions = questions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to {opportunity?.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Info Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Your Information</h3>
            <p className="text-sm text-gray-600">
              {studentProfile?.full_name || user?.full_name} • {user?.email}
              {studentProfile?.school && ` • ${studentProfile.school}`}
            </p>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume">
              CV / Resume <span className="text-red-500">*</span>
            </Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              required
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">Upload your CV or Resume in PDF format (required)</p>
          </div>

          {/* Parent/Guardian Information */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Parent/Guardian Information <span className="text-red-500">*</span></h3>
              <p className="text-xs text-gray-500 mt-1">Required for all applicants under 19. Your parent/guardian will be notified by email.</p>
            </div>
            <div>
              <Label htmlFor="parent_name">Parent/Guardian Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="parent_name"
                required
                value={parentInfo.parent_guardian_name}
                onChange={(e) => setParentInfo({ ...parentInfo, parent_guardian_name: e.target.value })}
                placeholder="Enter parent/guardian name"
              />
            </div>
            <div>
              <Label htmlFor="parent_email">Parent/Guardian Email <span className="text-red-500">*</span></Label>
              <Input
                id="parent_email"
                type="email"
                required
                value={parentInfo.parent_guardian_email}
                onChange={(e) => setParentInfo({ ...parentInfo, parent_guardian_email: e.target.value })}
                placeholder="parent@example.com"
              />
            </div>
            <div>
              <Label htmlFor="parent_phone">Parent/Guardian Phone <span className="text-red-500">*</span></Label>
              <Input
                id="parent_phone"
                type="tel"
                required
                value={parentInfo.parent_guardian_phone}
                onChange={(e) => setParentInfo({ ...parentInfo, parent_guardian_phone: e.target.value })}
                placeholder="+852 1234 5678"
              />
            </div>
          </div>

          {/* Custom Questions */}
          {hasQuestions && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Application Questions</h3>
              {questions.map((q) => (
                <div key={q.id}>
                  <Label>
                    {q.question}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {q.type === 'text' && (
                    <Input
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      required={q.required}
                      placeholder="Your answer"
                    />
                  )}
                  {q.type === 'textarea' && (
                    <Textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      required={q.required}
                      placeholder="Your answer"
                      rows={4}
                    />
                  )}
                  {q.type === 'multiple_choice' && (
                    <select
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      required={q.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select an option</option>
                      {(q.options || []).map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}

          {!hasQuestions && (
            <p className="text-sm text-gray-600">
              No additional questions required. Your profile information will be submitted with your application.
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-500 hover:bg-red-600">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}