import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProgressClientView from "./client-view";

export default async function ProgressPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 1. Fetch Children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id) // Assuming children have parent_id, or handled by RLS
    .order('created_at', { ascending: false });

  // 2. Fetch Prescriptions (for all children of this parent)
  // We can fetch all and filter in client, or iterate. RLS should limit to user's children.
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. Fetch Game Scores (for all children)
  const { data: gameScores } = await supabase
    .from('game_scores')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <ProgressClientView 
      childrenList={children || []} 
      prescriptions={prescriptions || []} 
      gameScores={gameScores || []} 
    />
  );
}
