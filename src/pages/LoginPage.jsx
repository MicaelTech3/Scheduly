import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { DEV_EMAIL } from "../lib/firebase";
import { logLogin } from "../lib/firestore";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      if (user.email !== DEV_EMAIL) {
        setError(`Acesso restrito. Este painel é exclusivo para o dev master.`);
        await import("firebase/auth").then(({ signOut }) =>
          signOut(import("../lib/firebase").then(m => m.auth))
        );
        setLoading(false);
        return;
      }
      await logLogin({
        email: user.email,
        nome: user.displayName,
        tipo: "dev",
        empresa: "—",
      });
      navigate("/dashboard");
    } catch (e) {
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">Scheduly</div>
        <div className="login-sub">Painel Dev — acesso restrito</div>

        <button className="btn-google" onClick={handleLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>

        {error && (
          <p style={{ fontSize: 12, color: "#A32D2D", marginTop: 14, background: "#FCEBEB", padding: "8px 12px", borderRadius: 8 }}>
            {error}
          </p>
        )}
        <p className="login-warn">Apenas o e-mail autorizado tem acesso a este painel.</p>
      </div>
    </div>
  );
}
