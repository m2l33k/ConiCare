"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { 
  Panel, PanelGroup, PanelResizeHandle 
} from "react-resizable-panels";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  User, Phone, FileText, Activity, Brain, Video, 
  MessageSquare, Plus, Save, Clock, SplitSquareHorizontal, 
  Maximize2, Play, Pause, ChevronRight 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

// Types
interface Child {
  id: string;
  name: string;
  age?: number;
  conditions?: string[];
  avatar_theme: string;
  profiles: {
    full_name: string;
    email?: string;
  };
}

interface Assessment {
  id: string;
  created_at: string;
  video_path: string;
  status: string;
  specialist_notes?: string;
}

interface GameScore {
  game_name: string;
  score: number;
  created_at: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string };
}

interface Prescription {
  id: string;
  game_name: string;
  frequency: string;
  duration: string;
  status: string;
}

interface Props {
  child: Child;
  assessments: Assessment[];
  gameScores: GameScore[];
  initialNotes: Note[];
  initialPrescriptions: Prescription[];
  specialistName: string;
  aiPrediction?: {
    current_avg: number;
    predicted_improvement_score: number;
    trend: string;
  } | null;
}

export default function SpecialistPatientView({
  child,
  assessments,
  gameScores,
  initialNotes,
  initialPrescriptions,
  specialistName,
  aiPrediction
}: Props) {
  const t = useTranslations('SpecialistPatientView');
  // State
  const [activeTab, setActiveTab] = useState<'cognition' | 'behavior'>('cognition');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(assessments[0]?.id || null);
  const [compareAssessmentId, setCompareAssessmentId] = useState<string | null>(assessments[1]?.id || null);
  
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [prescForm, setPrescForm] = useState({ game: 'Memory Match', frequency: 'Daily', duration: '15 mins' });

  // Helpers
  const currentAssessment = assessments.find(a => a.id === selectedAssessmentId);
  const comparisonAssessment = assessments.find(a => a.id === compareAssessmentId);
  
  const getPublicUrl = (path: string) => {
    const supabase = createClient();
    const { data } = supabase.storage.from('assessments').getPublicUrl(path);
    return data.publicUrl;
  };

  // Handlers
  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    const supabase = createClient();
    const { data, error } = await supabase.from('clinical_notes').insert({
      child_id: child.id,
      content: newNote,
    }).select('*, profiles:specialist_id(full_name)').single();

    if (data) {
      setNotes([data, ...notes]);
      setNewNote("");
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { data } = await supabase.from('prescriptions').insert({
      child_id: child.id,
      game_name: prescForm.game,
      frequency: prescForm.frequency,
      duration: prescForm.duration
    }).select().single();

    if (data) {
      setPrescriptions([data, ...prescriptions]);
    }
  };

  // Chart Data Preparation
  const cognitionData = gameScores
    .filter(gs => gs.game_name === 'Memory Match' || gs.game_name === 'Pattern Puzzle')
    .map(gs => ({
      date: new Date(gs.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: gs.score,
      game: gs.game_name
    }));

  // Mock Behavior Data (since we don't have a table for it yet)
  const behaviorData = [
    { day: 'Mon', tantrums: 2, focus: 5 },
    { day: 'Tue', tantrums: 1, focus: 6 },
    { day: 'Wed', tantrums: 3, focus: 4 },
    { day: 'Thu', tantrums: 0, focus: 8 },
    { day: 'Fri', tantrums: 1, focus: 7 },
    { day: 'Sat', tantrums: 4, focus: 3 },
    { day: 'Sun', tantrums: 1, focus: 7 },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <PanelGroup direction="horizontal" className="h-full">
        
        {/* PANEL 1: PATIENT METADATA (20%) */}
        <Panel defaultSize={20} minSize={15} maxSize={25} className="bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-medical-100 rounded-full flex items-center justify-center text-medical-600 text-3xl font-bold mb-4 shadow-inner">
                {child.name[0]}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{child.name}</h2>
              <p className="text-slate-500 text-sm">Age: {child.age || 'N/A'} • ID: #{child.pin_code}</p>
            </div>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('guardianContact')}</h3>
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <User size={16} className="mt-0.5 text-medical-500" />
                <div>
                  <p className="font-semibold text-slate-900">{child.profiles.full_name}</p>
                  <p className="text-xs">{child.profiles.email || t('noEmail')}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('clinicalDiagnosis')}</h3>
              <div className="flex flex-wrap gap-2">
                {child.conditions && child.conditions.length > 0 ? (
                  child.conditions.map((condition, i) => (
                    <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-md border border-red-100">
                      {condition}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">{t('noConditions')}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('assessmentsHistory')}</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {assessments.map((assessment) => (
                  <button
                    key={assessment.id}
                    onClick={() => setSelectedAssessmentId(assessment.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
                      selectedAssessmentId === assessment.id 
                        ? 'bg-medical-600 text-white shadow-md' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Video size={14} />
                    <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                    {assessment.status === 'reviewed' && <span className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-slate-200 hover:bg-medical-400 transition-colors" />

        {/* PANEL 2: EVIDENCE CONSOLE (50%) */}
        <Panel defaultSize={50} minSize={30} className="bg-slate-50 flex flex-col overflow-hidden">
          
          {/* Top: Video Player */}
          <div className={`relative bg-black transition-all duration-500 ease-in-out ${compareMode ? 'h-1/2' : 'h-3/5'} shrink-0 flex items-center justify-center overflow-hidden`}>
            
            {/* Main Player */}
            <div className={`relative h-full ${compareMode ? 'w-1/2 border-r border-slate-700' : 'w-full'}`}>
               {currentAssessment ? (
                 <video 
                   src={getPublicUrl(currentAssessment.video_path)} 
                   controls 
                   className="w-full h-full object-contain"
                 />
               ) : (
                 <div className="flex items-center justify-center h-full text-slate-500">{t('noAssessmentSelected')}</div>
               )}
               <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md">
                 {currentAssessment ? new Date(currentAssessment.created_at).toLocaleDateString() : t('selectDate')}
               </div>
            </div>

            {/* Comparison Player */}
            {compareMode && (
              <div className="w-1/2 h-full relative">
                {comparisonAssessment ? (
                  <video 
                    src={getPublicUrl(comparisonAssessment.video_path)} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                   <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                     <p>{t('selectComparison')}</p>
                     <select 
                       className="bg-slate-800 text-white text-xs p-2 rounded"
                       onChange={(e) => setCompareAssessmentId(e.target.value)}
                       value={compareAssessmentId || ''}
                     >
                       {assessments.map(a => (
                         <option key={a.id} value={a.id}>
                           {new Date(a.created_at).toLocaleDateString()}
                         </option>
                       ))}
                     </select>
                   </div>
                )}
                 <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md">
                   {comparisonAssessment ? new Date(comparisonAssessment.created_at).toLocaleDateString() : t('compareMode')}
                 </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={() => setCompareMode(!compareMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md transition-all ${
                  compareMode 
                    ? 'bg-medical-600 text-white shadow-lg shadow-medical-900/20' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <SplitSquareHorizontal size={16} />
                {compareMode ? t('exitCompare') : t('compareMode')}
              </button>
            </div>
          </div>

          {/* Bottom: Data Visualization */}
          <div className="flex-1 bg-white border-t border-slate-200 flex flex-col">
            <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
              <button 
                onClick={() => setActiveTab('cognition')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'cognition' ? 'bg-white text-medical-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Brain size={16} /> {t('cognition')}
              </button>
              <button 
                onClick={() => setActiveTab('behavior')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'behavior' ? 'bg-white text-medical-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Activity size={16} /> {t('behavior')}
              </button>
            </div>

            <div className="flex-1 p-4 min-h-0 flex flex-col">
              {activeTab === 'cognition' ? (
                <>
                  {aiPrediction && (
                     <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-indigo-900 font-bold text-sm flex items-center gap-2">
                             <Brain size={16} className="text-indigo-600" />
                             AI Progress Prediction
                          </h4>
                          <p className="text-indigo-600 text-xs mt-1">Based on recent game performance</p>
                        </div>
                        <div className="flex gap-6 text-right">
                           <div>
                              <div className="text-xs text-indigo-400 font-medium">Current Avg</div>
                              <div className="text-lg font-bold text-indigo-900">{aiPrediction.current_avg}</div>
                           </div>
                           <div>
                              <div className="text-xs text-indigo-400 font-medium">Predicted</div>
                              <div className="text-lg font-bold text-indigo-600 flex items-center gap-1">
                                {aiPrediction.predicted_improvement_score}
                                {aiPrediction.trend === 'upward' ? (
                                   <Activity size={14} className="text-emerald-500" />
                                ) : (
                                   <Activity size={14} className="text-amber-500" />
                                )}
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cognitionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#0f766e" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#0f766e', strokeWidth: 2, stroke: '#fff' }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={behaviorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="focus" stackId="1" stroke="#0f766e" fill="#99f6e4" />
                      <Area type="monotone" dataKey="tantrums" stackId="1" stroke="#ef4444" fill="#fecaca" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-slate-200 hover:bg-medical-400 transition-colors" />

        {/* PANEL 3: ACTION CONSOLE (30%) */}
        <Panel defaultSize={30} minSize={20} className="bg-white border-l border-slate-200 flex flex-col">
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Clinical Notes Section */}
            <div className="flex-1 flex flex-col min-h-0 border-b border-slate-200">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-medical-600" />
                  {t('clinicalNotes')}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {notes.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-4">{t('noNotes')}</p>
                )}
                {notes.map((note) => (
                  <div key={note.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm">
                    <p className="text-slate-700 leading-relaxed mb-2">{note.content}</p>
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span className="font-medium text-medical-600">{note.profiles?.full_name || 'Specialist'}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-slate-200">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t('typeObservations')}
                  className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-medical-500 outline-none resize-none mb-2"
                />
                <button 
                  onClick={handleSaveNote}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  <Save size={16} /> {t('logEntry')}
                </button>
              </div>
            </div>

            {/* Prescription Section */}
            <div className="h-1/3 flex flex-col bg-medical-50/30">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Brain size={18} className="text-medical-600" />
                  {t('therapyPrescription')}
                </h3>
              </div>
              
              <div className="p-4 overflow-y-auto">
                <form onSubmit={handlePrescribe} className="space-y-3">
                  <div>
                    <select 
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-medical-500"
                      value={prescForm.game}
                      onChange={(e) => setPrescForm({...prescForm, game: e.target.value})}
                    >
                      <option>Memory Match</option>
                      <option>Pattern Puzzle</option>
                      <option>Emotion Recognition</option>
                      <option>Focus Builder</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select 
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                      value={prescForm.frequency}
                      onChange={(e) => setPrescForm({...prescForm, frequency: e.target.value})}
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>2x / Week</option>
                    </select>
                    <select 
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                      value={prescForm.duration}
                      onChange={(e) => setPrescForm({...prescForm, duration: e.target.value})}
                    >
                      <option>10 mins</option>
                      <option>15 mins</option>
                      <option>30 mins</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-medical-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-medical-700 transition-colors shadow-lg shadow-medical-200">
                    {t('assignTask')}
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">{t('activeTasks')}</h4>
                  {prescriptions.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-slate-200">
                      <span className="font-medium text-slate-700">{p.game_name}</span>
                      <span className="text-slate-500">{p.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
