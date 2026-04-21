// Colaboradores
import { useEffect, useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { getColaboradores, createColaborador, deleteColaborador } from "../../lib/firestore";
import { toast } from "../../components/Toast";
import "../../styles/owner.css";

const emptyColab = { nome: "", cargo: "", email: "", telefone: "" };

export default function Colaboradores() {
  const { empresa } = useOwnerAuth();
  const [colabs, setColabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyColab);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    if (!empresa?.id) return;
    setLoading(true);
    setColabs(await getColaboradores(empresa.id));
    setLoading(false);
  };

  useEffect(() => { load(); }, [empresa?.id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.nome.trim()) { toast("Informe o nome."); return; }
    setSaving(true);
    await createColaborador(empresa.id, form);
    toast("Colaborador adicionado!");
    setSaving(false);
    setModal(false);
    setForm(emptyColab);
    load();
  };

  const del = async () => {
    await deleteColaborador(empresa.id, confirmDel.id);
    setConfirmDel(null);
    toast("Colaborador removido.");
    load();
  };

  const initials = (nome) => nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <OwnerLayout
      title="Colaboradores"
      actions={<button className="o-btn o-btn-primary" onClick={() => setModal(true)}>+ Adicionar</button>}
    >
      <div className="owner-card">
        <div className="owner-card-header">
          <span className="owner-card-title">{colabs.length} colaborador{colabs.length !== 1 ? "es" : ""}</span>
        </div>

        {loading ? <div className="owner-empty">Carregando...</div>
          : colabs.length === 0 ? <div className="owner-empty">Nenhum colaborador cadastrado.</div>
            : (<>
              <div className="owner-table-wrap">
                <table className="owner-table">
                  <thead>
                    <tr><th>Nome</th><th>Cargo</th><th>E-mail</th><th>Telefone</th><th></th></tr>
                  </thead>
                  <tbody>
                    {colabs.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEEDFE", color: "#3C3489", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                              {initials(c.nome)}
                            </div>
                            <span style={{ fontWeight: 500 }}>{c.nome}</span>
                          </div>
                        </td>
                        <td>{c.cargo || "—"}</td>
                        <td style={{ fontSize: 12 }}>{c.email || "—"}</td>
                        <td style={{ fontSize: 12 }}>{c.telefone || "—"}</td>
                        <td>
                          <button className="o-btn o-btn-danger o-btn-sm" onClick={() => setConfirmDel(c)}>Remover</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-list">
                {colabs.map((c) => (
                  <div className="mobile-card" key={c.id}>
                    <div className="mobile-card-top">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EEEDFE", color: "#3C3489", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                          {initials(c.nome)}
                        </div>
                        <div>
                          <div className="mobile-card-name">{c.nome}</div>
                          <div style={{ fontSize: 11, color: "#aaa" }}>{c.cargo || "Sem cargo"}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mobile-card-row">
                      <span>{c.email || "—"}</span>
                      <span>{c.telefone || "—"}</span>
                    </div>
                    <div className="mobile-card-actions">
                      <button className="o-btn o-btn-danger o-btn-sm" onClick={() => setConfirmDel(c)}>Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </>)}
      </div>

      {modal && (
        <div className="owner-modal-overlay" onClick={() => setModal(false)}>
          <div className="owner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="owner-modal-handle" />
            <h3>Novo colaborador</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["nome", "Nome *", "text"], ["cargo", "Cargo", "text"], ["email", "E-mail", "email"], ["telefone", "Telefone", "tel"]].map(([k, l, t]) => (
                <div className="owner-form-group" key={k}>
                  <label className="owner-form-label">{l}</label>
                  <input className="owner-input" type={t} value={form[k]} onChange={set(k)} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="o-btn o-btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="o-btn o-btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="owner-modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="owner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="owner-modal-handle" />
            <h3>Remover colaborador?</h3>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>"{confirmDel.nome}" será removido.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="o-btn o-btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="o-btn o-btn-danger" onClick={del}>Remover</button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}