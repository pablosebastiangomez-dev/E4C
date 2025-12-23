import { useState } from 'react';
import { Award, Calendar, Shield, X } from 'lucide-react';
import type { NFTRequest } from '../../App';

interface MyNFTsProps {
  nfts: NFTRequest[];
}

export function MyNFTs({ nfts }: MyNFTsProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFTRequest | null>(null);

  const getNFTEmoji = (name: string) => {
    if (name.includes('Excelencia')) return '🏆';
    if (name.includes('Proyecto') || name.includes('Innovador')) return '🚀';
    if (name.includes('Liderazgo')) return '⭐';
    if (name.includes('Participación')) return '💡';
    if (name.includes('Mejora')) return '📈';
    if (name.includes('Asistencia')) return '✅';
    return '🎖️';
  };

  return (
    <>
      <div className="space-y-6">
        {nfts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">Aún no tienes NFTs</h3>
            <p className="text-gray-600">
              Sigue trabajando duro y pronto obtendrás tus primeros logros certificados
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900">Mis NFTs de Mérito</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Logros certificados en blockchain
                  </p>
                </div>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
                  {nfts.length} Logro{nfts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map(nft => (
                <button
                  key={nft.id}
                  onClick={() => setSelectedNFT(nft)}
                  className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-purple-400 hover:shadow-xl transition-all text-left"
                >
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 flex items-center justify-center border-b border-gray-200">
                    <div className="text-7xl">{getNFTEmoji(nft.achievementName)}</div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-gray-900 mb-2">{nft.achievementName}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {nft.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(nft.requestDate).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 text-white relative">
              <button
                onClick={() => setSelectedNFT(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-8xl mb-4 text-center">{getNFTEmoji(selectedNFT.achievementName)}</div>
              <h2 className="text-center">{selectedNFT.achievementName}</h2>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h4 className="text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-700">{selectedNFT.description}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-gray-900 mb-2">Evidencia</h4>
                <p className="text-gray-700 text-sm">{selectedNFT.evidence}</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  <h4 className="text-indigo-900">Certificación Multi-Firma</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">Docente Certificador</p>
                      <p className="text-sm text-gray-600">{selectedNFT.teacherSignature?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">Administrador</p>
                      <p className="text-sm text-gray-600">{selectedNFT.adminSignature?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">Validador Técnico</p>
                      <p className="text-sm text-gray-600">{selectedNFT.validatorSignature?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedNFT.blockchainHash && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-2">Hash de Blockchain</h4>
                  <p className="text-xs font-mono bg-white p-3 rounded border border-gray-200 break-all text-gray-600">
                    {selectedNFT.blockchainHash}
                  </p>
                  {/* TODO: Blockchain Integration Point - Transaction Link */}
                  {/* This hash would ideally be a clickable link to a blockchain explorer
                      (e.g., Etherscan, Solscan, StellarExpert) to view the on-chain transaction details. */}
                  <p className="text-xs text-gray-500 mt-2">
                    Este hash verifica la autenticidad del logro en la blockchain.
                    (Aquí se podría añadir un enlace a un explorador de blockchain para ver la transacción).
                  </p>
                </div>
              )}
               {/* TODO: Blockchain Integration Point - NFT Metadata & Provenance */}
               {/* In a fully integrated system, the NFT metadata (image, description, etc.)
                   could also be stored on a decentralized file storage (e.g., IPFS)
                   and linked via the blockchain. Ownership history could be queried on-chain. */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}