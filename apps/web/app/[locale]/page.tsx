"use client";
import { Link, useRouter } from "@/navigation";
import { User, Stethoscope, Globe, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function AuthSwitcher() {
  const [selectedRole, setSelectedRole] = useState<'parent' | 'specialist' | null>(null);
  const t = useTranslations('Landing');

  return (
    <div className="flex min-h-screen relative font-sans">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20 rtl:left-6 rtl:right-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all border border-slate-200">
           <LanguageSwitcher />
        </div>
      </div>

      {/* Parent Side */}
      <div className="flex-1 bg-medical-50 flex flex-col items-center justify-center p-8 hover:bg-medical-100 transition-colors border-r border-slate-200 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />
        <button 
          onClick={() => setSelectedRole('parent')} 
          className="z-10 text-center w-full max-w-lg"
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-medical-600 mb-8 shadow-xl group-hover:scale-110 transition-transform mx-auto">
            <User size={64} />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('parentTitle')}</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            {t('parentDesc')}
          </p>
          <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
            <span className="inline-block px-8 py-3 bg-medical-600 text-white rounded-full font-bold shadow-lg shadow-medical-200">
              {t('parentAction')}
            </span>
          </div>
        </button>
      </div>

      {/* Specialist Side */}
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-8 hover:bg-slate-100 transition-colors group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
        <button 
          onClick={() => setSelectedRole('specialist')}
          className="z-10 text-center w-full max-w-lg"
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-slate-700 mb-8 shadow-xl group-hover:scale-110 transition-transform mx-auto">
            <Stethoscope size={64} />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('specialistTitle')}</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            {t('specialistDesc')}
          </p>
          <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
            <span className="inline-block px-8 py-3 bg-slate-800 text-white rounded-full font-bold shadow-lg shadow-slate-300">
              {t('specialistAction')}
            </span>
          </div>
        </button>
      </div>

      {/* Auth Modal */}
      {selectedRole && (
        <AuthModal 
          role={selectedRole} 
          onClose={() => setSelectedRole(null)} 
        />
      )}
    </div>
  );
}

function AuthModal({ role, onClose }: { role: 'parent' | 'specialist', onClose: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('Auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = createClient();

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role,
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        // If email confirmation is off, session will be present
        if (data.session) {
           // Wait a moment for the trigger to run
           await new Promise(resolve => setTimeout(resolve, 1000));
           
           // Verify profile exists before redirecting
           const { data: profile } = await supabase
             .from('profiles')
             .select('role')
             .eq('id', data.user!.id)
             .single();
           
           if (!profile) {
              // Fallback: Manually create profile if trigger failed
              await supabase.from('profiles').insert({
                id: data.user!.id,
                full_name: fullName,
                role: role
              });
           }
           
           router.push(role === 'parent' ? '/dashboard/parent' : '/dashboard/specialist');
        } else {
           alert("Please check your email to confirm your account.");
           onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check role compatibility
        let { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        // Handle case where profile might be missing (if trigger failed during signup)
        if (!profile) {
             // Attempt to recover by checking metadata or creating default
             const userRole = data.user.user_metadata?.role || role;
             // Create missing profile
             const { error: insertError } = await supabase.from('profiles').insert({
                id: data.user.id,
                full_name: data.user.user_metadata?.full_name || 'User',
                role: userRole
             });
             
             if (!insertError) {
                profile = { role: userRole };
             }
        }

        if (profile?.role !== role) {
            throw new Error(`This account is not registered as a ${role}.`);
        }

        router.push(role === 'parent' ? '/dashboard/parent' : '/dashboard/specialist');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 capitalize">
            {isSignUp 
              ? `${t('signup')} (${role === 'parent' ? t('parent') : t('specialist')})` 
              : `${t('signin')} (${role === 'parent' ? t('parent') : t('specialist')})`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t('fullName')}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t('email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-medical-600 text-white py-3 rounded-lg font-bold hover:bg-medical-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {isSignUp ? t('createAccount') : t('submit')}
          </button>

          <div className="text-center text-sm text-slate-500 mt-4">
            {isSignUp ? t('haveAccount') : t('needAccount')}{" "}
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-medical-600 font-semibold hover:underline"
            >
              {isSignUp ? t('login') : t('signup')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
