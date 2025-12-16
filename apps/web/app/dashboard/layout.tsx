import { Sidebar } from "./sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'parent';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar role={userRole} />

      {/* Main Content */}
      {/* 'ms-64' adds margin-start (left in LTR, right in RTL) to offset the fixed sidebar */}
      <main className="flex-1 md:ms-64 p-8 transition-all">
        {children}
      </main>
    </div>
  );
}
