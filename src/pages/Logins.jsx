import { useEffect, useState } from "react";
import DevLayout from "../components/DevLayout";
import { getLogins } from "../lib/firestore";

export default function Logins() {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLogins().then((data) => { setLogins(data); setLoading(false); });
  }, []);

  const tipoBadge = (t) => {
    if (t === "dev") return <span className="badge badge-dev">dev</span>;
    if (t === "proprietário") return <span className="badge badge-prop">proprietário</span>;
    return <span className="badge badge-client">cliente</span>;
  };

  const fmtDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <DevLayout title="Logins">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Histórico de acessos</span>
          <span style={{ fontSize: 12, color: "#888" }}>{logins.length} registros</span>
        </div>
        {loading ? (
          <div className="empty-state">Carregando...</div>
        ) : logins.length === 0 ? (
          <div className="empty-state">Nenhum login registrado ainda.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Nome</th>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Data / hora</th>
              </tr>
            </thead>
            <tbody>
              {logins.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{l.email}</td>
                  <td>{l.nome || "—"}</td>
                  <td>{l.empresa || "—"}</td>
                  <td>{tipoBadge(l.tipo)}</td>
                  <td style={{ fontSize: 12, color: "#888" }}>{fmtDate(l.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DevLayout>
  );
}
