import Link from "next/link";
import { ArrowRight, Brain, Shield, User } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <Brain className="text-blue-600" />
          MindBloom
        </div>
        <nav className="flex gap-4">
          <Link href="/login" className="text-slate-600 hover:text-blue-600 font-medium">
            Sign In
          </Link>
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-5xl font-black text-slate-900 mb-6 max-w-3xl leading-tight">
          Cognitive Health Monitoring for <span className="text-blue-600">Every Child</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl">
          A comprehensive ecosystem connecting Mothers, Specialists, and Children through AI-powered behavioral analysis and gamified therapy.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
          <Link href="/dashboard/parent" className="group p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all hover:shadow-md text-left">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">For Parents</h3>
            <p className="text-slate-500 text-sm">Track progress, upload videos for AI analysis, and manage appointments.</p>
          </Link>

          <Link href="/child/play" className="group p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition-all hover:shadow-md text-left">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <Brain size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">For Children</h3>
            <p className="text-slate-500 text-sm">Immersive, gamified cognitive exercises in a secure "Kiosk Mode".</p>
          </Link>

          <Link href="/dashboard/specialist" className="group p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-green-200 transition-all hover:shadow-md text-left">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">For Specialists</h3>
            <p className="text-slate-500 text-sm">Review patient data, analyze AI reports, and manage your queue.</p>
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        © 2024 MindBloom Ecosystem. All rights reserved.
      </footer>
    </div>
  );
}
