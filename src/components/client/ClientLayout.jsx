import { NavLink } from "react-router-dom";

const IconHome = () => <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>;
const IconGrid = () => <svg viewBox="0 0 24 24"><path d="M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z"/></svg>;
const IconPlus = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
const IconCalendar = () => <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IconGift = () => <svg viewBox="0 0 24 24"><path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>;

export default function ClientLayout({ empresa, children }) {
  const nomeExibido = empresa.nomeExibido || empresa.nome;
  const base = `/c/${empresa.slug}`;

  return (
    <div className="c-layout">
      <header className="c-header">
        <div className="c-header-title">{nomeExibido}</div>
      </header>

      <main className="c-main">
        {children}
      </main>

      <nav className="c-nav-bottom">
        <NavLink to={base} end className={({ isActive }) => `c-nav-item${isActive ? " active" : ""}`}>
          <IconHome />
          <span>Início</span>
        </NavLink>
        <NavLink to={`${base}/servicos`} className={({ isActive }) => `c-nav-item${isActive ? " active" : ""}`}>
          <IconGrid />
          <span>Serviços</span>
        </NavLink>
        <NavLink to={`${base}/agendar`} className={({ isActive }) => `c-nav-item${isActive ? " active" : ""}`}>
          <IconPlus />
          <span>Agendar</span>
        </NavLink>
        <NavLink to={`${base}/pacotes`} className={({ isActive }) => `c-nav-item${isActive ? " active" : ""}`}>
          <IconGift />
          <span>Pacotes</span>
        </NavLink>
        <NavLink to={`${base}/agendamentos`} className={({ isActive }) => `c-nav-item${isActive ? " active" : ""}`}>
          <IconCalendar />
          <span>Agenda</span>
        </NavLink>
      </nav>
    </div>
  );
}
