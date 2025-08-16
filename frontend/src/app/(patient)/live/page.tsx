'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CameraFeed } from '@/components/CameraFeed';
import { CoachOverlay } from '@/components/CoachOverlay';
import { AngleStack } from '@/components/AngleStack';
import { ControlBar } from '@/components/ControlBar';
import { SummaryChips } from '@/components/SummaryChips';
import { AnalysisStatus } from '@/components/AnalysisStatus';
import { useLiveStore } from '@/lib/store/useLiveStore';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { usePoseAnalysis } from '@/hooks/usePoseAnalysis';
import { createPoseEngine } from '@/lib/pose/factory';
import type { SessionDetail } from '@/types';

const ANALYSIS_INTERVAL = 500; // 500ms for smooth real-time analysis

export default function LiveCoachPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [poseEngine, setPoseEngine] = useState<any>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [sessionSummary, setSessionSummary] = useState<{
    exercise: string;
    totalReps: number;
    finalScore: number;
    duration: number;
    lastFeedback: string;
  } | null>(null);
  
  // Custom hooks for clean separation of concerns
  const {
    isAnalyzing,
    lastResult,
    error: analysisError,
    startAnalysis,
    stopAnalysis,
    resetState: resetAnalysis
  } = usePoseAnalysis();
  
  // Store state
  const {
    isActive,
    exercise,
    currentPose,
    currentAngles,
    currentFlags,
    currentScore,
    currentRep,
    startSession,
    stopSession,
    updatePose,
    updateAngles,
    updateFlags,
    updateScore,
    updateRep
  } = useLiveStore();

  // Session store for saving completed sessions
  const { addSession } = useSessionStore();

  // Initialize pose engine when session starts
  useEffect(() => {
    if (isActive && videoRef.current && !poseEngine) {
      console.log('🎯 Initializing pose engine...');
      const engine = createPoseEngine();
      engine.init(videoRef.current);
      setPoseEngine(engine);
      console.log('✅ Pose engine initialized');
    }
    
    return () => {
      if (poseEngine && !isActive) {
        poseEngine.dispose();
        setPoseEngine(null);
      }
    };
  }, [isActive, poseEngine]);

  // Start/stop analysis based on session state
  useEffect(() => {
    if (isActive && videoRef.current && !isAnalyzing) {
      startAnalysis({
        exerciseType: exercise,
        intervalMs: ANALYSIS_INTERVAL,
        enabled: true
      }, videoRef.current);
    } else if (!isActive && isAnalyzing) {
      stopAnalysis();
    }
    
    return () => {
      if (isAnalyzing) {
        stopAnalysis();
      }
    };
  }, [isActive, exercise, startAnalysis, stopAnalysis, isAnalyzing]);

  // Update store with analysis results
  useEffect(() => {
    if (lastResult) {
      console.log('� Analysis result:', lastResult);
      
      // Update angles based on exercise type
      const angles: any = {};
      if (exercise.toLowerCase() === 'pullup') {
        angles.armpit = lastResult.angle;
      } else if (exercise.toLowerCase() === 'squat') {
        angles.knee = lastResult.angle;
      } else if (exercise.toLowerCase() === 'shoulderabduction') {
        angles.shoulder = lastResult.angle;
      }
      
      updateAngles(angles);
      updateFlags([lastResult.feedback]);
      updateScore(Math.max(0, 100 - lastResult.reps));
      updateRep(lastResult.reps);
    }
  }, [lastResult, exercise, updateAngles, updateFlags, updateScore, updateRep]);

  // Pose estimation for overlay (frontend pose detection)
  useEffect(() => {
    let animationId: number;
    
    const estimatePose = async () => {
      if (poseEngine && isActive) {
        try {
          const pose = await poseEngine.estimate();
          if (pose) {
            updatePose(pose);
          }
        } catch (error) {
          console.error('Pose estimation error:', error);
        }
      }
      
      if (isActive) {
        animationId = requestAnimationFrame(estimatePose);
      }
    };
    
    if (isActive) {
      estimatePose();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [poseEngine, isActive, updatePose]);

  // Session management
  const handleStartSession = (selectedExercise: 'Squat' | 'ShoulderAbduction' | 'Pullup') => {
    console.log('🎯 Starting session for:', selectedExercise);
    
    // Clear any previous session summary
    setSessionSummary(null);
    
    startSession(selectedExercise);
    setIsCameraActive(true);
    resetAnalysis();
    console.log('✅ Session started');
  };

  const handleStopSession = async () => {
    console.log('🛑 Stopping session');
    
    // Get session data from store before resetting
    const liveStore = useLiveStore.getState();
    const sessionStartTime = liveStore.startTime;
    const sessionEndTime = Date.now();
    
    // Capture session summary before resetting
    const summary = {
      exercise,
      totalReps: currentRep,
      finalScore: currentScore,
      duration: sessionEndTime - (sessionStartTime || sessionEndTime),
      lastFeedback: currentFlags[currentFlags.length - 1] || 'No feedback'
    };
    
    console.log('📊 Session Summary:', summary);
    
    // Create a completed session record
    const sessionDetail: SessionDetail = {
      id: `session-${Date.now()}`,
      patientId: 'patient-1', // Default patient ID
      exercise,
      startedAt: new Date(sessionStartTime || sessionEndTime).toISOString(),
      endedAt: new Date(sessionEndTime).toISOString(),
      avgScore: currentScore,
      flags: Array.from(new Set(currentFlags)), // Remove duplicates
      reps: currentRep,
      localOnly: true,
      repMetrics: liveStore.repMetrics || [],
      notes: `Session completed with ${currentRep} reps. Final feedback: ${summary.lastFeedback}`
    };
    
    // Save session to global store
    addSession(sessionDetail);
    console.log('💾 Session saved to store:', sessionDetail);
    
    // Stop all processes
    stopSession();
    stopAnalysis();
    setIsCameraActive(false);
    
    // Reset backend rep counter
    try {
      await fetch('http://localhost:5000/api/reset-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('🔄 Backend rep counter reset');
    } catch (error) {
      console.warn('⚠️ Failed to reset backend counter:', error);
    }
    
    // Reset pose engine
    if (poseEngine) {
      poseEngine.dispose();
      setPoseEngine(null);
    }
    
    // Reset all store state
    useLiveStore.getState().reset();
    
    // Reset local component state
    setShowOverlay(true);
    
    // Show session summary
    setSessionSummary(summary);
    
    // Display final summary
    const durationMin = Math.round(summary.duration / 60000);
    console.log(`✅ Session completed and saved - ${summary.exercise}: ${summary.totalReps} reps in ${durationMin}min, Score: ${summary.finalScore}/100`);
  };

  return (
    <div className="min-h-screen bg-cool">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Live Coach</h1>
          </div>
          <div className="text-sm text-gray-600">
            {process.env.NEXT_PUBLIC_LOCAL_ONLY === 'true' ? '🔒 Local Only' : '🌐 Cloud Connected'}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Control Bar */}
        <ControlBar
          exercise={exercise}
          isActive={isActive}
          onStartSession={handleStartSession}
          onStopSession={handleStopSession}
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Main Camera Feed */}
          <div className="lg:col-span-2">
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
              {/* Overlay Toggle */}
              {isActive && (
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={() => setShowOverlay(!showOverlay)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      showOverlay 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
                  </button>
                </div>
              )}

              {/* Camera Feed */}
              <CameraFeed
                ref={videoRef}
                isActive={isCameraActive}
                onCameraActive={setIsCameraActive}
              />
              
              {/* Pose Overlay */}
              {isActive && currentPose && showOverlay && (
                <CoachOverlay
                  ref={canvasRef}
                  pose={currentPose}
                  flags={currentFlags}
                />
              )}

              {/* Analysis Status */}
              <AnalysisStatus
                isAnalyzing={isAnalyzing}
                lastResult={lastResult}
                error={analysisError}
              />
            </div>
          </div>

          {/* Right Column - Angle Stack */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <AngleStack
                angles={currentAngles}
                exercise={exercise}
                isActive={isActive}
              />
              
              {/* Summary Chips */}
              <div className="mt-6">
                <SummaryChips
                  reps={currentRep}
                  avgScore={currentScore}
                  flags={currentFlags}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Session Status */}
        {isActive && (
          <div className="mt-8 p-6 bg-white rounded-3xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Active Session: {exercise}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium">📊 Reps:</span>
                    <span className="font-semibold">{currentRep}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">🎯 Score:</span>
                    <span className="font-semibold">{currentScore}/100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-medium">⚡ Status:</span>
                    <span className={`font-semibold ${isAnalyzing ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isAnalyzing ? '🔄 Active' : '⏸️ Paused'}
                    </span>
                  </div>
                </div>
                {currentFlags.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700 font-medium">💬 Latest Feedback: </span>
                    <span className="text-sm text-blue-800">{currentFlags[currentFlags.length - 1]}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleStopSession}
                className="btn-secondary ml-6 hover:bg-red-500 hover:text-white transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        )}

        {/* Session Summary */}
        {sessionSummary && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl shadow-lg border-2 border-green-200">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎉 Session Complete!
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Exercise</div>
                  <div className="text-lg font-semibold text-blue-600">{sessionSummary.exercise}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Total Reps</div>
                  <div className="text-lg font-semibold text-green-600">{sessionSummary.totalReps}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Final Score</div>
                  <div className="text-lg font-semibold text-purple-600">{sessionSummary.finalScore}/100</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {Math.round(sessionSummary.duration / 60000)}min
                  </div>
                </div>
              </div>
              {sessionSummary.lastFeedback && sessionSummary.lastFeedback !== 'No feedback' && (
                <div className="bg-white p-3 rounded-lg shadow mb-4">
                  <div className="text-sm text-gray-600 mb-1">Final Feedback</div>
                  <div className="text-sm font-medium text-gray-800">{sessionSummary.lastFeedback}</div>
                </div>
              )}
              <button
                onClick={() => setSessionSummary(null)}
                className="btn-primary"
              >
                Start New Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
