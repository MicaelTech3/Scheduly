import { NavLink, useNavigate } from "react-router-dom";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `owner-nav-item${isActive ? " active" : ""}`}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const Icon = ({ d }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function OwnerSidebar({ open, onClose, accentColor = "#534AB7" }) {
  const { user, empresa, logout } = useOwnerAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/owner/login");
  };

  const initials = (empresa?.nome || user?.email || "PR")
    .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const close = () => onClose?.();

  return (
    <>
      <div className={`sidebar-overlay${open ? " open" : ""}`} onClick={close} />
      <aside className={`owner-sidebar${open ? " open" : ""}`}>
        <div className="owner-brand" style={{ borderBottom: `3px solid ${accentColor}` }}>
          <div className="owner-brand-name" style={{ color: accentColor }}>Scheduly</div>
          <div className="owner-brand-empresa">{empresa?.nome || "Carregando..."}</div>
        </div>

        <nav className="owner-nav">
          <div className="owner-nav-section">Visão geral</div>
          <NavItem to="/owner/dashboard" icon={<Icon d="M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z" />} label="Dashboard" onClick={close} />

          <div className="owner-nav-section">Gestão</div>
          <NavItem to="/owner/servicos" icon={<Icon d="M8 1v14M1 8h14" />} label="Serviços" onClick={close} />
          <NavItem to="/owner/pacotes" icon={<Icon d="M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />} label="Pacotes" onClick={close} />
          <NavItem to="/owner/stories" icon={<Icon d="M9.5 1.5l5 5-9 9-5-5 9-9zM6 10l-1.5 1.5" />} label="Stories" onClick={close} />

          <div className="owner-nav-section">Operação</div>
          <NavItem to="/owner/agenda" icon={<Icon d="M1 5h14M4 1v2M12 1v2M2 2h12a1 1 0 011 1v11a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" />} label="Agenda e horários" onClick={close} />
          <NavItem to="/owner/colaboradores" icon={<Icon d="M11 13s0-3-3-3-3 3-3 3M8 7a2 2 0 100-4 2 2 0 000 4zM14 13s0-2-2-2M13 5a2 2 0 010 4" />} label="Colaboradores" onClick={close} />
          <NavItem to="/owner/clientes" icon={<Icon d="M5 13s0-3 3-3 3 3 3 3M8 7a2 2 0 100-4 2 2 0 000 4z" />} label="Clientes" onClick={close} />

          <div className="owner-nav-section">Financeiro</div>
          <NavItem to="/owner/caixa" icon={<Icon d="M1 4h14v9H1zM1 7h14M5 10h2" />} label="Caixa" onClick={close} />

          <div className="owner-nav-section">Config</div>
          <NavItem to="/owner/aparencia" icon={<Icon d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 2v2M8 12v2M2 8H4M12 8h2" />} label="Aparência" onClick={close} />
        </nav>

        <div className="owner-sidebar-footer">
          <div className="owner-user-row">
            <div className="owner-avatar" style={{ background: accentColor + "22", color: accentColor }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email}
              </div>
              <div style={{ fontSize: 11, color: "#aaa" }}>proprietário</div>
            </div>
            <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#aaa", padding: 4 }} title="Sair">↩</button>
          </div>
        </div>
      </aside>
    </>
  );
}