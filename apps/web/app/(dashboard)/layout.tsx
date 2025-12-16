import Link from "next/link";
import { Brain, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <Brain className="text-blue-600" />
            MindBloom
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Navigation items will be injected by sub-layouts or managed here based on role */}
          {/* For now, we provide a generic structure */}
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          {/* Placeholder links - in a real app, these would be role-specific */}
          <Link href="/dashboard/parent" className="block px-4 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            Parent Dashboard
          </Link>
          <Link href="/dashboard/specialist" className="block px-4 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            Specialist View
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
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
