"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, X } from "lucide-react";

export default function GameArena() {
  const router = useRouter();
  const [showExitModal, setShowExitModal] = useState(false);
  const [pin, setPin] = useState("");

  // Enforce Fullscreen on Mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.error("Fullscreen blocked:", e);
      }
    };
    enterFullscreen();
  }, []);

  const handleExit = () => {
    if (pin === "1234") {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      router.push("/dashboard/parent");
    } else {
      alert("Incorrect PIN!");
      setPin("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-white relative">
      {/* Top Bar */}
      <div className="absolute top-8 right-8 z-50">
        <button
          onClick={() => setShowExitModal(true)}
          className="bg-red-500 p-4 rounded-full shadow-lg border-4 border-white hover:scale-105 transition-transform"
        >
          <X size={32} />
        </button>
      </div>

      <h1 className="text-6xl font-black mb-12 drop-shadow-md">
        MindBloom Arena 🎮
      </h1>

      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Game Cards */}
        <button className="bg-yellow-400 h-64 rounded-3xl border-b-8 border-yellow-600 shadow-xl flex flex-col items-center justify-center gap-4 hover:translate-y-2 transition-transform active:border-b-0">
          <span className="text-8xl">🃏</span>
          <span className="text-4xl font-bold text-yellow-900">Memory</span>
        </button>

        <button className="bg-blue-400 h-64 rounded-3xl border-b-8 border-blue-600 shadow-xl flex flex-col items-center justify-center gap-4 hover:translate-y-2 transition-transform active:border-b-0">
          <span className="text-8xl">🧩</span>
          <span className="text-4xl font-bold text-blue-900">Puzzle</span>
        </button>
      </div>

      {/* PIN Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Parent Gate
            </h2>
            <p className="text-slate-500 mb-6">Enter PIN to exit Child Mode</p>

            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-4xl font-bold tracking-[1em] p-4 bg-slate-100 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              placeholder="••••"
            />

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowExitModal(false);
                  setPin("");
                }}
                className="flex-1 py-4 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExit}
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
