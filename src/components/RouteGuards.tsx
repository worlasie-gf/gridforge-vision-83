import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import NotFound from "@/pages/NotFound";

const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
};

/**
 * Admin-only guard. Unauthorized users get a generic 404 — no hints that an
 * admin surface exists. Frontend guard is UX only; every backend function
 * re-checks the role server-side.
 */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!roles.includes("admin")) return <NotFound />;
  return <>{children}</>;
};
