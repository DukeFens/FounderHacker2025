export type ID = string;
export type Exercise = 'Squat' | 'ShoulderAbduction' | 'Pullup';

export type Keypoint = { 
  name: string; 
  x: number; 
  y: number; 
  z?: number; 
  score?: number 
};

export type PoseResult = { 
  keypoints: Keypoint[]; 
  fps?: number 
};

export interface RepMetric {
  repIndex: number;
  tStart: number; 
  tEnd: number; // ms
  angles: { 
    hip?: number; 
    knee?: number; 
    shoulder?: number; 
    torso?: number 
  };
  flags: string[];
  score: number; // 0–100
}

export interface SessionSummary {
  id: ID; 
  patientId: ID; 
  exercise: Exercise;
  startedAt: string; 
  endedAt?: string;
  avgScore: number; 
  flags: string[]; 
  reps: number;
  videoUrl?: string; 
  localOnly: boolean;
}

export interface SessionDetail extends SessionSummary { 
  repMetrics: RepMetric[]; 
  notes?: string; 
}

export interface Comment { 
  id: ID; 
  sessionId: ID; 
  author: 'clinician'|'patient'; 
  t: number; 
  text: string; 
  createdAt: string; 
}

export interface Appointment { 
  id: ID; 
  patientId: ID; 
  sessionId?: ID; 
  when: string; 
  notes?: string; 
}

export interface PresignedUpload { 
  uploadUrl: string; 
  fileUrl: string; 
}
