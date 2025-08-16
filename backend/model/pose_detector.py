import cv2
import mediapipe as mp

class PoseDetector:
    def __init__(self, static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5):
        self.pose = mp.solutions.pose.Pose(
            static_image_mode=static_image_mode,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.mp_drawing = mp.solutions.drawing_utils

    def detect_pose(self, image, draw=True):
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)

        if draw and results.pose_landmarks:
            self.mp_drawing.draw_landmarks(image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)

        return image, results.pose_landmarks