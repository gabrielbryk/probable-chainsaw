#!/usr/bin/env python3
"""Discover Govee LAN devices via multicast scan."""

import argparse
import json
import socket
import sys
import time
from typing import Dict, Any

MULTICAST_ADDR = '239.255.255.250'
DISCOVERY_PORT = 4001
RESPONSE_PORT = 4002
SCAN_PAYLOAD = json.dumps({"msg": {"cmd": "scan", "data": {"account_topic": "reserve"}}}).encode('utf-8')


def discover(timeout: float, retries: int, verbose: bool):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)
    sock.settimeout(timeout)

    sock.bind(('', RESPONSE_PORT))
    mreq = socket.inet_aton(MULTICAST_ADDR) + socket.inet_aton('0.0.0.0')
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

    devices: Dict[str, Dict[str, Any]] = {}

    for _ in range(retries):
        if verbose:
            print(f'[verbose] broadcasting scan -> {MULTICAST_ADDR}:{DISCOVERY_PORT} {SCAN_PAYLOAD!r}')
        sock.sendto(SCAN_PAYLOAD, (MULTICAST_ADDR, DISCOVERY_PORT))
        start = time.time()
        while time.time() - start < timeout:
            try:
                data, addr = sock.recvfrom(4096)
                if verbose:
                    print(f'[verbose] recv {len(data)} bytes from {addr}: {data!r}')
            except socket.timeout:
                break
            try:
                payload = json.loads(data.decode('utf-8'))
            except json.JSONDecodeError:
                continue
            if payload.get('msg', {}).get('cmd') != 'scan':
                continue
            info = payload.get('msg', {}).get('data', {})
            device_id = info.get('device')
            if not device_id:
                continue
            info['ip'] = info.get('ip') or addr[0]
            devices[device_id] = info

    sock.close()
    return list(devices.values())


def main():
    parser = argparse.ArgumentParser(description='Discover Govee LAN devices')
    parser.add_argument('--timeout', type=float, default=2.0)
    parser.add_argument('--retries', type=int, default=3)
    parser.add_argument('--verbose', action='store_true')
    args = parser.parse_args()

    try:
        devices = discover(args.timeout, args.retries, args.verbose)
    except OSError as exc:
        print(f'[error] {exc}', file=sys.stderr)
        sys.exit(1)

    if not devices:
        print('No devices responded. Ensure LAN mode is enabled and on the same network.')
        sys.exit(2)

    for dev in devices:
        print(json.dumps(dev, indent=2))


if __name__ == '__main__':
    main()
