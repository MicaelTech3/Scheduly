import { useEffect, useState } from "react";
import { getClientAgendamentos } from "../../lib/firestore";
import { useClientAuth } from "../../lib/ClientAuthContext";

export default function ClientAgendamentos({ empresa }) {
  const { user } = useClientAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresa?.id || !user?.email) return;
    getClientAgendamentos(empresa.id, user.email).then(data => {
      setAgendamentos(data.sort((a, b) => new Date(b.data) - new Date(a.data)));
      setLoading(false);
    });
  }, [empresa, user]);

  const fmtDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const statusMap = {
    agendado: { label: "Agendado", color: "#3C3489", bg: "#EEEDFE" },
    concluido: { label: "Concluído", color: "#085041", bg: "#E1F5EE" },
    cancelado: { label: "Cancelado", color: "#A32D2D", bg: "#FCEBEB" }
  };

  return (
    <>
      <div className="c-section-title">Histórico de Serviços</div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Carregando...</div>
      ) : agendamentos.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Você ainda não tem agendamentos.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {agendamentos.map(a => {
            const st = statusMap[a.status] || { label: a.status, color: "#555", bg: "#eee" };
            return (
              <div className="c-card" key={a.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{a.servicoNome}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>Com {a.profissionalNome || "Nossa equipe"}</div>
                  </div>
                  <div style={{ background: st.bg, color: st.color, padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                    {st.label}
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, background: "#fcfcfc", borderRadius: 12, border: "0.5px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: 24 }}>📅</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--client-color)" }}>{fmtDate(a.data)}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>R$ {Number(a.valor || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
