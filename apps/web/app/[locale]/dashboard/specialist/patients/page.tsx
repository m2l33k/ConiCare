import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Filter, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function PatientsList() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations('SpecialistPatients');

  if (!user) redirect("/");

  // For now, fetch all children. In a real app, this would be filtered by specialist assignment.
  const { data: patients } = await supabase
    .from('children')
    .select('*, profiles:parent_id(full_name, email)')
    .order('name');

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-500 mt-1">{t('subtitle')}</p>
        </div>
        <button className="px-4 py-2 bg-medical-600 text-white rounded-lg font-medium hover:bg-medical-700 transition-colors">
          {t('addPatient')}
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50">
            <Filter size={18} /> {t('filter')}
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium text-sm">
            <tr>
              <th className="px-6 py-4">{t('table.name')}</th>
              <th className="px-6 py-4">{t('table.age')}</th>
              <th className="px-6 py-4">{t('table.guardian')}</th>
              <th className="px-6 py-4">{t('table.diagnosis')}</th>
              <th className="px-6 py-4">{t('table.status')}</th>
              <th className="px-6 py-4 text-right">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(patients || []).map((patient: any) => (
              <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                      {patient.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{patient.name}</div>
                      <div className="text-xs text-slate-400">ID: {patient.id.slice(0,6)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} {t('yrs')}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{patient.profiles?.full_name || t('unknown')}</div>
                  <div className="text-xs text-slate-500">{patient.profiles?.email}</div>
                </td>
                <td className="px-6 py-4">
                  {patient.conditions && patient.conditions.length > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {patient.conditions[0]} {patient.conditions.length > 1 && `+${patient.conditions.length - 1}`}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">{t('none')}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('active')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/dashboard/specialist/patient/${patient.id}`}
                    className="text-medical-600 font-bold hover:text-medical-700 hover:underline"
                  >
                    {t('viewDashboard')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!patients || patients.length === 0) && (
          <div className="p-12 text-center text-slate-500">
            {t('noPatients')}
          </div>
        )}
      </div>
    </div>
  );
}