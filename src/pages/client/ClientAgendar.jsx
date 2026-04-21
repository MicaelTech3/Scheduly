import { useEffect, useState } from "react";
import { getServicos, getHorarios, createClientAgendamento } from "../../lib/firestore";
import { useClientAuth } from "../../lib/ClientAuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function ClientAgendar({ empresa }) {
  const { user } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialServicoId = location.state?.servicoId;

  const [step, setStep] = useState(1);
  const [servicos, setServicos] = useState([]);
  const [horariosConfig, setHorariosConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedServico, setSelectedServico] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!empresa?.id) return;
    Promise.all([
      getServicos(empresa.id),
      getHorarios(empresa.id)
    ]).then(([serv, hor]) => {
      setServicos(serv.filter(s => s.ativo));
      setHorariosConfig(hor);
      setLoading(false);

      if (initialServicoId) {
        const s = serv.find(x => x.id === initialServicoId);
        if (s) {
          setSelectedServico(s);
          setStep(2);
        }
      }
    });
  }, [empresa, initialServicoId]);

  // Gerar slots de tempo falsos baseado no dia
  useEffect(() => {
    if (!selectedDate || !horariosConfig) return;
    
    const dateObj = new Date(selectedDate + "T12:00:00");
    const dayOfWeek = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"][dateObj.getDay()];
    const diaConfig = horariosConfig[dayOfWeek];

    if (!diaConfig || !diaConfig.ativo) {
      setAvailableSlots([]);
      return;
    }

    const startHour = parseInt(diaConfig.inicio.split(":")[0]);
    const endHour = parseInt(diaConfig.fim.split(":")[0]);
    const interval = diaConfig.intervalo || 30;

    const slots = [];
    const now = new Date();
    // Verifica se a data selecionada é exatamente hoje (timezone local)
    const isToday = selectedDate === now.toLocaleDateString("en-CA"); // Formato YYYY-MM-DD
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += interval) {
        // Se for hoje, ignora horários passados
        if (isToday) {
          if (h < currentHour || (h === currentHour && m <= currentMinute)) {
            continue;
          }
        }
        slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      }
    }
    setAvailableSlots(slots);
  }, [selectedDate, horariosConfig]);

  const handleConfirm = async () => {
    setSaving(true);
    const dataIso = `${selectedDate}T${selectedTime}:00`;
    await createClientAgendamento(empresa.id, {
      clienteNome: user.displayName || user.email.split("@")[0],
      clienteEmail: user.email,
      servicoId: selectedServico.id,
      servicoNome: selectedServico.nome,
      valor: selectedServico.preco,
      data: dataIso,
      profissionalNome: "Nossa equipe"
    });
    setSaving(false);
    navigate(`/c/${empresa.slug}/agendamentos`);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>Carregando...</div>;

  return (
    <>
      <div className="c-section-title">Agendar Horário</div>
      
      {/* Stepper Progress */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= i ? "var(--client-color)" : "rgba(0,0,0,0.1)", transition: "background 0.3s" }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>1. Escolha o serviço</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {servicos.map(s => (
              <div 
                className="c-list-item" 
                key={s.id} 
                onClick={() => { setSelectedServico(s); setStep(2); }}
                style={{ borderColor: selectedServico?.id === s.id ? "var(--client-color)" : "rgba(0,0,0,0.04)" }}
              >
                <div className="c-list-icon">{s.emoji || "✨"}</div>
                <div className="c-list-content">
                  <div className="c-list-title">{s.nome}</div>
                  <div className="c-list-sub">{s.duracao} min</div>
                </div>
                <div className="c-list-price">R$ {Number(s.preco).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>2. Escolha data e hora</h3>
          <div className="c-card">
            <input 
              type="date" 
              className="c-input" 
              value={selectedDate} 
              onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }} 
              min={new Date().toISOString().split("T")[0]}
            />
            
            {selectedDate && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 8, fontWeight: 500 }}>Horários disponíveis</div>
                {availableSlots.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {availableSlots.map(time => (
                      <button 
                        key={time} 
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: "10px 0", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                          background: selectedTime === time ? "var(--client-color)" : "var(--client-color-light)",
                          color: selectedTime === time ? "#fff" : "var(--client-color)",
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#A32D2D", padding: 12, background: "#FCEBEB", borderRadius: 12 }}>
                    Fechado nesta data. Escolha outro dia.
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button className="c-btn c-btn-outline" onClick={() => setStep(1)}>Voltar</button>
            <button className="c-btn c-btn-primary" disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)}>Continuar</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>3. Confirmar agendamento</h3>
          
          <div className="c-glass-card" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Serviço selecionado</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{selectedServico?.nome}</div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 }}>
              <span>Data</span>
              <span style={{ fontWeight: 600 }}>{selectedDate.split("-").reverse().join("/")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 }}>
              <span>Hora</span>
              <span style={{ fontWeight: 600 }}>{selectedTime}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 }}>
              <span>Profissional</span>
              <span style={{ fontWeight: 600 }}>Nossa equipe</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 18, fontWeight: 700 }}>
              <span>Total</span>
              <span>R$ {Number(selectedServico?.preco).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="c-btn c-btn-outline" onClick={() => setStep(2)}>Voltar</button>
            <button className="c-btn c-btn-primary" onClick={handleConfirm} disabled={saving}>
              {saving ? "Confirmando..." : "Confirmar Agendamento"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
