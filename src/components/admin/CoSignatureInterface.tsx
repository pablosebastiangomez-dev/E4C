import { useState } from 'react';
import { CheckCircle, XCircle, Shield } from 'lucide-react';

interface CoSignatureInterfaceProps {
  onApprove: () => void;
  onReject: (reason: string) => void;
}

// Componente modal para la interfaz de co-firma de un administrador.
// Permite a un administrador dar su aprobación final (co-firmar) o rechazar una solicitud de NFT.
export function CoSignatureInterface({ onApprove, onReject }: CoSignatureInterfaceProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Maneja la aprobación de la solicitud.
  // Simula una llamada asíncrona (ej: a un contrato inteligente) con un setTimeout.
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

        {/* Acciones del Administrador */}
        {/* Renderiza los botones de acción condicionalmente.
            - Muestra 'Rechazar' y 'Aprobar' por defecto.
            - Si se hace clic en 'Rechazar', muestra 'Cancelar' y 'Confirmar Rechazo'.
        */}
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
                    <span>Aprobando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Aprobar</span>
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