import { Coins, Award, ArrowRight } from 'lucide-react';
import { type Student, type NFT } from '../../types';
import { useSupabaseCrud } from '../../hooks';

interface WalletProps {
  studentId: string; // Add studentId as a prop
  onViewNFT: (nftId: string) => void;
  onNavigateToMarketplace: () => void;
}

export function Wallet({ studentId, onViewNFT, onNavigateToMarketplace }: WalletProps) {
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
  } = useSupabaseCrud<Student>('students');
  const {
    data: nfts,
    loading: nftsLoading,
    error: nftsError,
  } = useSupabaseCrud<NFT>('nfts');

  if (studentsLoading || nftsLoading) {
    return <div className="text-center py-8">Cargando billetera...</div>;
  }

  if (studentsError || nftsError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar datos de la billetera: {studentsError || nftsError}
      </div>
    );
  }

  const currentStudent = students?.find((s) => s.id === studentId);
  if (!currentStudent) {
    return <div className="text-center py-8 text-red-600">Estudiante no encontrado.</div>;
  }

  // Filter NFTs based on the student's NFT IDs
  // TODO: Blockchain Integration Point - Ownership Verification
  // In a real blockchain integration, studentNFTs would be fetched or verified directly from the blockchain
  // based on the student's wallet address. The 'nfts' table in Supabase might store metadata and
  // a reference to the on-chain NFT.
  const studentNFTs = (nfts || []).filter(nft => currentStudent.nfts.includes(nft.id));

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
        {/* TODO: Blockchain Integration Point - Token Balance */}
        {/* The token balance would typically be read directly from the blockchain for the student's wallet address.
            Supabase could act as a cache or store historical token transaction data. */}
        <p className="mb-6">{currentStudent.tokens}</p>
        <button
          onClick={onNavigateToMarketplace}
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
                  onClick={() => onViewNFT(nft.id)}
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