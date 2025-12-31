import requests
import json
import cv2
import time
import operator
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
#from mediapipe.tasks.python import audio



face_model_path='mediapipe_models/face_landmarker.task'
gesture_model_path='mediapipe_models/gesture_recognizer.task'
mapping_data = None
ops = {
    '>=': operator.ge,
    '>': operator.gt,
    '<=': operator.le,
    '<': operator.lt,
    '==': operator.eq,
    '!=': operator.ne
}

with open('mappings.json', 'r') as file:
    mapping_data = json.load(file)

def check_condition(expected_dict, actual_dict):
    all_met = all(
        ops[op](actual_dict.get(key, 0), threshold)
        for key, (op, threshold) in expected_dict.items()
    )
    return all_met

def face_landmark_decode(facal_expression_dict, gesture):
    print(facal_expression_dict)
    mapping_data_gesture = mapping_data.get(gesture)
    for key, value in mapping_data_gesture.items():
        all_met = check_condition(value, facal_expression_dict)
        #print(f"All expectations met: {all_met}")
        if all_met:
            data = {
                "imageState": key,
                "func": "update"
            }
    try:
        # Send POST request to Node.js server
        response = requests.post('http://localhost:3000/api/update', json=data)
        print(response.json())
    except Exception as e:
        print(e)


def realtime_face_hands_webcam(face_model_path, gesture_model_path):
    """Real-time face and hand detection from webcam"""
    
    face_base_options = python.BaseOptions(model_asset_path=face_model_path)
    face_options = vision.FaceLandmarkerOptions(
        base_options=face_base_options,
        output_face_blendshapes=True,
        output_facial_transformation_matrixes=True,
        num_faces=1,
        min_face_detection_confidence=0.5,
        min_face_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )

    gesture_base_options = python.BaseOptions(model_asset_path=gesture_model_path)
    gesture_options = vision.GestureRecognizerOptions(
        base_options=gesture_base_options,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    last_send_time = 0
    send_interval = 10  # seconds
    facal_expression_dict = {}
    
    with vision.FaceLandmarker.create_from_options(face_options) as face_landmarker, \
         vision.GestureRecognizer.create_from_options(gesture_options) as gesture_recognizer:
        
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            #cv2.imshow('Live Video Feed', frame)

            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame)
            current_time = time.time()
            if (current_time - last_send_time) >= send_interval:
                gesture_result = gesture_recognizer.recognize(mp_image)
                if gesture_result.gestures:
                    gesture = gesture_result.gestures[0][0].category_name
                    if gesture == "ILoveYou":
                        last_send_time = face_detect(face_landmarker,mp_image,facal_expression_dict,current_time,gesture)

                    elif gesture == "Open_Palm":
                        last_send_time = face_detect(face_landmarker,mp_image,facal_expression_dict,current_time,gesture)
            
            if cv2.waitKey(5) & 0xFF == ord('q'):
                break
    
    cap.release()
    cv2.destroyAllWindows()

def face_detect(face_landmarker,mp_image,facal_expression_dict,current_time,gesture):
    last_send_time = 0
    face_result = face_landmarker.detect(mp_image)
    if face_result.face_blendshapes:
        for idx, blendshapes in enumerate(face_result.face_blendshapes):
            for category in blendshapes:
                facal_expression_dict[category.category_name] = float(f"{category.score:.2f}")
            last_send_time = current_time

    if facal_expression_dict:
        face_landmark_decode(facal_expression_dict, gesture)
    return last_send_time

if __name__ == "__main__":
    realtime_face_hands_webcam(face_model_path, gesture_model_path)