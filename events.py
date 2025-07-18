import random, time
import threading
from datetime import datetime

def generate_packet():
    protocols = ['HTTP', 'HTTPS', 'TCP', 'UDP', 'DNS', 'ARP']
    return {
        "id": str(random.randint(1000, 9999)),
        "timestamp": datetime.utcnow().isoformat(),
        "sourceIp": f"192.168.1.{random.randint(1, 254)}",
        "destinationIp": f"192.168.1.{random.randint(1, 254)}",
        "protocol": random.choice(protocols),
        "size": random.randint(64, 1500),
        "port": random.randint(1000, 9000)
    }

def generate_alert(packet):
    return {
        "id": str(random.randint(1000, 9999)),
        "type": random.choice(["SYN_FLOOD", "ARP_SPOOFING", "DNS_POISONING"]),
        "severity": random.choice(["low", "medium", "high", "critical"]),
        "timestamp": datetime.utcnow().isoformat(),
        "description": f"Suspicious activity from {packet['sourceIp']}",
        "involvedIps": [packet['sourceIp'], packet['destinationIp']],
        "details": { "port": packet['port'] }
    }

def start_simulation(socketio):
    def emit_data():
        total_packets = 0
        total_alerts = 0
        while True:
            time.sleep(1)

            # Emit packet
            packet = generate_packet()
            socketio.emit('packet', packet)
            total_packets += 1

            # Emit occasional alert
            if random.random() < 0.2:
                alert = generate_alert(packet)
                socketio.emit('alert', alert)
                total_alerts += 1

            # Emit stats
            stats = {
                "totalPackets": total_packets,
                "packetsPerSecond": random.randint(50, 120),
                "totalAlerts": total_alerts,
                "activeConnections": random.randint(10, 30)
            }
            socketio.emit('stats', stats)

    thread = threading.Thread(target=emit_data)
    thread.daemon = True
    thread.start()