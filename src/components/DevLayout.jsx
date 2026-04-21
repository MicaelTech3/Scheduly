import Sidebar from "./Sidebar";
import Toast from "./Toast";

export default function DevLayout({ title, actions, children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">{actions}</div>
        </div>
        <div className="content">{children}</div>
      </div>
      <Toast />
    </div>
  );
}
