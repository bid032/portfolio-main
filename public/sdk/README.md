# 🔑 Bid032 Universal License Manager SDK

This standalone SDK allows you to easily connect any Adobe Plugin (Illustrator, Photoshop, Premiere, After Effects), CEP Panel, UXP Plugin, Electron App, or Web Tool directly to your Bid032 & Abdallah Store License System.

---

## How to Add to Any Tool / Plugin

### Step 1: Copy `license-manager.js` to your Plugin Folder
Download or copy `public/sdk/license-manager.js` into your plugin's project assets directory (e.g. `js/license-manager.js`).

### Step 2: Include the Script in your `index.html`
Add this script tag inside your plugin's `index.html`:

```html
<script src="js/license-manager.js"></script>
```

Or reference it directly from your live store URL:

```html
<script src="https://bid032.com/sdk/license-manager.js"></script>
```

### Step 3: Initialize the License Manager on Plugin Startup

Add this snippet to your JavaScript code:

```javascript
Bid032License.init({
  // Your store URL (or process.env.NEXT_PUBLIC_SITE_URL)
  storeUrl: "https://bid032.com",
  
  // The exact Product ID matching the store (e.g., prod_bessanty_bento)
  productId: "prod_bessanty_bento",
  
  // The display name of your tool
  productTitle: "Bessanty Bento Grid System",
  
  // Callback function triggered when license is verified & active
  onSuccess: function(licenseData) {
    console.log("License is Active & Verified!", licenseData);
    // 🔓 Put your plugin startup / execution logic here!
  }
});
```

---

## 🌟 Key Features Built-in

1. **Activation Screen (Modal UI):**
   - Modern dark mode glassmorphism UI.
   - Auto-formats License Keys as `XXXX-XXXX-XXXX-XXXX`.
   - Displays a direct **"Buy License or Claim Free Trial"** button pointing to your store.

2. **Success Screen:**
   - Displays a green success banner (**"License Activated Successfully!"**).
   - Shows **Selected Plan** (Free Trial, Monthly, Yearly), **Expiration Date**, and **License Status**.
   - Includes a **"Deactivate / Change Key"** button for easy unbinding.

3. **Offline & Session Persistence:**
   - Saves session token and device fingerprint in `localStorage`.
   - Auto-checks existing sessions on launch without requiring re-entry of the license key.
