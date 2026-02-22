import { useState } from 'react';
import { CoSignatureInterface } from './CoSignatureInterface';
import { Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import type { NFTRequest } from '../../types';

interface SignatureCenterProps {
  requests: NFTRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

export function SignatureCenter({ requests, onApprove, onReject }: SignatureCenterProps) {
  // Estado para gestionar la solicitud que se está revisando actualmente en el modal.
  const [selectedRequest, setSelectedRequest] = useState<NFTRequest | null>(null);
  // Estado para filtrar las solicitudes por su estado (pendiente, aprobada, etc.).
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Lógica para filtrar las solicitudes basadas en el estado del filtro seleccionado.
  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return req.status === 'pending-admin';
    if (filter === 'approved') return req.status === 'approved';
    if (filter === 'rejected') return req.status === 'rejected';
    return true;
  });

  // Función auxiliar para renderizar una insignia de estado visualmente distintiva.
  const getStatusBadge = (status: NFTRequest['status']) => {
    switch (status) {
      case 'pending-admin':
        return (
          <span className="px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700 border border-orange-200">
            <Clock className="inline w-3 h-3 mr-1" />
            Pendiente
          </span>
        );

      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="inline w-3 h-3 mr-1" />
            Aprobado
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">
            <XCircle className="inline w-3 h-3 mr-1" />
            Rechazado
          </span>
        );
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-purple-900">Bandeja de Solicitudes</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobadas</option>
                <option value="rejected">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filter === 'pending' 
                  ? 'No hay solicitudes pendientes en este momento'
                  : 'No hay solicitudes con este filtro'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(request => (
                <div
                  key={request.id}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-gray-900">{request.achievementName}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-gray-700 mb-3">{request.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>Estudiante: <span className="text-gray-900">{request.studentName}</span></span>
                        <span>•</span>
                        <span>Docente: <span className="text-gray-900">{request.teacherName}</span></span>
                        <span>•</span>
                        <span>{new Date(request.requestDate).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Evidencia:</p>
                        <p className="text-sm text-gray-900">{request.evidence}</p>
                      </div>

                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs text-red-600 mb-1">Razón del rechazo:</p>
                          <p className="text-sm text-red-900">{request.rejectionReason}</p>
                        </div>
                      )}


                    </div>

                    {request.status === 'pending-admin' && (
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                      >
                        Revisar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Renderizado condicional del modal de co-firma. */}
      {/* El modal solo se muestra si hay una 'selectedRequest' en el estado. */}
      {/* Se le pasan funciones para manejar la aprobación, el rechazo y el cierre,
          las cuales actualizan el estado tanto de este componente como del componente padre (App.tsx). */}
      {selectedRequest && (
        <CoSignatureInterface
          onApprove={() => {
            onApprove(selectedRequest.id);
            setSelectedRequest(null);
          }}
          onReject={(reason) => {
            onReject(selectedRequest.id, reason);
            setSelectedRequest(null);
          }}
        />
      )}
    </>
  );
}