/**
 * Bid032 & Abdallah Store - Universal License Engine SDK (v1.1.3)
 * Generic activation interface for any plugin, CEP panel, UXP tool, or Web app.
 * Supports dual local (localhost:3000) and online (bid032.com) auto-switching & failover.
 */
(function (global) {
  'use strict';

  var DEFAULT_STORE_URL = (function () {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      var origin = String(window.location.origin || '').toLowerCase();
      if (origin && !origin.startsWith('file:') && !origin.startsWith('chrome') && origin !== 'null') {
        return window.location.origin;
      }
    }
    return 'https://bid032.com';
  })();

  function openExternalUrl(url) {
    if (!url) return;

    // 0. Adobe UXP native shell.openExternal
    try {
      var reqFn = (typeof require === 'function') ? require : (typeof window !== 'undefined' && typeof window.require === 'function' ? window.require : null);
      if (reqFn) {
        var uxp = reqFn('uxp');
        if (uxp && uxp.shell && typeof uxp.shell.openExternal === 'function') {
          uxp.shell.openExternal(url);
          return;
        }
      }
    } catch (e) {}

    // 1. CEP native window.cep.util
    if (typeof window !== 'undefined' && window.cep && window.cep.util && typeof window.cep.util.openURLInDefaultBrowser === 'function') {
      try {
        window.cep.util.openURLInDefaultBrowser(url);
        return;
      } catch (e) {}
    }

    // 2. Node.js child_process in CEP (Guaranteed on Windows & Mac)
    try {
      var reqFn2 = (typeof require === 'function') ? require : (typeof window !== 'undefined' && typeof window.require === 'function' ? window.require : null);
      if (reqFn2) {
        var cp = reqFn2('child_process');
        if (cp && typeof cp.exec === 'function') {
          var platform = (typeof process !== 'undefined' && process.platform) || 'win32';
          if (platform === 'win32') {
            cp.exec('start "" "' + url.replace(/"/g, '\\"') + '"');
            return;
          } else if (platform === 'darwin') {
            cp.exec('open "' + url.replace(/"/g, '\\"') + '"');
            return;
          }
        }
      }
    } catch (e) {}

    // 3. Adobe CEP CSInterface
    try {
      var CS = (typeof window !== 'undefined' && window.CSInterface) ? window.CSInterface : (typeof CSInterface !== 'undefined' ? CSInterface : null);
      if (CS) {
        var csInstance = new CS();
        if (csInstance && typeof csInstance.openURLInDefaultBrowser === 'function') {
          csInstance.openURLInDefaultBrowser(url);
          return;
        }
      }
    } catch (e) {}

    // 4. Standard window.open
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {}
  }

  function sendPostRequest(url, payload, callback, isRetry) {
    var targetUrl = url;

    function handleFallback(err) {
      if (!isRetry) {
        var fallbackUrl = null;
        if (targetUrl.indexOf('bid032.com') !== -1) {
          fallbackUrl = targetUrl.replace('https://bid032.com', 'http://localhost:3000');
        } else if (targetUrl.indexOf('localhost:3000') !== -1 || targetUrl.indexOf('127.0.0.1:3000') !== -1) {
          fallbackUrl = targetUrl.replace(/http:\/\/(localhost|127\.0\.0\.1):3000/, 'https://bid032.com');
        }

        if (fallbackUrl) {
          sendPostRequest(fallbackUrl, payload, function (fbErr, fbData) {
            if (!fbErr && fbData) {
              var newStoreUrl = fallbackUrl.substring(0, fallbackUrl.indexOf('/api/'));
              if (global.Bid032License && global.Bid032License.config) {
                global.Bid032License.config.storeUrl = newStoreUrl;
              }
              callback(null, fbData);
            } else {
              callback(err, null);
            }
          }, true);
          return;
        }
      }
      callback(err, null);
    }

    if (typeof window !== 'undefined' && typeof window.require === 'function') {
      try {
        var parsedUrl = new URL(targetUrl);
        var isHttps = parsedUrl.protocol === 'https:';
        var httpModule = isHttps ? window.require('https') : window.require('http');
        var postData = JSON.stringify(payload);

        var hostname = parsedUrl.hostname;
        if (hostname === 'localhost') {
          hostname = '127.0.0.1';
        }

        var reqOptions = {
          hostname: hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CEP/11.0 Bid032LicenseSDK'
          },
          timeout: 5000
        };

        var req = httpModule.request(reqOptions, function (res) {
          var body = '';
          res.on('data', function (chunk) { body += chunk; });
          res.on('end', function () {
            try {
              var json = JSON.parse(body);
              callback(null, json);
            } catch (err) {
              callback(new Error('Server returned invalid response format.'));
            }
          });
        });

        req.on('timeout', function () {
          req.destroy();
        });

        req.on('error', function (err) {
          handleFallback(err);
        });

        req.write(postData);
        req.end();
        return;
      } catch (e) {
        // Fallback to fetch
      }
    }

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 5000) : null;

    fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        if (timeoutId) clearTimeout(timeoutId);
        return res.json().catch(function () {
          throw new Error('Server returned invalid response.');
        });
      })
      .then(function (data) {
        callback(null, data);
      })
      .catch(function (err) {
        if (timeoutId) clearTimeout(timeoutId);
        handleFallback(err);
      });
  }

  function generateDeviceFingerprint() {
    var nav = global.navigator || {};
    var screen = global.screen || {};
    var str = [
      nav.userAgent || '',
      nav.language || '',
      screen.colorDepth || '',
      screen.width || '',
      screen.height || '',
      new Date().getTimezoneOffset()
    ].join('|');

    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'dev_' + Math.abs(hash).toString(36);
  }

  function getInstallationId() {
    var key = 'rk_installation_id';
    var id = localStorage.getItem(key);
    if (!id) {
      id = 'inst_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      localStorage.setItem(key, id);
    }
    return id;
  }

  function computeLocalExpiresMs(data) {
    if (!data || !data.expires_at) return null;

    var expiresMs = new Date(data.expires_at).getTime();
    if (isNaN(expiresMs)) {
      expiresMs = new Date(String(data.expires_at).replace(' ', 'T')).getTime();
    }
    if (isNaN(expiresMs)) return null;

    var serverMs = data.server_time ? new Date(data.server_time).getTime() : 0;
    if (isNaN(serverMs) || serverMs <= 0) {
      serverMs = Date.now();
    }

    var remainingMs = expiresMs - serverMs;
    if (remainingMs <= 0) return 0;

    return Date.now() + remainingMs;
  }

  function formatLocalDateTimeSmart(dateInput) {
    if (!dateInput) return 'Lifetime Access';
    var d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return 'Lifetime Access';

    // Align CEP V8 string rendering with Windows OS GMT+3 (Cairo local time offset: -180 mins)
    var targetOffset = -180; // Cairo GMT+3
    var currentOffset = d.getTimezoneOffset(); // CEP V8 internal offset
    var adjustmentMs = (currentOffset - targetOffset) * 60000;

    var adjustedDate = new Date(d.getTime() + adjustmentMs);
    return adjustedDate.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function injectStyles() {
    var style = document.getElementById('rk-license-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'rk-license-styles';
      document.head.appendChild(style);
    }
    style.innerHTML = `
      body.rk-locked > *:not(#rk-modal-overlay) {
        display: none !important;
      }

      .rk-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(10, 10, 10, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #ffffff;
        box-sizing: border-box;
        padding: 16px;
      }

      .rk-card {
        background: #202020;
        border: 1px solid #333333;
        border-radius: 8px;
        width: 100%;
        max-width: 380px;
        padding: 24px 20px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.85);
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }

      .rk-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: #f57f00;
      }

      .rk-header {
        text-align: center;
        margin-bottom: 20px;
      }

      .rk-badge {
        display: inline-block;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #f57f00;
        background: rgba(245, 127, 0, 0.12);
        border: 1px solid rgba(245, 127, 0, 0.3);
        padding: 3px 10px;
        border-radius: 4px;
        margin-bottom: 8px;
      }

      .rk-title {
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 4px 0;
      }

      .rk-subtitle {
        font-size: 11px;
        color: #888888;
        margin: 0;
        line-height: 1.4;
      }

      .rk-input-group {
        margin-bottom: 18px;
      }

      .rk-label {
        display: block;
        font-size: 9px;
        font-weight: 700;
        color: #888888;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: left;
      }

      .rk-input {
        width: 100% !important;
        height: 34px !important;
        line-height: 34px !important;
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid #333333 !important;
        border-radius: 6px !important;
        padding: 0 10px !important;
        color: #ffffff !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        letter-spacing: 1.5px !important;
        text-align: center !important;
        box-sizing: border-box !important;
        outline: none !important;
        transition: all 0.15s ease !important;
      }

      .rk-input:focus {
        border-color: #f57f00 !important;
        background: rgba(0, 0, 0, 0.3) !important;
        box-shadow: 0 0 0 2px rgba(245, 127, 0, 0.2) !important;
      }

      .rk-input::placeholder {
        color: #666666 !important;
        letter-spacing: 1px !important;
        font-weight: 500 !important;
      }

      .rk-btn-primary {
        width: 100%;
        height: 32px;
        background: linear-gradient(180deg, #f57f00 0%, #cc6a00 100%);
        color: #ffffff;
        font-weight: 700;
        font-size: 11px;
        border-radius: 6px;
        border: 1px solid #b35900;
        cursor: pointer;
        transition: all 0.15s ease;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.3);
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .rk-btn-primary:hover {
        filter: brightness(1.1);
      }

      .rk-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        filter: none;
      }

      .rk-btn-secondary {
        width: 100%;
        height: 30px;
        background: #202020;
        color: #888888;
        font-weight: 600;
        font-size: 10px;
        border-radius: 6px;
        border: 1px solid #333333;
        cursor: pointer;
        transition: all 0.15s ease;
        text-align: center;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        margin-top: 8px;
      }

      .rk-btn-secondary:hover {
        background: #2a2a2a;
        color: #ffffff;
        border-color: #444444;
      }

      .rk-info-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 16px 0;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid #333333;
        border-radius: 6px;
        padding: 12px;
      }

      .rk-info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
      }

      .rk-info-row:last-child {
        border-bottom: none;
      }

      .rk-info-label {
        font-size: 10px !important;
        font-weight: 600 !important;
        color: #888888 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        margin: 0 !important;
        line-height: 1.4 !important;
      }

      .rk-info-val {
        font-size: 11px !important;
        font-weight: 700 !important;
        color: #ffffff !important;
      }

      .rk-key-val {
        color: #f57f00 !important;
        font-family: monospace !important;
        letter-spacing: 1px !important;
      }

      .rk-timer-val {
        color: #4ade80 !important;
        font-family: monospace !important;
      }
        font-size: 13px;
        font-weight: 600;
        padding: 12px 14px;
        border-radius: 10px;
        margin-bottom: 16px;
        text-align: center;
      }

      .rk-success-box {
        background: #081524;
        border: 1px solid #1d4ed8;
        border-radius: 14px;
        padding: 20px;
        text-align: center;
        margin-bottom: 20px;
      }

      .rk-success-icon {
        width: 48px;
        height: 48px;
        background: rgba(34, 197, 94, 0.15);
        border: 1px solid rgba(34, 197, 94, 0.4);
        color: #4ade80;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        margin: 0 auto 12px auto;
      }

      .rk-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 14px;
        text-align: left;
        font-size: 12px;
        background: #030712;
        padding: 14px;
        border-radius: 10px;
        border: 1px solid #1f2937;
      }

      .rk-info-item label {
        color: #64748b;
        display: block;
        font-size: 10px;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .rk-info-item span {
        color: #f3f4f6;
        font-weight: 700;
      }

      .rk-footer-note {
        text-align: center;
        font-size: 11px;
        color: #64748b;
        margin-top: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  var Bid032License = {
    config: {
      storeUrl: DEFAULT_STORE_URL,
      onSuccess: null
    },

    lockUI: function () {
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('rk-locked');
        var children = document.body.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child.id !== 'rk-modal-overlay' && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
            if (!child.hasAttribute('data-rk-hidden')) {
              child.setAttribute('data-rk-hidden', child.style.display || 'block');
            }
            child.style.display = 'none';
          }
        }
      }
    },

    unlockUI: function () {
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('rk-locked');
        var children = document.body.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child.id !== 'rk-modal-overlay' && child.hasAttribute('data-rk-hidden')) {
            var origDisplay = child.getAttribute('data-rk-hidden');
            child.style.display = (origDisplay === 'block' || origDisplay === 'none') ? '' : origDisplay;
            child.removeAttribute('data-rk-hidden');
          }
        }
      }
      var overlay = document.getElementById('rk-modal-overlay');
      if (overlay) {
        overlay.remove();
      }
    },

    init: function (options) {
      options = options || {};
      injectStyles();
      var storedOverride = localStorage.getItem('rk_store_url');
      var rawStoreUrl = storedOverride || options.storeUrl || DEFAULT_STORE_URL;
      if (!rawStoreUrl || String(rawStoreUrl).toLowerCase().startsWith('file:')) {
        rawStoreUrl = DEFAULT_STORE_URL;
      }
      this.config.storeUrl = rawStoreUrl.replace(/\/$/, '');
      this.config.onSuccess = options.onSuccess || null;

      // Auto-validate cached session if exists
      var cachedSession = localStorage.getItem('rk_global_session');
      var cachedKey = localStorage.getItem('rk_global_key');

      if (cachedSession && cachedKey) {
        this.validateSession(cachedSession, cachedKey);
      } else {
        this.renderActivationUI();
      }

      this.startBackgroundMonitor();
    },

    startBackgroundMonitor: function () {
      var self = this;
      if (self._bgMonitorInterval) {
        clearInterval(self._bgMonitorInterval);
      }

      var lastHeartbeatTime = 0;

      function checkExpiration() {
        var cachedSession = localStorage.getItem('rk_global_session');
        var cachedKey = localStorage.getItem('rk_global_key');
        var localExpiresMsStr = localStorage.getItem('rk_global_expires_ms');
        var expiresAtISO = localStorage.getItem('rk_global_expires_at');

        if (!cachedSession || !cachedKey) return;

        var nowMs = Date.now();

        // 1. Local Timezone Clock Check
        var expiresMs = localExpiresMsStr ? parseInt(localExpiresMsStr, 10) : 0;
        if ((!expiresMs || isNaN(expiresMs)) && expiresAtISO) {
          var d = new Date(expiresAtISO);
          expiresMs = d.getTime();
          if (isNaN(expiresMs)) {
            expiresMs = new Date(String(expiresAtISO).replace(' ', 'T')).getTime();
          }
        }

        if (expiresMs && !isNaN(expiresMs) && nowMs >= expiresMs) {
          console.warn('[Bid032 License] License expired locally based on device clock!');
          localStorage.removeItem('rk_global_session');
          localStorage.removeItem('rk_global_key');
          localStorage.removeItem('rk_global_expires_at');
          localStorage.removeItem('rk_global_expires_ms');

          if (self._countdownInterval) {
            clearInterval(self._countdownInterval);
            self._countdownInterval = null;
          }

          self.renderActivationUI('Your license key has expired. Please enter a valid license key to continue.');
          return;
        }

        // 2. Server Heartbeat Re-validation (every 8 seconds)
        if (nowMs - lastHeartbeatTime >= 8000) {
          lastHeartbeatTime = nowMs;
          self.validateSession(cachedSession, cachedKey, true);
        }
      }

      checkExpiration();
      self._bgMonitorInterval = setInterval(checkExpiration, 1000);
    },

    validateSession: function (sessionId, licenseKey, isSilent) {
      var self = this;
      var deviceId = generateDeviceFingerprint();
      var url = this.config.storeUrl + '/api/v1/license/validate';

      sendPostRequest(url, {
        session_id: sessionId,
        license_key: licenseKey,
        device_id: deviceId
      }, function (err, data) {
        if (!err && data && data.valid) {
          var localMs = computeLocalExpiresMs(data);
          if (localMs !== null) {
            localStorage.setItem('rk_global_expires_ms', String(localMs));
            if (data.expires_at) localStorage.setItem('rk_global_expires_at', data.expires_at);
          }
          if (!isSilent) {
            self.unlockUI();
            if (typeof self.config.onSuccess === 'function') {
              self.config.onSuccess(data);
            }
          }
        } else if (err && (!data || !data.error)) {
          // If offline/network error, allow cached session unlock
          if (!isSilent) {
            self.unlockUI();
            if (typeof self.config.onSuccess === 'function') {
              self.config.onSuccess({ valid: true, offline: true });
            }
          }
        } else {
          // EXPIRED OR INVALID ON SERVER
          console.warn('[Bid032 License] Server marked license as expired/invalid:', data);
          localStorage.removeItem('rk_global_session');
          localStorage.removeItem('rk_global_key');
          localStorage.removeItem('rk_global_expires_at');
          localStorage.removeItem('rk_global_expires_ms');

          if (self._countdownInterval) {
            clearInterval(self._countdownInterval);
            self._countdownInterval = null;
          }

          self.renderActivationUI((data && data.error) || 'Your license key has expired. Please enter a valid license key to continue.');
        }
      });
    },

    showLicenseDetails: function (sessionId, licenseKey) {
      var self = this;
      var cachedSession = sessionId || localStorage.getItem('rk_global_session');
      var cachedKey = licenseKey || localStorage.getItem('rk_global_key');

      if (!cachedSession || !cachedKey || cachedSession === 'null' || cachedSession === 'undefined') {
        self.renderActivationUI();
        return;
      }

      var deviceId = generateDeviceFingerprint();
      var url = this.config.storeUrl + '/api/v1/license/validate';

      sendPostRequest(url, {
        session_id: cachedSession,
        license_key: cachedKey,
        device_id: deviceId
      }, function (err, data) {
        if (!err && data && data.valid) {
          var localMs = computeLocalExpiresMs(data);
          if (localMs !== null) {
            localStorage.setItem('rk_global_expires_ms', String(localMs));
            if (data.expires_at) localStorage.setItem('rk_global_expires_at', data.expires_at);
          }
          self.renderSuccessUI(data, cachedKey);
        } else if (err && (!data || !data.error)) {
          self.renderSuccessUI({ valid: true, product_title: 'Gridora', plan_name: 'Active License (Offline)' }, cachedKey);
        } else {
          localStorage.removeItem('rk_global_session');
          localStorage.removeItem('rk_global_key');
          localStorage.removeItem('rk_global_expires_at');
          localStorage.removeItem('rk_global_expires_ms');
          self.renderActivationUI();
        }
      });
    },

    activateKey: function (rawKey) {
      var self = this;
      var cleanKey = (rawKey || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

      if (!cleanKey || cleanKey.length < 10) {
        self.showError('Please enter a valid license key (e.g. XXXX-XXXX-XXXX-XXXX).');
        return;
      }

      var btn = document.getElementById('rk-activate-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Verifying License...';
      }

      var deviceId = generateDeviceFingerprint();
      var installId = getInstallationId();
      var url = this.config.storeUrl + '/api/v1/license/activate';

      sendPostRequest(url, {
        license_key: cleanKey,
        device_id: deviceId,
        installation_id: installId,
        device_name: 'Workstation (' + (navigator.platform || 'Desktop') + ')',
        platform: navigator.userAgent || 'Web'
      }, function (err, data) {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Activate License';
        }

        if (!err && data) {
          if (data.valid) {
            localStorage.setItem('rk_global_session', data.session_id);
            localStorage.setItem('rk_global_key', cleanKey);
            var localMs = computeLocalExpiresMs(data);
            if (localMs !== null) {
              localStorage.setItem('rk_global_expires_ms', String(localMs));
              if (data.expires_at) localStorage.setItem('rk_global_expires_at', data.expires_at);
            }
            self.renderSuccessUI(data, cleanKey);
          } else {
            self.showError(data.error || 'Invalid license key.');
          }
        } else {
          self.showError((err && err.message) || 'Unable to connect to license server. Please check internet connection.');
        }
      });
    },

    renderActivationUI: function (errorMessage) {
      var self = this;
      self.lockUI();
      var overlay = document.getElementById('rk-modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'rk-modal-overlay';
        overlay.className = 'rk-modal-overlay';
        document.body.appendChild(overlay);
      }
      overlay.style.cssText = 'position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; width:100% !important; height:100% !important; background:#141414 !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:99999999 !important; padding:16px !important; box-sizing:border-box !important;';

      var buyUrl = (this.config.storeUrl || DEFAULT_STORE_URL) + '/store';

      overlay.innerHTML = `
        <div class="rk-card">
          <div class="rk-header">
            <span class="rk-badge">Bid032 LICENSE SYSTEM</span>
            <h2 class="rk-title">Activate Software License</h2>
            <p class="rk-subtitle">Enter your official license key below to unlock full tool functionality.</p>
          </div>

          <div id="rk-error-box" class="rk-error" style="${errorMessage ? '' : 'display:none;'}">
            ${errorMessage || ''}
          </div>

          <div class="rk-input-group">
            <label class="rk-label">License Key</label>
            <input type="text" id="rk-key-input" class="rk-input" placeholder="XXXX-XXXX-XXXX-XXXX" maxlength="30" autocomplete="off" spellcheck="false">
          </div>

          <button id="rk-activate-btn" class="rk-btn-primary" type="button">
            Activate License
          </button>

          <button id="rk-buy-btn" class="rk-btn-secondary" type="button">
            Don't have a license? Buy or Claim Free Trial
          </button>

          <div class="rk-footer-note">
            Secured by Abdallah Store License Platform
          </div>
        </div>
      `;

      injectStyles();

      var buyBtn = document.getElementById('rk-buy-btn');
      if (buyBtn) {
        buyBtn.addEventListener('click', function (e) {
          if (e && e.preventDefault) e.preventDefault();
          if (e && e.stopPropagation) e.stopPropagation();
          openExternalUrl(buyUrl);
        });
      }

      var input = document.getElementById('rk-key-input');
      if (input) {
        input.addEventListener('input', function (e) {
          var val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          var formatted = '';
          for (var i = 0; i < val.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += '-';
            formatted += val[i];
          }
          e.target.value = formatted.substring(0, 23);
        });

        input.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') {
            self.activateKey(input.value);
          }
        });
      }

      var btn = document.getElementById('rk-activate-btn');
      if (btn) {
        btn.addEventListener('click', function () {
          self.activateKey(input.value);
        });
      }
    },

    renderSuccessUI: function (data, licenseKey) {
      var self = this;
      self.lockUI();
      
      if (self._countdownInterval) {
        clearInterval(self._countdownInterval);
        self._countdownInterval = null;
      }

      var overlay = document.getElementById('rk-modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'rk-modal-overlay';
        overlay.className = 'rk-modal-overlay';
        document.body.appendChild(overlay);
      }
      overlay.style.cssText = 'position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; width:100% !important; height:100% !important; background:#141414 !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:99999999 !important; padding:16px !important; box-sizing:border-box !important;';

      var localExpiresMs = computeLocalExpiresMs(data);
      if (localExpiresMs) {
        localStorage.setItem('rk_global_expires_ms', String(localExpiresMs));
      } else {
        var storedMs = localStorage.getItem('rk_global_expires_ms');
        if (storedMs) localExpiresMs = parseInt(storedMs, 10);
      }

      var expiresDateFormatted = 'Lifetime Access';
      if (localExpiresMs && !isNaN(localExpiresMs) && localExpiresMs > 0) {
        expiresDateFormatted = formatLocalDateTimeSmart(localExpiresMs);
      }

      var toolTitle = data.product_title || 'Gridora';
      var planName = data.plan_name || 'Standard License';
      var keyLast4 = licenseKey ? licenseKey.replace(/[^A-Za-z0-9]/g, '').slice(-4) : '••••';

      overlay.innerHTML = `
        <div class="rk-card">
          <div class="rk-header">
            <span class="rk-badge" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border-color: rgba(34, 197, 94, 0.4);">
              ✓ LICENSE ACTIVE
            </span>
            <h2 class="rk-title">Gridora License Details</h2>
            <p class="rk-subtitle">Your software license is active & verified.</p>
          </div>

          <div class="rk-info-grid">
            <div class="rk-info-row">
              <span class="rk-info-label">Product Name</span>
              <span class="rk-info-val" style="color: #f57f00;">${toolTitle}</span>
            </div>
            <div class="rk-info-row">
              <span class="rk-info-label">Active Plan</span>
              <span class="rk-info-val">${planName}</span>
            </div>
            <div class="rk-info-row">
              <span class="rk-info-label">License Key</span>
              <span class="rk-info-val rk-key-val">••••-••••-••••-${keyLast4}</span>
            </div>
            <div class="rk-info-row">
              <span class="rk-info-label">Expiration Date</span>
              <span class="rk-info-val">${expiresDateFormatted}</span>
            </div>
            <div class="rk-info-row">
              <span class="rk-info-label">Time Remaining</span>
              <span id="rk-countdown-timer" class="rk-info-val rk-timer-val">Calculating...</span>
            </div>
          </div>

          <button id="rk-continue-btn" class="rk-btn-primary" type="button" style="margin-top: 4px;">
            Close Details
          </button>

          <button id="rk-unbind-btn" class="rk-btn-secondary" type="button">
            Deactivate / Change Key
          </button>
        </div>
      `;

      function updateTimer() {
        var timerEl = document.getElementById('rk-countdown-timer');
        if (!timerEl) {
          if (self._countdownInterval) {
            clearInterval(self._countdownInterval);
            self._countdownInterval = null;
          }
          return;
        }

        if (!localExpiresMs || isNaN(localExpiresMs) || localExpiresMs <= 0) {
          timerEl.innerText = 'Lifetime Access (Never Expires)';
          timerEl.style.color = '#38bdf8';
          return;
        }

        var nowMs = Date.now();
        var diff = localExpiresMs - nowMs;

        if (diff <= 0) {
          if (self._countdownInterval) {
            clearInterval(self._countdownInterval);
            self._countdownInterval = null;
          }
          localStorage.removeItem('rk_global_session');
          localStorage.removeItem('rk_global_key');
          localStorage.removeItem('rk_global_expires_at');
          localStorage.removeItem('rk_global_expires_ms');
          self.renderActivationUI('Your license key has expired. Please enter a valid license key to continue.');
          return;
        }

        var totalSeconds = Math.floor(diff / 1000);
        var days = Math.floor(totalSeconds / 86400);
        var hours = Math.floor((totalSeconds % 86400) / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        var parts = [];
        if (days > 0) parts.push(days + 'd');
        if (hours > 0 || days > 0) parts.push(hours + 'h');
        parts.push(minutes + 'm');
        parts.push(seconds + 's');

        timerEl.innerText = parts.join(' ');
      }

      updateTimer();
      self._countdownInterval = setInterval(updateTimer, 1000);

      document.getElementById('rk-continue-btn').addEventListener('click', function () {
        if (self._countdownInterval) {
          clearInterval(self._countdownInterval);
          self._countdownInterval = null;
        }
        self.unlockUI();
        if (typeof self.config.onSuccess === 'function') {
          self.config.onSuccess(data);
        }
      });

      document.getElementById('rk-unbind-btn').addEventListener('click', function () {
        if (self._countdownInterval) {
          clearInterval(self._countdownInterval);
          self._countdownInterval = null;
        }
        localStorage.removeItem('rk_global_session');
        localStorage.removeItem('rk_global_key');
        self.renderActivationUI();
      });
    },

    showError: function (msg) {
      var box = document.getElementById('rk-error-box');
      if (box) {
        box.innerText = msg;
        box.style.display = 'block';
      }
    },

    openExternalUrl: openExternalUrl
  };

  global.Bid032License = Bid032License;
  global.RapidKeyzLicense = Bid032License;

  // Auto-initialize when document is ready
  function autoInit() {
    if (global.Bid032License && typeof global.Bid032License.init === 'function') {
      global.Bid032License.init({
        storeUrl: DEFAULT_STORE_URL,
        onSuccess: function (data) {
          console.log('[Bid032 License] Gridora license initialized and validated successfully:', data);
        }
      });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      autoInit();
    } else {
      document.addEventListener('DOMContentLoaded', autoInit);
    }

    document.addEventListener('click', function (e) {
      var target = e.target;
      if (target && (target.id === 'licenseBtn' || (target.closest && target.closest('#licenseBtn')))) {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        if (global.Bid032License && typeof global.Bid032License.showLicenseDetails === 'function') {
          global.Bid032License.showLicenseDetails();
        }
      }
    });
  }

})(typeof window !== 'undefined' ? window : this);
