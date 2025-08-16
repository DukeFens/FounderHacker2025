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