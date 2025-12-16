"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Lock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Auth Delay
    setTimeout(() => {
      setLoading(false);
      // Mock Routing based on email for demo purposes
      if (email.includes("specialist")) {
        router.push("/dashboard/specialist");
      } else if (email.includes("admin")) {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/parent");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-slate-900 mb-8">
        <Brain className="text-blue-600" size={32} />
        MindBloom
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-8">Sign in to your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Demo Accounts:</p>
          <div className="flex justify-center gap-4 mt-2">
            <button onClick={() => {setEmail('parent@demo.com'); setPassword('123')}} className="text-blue-600 hover:underline">Parent</button>
            <button onClick={() => {setEmail('specialist@demo.com'); setPassword('123')}} className="text-blue-600 hover:underline">Specialist</button>
          </div>
        </div>
      </div>
    </div>
  );
}
