import { useEffect, useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { getPacotes, createPacote, updatePacote, deletePacote, getServicos } from "../../lib/firestore";
import { toast } from "../../components/Toast";
import "../../styles/owner.css";

const empty = {
  nome: "",
  descricao: "",
  preco: "",
  sessoes: 1,
  servicoIds: [],
  diasPagamento: [],
  ativo: true,
  emoji: "🎁",
};

const EMOJIS = ["🎁", "⭐", "💎", "🌟", "✨", "🏆", "💫", "🎯", "🎀", "💝"];
const DIAS_SEMANA = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

export default function Pacotes() {
  const { empresa } = useOwnerAuth();
  const [pacotes, setPacotes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    if (!empresa?.id) return;
    setLoading(true);
    const [p, s] = await Promise.all([getPacotes(empresa.id), getServicos(empresa.id)]);
    setPacotes(p);
    setServicos(s.filter(sv => sv.ativo));
    setLoading(false);
  };

  useEffect(() => { load(); }, [empresa?.id]);

  const openNew = () => { setForm(empty); setModal("new"); };
  const openEdit = (p) => { setForm({ ...p, servicoIds: p.servicoIds || [], diasPagamento: p.diasPagamento || [] }); setModal(p); };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleServico = (id) => {
    setForm(f => ({
      ...f,
      servicoIds: f.servicoIds.includes(id)
        ? f.servicoIds.filter(x => x !== id)
        : [...f.servicoIds, id]
    }));
  };

  const toggleDia = (key) => {
    setForm(f => ({
      ...f,
      diasPagamento: f.diasPagamento.includes(key)
        ? f.diasPagamento.filter(x => x !== key)
        : [...f.diasPagamento, key]
    }));
  };

  const save = async () => {
    if (!form.nome.trim()) { toast("Informe o nome do pacote."); return; }
    if (!form.preco) { toast("Informe o preço do pacote."); return; }
    if (form.servicoIds.length === 0) { toast("Selecione ao menos um serviço."); return; }
    setSaving(true);
    const data = {
      ...form,
      preco: parseFloat(form.preco) || 0,
      sessoes: parseInt(form.sessoes) || 1,
    };
    if (modal === "new") {
      await createPacote(empresa.id, data);
      toast("Pacote criado!");
    } else {
      await updatePacote(empresa.id, modal.id, data);
      toast("Pacote atualizado!");
    }
    setSaving(false);
    setModal(null);
    load();
  };

  const del = async () => {
    await deletePacote(empresa.id, confirmDel.id);
    setConfirmDel(null);
    toast("Pacote removido.");
    load();
  };

  const fmtMoney = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <OwnerLayout
      title="Pacotes"
      actions={<button className="o-btn o-btn-primary" onClick={openNew}>+ Novo pacote</button>}
    >
      <div className="owner-card">
        <div className="owner-card-header">
          <span className="owner-card-title">{pacotes.length} pacote{pacotes.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? <div className="owner-empty">Carregando...</div>
          : pacotes.length === 0 ? (
            <div className="owner-empty" style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Nenhum pacote criado</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>Crie pacotes promocionais para seus clientes.</div>
            </div>
          ) : (
            <>
              <div className="owner-table-wrap">
                <table className="owner-table">
                  <thead>
                    <tr><th>Pacote</th><th>Serviços</th><th>Sessões</th><th>Preço</th><th>Status</th><th>Ações</th></tr>
                  </thead>
                  <tbody>
                    {pacotes.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 20 }}>{p.emoji || "🎁"}</span>
                            <div>
                              <div style={{ fontWeight: 500 }}>{p.nome}</div>
                              {p.descricao && <div style={{ fontSize: 11, color: "#aaa" }}>{p.descricao}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {(p.servicoIds || []).map(sid => {
                            const s = servicos.find(x => x.id === sid);
                            return s ? <span key={sid} className="o-badge o-badge-purple" style={{ marginRight: 4, marginBottom: 2, display: "inline-block" }}>{s.nome}</span> : null;
                          })}
                        </td>
                        <td>{p.sessoes}x</td>
                        <td style={{ fontWeight: 500 }}>{fmtMoney(p.preco)}</td>
                        <td>
                          <span className={`o-badge ${p.ativo ? "o-badge-green" : "o-badge-gray"}`}>
                            {p.ativo ? "ativo" : "inativo"}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="o-btn o-btn-ghost o-btn-sm" onClick={() => openEdit(p)}>Editar</button>
                            <button className="o-btn o-btn-danger o-btn-sm" onClick={() => setConfirmDel(p)}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-list">
                {pacotes.map((p) => (
                  <div className="mobile-card" key={p.id}>
                    <div className="mobile-card-top">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 22 }}>{p.emoji || "🎁"}</span>
                        <span className="mobile-card-name">{p.nome}</span>
                      </div>
                      <span className={`o-badge ${p.ativo ? "o-badge-green" : "o-badge-gray"}`}>
                        {p.ativo ? "ativo" : "inativo"}
                      </span>
                    </div>
                    <div className="mobile-card-row">
                      <span>{p.sessoes} sessões</span>
                      <span style={{ fontWeight: 600 }}>{fmtMoney(p.preco)}</span>
                    </div>
                    <div className="mobile-card-actions">
                      <button className="o-btn o-btn-ghost o-btn-sm" onClick={() => openEdit(p)}>Editar</button>
                      <button className="o-btn o-btn-danger o-btn-sm" onClick={() => setConfirmDel(p)}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
      </div>

      {/* Modal novo/editar */}
      {modal !== null && (
        <div className="owner-modal-overlay" onClick={() => setModal(null)}>
          <div className="owner-modal" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="owner-modal-handle" />
            <h3>{modal === "new" ? "Novo pacote" : "Editar pacote"}</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Emoji */}
              <div className="owner-form-group">
                <label className="owner-form-label">Ícone</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {EMOJIS.map(em => (
                    <button key={em} onClick={() => setForm(f => ({ ...f, emoji: em }))}
                      style={{
                        width: 40, height: 40, fontSize: 20, border: "none", borderRadius: 10, cursor: "pointer",
                        background: form.emoji === em ? "#EEEDFE" : "#f5f5f3",
                        outline: form.emoji === em ? "2px solid #534AB7" : "none"
                      }}
                    >{em}</button>
                  ))}
                </div>
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Nome *</label>
                <input className="owner-input" type="text" value={form.nome} onChange={set("nome")} placeholder="Ex: Pacote Básico Mensal" />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Descrição</label>
                <input className="owner-input" type="text" value={form.descricao} onChange={set("descricao")} placeholder="Breve descrição do pacote..." />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="owner-form-group">
                  <label className="owner-form-label">Preço (R$) *</label>
                  <input className="owner-input" type="number" min="0" step="0.01" value={form.preco} onChange={set("preco")} placeholder="0,00" />
                </div>
                <div className="owner-form-group">
                  <label className="owner-form-label">Nº de sessões</label>
                  <input className="owner-input" type="number" min="1" value={form.sessoes} onChange={set("sessoes")} />
                </div>
              </div>

              {/* Serviços incluídos */}
              <div className="owner-form-group">
                <label className="owner-form-label">Serviços incluídos *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                  {servicos.map(s => (
                    <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${form.servicoIds.includes(s.id) ? "#534AB7" : "rgba(0,0,0,0.1)"}`, background: form.servicoIds.includes(s.id) ? "#EEEDFE" : "#fafafa" }}>
                      <input type="checkbox" checked={form.servicoIds.includes(s.id)} onChange={() => toggleServico(s.id)} style={{ accentColor: "#534AB7" }} />
                      <span style={{ fontSize: 18 }}>{s.emoji || "✨"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{s.nome}</div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>{s.duracao} min</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#534AB7" }}>R$ {Number(s.preco).toFixed(2)}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dias de pagamento */}
              <div className="owner-form-group">
                <label className="owner-form-label">Dias disponíveis para pagamento</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {DIAS_SEMANA.map(d => (
                    <button key={d.key} onClick={() => toggleDia(d.key)}
                      style={{
                        padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                        background: form.diasPagamento.includes(d.key) ? "#534AB7" : "#f0f0f0",
                        color: form.diasPagamento.includes(d.key) ? "#fff" : "#555"
                      }}
                    >{d.label}</button>
                  ))}
                </div>
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Status</label>
                <select className="owner-input" value={form.ativo} onChange={(e) => setForm(f => ({ ...f, ativo: e.target.value === "true" }))}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
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

      {confirmDel && (
        <div className="owner-modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="owner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="owner-modal-handle" />
            <h3>Excluir pacote?</h3>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>"{confirmDel.nome}" será removido permanentemente.</p>
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