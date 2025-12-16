import { createClient } from "@/lib/supabase/server";
import { PlayCircle, Clock } from "lucide-react";

export default async function ClipsPage() {
  const supabase = createClient();
  
  const { data: clips } = await supabase
    .from('clips')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">المقاطع التعليمية</h1>
        <p className="text-slate-500 mt-2">مكتبة فيديوهات تعليمية وإرشادية للتعامل مع الأطفال</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips?.map((clip: any) => (
          <div key={clip.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="aspect-video bg-slate-100 relative">
              {clip.thumbnail_url ? (
                <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200">
                  <PlayCircle size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white">
                  <PlayCircle size={24} fill="currentColor" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded font-medium">
                {Math.floor(clip.duration / 60)}:{String(clip.duration % 60).padStart(2, '0')}
              </span>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-medical-50 text-medical-700 text-xs font-bold rounded-full">
                  {clip.category || 'General'}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Clock size={12} />
                  2 days ago
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-medical-700 transition-colors">
                {clip.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2">
                {clip.description}
              </p>
            </div>
          </div>
        ))}

        {/* Placeholder Content if Empty */}
        {(!clips || clips.length === 0) && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm opacity-60">
            <div className="aspect-video bg-slate-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-5 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
