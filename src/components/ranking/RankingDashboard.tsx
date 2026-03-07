import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, RefreshCcw } from 'lucide-react';
import { LeaderboardTokens } from './LeaderboardTokens';
import { LeaderboardNFTs } from './LeaderboardNFTs';
import { GeneralStats } from './GeneralStats';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../authContext'; // Import useAuth
import type { Student, StudentTask, Task, NFTRequest } from '../../types';

type RankingView = 'tokens' | 'nfts' | 'stats';

export function RankingDashboard() { // Propiedad 'students' eliminada
  const { allStudents, refreshUsers } = useAuth(); // Obtener allStudents y refreshUsers de useAuth
  const [activeView, setActiveView] = useState<RankingView>('tokens');
  const [studentTasks, setStudentTasks] = useState<StudentTask[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Nuevo estado para la carga de actualización

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Actualizar todos los datos de usuario, incluyendo estudiantes
    setIsRefreshing(true);
    await refreshUsers(); 
    setIsRefreshing(false);
    
    const { data: stData } = await supabase.from('student_tasks').select('*');
    const { data: tData } = await supabase.from('tasks').select('*');
    setStudentTasks(stData || []);
    setTasks(tData || []);
    setLoading(false);
  }, [refreshUsers]); // Añadir refreshUsers a las dependencias de useCallback

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Depender de fetchData

  const tabs = [
    { id: 'tokens' as RankingView, label: 'Ranking por Tokens', icon: Trophy, color: 'yellow' },
    { id: 'nfts' as RankingView, label: 'Ranking por NFTs', icon: Medal, color: 'purple' },
    { id: 'stats' as RankingView, label: 'Estadísticas Generales', icon: TrendingUp, color: 'blue' },
  ];

  const totalStudents = allStudents.length; // Usar allStudents del contexto
  const totalTokens = allStudents.reduce((sum, s) => sum + (s.tokens || 0), 0);
  
  const approvedNFTs = 0; // Establecido temporalmente a 0 ya que la emisión de NFT aún no es persistente
  const avgTokensPerStudent = totalStudents > 0 ? Math.round(totalTokens / totalStudents) : 0;

  if (loading || isRefreshing) return <div className="p-12 text-center">Cargando estadísticas...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4"> {/* Cambiado a justify-between para hacer espacio para el botón */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Cuadro de Honor y Rankings</h2>
              <p className="mt-2 opacity-90">Visualiza el desempeño general de todos los estudiantes</p>
            </div>
          </div>
          <button
            onClick={fetchData} // Llamar a fetchData al hacer clic
            disabled={isRefreshing} // Deshabilitar durante la actualización
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refrescando...' : 'Refrescar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Estudiantes Activos</p>
          <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Tokens Distribuidos</p>
          <p className="text-2xl font-bold text-gray-900">{totalTokens} E4C</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">NFTs Emitidos</p>
          <p className="text-2xl font-bold text-gray-900">{approvedNFTs}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm">Promedio Tokens/Est.</p>
          <p className="text-2xl font-bold text-gray-900">{avgTokensPerStudent}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-2 flex gap-2 overflow-x-auto shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
              activeView === tab.id ? `bg-${tab.color}-100 text-${tab.color}-700 font-bold shadow-sm` : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 min-h-[400px] shadow-sm">
        {activeView === 'tokens' && <LeaderboardTokens students={allStudents} />}
        {activeView === 'nfts' && <LeaderboardNFTs nftRequests={[]} students={allStudents} />}
        {activeView === 'stats' && <GeneralStats students={allStudents} studentTasks={studentTasks} tasks={tasks} />}
      </div>
    </div>
  );
}
