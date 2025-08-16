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

