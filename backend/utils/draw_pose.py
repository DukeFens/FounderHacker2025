import cv2
import numpy as np
import mediapipe as mp

def draw_pose_landmarks(image, landmarks, connections=None):
    """
    Draw pose landmarks and connections on an image
    """
    if not landmarks:
        return image
    
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose
    
    # Use MediaPipe's default pose connections if none provided
    if connections is None:
        connections = mp_pose.POSE_CONNECTIONS
    
    # Draw the pose landmarks
    mp_drawing.draw_landmarks(
        image, 
        landmarks, 
        connections,
        mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
        mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2)
    )
    
    return image