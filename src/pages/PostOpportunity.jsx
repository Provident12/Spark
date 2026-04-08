import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import ApplicationQuestionBuilder from '../components/ApplicationQuestionBuilder';
import SchoolSelector from '../components/SchoolSelector';
import LocationSelector from '../components/LocationSelector';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

const categories = ['Finance & Banking', 'Technology', 'Healthcare', 'Law & Policy', 'Education & Tutoring', 'Hospitality & Tourism', 'Media & Journalism', 'Arts & Culture', 'Environment & Conservation', 'Social Services & NGO', 'Government & Public Sector', 'Sports & Recreation', 'Marketing & Advertising', 'Architecture & Design', 'Retail & Commerce', 'Logistics & Trade', 'Food & Beverage', 'Animal Welfare', 'Community Service', 'Science & Research', 'Real Estate & Property', 'Startup & Entrepreneurship'];

export default function PostOpportunity() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [orgLoaded, setOrgLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editStatus, setEditStatus] = useState(null);
  const [adminFeedback, setAdminFeedback] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    type: 'Internship',
    category: '',
    location: '',
    is_remote: false,
    duration: '',
    deadline: null,
    description: '',
    responsibilities: '',
    requirements: '',
    about_organization: '',
    is_paid: false,
    min_age: '',
    max_age: '',
    application_questions: [],
    restricted_schools: []
  });
  const [schoolRestrictionEnabled, setSchoolRestrictionEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      base44.entities.Organization.filter({ created_by: user.email }).then(orgs => {
        if (orgs.length > 0) {
          setOrganization(orgs[0]);

          if (editId) {
            base44.entities.Opportunity.filter({ id: editId }).then(opps => {
              if (opps.length > 0) {
                const opp = opps[0];
                setFormData({
                  title: opp.title || '',
                  type: opp.type || 'Internship',
                  category: opp.category || '',
                  location: opp.location || '',
                  is_remote: opp.is_remote || false,
                  duration: opp.duration || '',
                  deadline: opp.deadline ? new Date(opp.deadline) : null,
                  description: opp.description || '',
                  responsibilities: opp.responsibilities || '',
                  requirements: opp.requirements || '',
                  about_organization: opp.about_organization || '',
                  is_paid: opp.is_paid || false,
                  min_age: opp.min_age || '',
                  max_age: opp.max_age || '',
                  application_questions: opp.application_questions || [],
                  restricted_schools: opp.restricted_schools || []
                });
                setSchoolRestrictionEnabled((opp.restricted_schools || []).length > 0);
                setEditStatus(opp.status);
                setAdminFeedback(opp.admin_feedback || '');
              }
            });
          }
        }
        setOrgLoaded(true);
      });
    }
  }, [user, editId]);

  const handleSaveDraft = async () => {
    if (!organization) return;

    setLoading(true);
    const data = {
      ...formData,
      organization_id: organization.id,
      organization_name: organization.name,
      status: 'draft',
      deadline: formData.deadline ? format(formData.deadline, 'yyyy-MM-dd') : null
    };

    if (editId) {
      await base44.entities.Opportunity.update(editId, data);
    } else {
      await base44.entities.Opportunity.create(data);
    }

    setLoading(false);
    toast.success('Draft saved');
    navigate(createPageUrl('OrgDashboard'));
  };

  const handleSubmitForReview = async () => {
    if (!organization) return;

    setLoading(true);
    const data = {
      ...formData,
      organization_id: organization.id,
      organization_name: organization.name,
      status: 'pending',
      deadline: formData.deadline ? format(formData.deadline, 'yyyy-MM-dd') : null
    };

    if (editId) {
      await base44.entities.Opportunity.update(editId, data);
    } else {
      await base44.entities.Opportunity.create(data);
    }

    setLoading(false);
    toast.success('Opportunity submitted for review');
    navigate(createPageUrl('OrgDashboard'));
  };

  if (!orgLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!organization) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold mb-4">No Organization Found</h1>
        <p className="text-gray-600 mb-6 text-center">Please register your organization first</p>
        <Button onClick={() => navigate(createPageUrl('OrgRegistration'))} className="bg-red-500 hover:bg-red-600">
          Register Organization
        </Button>
      </div>
    );
  }

  if (organization.verification_status !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-md">
          <div className="w-20 h-20 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verification Required</h1>
          <p className="text-gray-600 mb-4">
            Your organization must be verified before you can post opportunities. Your submission is currently under review by our admin team.
          </p>
          {organization.verification_status === 'rejected' && organization.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-red-800"><strong>Rejection reason:</strong> {organization.rejection_reason}</p>
            </div>
          )}
          <Button onClick={() => navigate(createPageUrl('OrgDashboard'))} className="bg-red-500 hover:bg-red-600">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Post Opportunity" onBack={() => navigate(createPageUrl('OrgDashboard'))} />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Rejection feedback banner */}
        {editStatus === 'rejected' && (
          <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm font-medium text-red-800 mb-1">This opportunity was not approved</p>
            {adminFeedback && (
              <p className="text-sm text-red-700 leading-relaxed">
                <span className="font-medium">Admin feedback:</span> {adminFeedback}
              </p>
            )}
            <p className="text-xs text-red-600 mt-2">Please address the feedback, then resubmit for review.</p>
          </div>
        )}

        {/* Basic Info */}
        <Card className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          {/* Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Role Title</Label>
            <Input
              placeholder="e.g. Marketing Intern"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 h-11"
            />
          </div>

          {/* Type */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Type</Label>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Internship' })}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.type === 'Internship'
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                Internship
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Volunteering' })}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.type === 'Volunteering'
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                Volunteering
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Category</Label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger className="mt-1 h-11">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <LocationSelector
              value={formData.location || 'all'}
              onChange={(val) => setFormData({ ...formData, location: val === 'all' ? '' : val })}
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_remote: !formData.is_remote })}
              className={`mt-2 flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium cursor-pointer ${
                formData.is_remote
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                formData.is_remote ? 'border-red-500 bg-red-500' : 'border-gray-300'
              }`}>
                {formData.is_remote && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              This role can be done remotely
            </button>
          </div>

          {/* Duration & Deadline side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Duration</Label>
              <Input
                placeholder="e.g. 3 months"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Application Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mt-1 h-11">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? format(formData.deadline, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => setFormData({ ...formData, deadline: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Compensation */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Compensation</Label>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_paid: false })}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  !formData.is_paid
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                Unpaid
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_paid: true })}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.is_paid
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                Paid
              </button>
            </div>
          </div>
        </Card>

        {/* Role Details */}
        <Card className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Role Details</h2>

          <div>
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              placeholder="Describe the role, responsibilities, and what students will learn..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 min-h-28"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Responsibilities (one per line)</Label>
            <Textarea
              placeholder="List responsibilities, one per line"
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              className="mt-1 min-h-28"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Requirements (one per line)</Label>
            <Textarea
              placeholder="List any skills or qualifications needed..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="mt-1 min-h-28"
            />
          </div>
        </Card>

        {/* Eligibility */}
        <Card className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Eligibility</h2>

          {/* Age Requirement */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Age Requirement</Label>
            <div className="flex gap-3 mt-1">
              <Select value={formData.min_age ? String(formData.min_age) : 'none'} onValueChange={(val) => setFormData({ ...formData, min_age: val === 'none' ? '' : Number(val) })}>
                <SelectTrigger className="flex-1 h-11">
                  <SelectValue placeholder="Min age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No minimum</SelectItem>
                  {[13, 14, 15, 16, 17, 18, 19].map(age => (
                    <SelectItem key={age} value={String(age)}>{age} years</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="flex items-center text-gray-400 text-sm">to</span>
              <Select value={formData.max_age ? String(formData.max_age) : 'none'} onValueChange={(val) => setFormData({ ...formData, max_age: val === 'none' ? '' : Number(val) })}>
                <SelectTrigger className="flex-1 h-11">
                  <SelectValue placeholder="Max age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No maximum</SelectItem>
                  {[13, 14, 15, 16, 17, 18, 19].map(age => (
                    <SelectItem key={age} value={String(age)}>{age} years</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* School Restriction */}
          <div>
            <button
              type="button"
              onClick={() => {
                const next = !schoolRestrictionEnabled;
                setSchoolRestrictionEnabled(next);
                if (!next) setFormData({ ...formData, restricted_schools: [] });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium cursor-pointer ${
                schoolRestrictionEnabled
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                schoolRestrictionEnabled ? 'border-red-500 bg-red-500' : 'border-gray-300'
              }`}>
                {schoolRestrictionEnabled && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              Restrict to specific schools
            </button>
            {schoolRestrictionEnabled && (
              <div className="mt-2">
                <SchoolSelector
                  selectedSchools={formData.restricted_schools}
                  onChange={(schools) => setFormData({ ...formData, restricted_schools: schools })}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Application Questions */}
        <Card className="bg-white rounded-2xl shadow-md p-6">
          <ApplicationQuestionBuilder
            questions={formData.application_questions}
            onChange={(questions) => setFormData({ ...formData, application_questions: questions })}
          />
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-full text-base"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            Save Draft
          </Button>
          <Button
            className="flex-1 h-12 rounded-full bg-red-500 hover:bg-red-600 text-base"
            onClick={handleSubmitForReview}
            disabled={loading}
          >
            {editStatus === 'rejected' ? 'Resubmit for Review' : 'Submit for Review'}
          </Button>
        </div>
      </div>
    </div>
  );
}