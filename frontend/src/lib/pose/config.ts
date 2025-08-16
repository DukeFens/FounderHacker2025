export const POSE_CONFIG = {
  // Angle thresholds
  SQUAT: {
    MIN_DEPTH_ANGLE: 90, // degrees
    MAX_TORSO_LEAN: 15, // degrees from vertical
    MIN_ECCENTRIC_TIME: 1000, // ms
    KNEE_VALGUS_THRESHOLD: 0.1, // normalized distance
  },
  
  SHOULDER_ABDUCTION: {
    TARGET_ROM: 90, // degrees
    ROM_TOLERANCE: 10, // degrees
    MAX_ELBOW_ABOVE_SHOULDER: 0.05, // normalized distance
    SYMMETRY_THRESHOLD: 15, // degrees difference
  },
  
  // General thresholds
  MIN_CONFIDENCE: 0.5,
  MIN_KEYPOINTS: 8,
  
  // Timing
  RULE_DEBOUNCE: 1000, // ms
  REP_DETECTION_DEBOUNCE: 500, // ms
  
  // Scoring
  BASE_SCORE: 100,
  FLAG_DEDUCTION: 10,
  MAX_DEDUCTION: 50,
} as const;
