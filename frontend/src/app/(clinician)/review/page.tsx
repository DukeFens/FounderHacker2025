'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VideoPlayer } from '@/components/VideoPlayer';
import { TimelineMarkers } from '@/components/TimelineMarkers';
import { CommentPanel } from '@/components/CommentPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { api } from '@/lib/adapters/api';
import { SessionDetail } from '@/types';

export default function ClinicianReviewPage() {
  const [currentSession, setCurrentSession] = useState<SessionDetail | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { setCurrentSession: setStoreSession, addComment } = useSessionStore();

  useEffect(() => {
    // Load sample session data
    const loadSampleData = async () => {
      try {
        const sessions = await api.listSessions();
        if (sessions.length > 0) {
          const sessionDetail = await api.getSession(sessions[0].id);
          setCurrentSession(sessionDetail);
          setStoreSession(sessionDetail);
        }
      } catch (error) {
        console.error('Failed to load sample data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSampleData();
  }, [setStoreSession]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleAddComment = async (text: string) => {
    if (!currentSession) return;

    try {
      const newComment = await api.createComment(currentSession.id, {
        author: 'clinician',
        t: currentTime,
        text
      });
      
      addComment(newComment);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session data...</p>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No session data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
              ← Back to Home
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Session Review</h1>
          <p className="text-gray-600">
            {currentSession.exercise} • {new Date(currentSession.startedAt).toLocaleDateString()}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <VideoPlayer
                videoUrl={currentSession.videoUrl || '/api/mock-video'}
                onTimeUpdate={handleTimeUpdate}
                currentTime={currentTime}
              />
              
              {/* Timeline Markers */}
              <div className="p-6">
                <TimelineMarkers
                  repMetrics={currentSession.repMetrics}
                  currentTime={currentTime}
                  onTimeSelect={setCurrentTime}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Metrics & Comments */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Metrics Panel */}
              <MetricsPanel session={currentSession} />
              
              {/* Comment Panel */}
              <CommentPanel
                sessionId={currentSession.id}
                currentTime={currentTime}
                onAddComment={handleAddComment}
              />
            </div>
          </div>
        </div>

        {/* Session Summary */}
        <div className="mt-8 p-6 bg-white rounded-3xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentSession.reps}</div>
              <div className="text-sm text-gray-600">Total Reps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentSession.avgScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{currentSession.flags.length}</div>
              <div className="text-sm text-gray-600">Form Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((Date.parse(currentSession.endedAt || '') - Date.parse(currentSession.startedAt)) / 1000 / 60)}m
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
          
          {currentSession.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-gray-700">{currentSession.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
