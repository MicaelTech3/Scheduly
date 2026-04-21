import { useEffect, useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { getHorarios, setHorarios } from "../../lib/firestore";
import { toast } from "../../components/Toast";
import "../../styles/owner.css";

const DIAS = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

const defaultDia = { ativo: false, inicio: "08:00", fim: "18:00", intervalo: 30 };

export default function Agenda() {
  const { empresa } = useOwnerAuth();
  const [horarios, setHorariosState] = useState(
    Object.fromEntries(DIAS.map((d) => [d.key, { ...defaultDia }]))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!empresa?.id) return;
    getHorarios(empresa.id).then((data) => {
      if (data) setHorariosState(data);
      setLoading(false);
    });
  }, [empresa?.id]);

  const toggleDia = (key) =>
    setHorariosState((h) => ({ ...h, [key]: { ...h[key], ativo: !h[key].ativo } }));

  const setDia = (key, field, val) =>
    setHorariosState((h) => ({ ...h, [key]: { ...h[key], [field]: val } }));

  const save = async () => {
    setSaving(true);
    await setHorarios(empresa.id, horarios);
    toast("Horários salvos!");
    setSaving(false);
  };

  const ativarSemana = () => {
    const next = { ...horarios };
    ["seg", "ter", "qua", "qui", "sex"].forEach((k) => { next[k] = { ...next[k], ativo: true }; });
    setHorariosState(next);
  };

  return (
    <OwnerLayout
      title="Agenda e horários"
      actions={
        <button className="o-btn o-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Salvando..." : "Salvar horários"}
        </button>
      }
    >
      <div className="owner-card" style={{ marginBottom: 12 }}>
        <div className="owner-card-header">
          <span className="owner-card-title">Dias e horários de funcionamento</span>
          <button className="o-btn o-btn-ghost o-btn-sm" onClick={ativarSemana}>
            Ativar seg–sex
          </button>
        </div>

        {loading ? <div className="owner-empty">Carregando...</div> : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(100px, 1fr))", gap: 8, padding: "16px 18px", minWidth: 600 }}>
              {DIAS.map(({ key, label }) => {
                const d = horarios[key] || defaultDia;
                return (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#666", textAlign: "center" }}>{label}</div>

                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <label className="o-toggle">
                        <input type="checkbox" checked={!!d.ativo} onChange={() => toggleDia(key)} />
                        <span className="o-toggle-slider" />
                      </label>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 5, opacity: d.ativo ? 1 : 0.4 }}>
                      <input
                        type="time"
                        value={d.inicio}
                        disabled={!d.ativo}
                        onChange={(e) => setDia(key, "inicio", e.target.value)}
                        style={{ fontSize: 11, padding: "4px 6px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 6, width: "100%", background: d.ativo ? "#fff" : "#f5f5f3" }}
                      />
                      <input
                        type="time"
                        value={d.fim}
                        disabled={!d.ativo}
                        onChange={(e) => setDia(key, "fim", e.target.value)}
                        style={{ fontSize: 11, padding: "4px 6px", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 6, width: "100%", background: d.ativo ? "#fff" : "#f5f5f3" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="owner-card">
        <div className="owner-card-header">
          <span className="owner-card-title">Intervalo entre agendamentos</span>
        </div>
        <div style={{ padding: "16px 18px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[15, 30, 45, 60].map((min) => (
            <button
              key={min}
              onClick={() => {
                const next = { ...horarios };
                DIAS.forEach(({ key }) => { if (next[key]) next[key].intervalo = min; });
                setHorariosState(next);
              }}
              className={`o-btn ${horarios[DIAS[0].key]?.intervalo === min ? "o-btn-primary" : "o-btn-ghost"}`}
            >
              {min} min
            </button>
          ))}
        </div>
      </div>
    </OwnerLayout>
  );
}