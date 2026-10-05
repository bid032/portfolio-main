// Manifest V3 Background Service Worker
importScripts('license-client.js');

const sdk = new LicenseClient({
  storeUrl: "https://bid032.com",
  productId: "my-chrome-extension-id",
  deviceName: "Chrome Extension Workstation"
});

// Periodic validation alarm every 15 minutes
chrome.alarms.create('check_license_alarm', { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check_license_alarm') {
    sdk.validate((err, res) => {
      if (res && !res.valid) {
        console.warn("[Background] License invalid or expired:", res.error);
        chrome.storage.local.set({ is_activated: false });
      } else if (res && res.valid) {
        chrome.storage.local.set({ is_activated: true, plan: res.plan_name || "Active Plan" });
      }
    });
  }
});

// Message listener for popup & content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ACTIVATE') {
    sdk.activate(message.licenseKey, (err, res) => {
      if (res && res.valid) {
        chrome.storage.local.set({ is_activated: true, plan: res.plan_name });
      }
      sendResponse({ err: err ? err.message : null, res });
    });
    return true; // Async response
  }

  if (message.action === 'REQUEST_TRIAL') {
    sdk.requestTrial(message.email, (err, res) => {
      sendResponse({ err: err ? err.message : null, res });
    });
    return true;
  }

  if (message.action === 'CHECK_STATUS') {
    sdk.validate((err, res) => {
      sendResponse({ err: err ? err.message : null, res });
    });
    return true;
  }

  if (message.action === 'DEACTIVATE') {
    sdk.deactivate(() => {
      chrome.storage.local.set({ is_activated: false });
      sendResponse({ success: true });
    });
    return true;
  }
});
