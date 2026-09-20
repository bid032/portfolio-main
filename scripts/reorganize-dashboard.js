const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'store', 'admin', 'page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add new sub-tab states right after activeTab state declaration
const oldStateDecl = `  const [activeTab, setActiveTab] = useState<
    | "orders"
    | "products"
    | "coupons"
    | "customers"
    | "audit"
    | "settings"
    | "contact_leads"
    | "analytics"
    | "licenses"
    | "plans"
    | "payments"
  >("analytics");`;

const newStateDecl = `  const [activeTab, setActiveTab] = useState<
    | "orders"
    | "products"
    | "coupons"
    | "customers"
    | "audit"
    | "settings"
    | "contact_leads"
    | "analytics"
    | "licenses"
    | "plans"
    | "payments"
  >("analytics");

  const [ordersFilterMode, setOrdersFilterMode] = useState<"all" | "pending" | "approved" | "free">("all");
  const [productsSubTab, setProductsSubTab] = useState<"products" | "plans">("products");
  const [settingsSubTab, setSettingsSubTab] = useState<"config" | "audit">("config");`;

if (code.includes(oldStateDecl)) {
  code = code.replace(oldStateDecl, newStateDecl);
  console.log('State declaration updated successfully!');
} else {
  console.log('State declaration match failed!');
}

fs.writeFileSync(filePath, code, 'utf8');
