import cv2
import numpy as np


COLOR_RANGES = {
    "Rojo": [np.array([0, 150, 100], dtype=np.uint8), np.array([10, 255, 255], dtype=np.uint8)],
    "Rojo 2": [np.array([170, 150, 100], dtype=np.uint8), np.array([180, 255, 255], dtype=np.uint8)],
    "Naranja": [np.array([10, 150, 150], dtype=np.uint8), np.array([25, 255, 255], dtype=np.uint8)],
    "Amarillo": [np.array([25, 100, 100], dtype=np.uint8), np.array([35, 255, 255], dtype=np.uint8)],
    "Verde": [np.array([35, 60, 50], dtype=np.uint8), np.array([85, 255, 255], dtype=np.uint8)],
    "Azul": [np.array([85, 100, 70], dtype=np.uint8), np.array([130, 255, 255], dtype=np.uint8)],
    "Violeta": [np.array([130, 50, 50], dtype=np.uint8), np.array([170, 255, 255], dtype=np.uint8)],
    "Rosa": [np.array([130, 50, 150], dtype=np.uint8), np.array([170, 255, 255], dtype=np.uint8)],
}



def preprocess_image(frame):
    #blurred = cv2.GaussianBlur(frame, (5, 5), 0)  # Reducir ruido
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    #hsv[..., 2] = cv2.equalizeHist(hsv[..., 2])  # Ecualizar histograma
    return hsv



def detect_by_color(hsv):
    color_masks = {}
    for color, (lower, upper) in COLOR_RANGES.items():
        mask = cv2.inRange(hsv, lower, upper)
        color_masks[color] = mask
    return color_masks



# Ajustar parametros, /!\ menor radio = detección más lejana, menos preciso /!\
def validate_contours(contours, min_area=500, max_area=200000, min_radius=30):
    valid_shapes = []

    for contour in contours:
        area = cv2.contourArea(contour)

        if not (min_area <= area <= max_area):
            continue

        perimeter = cv2.arcLength(contour, True)

        if perimeter == 0:
            continue

        if len(contour) < 8:
            continue

        convex_hull = cv2.convexHull(contour)
        (x, y), radius = cv2.minEnclosingCircle(convex_hull)
        radius = int(radius)
        circularity = 4 * np.pi * (area / (perimeter * perimeter))

        if not (0.5 < circularity <= 1.2):
            continue

        if radius < min_radius:
            continue

        valid_shapes.append({
            "x": int(x),
            "y": int(y),
            "radius": radius
        })

    return valid_shapes



def filter_close_detections(valid_shapes, distance_threshold=50):
    if len(valid_shapes) <= 1:
        return valid_shapes
    
    valid_shapes_array = np.array([[shape["x"], shape["y"], shape["radius"]] for shape in valid_shapes])

    distances = np.sqrt((valid_shapes_array[:, None, 0] - valid_shapes_array[None, :, 0])**2 + 
                        (valid_shapes_array[:, None, 1] - valid_shapes_array[None, :, 1])**2)
    
    close_mask = distances < distance_threshold
    np.fill_diagonal(close_mask, False)

    filtered_shapes = []

    for i, shape in enumerate(valid_shapes_array):
        if not any(close_mask[i]):
            filtered_shapes.append(valid_shapes[i])
        else:
            max_radius_index = np.argmax(valid_shapes_array[close_mask[i], 2])
            filtered_shapes.append(valid_shapes[close_mask[i], 2][max_radius_index])

    return filtered_shapes



def remove_noise_and_small_objects(mask, kernel_size=(7, 7)):
    kernel = np.ones(kernel_size, np.uint8)
    mask_cleaned = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask_cleaned = cv2.morphologyEx(mask_cleaned, cv2.MORPH_CLOSE, kernel)
    return mask_cleaned



def process_frame(frame):
    frame_resized = cv2.resize(frame, (320, 240)) # Tam. frame

    hsv = preprocess_image(frame_resized)
    processed_frame = np.zeros_like(frame_resized)
    color_masks = detect_by_color(hsv)

    valid_shapes = []

    for color, mask in color_masks.items():
        cleaned_mask = remove_noise_and_small_objects(mask)
        contours, _ = cv2.findContours(cleaned_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        valid_shapes += validate_contours(contours)

        for shape in valid_shapes:
            center = (shape["x"], shape["y"])
            radius = shape["radius"]
            color_bgr = (0, 255, 0)

            cv2.circle(processed_frame, center, radius, color_bgr, 2)
            cv2.putText(processed_frame, f"r: {radius}", (center[0] - 10, center[1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color_bgr, 2)
            
    combined_result = np.zeros_like(frame_resized)

    for color, mask in color_masks.items():
        combined_result = cv2.bitwise_or(combined_result, cv2.bitwise_and(frame_resized, frame_resized, mask=mask))

    processed_frame = cv2.addWeighted(processed_frame, 1, combined_result, 0.3, 0)

    # ======================== DIBUJAR LA CRUCETA Y LAS LÍNEAS =======================

    center_x = 160
    center_y = 120
    threshold = 60
    line_color = (0, 0, 255)

    cv2.line(processed_frame, (0+140, center_y), (320-140, center_y), line_color, 2)
    cv2.line(processed_frame, (center_x, 0+100), (center_x, 240-100), line_color, 2)

    left_line_x = center_x - threshold
    right_line_x = center_x + threshold

    cv2.line(processed_frame, (left_line_x, 80), (left_line_x, 160), line_color, 2)
    cv2.line(processed_frame, (right_line_x, 80), (right_line_x, 160), line_color, 2)

    # =================================================================================

    return processed_frame, valid_shapes