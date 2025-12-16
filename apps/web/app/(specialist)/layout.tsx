import Link from "next/link";

export default function SpecialistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6">
        <div className="text-2xl font-bold mb-10 flex items-center gap-2">
          <span>🧠</span> MindBloom
        </div>
        
        <nav className="space-y-4">
          <Link 
            href="/dashboard" 
            className="block px-4 py-2 bg-slate-800 rounded-lg text-blue-400 font-medium"
          >
            Patient Queue
          </Link>
          <Link 
            href="/dashboard/assessments" 
            className="block px-4 py-2 hover:bg-slate-800 rounded-lg text-slate-300"
          >
            Assessments
          </Link>
          <Link 
            href="/dashboard/calendar" 
            className="block px-4 py-2 hover:bg-slate-800 rounded-lg text-slate-300"
          >
            Calendar
          </Link>
          <Link 
            href="/dashboard/settings" 
            className="block px-4 py-2 hover:bg-slate-800 rounded-lg text-slate-300"
          >
            Settings
          </Link>
        </nav>

        <div className="mt-auto pt-10">
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-sm font-medium">Dr. Emily Chen</p>
            <p className="text-xs text-slate-400">Child Psychologist</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-50">
        {children}
      </div>
    </div>
  );
}
