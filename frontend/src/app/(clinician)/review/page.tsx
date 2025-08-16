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
  
  const { 
    sessions, 
    setCurrentSession: setStoreSession, 
    addComment,
    setSessions 
  } = useSessionStore();

  useEffect(() => {
    // Load session data from store and API
    const loadSessionData = async () => {
      try {
        // First try to load from API (sample data)
        try {
          const apiSessions = await api.listSessions();
          if (apiSessions.length > 0) {
            setSessions(apiSessions);
          }
        } catch (error) {
          console.log('No API sessions available, using local sessions only');
        }
        
        // Show the most recent session (either from live sessions or API)
        if (sessions.length > 0) {
          // Get the most recent session
          const latestSession = sessions.reduce((latest, current) => {
            return new Date(current.startedAt) > new Date(latest.startedAt) ? current : latest;
          });
          
          // If it's a full SessionDetail, use it directly
          if ('repMetrics' in latestSession) {
            setCurrentSession(latestSession as SessionDetail);
            setStoreSession(latestSession as SessionDetail);
          } else {
            // Otherwise, try to load full details from API
            try {
              const sessionDetail = await api.getSession(latestSession.id);
              setCurrentSession(sessionDetail);
              setStoreSession(sessionDetail);
            } catch {
              // If API fails, create a basic SessionDetail from SessionSummary
              const basicDetail: SessionDetail = {
                ...latestSession,
                repMetrics: [],
                notes: 'Local session - detailed metrics not available'
              };
              setCurrentSession(basicDetail);
              setStoreSession(basicDetail);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load session data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [setStoreSession, setSessions, sessions.length]); // Re-run when sessions length changes

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
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Available</h2>
          <p className="text-gray-600 mb-6">
            Complete a live coaching session first to see data here.
          </p>
          <Link 
            href="/live" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Live Session
          </Link>
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
        {/* Session Selector */}
        {sessions.length > 1 && (
          <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Select Session to Review:</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sessions.map((session) => {
                const isActive = currentSession?.id === session.id;
                return (
                  <button
                    key={session.id}
                    onClick={() => {
                      if ('repMetrics' in session) {
                        setCurrentSession(session as SessionDetail);
                        setStoreSession(session as SessionDetail);
                      }
                    }}
                    className={`p-3 rounded-xl text-left transition-all ${
                      isActive 
                        ? 'bg-blue-50 border-2 border-blue-200 text-blue-900' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-medium">{session.exercise}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(session.startedAt).toLocaleDateString()} • {session.reps} reps
                    </div>
                    <div className="text-xs text-gray-500">
                      Score: {session.avgScore}%
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl shadow-lg border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Session Summary</h3>
            <div className="text-sm text-gray-500">
              {currentSession.localOnly ? '🏠 Local Session' : '☁️ Cloud Session'}
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{currentSession.reps}</div>
              <div className="text-sm text-gray-600 mt-1">Total Reps</div>
              <div className="text-xs text-blue-500 mt-1">
                {currentSession.reps > 0 ? '🎯 Active' : '⏸️ No activity'}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
              <div className={`text-3xl font-bold ${
                currentSession.avgScore >= 90 ? 'text-green-600' :
                currentSession.avgScore >= 80 ? 'text-blue-600' :
                currentSession.avgScore >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {currentSession.avgScore}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Average Score</div>
              <div className="text-xs text-gray-500 mt-1">
                {currentSession.avgScore >= 90 ? '🌟 Excellent' :
                 currentSession.avgScore >= 80 ? '👍 Good' :
                 currentSession.avgScore >= 70 ? '⚠️ Fair' : '❌ Poor'}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
              <div className={`text-3xl font-bold ${
                currentSession.flags.length === 0 ? 'text-green-600' :
                currentSession.flags.length <= 2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {currentSession.flags.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Form Issues</div>
              <div className="text-xs text-gray-500 mt-1">
                {currentSession.flags.length === 0 ? '✅ Perfect form' :
                 currentSession.flags.length <= 2 ? '⚠️ Minor issues' : '🚨 Needs attention'}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {currentSession.endedAt ? 
                  Math.round((Date.parse(currentSession.endedAt) - Date.parse(currentSession.startedAt)) / 1000 / 60) :
                  '0'
                }m
              </div>
              <div className="text-sm text-gray-600 mt-1">Duration</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(currentSession.startedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          {/* Form Issues Details */}
          {currentSession.flags.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-200">
              <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                ⚠️ Detected Form Issues
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {currentSession.flags.slice(0, 6).map((flag, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-700 bg-white p-2 rounded">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {flag}
                  </div>
                ))}
              </div>
              {currentSession.flags.length > 6 && (
                <div className="text-xs text-red-600 mt-2 text-center">
                  +{currentSession.flags.length - 6} more issues detected
                </div>
              )}
            </div>
          )}
          
          {currentSession.notes && (
            <div className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                📝 Session Notes
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">{currentSession.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
