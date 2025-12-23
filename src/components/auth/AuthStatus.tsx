import React from 'react';
import { useAuth } from '../../authContext';
import { LogOut } from 'lucide-react';

export function AuthStatus() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null; // Should not happen if this component is rendered inside authenticated routes
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">
        {user.email}
      </span>
      <button
        onClick={signOut}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        title="Cerrar Sesión"
      >
        <LogOut className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
