/**
 * Universal License Client SDK (v2.0.0)
 * Works in: Chrome Extensions (Manifest V3 Service Workers & Content Scripts), Web Applications, Electron, Adobe CEP/UXP.
 * 
 * Features:
 * - Zero external npm dependencies.
 * - Hardware / Browser Fingerprint Generation.
 * - Local storage / chrome.storage caching with offline time-drift protection.
 * - ECDSA (ES256) Attestation Cryptographic Verification via Web Crypto API (crypto.subtle).
 * - Background Periodic Heartbeats.
 * - Auto-failover between online store domain and local development server.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LicenseClient = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_STORE_URL = 'https://bid032.com';
  var STORAGE_KEY_SESSION = 'rk_license_session';
  var STORAGE_KEY_KEY = 'rk_license_key';
  var STORAGE_KEY_EXPIRES_MS = 'rk_license_expires_ms';
  var STORAGE_KEY_EXPIRES_AT = 'rk_license_expires_at';
  var STORAGE_KEY_INSTALL_ID = 'rk_installation_id';

  // Universal Cross-Platform Storage Abstraction (Chrome Extension, LocalStorage, Memory)
  var StorageAdapter = {
    get: function (keys, callback) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, function (result) {
          callback(result);
        });
      } else if (typeof localStorage !== 'undefined') {
        var res = {};
        var keyArr = Array.isArray(keys) ? keys : [keys];
        keyArr.forEach(function (k) {
          res[k] = localStorage.getItem(k);
        });
        callback(res);
      } else {
        callback({});
      }
    },
    set: function (obj, callback) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(obj, function () {
          if (callback) callback();
        });
      } else if (typeof localStorage !== 'undefined') {
        Object.keys(obj).forEach(function (k) {
          if (obj[k] === null || obj[k] === undefined) {
            localStorage.removeItem(k);
          } else {
            localStorage.setItem(k, obj[k]);
          }
        });
        if (callback) callback();
      } else {
        if (callback) callback();
      }
    },
    remove: function (keys, callback) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(keys, function () {
          if (callback) callback();
        });
      } else if (typeof localStorage !== 'undefined') {
        var keyArr = Array.isArray(keys) ? keys : [keys];
        keyArr.forEach(function (k) {
          localStorage.removeItem(k);
        });
        if (callback) callback();
      } else {
        if (callback) callback();
      }
    }
  };

  /**
   * Helper: Generate unique device fingerprint
   */
  function generateDeviceFingerprint() {
    var nav = (typeof navigator !== 'undefined') ? navigator : {};
    var screenObj = (typeof screen !== 'undefined') ? screen : {};
    var str = [
      nav.userAgent || '',
      nav.language || '',
      screenObj.colorDepth || '',
      screenObj.width || '',
      screenObj.height || '',
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

  /**
   * Helper: Get or create installation ID
   */
  function getInstallationId(callback) {
    StorageAdapter.get([STORAGE_KEY_INSTALL_ID], function (res) {
      var id = res[STORAGE_KEY_INSTALL_ID];
      if (!id) {
        id = 'inst_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
        var saveObj = {};
        saveObj[STORAGE_KEY_INSTALL_ID] = id;
        StorageAdapter.set(saveObj, function () {
          callback(id);
        });
      } else {
        callback(id);
      }
    });
  }

  /**
   * Universal HTTP POST request helper with failover between online domain & localhost
   */
  function sendPostRequest(baseUrl, path, payload, callback) {
    var targetUrl = baseUrl.replace(/\/$/, '') + path;
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 10000) : null;

    fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        if (timeoutId) clearTimeout(timeoutId);
        return res.json().catch(function () {
          throw new Error('Invalid JSON response from license server.');
        });
      })
      .then(function (data) {
        callback(null, data);
      })
      .catch(function (err) {
        if (timeoutId) clearTimeout(timeoutId);
        // Failover logic if primary host is unreachable
        if (targetUrl.indexOf('bid032.com') !== -1) {
          var fallbackUrl = targetUrl.replace('https://bid032.com', 'http://localhost:3000');
          sendPostRequest(fallbackUrl, '', payload, callback);
        } else {
          callback(err, null);
        }
      });
  }

  /**
   * LicenseClient Constructor
   */
  function LicenseClient(config) {
    config = config || {};
    this.storeUrl = (config.storeUrl || DEFAULT_STORE_URL).replace(/\/$/, '');
    this.productId = config.productId || '';
    this.deviceName = config.deviceName || 'Client Device';
    this.platform = config.platform || (typeof navigator !== 'undefined' ? navigator.platform : 'Desktop');
    this.deviceId = config.deviceId || generateDeviceFingerprint();
    this.heartbeatTimer = null;
  }

  /**
   * Request 3-Day Free Trial
   */
  LicenseClient.prototype.requestTrial = function (email, callback) {
    var self = this;
    getInstallationId(function (installId) {
      var payload = {
        email: email,
        product: self.productId,
        device_id: self.deviceId,
        installation_id: installId,
        device_name: self.deviceName,
        platform: self.platform
      };

      sendPostRequest(self.storeUrl, '/api/v1/license/trial', payload, function (err, data) {
        if (err || !data) {
          callback(err || new Error('Network request failed'));
          return;
        }
        callback(null, data);
      });
    });
  };

  /**
   * Activate License Key
   */
  LicenseClient.prototype.activate = function (licenseKey, callback) {
    var self = this;
    var cleanKey = (licenseKey || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    if (!cleanKey || cleanKey.length < 10) {
      callback(new Error('Invalid license key format. Keys are usually 16 characters long.'));
      return;
    }

    getInstallationId(function (installId) {
      var payload = {
        license_key: cleanKey,
        product: self.productId,
        device_id: self.deviceId,
        installation_id: installId,
        device_name: self.deviceName,
        platform: self.platform
      };

      sendPostRequest(self.storeUrl, '/api/v1/license/activate', payload, function (err, data) {
        if (err || !data) {
          callback(err || new Error('Network error connecting to license server.'));
          return;
        }

        if (data.valid && data.session_id) {
          var saveObj = {};
          saveObj[STORAGE_KEY_SESSION] = data.session_id;
          saveObj[STORAGE_KEY_KEY] = cleanKey;
          if (data.expires_at) {
            saveObj[STORAGE_KEY_EXPIRES_AT] = data.expires_at;
            var expiresMs = new Date(data.expires_at).getTime();
            var serverMs = data.server_time ? new Date(data.server_time).getTime() : Date.now();
            var remainingMs = expiresMs - serverMs;
            if (remainingMs > 0) {
              saveObj[STORAGE_KEY_EXPIRES_MS] = Date.now() + remainingMs;
            }
          }

          StorageAdapter.set(saveObj, function () {
            callback(null, data);
          });
        } else {
          callback(null, data);
        }
      });
    });
  };

  /**
   * Validate Session with local clock tamper protection and remote heartbeat
   */
  LicenseClient.prototype.validate = function (callback) {
    var self = this;

    StorageAdapter.get([STORAGE_KEY_SESSION, STORAGE_KEY_KEY, STORAGE_KEY_EXPIRES_MS, STORAGE_KEY_EXPIRES_AT], function (cached) {
      var sessionId = cached[STORAGE_KEY_SESSION];
      var licenseKey = cached[STORAGE_KEY_KEY];
      var localExpiresMs = cached[STORAGE_KEY_EXPIRES_MS] ? parseInt(cached[STORAGE_KEY_EXPIRES_MS], 10) : 0;

      if (!sessionId || !licenseKey) {
        callback(null, { valid: false, error: 'No active license session found.', errorCode: 'NO_SESSION' });
        return;
      }

      // Check local clock tamper / expiration
      if (localExpiresMs && Date.now() >= localExpiresMs) {
        self.clearSession(function () {
          callback(null, { valid: false, error: 'License key has expired.', errorCode: 'LICENSE_EXPIRED' });
        });
        return;
      }

      var payload = {
        session_id: sessionId,
        license_key: licenseKey,
        product: self.productId,
        device_id: self.deviceId
      };

      sendPostRequest(self.storeUrl, '/api/v1/license/validate', payload, function (err, data) {
        if (err || !data) {
          // If offline / network error, allow offline execution if local timer is valid!
          callback(null, { valid: true, offline: true, session_id: sessionId, expires_at: cached[STORAGE_KEY_EXPIRES_AT] });
          return;
        }

        if (data.valid) {
          if (data.expires_at) {
            var saveObj = {};
            saveObj[STORAGE_KEY_EXPIRES_AT] = data.expires_at;
            var expiresMs = new Date(data.expires_at).getTime();
            var serverMs = data.server_time ? new Date(data.server_time).getTime() : Date.now();
            var remainingMs = expiresMs - serverMs;
            if (remainingMs > 0) {
              saveObj[STORAGE_KEY_EXPIRES_MS] = Date.now() + remainingMs;
            }
            StorageAdapter.set(saveObj);
          }
          callback(null, data);
        } else {
          self.clearSession(function () {
            callback(null, data);
          });
        }
      });
    });
  };

  /**
   * Start Periodic Heartbeat
   */
  LicenseClient.prototype.startHeartbeat = function (intervalMinutes, onStatusChange) {
    this.stopHeartbeat();
    var intervalMs = (intervalMinutes || 10) * 60 * 1000;
    var self = this;

    this.heartbeatTimer = setInterval(function () {
      self.validate(function (err, data) {
        if (onStatusChange) {
          onStatusChange(err, data);
        }
        if (data && !data.valid) {
          self.stopHeartbeat();
        }
      });
    }, intervalMs);
  };

  /**
   * Stop Periodic Heartbeat
   */
  LicenseClient.prototype.stopHeartbeat = function () {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  };

  /**
   * Deactivate current license session
   */
  LicenseClient.prototype.deactivate = function (callback) {
    var self = this;
    this.stopHeartbeat();

    StorageAdapter.get([STORAGE_KEY_SESSION, STORAGE_KEY_KEY], function (cached) {
      var sessionId = cached[STORAGE_KEY_SESSION];
      var licenseKey = cached[STORAGE_KEY_KEY];

      if (!sessionId) {
        self.clearSession(callback);
        return;
      }

      sendPostRequest(self.storeUrl, '/api/v1/license/deactivate', { session_id: sessionId, license_key: licenseKey }, function () {
        self.clearSession(callback);
      });
    });
  };

  /**
   * Clear local session storage
   */
  LicenseClient.prototype.clearSession = function (callback) {
    StorageAdapter.remove([STORAGE_KEY_SESSION, STORAGE_KEY_KEY, STORAGE_KEY_EXPIRES_MS, STORAGE_KEY_EXPIRES_AT], function () {
      if (callback) callback();
    });
  };

  /**
   * Cryptographically verify ECDSA ES256 attestation using Web Crypto API
   */
  LicenseClient.verifyAttestation = async function (attestation, publicKeyPem) {
    try {
      if (!attestation || !attestation.signature || !attestation.payload) return false;
      var pem = publicKeyPem || attestation.publicKeyPem;
      if (!pem) return false;

      // Extract raw Base64 key content from PEM format
      var pemContents = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/[\r\n\s]/g, '');

      var binaryDer = Uint8Array.from(atob(pemContents), function (c) { return c.charCodeAt(0); });

      // Import ECDSA P-256 Public Key via Web Crypto API
      var cryptoKey = await crypto.subtle.importKey(
        'spki',
        binaryDer.buffer,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['verify']
      );

      // Re-create canonical sorted JSON string matching server
      var canonicalString = JSON.stringify(attestation.payload, Object.keys(attestation.payload).sort());
      var encoder = new TextEncoder();
      var dataBuffer = encoder.encode(canonicalString);

      // Convert Base64 signature to Uint8Array buffer
      var sigBinary = Uint8Array.from(atob(attestation.signature), function (c) { return c.charCodeAt(0); });

      // Verify signature with SHA-256
      var isValid = await crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        cryptoKey,
        sigBinary.buffer,
        dataBuffer
      );

      return isValid;
    } catch (e) {
      return false;
    }
  };

  return LicenseClient;
}));
