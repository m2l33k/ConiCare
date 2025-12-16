import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClientView from "./client-view";

export default async function SpecialistProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch specialist details
  const { data: details } = await supabase
    .from('specialist_details')
    .select('*')
    .eq('id', user.id)
    .single();

  return <ProfileClientView user={user} profile={profile} details={details} />;
}
