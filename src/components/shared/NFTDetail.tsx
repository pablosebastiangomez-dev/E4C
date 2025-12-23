import { ArrowLeft, Shield, CheckCircle2, Calendar } from 'lucide-react';
import { type NFT } from '../../types';
import { useSupabaseCrud } from '../../hooks';

interface NFTDetailProps {
  nftId: string | null;
  onBack: () => void;
}

export function NFTDetail({ nftId, onBack }: NFTDetailProps) {
  const {
    data: nfts,
    loading: nftsLoading,
    error: nftsError,
  } = useSupabaseCrud<NFT>('nfts');

  if (nftsLoading) {
    return <div className="text-center py-8">Cargando detalles del NFT...</div>;
  }

  if (nftsError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar detalles del NFT: {nftsError}
      </div>
    );
  }

  const nft = (nfts || []).find(n => n.id === nftId);

  if (!nft) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
        <p className="text-gray-600">NFT no encontrado</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver</span>
      </button>

      {/* Card Principal del NFT */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-center">
          <div className="text-9xl mb-4">{nft.image}</div>
          <h2 className="text-white mb-2">{nft.name}</h2>
          <div className={`inline-flex px-4 py-2 rounded-full text-sm ${
            nft.category === 'excellence'
              ? 'bg-yellow-400 text-yellow-900'
              : nft.category === 'achievement'
              ? 'bg-blue-400 text-blue-900'
              : 'bg-green-400 text-green-900'
          }`}>
            {nft.category === 'excellence'
              ? 'Excelencia Académica'
              : nft.category === 'achievement'
              ? 'Logro Destacado'
              : 'Participación Activa'}
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Descripción */}
          <div>
            <h3 className="text-gray-900 mb-3">Descripción del Logro</h3>
            <p className="text-gray-700 leading-relaxed">
              {nft.description}
            </p>
          </div>

          {/* Fecha de Emisión */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h4 className="text-gray-900">Fecha de Emisión</h4>
            </div>
            <p className="text-gray-700">
              {new Date(nft.issuedDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Certificación Multi-Firma */}
          <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-indigo-600" />
              <h3 className="text-indigo-900">Certificación Multi-Firma</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Este NFT ha sido verificado y firmado por múltiples autoridades educativas, 
              garantizando su autenticidad y valor académico.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-900">Docente Certificador</p>
                  <p className="text-gray-600 text-sm">{nft.signatures.teacher}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-900">Administrador Académico</p>
                  <p className="text-gray-600 text-sm">{nft.signatures.admin}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hash de Verificación (simulado) */}
          {nft.blockchainHash && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-gray-900 mb-2">Hash de Verificación</h4>
              {/* TODO: Blockchain Integration Point - Transaction Link */}
              {/* This hash would ideally be a clickable link to a blockchain explorer
                  (e.g., Etherscan, Solscan, StellarExpert, or a custom explorer for your chosen blockchain)
                  to view the on-chain transaction details. */}
              <p className="text-gray-600 text-xs font-mono bg-white p-3 rounded border border-gray-200 break-all">
                {nft.blockchainHash}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Este hash único verifica la autenticidad del logro en la blockchain educativa.
                (Aquí se podría añadir un enlace a un explorador de blockchain para ver la transacción).
              </p>
            </div>
          )}

          {/* Timestamp de Firma */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
            <span>Certificado el:</span>
            <span>
              {new Date(nft.signatures.timestamp).toLocaleString('es-ES')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}