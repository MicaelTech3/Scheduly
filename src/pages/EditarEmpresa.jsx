import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DevLayout from "../components/DevLayout";
import { getEmpresa, updateEmpresa } from "../lib/firestore";
import { toast } from "../components/Toast";

export default function EditarEmpresa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEmpresa(id).then((e) => {
      if (!e) { navigate("/empresas"); return; }
      setForm(e);
    });
  }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.nome?.trim() || !form.slug?.trim()) {
      toast("Preencha nome e slug.");
      return;
    }
    setLoading(true);
    await updateEmpresa(id, {
      nome: form.nome.trim(),
      slug: form.slug.trim().toLowerCase(),
      propNome: form.propNome?.trim() || "",
      propEmail: form.propEmail?.trim() || "",
      plano: form.plano,
      segmento: form.segmento || "",
      obs: form.obs?.trim() || "",
      status: form.status,
    });
    toast("Empresa atualizada!");
    navigate("/empresas");
  };

  if (!form) return <DevLayout title="Editar empresa"><div className="empty-state">Carregando...</div></DevLayout>;

  return (
    <DevLayout title={`Editar — ${form.nome}`}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Editar empresa</span>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Nome da empresa *</label>
            <input type="text" value={form.nome || ""} onChange={set("nome")} />
          </div>
          <div className="form-group">
            <label className="form-label">Slug do link *</label>
            <input type="text" value={form.slug || ""} onChange={set("slug")} />
            <span className="form-hint">scheduly.app/<span style={{ color: "#534AB7" }}>{form.slug}</span></span>
          </div>
          <div className="form-group">
            <label className="form-label">Nome do proprietário</label>
            <input type="text" value={form.propNome || ""} onChange={set("propNome")} />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail do proprietário</label>
            <input type="email" value={form.propEmail || ""} onChange={set("propEmail")} />
          </div>
          <div className="form-group">
            <label className="form-label">Plano</label>
            <select value={form.plano || "Trial (14 dias)"} onChange={set("plano")}>
              <option>Trial (14 dias)</option>
              <option>Basic</option>
              <option>Pro</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select value={form.status || "trial"} onChange={set("status")}>
              <option value="trial">Trial</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Segmento</label>
            <select value={form.segmento || "Outro"} onChange={set("segmento")}>
              <option>Beleza e estética</option>
              <option>Saúde e bem-estar</option>
              <option>Pet shop</option>
              <option>Clínica</option>
              <option>Academia / esportes</option>
              <option>Outro</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Observações internas</label>
            <input type="text" value={form.obs || ""} onChange={set("obs")} />
          </div>
        </div>
        <div className="form-footer">
          <button className="btn btn-ghost" onClick={() => navigate("/empresas")}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </DevLayout>
  );
}
