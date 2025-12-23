import { useState, useEffect } from 'react';
import { Coins, ShoppingBag, CheckCircle } from 'lucide-react';
import { type Reward, type Student } from '../../types';
import { useSupabaseCrud } from '../../hooks';

interface MarketplaceProps {
  studentId: string; // Assuming studentId is passed as a prop
}

export function Marketplace({ studentId }: MarketplaceProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userTokens, setUserTokens] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('Todos');

  const {
    data: rewards,
    loading: rewardsLoading,
    error: rewardsError,
    updateItem: updateReward,
    refresh: refreshRewards,
  } = useSupabaseCrud<Reward>('rewards');

  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
    updateItem: updateStudent,
    refresh: refreshStudents,
  } = useSupabaseCrud<Student>('students');

  useEffect(() => {
    if (students && studentId) {
      const currentStudent = students.find((s) => s.id === studentId);
      if (currentStudent) {
        setUserTokens(currentStudent.tokens);
      }
    }
  }, [students, studentId]);

  const categories = [
    'Todos',
    'Educación',
    'Entretenimiento',
    'Alimentos',
    'Tecnología',
    'Accesorios',
  ];

  if (rewardsLoading || studentsLoading) {
    return <div className="text-center py-8">Cargando recompensas...</div>;
  }

  if (rewardsError || studentsError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar recompensas o datos del estudiante: {rewardsError || studentsError}
      </div>
    );
  }

  const currentRewards = rewards || [];
  const currentStudents = students || [];
  const currentStudent = currentStudents.find((s) => s.id === studentId);


  const filteredRewards =
    filterCategory === 'Todos'
      ? currentRewards
      : currentRewards.filter((r) => r.category === filterCategory);

  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
  };

  const confirmRedeem = async () => {
    if (selectedReward && currentStudent && userTokens >= selectedReward.cost) {
      try {
        // Update student tokens
        await updateStudent(currentStudent.id, {
          tokens: userTokens - selectedReward.cost,
        });

        // Update reward available count
        await updateReward(selectedReward.id, {
          available: selectedReward.available - 1,
        });

        setUserTokens((prev) => prev - selectedReward.cost);
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          setSelectedReward(null);
          refreshStudents(); // Refresh student data
          refreshRewards(); // Refresh rewards data
        }, 3000);
      } catch (error: any) {
        console.error('Error redeeming reward:', error.message);
        // Handle error, maybe show a toast notification
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Marketplace de Recompensas</h2>
          <p className="text-gray-600 mt-1">
            Canjea tus tokens por increíbles recompensas
          </p>
        </div>
        <div className="bg-white rounded-xl px-6 py-4 border-2 border-indigo-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-600">Tus Tokens</p>
              <p className="text-indigo-600">{userTokens}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Categoría */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filterCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid de Recompensas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map(reward => {
          const canAfford = userTokens >= reward.cost;
          return (
            <div
              key={reward.id}
              className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                canAfford
                  ? 'border-gray-200 hover:border-indigo-400 hover:shadow-lg'
                  : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 flex items-center justify-center">
                <div className="text-7xl">{reward.image}</div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-gray-900 flex-1">{reward.name}</h4>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs ml-2">
                    {reward.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {reward.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-indigo-600" />
                    <span className={canAfford ? 'text-indigo-600' : 'text-red-600'}>
                      {reward.cost} tokens
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {reward.available} disponibles
                  </span>
                </div>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    canAfford
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{canAfford ? 'Canjear Ahora' : 'Tokens Insuficientes'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Confirmación */}
      {selectedReward && !showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{selectedReward.image}</div>
              <h3 className="text-gray-900 mb-2">Confirmar Canje</h3>
              <p className="text-gray-600">
                ¿Deseas canjear {selectedReward.cost} tokens por esta recompensa?
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-gray-900 mb-2">{selectedReward.name}</h4>
              <p className="text-gray-600 text-sm mb-3">
                {selectedReward.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Costo:</span>
                <span className="text-indigo-600">{selectedReward.cost} tokens</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-600">Balance después:</span>
                <span className={userTokens - selectedReward.cost >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {userTokens - selectedReward.cost} tokens
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRedeem}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Confirmar Canje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de Éxito */}
      {showConfirmation && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-top">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p>¡Canje Exitoso!</p>
            <p className="text-sm opacity-90">
              Recibirás tu código por correo electrónico
            </p>
          </div>
        </div>
      )}
    </div>
  );
}