"use client";
import React, { useState, useEffect } from "react";
import { Play, FileText, Activity, History, ChevronDown, Save, CheckCircle } from "lucide-react";
import ReactPlayer from "react-player";
import { createClient } from "@/lib/supabase/client";

interface Assessment {
  id: string;
  created_at: string;
  video_path: string;
  status: string;
  specialist_notes: string;
  signedUrl?: string; // Passed from server or generated
  children: {
    name: string;
    id: string;
  };
}

export default function SpecialistCockpitClient({ initialAssessments }: { initialAssessments: Assessment[] }) {
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [selectedId, setSelectedId] = useState<string | null>(initialAssessments[0]?.id || null);
  const [activeTab, setActiveTab] = useState("notes");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedAssessment = assessments.find(a => a.id === selectedId);

  useEffect(() => {
    if (selectedAssessment) {
      setNotes(selectedAssessment.specialist_notes || "");
    }
  }, [selectedId, selectedAssessment]);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('assessments')
      .update({ 
        specialist_notes: notes,
        status: 'reviewed' // Mark as reviewed when saved
      })
      .eq('id', selectedId);

    if (error) {
      alert("Error saving notes: " + error.message);
    } else {
      // Update local state
      setAssessments(prev => prev.map(a => 
        a.id === selectedId ? { ...a, specialist_notes: notes, status: 'reviewed' } : a
      ));
      alert("Notes saved successfully!");
    }
    setSaving(false);
  };

  if (!selectedAssessment) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        No pending assessments found. Good job!
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6 overflow-hidden">
      {/* Left Side: Video Player */}
      <div className="flex-1 bg-black rounded-2xl overflow-hidden relative group flex flex-col">
         {/* List Selector (Overlay or Top) */}
         <div className="absolute top-4 left-4 z-10">
            <select 
              value={selectedId || ""} 
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-black/50 text-white border border-white/20 rounded-lg px-3 py-1 backdrop-blur-md"
            >
              {assessments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.children.name} - {new Date(a.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
         </div>

        <div className="flex-1 relative bg-slate-900 flex items-center justify-center">
           {selectedAssessment.signedUrl ? (
             <ReactPlayer 
               url={selectedAssessment.signedUrl} 
               controls 
               width="100%" 
               height="100%" 
             />
           ) : (
             <p className="text-white">Video unavailable</p>
           )}
        </div>

        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent text-white absolute bottom-0 w-full pointer-events-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Assessment #{selectedAssessment.id.slice(0, 8)} - {selectedAssessment.children.name}</h3>
              <p className="text-xs text-slate-300">
                Recorded {new Date(selectedAssessment.created_at).toLocaleString()}
              </p>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedAssessment.status === 'reviewed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {selectedAssessment.status}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Clinical Workspace */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Clinical Workspace</h2>
            <p className="text-sm text-slate-500">Patient: {selectedAssessment.children.name}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              View Profile
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-medical-600 text-white rounded-lg text-sm font-medium hover:bg-medical-700 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : <><Save size={16} /> Save Session</>}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "notes"
                ? "border-medical-600 text-medical-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText size={16} /> Clinical Notes
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "history"
                ? "border-medical-600 text-medical-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <History size={16} /> History
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Prescription Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Recommended Intervention</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent">
                    <option>Select Protocol...</option>
                    <option>Occupational Therapy - Sensory Integration</option>
                    <option>Speech Therapy - Articulation</option>
                    <option>Behavioral Therapy - ABA</option>
                    <option>Social Skills Group</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Note Editor */}
              <div className="space-y-2 h-full">
                <label className="text-sm font-semibold text-slate-700">Session Observations</label>
                <textarea
                  className="w-full h-64 p-4 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent resize-none leading-relaxed"
                  placeholder="Type clinical observations here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex items-center justify-center h-full text-slate-400">
               <p>No previous history available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
