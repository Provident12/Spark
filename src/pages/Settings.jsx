import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/api/firebase.js';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Info, Building2, ChevronRight, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      base44.entities.Organization.filter({ created_by: user.email }).then(orgs => {
        if (orgs.length > 0) setOrganization(orgs[0]);
      }).catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const email = user.email;

      // Delete student profile
      const profiles = await base44.entities.StudentProfile.filter({ created_by: email });
      for (const p of profiles) await base44.entities.StudentProfile.delete(p.id);

      // Delete applications
      const apps = await base44.entities.Application.filter({ student_id: email });
      for (const a of apps) await base44.entities.Application.delete(a.id);

      // Delete saved opportunities
      const saved = await base44.entities.SavedOpportunity.filter({ student_id: email });
      for (const s of saved) await base44.entities.SavedOpportunity.delete(s.id);

      // Delete notifications
      const notifs = await base44.entities.Notification.filter({ recipient_email: email });
      for (const n of notifs) await base44.entities.Notification.delete(n.id);

      // Delete messages
      const sentMsgs = await base44.entities.Message.filter({ sender_email: email });
      for (const m of sentMsgs) await base44.entities.Message.delete(m.id);
      const recvMsgs = await base44.entities.Message.filter({ recipient_email: email });
      for (const m of recvMsgs) await base44.entities.Message.delete(m.id);

      // Delete interview slots
      const slots = await base44.entities.InterviewSlot.filter({ student_id: email });
      for (const s of slots) await base44.entities.InterviewSlot.delete(s.id);

      // If org user, delete org and its opportunities
      if (organization) {
        const opps = await base44.entities.Opportunity.filter({ created_by: email });
        for (const o of opps) await base44.entities.Opportunity.delete(o.id);
        await base44.entities.Organization.delete(organization.id);
      }

      toast.success('Your account data has been deleted.');
      await signOut(auth);
      window.location.href = '/';
    } catch {
      toast.error('Failed to delete some data. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {/* Account Info */}
        {user && (
          <Card className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Account</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{user.full_name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Badge className={
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }>
                {user.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
            </div>
          </Card>
        )}

        {/* Edit Profile — for student users */}
        {user && !organization && (
          <Card
            className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all border-l-4 border-l-red-400"
            onClick={() => navigate(createPageUrl('ProfileBuilder'))}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Edit Profile</p>
                  <p className="text-sm text-gray-500">Update your name, interests, skills, and personal statement</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        )}

        {/* Edit Organization Details — only for org users */}
        {organization && (
          <Card
            className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(createPageUrl('OrgRegistration') + '?id=' + organization.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">Organization Details</p>
                  <p className="text-sm text-gray-500">Edit your organization info</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        )}

        {/* About */}
        <Card className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">About</h3>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Spark v1.0</p>
              <p className="text-sm text-gray-500">Connecting Hong Kong students with internships and volunteering opportunities.</p>
            </div>
          </div>
        </Card>

        {/* Log Out */}
        <Card
          className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={handleLogout}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-red-600">Log Out</span>
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
        </Card>

        {/* Delete Account / Data */}
        {user && (
          <Card className="bg-white rounded-2xl shadow-sm p-5 mt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Privacy & Data</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              You can request deletion of your account and all associated data. This action is permanent and cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete My Account & Data
              </Button>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Are you sure?</p>
                    <p className="text-xs text-red-600 mt-1 leading-relaxed">
                      This will permanently delete your profile, applications, saved opportunities, messages, notifications, and all other data associated with your account. You will be logged out immediately.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                    disabled={deleting}
                    onClick={handleDeleteAccount}
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
