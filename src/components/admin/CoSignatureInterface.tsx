import { useState } from 'react';
import { X, CheckCircle, XCircle, Shield, User, FileText, Calendar, Sparkles } from 'lucide-react';
import type { NFTRequest } from '../../App';

interface CoSignatureInterfaceProps {
  request: NFTRequest;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export function CoSignatureInterface({ request, onApprove, onReject, onClose }: CoSignatureInterfaceProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3>Interfaz de Co-Firma Multi-sig</h3>
                <p className="text-sm opacity-90 mt-1">
                  Valida y certifica la emisión del NFT
                </p>
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
          {/* Información del Estudiante */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-indigo-600" />
              <h4 className="text-indigo-900">Información del Estudiante</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nombre</p>
                <p className="text-gray-900">{request.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">ID de Estudiante</p>
                <p className="text-gray-900">{request.studentId}</p>
              </div>
            </div>
          </div>

          {/* Detalles del Logro */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="text-gray-900">Detalles del Logro</h4>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-gray-900 mb-3">{request.achievementName}</h4>
              <p className="text-gray-700 mb-4">{request.description}</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Evidencia presentada:</p>
                    <p className="text-sm text-gray-900">{request.evidence}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Docente que Avala */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="text-gray-900">Docente Certificador (Firma 1 de 2)</h4>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl">
                  {request.teacherName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{request.teacherName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(request.teacherSignature?.timestamp || '').toLocaleString('es-ES')}</span>
                  </div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Estado de Co-Firma */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                2/2
              </div>
              <div>
                <p className="text-gray-900 mb-1">Tu Firma Como Administrador</p>
                <p className="text-sm text-gray-600">
                  Al aprobar, tu firma digital será registrada junto con la del docente,
                  y el NFT será emitido de forma inmutable en la blockchain institucional.
                </p>
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
                placeholder="Explica por qué esta solicitud no puede ser aprobada..."
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
                disabled={isApproving}
                className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  isApproving
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl'
                } text-white`}
              >
                {isApproving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registrando en Blockchain...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Aprobar y Registrar en Blockchain</span>
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

        {/* Approval Animation Overlay */}
        {isApproving && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-8 mb-6 animate-pulse">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-gray-900 mb-2">Sellado Inmutable en Progreso</h3>
            <p className="text-gray-600 mb-6">Registrando NFT en el ledger institucional...</p>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}