"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Activity, Calendar, Video, Play, Camera, ArrowRight, 
  Users, Settings, FileText, Plus, User, Edit, Trash2, 
  ChevronRight, CheckCircle, Clock, AlertCircle 
} from "lucide-react";
import { ParentProgressChart } from "./chart";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Child {
  id: string;
  name: string;
  avatar_theme: string;
  pin_code: string;
  age?: number;
  conditions?: string[];
}

const CONDITION_CHOICES = [
  "Dyslexia (Reading Difficulty)",
  "Dyscalculia (Math Difficulty)",
  "Dysgraphia (Writing Difficulty)",
  "ADHD (Attention Deficit Hyperactivity Disorder)",
  "Autism Spectrum Disorder (ASD)",
  "Auditory Processing Disorder (APD)",
  "Visual Processing Disorder",
  "Non-Verbal Learning Disability",
  "Language Processing Disorder",
  "Executive Functioning Deficit",
  "Memory Deficit",
  "Speech Sound Disorder"
];

interface Assessment {
  id: string;
  created_at: string;
  status: 'pending' | 'reviewed';
  specialist_notes?: string;
  child_name?: string; // Joined field
}

interface GameScore {
  game_name: string;
  score: number;
  created_at: string;
}

interface ParentDashboardProps {
  userProfile: { full_name: string; email?: string };
  children: Child[];
  assessments: Assessment[];
  gameScores: GameScore[];
}

