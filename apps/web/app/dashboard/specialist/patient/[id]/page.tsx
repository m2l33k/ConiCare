import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SpecialistPatientView from "./client-view";

export default async function PatientDashboard({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Verify Specialist Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'specialist') {
    redirect("/dashboard/parent");
  }

  const childId = params.id;

  // 1. Fetch Child Metadata & Parent Info
  const { data: child } = await supabase
    .from('children')
    .select(`
      *,
      profiles:parent_id (
        full_name,
        email
      )
    `)
    .eq('id', childId)
    .single();

  if (!child) {
    return <div>Patient not found</div>;
  }

  // 2. Fetch Assessments
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false });

  // 3. Fetch Game Scores
  const { data: gameScores } = await supabase
    .from('game_scores')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: true });

  // 4. Fetch Clinical Notes
  const { data: notes } = await supabase
    .from('clinical_notes')
    .select(`
      *,
      profiles:specialist_id (full_name)
    `)
    .eq('child_id', childId)
    .order('created_at', { ascending: false });

  // 5. Fetch Prescriptions
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false });

  return (
    <SpecialistPatientView 
      child={child}
      assessments={assessments || []}
      gameScores={gameScores || []}
      initialNotes={notes || []}
      initialPrescriptions={prescriptions || []}
      specialistName={profile?.full_name || 'Dr. Specialist'}
    />
  );
}
