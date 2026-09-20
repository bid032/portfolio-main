const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'store', 'admin', 'page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const navStart = '<nav className="mt-6 space-y-1.5 hidden lg:block">';
const navEnd = '</nav>';

const startIdx = code.indexOf(navStart);
const endIdx = code.indexOf(navEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newNav = `<nav className="mt-6 space-y-1.5 hidden lg:block">
              {/* 1. Sales & Analytics */}
              <button
                onClick={() => setActiveTab("analytics")}
                className={\`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group \${activeTab === "analytics"
                  ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }\`}
              >
                <div className="flex items-center gap-3">
                  <FaChartLine className={\`text-base \${activeTab === "analytics" ? "text-black" : "text-amber-400"}\`} />
                  <span>Sales & Analytics</span>
                </div>
                <span className={\`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold \${activeTab === "analytics" ? "bg-black/30 text-amber-200" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }\`}>
                  Live
                </span>
              </button>

              {/* 2. Orders & Approvals (Merged Orders Queue + Payment Approval) */}
              <button
                onClick={() => {
                  setActiveTab("orders");
                }}
                className={\`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group \${activeTab === "orders" || activeTab === "payments"
                  ? "bg-primary text-black font-black shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }\`}
              >
                <div className="flex items-center gap-3">
                  <FaShoppingBag className={\`text-base \${activeTab === "orders" || activeTab === "payments" ? "text-black" : "text-amber-400"}\`} />
                  <span>Orders & Approvals</span>
                </div>
                {orders.filter((o) => o.status === "pending").length > 0 ? (
                  <span className={\`px-2 py-0.5 rounded-full text-[10px] font-mono font-black \${activeTab === "orders" || activeTab === "payments" ? "bg-black text-amber-400" : "bg-amber-500 text-black animate-pulse"
                    }\`}>
                    {orders.filter((o) => o.status === "pending").length} Pending
                  </span>
                ) : (
                  <span className={\`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold \${activeTab === "orders" || activeTab === "payments" ? "bg-black/30 text-black" : "bg-surface text-text-muted"
                    }\`}>
                    {orders.length}
                  </span>
                )}
              </button>

              {/* 3. Customer Leads CRM */}
              <button
                onClick={() => setActiveTab("customers")}
                className={\`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group \${activeTab === "customers"
                  ? "bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }\`}
              >
                <div className="flex items-center gap-3">
                  <FaUsers className={\`text-base \${activeTab === "customers" ? "text-black" : "text-emerald-400"}\`} />
                  <span>Customer Leads</span>
                </div>
                <span className={\`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold \${activeTab === "customers" ? "bg-black/30 text-emerald-200" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }\`}>
                  CRM
                </span>
              </button>

              {/* 4. Products & Plans (Merged Catalog + Subscription Plans) */}
              <button
                onClick={() => {
                  setActiveTab("products");
                }}
                className={\`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group \${activeTab === "products" || activeTab === "plans"
                  ? "bg-blue-500 text-white font-black shadow-lg shadow-blue-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }\`}
              >
                <div className="flex items-center gap-3">
                  <FaLayerGroup className={\`text-base \${activeTab === "products" || activeTab === "plans" ? "text-white" : "text-blue-400"}\`} />
                  <span>Products & Plans</span>
                </div>
                <span className={\`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold \${activeTab === "products" || activeTab === "plans" ? "bg-black/30 text-blue-200" : "bg-blue-500/10 text-blue-400"
                  }\`}>
                  {products.length}
                </span>
              </button>

              {/* 5. Licenses & Keys */}
              <button
                onClick={() => setActiveTab("licenses")}
                className={\`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group \${activeTab === "licenses"
                  ? "bg-amber-400 text-black font-black shadow-lg shadow-amber-400/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }\`}
              >
                <div className="flex items-center gap-3">
                  <FaKey className={\`text-base \${activeTab === "licenses" ? "text-black" : "text-amber-400"}\`} />
                  <span>Licenses & Keys</span>
                </div>
                <span className={\`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold \${activeTab === "licenses" ? "bg-black/30 text-amber-200" : "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                  }\`}>
                  {licenses.length}
                </span>
              </button>

              {/* 6. Coupons & Offers */}
              <button
                onClick={() => setActiveTab("coupons")}
                className={\`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group \${activeTab === "coupons"
                  ? "bg-purple-500 text-white font-black shadow-lg shadow-purple-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }\`}
              >
                <div className="flex items-center gap-3">
                  <FaTag className={\`text-base \${activeTab === "coupons" ? "text-white" : "text-purple-400"}\`} />
                  <span>Coupons & Offers</span>
                </div>
                <span className={\`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold \${activeTab === "coupons" ? "bg-black/30 text-purple-200" : "bg-purple-500/10 text-purple-400"
                  }\`}>
                  {coupons.length}
                </span>
              </button>

              {/* 7. Store Settings & Audit */}
              <button
                onClick={() => setActiveTab("settings")}
                className={\`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group \${activeTab === "settings" || activeTab === "audit"
                  ? "bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }\`}
              >
                <div className="flex items-center gap-3">
                  <FaCog className={\`text-base \${activeTab === "settings" || activeTab === "audit" ? "text-black" : "text-cyan-400"}\`} />
                  <span>Store Settings</span>
                </div>
              </button>`;

  code = code.substring(0, startIdx) + newNav + code.substring(endIdx);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Sidebar navigation updated successfully!');
} else {
  console.log('Sidebar navigation start/end match failed!');
}
