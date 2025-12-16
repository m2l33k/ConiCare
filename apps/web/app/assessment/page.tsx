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

      // 2. Get Child (First one for MVP)
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id)
        .limit(1);
        
      if (!children || children.length === 0) throw new Error("No child profile found");
      const childId = children[0].id;

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
          child_id: childId,
          video_path: fileName,
          status: 'pending'
        });

      if (dbError) throw dbError;

      // Success
      setStep(2);
      setTimeout(() => {
        alert("Assessment uploaded successfully!");
        router.push("/dashboard/parent");
      }, 1000);

    } catch (error: any) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center text-white z-10">
        <Link href="/dashboard/parent" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Cancel Assessment
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold tracking-wider">LIVE INPUT</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4">
        {/* Video Feed Container */}
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <Webcam
            audio={true}
            ref={webcamRef}
            className="w-full h-full object-cover"
            mirrored={true}
          />

          {/* Overlay Instructions */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {step === 1 && !isRecording && !isUploading && (
              <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl text-center max-w-lg border border-white/10 pointer-events-auto">
                <h2 className="text-3xl font-bold text-white mb-4">Ready for Assessment</h2>
                <p className="text-slate-200 text-lg mb-8">
                  Please ensure the child is visible and facing the camera. We will analyze eye contact and response time.
                </p>
                <button 
                  onClick={handleStart}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg shadow-lg shadow-red-900/50 transition-all hover:scale-105 flex items-center gap-3 mx-auto"
                >
                  <Video size={24} /> Start Recording
                </button>
              </div>
            )}

            {isRecording && (
              <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/10 mb-8 text-center animate-fade-in-up">
                  <p className="text-white/80 text-sm uppercase tracking-widest font-bold mb-1">Instruction</p>
                  <h3 className="text-3xl font-bold text-white">"Leo, look here!"</h3>
                </div>
                
                <button 
                  onClick={handleStop}
                  className="px-8 py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-full font-bold text-lg shadow-lg transition-all hover:scale-105 flex items-center gap-3"
                >
                  <div className="w-4 h-4 bg-red-600 rounded-sm" /> Stop Assessment
                </button>
              </div>
            )}

            {isUploading && (
               <div className="bg-black/60 backdrop-blur-md p-8 rounded-2xl text-center max-w-lg border border-white/10">
                 <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                 <h2 className="text-2xl font-bold text-white">Uploading...</h2>
                 <p className="text-slate-300">Please wait while we secure the footage.</p>
               </div>
            )}
          </div>

          {/* Audio Waveform Feedback */}
          <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
            <Mic size={16} className={isRecording ? "text-green-400" : "text-slate-400"} />
            <div className="flex gap-1 h-4 items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full transition-all duration-75"
                  style={{
                    height: isRecording ? `${Math.max(4, Math.random() * audioLevel)}px` : '4px',
                    opacity: isRecording ? 1 : 0.3
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
