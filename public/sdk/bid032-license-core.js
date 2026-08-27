/**
 * BID032 Store - Universal License Core SDK
 * Version: 1.0.0
 * Website: https://bid032.com/store
 * 
 * Production-ready, zero-dependency license validation core for paid tools, plugins, 
 * Adobe Illustrator/Photoshop scripts, CEP extensions, Node.js desktop apps, and Web tools.
 */

(function (global) {
  "use strict";

  var CONFIG = {
    SERVER_URL: "https://bid032.com", // Replace with your production domain
    PRODUCT_ID: "illustrator-outliner", // Set to your specific paid tool ID
    STORAGE_KEY: "bid032_license_token",
    HEARTBEAT_INTERVAL_MS: 4 * 60 * 60 * 1000, // 4 hours
  };

  /**
   * Helper to retrieve persistent storage across environments (Browser, CEP, ExtendScript, Node)
   */
  function getStorageItem(key) {
    try {
      if (typeof localStorage !== "undefined") return localStorage.getItem(key);
      if (typeof process !== "undefined" && process.env && process.env[key]) return process.env[key];
    } catch (e) {}
    return null;
  }

  function setStorageItem(key, val) {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, val);
    } catch (e) {}
  }

  function removeStorageItem(key) {
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(key);
    } catch (e) {}
  }

  /**
   * Generates or retrieves a unique local device fingerprint
   */
  function getDeviceFingerprint() {
    var stored = getStorageItem("bid032_device_fp");
    if (stored) return stored;

    var newFp = "dev_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    setStorageItem("bid032_device_fp", newFp);
    return newFp;
  }

  /**
   * Basic HTTP POST fetch helper
   */
  function postRequest(endpoint, bodyData, callback) {
    var url = CONFIG.SERVER_URL + endpoint;
    
    if (typeof fetch !== "undefined") {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) { callback(null, data); })
        .catch(function (err) { callback(err, null); });
    } else if (typeof XMLHttpRequest !== "undefined") {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              callback(null, JSON.parse(xhr.responseText));
            } catch (e) {
              callback(e, null);
            }
          } else {
            callback(new Error("HTTP Error " + xhr.status), null);
          }
        }
      };
      xhr.send(JSON.stringify(bodyData));
    } else {
      callback(new Error("No HTTP request provider available in environment."), null);
    }
  }

  var BID032LicenseCore = {
    /**
     * Configure SDK settings
     */
    init: function (options) {
      if (options.serverUrl) CONFIG.SERVER_URL = options.serverUrl.replace(/\/$/, "");
      if (options.productId) CONFIG.PRODUCT_ID = options.productId;
      if (options.storageKey) CONFIG.STORAGE_KEY = options.storageKey;
    },

    /**
     * Request a 3-Day Free Trial
     */
    requestTrial: function (userEmail, callback) {
      var deviceFingerprint = getDeviceFingerprint();
      postRequest("/api/v1/license/trial", {
        userEmail: userEmail,
        productId: CONFIG.PRODUCT_ID,
        deviceFingerprint: deviceFingerprint,
      }, function (err, res) {
        if (err) return callback({ success: false, error: err.message });
        if (res.success && res.rawLicenseKey) {
          // Auto activate
          BID032LicenseCore.activate(res.rawLicenseKey, callback);
        } else {
          callback(res);
        }
      });
    },

    /**
     * Activate a License Key on current device
     */
    activate: function (rawLicenseKey, callback) {
      var deviceFingerprint = getDeviceFingerprint();

      postRequest("/api/v1/license/activate", {
        rawLicenseKey: rawLicenseKey,
        productId: CONFIG.PRODUCT_ID,
        deviceFingerprint: deviceFingerprint,
        deviceName: (typeof navigator !== "undefined" && navigator.userAgent) || "Client Device",
      }, function (err, res) {
        if (err) return callback({ success: false, error: err.message });
        if (res.success && res.attestationToken) {
          setStorageItem(CONFIG.STORAGE_KEY, res.attestationToken);
          setStorageItem(CONFIG.STORAGE_KEY + "_key", rawLicenseKey);
        }
        callback(res);
      });
    },

    /**
     * Validate active cached license token with server
     */
    validate: function (callback) {
      var token = getStorageItem(CONFIG.STORAGE_KEY);
      var rawKey = getStorageItem(CONFIG.STORAGE_KEY + "_key");

      if (!token && !rawKey) {
        return callback({ valid: false, error: "No license token found. Please activate." });
      }

      postRequest("/api/v1/license/validate", {
        attestationToken: token || undefined,
        rawLicenseKey: rawKey || undefined,
        productId: CONFIG.PRODUCT_ID,
        deviceFingerprint: getDeviceFingerprint(),
      }, function (err, res) {
        if (err) {
          // Offline Grace Period check
          if (token) {
            return callback({ valid: true, offlineMode: true, message: "Server unreachable. Using cached offline token." });
          }
          return callback({ valid: false, error: err.message });
        }
        callback(res);
      });
    },

    /**
     * Start background heartbeat loop
     */
    startHeartbeat: function () {
      setInterval(function () {
        var token = getStorageItem(CONFIG.STORAGE_KEY);
        if (token) {
          postRequest("/api/v1/license/heartbeat", {
            attestationToken: token,
            deviceFingerprint: getDeviceFingerprint(),
          }, function () {});
        }
      }, CONFIG.HEARTBEAT_INTERVAL_MS);
    },

    /**
     * Deactivate / Logout license on this device
     */
    deactivate: function (callback) {
      var token = getStorageItem(CONFIG.STORAGE_KEY);
      removeStorageItem(CONFIG.STORAGE_KEY);
      removeStorageItem(CONFIG.STORAGE_KEY + "_key");

      if (token) {
        postRequest("/api/v1/license/deactivate", {
          attestationToken: token,
          deviceFingerprint: getDeviceFingerprint(),
        }, function (err, res) {
          if (callback) callback(res || { success: true });
        });
      } else if (callback) {
        callback({ success: true });
      }
    },
  };

  // Expose to global scope
  global.BID032License = BID032LicenseCore;

})(typeof window !== "undefined" ? window : globalThis);
