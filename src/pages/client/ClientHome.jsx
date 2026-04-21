import { useEffect, useState } from "react";
import { useClientAuth } from "../../lib/ClientAuthContext";
import { getClientAgendamentos, getServicos, getStories, viewStory } from "../../lib/firestore";
import { useNavigate } from "react-router-dom";

export default function ClientHome({ empresa }) {
  const { user, logout } = useClientAuth();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !empresa) return;
    Promise.all([
      getClientAgendamentos(empresa.id, user.email),
      getServicos(empresa.id),
      getStories(empresa.id)
    ]).then(([ag, serv, st]) => {
      // Ordenar do mais proximo para o mais distante (agendados)
      const proximos = ag.filter(a => a.status === "agendado").sort((a, b) => new Date(a.data) - new Date(b.data));
      setAgendamentos(proximos);
      // Pega 3 serviços em destaque
      setServicos(serv.filter(s => s.ativo).slice(0, 3));
      setStories(st);
      setLoading(false);
    });
  }, [empresa, user]);

  const proximo = agendamentos[0];

  const fmtDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const openStory = (s) => {
    setActiveStory(s);
    // Increment view
    viewStory(empresa.id, s.id).catch(console.error);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: "#888" }}>Olá,</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.displayName || user?.email?.split("@")[0]} 👋</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--client-color-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--client-color)", fontWeight: 700 }}>
          {user?.email?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Barra de Stories */}
      {stories.length > 0 && (
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16, marginBottom: 10, msOverflowStyle: "none", scrollbarWidth: "none" }}>
          {stories.map(s => (
            <div key={s.id} onClick={() => openStory(s)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
              <div style={{ width: 66, height: 66, borderRadius: "50%", padding: 3, background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "2px solid #fff", overflow: "hidden", background: s.tipo === "texto" ? "var(--client-color)" : "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.tipo === "imagem" ? (
                    <img src={s.conteudo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Story" />
                  ) : (
                    <span style={{ fontSize: 24, color: "#fff" }}>✨</span>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#555" }}>Promoção</span>
            </div>
          ))}
        </div>
      )}

      <div className="c-section-title">Próximo agendamento</div>
      {loading ? (
        <div className="c-card" style={{ opacity: 0.5 }}>Carregando...</div>
      ) : proximo ? (
        <div className="c-glass-card" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Marcado para</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{fmtDate(proximo.data)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.15)", padding: 12, borderRadius: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{proximo.servicoNome}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Com {proximo.profissionalNome || "Nossa equipe"}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="c-card" style={{ textAlign: "center", padding: "30px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Nada marcado</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Você não tem horários futuros.</div>
          <button className="c-btn c-btn-primary" onClick={() => navigate(`/c/${empresa.slug}/agendar`)}>Agendar agora</button>
        </div>
      )}

      <div className="c-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Serviços em destaque</span>
        <span style={{ fontSize: 13, color: "var(--client-color)", fontWeight: 600, cursor: "pointer" }} onClick={() => navigate(`/c/${empresa.slug}/servicos`)}>Ver todos</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {servicos.map(s => (
          <div className="c-list-item" key={s.id} onClick={() => navigate(`/c/${empresa.slug}/agendar`, { state: { servicoId: s.id } })}>
            <div className="c-list-icon">{s.emoji || "✨"}</div>
            <div className="c-list-content">
              <div className="c-list-title">{s.nome}</div>
              <div className="c-list-sub">{s.duracao} min</div>
            </div>
            <div className="c-list-price">R$ {Number(s.preco).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <button onClick={logout} style={{ background: "none", border: "none", color: "#DC2626", fontWeight: 600, fontSize: 14, width: "100%", padding: 16, marginTop: 10 }}>Sair da minha conta</button>

      {/* Modal de Story Fullscreen */}
      {activeStory && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column" }}>
          {/* Progress bar dummy (MVP) */}
          <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", gap: 4, zIndex: 10 }}>
            <div style={{ height: 3, background: "rgba(255,255,255,0.5)", flex: 1, borderRadius: 2 }}>
              <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 2, animation: "progress 5s linear" }} />
            </div>
          </div>
          
          <button onClick={() => setActiveStory(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", width: 36, height: 36, borderRadius: "50%", fontSize: 16, zIndex: 10 }}>✕</button>
          
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: activeStory.tipo === "texto" ? "var(--client-color)" : "#000" }}>
            {activeStory.tipo === "imagem" ? (
              <>
                <img src={activeStory.conteudo} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: activeStory.textoImagem ? 0.8 : 1 }} alt="Story" />
                {activeStory.textoImagem && (
                  <div style={{ position: "absolute", bottom: 80, left: 20, right: 20, textAlign: "center", background: "rgba(0,0,0,0.6)", color: "#fff", padding: 16, borderRadius: 12, fontSize: 18, fontWeight: 500 }}>
                    {activeStory.textoImagem}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: 30, textAlign: "center", color: "#fff", fontSize: 28, fontWeight: 700 }}>
                {activeStory.conteudo}
              </div>
            )}
          </div>
          
          {activeStory.linkAcao && (
            <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
              <button style={{ width: "100%", padding: 16, background: "#fff", color: "#000", border: "none", borderRadius: 100, fontSize: 16, fontWeight: 700, cursor: "pointer" }} onClick={() => {
                setActiveStory(null);
                // navigate if it's a known route, or window.open if it's external
                if (activeStory.linkAcao.startsWith("http")) {
                  window.open(activeStory.linkAcao, "_blank");
                } else {
                  navigate(`/c/${empresa.slug}/${activeStory.linkAcao}`);
                }
              }}>
                Ver Promoção
              </button>
            </div>
          )}
          
          <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
        </div>
      )}
    </>
  );
}
