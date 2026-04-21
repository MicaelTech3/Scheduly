import { useState } from "react";
import OwnerSidebar from "./OwnerSidebar";
import Toast from "../Toast";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";

export default function OwnerLayout({ title, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { empresa } = useOwnerAuth();
  const accentColor = empresa?.accentColor || "#534AB7";

  return (
    <div className="owner-layout">
      <OwnerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        accentColor={accentColor}
      />

      <div className="owner-main">
        {/* Mobile topbar */}
        <div className="owner-topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="owner-topbar-title">{title}</span>
          <div style={{ display: "flex", gap: 6 }}>{actions}</div>
        </div>

        <div className="owner-content">
          {/* Desktop page header */}
          <div className="owner-page-header" style={{ display: "flex" }}>
            <h1 className="owner-page-title">{title}</h1>
            {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
          </div>
          {children}
        </div>
      </div>

      <Toast />
    </div>
  );
}