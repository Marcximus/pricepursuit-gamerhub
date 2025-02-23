
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();

  // Enhanced debugging logs with emojis for better visibility
  console.log('🛡️ Protected Route State:', {
    path: window.location.pathname,
    isUserLoggedIn: !!user,
    userEmail: user?.email,
    isAdmin,
    isLoading,
    requireAdmin
  });

  if (isLoading) {
    console.log('⏳ Route is loading...');
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    console.log('🚫 No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('⛔ Access denied: User is not admin', {
      userEmail: user.email,
      isAdmin,
      requireAdmin
    });
    return <Navigate to="/" replace />;
  }

  console.log('✅ Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;
