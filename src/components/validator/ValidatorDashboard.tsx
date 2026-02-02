import { Shield, CheckCircle, AlertCircle, Clock, Award } from 'lucide-react';
import { ValidationCenter } from './ValidationCenter';
import type { NFTRequest } from '../../App';

interface ValidatorDashboardProps {
  nftRequests: NFTRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
}

export function ValidatorDashboard({ nftRequests, onApproveRequest, onRejectRequest }: ValidatorDashboardProps) {
  // --- Derivación de Datos para Estadísticas ---
  // Filtra las solicitudes de NFT para obtener las pendientes de validación
  // y las que ya han sido aprobadas y firmadas por un validador.
  const pendingRequests = nftRequests.filter(r => r.status === 'pending-validator');
  const validatedRequests = nftRequests.filter(r => r.status === 'approved' && r.validatorSignature);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2>Centro de Validación Técnica</h2>

          </div>
        </div>
        {/* --- Notificación Condicional en el Encabezado --- */}
        {/* Muestra un mensaje de alerta si hay solicitudes pendientes de validación. */}
        {pendingRequests.length > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p>
                Tienes {pendingRequests.length} solicitud{pendingRequests.length !== 1 ? 'es' : ''} pendiente{pendingRequests.length !== 1 ? 's' : ''} de validación
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- Sección de KPIs (Indicadores Clave de Rendimiento) --- */}
      {/* Muestra un resumen rápido de las estadísticas de validación. */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Revisados</p>
              <p className="text-gray-900">{nftRequests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-orange-700 text-sm">Pendientes</p>
              <p className="text-orange-900">{pendingRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-green-700 text-sm">Validados</p>
              <p className="text-green-900">{validatedRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="text-blue-900 mb-2">Rol del Validador</h4>
            <p className="text-blue-800 text-sm mb-3">
              Como validador técnico, eres responsable de verificar la autenticidad de las evidencias.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Verificar la calidad y autenticidad de las evidencias presentadas</li>
              <li>• Confirmar que las firmas del docente y administrador sean válidas</li>
              <li>• Garantizar la integridad del sistema de certificación</li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- Integración del Centro de Validación --- */}
      {/* Este componente delega la funcionalidad principal de listado y acción de validación
          al componente `ValidationCenter`, pasándole las solicitudes y los callbacks
          para aprobar o rechazar una solicitud. */}
      <ValidationCenter 
        requests={nftRequests}
        onApprove={onApproveRequest}
        onReject={onRejectRequest}
      />
    </div>
  );
}