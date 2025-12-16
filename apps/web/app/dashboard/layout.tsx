import { Sidebar } from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />

      {/* Main Content */}
      {/* 'ms-64' adds margin-start (left in LTR, right in RTL) to offset the fixed sidebar */}
      <main className="flex-1 md:ms-64 p-8 transition-all">
        {children}
      </main>
    </div>
  );
}
