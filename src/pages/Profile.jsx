import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Settings, ChevronRight, LogOut, Edit } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { ProfileSkeleton } from '@/components/LoadingSkeleton';

const skillColors = [
  'bg-red-100 text-red-700', 'bg-teal-100 text-teal-700',
  'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700'
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        base44.entities.StudentProfile.filter({ created_by: u.email }).then(profiles => {
          if (profiles.length > 0) {
            setProfile(profiles[0]);
          } else {
            navigate(createPageUrl('ProfileBuilder'));
          }
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  if (!profile) return (
    <div>
      <PageHeader title="Profile" rightAction={
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Settings'))}>
          <Settings className="w-5 h-5 text-gray-600" />
        </Button>
      } />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <ProfileSkeleton />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Profile" rightAction={
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Settings'))}>
          <Settings className="w-5 h-5 text-gray-600" />
        </Button>
      } />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Info */}
        <Card className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
              <p className="text-gray-600">{profile.age && `Age ${profile.age}`}{profile.age && profile.school && ' • '}{profile.school}</p>
            </div>
            <Button
              variant="outline"
              className="text-sm font-medium"
              onClick={() => navigate(createPageUrl('ProfileBuilder'))}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-red-500">{profile.profile_completion}%</span>
            </div>
            <Progress value={profile.profile_completion} className="h-2" />
          </div>

          {profile.bio && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
              <p className="text-gray-600">{profile.bio}</p>
            </div>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span key={interest} className={`px-3 py-1 rounded-full text-sm ${skillColors[idx % skillColors.length]}`}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span key={skill} className={`px-3 py-1 rounded-full text-sm ${skillColors[(idx + 3) % skillColors.length]}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Card
            className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(createPageUrl('Applications'))}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">My Applications</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card
            className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(createPageUrl('Saved'))}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Saved Opportunities</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card
            className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={handleLogout}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-600">Log Out</span>
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}