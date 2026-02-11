import { useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react';
import { LeaderboardTokens } from './LeaderboardTokens';
import { LeaderboardNFTs } from './LeaderboardNFTs';
import { GeneralStats } from './GeneralStats';
import type { NFTRequest } from '../../types';
import type { Student } from '../../types';

interface RankingDashboardProps {
  nftRequests: NFTRequest[];
  students: Student[];
}

type RankingView = 'tokens' | 'nfts' | 'stats';

export function RankingDashboard({ nftRequests, students }: RankingDashboardProps) {
  // Estado para controlar la vista activa dentro del dashboard de rankings (por tokens, NFTs o estadísticas generales).
  const [activeView, setActiveView] = useState<RankingView>('tokens');

  // Configuración de las pestañas de navegación para el dashboard.
  // Cada objeto define una pestaña con su ID, etiqueta, icono y color para el estilo.
  const tabs = [
    { id: 'tokens' as RankingView, label: 'Ranking por Tokens', icon: Trophy, color: 'yellow' },
    { id: 'nfts' as RankingView, label: 'Ranking por NFTs', icon: Medal, color: 'purple' },
    { id: 'stats' as RankingView, label: 'Estadísticas Generales', icon: TrendingUp, color: 'blue' },
  ];

  // --- Cálculo de Estadísticas Resumidas para la Vista General ---
  // Estos valores se derivan de los props 'students' y 'nftRequests' para mostrar un resumen rápido.
  const totalStudents = students.length;
  const totalTokens = students.reduce((acc, student) => acc + student.tokens, 0);
  const approvedNFTs = nftRequests.filter(r => r.status === 'approved').length;
  const avgTokensPerStudent = totalStudents > 0 ? Math.round(totalTokens / totalStudents) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2>Rankings y Estadísticas</h2>
            <p className="mt-2 opacity-90">
              Visualiza el desempeño general de todos los estudiantes
            </p>
          </div>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Estudiantes Activos</p>
              <p className="text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tokens Distribuidos</p>
              <p className="text-gray-900">{totalTokens}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">NFTs Emitidos</p>
              <p className="text-gray-900">{approvedNFTs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Promedio Tokens/Est.</p>
              <p className="text-gray-900">{avgTokensPerStudent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación del Dashboard */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
                isActive
                  ? `bg-${tab.color}-100 text-${tab.color}-700`
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido Dinámico del Dashboard */}
      {/* Muestra el componente de ranking o estadísticas correspondiente a la pestaña activa. */}
      <div>
        {activeView === 'tokens' && <LeaderboardTokens students={students} />}
        {activeView === 'nfts' && <LeaderboardNFTs nftRequests={nftRequests} />}
        {activeView === 'stats' && <GeneralStats nftRequests={nftRequests} students={students} />}
      </div>
    </div>
  );
}