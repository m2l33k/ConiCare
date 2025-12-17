import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SpecialistCockpitClient from "./client";

export default async function SpecialistCockpit() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch Assessments
  // We want to fetch pending assessments as per instructions.
  const { data: assessments, error } = await supabase
    .from('assessments')
    .select(`
      id, 
      created_at, 
      video_path, 
      status, 
      specialist_notes,
      children ( id, name )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching assessments:", error);
  }

  // Generate Signed URLs for video playback
  const assessmentsWithUrls = await Promise.all((assessments || []).map(async (a: any) => {
    let signedUrl = null;
    if (a.video_path) {
      const { data } = await supabase.storage
        .from('assessments')
        .createSignedUrl(a.video_path, 3600); // Valid for 1 hour
      signedUrl = data?.signedUrl;
    }
    
    // Ensure children is an object (Supabase might return array if relationship ambiguous, but usually object for FK)
    // If it's an array, take the first one.
    const childData = Array.isArray(a.children) ? a.children[0] : a.children;

    return {
      ...a,
      children: childData || { name: 'Unknown', id: '0' },
      signedUrl
    };
  }));

  return <SpecialistCockpitClient initialAssessments={assessmentsWithUrls} />;
}
