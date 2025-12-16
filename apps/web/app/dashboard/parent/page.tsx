import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Play, Video, Calendar, Activity, ArrowRight, Camera } from "lucide-react";
import { ParentProgressChart } from "./chart";

export default async function ParentDashboard() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Fetch Children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .limit(1);
  
  const selectedChild = children?.[0];

  // Fetch Scores
  let chartData: any[] = [];
  let recentActivity: any[] = [];

  if (selectedChild) {
    const { data: gameScores } = await supabase
      .from('game_scores')
      .select('score, created_at, game_name')
      .eq('child_id', selectedChild.id)
      .order('created_at', { ascending: true })
      .limit(20); // Fetch more to filter or show last few
    
    if (gameScores) {
      // Prepare Chart Data (last 7 entries for simplicity)
      chartData = gameScores.slice(-7).map(gs => ({
        name: new Date(gs.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
        score: gs.score
      }));

      // Prepare Recent Activity (last 2 reversed)
      recentActivity = [...gameScores].reverse().slice(0, 2);
    }
  }

  const parentName = profile?.full_name?.split(' ')[0] || "Parent";
  const childName = selectedChild?.name || "your child";

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {parentName}</h1>
          <p className="text-slate-500">Here's how {childName} is doing today.</p>
        </div>
        {selectedChild && (
          <Link href="/child/play" className="flex items-center gap-2 bg-play-success text-green-900 px-6 py-3 rounded-full font-bold hover:bg-green-400 transition-colors shadow-lg shadow-green-200">
            <Play fill="currentColor" size={20} />
            Launch Child Mode
          </Link>
        )}
      </header>

      {/* Main Hero Section: Progress Chart + Start Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart (Dominating Center) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-medical-600" />
              Progress Overview
            </h2>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm text-slate-600 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last Month</option>
            </select>
          </div>
          
          {chartData.length > 0 ? (
            <ParentProgressChart data={chartData} />
          ) : (
            <div className="h-64 w-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p>No game data available yet. Play some games!</p>
            </div>
          )}
        </div>

        {/* Action Area: Start Assessment */}
        <div className="bg-medical-50 p-6 rounded-2xl border border-medical-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-medical-200/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
          
          <div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-medical-600 mb-4 shadow-sm">
              <Camera size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">New Assessment</h3>
            <p className="text-slate-600 text-sm mb-6">
              It's time for the weekly check-in. Record a short video of {childName} playing.
            </p>
          </div>

          <Link href="/assessment" className="w-full bg-medical-600 text-white py-3 rounded-xl font-bold hover:bg-medical-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-medical-200">
            Start Recording <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Secondary Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <Video size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Pending Review</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">0 Videos</p>
          <p className="text-sm text-slate-400">Sent to Specialist</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Next Appointment</h3>
          </div>
          <p className="text-xl font-bold text-slate-900">No appointments</p>
          <p className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">Schedule Now</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-slate-700 mb-4">Recent Activity</h3>
           <div className="space-y-3">
             {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-green-400' : 'bg-purple-400'}`} />
                  <span className="text-slate-600 flex-1">{activity.game_name}</span>
                  <span className="font-bold text-slate-900">{activity.score} pts</span>
                </div>
             )) : (
               <p className="text-sm text-slate-400">No recent activity.</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
