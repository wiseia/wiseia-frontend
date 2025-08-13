import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./ui/LoadingSpinner";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}