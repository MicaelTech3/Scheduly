import { useEffect, useState } from "react";
import OwnerLayout from "../../components/owner/OwnerLayout";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { getStories, createStory, deleteStory, getServicos, getPacotes } from "../../lib/firestore";
import { storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "../../components/Toast";
import "../../styles/owner.css";

export default function OwnerStories() {
  const { empresa } = useOwnerAuth();
  const [stories, setStories] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [texto, setTexto] = useState("");
  const [linkAcao, setLinkAcao] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    if (!empresa?.id) return;
    setLoading(true);
    const [data, s, p] = await Promise.all([
      getStories(empresa.id),
      getServicos(empresa.id),
      getPacotes(empresa.id)
    ]);
    setStories(data);
    setServicos(s.filter(x => x.ativo));
    setPacotes(p.filter(x => x.ativo));
    setLoading(false);
  };

  useEffect(() => { load(); }, [empresa?.id]);

  const save = async () => {
    if (!file && !texto.trim()) {
      toast("Você precisa adicionar uma imagem ou digitar um texto!");
      return;
    }
    
    setSaving(true);
    try {
      let conteudoUrl = "";
      let tipo = "texto";

      if (file) {
        // Upload image to Firebase Storage
        const filePath = `empresas/${empresa.id}/stories/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        conteudoUrl = await getDownloadURL(storageRef);
        tipo = "imagem";
      } else {
        conteudoUrl = texto;
      }

      await createStory(empresa.id, {
        tipo,
        conteudo: conteudoUrl,
        linkAcao,
        textoImagem: tipo === "imagem" ? texto : "", // texto extra caso seja imagem
      });

      toast("Story criado com sucesso!");
      setModal(false);
      setFile(null);
      setTexto("");
      setLinkAcao("");
      load();
    } catch (err) {
      console.error(err);
      toast("Erro ao salvar o story.");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    await deleteStory(empresa.id, confirmDel.id);
    setConfirmDel(null);
    toast("Story excluído.");
    load();
  };

  const copyLink = (story) => {
    // Generate a link that will open the story. We can pass a query param or just send them to the app.
    // For MVP, sharing just sends them to the home page where stories pop up.
    const url = `${window.location.origin}/c/${empresa.slug}?story=${story.id}`;
    navigator.clipboard.writeText(url);
    toast("Link copiado! Cole no WhatsApp ou Instagram.");
  };

  const shareWhatsApp = (story) => {
    const url = `${window.location.origin}/c/${empresa.slug}?story=${story.id}`;
    const msg = encodeURIComponent(`Olha essa novidade no ${empresa.nome}! Acesse: ${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <OwnerLayout
      title="Stories e Promoções"
      actions={<button className="o-btn o-btn-primary" onClick={() => setModal(true)}>+ Criar Story</button>}
    >
      <div className="owner-card">
        <div className="owner-card-header">
          <span className="owner-card-title">{stories.length} storie{stories.length !== 1 ? "s" : ""} ativo{stories.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? <div className="owner-empty">Carregando...</div>
          : stories.length === 0 ? (
            <div className="owner-empty" style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Nenhum story publicado</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>Anuncie promoções e novidades para seus clientes!</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, padding: 20 }}>
              {stories.map(s => (
                <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 16, overflow: "hidden", position: "relative", background: s.tipo === "texto" ? "linear-gradient(135deg, #534AB7, #332d7a)" : "#000" }}>
                  
                  {/* Conteúdo do Story */}
                  <div style={{ aspectRatio: "9/16", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", position: "relative" }}>
                    {s.tipo === "imagem" ? (
                      <>
                        <img src={s.conteudo} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: s.textoImagem ? 0.7 : 1 }} alt="Story" />
                        {s.textoImagem && (
                          <div style={{ position: "absolute", bottom: 40, left: 10, right: 10, textAlign: "center", background: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 8, fontSize: 14 }}>
                            {s.textoImagem}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: 20, textAlign: "center", fontSize: 22, fontWeight: 600 }}>{s.conteudo}</div>
                    )}
                  </div>

                  {/* Informações e Ações */}
                  <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between" }}>
                    <div style={{ background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      👁️ {s.views || 0}
                    </div>
                    <button onClick={() => setConfirmDel(s)} style={{ background: "rgba(255,0,0,0.8)", color: "#fff", border: "none", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>

                  {/* Barra de compartilhar */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.95)", display: "flex", padding: 8, gap: 4 }}>
                    <button onClick={() => copyLink(s)} style={{ flex: 1, padding: "8px 0", border: "none", background: "#f0f0f0", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🔗 Link</button>
                    <button onClick={() => shareWhatsApp(s)} style={{ flex: 1, padding: "8px 0", border: "none", background: "#25D366", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>WhatsApp</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {modal && (
        <div className="owner-modal-overlay" onClick={() => setModal(false)}>
          <div className="owner-modal" onClick={e => e.stopPropagation()}>
            <div className="owner-modal-handle" />
            <h3>Novo Story / Promoção</h3>

            <div className="owner-form-group">
              <label className="owner-form-label">Imagem da Promoção</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <label style={{ flex: 1, padding: "10px", background: "#f0f0f0", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600 }}>
                  📸 Tirar Foto ou Escolher
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              {file && <div style={{ marginTop: 8, fontSize: 12, color: "#16A34A", fontWeight: 600 }}>✓ Imagem selecionada</div>}
            </div>

            <div className="owner-form-group">
              <label className="owner-form-label">Texto {file ? "(Opcional: aparece sobre a foto)" : "(Se não enviar foto, este texto será o story principal)"}</label>
              <textarea 
                className="owner-input" 
                rows="3" 
                value={texto} 
                onChange={e => setTexto(e.target.value)}
                placeholder="Ex: Promoção de Quarta-feira: 20% OFF!"
              />
            </div>

            <div className="owner-form-group">
              <label className="owner-form-label">Adicionar um Botão? (Opcional)</label>
              <select 
                className="owner-input" 
                value={linkAcao} 
                onChange={e => setLinkAcao(e.target.value)}
              >
                <option value="">Sem botão</option>
                <optgroup label="Serviços (Leva para o agendamento)">
                  {servicos.map(s => (
                    <option key={s.id} value={`agendar`}>{s.nome}</option>
                  ))}
                </optgroup>
                <optgroup label="Pacotes">
                  {pacotes.map(p => (
                    <option key={p.id} value="pacotes">{p.nome}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="o-btn o-btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="o-btn o-btn-primary" onClick={save} disabled={saving}>
                {saving ? "Salvando..." : "Publicar Story"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="owner-modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="owner-modal" onClick={e => e.stopPropagation()}>
            <div className="owner-modal-handle" />
            <h3>Excluir story?</h3>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Este story não aparecerá mais para os clientes.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="o-btn o-btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="o-btn o-btn-danger" onClick={del}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
