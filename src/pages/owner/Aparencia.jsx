import { useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { updateEmpresa } from "../../lib/firestore";
import { toast } from "../../components/Toast";
import "../../styles/owner.css";

const COLORS = [
  { label: "Roxo", value: "#534AB7" },
  { label: "Índigo", value: "#4338CA" },
  { label: "Azul", value: "#2563EB" },
  { label: "Ciano", value: "#0891B2" },
  { label: "Verde", value: "#16A34A" },
  { label: "Esmeralda", value: "#059669" },
  { label: "Teal", value: "#0F766E" },
  { label: "Lima", value: "#65A30D" },
  { label: "Laranja", value: "#EA580C" },
  { label: "Rosa", value: "#DB2777" },
  { label: "Vermelho", value: "#DC2626" },
  { label: "Violeta", value: "#7C3AED" },
  { label: "Âmbar", value: "#D97706" },
  { label: "Grafite", value: "#374151" },
  { label: "Preto", value: "#111827" },
];

export default function Aparencia() {
  const { empresa } = useOwnerAuth();
  const [color, setColor] = useState(empresa?.accentColor || "#534AB7");
  const [nomeSite, setNomeSite] = useState(empresa?.nomeExibido || empresa?.nome || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateEmpresa(empresa.id, { accentColor: color, nomeExibido: nomeSite });
    toast("Aparência salva! Recarregue para ver as mudanças.");
    setSaving(false);
  };

  return (
    <OwnerLayout title="Aparência">
      {/* Preview bar */}
      <div
        className="owner-card"
        style={{ borderTop: `4px solid ${color}`, marginBottom: 20 }}
      >
        <div className="owner-card-header">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{nomeSite || "Nome da empresa"}</div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Prévia do cabeçalho</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 60, height: 28, borderRadius: 8, background: color, opacity: 0.15 }} />
            <div style={{ width: 80, height: 28, borderRadius: 8, background: color }} />
          </div>
        </div>
        <div style={{ padding: "12px 18px", display: "flex", gap: 10 }}>
          {["Serviços", "Agendar", "Pacotes"].map((t) => (
            <span key={t} style={{ fontSize: 13, color, borderBottom: `2px solid ${color}`, paddingBottom: 2, cursor: "pointer" }}>{t}</span>
          ))}
        </div>
      </div>

      <div className="owner-card">
        <div className="owner-card-header">
          <span className="owner-card-title">Nome exibido</span>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <div className="owner-form-group">
            <label className="owner-form-label">Nome que aparece para os clientes</label>
            <input
              className="owner-input"
              style={{ maxWidth: 360 }}
              type="text"
              value={nomeSite}
              onChange={(e) => setNomeSite(e.target.value)}
              placeholder={empresa?.nome}
            />
          </div>
        </div>
      </div>

      <div className="owner-card">
        <div className="owner-card-header">
          <span className="owner-card-title">Cor principal</span>
          <span style={{ fontSize: 12, color: "#aaa", fontFamily: "monospace" }}>{color}</span>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                title={c.label}
                style={{
                  width: 40, height: 40,
                  borderRadius: "50%",
                  background: c.value,
                  border: "none",
                  cursor: "pointer",
                  outline: color === c.value ? `3px solid ${c.value}` : "none",
                  outlineOffset: 3,
                  transform: color === c.value ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.15s",
                }}
              />
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="owner-form-label">Cor personalizada</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: 44, height: 36, border: "none", cursor: "pointer", background: "none", padding: 0 }}
              />
              <input
                className="owner-input"
                type="text"
                value={color}
                onChange={(e) => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && setColor(e.target.value)}
                style={{ width: 120, fontFamily: "monospace" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="o-btn o-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Salvando..." : "Salvar aparência"}
        </button>
      </div>
    </OwnerLayout>
  );
}