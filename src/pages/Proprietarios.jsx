import { useEffect, useState } from "react";
import DevLayout from "../components/DevLayout";
import { getEmpresas, updateEmpresa } from "../lib/firestore";
import { toast } from "../components/Toast";

export default function Proprietarios() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmpresas().then((data) => { setEmpresas(data); setLoading(false); });
  }, []);

  const toggle = async (e, val) => {
    await updateEmpresa(e.id, { propAtivo: val });
    setEmpresas((prev) =>
      prev.map((item) => item.id === e.id ? { ...item, propAtivo: val } : item)
    );
    toast(`Acesso do proprietário ${val ? "ativado" : "desativado"} para ${e.nome}.`);
  };

  const planoBadge = (p) => {
    if (p === "Pro") return <span className="badge badge-pro">Pro</span>;
    if (p === "Basic") return <span className="badge badge-basic">Basic</span>;
    return <span className="badge badge-trial">Trial</span>;
  };

  return (
    <DevLayout title="Modo proprietário">
      <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
        Ative ou desative o acesso do proprietário ao painel de cada empresa.
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Controle de acesso por empresa</span>
          <span style={{ fontSize: 12, color: "#888" }}>
            {empresas.filter((e) => e.propAtivo).length} ativo{empresas.filter((e) => e.propAtivo).length !== 1 ? "s" : ""}
          </span>
        </div>
        {loading ? (
          <div className="empty-state">Carregando...</div>
        ) : empresas.length === 0 ? (
          <div className="empty-state">Nenhuma empresa cadastrada.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Proprietário</th>
                <th>Link de acesso</th>
                <th>Plano</th>
                <th>Acesso ativo</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.nome}</td>
                  <td>
                    <div>{e.propNome || "—"}</div>
                    {e.propEmail && <div style={{ fontSize: 11, color: "#888" }}>{e.propEmail}</div>}
                  </td>
                  <td><span className="link-pill">/{e.slug}</span></td>
                  <td>{planoBadge(e.plano)}</td>
                  <td>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={!!e.propAtivo}
                        onChange={(ev) => toggle(e, ev.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DevLayout>
  );
}
