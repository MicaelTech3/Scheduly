import { useEffect, useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { getAgendamentos, updateAgendamento } from "../../lib/firestore";
import { toast } from "../../components/Toast";
import "../../styles/owner.css";

const FILTROS = ["Tudo", "Hoje", "Esta semana", "Este mês"];

const METODOS = {
  pix: { label: "Pix", icon: "⚡" },
  cartao: { label: "Cartão", icon: "💳" },
  dinheiro: { label: "Dinheiro", icon: "💵" },
};

export default function Caixa() {
  const { empresa } = useOwnerAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [filtro, setFiltro] = useState("Tudo");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("concluidos"); // "concluidos" | "agendados"
  const [pagandoModal, setPagandoModal] = useState(null);
  const [metodoPag, setMetodoPag] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!empresa?.id) return;
    setLoading(true);
    const data = await getAgendamentos(empresa.id);
    setAgendamentos(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [empresa?.id]);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filterByDate = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr.substring(0, 10) + "T12:00:00");
    if (filtro === "Tudo") return true;
    if (filtro === "Hoje") return dateStr.startsWith(todayStr);
    if (filtro === "Esta semana") return d >= startOfWeek;
    if (filtro === "Este mês") return d >= startOfMonth;
    return true;
  };

  const concluidos = agendamentos.filter(a => a.status === "concluido" && filterByDate(a.data));

  // Pagamentos agendados: agendamentos aceitos com pagamentoAgendado definido
  const pagAgendados = agendamentos.filter(a =>
    a.pagamentoAgendado?.data && a.status === "agendado" && !a.pago
  ).sort((a, b) => new Date(a.pagamentoAgendado.data) - new Date(b.pagamentoAgendado.data));

  const totalConcluido = concluidos.reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const totalPendente = pagAgendados.reduce((s, a) => s + (Number(a.valor) || 0), 0);

  const fmtMoney = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const fmtDate = (str) => {
    if (!str) return "—";
    return new Date(str).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  const fmtDateOnly = (str) => {
    if (!str) return "—";
    return new Date(str + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  };

  const venceHoje = pagAgendados.filter(a => a.pagamentoAgendado?.data === todayStr).length;
  const venceAmanha = pagAgendados.filter(a => {
    const amanha = new Date(now); amanha.setDate(now.getDate() + 1);
    return a.pagamentoAgendado?.data === amanha.toISOString().split("T")[0];
  }).length;

  const receberPagamento = async () => {
    if (!metodoPag) { toast("Selecione o método de pagamento."); return; }
    setSaving(true);
    await updateAgendamento(empresa.id, pagandoModal.id, {
      status: "concluido",
      pago: true,
      metodoPagamento: metodoPag,
      dataPagamento: new Date().toISOString(),
      pagamentoAgendado: null,
    });
    toast(`💰 Pagamento recebido via ${METODOS[metodoPag]?.label}!`);
    setSaving(false);
    setPagandoModal(null);
    load();
  };

  return (
    <OwnerLayout title="Caixa">

      {/* Alertas de pagamentos que vencem */}
      {venceHoje > 0 && (
        <div style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "1px solid #F59E0B", borderRadius: 14, padding: "14px 18px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🔔</span>
          <div>
            <div style={{ fontWeight: 700, color: "#92400E" }}>{venceHoje} pagamento{venceHoje > 1 ? "s" : ""} vence hoje!</div>
            <div style={{ fontSize: 12, color: "#B45309" }}>Confira a aba "Pagamentos Agendados" abaixo.</div>
          </div>
        </div>
      )}
      {venceAmanha > 0 && (
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14, padding: "14px 18px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>📅</span>
          <div>
            <div style={{ fontWeight: 700, color: "#1E40AF" }}>{venceAmanha} pagamento{venceAmanha > 1 ? "s" : ""} vence amanhã</div>
            <div style={{ fontSize: 12, color: "#3B82F6" }}>Prepare-se para receber.</div>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="owner-metrics" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="owner-metric">
          <div className="owner-metric-label">Recebido ({filtro.toLowerCase()})</div>
          <div className="owner-metric-value" style={{ fontSize: 18, color: "#16A34A" }}>{fmtMoney(totalConcluido)}</div>
        </div>
        <div className="owner-metric">
          <div className="owner-metric-label">Transações</div>
          <div className="owner-metric-value">{concluidos.length}</div>
        </div>
        <div className="owner-metric">
          <div className="owner-metric-label">A receber</div>
          <div className="owner-metric-value" style={{ fontSize: 16, color: "#D97706" }}>{fmtMoney(totalPendente)}</div>
          <div className="owner-metric-sub">{pagAgendados.length} pag. agendados</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#f5f5f3", borderRadius: 12, padding: 4 }}>
        <button onClick={() => setTab("concluidos")}
          style={{
            flex: 1, padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
            background: tab === "concluidos" ? "#fff" : "transparent",
            color: tab === "concluidos" ? "#222" : "#888",
            boxShadow: tab === "concluidos" ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
          }}>
          💰 Pagamentos recebidos
        </button>
        <button onClick={() => setTab("agendados")}
          style={{
            flex: 1, padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, position: "relative",
            background: tab === "agendados" ? "#fff" : "transparent",
            color: tab === "agendados" ? "#222" : "#888",
            boxShadow: tab === "agendados" ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
          }}>
          📅 Pagamentos agendados
          {pagAgendados.length > 0 && (
            <span style={{ background: "#F59E0B", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 6 }}>{pagAgendados.length}</span>
          )}
        </button>
      </div>

      {/* TAB: Concluídos */}
      {tab === "concluidos" && (
        <div className="owner-card">
          <div className="owner-card-header">
            <span className="owner-card-title">Transações concluídas</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTROS.map(f => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={`o-btn o-btn-sm ${filtro === f ? "o-btn-primary" : "o-btn-ghost"}`}>{f}</button>
              ))}
            </div>
          </div>
          {loading ? <div className="owner-empty">Carregando...</div>
            : concluidos.length === 0 ? <div className="owner-empty">Nenhuma transação no período.</div>
              : (
                <>
                  <div className="owner-table-wrap">
                    <table className="owner-table">
                      <thead>
                        <tr><th>Cliente</th><th>Serviço</th><th>Data</th><th>Método</th><th>Valor</th></tr>
                      </thead>
                      <tbody>
                        {concluidos.map(a => (
                          <tr key={a.id}>
                            <td style={{ fontWeight: 500 }}>{a.clienteNome || "—"}</td>
                            <td>{a.servicoNome || "—"}</td>
                            <td style={{ fontSize: 12, color: "#aaa" }}>{fmtDate(a.data)}</td>
                            <td style={{ fontSize: 12 }}>
                              {a.metodoPagamento ? `${METODOS[a.metodoPagamento]?.icon} ${METODOS[a.metodoPagamento]?.label}` : "—"}
                            </td>
                            <td style={{ fontWeight: 600, color: "#16A34A" }}>{fmtMoney(a.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mobile-list">
                    {concluidos.map(a => (
                      <div className="mobile-card" key={a.id}>
                        <div className="mobile-card-top">
                          <span className="mobile-card-name">{a.clienteNome || "—"}</span>
                          <span style={{ fontWeight: 700, color: "#16A34A" }}>{fmtMoney(a.valor)}</span>
                        </div>
                        <div className="mobile-card-row">
                          <span>{a.servicoNome || "—"}</span>
                          <span style={{ color: "#aaa", fontSize: 12 }}>{fmtDate(a.data)}</span>
                        </div>
                        {a.metodoPagamento && (
                          <div style={{ fontSize: 11, color: "#16A34A", marginTop: 4 }}>
                            {METODOS[a.metodoPagamento]?.icon} {METODOS[a.metodoPagamento]?.label}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
        </div>
      )}

      {/* TAB: Pagamentos Agendados */}
      {tab === "agendados" && (
        <div className="owner-card">
          <div className="owner-card-header">
            <span className="owner-card-title">Pagamentos a receber</span>
            <span style={{ fontSize: 13, color: "#D97706", fontWeight: 600 }}>{fmtMoney(totalPendente)} pendente</span>
          </div>
          {loading ? <div className="owner-empty">Carregando...</div>
            : pagAgendados.length === 0 ? (
              <div className="owner-empty" style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
                <div style={{ fontWeight: 600 }}>Nenhum pagamento agendado</div>
              </div>
            ) : (
              <div style={{ padding: "0 0 8px" }}>
                {pagAgendados.map(a => {
                  const isHoje = a.pagamentoAgendado?.data === todayStr;
                  const isAtrasado = a.pagamentoAgendado?.data < todayStr;
                  return (
                    <div key={a.id} style={{ padding: "16px 18px", borderBottom: "0.5px solid rgba(0,0,0,0.06)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: isAtrasado ? "#FEE2E2" : isHoje ? "#FEF3C7" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {isAtrasado ? "⚠️" : isHoje ? "🔔" : "📅"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{a.clienteNome || "—"}</div>
                        <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{a.servicoNome || "—"}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: isAtrasado ? "#DC2626" : isHoje ? "#D97706" : "#3B82F6" }}>
                          {isAtrasado ? "⚠️ Atrasado · " : isHoje ? "Hoje · " : ""}
                          {fmtDateOnly(a.pagamentoAgendado?.data)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "#D97706", marginBottom: 8 }}>{fmtMoney(a.valor)}</div>
                        <button onClick={() => { setMetodoPag(""); setPagandoModal(a); }}
                          style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#16A34A", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          💰 Receber
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      )}

      {/* Modal receber pagamento agendado */}
      {pagandoModal && (
        <div className="owner-modal-overlay" onClick={() => setPagandoModal(null)}>
          <div className="owner-modal" onClick={e => e.stopPropagation()}>
            <div className="owner-modal-handle" />
            <h3>💰 Receber Pagamento</h3>
            <div style={{ background: "#f8f8f8", borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <div style={{ fontWeight: 600 }}>{pagandoModal.clienteNome}</div>
              <div style={{ fontSize: 13, color: "#666" }}>{pagandoModal.servicoNome}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#16A34A", marginTop: 8 }}>{fmtMoney(pagandoModal.valor)}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="owner-form-label" style={{ marginBottom: 10, display: "block" }}>Método de pagamento</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(METODOS).map(([key, m]) => (
                  <button key={key} onClick={() => setMetodoPag(key)}
                    style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${metodoPag === key ? "#534AB7" : "rgba(0,0,0,0.1)"}`, background: metodoPag === key ? "#EEEDFE" : "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{m.icon}</span>
                    <span style={{ fontWeight: 600, color: metodoPag === key ? "#534AB7" : "#333" }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="o-btn o-btn-ghost" onClick={() => setPagandoModal(null)}>Cancelar</button>
              <button className="o-btn o-btn-primary" onClick={receberPagamento} disabled={saving}>
                {saving ? "Confirmando..." : "✅ Confirmar recebimento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}