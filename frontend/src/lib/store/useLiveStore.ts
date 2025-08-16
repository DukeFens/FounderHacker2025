import { create } from 'zustand';
import { Exercise, PoseResult, RepMetric } from '@/types';
import { Angles } from '@/lib/pose/angles';
import { RepDetector } from '@/lib/pose/repDetector';

interface LiveState {
  // Session state
  isActive: boolean;
  isRecording: boolean;
  exercise: Exercise;
  startTime: number | null;
  
  // Pose data
  currentPose: PoseResult | null;
  currentAngles: Angles;
  currentFlags: string[];
  currentScore: number;
  
  // Rep tracking
  repDetector: RepDetector | null;
  repMetrics: RepMetric[];
  currentRep: number;
  
  // Actions
  startSession: (exercise: Exercise) => void;
  stopSession: () => void;
  toggleRecording: () => void;
  updatePose: (pose: PoseResult) => void;
  updateAngles: (angles: Angles) => void;
  updateFlags: (flags: string[]) => void;
  updateScore: (score: number) => void;
  updateRep: (rep: number) => void;
  reset: () => void;
}

export const useLiveStore = create<LiveState>((set, get) => ({
  // Initial state
  isActive: false,
  isRecording: false,
  exercise: 'Pullup', // Changed default to Pullup since backend works best with this
  startTime: null,
  
  currentPose: null,
  currentAngles: {},
  currentFlags: [],
  currentScore: 100,
  
  repDetector: null,
  repMetrics: [],
  currentRep: 0,
  
  // Actions
  startSession: (exercise: Exercise) => {
    const repDetector = new RepDetector(exercise);
    set({
      isActive: true,
      exercise,
      startTime: Date.now(),
      repDetector,
      currentRep: 0,
      repMetrics: [],
      currentScore: 100
    });
  },
  
  stopSession: () => {
    set({
      isActive: false,
      isRecording: false,
      startTime: null,
      repDetector: null
    });
  },
  
  toggleRecording: () => {
    set(state => ({ isRecording: !state.isRecording }));
  },
  
  updatePose: (pose: PoseResult) => {
    set({ currentPose: pose });
    
    // Update rep detection
    const { repDetector, currentAngles } = get();
    if (repDetector && currentAngles) {
      const repData = repDetector.update(currentAngles, Date.now());
      set({ currentRep: repData.repCount });
      
      // If rep completed, add to metrics
      if (repData.state === 'up' && repData.repCount > get().currentRep) {
        const newMetric: RepMetric = {
          repIndex: repData.repCount,
          tStart: repData.currentRepStart || Date.now(),
          tEnd: Date.now(),
          angles: currentAngles,
          flags: get().currentFlags,
          score: get().currentScore,
        };
        
        set(state => ({
          repMetrics: [...state.repMetrics, newMetric]
        }));
      }
    }
  },
  
  updateAngles: (angles: Angles) => {
    set({ currentAngles: angles });
  },
  
  updateFlags: (flags: string[]) => {
    set({ currentFlags: flags });
  },
  
  updateScore: (score: number) => {
    set({ currentScore: score });
  },
  
  updateRep: (rep: number) => {
    set({ currentRep: rep });
  },
  
  reset: () => {
    set({
      isActive: false,
      isRecording: false,
      startTime: null,
      currentPose: null,
      currentAngles: {},
      currentFlags: [],
      currentScore: 100,
      repDetector: null,
      repMetrics: [],
      currentRep: 0
    });
  }
}));
