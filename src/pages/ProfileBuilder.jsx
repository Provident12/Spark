import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, Check, Plus, X, ChevronsUpDown,
  DollarSign, Cpu, Stethoscope, Scale, GraduationCap, Hotel, Megaphone,
  Palette, Leaf, Heart, Landmark, Trophy, Globe, Ruler, ShoppingBag,
  Ship, UtensilsCrossed, PawPrint, Handshake
} from 'lucide-react';
import { HONG_KONG_SCHOOLS } from '@/components/schools/schoolsList';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const steps = ['Basic', 'Interests', 'Skills', 'Personal Statement'];

const categories = [
  { name: 'Finance & Banking', icon: DollarSign, color: 'border-orange-400 bg-orange-50', iconColor: 'text-orange-500', textColor: 'text-orange-700' },
  { name: 'Technology', icon: Cpu, color: 'border-blue-400 bg-blue-50', iconColor: 'text-blue-500', textColor: 'text-blue-700' },
  { name: 'Healthcare', icon: Stethoscope, color: 'border-pink-400 bg-pink-50', iconColor: 'text-pink-500', textColor: 'text-pink-700' },
  { name: 'Law & Policy', icon: Scale, color: 'border-amber-400 bg-amber-50', iconColor: 'text-amber-500', textColor: 'text-amber-700' },
  { name: 'Education & Tutoring', icon: GraduationCap, color: 'border-green-400 bg-green-50', iconColor: 'text-green-500', textColor: 'text-green-700' },
  { name: 'Hospitality & Tourism', icon: Hotel, color: 'border-yellow-400 bg-yellow-50', iconColor: 'text-yellow-600', textColor: 'text-yellow-700' },
  { name: 'Media & Journalism', icon: Megaphone, color: 'border-indigo-400 bg-indigo-50', iconColor: 'text-indigo-500', textColor: 'text-indigo-700' },
  { name: 'Arts & Culture', icon: Palette, color: 'border-fuchsia-400 bg-fuchsia-50', iconColor: 'text-fuchsia-500', textColor: 'text-fuchsia-700' },
  { name: 'Environment & Conservation', icon: Leaf, color: 'border-emerald-400 bg-emerald-50', iconColor: 'text-emerald-500', textColor: 'text-emerald-700' },
  { name: 'Social Services & NGO', icon: Heart, color: 'border-rose-400 bg-rose-50', iconColor: 'text-rose-500', textColor: 'text-rose-700' },
  { name: 'Government & Public Sector', icon: Landmark, color: 'border-sky-400 bg-sky-50', iconColor: 'text-sky-500', textColor: 'text-sky-700' },
  { name: 'Sports & Recreation', icon: Trophy, color: 'border-lime-400 bg-lime-50', iconColor: 'text-lime-600', textColor: 'text-lime-700' },
  { name: 'Marketing & Advertising', icon: Globe, color: 'border-purple-400 bg-purple-50', iconColor: 'text-purple-500', textColor: 'text-purple-700' },
  { name: 'Architecture & Design', icon: Ruler, color: 'border-slate-400 bg-slate-50', iconColor: 'text-slate-500', textColor: 'text-slate-700' },
  { name: 'Retail & Commerce', icon: ShoppingBag, color: 'border-teal-400 bg-teal-50', iconColor: 'text-teal-500', textColor: 'text-teal-700' },
  { name: 'Logistics & Trade', icon: Ship, color: 'border-cyan-400 bg-cyan-50', iconColor: 'text-cyan-500', textColor: 'text-cyan-700' },
  { name: 'Food & Beverage', icon: UtensilsCrossed, color: 'border-red-400 bg-red-50', iconColor: 'text-red-500', textColor: 'text-red-700' },
  { name: 'Animal Welfare', icon: PawPrint, color: 'border-violet-400 bg-violet-50', iconColor: 'text-violet-500', textColor: 'text-violet-700' },
  { name: 'Community Service', icon: Handshake, color: 'border-teal-400 bg-teal-50', iconColor: 'text-teal-500', textColor: 'text-teal-700' },
  { name: 'Science & Research', icon: Cpu, color: 'border-blue-400 bg-blue-50', iconColor: 'text-blue-500', textColor: 'text-blue-700' },
  { name: 'Real Estate & Property', icon: Landmark, color: 'border-stone-400 bg-stone-50', iconColor: 'text-stone-500', textColor: 'text-stone-700' },
  { name: 'Startup & Entrepreneurship', icon: Trophy, color: 'border-orange-400 bg-orange-50', iconColor: 'text-orange-500', textColor: 'text-orange-700' },
];

