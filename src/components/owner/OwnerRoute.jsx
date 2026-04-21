import { Navigate } from "react-router-dom";
import { useOwnerAuth } from "../../lib/OwnerAuthContext";

export default function OwnerRoute({ children }) {
  const { user, loading } = useOwnerAuth();
  if (loading) return <div className="loading">Carregando...</div>;
  if (!user) return <Navigate to="/owner/login" replace />;
  return children;
}