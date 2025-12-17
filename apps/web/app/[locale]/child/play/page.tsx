"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, BookOpen, Layers, ArrowLeft } from "lucide-react";
import { useMemoryGame } from "@/hooks/useMemoryGame";
import { createClient } from "@/lib/supabase/client";

export default function GameArena() {
  const t = useTranslations('ChildPlay');
  const router = useRouter();
  const [showExitModal, setShowExitModal] = useState(false);
  const [pin, setPin] = useState("");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(null);

  // Fetch Child ID
  useEffect(() => {
    const fetchChild = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         // Assuming parent is logged in
         const { data } = await supabase.from('children').select('id').eq('parent_id', user.id).limit(1).maybeSingle();
         if (data) setChildId(data.id);
      }
    };
    fetchChild();
  }, []);

  const { cards, score, moves, gameOver, handleCardClick, restartGame } = useMemoryGame(childId);

  // Enforce Fullscreen on Mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        // Silently fail if interaction is required
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
      alert(t('incorrectPin'));
      setPin("");
    }
  };

  // Game View
  if (activeGame === 'memory') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sky-300 font-rounded select-none p-4 relative">
        {/* Simple Header */}
        <div className="absolute top-8 left-8 z-20 rtl:right-8 rtl:left-auto">
           <button onClick={() => setActiveGame(null)} className="bg-white/80 p-4 rounded-full shadow-lg hover:bg-white transition-colors">
             <ArrowLeft size={32} className="text-slate-700 rtl:rotate-180" />
           </button>
        </div>
        
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-4xl w-full relative">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black text-slate-800">{t('memoryMatch')}</h2>
              <div className="flex gap-6 text-2xl font-bold text-slate-600">
                 <div className="bg-white px-4 py-2 rounded-xl shadow-sm">{t('moves')}: {moves}</div>
                 <div className="bg-white px-4 py-2 rounded-xl shadow-sm text-blue-600">{t('score')}: {score}</div>
              </div>
           </div>

           <div className="grid grid-cols-4 gap-4 aspect-square max-h-[60vh] mx-auto w-full max-w-[60vh]">
              {cards.map((card, index) => (
                 <button
                    key={index}
                    onClick={() => handleCardClick(index)}
                    className={`rounded-2xl text-6xl flex items-center justify-center transition-all duration-300 transform shadow-md ${
                       card.isFlipped || card.isMatched ? 'bg-white rotate-y-180' : 'bg-blue-500 rotate-y-0'
                    } ${card.isMatched ? 'opacity-50 ring-4 ring-green-400' : ''}`}
                    disabled={card.isFlipped || card.isMatched}
                 >
                    <div className={card.isFlipped || card.isMatched ? "" : "hidden"}>
                        {card.content}
                    </div>
                    <div className={!(card.isFlipped || card.isMatched) ? "text-white/50" : "hidden"}>
                        ?
                    </div>
                 </button>
              ))}
           </div>

           {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl z-30 backdrop-blur-sm">
                 <div className="bg-white p-12 rounded-[2rem] text-center animate-scale-in shadow-2xl">
                    <h3 className="text-5xl font-black text-slate-800 mb-4">{t('youWon')} 🎉</h3>
                    <p className="text-2xl text-slate-600 mb-8">{t('finalScore')}: {score}</p>
                    <button 
                        onClick={restartGame} 
                        className="px-8 py-4 bg-green-500 text-white font-bold rounded-xl text-2xl shadow-lg hover:scale-105 transition-transform hover:bg-green-600"
                    >
                       {t('playAgain')}
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden relative font-rounded select-none">
      {/* Landscape Background (CSS Art: A Park) */}
      <div className="absolute inset-0 bg-sky-300 z-0 overflow-hidden">
        {/* Sun */}
        <div className="absolute top-10 right-20 rtl:left-20 rtl:right-auto w-32 h-32 bg-yellow-300 rounded-full shadow-[0_0_40px_rgba(253,224,71,0.6)] animate-pulse-slow" />
        {/* Clouds */}
        <div className="absolute top-20 left-20 rtl:right-20 rtl:left-auto w-40 h-20 bg-white/80 rounded-full blur-xl opacity-80" />
        <div className="absolute top-40 right-1/3 rtl:left-1/3 rtl:right-auto w-60 h-24 bg-white/60 rounded-full blur-xl opacity-60" />
        {/* Hills */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-green-400 rounded-t-[50%] scale-150 translate-y-10" />
        <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-green-500 rounded-tl-full" />
      </div>

      {/* Top Bar (Exit) */}
      <div className="absolute top-8 left-8 z-50 rtl:right-8 rtl:left-auto">
        <button
          onClick={() => setShowExitModal(true)}
          className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl hover:bg-white/40 transition-all text-white/80 hover:text-white group"
        >
          <Lock size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <h1 className="relative z-10 text-6xl font-black mb-16 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] tracking-wide">
        {t('gameRoom')} 🎈
      </h1>

      {/* 3 Giant Floating Cards */}
      <div className="relative z-10 grid grid-cols-3 gap-12 w-full max-w-6xl px-8">
        
        {/* Card 1: Memory */}
        <button 
          onClick={() => setActiveGame('memory')}
          className="bg-white h-96 rounded-[3rem] border-b-[16px] border-blue-200 shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 group flex flex-col items-center justify-center gap-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500 relative z-10">
            <Layers size={64} />
          </div>
          <span className="text-4xl font-black text-slate-700 relative z-10">{t('memory')}</span>
        </button>

        {/* Card 2: Focus */}
        <button 
          onClick={() => alert(t('comingSoon'))}
          className="bg-white h-96 rounded-[3rem] border-b-[16px] border-purple-200 shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 group flex flex-col items-center justify-center gap-8 relative overflow-hidden mt-12"
        >
           <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-500 relative z-10">
            <Eye size={64} />
          </div>
          <span className="text-4xl font-black text-slate-700 relative z-10">{t('focus')}</span>
        </button>

        {/* Card 3: Story */}
        <button 
          onClick={() => alert(t('comingSoon'))}
          className="bg-white h-96 rounded-[3rem] border-b-[16px] border-amber-200 shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 group flex flex-col items-center justify-center gap-8 relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500 relative z-10">
            <BookOpen size={64} />
          </div>
          <span className="text-4xl font-black text-slate-700 relative z-10">{t('story')}</span>
        </button>

      </div>

      {/* PIN Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl animate-scale-in">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {t('parentGate')}
            </h2>
            <p className="text-slate-500 mb-6">{t('enterPin')}</p>

            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-4xl font-bold tracking-[1em] p-4 bg-slate-100 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-blue-200 text-slate-900"
              placeholder="••••"
              autoFocus
            />

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowExitModal(false);
                  setPin("");
                }}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleExit}
                className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
              >
                {t('unlock')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
