import { createClient } from "@/lib/supabase/server";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function ChildrenPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">أطفالي</h1>
          <p className="text-slate-500 mt-2">إدارة ملفات الأطفال وتحديث بياناتهم</p>
        </div>
        <Link 
          href="/dashboard/parent?action=add_child" // Assuming main dashboard handles this or we create a new page
          className="px-6 py-3 bg-medical-600 hover:bg-medical-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة طفل
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children?.map((child: any) => (
          <div key={child.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-24 ${
              child.gender === 'female' ? 'bg-pink-50' : 'bg-blue-50'
            }`} />
            
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-sm mb-4">
                <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl overflow-hidden ${
                  child.gender === 'female' ? 'bg-pink-100 text-pink-500' : 'bg-blue-100 text-blue-500'
                }`}>
                  {child.avatar_theme === 'default' ? child.name[0] : (
                    <img src={`/avatars/${child.avatar_theme}.png`} alt={child.name} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1">{child.name}</h3>
              <p className="text-slate-500 text-sm mb-4">
                {child.birth_date ? new Date(child.birth_date).toLocaleDateString() : 'No birth date'} • {child.gender || 'Not specified'}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {child.conditions?.map((condition: string) => (
                  <span key={condition} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                    {condition}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full">
                <button className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Edit2 size={16} />
                  تعديل
                </button>
                <button className="p-2 border border-red-100 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
