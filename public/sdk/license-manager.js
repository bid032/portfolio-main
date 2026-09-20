/**
 * Bid032 & Abdallah Store - Universal License Engine SDK (v1.1.2)
 * Generic activation interface for any plugin, CEP panel, UXP tool, or Web app.
 */
(function (global) {
  'use strict';

  var DEFAULT_STORE_URL = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : 'https://bid032.com';

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

  function injectStyles() {
    if (document.getElementById('rk-license-styles')) return;
    var style = document.createElement('style');
    style.id = 'rk-license-styles';
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;800&display=swap');
      
      .rk-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(4, 4, 6, 0.92);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: #f4f4f5;
        box-sizing: border-box;
        padding: 16px;
      }

      .rk-card {
        background: #0d0d12;
        border: 1px solid #22222e;
        border-radius: 20px;
        width: 100%;
        max-width: 440px;
        padding: 32px 28px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(245, 127, 0, 0.1);
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
        height: 3px;
        background: linear-gradient(90deg, #f57f00, #ff9f24, #f57f00);
      }

      .rk-header {
        text-align: center;
        margin-bottom: 24px;
      }

      .rk-badge {
        display: inline-block;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #f57f00;
        background: rgba(245, 127, 0, 0.12);
        border: 1px solid rgba(245, 127, 0, 0.3);
        padding: 4px 14px;
        border-radius: 20px;
        margin-bottom: 12px;
      }

      .rk-title {
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 6px 0;
        letter-spacing: -0.5px;
      }

      .rk-subtitle {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
        line-height: 1.5;
      }

      .rk-input-group {
        margin-bottom: 20px;
      }

      .rk-label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: #cbd5e1;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .rk-input {
        width: 100%;
        background: #050508;
        border: 1.5px solid #272732;
        border-radius: 12px;
        padding: 14px;
        color: #38bdf8;
        font-family: 'JetBrains Mono', monospace;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 2px;
        text-align: center;
        box-sizing: border-box;
        outline: none;
        transition: all 0.2s ease;
      }

      .rk-input:focus {
        border-color: #f57f00;
        box-shadow: 0 0 0 3px rgba(245, 127, 0, 0.2);
      }

      .rk-btn-primary {
        width: 100%;
        background: #f57f00;
        color: #000000;
        font-weight: 800;
        font-size: 14px;
        padding: 14px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .rk-btn-primary:hover {
        background: #ff8c0a;
        transform: translateY(-1px);
        box-shadow: 0 8px 20px rgba(245, 127, 0, 0.35);
      }

      .rk-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .rk-btn-secondary {
        width: 100%;
        background: #14141d;
        color: #cbd5e1;
        font-weight: 600;
        font-size: 13px;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid #272734;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        text-decoration: none;
        display: block;
        box-sizing: border-box;
        margin-top: 10px;
      }

      .rk-btn-secondary:hover {
        background: #1a1a26;
        color: #ffffff;
        border-color: #3f3f50;
      }

      .rk-error {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #f87171;
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

    init: function (options) {
      options = options || {};
      injectStyles();
      this.config.storeUrl = (options.storeUrl || DEFAULT_STORE_URL).replace(/\/$/, '');
      this.config.onSuccess = options.onSuccess || null;

      // Auto-validate cached session if exists
      var cachedSession = localStorage.getItem('rk_global_session');
      var cachedKey = localStorage.getItem('rk_global_key');

      if (cachedSession && cachedKey) {
        this.validateSession(cachedSession, cachedKey);
      } else {
        this.renderActivationUI();
      }
    },

    validateSession: function (sessionId, licenseKey) {
      var self = this;
      var deviceId = generateDeviceFingerprint();

      fetch(this.config.storeUrl + '/api/v1/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          license_key: licenseKey,
          device_id: deviceId
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.valid) {
            // Session is valid -> Silently remove overlay and unlock tool directly
            var overlay = document.getElementById('rk-modal-overlay');
            if (overlay) {
              overlay.remove();
            }
            if (typeof self.config.onSuccess === 'function') {
              self.config.onSuccess(data);
            }
          } else {
            localStorage.removeItem('rk_global_session');
            localStorage.removeItem('rk_global_key');
            self.renderActivationUI(data.error || 'Session expired or revoked. Please re-activate.');
          }
        })
        .catch(function () {
          // If offline but session is cached, allow unlock
          var overlay = document.getElementById('rk-modal-overlay');
          if (overlay) {
            overlay.remove();
          }
          if (typeof self.config.onSuccess === 'function') {
            self.config.onSuccess({ valid: true, offline: true });
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

      fetch(this.config.storeUrl + '/api/v1/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: cleanKey,
          device_id: deviceId,
          installation_id: installId,
          device_name: 'Workstation (' + (navigator.platform || 'Desktop') + ')',
          platform: navigator.userAgent || 'Web'
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.valid) {
            localStorage.setItem('rk_global_session', data.session_id);
            localStorage.setItem('rk_global_key', cleanKey);
            self.renderSuccessUI(data, cleanKey);
          } else {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = 'Activate License';
            }
            self.showError(data.error || 'Invalid license key.');
          }
        })
        .catch(function (err) {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Activate License';
          }
          self.showError('Unable to connect to license server. Please check internet connection.');
        });
    },

    renderActivationUI: function (errorMessage) {
      var self = this;
      var overlay = document.getElementById('rk-modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'rk-modal-overlay';
        overlay.className = 'rk-modal-overlay';
        document.body.appendChild(overlay);
      }

      var buyUrl = this.config.storeUrl + '/store';

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

          <button id="rk-activate-btn" class="rk-btn-primary">
            Activate License
          </button>

          <a href="${buyUrl}" target="_blank" class="rk-btn-secondary">
            Don't have a license? Buy or Claim Free Trial
          </a>

          <div class="rk-footer-note">
            Secured by Abdallah Store License Platform
          </div>
        </div>
      `;

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
      var overlay = document.getElementById('rk-modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'rk-modal-overlay';
        overlay.className = 'rk-modal-overlay';
        document.body.appendChild(overlay);
      }

      var expiresDate = data.expires_at
        ? new Date(data.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Permanent Access';

      var toolTitle = data.product_title || 'Software Tool';
      var planName = data.plan_name || 'Standard License';
      var keyLast4 = licenseKey ? licenseKey.replace(/[^A-Za-z0-9]/g, '').slice(-4) : '••••';

      overlay.innerHTML = `
        <div class="rk-card">
          <div class="rk-success-box">
            <div class="rk-success-icon">✓</div>
            <h3 style="margin:0 0 4px 0; color:#ffffff; font-size:18px; font-weight:800;">License Activated Successfully!</h3>
            <p style="margin:0; font-size:13px; color:#94a3b8;">Your copy of <strong style="color:#f57f00;">${toolTitle}</strong> is verified & unlocked.</p>

            <div class="rk-info-grid">
              <div class="rk-info-item" style="grid-column: span 2;">
                <label>Tool Name</label>
                <span style="color:#38bdf8; font-size:13px;">${toolTitle}</span>
              </div>
              <div class="rk-info-item">
                <label>Selected Plan</label>
                <span>${planName}</span>
              </div>
              <div class="rk-info-item">
                <label>Key Last 4</label>
                <span>••••-${keyLast4}</span>
              </div>
              <div class="rk-info-item">
                <label>Valid Until</label>
                <span style="color:#38bdf8;">${expiresDate}</span>
              </div>
              <div class="rk-info-item">
                <label>Status</label>
                <span style="color:#4ade80;">ACTIVE</span>
              </div>
            </div>
          </div>

          <button id="rk-continue-btn" class="rk-btn-primary">
            Continue to ${toolTitle}
          </button>

          <button id="rk-unbind-btn" style="background:transparent; border:none; color:#64748b; font-size:12px; margin-top:12px; cursor:pointer; width:100%; text-decoration:underline;">
            Deactivate / Change Key
          </button>
        </div>
      `;

      document.getElementById('rk-continue-btn').addEventListener('click', function () {
        var el = document.getElementById('rk-modal-overlay');
        if (el) {
          el.remove();
        }
        if (typeof self.config.onSuccess === 'function') {
          self.config.onSuccess(data);
        }
      });

      document.getElementById('rk-unbind-btn').addEventListener('click', function () {
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
    }
  };

  global.Bid032License = Bid032License;
  global.RapidKeyzLicense = Bid032License;

})(typeof window !== 'undefined' ? window : this);
