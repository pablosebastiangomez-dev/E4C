import { Clock, CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import type { NFTRequest } from '../../App';

interface SubmissionHistoryProps {
  requests: NFTRequest[];
}

export function SubmissionHistory({ requests }: SubmissionHistoryProps) {
  // --- Procesamiento de Datos para Estadísticas ---
  // Calcula el número de solicitudes pendientes, aprobadas y rechazadas
  // para mostrar un resumen en la parte superior del dashboard.
  const pendingCount = requests.filter(r => r.status === 'pending-admin').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  // --- Función Auxiliar para Configuración de Estado Visual ---
  // Esta función devuelve un objeto de configuración (icono, etiqueta, colores)
  // que se utiliza para renderizar dinámicamente la insignia y el estilo de cada solicitud
  // según su estado actual. Centraliza la lógica de presentación del estado.
  const getStatusConfig = (status: NFTRequest['status']) => {
    switch (status) {
      case 'pending-admin':
        return {
          icon: Clock,
          label: 'Pendiente de Aprobación',
          color: 'orange',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Aprobado',
          color: 'green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rechazado',
          color: 'red',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: Clock,
          label: 'Pendiente',
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total de Solicitudes</p>
          <p className="text-gray-900">{requests.length}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="text-orange-700 text-sm mb-1">Pendientes</p>
          <p className="text-orange-900">{pendingCount}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-green-700 text-sm mb-1">Aprobadas</p>
          <p className="text-green-900">{approvedCount}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-red-700 text-sm mb-1">Rechazadas</p>
          <p className="text-red-900">{rejectedCount}</p>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h3 className="text-gray-900">Historial de Solicitudes</h3>
          <p className="text-sm text-gray-600 mt-1">
            Seguimiento de todas tus solicitudes de NFT
          </p>
        </div>
        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No has enviado solicitudes de NFT aún
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Usa el formulario para crear tu primera solicitud
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => {
                const statusConfig = getStatusConfig(request.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={request.id}
                    className={`p-6 border-2 rounded-xl ${statusConfig.borderColor} ${statusConfig.bgColor} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-gray-900">{request.achievementName}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                            <StatusIcon className={`inline w-3 h-3 mr-1 ${statusConfig.animate ? 'animate-spin' : ''}`} />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{request.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Estudiante: <span className="text-gray-900">{request.studentName}</span></span>
                          <span>•</span>
                          <span>{new Date(request.requestDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Evidencia */}
                    <div className="bg-white/50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-600 mb-1">Evidencia:</p>
                      <p className="text-sm text-gray-900">{request.evidence}</p>
                    </div>

                    {/* --- Estado de Firma --- */}
                    {/* Renderizado condicional para mostrar el estado de las firmas del docente y del administrador.
                        La firma del administrador es la más compleja, ya que puede ser aprobada, rechazada
                        (con una razón de rechazo) o pendiente. */}
                    <div className="space-y-2">
                      {/* Firma del Docente (siempre presente si la solicitud existe) */}
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-gray-900">Firma del Docente</p>
                          <p className="text-xs text-gray-600">
                            {request.teacherSignature?.name} • {new Date(request.teacherSignature?.timestamp || '').toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>

                      {/* Firma del Administrador (condicional) */}
                      <div className="flex items-center gap-3 text-sm">
                        {request.adminSignature ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                              <p className="text-gray-900">Firma del Administrador</p>
                              <p className="text-xs text-gray-600">
                                {request.adminSignature.name} • {new Date(request.adminSignature.timestamp).toLocaleString('es-ES')}
                              </p>
                            </div>
                          </>
                        ) : request.status === 'rejected' ? (
                          <>
                            <XCircle className="w-5 h-5 text-red-600" />
                            <div className="flex-1">
                              <p className="text-gray-900">Rechazado por Administrador</p>
                              {request.rejectionReason && (
                                <p className="text-xs text-red-600 mt-1">
                                  Razón: {request.rejectionReason}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5 text-orange-600" />
                            <div className="flex-1">
                              <p className="text-gray-600">Pendiente de firma del Administrador</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>




                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}