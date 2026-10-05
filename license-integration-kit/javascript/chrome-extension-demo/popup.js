document.addEventListener('DOMContentLoaded', () => {
  const formContainer = document.getElementById('form-container');
  const unlockedCard = document.getElementById('unlocked-card');
  const planName = document.getElementById('plan-name');
  const expireDate = document.getElementById('expire-date');
  const msg = document.getElementById('msg');

  const keyInput = document.getElementById('key-input');
  const activateBtn = document.getElementById('activate-btn');
  const emailInput = document.getElementById('email-input');
  const trialBtn = document.getElementById('trial-btn');
  const deactivateBtn = document.getElementById('deactivate-btn');

  // Check initial license status on open
  chrome.runtime.sendMessage({ action: 'CHECK_STATUS' }, (response) => {
    if (response && response.res && response.res.valid) {
      showUnlocked(response.res);
    } else {
      showLocked();
    }
  });

  // Activate handler
  activateBtn.addEventListener('click', () => {
    const key = keyInput.value.trim();
    if (!key) return showMsg("Please enter a license key.", "error");

    activateBtn.disabled = true;
    activateBtn.innerText = "Activating...";

    chrome.runtime.sendMessage({ action: 'ACTIVATE', licenseKey: key }, (response) => {
      activateBtn.disabled = false;
      activateBtn.innerText = "Activate License";

      if (response.err || !response.res.valid) {
        showMsg(response.err || response.res.error || "Activation failed", "error");
      } else {
        showMsg("License activated successfully!", "success");
        showUnlocked(response.res);
      }
    });
  });

  // Request Trial handler
  trialBtn.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (!email) return showMsg("Please enter your email.", "error");

    trialBtn.disabled = true;
    trialBtn.innerText = "Sending Request...";

    chrome.runtime.sendMessage({ action: 'REQUEST_TRIAL', email }, (response) => {
      trialBtn.disabled = false;
      trialBtn.innerText = "Request 3-Day Free Trial";

      if (response.err || !response.res.success) {
        showMsg(response.err || response.res.error || "Trial request failed", "error");
      } else {
        keyInput.value = response.res.rawLicenseKey || "";
        showMsg("Trial key created! Click Activate below.", "success");
      }
    });
  });

  // Deactivate handler
  deactivateBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'DEACTIVATE' }, () => {
      showLocked();
      showMsg("License deactivated.", "success");
    });
  });

  function showUnlocked(res) {
    formContainer.style.display = 'none';
    unlockedCard.style.display = 'block';
    planName.innerText = res.plan_name || res.plan || "Active Plan";
    expireDate.innerText = res.expires_at ? new Date(res.expires_at).toLocaleString() : "Lifetime Access";
  }

  function showLocked() {
    formContainer.style.display = 'block';
    unlockedCard.style.display = 'none';
  }

  function showMsg(text, type) {
    msg.innerText = text;
    msg.className = type;
  }
});
