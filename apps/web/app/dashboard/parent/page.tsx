import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ParentDashboardClient from "./client-view";

export default async function ParentDashboard() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // 2. Fetch All Children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. Fetch All Assessments (for any of the children)
  // Since we have RLS "Parents can view their children's assessments", 
  // we can just select from assessments directly and RLS will filter it.
  // However, we want to join child name for display.
  const { data: assessments } = await supabase
    .from('assessments')
    .select(`
      id, 
      created_at, 
      status, 
      specialist_notes,
      children (name)
    `)
    .order('created_at', { ascending: false });

  // 4. Fetch All Game Scores
  const { data: gameScores } = await supabase
    .from('game_scores')
    .select('game_name, score, created_at')
    .order('created_at', { ascending: true });

  // Transform data for the client component
  const formattedAssessments = assessments?.map((a: any) => ({
    ...a,
    child_name: a.children?.name
  })) || [];

  return (
    <ParentDashboardClient 
      userProfile={{ 
        full_name: profile?.full_name || 'Parent',
        email: user.email 
      }}
      children={children || []}
      assessments={formattedAssessments}
      gameScores={gameScores || []}
    />
  );
}