const skillGroups = {
  'Languages': [
    'English (Fluent)',
    'English (Conversational)',
    'Cantonese (Native)',
    'Cantonese (Conversational)',
    'Mandarin / Putonghua',
    'French',
    'Spanish',
    'Japanese',
    'Korean',
    'German',
    'Hindi',
    'Portuguese',
    'Italian',
    'Thai',
    'Tagalog / Filipino',
    'Indonesian / Malay',
    'Sign Language (HKSL)',
  ],
  'Digital & Technical': [
    'Microsoft Word',
    'Microsoft Excel',
    'Microsoft PowerPoint',
    'Google Docs / Sheets / Slides',
    'Canva',
    'Adobe Photoshop',
    'Adobe Premiere / Video Editing',
    'Adobe Illustrator',
    'Adobe After Effects',
    'Figma',
    'Python',
    'HTML / CSS',
    'JavaScript',
    'Java',
    'C / C++',
    'R / SPSS (Statistics)',
    'SQL / Databases',
    'App Development',
    'Social Media Management',
    'Data Entry',
    'Data Analysis',
    'Web Design',
    'Photography',
    'Videography',
    'Basic IT Troubleshooting',
    'Typing Speed (50+ WPM)',
    'AI Tools (ChatGPT, etc.)',
    '3D Modelling / CAD',
  ],
  'Communication & Interpersonal': [
    'Public Speaking',
    'Presentation Skills',
    'Written Communication',
    'Teamwork & Collaboration',
    'Leadership',
    'Conflict Resolution',
    'Debating',
    'Mentoring / Peer Tutoring',
    'Active Listening',
    'Negotiation',
    'Cross-Cultural Communication',
    'Interviewing',
    'Emceeing / Hosting',
    'Networking',
    'Persuasion & Influence',
  ],
  'Organisational & Analytical': [
    'Time Management',
    'Event Planning & Coordination',
    'Project Management',
    'Problem Solving',
    'Critical Thinking',
    'Research & Analysis',
    'Attention to Detail',
    'Scheduling & Planning',
    'Filing & Record Keeping',
    'Basic Accounting / Bookkeeping',
    'Survey Design & Data Collection',
    'Report Writing',
    'Multitasking',
    'Inventory Management',
  ],
  'Practical & Service': [
    'Customer Service',
    'First Aid / CPR Certified',
    'Academic Tutoring',
    'Cooking / Food Preparation',
    'Cash Handling / POS Systems',
    'Childcare / Babysitting',
    'Elderly Care / Companionship',
    'Animal Handling',
    'Fundraising',
    'Translation / Interpretation',
    'Tour Guiding',
    'Lifeguard Certified',
    'Sports Coaching',
    'Driving (with licence)',
  ],
  'Creative & Media': [
    'Drawing / Illustration',
    'Graphic Design',
    'Music Performance / Instrument',
    'Writing & Storytelling',
    'Content Creation (TikTok, YouTube, IG)',
    'Dance / Choreography',
    'Acting / Drama',
    'Podcasting',
    'Blogging / Copywriting',
    'UI / UX Design',
    'Fashion / Styling',
    'Film / Documentary Making',
    'Animation',
    'Calligraphy',
  ],
};

const allSkills = Object.values(skillGroups).flat();

const skillColors = [
  'bg-red-100 text-red-800',
  'bg-teal-100 text-teal-800',
  'bg-purple-100 text-purple-800',
  'bg-amber-100 text-amber-800',
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800'
];

