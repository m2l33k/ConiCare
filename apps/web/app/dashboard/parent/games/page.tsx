import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GamesClientView from "./client-view";

export default async function GamesPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch Games
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch Children (to select who is playing)
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch Game Scores (to show high scores)
  const { data: gameScores } = await supabase
    .from('game_scores')
    .select('*');

  return (
    <GamesClientView 
      games={games || []} 
      gameScores={gameScores || []} 
      childrenList={children || []}
    />
  );
}
