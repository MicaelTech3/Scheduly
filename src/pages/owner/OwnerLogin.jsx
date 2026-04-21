import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";
import { logLogin } from "../../lib/firestore";
import "../../styles/owner.css";

export default function OwnerLogin() {
  const { login } = useOwnerAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { resetPassword } = useOwnerAuth();

  const errMsg = (code) => {
    if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential")
      return "E-mail ou senha incorretos.";
    if (code === "auth/too-many-requests")
      return "Muitas tentativas. Aguarde alguns minutos.";
    if (code === "auth/invalid-email")
      return "E-mail inválido.";
    return "Erro ao fazer login. Tente novamente.";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      await logLogin({ email: result.user.email, nome: result.user.displayName || email, tipo: "proprietário", empresa: "—" });
      navigate("/owner/dashboard");
    } catch (err) {
      setError(errMsg(err.code));
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) { setError("Digite seu e-mail primeiro."); return; }
    try {
      await resetPassword(email);
      setError("");
      setShowReset(false);
      alert("E-mail de redefinição enviado!");
    } catch {
      setError("Não foi possível enviar o e-mail.");
    }
  };

  return (
    <div className="owner-login-page">
      <div className="owner-login-card">
        <div className="owner-login-logo">Scheduly</div>
        <div className="owner-login-sub">Portal do proprietário</div>

        {error && <div className="owner-error">{error}</div>}

        <form onSubmit={showReset ? handleReset : handleLogin}>
          <div className="owner-input-group">
            <label className="owner-input-label">E-mail</label>
            <input
              className="owner-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {!showReset && (
            <div className="owner-input-group">
              <label className="owner-input-label">Senha</label>
              <input
                className="owner-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="o-btn o-btn-primary o-btn-full"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Entrando..." : showReset ? "Enviar e-mail de redefinição" : "Entrar"}
          </button>
        </form>

        <button
          onClick={() => { setShowReset(!showReset); setError(""); }}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#888", marginTop: 14, display: "block", width: "100%", textAlign: "center" }}
        >
          {showReset ? "← Voltar ao login" : "Esqueci minha senha"}
        </button>
      </div>
    </div>
  );
}