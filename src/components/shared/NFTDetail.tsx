import { ArrowLeft, CheckCircle2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { type NFT } from '../../types';


interface NFTDetailProps {
  nftId: string | null;
  onBack: () => void;
}

export function NFTDetail({ nftId, onBack }: NFTDetailProps) {
  // --- Datos de NFT de Prueba (Datos Simulados) ---
  // Esta lista de NFTs es solo para demostración. En una aplicación real,
  // estos datos provendrían de una API o una base de datos.
  const mockNfts: NFT[] = [
    {
      id: 'nft-1',
      name: 'Pioneer Innovator Award',
      description: 'Awarded for outstanding innovation in the annual science fair.',
      image: '🚀',
      issuedDate: '2023-05-15T10:00:00Z',
      category: 'excellence',
      signatures: {
        teacher: 'Prof. Alex Johnson',
        admin: 'Dr. Emily White',
        timestamp: '2023-05-20T11:30:00Z',
      },
    },
    {
      id: 'nft-2',
      name: 'Community Leader Recognition',
      description: 'Recognizing significant contributions to school community service initiatives.',
      image: '🤝',
      issuedDate: '2023-03-01T09:00:00Z',
      category: 'achievement',
      signatures: {
        teacher: 'Ms. Sarah Davis',
        admin: 'Dr. Emily White',
        timestamp: '2023-03-05T14:00:00Z',
      },
    },
    {
      id: 'nft-3',
      name: 'Creative Writer Award',
      description: 'For exceptional creativity and storytelling in the literary arts program.',
      image: '✍️',
      issuedDate: '2023-06-20T15:00:00Z',
      category: 'excellence',
      signatures: {
        teacher: 'Mr. David Lee',
        admin: 'Dr. Emily White',
        timestamp: '2023-06-25T16:00:00Z',
      },
    },
  ];

  const [nfts] = useState<NFT[]>(mockNfts);


  const nft = (nfts || []).find((n: NFT) => n.id === nftId);

  // --- Renderizado Condicional: NFT No Encontrado ---
  // Si no se encuentra el NFT con el ID proporcionado, se muestra un mensaje de error
  // y un botón para volver a la vista anterior.
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

      {/* Tarjeta Principal del NFT */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-center">
          <div className="text-9xl mb-4">{nft.image}</div>
          <h2 className="text-white mb-2">{nft.name}</h2>
          {/* Estilos dinámicos para la insignia de categoría basados en el tipo de NFT. */}
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
              <CheckCircle2 className="w-6 h-6 text-indigo-600" />
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



          {/* Marca de Tiempo de Firma */}
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