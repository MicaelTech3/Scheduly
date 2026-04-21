import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DevLayout from "../components/DevLayout";
import { getEmpresas, deleteEmpresa, updateEmpresa } from "../lib/firestore";
import { toast } from "../components/Toast";

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const data = await getEmpresas();
    setEmpresas(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const search = (q) => {
    const lower = q.toLowerCase();
    setFiltered(empresas.filter(
      (e) => e.nome?.toLowerCase().includes(lower) || e.propNome?.toLowerCase().includes(lower) || e.slug?.toLowerCase().includes(lower)
    ));
  };

  const handleDelete = async () => {
    await deleteEmpresa(confirmDelete.id);
    setConfirmDelete(null);
    toast("Empresa removida.");
    load();
  };

  const toggleStatus = async (e) => {
    const newStatus = e.status === "ativo" ? "inativo" : "ativo";
    await updateEmpresa(e.id, { status: newStatus });
    toast(`Status alterado para ${newStatus}.`);
    load();
  };

  const planoBadge = (p) => {
    if (p === "Pro") return <span className="badge badge-pro">Pro</span>;
    if (p === "Basic") return <span className="badge badge-basic">Basic</span>;
    return <span className="badge badge-trial">Trial</span>;
  };

  const statusBadge = (s) => {
    if (s === "ativo") return <span className="badge badge-active">ativo</span>;
    if (s === "trial") return <span className="badge badge-trial">trial</span>;
    return <span className="badge badge-inactive">inativo</span>;
  };

  return (
    <DevLayout
      title="Empresas"
      actions={
        <button className="btn btn-primary" onClick={() => navigate("/nova-empresa")}>
          + Nova empresa
        </button>
      }
    >
      <div className="card">
        <div className="card-header">
          <span className="card-title">{filtered.length} empresa{filtered.length !== 1 ? "s" : ""}</span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por nome, slug ou proprietário..."
            onChange={(e) => search(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">Nenhuma empresa encontrada.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Link único</th>
                <th>Proprietário</th>
                <th>Plano</th>
                <th>Clientes</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.nome}</td>
                  <td><span className="link-pill">/{e.slug}</span></td>
                  <td>
                    <div>{e.propNome || "—"}</div>
                    {e.propEmail && <div style={{ fontSize: 11, color: "#888" }}>{e.propEmail}</div>}
                  </td>
                  <td>{planoBadge(e.plano)}</td>
                  <td>{e.clientes || 0}</td>
                  <td>
                    <button
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => toggleStatus(e)}
                    >
                      {statusBadge(e.status)}
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/empresas/${e.id}`)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmDelete(e)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir empresa?</h3>
            <p>
              Tem certeza que deseja excluir <strong>{confirmDelete.nome}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </DevLayout>
  );
}
