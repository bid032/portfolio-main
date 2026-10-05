// Content Script - Protection Layer
(function () {
  console.log("[Extension Content Script] Checking license status...");

  chrome.runtime.sendMessage({ action: 'CHECK_STATUS' }, function (response) {
    if (response && response.res && response.res.valid) {
      console.log("%c [License Verified] Premium extension features unlocked!", "color: #4ade80; font-weight: bold;");
      initializePremiumFeatures();
    } else {
      console.warn("%c [License Lock] License required. Premium features locked.", "color: #f87171; font-weight: bold;");
    }
  });

  function initializePremiumFeatures() {
    // Write your premium feature logic here (e.g. DOM manipulation, automated tools, etc.)
  }
})();
