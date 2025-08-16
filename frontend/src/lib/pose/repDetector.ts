import { Exercise } from '@/types';
import { POSE_CONFIG } from './config';

export type RepState = 'idle' | 'down' | 'up' | 'completed';

export interface RepDetection {
  state: RepState;
  repCount: number;
  currentRepStart?: number;
  lastRepTime?: number;
}

export class RepDetector {
  private state: RepState = 'idle';
  private repCount = 0;
  private currentRepStart?: number;
  private lastRepTime?: number;
  private lastStateChange = 0;
  private exercise: Exercise;

  constructor(exercise: Exercise) {
    this.exercise = exercise;
  }

  update(angles: any, timestamp: number): RepDetection {
    const newState = this.determineState(angles);
    
    if (newState !== this.state) {
      this.handleStateChange(newState, timestamp);
    }

    return {
      state: this.state,
      repCount: this.repCount,
      currentRepStart: this.currentRepStart,
      lastRepTime: this.lastRepTime
    };
  }

  private determineState(angles: any): RepState {
    if (this.exercise === 'Squat') {
      return this.determineSquatState(angles);
    } else if (this.exercise === 'ShoulderAbduction') {
      return this.determineShoulderState(angles);
    }
    
    return 'idle';
  }

  private determineSquatState(angles: any): RepState {
    const kneeAngle = angles.knee || 180;
    
    if (kneeAngle < 120) {
      return 'down';
    } else if (kneeAngle > 160) {
      return 'up';
    }
    
    return this.state; // Maintain current state
  }

  private determineShoulderState(angles: any): RepState {
    const shoulderAngle = angles.shoulder || 0;
    
    if (shoulderAngle > 80) {
      return 'up';
    } else if (shoulderAngle < 20) {
      return 'down';
    }
    
    return this.state; // Maintain current state
  }

  private handleStateChange(newState: RepState, timestamp: number): void {
    const now = timestamp;
    const timeSinceLastChange = now - this.lastStateChange;
    
    // Debounce rapid state changes
    if (timeSinceLastChange < POSE_CONFIG.REP_DETECTION_DEBOUNCE) {
      return;
    }

    if (this.state === 'down' && newState === 'up') {
      // Rep completed
      this.repCount++;
      this.lastRepTime = now - (this.currentRepStart || now);
      this.currentRepStart = undefined;
    } else if (newState === 'down') {
      // Rep started
      this.currentRepStart = now;
    }

    this.state = newState;
    this.lastStateChange = now;
  }

  reset(): void {
    this.state = 'idle';
    this.repCount = 0;
    this.currentRepStart = undefined;
    this.lastRepTime = undefined;
    this.lastStateChange = 0;
  }

  getCurrentRep(): RepDetection {
    return {
      state: this.state,
      repCount: this.repCount,
      currentRepStart: this.currentRepStart,
      lastRepTime: this.lastRepTime
    };
  }
}
