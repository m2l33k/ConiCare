"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brain, LogOut, LayoutDashboard, Stethoscope, Video, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Sidebar() {
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
        
        <Link 
          href="/dashboard/parent" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
            isActive('/dashboard/parent') 
              ? 'bg-medical-50 text-medical-700' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard size={20} />
          Parent Dashboard
        </Link>

        <Link 
          href="/dashboard/specialist" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
            isActive('/dashboard/specialist') 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Stethoscope size={20} />
          Specialist View
        </Link>

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
