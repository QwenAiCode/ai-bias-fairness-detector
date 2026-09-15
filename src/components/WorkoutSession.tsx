import React, { useState, useRef, useEffect } from 'react';
import { Workout } from '../data/workouts';
import { usePoseDetection } from '../hooks/usePoseDetection';

interface WorkoutSessionProps {
  workout: Workout;
  onBack: () => void;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({ workout, onBack }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(workout.duration);
  const [reps, setReps] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { isDetecting, landmarks, error, startDetection, stopDetection, canvasRef } = usePoseDetection();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isStarted && timeRemaining > 0 && isActive) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      stopDetection();
      stopCamera();
    }

    return () => clearInterval(interval);
  }, [isStarted, timeRemaining, isActive, stopDetection]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
            
            startDetection(videoRef.current, workout.id);
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Please allow camera access to use the AI trainer feature.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    startCamera();
  };

  const handlePause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setTimeRemaining(workout.duration);
    setReps(0);
    setIsActive(true);
    stopDetection();
    stopCamera();
    startCamera();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    if (!landmarks) return 'bg-gray-500';
    const visibility = landmarks[0]?.visibility || 0;
    return visibility > 0.5 ? 'bg-green-500' : 'bg-yellow-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-indigo-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back to Workouts</span>
          </button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white">{workout.name}</h1>
          
          <div className="w-32"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video Feed Section */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative bg-black aspect-video">
              {!isStarted ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <svg className="w-24 h-24 mb-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xl font-semibold mb-4">Enable Camera for AI Tracking</p>
                  <p className="text-gray-400 text-center max-w-md px-4">
                    Our AI trainer will analyze your form in real-time and provide instant feedback
                  </p>
                  <button
                    onClick={handleStart}
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105"
                  >
                    Start with AI Trainer
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />
                  
                  {/* Status Indicator */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
                    <span className="text-white text-sm font-medium">
                      {isDetecting ? 'AI Tracking Active' : 'Loading...'}
                    </span>
                  </div>

                  {/* Rep Counter */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full px-4 py-2">
                    <span className="text-white text-lg font-bold">Reps: {reps}</span>
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            {isStarted && (
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-center space-x-6">
                  <button
                    onClick={handleReset}
                    className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handlePause}
                    className="p-6 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors shadow-lg"
                  >
                    {isActive ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="text-3xl font-bold text-gray-800 w-24 text-center">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Reference Video & Info Section */}
          <div className="space-y-6">
            {/* Tutorial Video */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 bg-indigo-600 text-white">
                <h2 className="text-xl font-bold">Proper Form Guide</h2>
              </div>
              <div className="aspect-video">
                <iframe
                  src={workout.videoUrl}
                  title={`${workout.name} tutorial`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Workout Info */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Workout Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-lg font-semibold">{formatTime(workout.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Calories Burned</p>
                    <p className="text-lg font-semibold">~{workout.calories * workout.duration / 60} cal</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Target Muscles</p>
                    <p className="text-lg font-semibold">{workout.targetMuscles.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{workout.description}</p>
              </div>
            </div>

            {/* AI Tips */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-xl font-bold">AI Trainer Tips</h2>
              </div>
              
              {landmarks ? (
                <div className="space-y-3">
                  <p className="text-indigo-100">
                    {landmarks[0]?.visibility > 0.5 
                      ? "✓ Body detected! Make sure to maintain proper form throughout the exercise."
                      : "⚠ Adjust your position so your full body is visible in the camera."}
                  </p>
                  <p className="text-sm text-indigo-200">
                    The AI is tracking {landmarks.filter(l => l.visibility > 0.5).length} body landmarks in real-time.
                  </p>
                </div>
              ) : (
                <p className="text-indigo-100">
                  Start the workout to activate real-time AI form analysis and receive instant feedback!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
