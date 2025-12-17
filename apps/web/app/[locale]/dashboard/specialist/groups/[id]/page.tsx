import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GroupFeed from "@/app/[locale]/dashboard/parent/groups/[id]/client-view";

export default async function SpecialistGroupDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch Group Details
  const { data: group, error } = await supabase
    .from('groups')
    .select(`
      *,
      members:group_members(count)
    `)
    .eq('id', params.id)
    .single();

  if (error || !group) {
    notFound();
  }

  // Check Membership
  const { data: membership } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', params.id)
    .eq('profile_id', user.id)
    .single();

  // Fetch Posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(full_name, avatar_url, role),
      _count:comments(count),
      likes:post_likes(user_id)
    `)
    .eq('group_id', params.id)
    .order('created_at', { ascending: false });

  const formattedPosts = posts?.map(post => ({
    ...post,
    has_liked: post.likes?.some((like: any) => like.user_id === user.id) || false,
    likes: undefined // cleanup
  }));

  const groupData = {
    ...group,
    member_count: group.members?.[0]?.count || 0,
    is_member: !!membership
  };

  return <GroupFeed group={groupData} initialPosts={formattedPosts || []} currentUser={user} />;
}
