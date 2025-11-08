#!/usr/bin/env python3
"""Broadcasts a "scan" request on the local network to discover Govee LAN-enabled devices.

Run inside the `app/` directory:
    python scripts/discover_govee_devices.py --timeout 5 --retries 3
"""

from __future__ import annotations

import argparse
import json
import socket
import sys
import time
from typing import Any, Dict, List

BROADCAST_PORT = 4002
BROADCAST_ADDR = '255.255.255.255'
DISCOVERY_PAYLOAD = json.dumps({
    "msg": "scan",
    "time": int(time.time())
}).encode('utf-8')


def discover(timeout: float, retries: int) -> List[Dict[str, Any]]:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.settimeout(timeout)

    devices: Dict[str, Dict[str, Any]] = {}

    for _ in range(retries):
        sock.sendto(DISCOVERY_PAYLOAD, (BROADCAST_ADDR, BROADCAST_PORT))
        start = time.time()
        while time.time() - start < timeout:
            try:
                data, addr = sock.recvfrom(4096)
            except socket.timeout:
                break
            try:
                payload = json.loads(data.decode('utf-8'))
            except json.JSONDecodeError:
                continue
            if payload.get('msg') != 'scan':
                continue
            device_info = payload.get('data') or {}
            device_id = device_info.get('device')
            if not device_id:
                continue
            devices[device_id] = {
                'device': device_id,
                'model': device_info.get('model'),
                'capabilities': device_info.get('capabilities'),
                'ip': addr[0],
            }
    sock.close()
    return list(devices.values())


def main() -> None:
    parser = argparse.ArgumentParser(description='Discover Govee LAN devices')
    parser.add_argument('--timeout', type=float, default=2.0, help='Seconds to wait after each scan broadcast (default: 2)')
    parser.add_argument('--retries', type=int, default=3, help='How many broadcasts to send (default: 3)')
    args = parser.parse_args()

    try:
        devices = discover(args.timeout, args.retries)
    except OSError as exc:
        print(f"[error] failed to send broadcast: {exc}", file=sys.stderr)
        sys.exit(1)

    if not devices:
        print('No Govee devices responded. Ensure LAN control is enabled and device is on the same network.')
        sys.exit(2)

    print('Discovered devices:')
    for dev in devices:
        print(json.dumps(dev, indent=2))


if __name__ == '__main__':
    main()
