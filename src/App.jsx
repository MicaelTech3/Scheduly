import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import NovaEmpresa from "./pages/NovaEmpresa";
import EditarEmpresa from "./pages/EditarEmpresa";
import Logins from "./pages/Logins";
import Proprietarios from "./pages/Proprietarios";
import { OwnerAuthProvider } from "./lib/OwnerAuthContext";
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerRoute from "./components/owner/OwnerRoute";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import Servicos from "./pages/owner/Servicos";
import Aparencia from "./pages/owner/Aparencia";
import Agenda from "./pages/owner/Agenda";
import Colaboradores from "./pages/owner/Colaboradores";
import Clientes from "./pages/owner/Clientes";
import Caixa from "./pages/owner/Caixa";
import Pacotes from "./pages/owner/Pacotes";
import OwnerStories from "./pages/owner/OwnerStories";
import ClientAppWrapper from "./pages/client/ClientAppWrapper";
import "./styles/global.css";

export default function App() {
  return (
    <AuthProvider>
      <OwnerAuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/c/:slug/*" element={<ClientAppWrapper />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/empresas" element={<ProtectedRoute><Empresas /></ProtectedRoute>} />
          <Route path="/empresas/:id" element={<ProtectedRoute><EditarEmpresa /></ProtectedRoute>} />
          <Route path="/nova-empresa" element={<ProtectedRoute><NovaEmpresa /></ProtectedRoute>} />
          <Route path="/logins" element={<ProtectedRoute><Logins /></ProtectedRoute>} />
          <Route path="/proprietarios" element={<ProtectedRoute><Proprietarios /></ProtectedRoute>} />
          
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
          <Route path="/owner/servicos" element={<OwnerRoute><Servicos /></OwnerRoute>} />
          <Route path="/owner/aparencia" element={<OwnerRoute><Aparencia /></OwnerRoute>} />
          <Route path="/owner/agenda" element={<OwnerRoute><Agenda /></OwnerRoute>} />
          <Route path="/owner/colaboradores" element={<OwnerRoute><Colaboradores /></OwnerRoute>} />
          <Route path="/owner/clientes" element={<OwnerRoute><Clientes /></OwnerRoute>} />
          <Route path="/owner/caixa" element={<OwnerRoute><Caixa /></OwnerRoute>} />
          <Route path="/owner/pacotes" element={<OwnerRoute><Pacotes /></OwnerRoute>} />
          <Route path="/owner/stories" element={<OwnerRoute><OwnerStories /></OwnerRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </OwnerAuthProvider>
    </AuthProvider>
  );
}
