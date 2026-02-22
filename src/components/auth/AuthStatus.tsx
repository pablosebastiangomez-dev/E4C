import { useAuth } from '../../authContext';

export function AuthStatus() {
  const { user, session } = useAuth();

  if (session) {
    return (
      <div className="text-sm text-gray-600 ml-4">
        {String(user?.email)} ({user?.user_metadata?.role})
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600 ml-4">
      No autenticado
    </div>
  );
}