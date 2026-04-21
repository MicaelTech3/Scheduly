import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DevLayout from "../components/DevLayout";
import { createEmpresa } from "../lib/firestore";
import { toast } from "../components/Toast";

export default function NovaEmpresa() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "", slug: "", propNome: "", propEmail: "",
    plano: "Trial (14 dias)", segmento: "Beleza e estética", obs: "",
  });

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: val };
      if (k === "nome" && !f._slugEdited) {
        next.slug = val.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .trim().replace(/\s+/g, "-");
      }
      if (k === "slug") next._slugEdited = true;
      return next;
    });
  };

  const submit = async () => {
    if (!form.nome.trim() || !form.slug.trim()) {
      toast("Preencha nome e slug da empresa.");
      return;
    }
    setLoading(true);
    try {
      await createEmpresa({
        nome: form.nome.trim(),
        slug: form.slug.trim().toLowerCase(),
        propNome: form.propNome.trim(),
        propEmail: form.propEmail.trim(),
        plano: form.plano,
        segmento: form.segmento,
        obs: form.obs.trim(),
      });
      toast("Empresa criada com sucesso!");
      navigate("/empresas");
    } catch (e) {
      toast("Erro ao criar empresa. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <DevLayout title="Nova empresa">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Cadastrar nova empresa</span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Nome da empresa *</label>
            <input type="text" placeholder="Ex: Barbearia Premium" value={form.nome} onChange={set("nome")} />
          </div>

          <div className="form-group">
            <label className="form-label">Slug do link *</label>
            <input type="text" placeholder="barbearia-premium" value={form.slug} onChange={set("slug")} />
            <span className="form-hint">
              scheduly.app/<span style={{ color: "#534AB7" }}>{form.slug || "seu-slug"}</span>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Nome do proprietário</label>
            <input type="text" placeholder="Ex: João Silva" value={form.propNome} onChange={set("propNome")} />
          </div>

          <div className="form-group">
            <label className="form-label">E-mail do proprietário</label>
            <input type="email" placeholder="joao@email.com" value={form.propEmail} onChange={set("propEmail")} />
          </div>

          <div className="form-group">
            <label className="form-label">Plano</label>
            <select value={form.plano} onChange={set("plano")}>
              <option>Trial (14 dias)</option>
              <option>Basic</option>
              <option>Pro</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Segmento</label>
            <select value={form.segmento} onChange={set("segmento")}>
              <option>Beleza e estética</option>
              <option>Saúde e bem-estar</option>
              <option>Pet shop</option>
              <option>Clínica</option>
              <option>Academia / esportes</option>
              <option>Outro</option>
            </select>
          </div>

          <div className="form-group full">
            <label className="form-label">Observações internas</label>
            <input type="text" placeholder="Notas para uso interno (não visível para o proprietário)..." value={form.obs} onChange={set("obs")} />
          </div>
        </div>

        <div className="form-footer">
          <button className="btn btn-ghost" onClick={() => navigate("/empresas")}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Criando..." : "Criar empresa"}
          </button>
        </div>
      </div>
    </DevLayout>
  );
}
