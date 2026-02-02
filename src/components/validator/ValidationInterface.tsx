import { useState } from 'react';
import { X, CheckCircle, XCircle, Shield, FileText, AlertTriangle, Zap } from 'lucide-react';
import type { NFTRequest } from '../../App';

interface ValidationInterfaceProps {
  request: NFTRequest;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export function ValidationInterface({ request, onApprove, onReject, onClose }: ValidationInterfaceProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Este es el código que aprueba el envío de NFT
  const handleApprove = () => {
    setIsValidating(true);
    setTimeout(() => {
      onApprove();
    }, 1500);
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3>Validación Técnica de NFT</h3>

              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Detalles del Logro */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h4 className="text-indigo-900 mb-3">{request.achievementName}</h4>
            <p className="text-gray-700 mb-3">{request.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Estudiante</p>
                <p className="text-gray-900">{request.studentName}</p>
              </div>
              <div>
                <p className="text-gray-600">Docente</p>
                <p className="text-gray-900">{request.teacherName}</p>
              </div>
            </div>
          </div>

          {/* Evidencia */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <h4 className="text-gray-900">Evidencia Presentada</h4>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-gray-700">{request.evidence}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Verifica que la evidencia sea auténtica y corresponda al logro descrito</span>
              </div>
            </div>
          </div>

          {/* Firmas Previas */}
          <div>
            <h4 className="text-gray-900 mb-3">Cadena de Firmas (Multi-sig)</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">1. Docente Certificador</p>
                  <p className="text-sm text-gray-600">{request.teacherSignature?.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.teacherSignature?.timestamp || '').toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">2. Administrador Institucional</p>
                  <p className="text-sm text-gray-600">{request.adminSignature?.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.adminSignature?.timestamp || '').toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                <div className="bg-amber-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm">
                  3/3
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">3. Validador Técnico (Tu Firma)</p>
                  <p className="text-sm text-amber-800">Pendiente - Firma final requerida</p>
                </div>
              </div>
            </div>
          </div>



          {/* Rejection Form */}
          {showRejectForm && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h4 className="text-red-900 mb-3">Motivo del Rechazo</h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por qué esta solicitud no puede ser validada (ej: evidencia insuficiente, discrepancia en datos, etc.)..."
                rows={4}
                className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {!showRejectForm ? (
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex-1 py-3 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                <span>Rechazar Solicitud</span>
              </button>
              <button
                onClick={handleApprove}
                disabled={isValidating}
                className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  isValidating
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                } text-white`}
              >
                {isValidating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Validando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Validar</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className={`flex-1 py-3 rounded-lg transition-colors ${
                  rejectionReason.trim()
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirmar Rechazo
              </button>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}