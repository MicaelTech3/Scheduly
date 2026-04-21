import { useEffect, useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { getClientes } from "../../lib/firestore";
import "../../styles/owner.css";

export default function Clientes() {
  const { empresa } = useOwnerAuth();
  const [clientes, setClientes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresa?.id) return;
    getClientes(empresa.id).then((data) => {
      setClientes(data); setFiltered(data); setLoading(false);
    });
  }, [empresa?.id]);

  const search = (q) => {
    const l = q.toLowerCase();
    setFiltered(clientes.filter((c) => c.nome?.toLowerCase().includes(l) || c.email?.toLowerCase().includes(l)));
  };

  const initials = (nome = "") => nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
  const fmtDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <OwnerLayout title="Clientes">
      <div className="owner-card">
        <div className="owner-card-header">
          <span className="owner-card-title">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</span>
          <input className="o-search" type="text" placeholder="Buscar cliente..." onChange={(e) => search(e.target.value)} />
        </div>

        {loading ? <div className="owner-empty">Carregando...</div>
          : clientes.length === 0 ? <div className="owner-empty">Nenhum cliente cadastrado ainda.</div>
            : (<>
              <div className="owner-table-wrap">
                <table className="owner-table">
                  <thead>
                    <tr><th>Cliente</th><th>E-mail</th><th>Telefone</th><th>Desde</th><th>Agendamentos</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E1F5EE", color: "#085041", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                              {initials(c.nome)}
                            </div>
                            <span style={{ fontWeight: 500 }}>{c.nome || "—"}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12 }}>{c.email || "—"}</td>
                        <td style={{ fontSize: 12 }}>{c.telefone || "—"}</td>
                        <td style={{ fontSize: 12, color: "#aaa" }}>{fmtDate(c.criadoEm)}</td>
                        <td>{c.totalAgendamentos || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-list">
                {filtered.map((c) => (
                  <div className="mobile-card" key={c.id}>
                    <div className="mobile-card-top">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#E1F5EE", color: "#085041", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                          {initials(c.nome)}
                        </div>
                        <div>
                          <div className="mobile-card-name">{c.nome || "—"}</div>
                          <div style={{ fontSize: 11, color: "#aaa" }}>{c.email || "—"}</div>
                        </div>
                      </div>
                      <span className="o-badge o-badge-gray">{c.totalAgendamentos || 0} agend.</span>
                    </div>
                    <div className="mobile-card-row">
                      <span>{c.telefone || "Sem telefone"}</span>
                      <span>Desde {fmtDate(c.criadoEm)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>)}
      </div>
    </OwnerLayout>
  );
}