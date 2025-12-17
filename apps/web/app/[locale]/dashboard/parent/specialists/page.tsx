import { createClient } from "@/lib/supabase/server";
import SpecialistsClient from "./client-view";

export default async function SpecialistsPage() {
  const supabase = createClient();
  
  // Fetch specialists with their details
  const { data: specialists } = await supabase
    .from('profiles')
    .select(`
      id, 
      full_name, 
      avatar_url,
      specialist_details (
        specialty,
        bio,
        rating,
        experience_years,
        location,
        available,
        working_hours,
        qualifications,
        reviews_count,
        patients_helped
      )
    `)
    .eq('role', 'specialist');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">دليل الأخصائيين</h1>
        <p className="text-slate-500 mt-2">تصفح قائمة الأخصائيين المعتمدين واحجز استشارة لطفلك</p>
      </header>

      <SpecialistsClient specialists={specialists || []} />
    </div>
  );
}
