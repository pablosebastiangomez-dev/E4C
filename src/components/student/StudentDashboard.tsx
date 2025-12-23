import { useState, useEffect } from 'react';
import { Coins, Award, ShoppingBag, Trophy } from 'lucide-react';
import { MyTokens } from './MyTokens';
import { MyNFTs } from './MyNFTs';
import { Marketplace } from './Marketplace';
import type { NFTRequest } from '../../App';
import { useSupabaseCrud } from '../../hooks';
import { type Student } from '../../types';

interface StudentDashboardProps {
  studentId: string;
  nftRequests: NFTRequest[];
}

type StudentView = 'tokens' | 'nfts' | 'marketplace';

export function StudentDashboard({ studentId, nftRequests }: StudentDashboardProps) {
  const [activeView, setActiveView] = useState<StudentView>('tokens');
  const { data: students, loading, error } = useSupabaseCrud<Student>('students');
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (students) {
      setStudent(students.find(s => s.id === studentId) || null);
    }
  }, [students, studentId]);

  const myNFTs = nftRequests.filter(
    req => req.studentId === studentId && req.status === 'approved'
  );

  const tabs = [
    { id: 'tokens' as StudentView, label: 'Mis Tokens', icon: Coins, color: 'indigo' },
    { id: 'nfts' as StudentView, label: 'Mis Logros NFT', icon: Trophy, color: 'purple' },
    { id: 'marketplace' as StudentView, label: 'Marketplace', icon: ShoppingBag, color: 'pink' },
  ];

  if (loading) {
    return <div className="text-center py-8">Cargando datos del estudiante...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error al cargar datos: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2>¡Hola, {student?.name || 'Estudiante'}! 👋</h2>
        <p className="mt-2 opacity-90">
          Bienvenido a tu panel estudiantil
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Mis Tokens</p>
              <p className="text-indigo-600">{student?.tokens || 0}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <Coins className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">NFTs Obtenidos</p>
              <p className="text-purple-600">{myNFTs.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Ranking</p>
              <p className="text-green-600">#3 en mi grado</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div>
        {activeView === 'tokens' && <MyTokens studentId={studentId} />}
        {activeView === 'nfts' && <MyNFTs nfts={myNFTs} />}
        {activeView === 'marketplace' && <Marketplace studentId={studentId} />}
      </div>
    </div>
  );
}