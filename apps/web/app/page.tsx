"use client";
import Link from "next/link";
import { User, Stethoscope, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function AuthSwitcher() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (role: 'parent' | 'specialist') => {
    setLoading(role);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        data: {
          role: role, // Used by the DB trigger to set the initial role
        }
      }
    });

    if (error) {
      console.error(error);
      alert("Login failed: " + error.message);
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen relative font-sans">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:bg-white transition-all text-slate-700 font-medium border border-slate-200">
          <Globe size={18} />
          <span>English / العربية</span>
        </button>
      </div>

      {/* Parent Side */}
      <div className="flex-1 bg-medical-50 flex flex-col items-center justify-center p-8 hover:bg-medical-100 transition-colors border-r border-slate-200 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />
        <button 
          onClick={() => handleLogin('parent')} 
          disabled={loading !== null}
          className="z-10 text-center w-full max-w-lg"
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-medical-600 mb-8 shadow-xl group-hover:scale-110 transition-transform mx-auto">
            <User size={64} />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">I am a Parent</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Track your child's progress, manage appointments, and access home therapy tools.
          </p>
          <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
            <span className="inline-block px-8 py-3 bg-medical-600 text-white rounded-full font-bold shadow-lg shadow-medical-200">
              {loading === 'parent' ? 'Redirecting...' : 'Enter Dashboard'}
            </span>
          </div>
        </button>
      </div>

      {/* Specialist Side */}
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-8 hover:bg-slate-100 transition-colors group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
        <button 
          onClick={() => handleLogin('specialist')}
          disabled={loading !== null}
          className="z-10 text-center w-full max-w-lg"
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-slate-700 mb-8 shadow-xl group-hover:scale-110 transition-transform mx-auto">
            <Stethoscope size={64} />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">I am a Specialist</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Review patient assessments, analyze clinical data, and manage your caseload.
          </p>
          <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
            <span className="inline-block px-8 py-3 bg-slate-800 text-white rounded-full font-bold shadow-lg shadow-slate-300">
              {loading === 'specialist' ? 'Redirecting...' : 'Enter Workspace'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}