export default function ParentDashboardClient({ 
  userProfile, 
  children: initialChildren, 
  assessments, 
  gameScores 
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'assessments' | 'settings'>('overview');
  const [childrenList, setChildrenList] = useState(initialChildren);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const router = useRouter();

  // Derived Data
  const totalAssessments = assessments.length;
  const pendingReviews = assessments.filter(a => a.status === 'pending').length;
  const totalGamesPlayed = gameScores.length;
  const latestChild = childrenList[0];

  // Chart Data Preparation
  const chartData = gameScores.slice(-7).map(gs => ({
    name: new Date(gs.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
    score: gs.score
  }));

  // Handlers
  const handleAddChild = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const pin = formData.get('pin') as string;
    const age = formData.get('age') ? parseInt(formData.get('age') as string) : null;
    
    // Get all selected conditions
    const conditions = CONDITION_CHOICES.filter(condition => 
      formData.get(`condition_${condition}`) === 'on'
    );

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && name) {
      const { data, error } = await supabase.from('children').insert({
        parent_id: user.id,
        name: name,
        pin_code: pin || '1234',
        avatar_theme: 'default',
        age: age,
        conditions: conditions
      }).select().single();

      if (data) {
        setChildrenList([...childrenList, data]);
        setIsAddChildOpen(false);
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Welcome back, {userProfile.full_name}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar size={18} />
            <span>{new Date().toLocaleDateString()}</span>
          </button>
          {latestChild && (
            <Link 
              href="/child/play" 
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all shadow-md shadow-green-200"
            >
              <Play fill="currentColor" size={18} />
              Child Mode
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          icon={<Users className="text-blue-600" />} 
          bg="bg-blue-100" 
          label="Children" 
          value={childrenList.length} 
        />
        <StatsCard 
          icon={<Video className="text-purple-600" />} 
          bg="bg-purple-100" 
          label="Assessments" 
          value={totalAssessments} 
        />
        <StatsCard 
          icon={<Activity className="text-orange-600" />} 
          bg="bg-orange-100" 
          label="Games Played" 
          value={totalGamesPlayed} 
        />
        <StatsCard 
          icon={<AlertCircle className="text-red-600" />} 
          bg="bg-red-100" 
          label="Pending Review" 
          value={pendingReviews} 
        />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={16} />} label="Overview" />
        <TabButton active={activeTab === 'children'} onClick={() => setActiveTab('children')} icon={<Users size={16} />} label="My Children" />
        <TabButton active={activeTab === 'assessments'} onClick={() => setActiveTab('assessments')} icon={<FileText size={16} />} label="History" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={16} />} label="Profile" />
      </div>

      {/* TAB CONTENT */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="text-medical-600" />
                  Progress Analytics
                </h2>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm text-slate-600 focus:outline-none">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              {chartData.length > 0 ? (
                <ParentProgressChart data={chartData} />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Activity size={48} className="mb-2 opacity-20" />
                  <p>No game activity recorded yet.</p>
                </div>
              )}
            </div>

            {/* Recent Assessments List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-slate-400" />
                Recent Assessments
              </h3>
              <div className="space-y-3">
                {assessments.slice(0, 3).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 shadow-sm">
                        <Video size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">Video Assessment</p>
                        <p className="text-xs text-slate-500">{new Date(assessment.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      assessment.status === 'reviewed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {assessment.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                    </span>
                  </div>
                ))}
                {assessments.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No assessments found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Actions */}
          <div className="space-y-6">
            {/* Start Assessment Card */}
            <div className="bg-medical-50 p-6 rounded-2xl border border-medical-100 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-medical-200/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
              
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-medical-600 mb-4 shadow-sm z-10">
                <Camera size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 z-10">New Assessment</h3>
              <p className="text-slate-600 text-sm mb-6 z-10 relative">
                Record a video session to track development progress.
              </p>

              <Link href="/assessment" className="w-full bg-medical-600 text-white py-3 rounded-xl font-bold hover:bg-medical-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-medical-200 z-10">
                Start Recording <ArrowRight size={18} />
              </Link>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Play size={20} className="text-yellow-300" />
                Daily Tip
              </h3>
              <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                "Encourage eye contact during games to improve focus and social connection."
              </p>
              <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                View More Tips
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHILDREN TAB */}
      {activeTab === 'children' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Registered Children</h2>
            <button 
              onClick={() => setIsAddChildOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              <Plus size={16} /> Add Child
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {childrenList.map((child) => (
              <div key={child.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-300 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {child.name[0]}
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <Edit size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{child.name}</h3>
                <p className="text-sm text-slate-500 mb-1">
                  {child.age ? `${child.age} years old` : 'Age not set'} • PIN: ••••
                </p>
                {child.conditions && child.conditions.length > 0 && (
                   <div className="flex flex-wrap gap-1 mb-4">
                     {child.conditions.slice(0, 3).map((c, i) => (
                       <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 truncate max-w-[120px]">
                         {c.split('(')[0].trim()}
                       </span>
                     ))}
                     {child.conditions.length > 3 && (
                       <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded-full border border-slate-100">
                         +{child.conditions.length - 3} more
                       </span>
                     )}
                   </div>
                )}
                {!child.conditions?.length && <div className="h-6 mb-4"></div>}
                
                <div className="flex gap-2 mt-auto">
                  <Link href="/child/play" className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold text-center hover:bg-blue-100 transition-colors">
                    Play
                  </Link>
                  <Link href="/assessment" className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-lg text-sm font-bold text-center hover:bg-slate-100 transition-colors">
                    Record
                  </Link>
                </div>
              </div>
            ))}

            {/* Empty State / Add Card */}
            <button 
              onClick={() => setIsAddChildOpen(true)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all group h-full min-h-[240px]"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                <Plus size={32} />
              </div>
              <span className="font-bold">Register New Child</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. HISTORY TAB */}
      {activeTab === 'assessments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Full Assessment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Child</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Specialist Notes</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.child_name || 'Child'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'reviewed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {item.specialist_notes || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {assessments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No assessments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={userProfile.full_name} 
                  disabled
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
                />
                <button className="text-sm font-bold text-blue-600 px-3 hover:bg-blue-50 rounded-lg transition-colors">
                  Edit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={userProfile.email} 
                disabled
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-medical-600 rounded focus:ring-medical-500" />
                  <span className="text-slate-700">Email me when assessment is reviewed</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-medical-600 rounded focus:ring-medical-500" />
                  <span className="text-slate-700">Weekly progress summary</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
               <button className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                 <Trash2 size={18} />
                 Delete Account
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Child Modal */}
      {isAddChildOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Register New Child</h3>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Child's Name</label>
                  <input name="name" type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Sarah" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input name="age" type="number" min="1" max="18" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 8" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PIN Code (for Child Mode)</label>
                <input name="pin" type="text" maxLength={4} defaultValue="1234" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Conditions / Needs</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                  {CONDITION_CHOICES.map((condition) => (
                    <label key={condition} className="flex items-start gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        name={`condition_${condition}`}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" 
                      />
                      <span className="text-sm text-slate-700">{condition}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">Select all that apply.</p>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddChildOpen(false)} className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200">Save Child</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ icon, bg, label, value }: { icon: React.ReactNode, bg: string, label: string, value: string | number }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
        active 
          ? 'bg-white text-slate-900 shadow-sm' 
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
