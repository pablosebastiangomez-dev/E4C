import { Coins, Award, ArrowRight } from 'lucide-react';
import { type Student, type NFT } from '../../types';


interface WalletProps {
  studentId: string; // Add studentId as a prop
  onViewNFT: (nftId: string) => void; // Función callback para ver detalles de un NFT en un modal o nueva vista
  onNavigateToMarketplace: () => void; // Función callback para navegar al Marketplace
}

export function Wallet({ studentId, onViewNFT, onNavigateToMarketplace }: WalletProps) {
  // --- Datos Simulados (Mock Data) ---
  // En una aplicación real, estos datos vendrían de una API o un contexto global de la aplicación.
  const mockStudents: Student[] = [
    { id: 'demo-student-id', name: 'Demo Student', email: 'demo.student@example.com', enrollmentDate: '2023-09-01', tokens: 250, tasksCompleted: 15, nfts: ['nft-1', 'nft-2'], grade: '10th' },
  ];

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
  ];

  // --- Lógica de Filtrado y Asociación de Datos ---
  // Busca el estudiante actual entre los datos simulados.
  const currentStudent = mockStudents.find((s) => s.id === studentId);

  // --- Renderizado Condicional: Estudiante No Encontrado ---
  // Si no se encuentra el estudiante con el ID proporcionado, se muestra un mensaje de error.
  if (!currentStudent) {
    return <div className="text-center py-8 text-red-600">Estudiante no encontrado.</div>;
  }

  // Filtra los NFTs simulados para obtener solo aquellos que el estudiante actual "posee".
  const studentNFTs = mockNfts.filter(nft => currentStudent.nfts.includes(nft.id));


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2>Mi Billetera Digital</h2>
      </div>

      {/* Balance de Tokens */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Coins className="w-6 h-6" />
          </div>
          <span className="opacity-90">Balance de Tokens</span>
        </div>

        <p className="mb-6">{currentStudent.tokens}</p>
        <button
          onClick={onNavigateToMarketplace} // Llama a la función prop para navegar al Marketplace
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <span>Canjear Tokens</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* NFTs de Mérito */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="text-purple-900">Mis NFTs de Mérito</h3>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {(studentNFTs || []).length} Logros
            </span>
          </div>
        </div>
        <div className="p-6">
          {/* --- Renderizado Condicional: No hay NFTs --- */}
          {/* Si el estudiante no tiene NFTs, se muestra un mensaje; de lo contrario, se renderiza el grid de NFTs. */}
          {(studentNFTs || []).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-600">
                Aún no tienes logros. ¡Completa tareas para ganar NFTs!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(studentNFTs || []).map(nft => (
                <button
                  key={nft.id}
                  onClick={() => onViewNFT(nft.id)} // Llama a la función prop para ver los detalles del NFT
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all text-center bg-gradient-to-b from-white to-gray-50"
                >
                  <div className="text-6xl mb-4">{nft.image}</div>
                  <h4 className="text-gray-900 mb-2">{nft.name}</h4>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs mb-3 ${
                    nft.category === 'excellence'
                      ? 'bg-yellow-100 text-yellow-700'
                      : nft.category === 'achievement'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {nft.category === 'excellence'
                      ? 'Excelencia'
                      : nft.category === 'achievement'
                      ? 'Logro'
                      : 'Participación'}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {nft.description}
                  </p>
                  <p className="text-gray-400 text-xs mt-3">
                    {new Date(nft.issuedDate).toLocaleDateString('es-ES')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resumen de Actividad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 mb-2">Tokens Ganados Este Mes</p>
          <p className="text-green-600">+350</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 mb-2">Tokens Canjeados</p>
          <p className="text-blue-600">200</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 mb-2">Próximo Logro</p>
          <p className="text-purple-600">5 tareas más</p>
        </div>
      </div>
    </div>
  );
}