"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2, Volume2, AlertCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SpeechAnalysisPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await analyzeAudio(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
      setResult(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    // Optional: Add target text if we had a reading exercise
    // formData.append("target_text", "The quick brown fox jumps over the lazy dog.");

    try {
      const response = await fetch("http://localhost:8000/analyze/speech", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResult(data);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze speech. Is the AI service running?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Speech Fluency Analysis</h1>
        <p className="text-slate-600">
          Record your child's speech to analyze fluency, words per minute, and clarity using AI.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
        
        {/* Recording Controls */}
        <div className="mb-8 relative">
          {isRecording && (
            <div className="absolute -inset-4 bg-red-100 rounded-full animate-ping opacity-75"></div>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-200" 
                : "bg-medical-600 hover:bg-medical-700 text-white shadow-medical-200"
            } shadow-xl`}
          >
            {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
          </button>
        </div>

        <p className="text-lg font-medium text-slate-700 mb-2">
          {isRecording ? "Recording... Tap to stop" : "Tap microphone to start"}
        </p>
        
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-medical-600 mt-4">
            <Loader2 className="animate-spin" />
            <span>Analyzing speech patterns...</span>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 max-w-md">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-3">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              Analysis Complete
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-sm text-slate-700 leading-relaxed">
              "{result.transcription}"
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
            <div className="text-blue-600 font-medium mb-1">Words Per Minute</div>
            <div className="text-3xl font-bold text-blue-900">{result.words_per_minute}</div>
            <div className="text-xs text-blue-500 mt-1">Normal conversation: 120-150</div>
          </div>

          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center">
            <div className="text-purple-600 font-medium mb-1">Duration</div>
            <div className="text-3xl font-bold text-purple-900">{result.duration_seconds}s</div>
            <div className="text-xs text-purple-500 mt-1">Seconds recorded</div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
            <div className="text-emerald-600 font-medium mb-1">Fluency Score</div>
            <div className="text-3xl font-bold text-emerald-900">{result.fluency_score}%</div>
            <div className="text-xs text-emerald-500 mt-1">Based on speech rate</div>
          </div>
        </div>
      )}
    </div>
  );
}
