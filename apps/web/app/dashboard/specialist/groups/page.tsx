import { createClient } from "@/lib/supabase/server";
import { Users, MessageSquare, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import CreateGroupButton from "@/app/dashboard/parent/groups/create-group-button";

export default async function SpecialistGroupsPage() {
  const supabase = createClient();
  
  const { data: groups } = await supabase
    .from('groups')
    .select(`
      *,
      _count:group_members(count)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 p-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Professional Communities</h1>
          <p className="text-slate-500 mt-2">Join discussions with other specialists and parents.</p>
        </div>
        <CreateGroupButton />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups?.map((group: any) => (
          <div key={group.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
              {group.image_url ? (
                <img src={group.image_url} alt={group.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Users size={28} />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900 text-lg">{group.name}</h3>
                <Link href={`/dashboard/specialist/groups/${group.id}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                  <ArrowUpRight size={20} />
                </Link>
              </div>
              
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                {group.description || "Community group for sharing knowledge."}
              </p>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {group._count?.[0]?.count || 0} Members
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}

        {(!groups || groups.length === 0) && (
           <div className="col-span-2 text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
             <Users size={48} className="mx-auto mb-4 opacity-50" />
             <p>No groups found. Create one or wait for updates.</p>
           </div>
        )}
      </div>
    </div>
  );
}
