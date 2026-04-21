import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
  >
    <span style={{ fontSize: 16 }}>{icon}</span>
    {label}
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DV";

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-name">Scheduly</div>
        <div className="brand-tag">Painel dev</div>
      </div>

      <nav>
        <div className="nav-section">Geral</div>
        <NavItem to="/dashboard" icon="⊞" label="Dashboard" />

        <div className="nav-section">Empresas</div>
        <NavItem to="/empresas" icon="◫" label="Empresas" />
        <NavItem to="/nova-empresa" icon="⊕" label="Nova empresa" />

        <div className="nav-section">Acesso</div>
        <NavItem to="/logins" icon="◎" label="Logins" />
        <NavItem to="/proprietarios" icon="✦" label="Modo proprietário" />
      </nav>

      <div className="sidebar-footer">
        <div className="avatar-row">
          <div className="avatar">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" />
              : initials}
          </div>
          <div className="avatar-info" style={{ flex: 1, minWidth: 0 }}>
            <p style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.displayName || "Dev"}
            </p>
            <span>admin</span>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#888", padding: "4px" }}
            title="Sair"
          >⎋</button>
        </div>
      </div>
    </aside>
  );
}
