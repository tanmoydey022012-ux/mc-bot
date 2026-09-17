import socket
import time
import os
import struct

HOST = os.getenv("SERVER_HOST", "OwnServer-WKpp.aternos.me")
PORT = int(os.getenv("SERVER_PORT", "48825"))

# RakNet Unconnected Ping Magic Bytes
RAKNET_MAGIC = b"\x00\xff\xff\x00\xfe\xfe\xfe\xfe\xfd\xfd\xfd\xfd\x12\x34\x56\x78"

def send_keepalive():
    client_id = 0x123456789ABCDEF0
    ping_time = int(time.time() * 1000)
    
    # Construct RakNet Unconnected Ping Packet (ID: 0x01)
    packet = b"\x01" + struct.pack(">Q", ping_time) + RAKNET_MAGIC + struct.pack(">Q", client_id)

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(5)

    try:
        sock.sendto(packet, (HOST, PORT))
        print(f"[{time.strftime('%H:%M:%S')}] 📡 Keep-alive ping sent to {HOST}:{PORT}")
        
        data, _ = sock.recvfrom(1024)
        if data and data[0] == 0x1c: # ID_UNCONNECTED_PONG
            print(f"[{time.strftime('%H:%M:%S')}] 🎉 SUCCESS: Server responded! Keep-alive active.")
    except socket.timeout:
        print(f"[{time.strftime('%H:%M:%S')}] ⚠️ Timeout: Server offline or starting up...")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] ⚠️ Network error: {e}")
    finally:
        sock.close()

if __name__ == "__main__":
    print(f"🚀 Starting Light-weight Bedrock Keep-Alive for {HOST}:{PORT}...")
    while True:
        send_keepalive()
        time.sleep(30) # Sends a ping every 30 seconds to keep Aternos alive
