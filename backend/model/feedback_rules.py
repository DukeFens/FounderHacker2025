# feedback_rules.py
import math

def calculate_angle(a, b, c):
    """Calculate the angle ABC (point B is the vertex)"""
    ang = math.degrees(
        math.atan2(c.y - b.y, c.x - b.x) -
        math.atan2(a.y - b.y, a.x - b.x)
    )
    return abs(ang) if abs(ang) <= 180 else 360 - abs(ang)

def check_pullup_form(landmarks, stage=None):
    """Check pull-up form based on elbow angle and body alignment"""
    if not landmarks:
        return "No person detected."

    shoulder = landmarks[12]  # right shoulder
    elbow = landmarks[14]     # right elbow
    hip = landmarks[24]       # right hip
    ankle = landmarks[28]     # right ankle

    body_angle = calculate_angle(shoulder, hip, ankle)
    armpit_angle = calculate_angle(elbow, shoulder, hip)

    feedback = []
    if stage == "up" and armpit_angle > 70:
        feedback.append("Pull higher, arms not bending enough.")
    if stage == "down" and armpit_angle < 160:
        feedback.append("Lower fully, arms not straight enough.")
    if abs(body_angle - 180) > 10:
        feedback.append("Body is swinging, keep stable.")

    return " | ".join(feedback) if feedback else "Pull-up form is good!"

def check_squat_form(landmarks, stage=None):
    """Check squat form based on knee angle and posture"""
    if not landmarks:
        return "No person detected."

    hip = landmarks[24]       # right hip
    knee = landmarks[26]      # right knee
    ankle = landmarks[28]     # right ankle
    shoulder = landmarks[12]  # right shoulder

    knee_angle = calculate_angle(hip, knee, ankle)
    torso_angle = calculate_angle(shoulder, hip, knee)

    feedback = []
    if stage == "down" and knee_angle > 120:
        feedback.append("Go deeper, knees not bending enough.")
    if stage == "up" and knee_angle < 160:
        feedback.append("Stand up fully, incomplete extension.")
    if abs(torso_angle - 90) > 20:
        feedback.append("Keep torso upright, avoid leaning forward.")

    return " | ".join(feedback) if feedback else "Squat form is good!"

def check_shoulder_abduction_form(landmarks, stage=None):
    """Check shoulder abduction form"""
    if not landmarks:
        return "No person detected."

    shoulder = landmarks[12]  # right shoulder
    elbow = landmarks[14]     # right elbow
    hip = landmarks[24]       # right hip
    wrist = landmarks[16]     # right wrist

    arm_angle = calculate_angle(hip, shoulder, elbow)
    elbow_angle = calculate_angle(shoulder, elbow, wrist)

    feedback = []
    if stage == "up" and arm_angle < 120:
        feedback.append("Raise arms higher, not enough elevation.")
    if stage == "down" and arm_angle > 60:
        feedback.append("Lower arms fully to sides.")
    if abs(elbow_angle - 180) > 15:
        feedback.append("Keep arms straight, avoid bending elbows.")

    return " | ".join(feedback) if feedback else "Shoulder abduction form is good!"

