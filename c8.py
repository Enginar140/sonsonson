import cv2
import socket
import struct
import numpy as np
import time

def process_video_stream_without_cuda(IP, PORT=7793, jpeg_quality=80):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("[CLIENT] Kamera açılamadı!")
        return

    frame_count = 0
    start_time = time.time()
    last_ping = 0  # Son ölçülen ping
    last_client_time = time.time()  # Client cihazındaki son geçerli zamanı tutuyoruz

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        # BGR'den RGB'ye dönüşümü düzgün yapıyoruz
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_RGB2RGBA)

        # JPEG sıkıştırma
        _, img_encoded = cv2.imencode('.jpg', frame_rgb, [cv2.IMWRITE_JPEG_QUALITY, jpeg_quality])
        timestamp = time.time()

        # Paketleri hazırlama
        packet = struct.pack("dI", timestamp, len(img_encoded)) + img_encoded.tobytes()

        try:

            # Client bilgisayarının saati
            client_time = time.time()
            last_client_time = client_time  # Geçerli client zamanını kaydediyoruz

            # Client saatini salise hassasiyetinde sağ üst köşeye yazdırma
            client_time_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(last_client_time)) + f".{int(last_client_time * 1000) % 1000:03d}"
            cv2.putText(frame, client_time_str, 
                        (frame.shape[1] - 270, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, 
                        (0, 255, 0), 2, cv2.LINE_AA)

            last_ping = (time.time() - timestamp) * 1000  # Ping hesaplama

        except socket.timeout:
            # Eğer zaman bilgisi alınamazsa, son geçerli zamanı kullan
            client_time_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(last_client_time)) + f".{int(last_client_time * 1000) % 1000:03d}"
            cv2.putText(frame, client_time_str, 
                        (frame.shape[1] - 270, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, 
                        (0, 255, 0), 2, cv2.LINE_AA)

            last_ping = -1  # Ping geçersiz

        frame_count += 1
        elapsed_time = time.time() - start_time

        if elapsed_time >= 2.0:
            fps = frame_count / elapsed_time
            if last_ping >= 0:
                print(f"[CLIENT] FPS: {fps:.0f}, Ping: {last_ping:.2f} ms")
            else:
                print(f"[CLIENT] FPS: {fps:.0f}, Ping: ZAMAN AŞIMI")

            frame_count = 0
            start_time = time.time()

        # Frame'i sunucuya tek bir paket olarak gönder
        _, img_encoded = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, jpeg_quality])
        packet = struct.pack("dI", timestamp, len(img_encoded)) + img_encoded.tobytes()
        sock.sendto(packet, (IP, PORT))

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    sock.close()
    cv2.destroyAllWindows()
    print("[CLIENT] Çıkış yapıldı.")

process_video_stream_without_cuda("127.0.0.1")
