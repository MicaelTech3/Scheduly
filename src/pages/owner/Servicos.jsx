import { useEffect, useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { getServicos, createServico, updateServico, deleteServico } from "../../lib/firestore";
import { toast } from "../../components/Toast";
import "../../styles/owner.css";

const EMOJIS = ["💇", "💅", "🧖", "🏋️", "🐾", "🦷", "💆", "✂️", "💉", "🩺", "🌿", "🎨"];
const CATS = ["Beleza", "Saúde", "Estética", "Fitness", "Pet", "Outro"];

const empty = { nome: "", descricao: "", duracao: 30, preco: "", categoria: "Beleza", emoji: "💇", ativo: true };

export default function Servicos() {
  const { empresa } = useOwnerAuth();
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | servico obj
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    if (!empresa?.id) return;
    setLoading(true);
    setServicos(await getServicos(empresa.id));
    setLoading(false);
  };

  useEffect(() => { load(); }, [empresa?.id]);

  const openNew = () => { setForm(empty); setModal("new"); };
  const openEdit = (s) => { setForm({ ...s }); setModal(s); };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.nome.trim()) { toast("Informe o nome do serviço."); return; }
    setSaving(true);
    const data = { ...form, preco: parseFloat(form.preco) || 0, duracao: parseInt(form.duracao) || 30 };
    if (modal === "new") {
      await createServico(empresa.id, data);
      toast("Serviço criado!");
    } else {
      await updateServico(empresa.id, modal.id, data);
      toast("Serviço atualizado!");
    }
    setSaving(false);
    setModal(null);
    load();
  };

  const del = async () => {
    await deleteServico(empresa.id, confirmDel.id);
    setConfirmDel(null);
    toast("Serviço removido.");
    load();
  };

  const fmtMoney = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <OwnerLayout
      title="Serviços"
      actions={<button className="o-btn o-btn-primary" onClick={openNew}>+ Novo serviço</button>}
    >
      <div className="owner-card">
        <div className="owner-card-header">
          <span className="owner-card-title">{servicos.length} serviço{servicos.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? <div className="owner-empty">Carregando...</div>
          : servicos.length === 0 ? <div className="owner-empty">Nenhum serviço cadastrado ainda.</div>
            : (<>
              <div className="owner-table-wrap">
                <table className="owner-table">
                  <thead>
                    <tr><th>Serviço</th><th>Categoria</th><th>Duração</th><th>Preço</th><th>Status</th><th>Ações</th></tr>
                  </thead>
                  <tbody>
                    {servicos.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 20 }}>{s.emoji}</span>
                            <div>
                              <div style={{ fontWeight: 500 }}>{s.nome}</div>
                              {s.descricao && <div style={{ fontSize: 11, color: "#aaa" }}>{s.descricao}</div>}
                            </div>
                          </div>
                        </td>
                        <td><span className="o-badge o-badge-purple">{s.categoria}</span></td>
                        <td>{s.duracao} min</td>
                        <td style={{ fontWeight: 500 }}>{fmtMoney(s.preco)}</td>
                        <td>
                          <span className={`o-badge ${s.ativo ? "o-badge-green" : "o-badge-gray"}`}>
                            {s.ativo ? "ativo" : "inativo"}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="o-btn o-btn-ghost o-btn-sm" onClick={() => openEdit(s)}>Editar</button>
                            <button className="o-btn o-btn-danger o-btn-sm" onClick={() => setConfirmDel(s)}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-list">
                {servicos.map((s) => (
                  <div className="mobile-card" key={s.id}>
                    <div className="mobile-card-top">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 22 }}>{s.emoji}</span>
                        <span className="mobile-card-name">{s.nome}</span>
                      </div>
                      <span className={`o-badge ${s.ativo ? "o-badge-green" : "o-badge-gray"}`}>
                        {s.ativo ? "ativo" : "inativo"}
                      </span>
                    </div>
                    <div className="mobile-card-row">
                      <span>{s.duracao} min · {s.categoria}</span>
                      <span style={{ fontWeight: 600 }}>{fmtMoney(s.preco)}</span>
                    </div>
                    <div className="mobile-card-actions">
                      <button className="o-btn o-btn-ghost o-btn-sm" onClick={() => openEdit(s)}>Editar</button>
                      <button className="o-btn o-btn-danger o-btn-sm" onClick={() => setConfirmDel(s)}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            </>)}
      </div>

      {/* Modal novo/editar */}
      {modal !== null && (
        <div className="owner-modal-overlay" onClick={() => setModal(null)}>
          <div className="owner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="owner-modal-handle" />
            <h3>{modal === "new" ? "Novo serviço" : "Editar serviço"}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="owner-form-group" style={{ gridColumn: "1/-1" }}>
                <label className="owner-form-label">Nome *</label>
                <input className="owner-input" type="text" value={form.nome} onChange={set("nome")} placeholder="Ex: Corte masculino" />
              </div>

              <div className="owner-form-group" style={{ gridColumn: "1/-1" }}>
                <label className="owner-form-label">Descrição</label>
                <input className="owner-input" type="text" value={form.descricao} onChange={set("descricao")} placeholder="Descrição breve..." />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Preço (R$)</label>
                <input className="owner-input" type="number" min="0" step="0.01" value={form.preco} onChange={set("preco")} placeholder="0,00" />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Duração (min)</label>
                <input className="owner-input" type="number" min="5" step="5" value={form.duracao} onChange={set("duracao")} />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Categoria</label>
                <select className="owner-input" value={form.categoria} onChange={set("categoria")}>
                  {CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Status</label>
                <select className="owner-input" value={form.ativo} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.value === "true" }))}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>

              <div className="owner-form-group" style={{ gridColumn: "1/-1" }}>
                <label className="owner-form-label">Ícone</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setForm((f) => ({ ...f, emoji: em }))}
                      style={{
                        width: 40, height: 40, fontSize: 20, border: "none",
                        borderRadius: 10, cursor: "pointer",
                        background: form.emoji === em ? "#EEEDFE" : "#f5f5f3",
                        outline: form.emoji === em ? "2px solid #534AB7" : "none",
                      }}
                    >{em}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="o-btn o-btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="o-btn o-btn-primary" onClick={save} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar exclusão */}
      {confirmDel && (
        <div className="owner-modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="owner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="owner-modal-handle" />
            <h3>Excluir serviço?</h3>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
              "{confirmDel.nome}" será removido permanentemente.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="o-btn o-btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="o-btn o-btn-danger" onClick={del}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}