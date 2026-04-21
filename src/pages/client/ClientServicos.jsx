import { useEffect, useState } from "react";
import { getServicos } from "../../lib/firestore";
import { useNavigate } from "react-router-dom";

export default function ClientServicos({ empresa }) {
  const [servicos, setServicos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("Todos");
  const navigate = useNavigate();

  useEffect(() => {
    if (!empresa?.id) return;
    getServicos(empresa.id).then(data => {
      const ativos = data.filter(s => s.ativo);
      setServicos(ativos);
      setFiltered(ativos);
      setLoading(false);
    });
  }, [empresa]);

  const categorias = ["Todos", ...new Set(servicos.map(s => s.categoria).filter(Boolean))];

  const filter = (cat) => {
    setCategoria(cat);
    if (cat === "Todos") setFiltered(servicos);
    else setFiltered(servicos.filter(s => s.categoria === cat));
  };

  return (
    <>
      <div className="c-section-title">Catálogo de Serviços</div>
      
      {/* Scroll horizontal de categorias */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 12, margin: "0 -20px", padding: "0 20px 12px", scrollbarWidth: "none" }}>
        {categorias.map(c => (
          <button 
            key={c}
            onClick={() => filter(c)}
            style={{ 
              padding: "6px 16px", borderRadius: 20, whiteSpace: "nowrap", border: "none", fontWeight: 500, fontSize: 13, cursor: "pointer",
              background: categoria === c ? "var(--client-color)" : "transparent",
              color: categoria === c ? "#fff" : "#666",
              boxShadow: categoria === c ? "0 4px 12px color-mix(in srgb, var(--client-color) 40%, transparent)" : "inset 0 0 0 1px rgba(0,0,0,0.1)",
              transition: "all 0.2s"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Nenhum serviço encontrado.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(s => (
            <div className="c-list-item" key={s.id} onClick={() => navigate(`/c/${empresa.slug}/agendar`, { state: { servicoId: s.id } })}>
              <div className="c-list-icon">{s.emoji || "✨"}</div>
              <div className="c-list-content">
                <div className="c-list-title">{s.nome}</div>
                {s.descricao && <div className="c-list-sub" style={{ marginBottom: 4, lineHeight: 1.3 }}>{s.descricao}</div>}
                <div className="c-list-sub">{s.duracao} min</div>
              </div>
              <div className="c-list-price">R$ {Number(s.preco).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
