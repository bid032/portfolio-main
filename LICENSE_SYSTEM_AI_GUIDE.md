# 🛡️ Bid032 Store License System — AI Integration & Architecture Guide

> **Target Audience**: AI Coding Assistants (ChatGPT, Claude, Cursor, Antigravity, Copilot) & Software Engineers  
> **Version**: 2.0.0  
> **Status**: Production-Ready & Security Audited  

This document contains mandatory guidelines and instructions for any AI assistant tasked with integrating the **Bid032 Store License System** into a Chrome Extension, Web Application, or Desktop Program (Python, Node.js, C#, etc.).

---

## 1. System Architecture & Security Principles

The Bid032 License System uses a **Session-Based, Cryptographically Signed Attestation Architecture**.

```
┌─────────────────────────┐           1. Activate (License Key + HWID)         ┌────────────────────────┐
│                         ├───────────────────────────────────────────────────►│                        │
│   Extension / Software  │           2. Session ID + ES256 Signed Attestation│   Bid032 Store Backend │
│   (Client Device)       │◄───────────────────────────────────────────────────┤   (/api/v1/license/*)  │
│                         │                                                    │                        │
└────────────┬────────────┘                                                    └────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ Local Offline Safeguard │  (Validates ECDSA Attestation Signature + Local Clock Expiry)
└─────────────────────────┘
```

### Key Rules:
1. **Raw License Key Format**: `XXXX-XXXX-XXXX-XXXX` (Base32 uppercase, 16 characters).
2. **Server Hashing**: The database stores **SHA-256 hashes** of keys. The raw key is submitted once during activation.
3. **Hardware Binding**: Each license activation binds to a unique `device_id` (hardware fingerprint) and `installation_id`.
4. **Session Token**: On successful activation, the server issues a `session_id`. Subsequent validations use this `session_id`.
5. **Cryptographic Attestation (ES256)**: Every response contains a server-signed JSON payload using ECDSA P-256 (`alg: "ES256"`).
6. **Clock Tamper Protection**: The client SDK calculates `localExpiresMs = Date.now() + (expires_at - server_time)` upon validation. Even if the user disconnects the internet or changes their system clock, the SDK detects expiration locally.

---

## 2. API Endpoints Specification

Base URLs:
- **Production**: `https://bid032.com`
- **Local Dev**: `http://localhost:3000`

All POST endpoints require `Content-Type: application/json` and return CORS headers (`Access-Control-Allow-Origin: *`).

### Endpoints Overview

| Endpoint | Method | Purpose | Required Fields |
| :--- | :--- | :--- | :--- |
| `/api/v1/license/activate` | `POST` | Activate key on machine & issue session | `license_key`, `product`, `device_id`, `installation_id` |
| `/api/v1/license/validate` | `POST` | Validate active session & refresh timer | `session_id`, `product`, `device_id` |
| `/api/v1/license/trial` | `POST` | Issue 3-Day Free Trial key | `email`, `product`, `device_id`, `installation_id` |
| `/api/v1/license/heartbeat` | `POST` | Periodic background heartbeat check | `session_id`, `product`, `device_id` |
| `/api/v1/license/deactivate` | `POST` | Deactivate session and release device | `session_id` |
| `/api/v1/license/public-key` | `GET` | Retrieve server ECDSA public key | None |

---

### Request & Response Examples

#### 1. Activate (`POST /api/v1/license/activate`)
```json
// Request Body
{
  "license_key": "LXR7-K92M-PQ8D-X4TA",
  "product": "my-product-id",
  "device_id": "dev_web_8f93a10c",
  "installation_id": "inst_1728000000",
  "device_name": "Workstation (Windows)",
  "platform": "Windows 11"
}
```

```json
// Response (Success 200 OK)
{
  "valid": true,
  "status": "active",
  "product": "my-product-id",
  "product_title": "My Awesome Tool",
  "plan": "plan_monthly",
  "plan_name": "1 Month License",
  "expires_at": "2026-11-03T22:00:00.000Z",
  "max_devices": 1,
  "server_time": "2026-10-03T22:00:00.000Z",
  "session_id": "sess_tok_9a8b7c6d5e4f3a2b1c0d",
  "attestation": {
    "alg": "ES256",
    "payload": {
      "version": "1.0",
      "audience": "my-product-id",
      "licenseHash": "...",
      "product": "my-product-id",
      "plan": "plan_monthly",
      "expiresAt": "2026-11-03T22:00:00.000Z",
      "sessionId": "sess_tok_9a8b7c6d5e4f3a2b1c0d"
    },
    "signature": "MEQCIF...",
    "publicKeyPem": "-----BEGIN PUBLIC KEY-----\n..."
  }
}
```

#### 2. Validate (`POST /api/v1/license/validate`)
```json
// Request Body
{
  "session_id": "sess_tok_9a8b7c6d5e4f3a2b1c0d",
  "license_key": "LXR7-K92M-PQ8D-X4TA",
  "product": "my-product-id",
  "device_id": "dev_web_8f93a10c"
}
```

```json
// Error Response (400 Bad Request if expired/revoked)
{
  "valid": false,
  "status": "expired",
  "error": "This license has expired.",
  "errorCode": "LICENSE_EXPIRED"
}
```

---

## 3. How AI Models Must Integrate the SDK

### Option A: Integration into Chrome Extensions (Manifest V3)

When asked to add license protection to a Chrome Extension:

1. **Copy SDK File**: Place `license-client.js` in the extension source directory.
2. **Update `manifest.json`**:
   - Add `"storage"` and `"alarms"` permissions.
   - Include host permissions: `"https://bid032.com/*"`, `"http://localhost:3000/*"`.
   - In `"background"`, include `"license-client.js"` in `importScripts` or as background script.
3. **Background Service Worker (`background.js`)**:
   - Initialize `const sdk = new LicenseClient({ productId: "YOUR_PRODUCT_ID" });`.
   - Setup `chrome.alarms` to run `sdk.validate()` every 15 minutes.
   - Listen for `chrome.runtime.onMessage` for `ACTIVATE`, `CHECK_STATUS`, `REQUEST_TRIAL`, `DEACTIVATE`.
4. **Content Scripts (`content.js`)**:
   - Send `CHECK_STATUS` message to `background.js` before executing any core tool code or DOM injection.
   - If response `valid !== true`, do NOT execute the extension features!
5. **Popup UI (`popup.html` / `popup.js`)**:
   - Provide a clean input field for the 16-character license key.
   - Provide a "Request Free Trial" email input button.
   - Show active plan name, expiration date, and a "Deactivate" button.

---

### Option B: Integration into Python Desktop Software (PyQt / CustomTkinter / CLI)

When asked to add license protection to a Python script or desktop GUI app:

1. **Copy SDK File**: Place `license_client.py` next to your Python entry point.
2. **Initialize SDK**:
   ```python
   from license_client import LicenseClient

   client = LicenseClient(
       product_id="YOUR_PRODUCT_ID",
       store_url="https://bid032.com",
       device_name="My Python App"
   )
   ```
3. **Startup Check**:
   ```python
   status = client.validate()
   if not status.get("valid"):
       # Show activation dialog or exit application!
       show_activation_ui()
   else:
       # Start background heartbeat thread
       client.start_heartbeat(interval_minutes=10, on_revoked=on_license_revoked)
       launch_main_app()
   ```
4. **PyInstaller Compilation Security**:
   - When compiling to `.exe` using PyInstaller, do NOT leave raw string flags like `IS_PAID = True` easily editable in bytecode.
   - Always call `client.validate()` directly inside critical feature functions, not just once at startup.

---

## 4. Security & Anti-Bypass Mandatory Rules for AI

When generating code that implements this license system, AI agents **MUST** follow these security rules:

1. ❌ **NEVER Hardcode Private Keys**: Only public keys (`publicKeyPem`) are used on client devices.
2. 🔒 **Wrap Critical Logic Inside Validation**: Do not perform a single boolean check at startup and store `window.isLicensed = true`. A malicious user can tamper with global variables in DevTools. Instead, re-verify session status or check `sdk.validate()` before high-value actions.
3. 🌐 **Always Support Domain Failover**: The client SDK automatically falls back from `https://bid032.com` to `http://localhost:3000` during local testing. Preserve this failover logic.
4. ⏰ **Enforce Local Clock Safeguard**: Always calculate and respect `localExpiresMs`. If a user disconnects their internet and sets back their system clock, the SDK must check cached expiration timestamps and block access.
5. 🔑 **Hardware ID Binding**: Always pass `device_id` generated by the SDK (`generateDeviceFingerprint()` or `get_hwid()`) to prevent single license keys from being shared across unlimited devices.

---

## 5. AI Execution Checklist

Before declaring that the license integration task is complete, verify the following 8 items:

- [ ] **[1] Product ID Match**: Has `productId` in the client SDK been set to match the exact product ID/slug configured in the Bid032 Store?
- [ ] **[2] Dependency Check**: Is the integration using standard APIs (`fetch`, `Web Crypto API`, `urllib`) without adding broken npm/pip packages?
- [ ] **[3] Hardware Fingerprint**: Is `device_id` being passed with every `activate` and `validate` API call?
- [ ] **[4] Local Storage Persistence**: Is the session saved in `chrome.storage.local` (for extensions) or encrypted file (for Python)?
- [ ] **[5] Background Validation**: Is there a periodic background heartbeat timer/alarm enabled (e.g. every 10–15 mins)?
- [ ] **[6] Expiration Handling**: Does the app handle expiration gracefully by displaying an activation prompt?
- [ ] **[7] Free Trial Option**: Does the UI allow users to request a 3-Day Free Trial if they don't have a key?
- [ ] **[8] CORS & Cross-Origin**: Are all API calls making standard HTTP POST requests with JSON body?

---

*Document created by DeepMind AI Engineering Team for Bid032 Store License Architecture.*
