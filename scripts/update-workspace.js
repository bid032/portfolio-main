const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'store', 'admin', 'page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update Header Bar titles
const oldHeaderBadges = `{activeTab === "analytics" && "Revenue Analytics"}
                  {activeTab === "orders" && "Orders Queue"}
                  {activeTab === "customers" && "Customer CRM"}
                  {activeTab === "products" && "Product Catalog"}
                  {activeTab === "coupons" && "Promotions & Offers"}
                  {activeTab === "audit" && "Audit Logs"}
                  {activeTab === "settings" && "Store Config"}`;

const newHeaderBadges = `{activeTab === "analytics" && "Revenue Analytics"}
                  {(activeTab === "orders" || activeTab === "payments") && "Orders Queue & Approvals"}
                  {activeTab === "customers" && "Customer CRM"}
                  {(activeTab === "products" || activeTab === "plans") && "Products & Subscription Plans"}
                  {activeTab === "licenses" && "License Engine & Keys"}
                  {activeTab === "coupons" && "Promotions & Offers"}
                  {(activeTab === "settings" || activeTab === "audit") && "Store Config & Audit Stream"}`;

if (code.includes(oldHeaderBadges)) {
  code = code.replace(oldHeaderBadges, newHeaderBadges);
  console.log('Header badges updated!');
}

const oldHeaderTitle = `{activeTab === "analytics" && "Sales & Revenue Analytics"}
                {activeTab === "orders" && "Customer Orders Management"}
                {activeTab === "customers" && "Customer Leads Directory"}
                {activeTab === "products" && "Digital Products Catalog"}
                {activeTab === "licenses" && "License Engine & Keys"}
                {activeTab === "plans" && "Product Subscription Plans"}
                {activeTab === "payments" && "License Payment Approval"}
                {activeTab === "coupons" && "Discount Coupons & Offers"}
                {activeTab === "audit" && "System Activity Audit Log"}
                {activeTab === "settings" && "Store Settings & Payments"}`;

const newHeaderTitle = `{activeTab === "analytics" && "Sales & Revenue Analytics"}
                {(activeTab === "orders" || activeTab === "payments") && "Customer Orders & Payment Approvals"}
                {activeTab === "customers" && "Customer Leads Directory"}
                {(activeTab === "products" || activeTab === "plans") && "Products Catalog & Subscription Plans"}
                {activeTab === "licenses" && "License Engine & Keys Management"}
                {activeTab === "coupons" && "Discount Coupons & Promotions"}
                {(activeTab === "settings" || activeTab === "audit") && "Store Settings & System Audit Logs"}`;

if (code.includes(oldHeaderTitle)) {
  code = code.replace(oldHeaderTitle, newHeaderTitle);
  console.log('Header titles updated!');
}

// 2. Update TAB 1: Orders Queue condition to also match payments tab: activeTab === "orders" || activeTab === "payments"
const oldOrdersCond = '{activeTab === "orders" && (';
const newOrdersCond = '{(activeTab === "orders" || activeTab === "payments") && (';

if (code.includes(oldOrdersCond)) {
  code = code.replace(oldOrdersCond, newOrdersCond);
  console.log('Orders tab condition updated!');
}

// 3. Update TAB 2: Products Catalog condition to also match plans tab: activeTab === "products" || activeTab === "plans"
const oldProductsCond = '{activeTab === "products" && (';
const newProductsCond = '{(activeTab === "products" || activeTab === "plans") && (';

if (code.includes(oldProductsCond)) {
  code = code.replace(oldProductsCond, newProductsCond);
  console.log('Products tab condition updated!');
}

// 4. Update TAB 4: Store Settings condition to also match audit tab: activeTab === "settings" || activeTab === "audit"
const oldSettingsCond = '{activeTab === "settings" && (';
const newSettingsCond = '{(activeTab === "settings" || activeTab === "audit") && (';

if (code.includes(oldSettingsCond)) {
  code = code.replace(oldSettingsCond, newSettingsCond);
  console.log('Settings tab condition updated!');
}

fs.writeFileSync(filePath, code, 'utf8');
