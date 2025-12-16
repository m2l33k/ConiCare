"use client";

import { useState } from 'react';
import { Gamepad2, Trophy, Play, Star, Clock } from "lucide-react";
import Link from 'next/link';

interface GamesClientViewProps {
  games: any[];
  gameScores: any[];
  childrenList: any[];
}

export default function GamesClientView({ games, gameScores, childrenList }: GamesClientViewProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || "");

  // Helper to get high score for a game and child
  const getHighScore = (gameId: string) => {
    const scores = gameScores
      .filter(s => s.game_id === gameId && s.child_id === selectedChildId)
      .map(s => s.score);
    return scores.length > 0 ? Math.max(...scores) : 0;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">منطقة الألعاب</h1>
          <p className="text-slate-500 mt-2">ألعاب تعليمية وتفاعلية مصممة لتنمية مهارات طفلك</p>
        </div>

        {childrenList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">اللاعب الحالي:</span>
            <select 
              value={selectedChildId} 
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-medical-500 focus:border-medical-500 block p-2.5 min-w-[150px]"
            >
              {childrenList.map(child => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games?.map((game: any) => (
          <div key={game.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all text-center group flex flex-col">
            <div className="w-full aspect-square bg-slate-50 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
              {game.icon_url ? (
                <img src={game.icon_url} alt={game.title} className="w-full h-full object-cover" />
              ) : (
                <Gamepad2 size={48} className="text-slate-300" />
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button 
                  onClick={() => alert(`Launching ${game.title} for child ID: ${selectedChildId}... (Game integration pending)`)}
                  className="px-6 py-2 bg-medical-600 text-white rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform hover:bg-medical-700"
                >
                  <Play size={16} fill="currentColor" />
                  لعب الآن
                </button>
              </div>
            </div>

            <div className="flex-1 text-right">
              <h3 className="font-bold text-slate-900 text-lg mb-1">{game.title}</h3>
              <p className="text-slate-500 text-sm mb-3 line-clamp-2">{game.description || game.category}</p>
            </div>
            
            <div className="flex items-center justify-between gap-2 text-xs font-bold pt-4 border-t border-slate-100 mt-2">
              <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md flex items-center gap-1" title="High Score">
                <Trophy size={12} />
                {getHighScore(game.id)}
              </span>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md flex items-center gap-1">
                <Star size={12} />
                {game.difficulty_level || 'Medium'}
              </span>
            </div>
          </div>
        ))}

        {(!games || games.length === 0) && (
          <div className="col-span-full py-20 text-center">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               <Gamepad2 size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-900">قريباً</h3>
             <p className="text-slate-500">نعمل حالياً على إضافة ألعاب جديدة.</p>
          </div>
        )}
      </div>
    </div>
  );
}
