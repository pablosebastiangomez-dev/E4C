import { User, BookText, Shield, Fingerprint, Trophy, LogOut } from 'lucide-react';
import type { UserRole } from '../App';
import { useAuth } from '../authContext'; 

export function Navigation() {
  const { user, switchUserRole, signOut } = useAuth();
  const userRole = user?.user_metadata.role as UserRole;

  // Define los roles de usuario disponibles y sus propiedades para la navegación.
  // Facilita la generación dinámica de los botones de cambio de rol.
  const roles: { id: UserRole; label: string, icon: React.ComponentType<any> }[] = [
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'teacher', label: 'Docente', icon: BookText },
    { id: 'validator', label: 'Validador', icon: Fingerprint },
    { id: 'student', label: 'Estudiante', icon: User },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
  ];

  // Maneja el cambio de rol, llamando a la función del contexto de autenticación.
  const handleRoleChange = (role: UserRole) => {
    if (switchUserRole) {
      switchUserRole(role);
    }
  };

  // Renderiza la barra de navegación.
  // Itera sobre el array 'roles' para crear un botón para cada rol de usuario,
  // aplicando estilos dinámicos para el rol activo.
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-xl font-bold">
              Edu&Chain
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {roles.map(role => {
              const Icon = role.icon;
              const isActive = userRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'text-gray-500'}`} />
                  <span>{role.label}</span>
                </button>
              );
            })}
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}