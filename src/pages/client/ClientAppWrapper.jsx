import { useEffect, useState } from "react";
import { useParams, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getEmpresaBySlug } from "../../lib/firestore";
import { ClientAuthProvider, useClientAuth } from "../../lib/ClientAuthContext";
import "../../styles/client.css";

import ClientLayout from "../../components/client/ClientLayout";
import ClientLogin from "./ClientLogin";
import ClientHome from "./ClientHome";
import ClientServicos from "./ClientServicos";
import ClientPacotes from "./ClientPacotes";
import ClientAgendar from "./ClientAgendar";
import ClientAgendamentos from "./ClientAgendamentos";

function ProtectedClientRoute({ children }) {
  const { user, loading } = useClientAuth();
  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Carregando...</div>;
  if (!user) return <Navigate to="login" replace />;
  return children;
}

export default function ClientAppWrapper() {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmpresaBySlug(slug).then((data) => {
      setEmpresa(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>Carregando aplicativo...</div>;
  }

  if (!empresa) {
    return <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>Empresa não encontrada.</div>;
  }

  // Inject dynamic CSS variable for the theme color
  const accentColor = empresa.accentColor || "#534AB7";

  return (
    <div style={{ "--client-color": accentColor }}>
      <ClientAuthProvider empresaId={empresa.id}>
        <Routes>
          <Route path="login" element={<ClientLogin empresa={empresa} />} />
          <Route path="/" element={<ProtectedClientRoute><ClientLayout empresa={empresa}><ClientHome empresa={empresa} /></ClientLayout></ProtectedClientRoute>} />
          <Route path="servicos" element={<ProtectedClientRoute><ClientLayout empresa={empresa}><ClientServicos empresa={empresa} /></ClientLayout></ProtectedClientRoute>} />
          <Route path="pacotes" element={<ProtectedClientRoute><ClientLayout empresa={empresa}><ClientPacotes empresa={empresa} /></ClientLayout></ProtectedClientRoute>} />
          <Route path="agendar" element={<ProtectedClientRoute><ClientLayout empresa={empresa}><ClientAgendar empresa={empresa} /></ClientLayout></ProtectedClientRoute>} />
          <Route path="agendamentos" element={<ProtectedClientRoute><ClientLayout empresa={empresa}><ClientAgendamentos empresa={empresa} /></ClientLayout></ProtectedClientRoute>} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </ClientAuthProvider>
    </div>
  );
}
