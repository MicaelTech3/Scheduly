import { useEffect, useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { getServicos, getClientes, getAgendamentos, getSolicitacoesPacotes, updateAgendamento } from "../../lib/firestore";
import { toast } from "../../components/Toast";
import "../../styles/owner.css";

export default function OwnerDashboard() {
  const { empresa } = useOwnerAuth();
  const [servicos, setServicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!empresa?.id) return;
    const [s, c, a, sol] = await Promise.all([
      getServicos(empresa.id),
      getClientes(empresa.id),
      getAgendamentos(empresa.id),
      getSolicitacoesPacotes(empresa.id).catch(() => []),
    ]);
    setServicos(s);
    setClientes(c);
    setAgendamentos(a);
    setSolicitacoes(sol.filter(x => x.status === "pendente"));
    setLoading(false);
  };

  useEffect(() => { load(); }, [empresa?.id]);

  const hoje = new Date().toISOString().split("T")[0];
  const agendHoje = agendamentos.filter(a => a.data?.startsWith(hoje)).length;
  const pendentes = agendamentos.filter(a => a.status === "pendente").length;
  const pagHoje = agendamentos.filter(a => a.pagamentoAgendado?.data === hoje && !a.pago).length;

  const fmtMoney = (v) => `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const totalCaixa = agendamentos.filter(a => a.status === "concluido").reduce((s, a) => s + (Number(a.valor) || 0), 0);

  const statusBadge = (s) => {
    const map = {
      pendente: ["o-badge o-badge-yellow", "⏳ pendente"],
      agendado: ["o-badge o-badge-purple", "✅ aceito"],
      concluido: ["o-badge o-badge-green", "💰 concluído"],
      cancelado: ["o-badge o-badge-red", "❌ cancelado"],
    };
    const [cls, label] = map[s] || ["o-badge o-badge-gray", s];
    return <span className={cls}>{label}</span>;
  };

  const fmtDate = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const aceitarRapido = async (ag) => {
    setSaving(true);
    await updateAgendamento(empresa.id, ag.id, { status: "agendado" });
    toast(`✅ Aceito: ${ag.clienteNome}`);
    setSaving(false);
    load();
  };

  const totalNotifs = pendentes + pagHoje + solicitacoes.length;

  return (
    <OwnerLayout title="Dashboard">
      {loading ? (
        <div className="owner-empty">Carregando dados...</div>
      ) : (
        <>
          {/* Painel de notificações */}
          {totalNotifs > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                🔔 Notificações ({totalNotifs})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {pendentes > 0 && (
                  <div style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "1px solid #F59E0B", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>⏳</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#92400E" }}>{pendentes} agendamento{pendentes > 1 ? "s" : ""} aguardando confirmação</div>
                      <div style={{ fontSize: 12, color: "#B45309" }}>Acesse "Agendamentos" para aceitar ou cancelar.</div>
                    </div>
                    <a href="agendamentos" style={{ padding: "8px 14px", borderRadius: 10, background: "#F59E0B", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Ver</a>
                  </div>
                )}

                {pagHoje > 0 && (
                  <div style={{ background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", border: "1px solid #6EE7B7", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>💰</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#065F46" }}>{pagHoje} pagamento{pagHoje > 1 ? "s" : ""} agendado{pagHoje > 1 ? "s" : ""} para hoje</div>
                      <div style={{ fontSize: 12, color: "#059669" }}>Acesse "Caixa" para registrar o recebimento.</div>
                    </div>
                    <a href="caixa" style={{ padding: "8px 14px", borderRadius: 10, background: "#10B981", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Ver</a>
                  </div>
                )}

                {solicitacoes.length > 0 && (
                  <div style={{ background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", border: "1px solid #BFDBFE", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🎁</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#1E40AF" }}>{solicitacoes.length} solicitação{solicitacoes.length > 1 ? "ões" : ""} de pacote pendente{solicitacoes.length > 1 ? "s" : ""}</div>
                      <div style={{ fontSize: 12, color: "#3B82F6" }}>Clientes solicitaram pacotes promocionais.</div>
                    </div>
                    <a href="pacotes" style={{ padding: "8px 14px", borderRadius: 10, background: "#3B82F6", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Ver</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Métricas */}
          <div className="owner-metrics">
            <div className="owner-metric">
              <div className="owner-metric-label">Agendamentos hoje</div>
              <div className="owner-metric-value">{agendHoje}</div>
              <div className="owner-metric-sub">{hoje}</div>
            </div>
            <div className="owner-metric">
              <div className="owner-metric-label">Clientes</div>
              <div className="owner-metric-value">{clientes.length}</div>
              <div className="owner-metric-sub">cadastrados</div>
            </div>
            <div className="owner-metric">
              <div className="owner-metric-label">Serviços</div>
              <div className="owner-metric-value">{servicos.length}</div>
              <div className="owner-metric-sub">no catálogo</div>
            </div>
            <div className="owner-metric">
              <div className="owner-metric-label">Caixa total</div>
              <div className="owner-metric-value" style={{ fontSize: 16 }}>{fmtMoney(totalCaixa)}</div>
              <div className="owner-metric-sub">concluídos</div>
            </div>
          </div>

          {/* Agendamentos pendentes para aceite rápido */}
          {pendentes > 0 && (
            <div className="owner-card" style={{ marginBottom: 0 }}>
              <div className="owner-card-header">
                <span className="owner-card-title">⏳ Aguardando confirmação</span>
              </div>
              <div style={{ padding: "0 0 8px" }}>
                {agendamentos.filter(a => a.status === "pendente").slice(0, 5).map(a => (
                  <div key={a.id} style={{ padding: "14px 18px", borderBottom: "0.5px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{a.clienteNome || "—"}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>{a.servicoNome} · {fmtDate(a.data)}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#534AB7", marginRight: 8 }}>{fmtMoney(a.valor)}</div>
                    <button className="o-btn o-btn-primary o-btn-sm" onClick={() => aceitarRapido(a)} disabled={saving}>
                      ✅ Aceitar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agendamentos recentes */}
          <div className="owner-card">
            <div className="owner-card-header">
              <span className="owner-card-title">Agendamentos recentes</span>
            </div>
            {agendamentos.length === 0 ? (
              <div className="owner-empty">Nenhum agendamento ainda.</div>
            ) : (
              <>
                <div className="owner-table-wrap">
                  <table className="owner-table">
                    <thead>
                      <tr><th>Cliente</th><th>Serviço</th><th>Data</th><th>Valor</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {agendamentos.slice(0, 8).map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 500 }}>{a.clienteNome || "—"}</td>
                          <td>{a.servicoNome || "—"}</td>
                          <td style={{ fontSize: 12, color: "#888" }}>{fmtDate(a.data)}</td>
                          <td>{a.valor ? fmtMoney(a.valor) : "—"}</td>
                          <td>{statusBadge(a.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mobile-list">
                  {agendamentos.slice(0, 8).map(a => (
                    <div className="mobile-card" key={a.id}>
                      <div className="mobile-card-top">
                        <span className="mobile-card-name">{a.clienteNome || "—"}</span>
                        {statusBadge(a.status)}
                      </div>
                      <div className="mobile-card-row">
                        <span>{a.servicoNome || "—"}</span>
                        <span>{a.valor ? fmtMoney(a.valor) : "—"}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{fmtDate(a.data)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </OwnerLayout>
  );
}