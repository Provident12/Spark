import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';
import { Upload, X, FileText } from 'lucide-react';

export default function OrgRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);
  const [wasRejected, setWasRejected] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    contact_name: '',
    contact_email: '',
    phone: '',
    job_title: '',
    mentor_linkedin: ''
  });
  const [verificationDocs, setVerificationDocs] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    if (editId) {
      base44.entities.Organization.get(editId).then(org => {
        setFormData({
          name: org.name || '',
          description: org.description || '',
          website: org.website || '',
          contact_name: org.contact_name || '',
          contact_email: org.contact_email || '',
          phone: org.phone || '',
          job_title: org.job_title || '',
          mentor_linkedin: org.mentor_linkedin || ''
        });
        setVerificationDocs(org.verification_docs || []);
        if (org.verification_status === 'rejected') setWasRejected(true);
        setInitialLoading(false);
      }).catch(() => {
        toast.error('Failed to load organization details');
        setInitialLoading(false);
      });
    }
  }, [editId]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (editId) {
        const updateData = { ...formData, verification_docs: verificationDocs };
        if (wasRejected) {
          updateData.verification_status = 'pending';
          updateData.rejection_reason = '';
        }
        await base44.entities.Organization.update(editId, updateData);
        toast.success(wasRejected ? 'Organization resubmitted for verification' : 'Organization details updated');
      } else {
        await base44.entities.Organization.create({
          ...formData,
          verification_status: 'pending',
          verification_docs: verificationDocs
        });
        toast.success('Registration submitted for verification');
      }
      navigate(createPageUrl('OrgDashboard'));
    } catch (err) {
      toast.error(editId ? 'Failed to update details' : 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  const backRoute = editId ? createPageUrl('OrgDashboard') : createPageUrl('Landing');
  const pageTitle = editId ? 'Edit Organization' : 'Register Organization';

  if (initialLoading) {
    return (
      <div>
        <PageHeader title={pageTitle} onBack={() => navigate(backRoute)} />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={pageTitle} onBack={() => navigate(backRoute)} />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Card className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Organization Details</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {editId
                ? 'Update your organisation information below.'
                : 'Tell us about your organisation. Your submission will be reviewed by our admin team.'}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Organization Name <span className="text-red-500">*</span></Label>
            <Input
              placeholder="e.g. Green Future Initiative"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 h-11"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              placeholder="Tell us about your organization and mission..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 min-h-28"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Website</Label>
            <Input
              placeholder="https://yourorganization.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="mt-1 h-11"
            />
          </div>
        </Card>

        <Card className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Contact Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Jane Smith"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="mt-1 h-11"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Job Title <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Program Manager, Director"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="mt-1 h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Contact Email <span className="text-red-500">*</span></Label>
                {user?.email && formData.contact_email !== user.email && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, contact_email: user.email })}
                    className="text-xs text-red-500 font-medium hover:underline"
                  >
                    Use login email
                  </button>
                )}
              </div>
              <Input
                type="email"
                placeholder="contact@yourorganization.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="mt-1 h-11"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                placeholder="+852 1234 5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 h-11"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Mentor LinkedIn Profile</Label>
            <Input
              placeholder="https://www.linkedin.com/in/your-profile (optional)"
              value={formData.mentor_linkedin}
              onChange={(e) => setFormData({ ...formData, mentor_linkedin: e.target.value })}
              className="mt-1 h-11"
            />
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Please include the LinkedIn profile of the person who will be mentoring students.
              <span className="text-gray-600 font-medium"> We can only list roles where the mentor is over 18.</span>
            </p>
          </div>

          {/* Verification Documents */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Verification Documents</Label>
            <p className="text-xs text-gray-500 mt-1 mb-3 leading-relaxed">
              Upload proof of legitimacy such as business registration, school letterhead, government registration, or any official document that verifies your organization.
            </p>

            {verificationDocs.length > 0 && (
              <div className="space-y-2 mb-3">
                {verificationDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-700 truncate flex-1">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => setVerificationDocs(verificationDocs.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{uploading ? 'Uploading...' : 'Upload document'}</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const result = await base44.integrations.Core.UploadFile({ file });
                    setVerificationDocs([...verificationDocs, { name: file.name, url: result.file_url, type: file.type }]);
                  } catch {
                    toast.error('Failed to upload document');
                  } finally {
                    setUploading(false);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.contact_name || !formData.job_title || !formData.contact_email || !formData.phone}
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-full text-base font-semibold"
            >
              {loading
                ? (wasRejected ? 'Resubmitting...' : editId ? 'Saving...' : 'Submitting...')
                : (wasRejected ? 'Resubmit for Verification' : editId ? 'Save Changes' : 'Submit for Verification')}
            </Button>
          </div>
        </Card>

        {!editId && (
          <div className="mt-6 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
            <p className="text-sm text-gray-500 leading-relaxed">
              <span className="text-gray-700 font-medium">Verification process</span> — Your organisation will be reviewed by our admin team. You'll receive a notification once approved. This usually takes 1–2 business days.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
