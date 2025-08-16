import { create } from 'zustand';
import { SessionSummary, SessionDetail, Comment } from '@/types';

interface SessionState {
  // Current session
  currentSession: SessionDetail | null;
  
  // Session list
  sessions: SessionSummary[];
  
  // Comments
  comments: Comment[];
  
  // Actions
  setCurrentSession: (session: SessionDetail | null) => void;
  addSession: (session: SessionDetail) => void;
  updateSession: (id: string, updates: Partial<SessionDetail>) => void;
  setSessions: (sessions: SessionSummary[]) => void;
  addComment: (comment: Comment) => void;
  removeComment: (commentId: string) => void;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  currentSession: null,
  sessions: [],
  comments: [],
  
  // Actions
  setCurrentSession: (session: SessionDetail | null) => {
    set({ currentSession: session });
  },
  
  addSession: (session: SessionDetail) => {
    set(state => ({
      sessions: [...state.sessions, session]
    }));
  },
  
  updateSession: (id: string, updates: Partial<SessionDetail>) => {
    set(state => ({
      sessions: state.sessions.map(session => 
        session.id === id ? { ...session, ...updates } : session
      ),
      currentSession: state.currentSession?.id === id 
        ? { ...state.currentSession, ...updates }
        : state.currentSession
    }));
  },
  
  setSessions: (sessions: SessionSummary[]) => {
    set({ sessions });
  },
  
  addComment: (comment: Comment) => {
    set(state => ({
      comments: [...state.comments, comment]
    }));
  },
  
  removeComment: (commentId: string) => {
    set(state => ({
      comments: state.comments.filter(comment => comment.id !== commentId)
    }));
  },
  
  clearSessions: () => {
    set({
      currentSession: null,
      sessions: [],
      comments: []
    });
  }
}));
