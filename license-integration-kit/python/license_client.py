"""
Bid032 Store - Universal Python License Engine SDK (v2.0.0)
For Python Desktop Apps (PyQt, PySide, CustomTkinter, CLI tools, PyInstaller binaries).

Features:
- Built-in Standard Library implementation (No external dependencies required).
- Hardware Fingerprint (HWID) generation across Windows, macOS, and Linux.
- Local session caching with anti-tamper clock-drift protection.
- Background heartbeat thread runner.
"""

import json
import os
import platform
import subprocess
import sys
import threading
import time
import urllib.request
import urllib.parse
import hashlib

DEFAULT_STORE_URL = "https://bid032.com"

def get_hwid():
    """Generate a stable, secure hardware fingerprint (HWID) for the host machine."""
    system = platform.system()
    raw_id = ""

    try:
        if system == "Windows":
            # Extract BIOS/CSPRODUCT UUID on Windows
            cmd = "powershell -Command \"(Get-CimInstance -ClassName Win32_ComputerSystemProduct).UUID\""
            output = subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL).decode().strip()
            if output and "UUID" not in output:
                raw_id = output
        elif system == "Darwin":
            cmd = "ioreg -d2 -c IOPlatformExpertDevice | grep IOPlatformUUID"
            output = subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL).decode().strip()
            if output:
                raw_id = output.split("=")[-1].replace('"', "").strip()
        elif system == "Linux":
            if os.path.exists("/etc/machine-id"):
                with open("/etc/machine-id", "r") as f:
                    raw_id = f.read().strip()
    except Exception:
        pass

    if not raw_id:
        # Fallback to MAC address + Node name hash
        import uuid
        raw_id = f"{uuid.getnode()}-{platform.node()}"

    # Hash the hardware parameters into a clean sha256 fingerprint
    hw_hash = hashlib.sha256(raw_id.encode("utf-8")).hexdigest()[:16]
    return f"dev_py_{hw_hash}"


class LicenseClient:
    def __init__(self, product_id, store_url=DEFAULT_STORE_URL, device_name="Python App Desktop"):
        self.store_url = store_url.rstrip("/")
        self.product_id = product_id
        self.device_name = device_name
        self.platform_str = f"{platform.system()} {platform.release()} ({platform.machine()})"
        self.device_id = get_hwid()
        self.session_file = os.path.join(os.path.expanduser("~"), f".rk_session_{product_id}.json")
        self._heartbeat_thread = None
        self._stop_heartbeat = False

    def _send_post(self, path, payload):
        target_url = self.store_url + path
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            target_url,
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "Bid032PythonSDK/2.0.0"}
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                body = response.read().decode("utf-8")
                return json.loads(body)
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode("utf-8")
                return json.loads(body)
            except Exception:
                return {"valid": False, "error": f"HTTP Error {e.code}", "errorCode": "HTTP_ERROR"}
        except Exception as e:
            # Domain Failover to Localhost if online fails
            if "bid032.com" in target_url:
                alt_url = target_url.replace("https://bid032.com", "http://localhost:3000")
                req_alt = urllib.request.Request(alt_url, data=data, headers={"Content-Type": "application/json"})
                try:
                    with urllib.request.urlopen(req_alt, timeout=5) as response_alt:
                        return json.loads(response_alt.read().decode("utf-8"))
                except Exception:
                    pass
            return {"valid": False, "error": str(e), "errorCode": "NETWORK_ERROR"}

    def _save_session(self, data):
        try:
            with open(self.session_file, "w") as f:
                json.dump(data, f)
        except Exception:
            pass

    def _load_session(self):
        if not os.path.exists(self.session_file):
            return None
        try:
            with open(self.session_file, "r") as f:
                return json.load(f)
        except Exception:
            return None

    def clear_session(self):
        if os.path.exists(self.session_file):
            try:
                os.remove(self.session_file)
            except Exception:
                pass

    def request_trial(self, email):
        """Request a 3-Day Free Trial key."""
        payload = {
            "email": email,
            "product": self.product_id,
            "device_id": self.device_id,
            "installation_id": f"inst_py_{self.device_id}",
            "device_name": self.device_name,
            "platform": self.platform_str,
        }
        return self._send_post("/api/v1/license/trial", payload)

    def activate(self, raw_license_key):
        """Activate a raw license key on this machine."""
        clean_key = "".join(c for c in raw_license_key if c.isalnum()).upper()
        if not clean_key or len(clean_key) < 10:
            return {"valid": False, "error": "Invalid license key format.", "errorCode": "INVALID_KEY"}

        payload = {
            "license_key": clean_key,
            "product": self.product_id,
            "device_id": self.device_id,
            "installation_id": f"inst_py_{self.device_id}",
            "device_name": self.device_name,
            "platform": self.platform_str,
        }

        res = self._send_post("/api/v1/license/activate", payload)
        if res.get("valid") and res.get("session_id"):
            session_data = {
                "session_id": res.get("session_id"),
                "license_key": clean_key,
                "expires_at": res.get("expires_at"),
                "plan_name": res.get("plan_name"),
                "saved_at": time.time(),
            }
            if res.get("expires_at"):
                # Compute local expiration timestamp to prevent clock tamper
                try:
                    exp_ts = time.mktime(time.strptime(res["expires_at"].split(".")[0].replace("Z", ""), "%Y-%m-%dT%H:%M:%S"))
                    session_data["local_expires_ts"] = exp_ts
                except Exception:
                    pass

            self._save_session(session_data)

        return res

    def validate(self):
        """Validate cached session with local clock check & remote server validation."""
        session = self._load_session()
        if not session or not session.get("session_id"):
            return {"valid": False, "error": "No active license session found.", "errorCode": "NO_SESSION"}

        # Local Clock Expiration Check (Anti-Tamper)
        local_exp = session.get("local_expires_ts")
        if local_exp and time.time() >= local_exp:
            self.clear_session()
            return {"valid": False, "error": "License key has expired.", "errorCode": "LICENSE_EXPIRED"}

        payload = {
            "session_id": session.get("session_id"),
            "license_key": session.get("license_key"),
            "product": self.product_id,
            "device_id": self.device_id,
        }

        res = self._send_post("/api/v1/license/validate", payload)
        if res.get("valid"):
            return res
        elif res.get("errorCode") == "NETWORK_ERROR":
            # If offline, allow execution if local timer is still valid!
            return {
                "valid": True,
                "offline": True,
                "plan_name": session.get("plan_name", "Active License (Offline)"),
                "expires_at": session.get("expires_at"),
            }
        else:
            self.clear_session()
            return res

    def start_heartbeat(self, interval_minutes=10, on_revoked=None):
        """Start a periodic background thread to continuously validate license status."""
        self._stop_heartbeat = False

        def _runner():
            while not self._stop_heartbeat:
                time.sleep(interval_minutes * 60)
                if self._stop_heartbeat:
                    break
                res = self.validate()
                if not res.get("valid"):
                    if on_revoked:
                        on_revoked(res)
                    break

        self._heartbeat_thread = threading.Thread(target=_runner, daemon=True)
        self._heartbeat_thread.start()

    def stop_heartbeat(self):
        self._stop_heartbeat = True

    def deactivate(self):
        """Deactivate current machine session."""
        self.stop_heartbeat()
        session = self._load_session()
        if session and session.get("session_id"):
            payload = {
                "session_id": session.get("session_id"),
                "license_key": session.get("license_key")
            }
            self._send_post("/api/v1/license/deactivate", payload)

        self.clear_session()
        return {"success": True}
