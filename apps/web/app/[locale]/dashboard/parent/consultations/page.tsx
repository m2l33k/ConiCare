import { createClient } from "@/lib/supabase/server";
import { Calendar, Clock, Video, XCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ConsultationsPage() {
  const t = await getTranslations('ParentConsultations');
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: consultations } = await supabase
    .from('consultations')
    .select(`
      *,
      specialist:specialist_id (full_name, avatar_url),
      child:child_id (name)
    `)
    .eq('parent_id', user?.id)
    .order('scheduled_at', { ascending: true });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-500 mt-2">{t('subtitle')}</p>
        </div>
        <Link 
          href="/dashboard/parent/specialists"
          className="px-6 py-3 bg-medical-600 hover:bg-medical-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          <Calendar size={20} />
          {t('bookNew')}
        </Link>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900">{t('upcoming')}</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {consultations?.map((consultation: any) => (
            <div key={consultation.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex flex-col items-center justify-center font-bold border border-blue-100">
                  <span className="text-xs uppercase">{new Date(consultation.scheduled_at).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl">{new Date(consultation.scheduled_at).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">
                    {t('consultationWith', { name: consultation.specialist?.full_name || t('specialist') })}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(consultation.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      {t('child')}: {consultation.child?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {consultation.status === 'scheduled' && (
                  <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors">
                    {t('cancel')}
                  </button>
                )}
                {consultation.meeting_link && consultation.status === 'scheduled' ? (
                  <a 
                    href={consultation.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-medical-600 text-white rounded-lg font-bold text-sm hover:bg-medical-700 transition-colors flex items-center gap-2"
                  >
                    <Video size={16} />
                    {t('joinSession')}
                  </a>
                ) : (
                  <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    consultation.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    consultation.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {consultation.status === 'completed' && <span className="flex items-center gap-1"><CheckCircle size={14} /> {t('completed')}</span>}
                    {consultation.status === 'cancelled' && <span className="flex items-center gap-1"><XCircle size={14} /> {t('cancelled')}</span>}
                    {consultation.status === 'scheduled' && t('pendingLink')}
                  </span>
                )}
              </div>
            </div>
          ))}

          {(!consultations || consultations.length === 0) && (
            <div className="p-12 text-center text-slate-500">
              {t('noAppointments')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
