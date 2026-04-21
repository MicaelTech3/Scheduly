import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isDev, loading } = useAuth();
  if (loading) return <div className="loading">Carregando...</div>;
  if (!user || !isDev) return <Navigate to="/login" replace />;
  return children;
}
