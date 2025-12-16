"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  BarChart3
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Sidebar({ role }: { role: string }) {
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
          <Brain className="text-medical-600" />
          MindBloom
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu
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
              الرئيسية
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
              دليل الأخصائيين
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
              الرسائل
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
              المجموعات
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
              المقاطع
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
              أطفالي
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
              منطقة الألعاب
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
              لوحات التقدم
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
              الاستشارات
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
              Clinical Cockpit
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
              My Patients
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
              Messages
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
              Groups
            </Link>

            <Link 
              href="/dashboard/specialist/schedule" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive('/dashboard/specialist/schedule') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </div>
              Schedule
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
              My Profile
            </Link>
          </>
        )}

        <div className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Tools
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
          Assessment Tool
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
