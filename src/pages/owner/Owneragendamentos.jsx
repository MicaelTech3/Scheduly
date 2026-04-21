import { useEffect, useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { getAgendamentos, updateAgendamento } from "../../lib/firestore";
import { toast } from "../../components/Toast";
import "../../styles/owner.css";

const STATUS_MAP = {
    pendente: { label: "Pendente", cls: "o-badge-yellow", icon: "⏳" },
    agendado: { label: "Aceito", cls: "o-badge-purple", icon: "✅" },
    concluido: { label: "Concluído", cls: "o-badge-green", icon: "💰" },
    cancelado: { label: "Cancelado", cls: "o-badge-red", icon: "❌" },
};

const METODOS = [
    { key: "pix", label: "Pix", icon: "⚡" },
    { key: "cartao", label: "Cartão", icon: "💳" },
    { key: "dinheiro", label: "Dinheiro", icon: "💵" },
    { key: "agendar", label: "Agendar pagamento", icon: "📅" },
];

const FILTROS = ["Todos", "Pendente", "Aceito", "Concluído", "Cancelado"];

export default function OwnerAgendamentos() {
    const { empresa } = useOwnerAuth();
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("Todos");
    const [pagamentoModal, setPagamentoModal] = useState(null);
    const [metodoPag, setMetodoPag] = useState("");
    const [dataPagAgendada, setDataPagAgendada] = useState("");
    const [saving, setSaving] = useState(false);
    const [cancelModal, setCancelModal] = useState(null);

    const load = async () => {
        if (!empresa?.id) return;
        setLoading(true);
        const data = await getAgendamentos(empresa.id);
        setAgendamentos(data.sort((a, b) => new Date(b.data) - new Date(a.data)));
        setLoading(false);
    };

    useEffect(() => { load(); }, [empresa?.id]);

    const filtrados = agendamentos.filter(a => {
        if (filtro === "Todos") return true;
        if (filtro === "Pendente") return a.status === "pendente";
        if (filtro === "Aceito") return a.status === "agendado";
        if (filtro === "Concluído") return a.status === "concluido";
        if (filtro === "Cancelado") return a.status === "cancelado";
        return true;
    });

    const pendentes = agendamentos.filter(a => a.status === "pendente").length;

    const abrirPagamento = (ag) => {
        setMetodoPag("");
        setDataPagAgendada("");
        setPagamentoModal(ag);
    };



    const confirmarPagamento = async () => {
        if (!metodoPag) { toast("Selecione o método de pagamento."); return; }
        if (metodoPag === "agendar" && !dataPagAgendada) { toast("Informe a data do pagamento."); return; }
        setSaving(true);
        const updates = metodoPag === "agendar"
            ? { status: "agendado", pagamentoAgendado: { data: dataPagAgendada, valor: pagamentoModal.valor, clienteNome: pagamentoModal.clienteNome, clienteEmail: pagamentoModal.clienteEmail, servicoNome: pagamentoModal.servicoNome } }
            : { status: "concluido", metodoPagamento: metodoPag, pago: true, dataPagamento: new Date().toISOString() };
        await updateAgendamento(empresa.id, pagamentoModal.id, updates);
        if (metodoPag === "agendar") {
            toast(`📅 Pagamento agendado para ${dataPagAgendada.split("-").reverse().join("/")}!`);
        } else {
            toast(`💰 Pagamento via ${METODOS.find(m => m.key === metodoPag)?.label} confirmado!`);
        }
        setSaving(false);
        setPagamentoModal(null);
        load();
    };

    const cancelar = async (ag) => {
        await updateAgendamento(empresa.id, ag.id, { status: "cancelado" });
        setCancelModal(null);
        toast(`❌ Agendamento cancelado.`);
        load();
    };

    const fmtDate = (ts) => {
        if (!ts) return "—";
        const d = new Date(ts);
        return d.toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    };

    const fmtMoney = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

    return (
        <OwnerLayout title="Agendamentos">

            {/* Notificação de pendentes */}
            {pendentes > 0 && (
                <div style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "1px solid #F59E0B", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>⏳</span>
                    <div>
                        <div style={{ fontWeight: 700, color: "#92400E" }}>{pendentes} agendamento{pendentes > 1 ? "s" : ""} aguardando sua confirmação</div>
                        <div style={{ fontSize: 12, color: "#B45309" }}>Clientes estão esperando — aceite ou cancele abaixo.</div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {FILTROS.map(f => (
                    <button key={f} onClick={() => setFiltro(f)}
                        className={`o-btn o-btn-sm ${filtro === f ? "o-btn-primary" : "o-btn-ghost"}`}>
                        {f}
                        {f === "Pendente" && pendentes > 0 && (
                            <span style={{ background: "#EF4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 6 }}>{pendentes}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="owner-card">
                <div className="owner-card-header">
                    <span className="owner-card-title">{filtrados.length} agendamento{filtrados.length !== 1 ? "s" : ""}</span>
                </div>

                {loading ? <div className="owner-empty">Carregando...</div>
                    : filtrados.length === 0 ? <div className="owner-empty">Nenhum agendamento encontrado.</div>
                        : (
                            <>
                                {/* Desktop table */}
                                <div className="owner-table-wrap">
                                    <table className="owner-table">
                                        <thead>
                                            <tr><th>Cliente</th><th>Serviço</th><th>Data</th><th>Valor</th><th>Pagamento</th><th>Status</th><th>Ações</th></tr>
                                        </thead>
                                        <tbody>
                                            {filtrados.map(a => {
                                                const st = STATUS_MAP[a.status] || STATUS_MAP.pendente;
                                                return (
                                                    <tr key={a.id}>
                                                        <td style={{ fontWeight: 500 }}>{a.clienteNome || "—"}</td>
                                                        <td>{a.servicoNome || "—"}</td>
                                                        <td style={{ fontSize: 12, color: "#888" }}>{fmtDate(a.data)}</td>
                                                        <td style={{ fontWeight: 600 }}>{fmtMoney(a.valor)}</td>
                                                        <td style={{ fontSize: 12 }}>
                                                            {a.metodoPagamento ? (
                                                                <span style={{ color: "#16A34A", fontWeight: 600 }}>
                                                                    {METODOS.find(m => m.key === a.metodoPagamento)?.icon} {METODOS.find(m => m.key === a.metodoPagamento)?.label}
                                                                </span>
                                                            ) : a.pagamentoAgendado ? (
                                                                <span style={{ color: "#D97706" }}>📅 {a.pagamentoAgendado.data?.split("-").reverse().join("/")}</span>
                                                            ) : "—"}
                                                        </td>
                                                        <td>
                                                            <span className={`o-badge ${st.cls}`}>{st.icon} {st.label}</span>
                                                        </td>
                                                        <td>
                                                            <div className="action-btns">
                                                                {a.status === "pendente" && (
                                                                    <>
                                                                        <button className="o-btn o-btn-primary o-btn-sm" onClick={() => abrirPagamento(a)} disabled={saving}>Aceitar e Pagar</button>
                                                                        <button className="o-btn o-btn-danger o-btn-sm" onClick={() => setCancelModal(a)}>Cancelar</button>
                                                                    </>
                                                                )}
                                                                {a.status === "agendado" && !a.pago && (
                                                                    <button className="o-btn o-btn-sm" style={{ background: "#16A34A", color: "#fff", border: "none" }} onClick={() => abrirPagamento(a)}>
                                                                        💰 Pagamento
                                                                    </button>
                                                                )}
                                                                {a.status === "agendado" && a.pago && (
                                                                    <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>✓ Pago</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="mobile-list">
                                    {filtrados.map(a => {
                                        const st = STATUS_MAP[a.status] || STATUS_MAP.pendente;
                                        return (
                                            <div className="mobile-card" key={a.id}>
                                                <div className="mobile-card-top">
                                                    <span className="mobile-card-name">{a.clienteNome || "—"}</span>
                                                    <span className={`o-badge ${st.cls}`}>{st.icon} {st.label}</span>
                                                </div>
                                                <div className="mobile-card-row">
                                                    <span>{a.servicoNome || "—"}</span>
                                                    <span style={{ fontWeight: 700 }}>{fmtMoney(a.valor)}</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{fmtDate(a.data)}</div>
                                                {a.pagamentoAgendado && (
                                                    <div style={{ fontSize: 11, color: "#D97706", marginTop: 4 }}>📅 Pag. agendado: {a.pagamentoAgendado.data?.split("-").reverse().join("/")}</div>
                                                )}
                                                {a.metodoPagamento && (
                                                    <div style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, marginTop: 4 }}>
                                                        {METODOS.find(m => m.key === a.metodoPagamento)?.icon} Pago via {METODOS.find(m => m.key === a.metodoPagamento)?.label}
                                                    </div>
                                                )}
                                                <div className="mobile-card-actions" style={{ marginTop: 10 }}>
                                                    {a.status === "pendente" && (
                                                        <>
                                                            <button className="o-btn o-btn-primary o-btn-sm" onClick={() => abrirPagamento(a)} disabled={saving}>Aceitar e Pagar</button>
                                                            <button className="o-btn o-btn-danger o-btn-sm" onClick={() => setCancelModal(a)}>Cancelar</button>
                                                        </>
                                                    )}
                                                    {a.status === "agendado" && !a.pago && (
                                                        <button className="o-btn o-btn-sm" style={{ background: "#16A34A", color: "#fff", border: "none", width: "100%" }} onClick={() => abrirPagamento(a)}>
                                                            💰 Registrar Pagamento
                                                        </button>
                                                    )}
                                                    {a.status === "agendado" && a.pago && (
                                                        <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>✓ Pago</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
            </div>

            {/* Modal de Pagamento */}
            {pagamentoModal && (
                <div className="owner-modal-overlay" onClick={() => setPagamentoModal(null)}>
                    <div className="owner-modal" onClick={e => e.stopPropagation()}>
                        <div className="owner-modal-handle" />
                        <h3>{pagamentoModal.status === "pendente" ? "✅ Aceitar e Registrar Pagamento" : "💰 Registrar Pagamento"}</h3>

                        <div style={{ background: "#f8f8f8", borderRadius: 12, padding: 14, marginBottom: 20 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{pagamentoModal.clienteNome}</div>
                            <div style={{ fontSize: 13, color: "#666" }}>{pagamentoModal.servicoNome}</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#534AB7", marginTop: 8 }}>
                                R$ {Number(pagamentoModal.valor || 0).toFixed(2)}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label className="owner-form-label" style={{ marginBottom: 10, display: "block" }}>Como foi o pagamento?</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {METODOS.map(m => (
                                    <button key={m.key} onClick={() => setMetodoPag(m.key)}
                                        style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${metodoPag === m.key ? "#534AB7" : "rgba(0,0,0,0.1)"}`, background: metodoPag === m.key ? "#EEEDFE" : "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                                        <span style={{ fontSize: 24 }}>{m.icon}</span>
                                        <span style={{ fontWeight: 600, color: metodoPag === m.key ? "#534AB7" : "#333" }}>{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {metodoPag === "agendar" && (
                            <div className="owner-form-group" style={{ marginBottom: 16 }}>
                                <label className="owner-form-label">Data do pagamento</label>
                                <input
                                    className="owner-input"
                                    type="date"
                                    value={dataPagAgendada}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={e => setDataPagAgendada(e.target.value)}
                                />
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button className="o-btn o-btn-ghost" onClick={() => setPagamentoModal(null)}>Cancelar</button>
                            <button className="o-btn o-btn-primary" onClick={confirmarPagamento} disabled={saving}>
                                {saving ? "Salvando..." : metodoPag === "agendar" ? "📅 Agendar pagamento" : "✅ Confirmar pagamento"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal cancelar */}
            {cancelModal && (
                <div className="owner-modal-overlay" onClick={() => setCancelModal(null)}>
                    <div className="owner-modal" onClick={e => e.stopPropagation()}>
                        <div className="owner-modal-handle" />
                        <h3>Cancelar agendamento?</h3>
                        <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
                            Agendamento de <strong>{cancelModal.clienteNome}</strong> será cancelado.
                        </p>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button className="o-btn o-btn-ghost" onClick={() => setCancelModal(null)}>Voltar</button>
                            <button className="o-btn o-btn-danger" onClick={() => cancelar(cancelModal)}>Confirmar cancelamento</button>
                        </div>
                    </div>
                </div>
            )}
        </OwnerLayout>
    );
}