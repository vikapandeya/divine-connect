import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, only users with this role can access the route */
  requiredRole?: 'admin' | 'vendor';
}

/**
 * ProtectedRoute — Wraps any route that requires authentication.
 * - If auth is loading → show a spinner
 * - If not logged in → redirect to home (opens AuthModal via state)
 * - If wrong role → show Access Denied screen (does NOT redirect, preserves URL)
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Still resolving Firebase auth state
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // 2. Not authenticated at all — redirect to home, trigger auth modal
  if (!user) {
    return <Navigate to="/" state={{ openAuth: true, from: location.pathname }} replace />;
  }

  // 3. Authenticated but missing required role
  if (requiredRole && (user as any).role !== requiredRole) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-sm">
            You don't have permission to view this page.
            {requiredRole === 'admin' && ' Admin privileges are required.'}
            {requiredRole === 'vendor' && ' Vendor account is required.'}
          </p>
        </div>
        <a
          href="/"
          className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
