import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../authContext';
import { Users, UserPlus, BookCopy, UserCheck, CreditCard, DollarSign } from 'lucide-react'; // All necessary icons
import { StudentManagement } from './StudentManagement';
import { TeacherManagement } from './TeacherManagement';
import UserApproval from './UserApproval';

export default function AdminDashboard() {
  const { user, allAdmins, allStudents, allTeachers, refreshUsers } = useAuth(); // Get refreshUsers from useAuth
  const currentAdmin = allAdmins.find(admin => admin.id === user?.id);

  // Active view for tabs
  const [activeView, setActiveView] = useState<'students' | 'teachers' | 'approve' | 'stellar-setup'>('students');

  // Stellar setup states
  const [isCreatingStellarAccounts, setIsCreatingStellarAccounts] = useState(false);
  const [stellarAccountCreationError, setStellarAccountCreationError] = useState<string | null>(null);
  const [stellarAccountCreationResult, setStellarAccountCreationResult] = useState<{
    issuerPublicKey: string;
    issuerSecretKey: string;
    distributorPublicKey: string;
    distributorSecretKey: string;
  } | null>(null);

  const [adminProfileLoading, setAdminProfileLoading] = useState(false);
  const [adminProfileCreationError, setAdminProfileCreationError] = useState<string | null>(null);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Effect to populate stellarAccountCreationResult if admin already has stellar_public_key
  useEffect(() => {
    if (currentAdmin?.stellar_public_key && !stellarAccountCreationResult) {
      // In a real scenario, distributor keys might also be fetched from a secure storage
      // For MVP, we're just showing the issuer public key if it exists
      setStellarAccountCreationResult({
        issuerPublicKey: currentAdmin.stellar_public_key,
        issuerSecretKey: '****** (Stored Securely)',
        distributorPublicKey: '****** (Not yet implemented to fetch from DB)',
        distributorSecretKey: '****** (Stored Securely)',
      });
    }
  }, [currentAdmin, stellarAccountCreationResult]);


  const handleCreateAdminProfile = async () => {
    setAdminProfileLoading(true);
    setAdminProfileCreationError(null);
    try {
      // For MVP, since we don't have real Supabase auth session, generate a UUID for the profile ID
                // Use input field values, with fallbacks
                const newAdminId = crypto.randomUUID(); // Generate a new UUID for the admin profile
                const adminName = newAdminName || user?.user_metadata?.name || user?.email?.split('@')[0] || "Admin User";
                const adminEmail = newAdminEmail || user?.email || "admin@example.com";
                
                if (!adminName || !adminEmail) {
                  throw new Error("Nombre y Email son requeridos para crear el perfil de Administrador.");
                }
      const { data, error } = await supabase
        .from('admins')
        .insert({
          id: newAdminId, // Use generated UUID
          name: adminName,
          email: adminEmail,
        });

                if (error) throw error;
                alert('Admin profile created successfully! Please re-select the Admin role.');
                await refreshUsers(); // Refresh all user data in context
              } catch (error: any) {      console.error("Error creating admin profile:", error);
      setAdminProfileCreationError(error.message || "Failed to create admin profile.");
    } finally {
      setAdminProfileLoading(false);
    }
  };

  const handleCreateStellarAccounts = async () => {
    setIsCreatingStellarAccounts(true);
    setStellarAccountCreationError(null);
    setStellarAccountCreationResult(null);

    try {
      if (!currentAdmin?.id) {
        throw new Error("No se encontró una sesión de administrador activa o el admin no tiene ID.");
      }

      // Call the Edge Function
      const response = await fetch('/api/create-e4c-accounts-and-emit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`,
        },
        body: JSON.stringify({ adminId: currentAdmin.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error en la función Edge: ${response.status}`);
      }

      const data = await response.json();

      console.log("Stellar Data:", data);
      setStellarAccountCreationResult(data);
      await refreshUsers(); // Refresh all user data in context
    } catch (err: any) {
      console.error("Error:", err);
      setStellarAccountCreationError(err.message || "Error al conectar con la red Stellar.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers for original AdminDashboard functionality (placeholders as before)
  const handleCreateStudent = async () => { console.log("handleCreateStudent at AdminDashboard level is now a placeholder."); };
  const handleCreateTeacher = async () => { console.log("handleCreateTeacher at AdminDashboard level is now a placeholder."); };


  const userRole = user?.user_metadata?.role; // Get user role from context

  // Display profile creation UI if admin role is active but no profile exists
  if (userRole === 'admin' && !currentAdmin) {
    return (
      <div className="flex justify-center items-center h-screen p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">Crear Perfil de Administrador</h3>
                        <p className="text-gray-700">
                          Parece que no tienes un perfil de administrador registrado. Por favor, ingresa tus datos para crearlo y acceder a las funciones de administración.
                        </p>
                        <input
                          type="text"
                          placeholder="Nombre del Administrador"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="email"
                          placeholder="Email del Administrador"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)} // Corrected: setNewAdminEmail
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />          {adminProfileCreationError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{adminProfileCreationError}</span>
            </div>
          )}
          <button
            onClick={handleCreateAdminProfile}
            disabled={adminProfileLoading}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {adminProfileLoading ? 'Creando perfil...' : 'Crear Perfil de Administrador'}
          </button>
        </div>
      </div>
    );
  }

  // Handle cases where user is not an admin or not logged in
  if (userRole !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen p-8 text-lg text-gray-600">
        No tienes permisos para acceder a este panel.
      </div>
    );
  }
  if (!user) {
    return (
        <div className="flex justify-center items-center h-screen text-lg">
            Por favor, inicia sesión para acceder al panel.
        </div>
    );
  }
  
  // Existing Admin Dashboard content
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/10 p-3 rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2>Panel de Administrador</h2>
            <p className="mt-2 opacity-80">
              Administra usuarios y configura la red Stellar
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex gap-2">
        <button
          onClick={() => setActiveView('students')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeView === 'students'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <UserPlus className="w-5 h-5" />
          <span>Gestión de Estudiantes</span>
        </button>
        <button
          onClick={() => setActiveView('teachers')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeView === 'teachers'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BookCopy className="w-5 h-5" />
          <span>Gestión de Docentes</span>
        </button>
        <button
          onClick={() => setActiveView('approve')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeView === 'approve'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>Aprobar Usuarios</span>
        </button>
        <button
          onClick={() => setActiveView('stellar-setup')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeView === 'stellar-setup'
              ? 'bg-yellow-100 text-yellow-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Configuración Stellar</span>
        </button>
      </div>

      {/* Contenido dinámico según la vista activa */}
      <div>
        {activeView === 'students' && (
          <StudentManagement />
        )}
        {activeView === 'teachers' && (
          <TeacherManagement />
        )}
        {activeView === 'approve' && (
          <UserApproval />
        )}
        {activeView === 'stellar-setup' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-600" />
              Configuración de Cuentas Stellar (E4C)
            </h3>
            <p className="text-gray-700">
              Esta sección permite al administrador configurar las cuentas emisora y distribuidora del token E4C en la red Stellar.
              <br />
              La cuenta emisora tiene la capacidad de crear nuevos tokens, y la distribuidora es la encargada de enviar tokens a los estudiantes.
            </p>

            {/* Display Current Admin Profile Info */}
            {currentAdmin && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-800">Tu Perfil de Administrador:</h4>
                <p><strong>ID:</strong> {currentAdmin.id}</p>
                <p><strong>Nombre:</strong> {currentAdmin.name}</p>
                <p><strong>Email:</strong> {currentAdmin.email}</p>
                <p><strong>Stellar Public Key:</strong> {currentAdmin.stellar_public_key || 'No configurada'}</p>
                <p><strong>Creado el:</strong> {new Date(currentAdmin.created_at).toLocaleDateString()}</p>
              </div>
            )}

            {/* Check if current admin already has a stellar_public_key */}
            {currentAdmin?.stellar_public_key && !stellarAccountCreationResult ? (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Información:</strong>
                <span className="block sm:inline ml-2">La cuenta emisora Stellar ya está configurada para este administrador.</span>
                <p className="mt-2 text-sm">Public Key: {currentAdmin.stellar_public_key}</p>
              </div>
            ) : (
              !stellarAccountCreationResult && ( // Show button only if accounts haven't been created yet and no existing public key
                <button
                  onClick={handleCreateStellarAccounts}
                  disabled={isCreatingStellarAccounts}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreatingStellarAccounts ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando Cuentas...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Crear Cuentas Emisora y Distribuidora (Solo una vez)
                    </>
                  )}
                </button>
              )
            )}


            {stellarAccountCreationError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{stellarAccountCreationError}</span>
              </div>
            )}

            {stellarAccountCreationResult && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative space-y-4" role="alert">
                <strong className="font-bold">Cuentas Stellar Creadas Exitosamente:</strong>
                <p className="block">
                  <span className="font-semibold">Issuer Public Key:</span> {stellarAccountCreationResult.issuerPublicKey}
                </p>
                <p className="block">
                  <span className="font-semibold">Issuer Secret Key:</span> <code className="break-all">{stellarAccountCreationResult.issuerSecretKey}</code>
                  <span className="text-red-600 block text-xs mt-1">⚠️ ¡GUARDA ESTA CLAVE DE FORMA SEGURA! Nunca la compartas.</span>
                </p>
                <p className="block">
                  <span className="font-semibold">Distributor Public Key:</span> {stellarAccountCreationResult.distributorPublicKey}
                </p>
                <p className="block">
                  <span className="font-semibold">Distributor Secret Key:</span> <code className="break-all">{stellarAccountCreationResult.distributorSecretKey}</code>
                  <span className="text-red-600 block text-xs mt-1">⚠️ ¡GUARDA ESTA CLAVE DE FORMA SEGURA! Nunca la compartas.</span>
                </p>
                <p className="text-sm font-semibold">
                  Estas claves son esenciales para la gestión de tokens.
                  En un entorno de producción, las claves secretas deben almacenarse de forma segura en un backend (por ejemplo, Supabase Vault o variables de entorno para Edge Functions) y nunca ser expuestas en el frontend.
                </p>
              </div>
            )}

            {/* Token Management Section */}
            {stellarAccountCreationResult && (
              <div className="pt-6 border-t border-gray-200 mt-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Gestión de Tokens E4C
                </h3>
                <p className="text-gray-700">
                  Una vez que las cuentas Stellar están configuradas, puedes usar la cuenta distribuidora
                  para emitir más tokens E4C o para transferirlos a otras cuentas.
                </p>
                <button
                  onClick={() => alert('Implementar emisión/transferencia de tokens')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Emitir/Transferir Más Tokens (Placeholder)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
