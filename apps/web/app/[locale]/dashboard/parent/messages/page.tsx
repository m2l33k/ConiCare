import { createClient } from "@/lib/supabase/server";
import MessagesClient from "./client-view";

export default async function MessagesPage() {
  const supabase = createClient();
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

    // 2. Fetch Specialists
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
      .eq('role', 'specialist'),

    // 3. Fetch Other Parents (Community)
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('role', 'parent')
      .neq('id', user.id)
      .limit(20) // Limit to avoid fetching thousands of parents
  ]);

  // Transform conversations data to match Client Component props
  const initialConversations = conversationsRes.data?.map((c: any) => {
    // Find the OTHER participant (not the current user)
    // We fetched 'conversation_participants' where profile_id = user.id, so 'c' is OUR participant entry.
    // We need to access the conversation's OTHER participants.
    // However, the current query only fetches the conversation and messages. 
    // It does NOT fetch the other participants of that conversation directly in a clean way without another join.
    
    // Quick Fix: Since we can't easily get the other participant from this structure without a complex nested join or filtering,
    // and 'MessagesClient' does its own fetching if needed, we might need to rely on the client to fetch details or improve the query.
    
    // Better Query Strategy:
    // We should fetch the *Conversation* first, then its participants.
    
    return {
      id: c.conversation_id,
      participant: c.profile, // This is WRONG (it's us), but for now we keep the structure to avoid breaking type errors until we fix the query.
      last_message: c.conversation?.messages?.[0] || null
    };
  }) || [];

  // Refined Fetching Strategy for Conversations to get the Partner
  const { data: myConversations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('profile_id', user.id);

  const myConversationIds = myConversations?.map(c => c.conversation_id) || [];

  let realConversations: any[] = [];

  if (myConversationIds.length > 0) {
    const { data: partners } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        profile:profiles (id, full_name, avatar_url, role),
        conversation:conversations (
          messages (
            content,
            created_at,
            is_read
          )
        )
      `)
      .in('conversation_id', myConversationIds)
      .neq('profile_id', user.id); // Get everyone who is NOT me
      
      if (partners) {
        // Sort messages to find last one
        realConversations = partners.map((p: any) => {
           // Sort messages desc
           const msgs = p.conversation?.messages || [];
           msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
           
           return {
             id: p.conversation_id,
             participant: p.profile,
             last_message: msgs[0] || null
           };
        });
      }
  }

  return (
    <MessagesClient 
      initialConversations={realConversations}
      specialists={specialistsRes.data || []}
      parents={parentsRes.data || []}
      currentUserId={user.id}
    />
  );
}
