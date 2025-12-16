"use client";

import { useState } from "react";
import { Send, Heart, MessageCircle, Share2, MoreHorizontal, UserPlus, Users, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
  likes_count: number;
  has_liked?: boolean;
  comments?: Comment[];
  _count?: {
    comments: number;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  is_member: boolean;
  member_count: number;
}

export default function GroupFeed({ 
  group, 
  initialPosts, 
  currentUser 
}: { 
  group: Group, 
  initialPosts: Post[], 
  currentUser: any 
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPost, setNewPost] = useState("");
  const [isMember, setIsMember] = useState(group.is_member);
  const [isPosting, setIsPosting] = useState(false);
  
  // Comment states
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleJoin = async () => {
    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, profile_id: currentUser.id });

    if (!error) {
      setIsMember(true);
      router.refresh();
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsPosting(true);
    
    // Optimistic update
    const tempPost = {
      id: 'temp-' + Date.now(),
      content: newPost,
      created_at: new Date().toISOString(),
      author: {
        full_name: currentUser.user_metadata?.full_name || 'Me',
        avatar_url: currentUser.user_metadata?.avatar_url,
        role: 'member'
      },
      likes_count: 0,
      has_liked: false,
      _count: { comments: 0 }
    };

    setPosts([tempPost as any, ...posts]);
    setNewPost("");

    const { data, error } = await supabase
      .from('posts')
      .insert({
        group_id: group.id,
        author_id: currentUser.id,
        content: tempPost.content
      })
      .select(`
        *,
        author:profiles(full_name, avatar_url, role)
      `)
      .single();

    if (error) {
      console.error(error);
      alert("Failed to post");
      setPosts(posts); // Revert
    } else {
      setPosts(prev => prev.map(p => p.id === tempPost.id ? { ...data, has_liked: false, _count: { comments: 0 } } : p));
    }
    
    setIsPosting(false);
  };

  const handleLike = async (postId: string) => {
    if (!isMember) return; // Only members can like

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiked = post.has_liked;
    const newCount = isLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1;

    // Optimistic update
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, has_liked: !isLiked, likes_count: newCount } 
        : p
    ));

    const { error } = isLiked 
      ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', currentUser.id)
      : await supabase.from('post_likes').insert({ post_id: postId, user_id: currentUser.id });

    if (error) {
        console.error("Like error:", error);
        // Revert
        setPosts(posts.map(p => 
            p.id === postId 
                ? { ...p, has_liked: isLiked, likes_count: post.likes_count } 
                : p
        ));
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }

    setExpandedPostId(postId);
    
    const post = posts.find(p => p.id === postId);
    if (post?.comments) return; // Already loaded

    setLoadingComments(true);
    const { data } = await supabase
        .from('comments')
        .select(`
            *,
            author:profiles(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    
    if (data) {
        setPosts(prev => prev.map(p => 
            p.id === postId ? { ...p, comments: data } : p
        ));
    }
    setLoadingComments(false);
  };

  const handleSubmitComment = async (postId: string) => {
    if (!newComment.trim()) return;

    const { data, error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            author_id: currentUser.id,
            content: newComment
        })
        .select(`
            *,
            author:profiles(full_name, avatar_url)
        `)
        .single();

    if (!error && data) {
        setPosts(prev => prev.map(p => 
            p.id === postId ? { 
                ...p, 
                comments: [...(p.comments || []), data],
                _count: { comments: (p._count?.comments || 0) + 1 }
            } : p
        ));
        setNewComment("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Group Header */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-24 h-24 bg-medical-100 text-medical-600 rounded-3xl mx-auto flex items-center justify-center mb-4 text-4xl font-bold">
          {group.image_url ? <img src={group.image_url} className="w-full h-full object-cover rounded-3xl" /> : <Users size={48} />}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{group.name}</h1>
        <p className="text-slate-500 max-w-lg mx-auto mb-6">{group.description}</p>
        
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 font-medium bg-slate-50 px-4 py-2 rounded-full">
            <Users size={18} />
            {group.member_count} Members
          </div>
          {!isMember ? (
            <button 
              onClick={handleJoin}
              className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors"
            >
              <UserPlus size={18} />
              Join Group
            </button>
          ) : (
            <span className="flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 font-bold rounded-full">
              ✓ Member
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          {isMember && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                  {currentUser.user_metadata?.avatar_url ? (
                    <img src={currentUser.user_metadata.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                      {currentUser.user_metadata?.full_name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <form onSubmit={handlePost} className="flex-1">
                  <textarea 
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share something with the group..."
                    className="w-full p-4 bg-slate-50 border-none rounded-xl resize-none focus:ring-2 focus:ring-medical-500 min-h-[100px]"
                  />
                  <div className="flex justify-end mt-3">
                    <button 
                      disabled={!newPost.trim() || isPosting}
                      className="px-6 py-2 bg-medical-600 text-white font-bold rounded-lg hover:bg-medical-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send size={16} /> Post
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Posts List */}
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    {post.author.avatar_url ? (
                      <img src={post.author.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-500">{post.author.full_name?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{post.author.full_name}</h4>
                    <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <p className="text-slate-800 leading-relaxed mb-4 whitespace-pre-wrap">
                {post.content}
              </p>

              <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    post.has_liked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={post.has_liked ? "currentColor" : "none"} />
                  <span className="text-sm font-medium">{post.likes_count}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    expandedPostId === post.id ? 'text-medical-600' : 'text-slate-500 hover:text-medical-600'
                  }`}
                >
                  <MessageCircle size={20} />
                  <span className="text-sm font-medium">{post._count?.comments || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors ml-auto">
                  <Share2 size={20} />
                </button>
              </div>

              {/* Comments Section */}
              {expandedPostId === post.id && (
                <div className="mt-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-4 mb-4">
                    {loadingComments && !post.comments && (
                      <div className="text-center text-slate-400 py-2">Loading comments...</div>
                    )}
                    
                    {post.comments?.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {comment.author.avatar_url ? (
                            <img src={comment.author.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-500">{comment.author.full_name?.[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-3">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-sm text-slate-900">{comment.author.full_name}</span>
                            <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {post.comments?.length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-2">No comments yet.</div>
                    )}
                  </div>

                  {/* Add Comment */}
                  {isMember && (
                    <div className="flex gap-3 items-center">
                       <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                          {currentUser.user_metadata?.avatar_url ? (
                            <img src={currentUser.user_metadata.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs text-slate-500 flex items-center justify-center h-full">
                                {currentUser.user_metadata?.full_name?.[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmitComment(post.id);
                                    }
                                }}
                                placeholder="Write a comment..."
                                className="w-full pl-4 pr-10 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-medical-500"
                            />
                            <button 
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={!newComment.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-medical-600 disabled:opacity-50 hover:text-medical-700"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p>No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">About this group</h3>
            <p className="text-sm text-slate-500 mb-4">
              {group.description}
            </p>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rules</div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Be respectful and kind</li>
              <li>No medical advice (consult specialists)</li>
              <li>No spam or promotions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
