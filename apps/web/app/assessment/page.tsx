"use client";
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { ArrowLeft, Mic, Video, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AssessmentRecorder() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const [children, setChildren] = useState<{ id: string, name: string }[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  useEffect(() => {
    const fetchChildren = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('children')
          .select('id, name')
          .eq('parent_id', user.id);
        
        if (data && data.length > 0) {
          setChildren(data);
          setSelectedChildId(data[0].id);
        }
      }
    };
    fetchChildren();
  }, []);

  // Mock Audio Waveform
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isRecording]);

  const handleStart = () => {
    if (!selectedChildId) {
      alert("Please select a child first!");
      return;
    }
    
    chunksRef.current = [];
    if (webcamRef.current?.stream) {
      setIsRecording(true);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start();
    } else {
      alert("Camera not ready!");
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await uploadAssessment(blob);
      };
    }
  };

  const uploadAssessment = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const supabase = createClient();
      
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!selectedChildId) throw new Error("No child selected");

      // 3. Upload to Storage
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('assessments')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // 4. Insert Record
      const { error: dbError } = await supabase
        .from('assessments')
        .insert({
          child_id: selectedChildId,
          video_path: fileName,
          status: 'pending'
        });

      if (dbError) throw dbError;
      
      // Success
      alert("Assessment uploaded successfully!");
      router.push("/dashboard/parent");
      
    } catch (error: any) {
      console.error(error);
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard/parent" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="mr-2" size={20} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-sm font-bold text-slate-700">Child:</span>
             <select 
               className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-medical-500 outline-none"
               value={selectedChildId}
               onChange={(e) => setSelectedChildId(e.target.value)}
             >
               {children.map(child => (
                 <option key={child.id} value={child.id}>{child.name}</option>
               ))}
             </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="relative aspect-video bg-slate-900">
            {!isRecording && !isUploading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-black/30 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium border border-white/20">
                  Ready to Record
                </div>
              </div>
            )}
            
            <Webcam
              ref={webcamRef}
              audio={true}
              className="w-full h-full object-cover"
              mirrored={true}
            />

            {isRecording && (
              <div className="absolute top-6 right-6 flex items-center gap-2 animate-pulse">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                <span className="text-white font-mono text-sm font-bold drop-shadow-md">REC</span>
              </div>
            )}
            
            {/* Audio Visualizer (Mock) */}
            {isRecording && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4 gap-1">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-green-400 rounded-full transition-all duration-75"
                    style={{ 
                      height: `${Math.max(10, Math.random() * audioLevel)}%`,
                      opacity: 0.8 
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-8 flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                {isRecording ? "Recording in Progress..." : "Start Assessment"}
              </h2>
              <p className="text-slate-500 max-w-md mx-auto">
                {isRecording 
                  ? "Follow the on-screen exercises. Speak clearly and ensure good lighting." 
                  : "Please ensure the camera is positioned correctly and your child is visible."}
              </p>
            </div>

            <div className="flex gap-4">
              {!isRecording ? (
                <button
                  onClick={handleStart}
                  disabled={children.length === 0}
                  className="flex items-center gap-3 px-8 py-4 bg-medical-600 hover:bg-medical-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-medical-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video size={24} />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-red-200 hover:scale-105"
                >
                  <div className="w-4 h-4 bg-white rounded-sm" />
                  Stop & Save
                </button>
              )}
            </div>

            {isUploading && (
              <div className="flex items-center gap-3 text-medical-600 font-bold animate-pulse">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Uploading Assessment...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
