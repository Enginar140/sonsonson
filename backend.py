import time
import threading
import asyncio
import websockets
from pymavlink import mavutil
import json

# MAVLink connection
connection = mavutil.mavlink_connection('tcp:127.0.0.1:5762')
connection.wait_heartbeat(timeout=10)
print("Connection successful, system ID:", connection.target_system)

# Storing telemetry data
latest_drone_data = {}

# Function to generate telemetry data
def generate_telemetry():
    drone_data = {}

    # Initialize default target information
    drone_data['takim_numarasi'] = 1
    drone_data['hedef_merkez_X'] = 300
    drone_data['hedef_merkez_Y'] = 230
    drone_data['hedef_genislik'] = 30
    drone_data['hedef_yukseklik'] = 43

    # Get GPS data
    msg = connection.recv_match(type='GPS_RAW_INT', blocking=True)
    drone_data['iha_enlem'] = msg.lat / 1e7
    drone_data['iha_boylam'] = msg.lon / 1e7
    drone_data['iha_irtifa'] = msg.alt

    # Get attitude (pitch, roll, yaw)
    msg = connection.recv_match(type='ATTITUDE', blocking=True)
    drone_data['iha_dikilme'] = msg.pitch
    drone_data['iha_yatis'] = msg.roll
    drone_data['iha_yonelme'] = msg.yaw

    # Get speed data
    msg = connection.recv_match(type='VFR_HUD', blocking=True)
    drone_data['iha_hiz'] = msg.groundspeed

    # Get battery data
    msg = connection.recv_match(type='BATTERY_STATUS', blocking=True)
    drone_data['iha_batarya'] = msg.battery_remaining

    # Autonomous mode status
    drone_data['iha_otonom'] = 1

    # Lock status
    drone_data['iha_kilitlenme'] = 1

    # GPS time
    msg = connection.recv_match(type='SYSTEM_TIME', blocking=True)
    time_unix_usec = msg.time_unix_usec
    time_unix_sec = time_unix_usec // 1000000
    gps_saat = time.gmtime(time_unix_sec)
    drone_data['gps_saati'] = {
        'saat': gps_saat.tm_hour,
        'dakika': gps_saat.tm_min,
        'saniye': gps_saat.tm_sec,
        'milisaniye': (time_unix_usec // 1000) % 1000
    }

    return drone_data

# Update telemetry data in background thread
def update_telemetry_data():
    global latest_drone_data
    while True:
        latest_drone_data = generate_telemetry()
        time.sleep(1)  # Update every second

# WebSocket handler to send telemetry data
async def telemetry_handler(websocket, path):
    while True:
        await websocket.send(json.dumps(latest_drone_data))  # Send latest telemetry data in JSON format
        await asyncio.sleep(1)  # Send data every second

# Start telemetry data updating in the background thread
threading.Thread(target=update_telemetry_data, daemon=True).start()

# Start WebSocket server
async def main():
    print("[DEBUG] WebSocket server is starting...")
    async with websockets.serve(telemetry_handler, "127.0.0.1",8765):
        print("[DEBUG] WebSocket server started successfully.")
        await asyncio.Future()  # Run indefinitely

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"[ERROR] WebSocket server could not be started: {e}")
