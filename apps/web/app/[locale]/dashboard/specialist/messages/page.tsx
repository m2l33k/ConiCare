import { createClient } from "@/lib/supabase/server";
import MessagesClient from "../../parent/messages/client-view";
import { getTranslations } from "next-intl/server";

export default async function SpecialistMessagesPage() {
  const supabase = createClient();
  const t = await getTranslations('SpecialistMessages');
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all data in parallel
  const [conversationsRes, specialistsRes, parentsRes] = await Promise.all([
    // 1. Fetch existing conversations
    supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversation:conversations (
          *,
          messages (
            content,
            created_at,
            is_read
          )
        ),
        profile:profiles (id, full_name, avatar_url, role)
      `)
      .eq('profile_id', user.id),

    // 2. Fetch Specialists (Colleagues)
    supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        avatar_url,
        role,
        specialist_details (
          specialty
        )
      `)
      .eq('role', 'specialist')
      .neq('id', user.id), // Don't show self

    // 3. Fetch Parents (Patients)
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('role', 'parent')
      .limit(50) 
  ]);

  // Transform conversations data
  const initialConversations = conversationsRes.data?.map((c: any) => ({
    id: c.conversation_id,
    participant: c.profile,
    last_message: c.conversation?.messages?.[0] || null
  })) || [];

  return (
    <div className="p-8 h-full">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('title')}</h1>
      <MessagesClient 
        initialConversations={initialConversations}
        specialists={specialistsRes.data || []}
        parents={parentsRes.data || []}
        currentUserId={user.id}
      />
    </div>
  );
}
