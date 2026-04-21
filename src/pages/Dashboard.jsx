import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DevLayout from "../components/DevLayout";
import { getEmpresas, getLogins } from "../lib/firestore";

export default function Dashboard() {
  const [empresas, setEmpresas] = useState([]);
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getEmpresas(), getLogins()]).then(([e, l]) => {
      setEmpresas(e);
      setLogins(l);
      setLoading(false);
    });
  }, []);

  const ativas = empresas.filter((e) => e.status === "ativo").length;
  const totalClientes = empresas.reduce((s, e) => s + (e.clientes || 0), 0);
  const trials = empresas.filter((e) => e.status === "trial").length;

  const statusBadge = (s) => {
    if (s === "ativo") return <span className="badge badge-active">ativo</span>;
    if (s === "trial") return <span className="badge badge-trial">trial</span>;
    return <span className="badge badge-inactive">inativo</span>;
  };

  const tipoBadge = (t) => {
    if (t === "dev") return <span className="badge badge-dev">dev</span>;
    if (t === "proprietário") return <span className="badge badge-prop">proprietário</span>;
    return <span className="badge badge-client">cliente</span>;
  };

  const fmtDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DevLayout
      title="Dashboard"
      actions={
        <button className="btn btn-primary" onClick={() => navigate("/nova-empresa")}>
          + Nova empresa
        </button>
      }
    >
      {loading ? (
        <div className="empty-state">Carregando dados...</div>
      ) : (
        <>
          <div className="metrics">
            <div className="metric">
              <div className="metric-label">Empresas ativas</div>
              <div className="metric-value">{ativas}</div>
              <div className="metric-sub">{trials} em trial</div>
            </div>
            <div className="metric">
              <div className="metric-label">Total de empresas</div>
              <div className="metric-value">{empresas.length}</div>
              <div className="metric-sub">cadastradas no sistema</div>
            </div>
            <div className="metric">
              <div className="metric-label">Total de clientes</div>
              <div className="metric-value">{totalClientes.toLocaleString("pt-BR")}</div>
              <div className="metric-sub">em todas as empresas</div>
            </div>
            <div className="metric">
              <div className="metric-label">Logins registrados</div>
              <div className="metric-value">{logins.length}</div>
              <div className="metric-sub">histórico total</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Empresas recentes</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/empresas")}>
                Ver todas
              </button>
            </div>
            {empresas.length === 0 ? (
              <div className="empty-state">Nenhuma empresa cadastrada ainda.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Link</th>
                    <th>Proprietário</th>
                    <th>Status</th>
                    <th>Clientes</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.slice(0, 5).map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 500 }}>{e.nome}</td>
                      <td><span className="link-pill">/{e.slug}</span></td>
                      <td>{e.propNome || "—"}</td>
                      <td>{statusBadge(e.status)}</td>
                      <td>{e.clientes || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Logins recentes</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/logins")}>
                Ver todos
              </button>
            </div>
            {logins.length === 0 ? (
              <div className="empty-state">Nenhum login registrado ainda.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Empresa</th>
                    <th>Tipo</th>
                    <th>Data/hora</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.slice(0, 6).map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{l.email}</td>
                      <td>{l.empresa || "—"}</td>
                      <td>{tipoBadge(l.tipo)}</td>
                      <td>{fmtDate(l.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </DevLayout>
  );
}
