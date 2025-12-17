"use client";

import { useState } from "react";
import { useRouter, Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { Brain, Lock, Mail, Loader2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('Auth');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Auth Delay
    setTimeout(() => {
      setLoading(false);
      // Mock Routing based on email for demo purposes
      if (email.includes("specialist")) {
        router.push("/dashboard/specialist");
      } else if (email.includes("admin")) {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/parent");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
        <LanguageSwitcher />
      </div>
      
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-slate-900 mb-8">
        <img src="/logo.png" alt="Cognicare" className="h-16 w-auto" />
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">{t('welcome')}</h1>
        <p className="text-slate-500 text-center mb-8">{t('subtitle')}</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
            <div className="relative">
              <Mail className="absolute start-3 top-3 text-slate-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full ps-10 pe-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
            <div className="relative">
              <Lock className="absolute start-3 top-3 text-slate-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-10 pe-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : t('submit')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>{t('demo')}:</p>
          <div className="flex justify-center gap-4 mt-2">
            <button onClick={() => {setEmail('parent@demo.com'); setPassword('123')}} className="text-blue-600 hover:underline">{t('parent')}</button>
            <button onClick={() => {setEmail('specialist@demo.com'); setPassword('123')}} className="text-blue-600 hover:underline">{t('specialist')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
