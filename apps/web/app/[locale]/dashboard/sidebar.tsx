"use client";

import { Link, usePathname, useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { 
  Brain, 
  LogOut, 
  LayoutDashboard, 
  Stethoscope, 
  Video, 
  Menu,
  MessageCircle,
  Users,
  Film,
  Baby,
  Gamepad2,
  BarChart3,
  Calendar,
  Mic,
  Bot
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Sidebar({ role }: { role: string }) {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <aside className="w-64 bg-white border-e border-slate-200 fixed top-0 bottom-0 start-0 z-10 hidden md:flex flex-col transition-all">
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-medical-700">
          <img src="/logo.png" alt="Cognicare" className="h-12 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
          <span>{t('menu')}</span>
          <LanguageSwitcher />
        </div>
        
        {role === 'parent' && (
          <>
            <Link 
              href="/dashboard/parent" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent') && pathname === '/dashboard/parent'
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard size={20} />
              {t('dashboard')}
            </Link>

            <Link 
              href="/dashboard/parent/specialists" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/specialists') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Stethoscope size={20} />
              {t('specialists')}
            </Link>
            
            <Link 
              href="/dashboard/parent/messages" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/messages') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MessageCircle size={20} />
              {t('messages')}
            </Link>

            <Link 
              href="/dashboard/parent/groups" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/groups') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users size={20} />
              {t('groups')}
            </Link>

            <Link 
              href="/dashboard/parent/clips" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/clips') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Film size={20} />
              {t('clips')}
            </Link>

            <Link 
              href="/dashboard/parent/children" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/children') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Baby size={20} />
              {t('children')}
            </Link>

            <Link 
              href="/dashboard/parent/games" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/games') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Gamepad2 size={20} />
              {t('games')}
            </Link>

            <Link 
              href="/dashboard/parent/speech" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/speech') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Mic size={20} />
              {t('speechAnalysis')}
            </Link>

            <Link 
              href="/dashboard/parent/progress" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/progress') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BarChart3 size={20} />
              {t('progress')}
            </Link>

            <Link 
              href="/dashboard/parent/consultations" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/consultations') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Video size={20} />
              {t('consultations')}
            </Link>

            <Link 
              href="/dashboard/parent/chatbot" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/parent/chatbot') 
                  ? 'bg-medical-50 text-medical-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bot size={20} />
              {t('aiChatbot')}
            </Link>
          </>
        )}

        {role === 'specialist' && (
          <>
            <Link 
              href="/dashboard/specialist" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/specialist') && !isActive('/dashboard/specialist/patients')
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Stethoscope size={20} />
              {t('dashboard')}
            </Link>
            
            <Link 
              href="/dashboard/specialist/patients" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/specialist/patients') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users size={20} />
              {t('patients')}
            </Link>

            <Link 
              href="/dashboard/specialist/messages" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/specialist/messages') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MessageCircle size={20} />
              {t('messages')}
            </Link>

            <Link 
              href="/dashboard/specialist/groups" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/specialist/groups') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users size={20} />
              {t('groups')}
            </Link>

            <Link 
              href="/dashboard/specialist/schedule" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/specialist/schedule') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Calendar size={20} />
              {t('schedule')}
            </Link>

            <Link 
              href="/dashboard/specialist/profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/specialist/profile') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Brain size={20} />
              {t('profile')}
            </Link>
          </>
        )}
        
        <div className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {t('tools')}
        </div>
        
        <Link 
          href="/assessment" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
            isActive('/assessment') 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Video size={20} />
          {t('assessment')}
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={20} />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}
