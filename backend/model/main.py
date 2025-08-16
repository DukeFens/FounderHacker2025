import cv2
from pose_detector import PoseDetector
from feedback_rules import check_pullup_form
from rep_counter import RepCounter

def main(video_path=0):
    cap = cv2.VideoCapture(video_path)
    detector = PoseDetector()
    counter = RepCounter("pullup")  # Đúng bài tập pull-up

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame, landmarks = detector.detect_pose(frame)
        landmarks_list = landmarks.landmark if landmarks else None

        feedback = check_pullup_form(landmarks_list, counter.stage)
        reps, armpit_angle = counter.update(landmarks_list)

        cv2.putText(frame, f"Reps: {reps}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Feedback: {feedback}", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        cv2.putText(frame, f"Armpit Angle: {armpit_angle:.1f}", (10, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

        cv2.imshow("Gym Form Detection", frame)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main(0)  # webcam
