import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Protected route wrapper - redirects to login if not authenticated
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, show the page
  return <>{children}</>;
}
