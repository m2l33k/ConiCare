"use client";

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Brain, Activity, TrendingUp, Trophy, Calendar } from "lucide-react";

interface ProgressClientViewProps {
  childrenList: any[];
  prescriptions: any[];
  gameScores: any[];
}

export default function ProgressClientView({ childrenList, prescriptions, gameScores }: ProgressClientViewProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || "");

  // Filter data based on selected child
  const filteredPrescriptions = useMemo(() => 
    prescriptions.filter(p => p.child_id === selectedChildId),
  [prescriptions, selectedChildId]);

  const filteredScores = useMemo(() => 
    gameScores.filter(s => s.child_id === selectedChildId),
  [gameScores, selectedChildId]);

  // Prepare chart data
  // Group scores by date or game? Let's show average score trend over time.
  const chartData = useMemo(() => {
    // Sort by date
    const sorted = [...filteredScores].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Simply map to format Recharts expects
    return sorted.map(s => ({
      name: new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: s.score,
      game: s.game_name
    }));
  }, [filteredScores]);

  // Calculate stats
  const totalGamesPlayed = filteredScores.length;
  const averageScore = totalGamesPlayed > 0 
    ? Math.round(filteredScores.reduce((acc, curr) => acc + curr.score, 0) / totalGamesPlayed) 
    : 0;
  
  const activePrescriptionsCount = filteredPrescriptions.filter(p => p.status === 'active').length;

  const currentChild = childrenList.find(c => c.id === selectedChildId);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">لوحات التقدم</h1>
          <p className="text-slate-500 mt-2">تابع تطور {currentChild?.name || 'طفلك'} من خلال الرسوم البيانية والتحليلات</p>
        </div>
        
        {childrenList.length > 0 && (
          <select 
            value={selectedChildId} 
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-medical-500 focus:border-medical-500 block p-3 min-w-[200px]"
          >
            {childrenList.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        )}
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">معدل النقاط</p>
            <h3 className="text-2xl font-bold text-slate-900">{averageScore}</h3>
            <p className="text-green-600 text-xs font-bold flex items-center gap-1">
              <TrendingUp size={12} /> متوسط الأداء
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">الألعاب المنجزة</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalGamesPlayed}</h3>
            <p className="text-slate-500 text-xs font-medium">
              مجموع الجلسات
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">الوصفات النشطة</p>
            <h3 className="text-2xl font-bold text-slate-900">{activePrescriptionsCount}</h3>
            <p className="text-slate-400 text-xs font-medium">
              الخطة العلاجية الحالية
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">تطور الأداء في الألعاب</h3>
            </div>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={3} dot={{r: 4, fill: '#0f766e', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Activity size={48} className="mb-2 opacity-50" />
                  <p>لا توجد بيانات كافية للعرض</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-900 mb-4">الوصفات العلاجية (Therapy Prescription)</h3>
          
          <div className="space-y-4">
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((presc) => (
                <div key={presc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900">{presc.game_name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      presc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {presc.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Activity size={14} />
                      {presc.frequency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {presc.duration}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>لا توجد وصفات علاجية حالياً.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Clock({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
