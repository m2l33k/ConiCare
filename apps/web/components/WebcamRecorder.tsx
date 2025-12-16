"use client";
import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, StopCircle, Loader2 } from "lucide-react";

export default function WebcamRecorder() {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    if (webcamRef.current?.stream) {
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm",
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    }
  }, [webcamRef]);

  const handleDataAvailable = useCallback(
    ({ data }: { data: Blob }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => [...prev, data]);
      }
    },
    []
  );

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setCapturing(false);
  }, [mediaRecorderRef]);

  const handleUpload = useCallback(async () => {
    if (recordedChunks.length) {
      setUploading(true);
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      
      // Simulation of Supabase Upload
      console.log("Uploading blob size:", blob.size);
      
      // Mock delay
      setTimeout(() => {
        setUploading(false);
        setRecordedChunks([]);
        alert("Video uploaded to AI Assessment Engine!");
      }, 2000);
    }
  }, [recordedChunks]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video w-full max-w-md shadow-lg">
        <Webcam
          audio={true}
          ref={webcamRef}
          className="w-full h-full object-cover"
        />
        {capturing && (
          <div className="absolute top-4 right-4 animate-pulse">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {capturing ? (
          <button
            onClick={handleStopCaptureClick}
            className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all"
          >
            <StopCircle size={20} /> Stop Recording
          </button>
        ) : (
          <button
            onClick={handleStartCaptureClick}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all"
          >
            <Camera size={20} /> Start Analysis
          </button>
        )}

        {recordedChunks.length > 0 && !capturing && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-all disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Submit to AI"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
