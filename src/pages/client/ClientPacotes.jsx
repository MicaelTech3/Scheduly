import { useEffect, useState } from "react";
import { getPacotes, getServicos, createSolicitacaoPacote } from "../../lib/firestore";
import { useClientAuth } from "../../lib/ClientAuthContext";

const DIAS_LABELS = {
  seg: "Segunda", ter: "Terça", qua: "Quarta",
  qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo"
};

export default function ClientPacotes({ empresa }) {
  const { user } = useClientAuth();
  const [pacotes, setPacotes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState(null); // pacote selecionado
  const [diaPag, setDiaPag] = useState("");
  const [saving, setSaving] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!empresa?.id) return;
    Promise.all([getPacotes(empresa.id), getServicos(empresa.id)]).then(([p, s]) => {
      setPacotes(p.filter(pk => pk.ativo));
      setServicos(s);
      setLoading(false);
    });
  }, [empresa]);

  const getServico = (id) => servicos.find(s => s.id === id);

  const solicitar = async () => {
    if (!diaPag) { return; }
    setSaving(true);
    await createSolicitacaoPacote(empresa.id, {
      pacoteId: solicitando.id,
      pacoteNome: solicitando.nome,
      clienteNome: user.displayName || user.email.split("@")[0],
      clienteEmail: user.email,
      valor: solicitando.preco,
      diaPagamento: diaPag,
      sessoes: solicitando.sessoes,
      sessoesRestantes: solicitando.sessoes,
      servicoIds: solicitando.servicoIds,
      status: "pendente",
    });
    setSaving(false);
    setSolicitando(null);
    setSucesso(true);
    setTimeout(() => setSucesso(false), 4000);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>Carregando...</div>;

  return (
    <>
      <div className="c-section-title">Pacotes Promocionais</div>

      {sucesso && (
        <div style={{ background: "#E1F5EE", border: "1px solid #6EE7B7", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, color: "#085041" }}>Solicitação enviada!</div>
            <div style={{ fontSize: 12, color: "#059669" }}>O estabelecimento irá confirmar em breve.</div>
          </div>
        </div>
      )}

      {pacotes.length === 0 ? (
        <div className="c-card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎁</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Nenhum pacote disponível</div>
          <div style={{ fontSize: 13, color: "#888" }}>Em breve novos pacotes serão criados.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {pacotes.map(p => (
            <div className="c-card" key={p.id} style={{ padding: 0, overflow: "hidden" }}>
              {/* Header colorido */}
              <div style={{ background: "var(--client-color)", padding: "18px 18px 14px", color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{p.emoji || "🎁"}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{p.nome}</div>
                    {p.descricao && <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{p.descricao}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>R$ {Number(p.preco).toFixed(2)}</div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>{p.sessoes} sessões</div>
                  </div>
                </div>
              </div>

              {/* Serviços incluídos */}
              <div style={{ padding: "14px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Inclui</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {(p.servicoIds || []).map(sid => {
                    const s = getServico(sid);
                    if (!s) return null;
                    return (
                      <div key={sid} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--client-color-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                          {s.emoji || "✨"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{s.nome}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>{s.duracao} min</div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--client-color)", fontWeight: 600 }}>
                          ×{p.sessoes}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dias de pagamento disponíveis */}
                {p.diasPagamento?.length > 0 && (
                  <div style={{ background: "#f8f8f8", borderRadius: 12, padding: "10px 12px", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 600 }}>Dias para pagamento</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {p.diasPagamento.map(d => (
                        <span key={d} style={{ padding: "4px 10px", borderRadius: 20, background: "var(--client-color-light)", color: "var(--client-color)", fontSize: 12, fontWeight: 600 }}>
                          {DIAS_LABELS[d] || d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="c-btn c-btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => { setSolicitando(p); setDiaPag(""); }}
                >
                  Solicitar pacote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de solicitação */}
      {solicitando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={() => setSolicitando(null)}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "8px 20px 40px", width: "100%", maxWidth: 480 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#ddd", borderRadius: 2, margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 18, marginBottom: 4 }}>Solicitar {solicitando.nome}</h3>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
              {solicitando.sessoes} sessões · R$ {Number(solicitando.preco).toFixed(2)}
            </div>

            {solicitando.diasPagamento?.length > 0 ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Escolha o dia para pagamento:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {solicitando.diasPagamento.map(d => (
                    <button key={d} onClick={() => setDiaPag(d)}
                      style={{
                        padding: "14px 16px", borderRadius: 12, border: `2px solid ${diaPag === d ? "var(--client-color)" : "rgba(0,0,0,0.1)"}`,
                        background: diaPag === d ? "var(--client-color-light)" : "#fafafa",
                        cursor: "pointer", textAlign: "left", fontWeight: 600, fontSize: 14,
                        color: diaPag === d ? "var(--client-color)" : "#333"
                      }}>
                      {DIAS_LABELS[d] || d}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ background: "#f8f8f8", borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 13, color: "#666" }}>
                ℹ️ O estabelecimento entrará em contato para combinar o pagamento.
              </div>
            )}

            <button
              className="c-btn c-btn-primary"
              style={{ width: "100%" }}
              onClick={solicitar}
              disabled={saving || (solicitando.diasPagamento?.length > 0 && !diaPag)}
            >
              {saving ? "Enviando..." : "✅ Confirmar solicitação"}
            </button>
            <button
              style={{ width: "100%", background: "none", border: "none", marginTop: 12, color: "#888", fontSize: 14, cursor: "pointer", padding: 10 }}
              onClick={() => setSolicitando(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}