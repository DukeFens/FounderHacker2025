from .feedback_rules import calculate_angle  # Use relative import

class RepCounter:
    def __init__(self, exercise="pullup"):
        self.exercise = exercise
        self.count = 0
        self.stage = None  # "up" or "down"
    
    @property
    def reps(self):
        """Property to access count as reps"""
        return self.count

    def update(self, landmarks):
        """Update repetition count based on exercise and pose landmarks"""
        if not landmarks:
            return self.count, 0  # Return 0 when no angle

        if self.exercise == "pullup":
            return self._count_pullup(landmarks)
        elif self.exercise == "squat":
            return self._count_squat(landmarks)
        elif self.exercise == "shoulderabduction":
            return self._count_shoulder_abduction(landmarks)

        return self.count, 0

    def _count_pullup(self, landmarks):
        """Count pull-up repetitions based on armpit (shoulder-elbow-hip) angle"""
        if landmarks is None:
            return self.count, 0

        shoulder = landmarks[12]  # right shoulder
        elbow = landmarks[14]     # right elbow
        hip = landmarks[24]       # right hip

        armpit_angle = calculate_angle(elbow, shoulder, hip)

        # Going up: armpit angle closes
        if armpit_angle < 90:
            self.stage = "up"

        # Going down: armpit angle opens → count
        if armpit_angle > 160 and self.stage == "up":
            self.stage = "down"
            self.count += 1

        return self.count, armpit_angle
    
    def _count_squat(self, landmarks):
        """Count squat repetitions based on knee angle"""
        if landmarks is None:
            return self.count, 0

        hip = landmarks[24]       # right hip
        knee = landmarks[26]      # right knee
        ankle = landmarks[28]     # right ankle

        knee_angle = calculate_angle(hip, knee, ankle)

        # Going down: knee angle decreases
        if knee_angle < 120:
            self.stage = "down"

        # Going up: knee angle increases → count
        if knee_angle > 160 and self.stage == "down":
            self.stage = "up"
            self.count += 1

        return self.count, knee_angle
    
    def _count_shoulder_abduction(self, landmarks):
        """Count shoulder abduction repetitions based on arm angle"""
        if landmarks is None:
            return self.count, 0

        shoulder = landmarks[12]  # right shoulder
        elbow = landmarks[14]     # right elbow
        hip = landmarks[24]       # right hip

        arm_angle = calculate_angle(hip, shoulder, elbow)

        # Arms up: angle increases
        if arm_angle > 120:
            self.stage = "up"

        # Arms down: angle decreases → count
        if arm_angle < 60 and self.stage == "up":
            self.stage = "down"
            self.count += 1

        return self.count, arm_angle
    
    def reset(self):
        """Reset the rep counter to initial state"""
        self.count = 0
        self.stage = None