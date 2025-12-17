import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ScheduleClient from "./client-view";

export default async function SchedulePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch consultations
  // Note: We're fetching all future and recent past (last 24h) appointments
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: consultations, error } = await supabase
    .from('consultations')
    .select(`
      id,
      scheduled_at,
      status,
      meeting_link,
      parent:parent_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('specialist_id', user.id)
    .gte('scheduled_at', yesterday.toISOString())
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error("Error fetching schedule:", error);
  }

  return <ScheduleClient consultations={consultations || []} />;
}
