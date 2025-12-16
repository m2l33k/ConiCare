import Link from "next/link";
import { Brain, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      {/* 
        RTL Note: 
        - 'start-0' positions it left in LTR and right in RTL.
        - 'border-e' adds border to the end (right in LTR, left in RTL).
      */}
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
          <Link href="/dashboard/parent" className="block px-4 py-2 text-slate-600 hover:bg-medical-50 hover:text-medical-700 rounded-lg transition-colors">
            Parent Dashboard
          </Link>
          <Link href="/dashboard/specialist" className="block px-4 py-2 text-slate-600 hover:bg-medical-50 hover:text-medical-700 rounded-lg transition-colors">
            Specialist View
          </Link>
          <div className="px-4 py-2 mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tools
          </div>
          <Link href="/assessment" className="block px-4 py-2 text-slate-600 hover:bg-medical-50 hover:text-medical-700 rounded-lg transition-colors">
            Assessment Tool
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <LogOut size={20} />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      {/* 'ms-64' adds margin-start (left in LTR, right in RTL) to offset the fixed sidebar */}
      <main className="flex-1 md:ms-64 p-8 transition-all">
        {children}
      </main>
    </div>
  );
}