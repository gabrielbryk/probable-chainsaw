# Govee LAN API Notes

Source: <https://app-h5.govee.com/user-manual/wlan-guide>

## 1. Enabling LAN mode
1. Add the device to the Govee Home App and ensure it is connected to Wi-Fi.
2. Open the device settings in the app and toggle the **LAN Control** switch.
3. If the switch does not appear for a device that should be supported, disconnect the device from power, plug it back in, wait ~30 minutes, and check again. Contact Govee support if the switch never appears.

## 2. Discovery workflow
1. When LAN mode is enabled the device automatically joins multicast **239.255.255.250** and listens on **UDP port 4001**.
2. Clients must join the same multicast group and broadcast a **"request scan"** message to port 4001. JSON payload:
   ```json
   {
     "msg": {
       "cmd": "scan",
       "data": {
         "account_topic": "reserve"
       }
     }
   }
   ```
   `account_topic` must currently be the literal string `reserve`.
3. Every LAN-enabled device replies over UDP to **port 4002** with a **"response scan"** message:
   ```json
   {
     "msg": {
       "cmd": "scan",
       "data": {
         "ip": "192.168.1.23",
         "device": "1F:80:C5:32:32:36:72:4E",
         "sku": "Hxxxx",
         "bleVersionHard": "3.01.01",
         "bleVersionSoft": "1.03.01",
         "wifiVersionHard": "1.00.10",
         "wifiVersionSoft": "1.02.03"
       }
     }
   }
   ```
   - `ip` is the LAN IPv4 address to which control packets should be sent.
   - `device` is the unique device identifier used in every subsequent command.
   - `sku` indicates the product model.
   - `bleVersion*`/`wifiVersion*` expose firmware versions.

## 3. Control workflow
Once the device IP is known, the client sends control messages via UDP to **port 4003** on that IP.

Common commands (all JSON are wrapped in `{ "msg": { ... } }`):

| Action | Command | Fields |
| --- | --- | --- |
| Power on/off | `cmd: "turn"` | `data.value` is `1` (on) or `0` (off). |
| Brightness | `cmd: "brightness"` | `data.value` integer 1–100 (percentage). |
| Status query | `cmd: "devStatus"` | Empty `data`. Device replies with `devStatus` payload describing `onOff`, `brightness`, `color`, `colorTemInKelvin`. |
| Color / color temperature | `cmd: "colorwc"` | `data.color` (RGB 0–255 each) and `data.colorTemInKelvin` (2000–9000). If color temp is non-zero, device converts to RGB; if 0, only RGB values are used. Our adapter always sets `colorTemInKelvin` to 0 for RGB and sends standalone `brightness` commands when needed. |

Example status response:
```json
{
  "msg": {
    "cmd": "devStatus",
    "data": {
      "onOff": 1,
      "brightness": 100,
      "color": { "r": 255, "g": 0, "b": 0 },
      "colorTemInKelvin": 7200
    }
  }
}
```

## 4. Notes for implementation
- LAN control uses multicast discovery (4001) and UDP control (4003). Ensure firewall/multicast settings permit this.
- Device replies are UDP packets; client must keep listening on 4002 for discovery responses and optionally for command acknowledgements (only `devStatus` yields data).
- For our lighting bridge we support both:
  - **Cloud API** (requires `GOVEE_API_KEY`) — used when LAN info unavailable or as fallback.
  - **LAN API** (requires `GOVEE_DEVICES=device:model[:ip]` entries) — uses the workflow above.
- To discover LAN-capable devices automatically, broadcast the "request scan" command and listen for responses to collect `ip` + `device` identifiers.
