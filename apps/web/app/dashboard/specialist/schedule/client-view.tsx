"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Video, User, MoreVertical, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { format, isToday, isTomorrow, parseISO, isSameDay } from "date-fns";

interface Consultation {
  id: string;
  scheduled_at: string;
  status: string;
  meeting_link: string | null;
  parent: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export default function ScheduleClient({ consultations }: { consultations: Consultation[] }) {
  const [filter, setFilter] = useState("");

  const filteredConsultations = consultations.filter(c => 
    c.parent.full_name.toLowerCase().includes(filter.toLowerCase())
  );

  // Grouping logic
  const grouped = filteredConsultations.reduce((acc, curr) => {
    const date = parseISO(curr.scheduled_at);
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(curr);
    return acc;
  }, {} as Record<string, Consultation[]>);

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Schedule</h1>
          <p className="text-slate-500 mt-1">Manage your upcoming consultations and sessions.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search patient..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
            />
          </div>
          <button className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <CalendarIcon size={20} />
            Sync Calendar
          </button>
        </div>
      </header>

      {sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <CalendarIcon className="text-blue-500" size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No appointments found</h2>
          <p className="text-slate-500 mt-2 max-w-sm text-center">
            You don't have any upcoming consultations scheduled matching your criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(dateStr => {
            const date = parseISO(dateStr);
            const items = grouped[dateStr];
            
            let dayLabel = format(date, 'EEEE, MMMM d');
            if (isToday(date)) dayLabel = "Today";
            if (isTomorrow(date)) dayLabel = "Tomorrow";

            return (
              <div key={dateStr} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isToday(date) ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  {dayLabel}
                </h3>
                
                <div className="space-y-4">
                  {items.map(consultation => (
                    <div 
                      key={consultation.id} 
                      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                      {/* Status Indicator Strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        consultation.status === 'completed' ? 'bg-slate-300' : 
                        consultation.status === 'cancelled' ? 'bg-red-400' : 'bg-blue-500'
                      }`} />

                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Time */}
                        <div className="flex flex-col items-center justify-center w-20 flex-shrink-0">
                          <span className="text-xl font-bold text-slate-900">
                            {format(parseISO(consultation.scheduled_at), 'h:mm')}
                          </span>
                          <span className="text-sm font-medium text-slate-400 uppercase">
                            {format(parseISO(consultation.scheduled_at), 'a')}
                          </span>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px h-12 bg-slate-100" />

                        {/* Patient Info */}
                        <div className="flex-1 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {consultation.parent.avatar_url ? (
                              <img src={consultation.parent.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold text-slate-400">{consultation.parent.full_name[0]}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-slate-900">{consultation.parent.full_name}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Video size={14} /> Video Consultation
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="flex items-center gap-1">
                                <Clock size={14} /> 45 mins
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-4 md:mt-0">
                          {consultation.status === 'scheduled' && (
                            <>
                              {consultation.meeting_link ? (
                                <a 
                                  href={consultation.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                >
                                  <Video size={18} />
                                  Join Meeting
                                </a>
                              ) : (
                                <button disabled className="px-6 py-2.5 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed flex items-center gap-2">
                                  <Clock size={18} />
                                  Waiting for Link
                                </button>
                              )}
                            </>
                          )}
                          
                          <button className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
