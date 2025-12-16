import Link from "next/link";
import { Play, Video, Calendar, Activity } from "lucide-react";
import WebcamRecorder from "../../../components/WebcamRecorder";

export default function ParentDashboard() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, Sarah</h1>
          <p className="text-slate-500">Here's how Leo is doing today.</p>
        </div>
        <Link href="/child/play" className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
          <Play fill="currentColor" size={20} />
          Launch Child Mode
        </Link>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Weekly Score</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">1,250</p>
          <p className="text-sm text-green-600 font-medium">+15% from last week</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Video size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Pending Review</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">2 Videos</p>
          <p className="text-sm text-slate-400">Sent to Dr. Emily</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-slate-700">Next Appointment</h3>
          </div>
          <p className="text-xl font-bold text-slate-900">Dec 24, 10:00 AM</p>
          <p className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">Join Meeting Link</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Assessment Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Video className="text-blue-500" />
            New AI Assessment
          </h2>
          <p className="text-slate-500 mb-6">
            Record a short 30-second video of your child interacting with a toy. Our AI will analyze eye contact and responsiveness.
          </p>
          
          <div className="flex justify-center">
            <WebcamRecorder />
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-lg">
                  🎮
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">Played Memory Match</h4>
                  <p className="text-sm text-slate-500">Duration: 15 mins • Score: 850</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">2h ago</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
