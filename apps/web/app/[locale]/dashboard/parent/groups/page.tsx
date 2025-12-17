import { createClient } from "@/lib/supabase/server";
import { Users, MessageSquare, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import CreateGroupButton from "./create-group-button";

export default async function GroupsPage() {
  const t = await getTranslations('ParentGroups');
  const supabase = createClient();
  
  const { data: groups } = await supabase
    .from('groups')
    .select(`
      *,
      _count:group_members(count)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-500 mt-2">{t('subtitle')}</p>
        </div>
        <CreateGroupButton />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups?.map((group: any) => (
          <div key={group.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-medical-100 to-blue-100 rounded-2xl flex items-center justify-center text-medical-600 flex-shrink-0">
              {group.image_url ? (
                <img src={group.image_url} alt={group.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Users size={28} />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900 text-lg">{group.name}</h3>
                <Link href={`/dashboard/parent/groups/${group.id}`} className="text-slate-400 hover:text-medical-600 transition-colors">
                  <ArrowUpRight size={20} />
                </Link>
              </div>
              
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                {group.description || t('defaultDesc')}
              </p>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {group._count?.[0]?.count || 0} {t('members')}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  12 {t('activeTopics')}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Demo Groups if Empty */}
        {(!groups || groups.length === 0) && (
          <>
            {[
              { title: t('demoGroups.newMoms'), desc: t('demoGroups.newMomsDesc'), color: "bg-pink-100 text-pink-600" },
              { title: t('demoGroups.autismSupport'), desc: t('demoGroups.autismSupportDesc'), color: "bg-blue-100 text-blue-600" },
              { title: t('demoGroups.speechDelay'), desc: t('demoGroups.speechDelayDesc'), color: "bg-purple-100 text-purple-600" },
              { title: t('demoGroups.childNutrition'), desc: t('demoGroups.childNutritionDesc'), color: "bg-green-100 text-green-600" }
            ].map((g, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4 opacity-75 hover:opacity-100 transition-opacity cursor-pointer">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${g.color} flex-shrink-0`}>
                  <Users size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{g.title}</h3>
                  <p className="text-slate-500 text-sm mb-3">{g.desc}</p>
                  <button className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                    {t('join')}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
