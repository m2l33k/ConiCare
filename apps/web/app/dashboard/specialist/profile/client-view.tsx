"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Save, User as UserIcon, Briefcase, FileText, Award, DollarSign, Clock } from "lucide-react";

interface ProfileClientViewProps {
  user: User;
  profile: any;
  details: any;
}

export default function ProfileClientView({ user, profile, details }: ProfileClientViewProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    avatar_url: profile?.avatar_url || "",
    specialization: details?.specialization || "",
    bio: details?.bio || "",
    credentials: details?.credentials ? JSON.stringify(details.credentials) : "", // Assuming text for now, or JSON input
    experience_years: details?.experience_years || 0,
    hourly_rate: details?.hourly_rate || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    try {
      // Update profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update specialist_details
      // Note: credentials might need parsing if it's stored as JSONB
      let parsedCredentials = {};
      try {
        parsedCredentials = JSON.parse(formData.credentials || '{}');
      } catch (e) {
        // If not valid JSON, treat as simple object with 'info' key or similar, or just ignore if schema is loose
        // For now, let's assume it's a simple text field in UI but stored as JSONB if the schema requires it. 
        // If the schema is TEXT, then it's fine. If JSONB, we need to be careful.
        // Looking at typical setups, it might be JSONB. Let's wrap it.
        parsedCredentials = { info: formData.credentials }; 
      }

      const { error: detailsError } = await supabase
        .from('specialist_details')
        .upsert({
          id: user.id,
          specialization: formData.specialization,
          specialty: formData.specialization, // Handle legacy/alternate column name
          bio: formData.bio,
          credentials: parsedCredentials,
          experience_years: parseInt(formData.experience_years.toString()),
          hourly_rate: parseFloat(formData.hourly_rate.toString()),
          updated_at: new Date().toISOString(),
        });

      if (detailsError) throw detailsError;

      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
        <p className="text-slate-500 mt-2">Update your personal information and professional details.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
              <p className="text-slate-500 text-sm">Basic details visible to patients.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Avatar URL</label>
              <input
                type="text"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Briefcase size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Professional Details</h2>
              <p className="text-slate-500 text-sm">Your expertise and qualifications.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Specialization</label>
              <div className="relative">
                <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Child Psychologist, Speech Therapist"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Tell us about your professional background..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Experience (Years)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Rate ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Credentials (JSON or Text)</label>
              <textarea
                name="credentials"
                value={formData.credentials}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm"
                placeholder='{"degree": "PhD", "university": "..."}'
              />
              <p className="text-xs text-slate-400 mt-1">Please enter valid JSON or simple text.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-medical-600 text-white font-bold rounded-xl hover:bg-medical-700 transition-colors shadow-lg shadow-medical-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