export default function ProfileBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    age: null,
    school: '',
    interests: [],
    skills: [],
    bio: '',
    parent_name: '',
    parent_email: '',
  });

  const ages = Array.from({ length: 7 }, (_, i) => 13 + i);

  const [schoolOpen, setSchoolOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        base44.entities.StudentProfile.filter({ created_by: u.email }).then(profiles => {
          if (profiles.length > 0) {
            setProfile(profiles[0]);
            setFormData({
              full_name: profiles[0].full_name || '',
              age: profiles[0].age || null,
              school: profiles[0].school || '',
              interests: profiles[0].interests || [],
              skills: profiles[0].skills || [],
              bio: profiles[0].bio || '',
              parent_name: profiles[0].parent_name || '',
              parent_email: profiles[0].parent_email || '',
            });
          }
          setLoading(false);
        });
      }
    });
  }, [navigate]);

  const calculateCompletion = () => {
    let score = 0;
    if (formData.full_name) score += 25;
    if (formData.age) score += 10;
    if (formData.school) score += 10;
    if (formData.interests.length > 0) score += 20;
    if (formData.skills.length > 0) score += 20;
    if (formData.bio) score += 15;
    return Math.min(100, score);
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSave();
    }
  };

  const handleSave = async () => {
    const completion = calculateCompletion();
    const data = { ...formData, profile_completion: completion };

    if (profile) {
      await base44.entities.StudentProfile.update(profile.id, data);
    } else {
      await base44.entities.StudentProfile.create(data);
    }

    navigate(createPageUrl('StudentHome'));
  };

  const toggleInterest = (name) => {
    if (formData.interests.includes(name)) {
      setFormData({ ...formData, interests: formData.interests.filter(i => i !== name) });
    } else {
      setFormData({ ...formData, interests: [...formData.interests, name] });
    }
  };

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-12 pb-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(createPageUrl('Landing'))}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Build Your Profile</h1>
          <span className="text-gray-400 text-sm font-medium">{currentStep + 1}/{steps.length}</span>
        </div>

        {/* Profile sharing notice */}
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-center">
          <p className="text-sm text-red-600">
            Your profile will be visible to organisations when you apply.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, idx) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  idx < currentStep ? 'bg-red-500 text-white' :
                  idx === currentStep ? 'bg-red-500 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs ${idx <= currentStep ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-1.5" />
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 0 && (
            <Card className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Let's start with the basics</h2>
                <p className="text-sm text-gray-500">Tell us a bit about yourself</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="h-11 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <Select value={formData.age ? String(formData.age) : ''} onValueChange={(val) => setFormData({ ...formData, age: parseInt(val) })}>
                  <SelectTrigger className="h-11 text-base font-normal">
                    <SelectValue placeholder="Select your age" />
                  </SelectTrigger>
                  <SelectContent>
                    {ages.map(age => (
                      <SelectItem key={age} value={String(age)}>{age} years old</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                <Popover open={schoolOpen} onOpenChange={setSchoolOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={schoolOpen}
                      className="w-full justify-between h-11 text-base font-normal"
                    >
                      {formData.school || "Search your school..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search school..." />
                      <CommandList>
                        <CommandEmpty>No school found.</CommandEmpty>
                        <CommandGroup>
                          {HONG_KONG_SCHOOLS.map((school) => (
                            <CommandItem
                              key={school}
                              value={school}
                              onSelect={(currentValue) => {
                                setFormData({ ...formData, school: currentValue === formData.school ? "" : currentValue });
                                setSchoolOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${formData.school === school ? "opacity-100" : "opacity-0"}`}
                              />
                              {school}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Parental consent — required for under 18 */}
              {formData.age && formData.age < 18 && (
                <div className="pt-2 space-y-4">
                  <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-700 leading-relaxed">
                      As you are under 18, we require a parent or guardian's details. Spark may contact them to verify consent.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent / Guardian Name</label>
                    <Input
                      placeholder="Enter parent or guardian's full name"
                      value={formData.parent_name}
                      onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      className="h-11 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent / Guardian Email</label>
                    <Input
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.parent_email}
                      onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                      className="h-11 text-base"
                    />
                  </div>
                </div>
              )}
            </Card>
          )}

          {currentStep === 1 && (
            <Card className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">What are you interested in?</h2>
                <p className="text-sm text-gray-500">Select all that apply — this helps us recommend opportunities for you</p>
              </div>
              {formData.interests.length > 0 && (
                <p className="text-xs text-red-500 font-medium">{formData.interests.length} selected</p>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                {categories.map(({ name, icon: Icon, color, iconColor, textColor }) => {
                  const selected = formData.interests.includes(name);
                  return (
                    <div
                      key={name}
                      onClick={() => toggleInterest(name)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                        selected ? color : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${selected ? iconColor : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium leading-tight ${selected ? textColor : 'text-gray-700'}`}>{name}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">What skills do you have?</h2>
                <p className="text-sm text-gray-500">Search and select from the list below</p>
              </div>

              {/* Searchable skill dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Browse skills</label>
                <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={skillsOpen}
                      className="w-full justify-between h-11 text-base font-normal"
                    >
                      Search and add skills...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search skills..." />
                      <CommandList>
                        <CommandEmpty>No matching skill found.</CommandEmpty>
                        {Object.entries(skillGroups).map(([group, skills]) => (
                          <CommandGroup key={group} heading={group}>
                            {skills.filter(s => !formData.skills.includes(s)).map((skill) => (
                              <CommandItem
                                key={skill}
                                value={skill}
                                onSelect={() => {
                                  addSkill(skill);
                                  setSkillsOpen(false);
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4 text-gray-400" />
                                {skill}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Selected skills */}
              {formData.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Your Skills ({formData.skills.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                      <span
                        key={skill}
                        className={`px-3 py-1.5 rounded-full font-medium text-sm flex items-center gap-1.5 ${skillColors[idx % skillColors.length]}`}
                      >
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:opacity-70">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Write your personal statement</h2>
                <p className="text-sm text-gray-500 leading-relaxed">This will be visible to organisations when you apply. Keep it concise — what drives you, what you're looking for, and what makes you stand out.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Statement</label>
                <Textarea
                  placeholder="e.g. I'm a Year 11 student passionate about environmental sustainability. I'm looking for hands-on experience in conservation or community projects..."
                  value={formData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      setFormData({ ...formData, bio: e.target.value });
                    }
                  }}
                  className="min-h-32 text-base"
                />
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-gray-400">Max 300 characters</p>
                  <p className={`text-xs font-medium ${formData.bio.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.bio.length}/300
                  </p>
                </div>
              </div>
            </Card>
          )}

          <p className="text-center text-xs text-gray-400 tracking-wide">You can update your profile anytime from Settings</p>

          <Button
            onClick={handleNext}
            disabled={currentStep === 0 && formData.age && formData.age < 18 && (!formData.parent_name.trim() || !formData.parent_email.trim())}
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-full text-base font-semibold disabled:opacity-50"
          >
            {currentStep < steps.length - 1 ? 'Continue' : 'Complete Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
}
