import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SpecialistPatientView from "./client-view";
import { getTranslations } from "next-intl/server";

export default async function PatientDashboard({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const t = await getTranslations('SpecialistPatientView');
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
    return <div>{t('patientNotFound')}</div>;
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

  // 6. Fetch AI Prediction
  let aiPrediction = null;
  try {
    const scores = gameScores || [];
    const recentScores = scores.map((s: any) => s.score).slice(-10); // Last 10 scores
    
    // Calculate days active (unique dates)
    const uniqueDates = new Set(scores.map((s: any) => new Date(s.created_at).toDateString()));
    const daysActive = uniqueDates.size || 1;

    const res = await fetch('http://127.0.0.1:8000/predict/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recent_scores: recentScores.length > 0 ? recentScores : [0],
        days_active: daysActive
      }),
      cache: 'no-store'
    });

    if (res.ok) {
      aiPrediction = await res.json();
    }
  } catch (error) {
    console.error("AI Service Unavailable:", error);
  }

  return (
    <SpecialistPatientView 
      child={child}
      assessments={assessments || []}
      gameScores={gameScores || []}
      initialNotes={notes || []}
      initialPrescriptions={prescriptions || []}
      specialistName={profile?.full_name || 'Dr. Specialist'}
      aiPrediction={aiPrediction}
    />
  );
}
