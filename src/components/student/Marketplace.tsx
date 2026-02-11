import { useState, useEffect } from 'react';
import { Coins, ShoppingBag, CheckCircle } from 'lucide-react';
import { type Reward, type Student } from '../../types';


interface MarketplaceProps {
  studentId: string | undefined; // Assuming studentId is passed as a prop
}

export function Marketplace({ studentId }: MarketplaceProps) {
  // --- Estados Locales del Componente ---
  // Gestionan el comportamiento y la visualización específica del Marketplace.
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null); // Recompensa seleccionada para canjear.
  const [showConfirmation, setShowConfirmation] = useState(false); // Controla la visibilidad de la notificación de éxito.
  // Datos simulados para estudiantes y recompensas. En una app real, vendrían de un contexto o API.
  const mockStudents: Student[] = [
    { id: 'demo-student-id', name: 'Jorge Luis Borges', email: 'jorge.borges@example.com', enrollmentDate: '2023-09-01', tokens: 250, tasksCompleted: 15, nfts: [], grade: '10th' },
  ];

  const mockRewards: Reward[] = [
    { id: 'reward-1', name: 'Certificado de Reconocimiento', description: 'Certificado digital por tu esfuerzo académico.', cost: 50, category: 'Educación', image: '📜', available: 10 },
    { id: 'reward-2', name: 'Descuento en Tienda Escolar', description: '10% de descuento en la tienda de la escuela.', cost: 75, category: 'Alimentos', image: '🛍️', available: 5 },
    { id: 'reward-3', name: 'Pase VIP para Evento', description: 'Acceso exclusivo a un evento escolar.', cost: 100, category: 'Entretenimiento', image: '🌟', available: 3 },
  ];

  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [currentStudent, setCurrentStudent] = useState<Student | undefined>(
    mockStudents.find((s) => s.id === studentId)
  );
  const [userTokens, setUserTokens] = useState(currentStudent?.tokens || 0); // Tokens del estudiante actual.

  const categories = [
    'Todos',
    'Educación',
    'Entretenimiento',
    'Alimentos',
    'Tecnología',
    'Accesorios',
  ];

  const [filterCategory, setFilterCategory] = useState<string>('Todos');

  // Sincroniza los tokens del estudiante con el estado local 'userTokens' cada vez que el 'currentStudent' cambia.
  useEffect(() => {
    if (currentStudent) {
      setUserTokens(currentStudent.tokens);
    }
  }, [currentStudent]);




  // --- Lógica de Filtrado de Recompensas ---
  // Filtra las recompensas mostradas basándose en la categoría seleccionada por el usuario.
  const filteredRewards =
    filterCategory === 'Todos'
      ? rewards
      : rewards.filter((r) => r.category === filterCategory);

  // Maneja la selección inicial de una recompensa para mostrar el modal de confirmación.
  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
  };

  // --- Lógica de Canje de Recompensa ---
  // Esta función simula el proceso de canje.
  // IMPORTANTE: Actualmente, los cambios son solo a nivel de estado local del componente.
  // En una aplicación real, esto implicaría una interacción con un backend o contrato inteligente
  // para actualizar los tokens del estudiante globalmente y registrar el canje.
  const confirmRedeem = async () => {
    if (selectedReward && currentStudent && userTokens >= selectedReward.cost) {
      // Actualizar tokens del estudiante localmente
      setCurrentStudent((prevStudent) => {
        if (prevStudent) {
          const updatedStudent = { ...prevStudent, tokens: prevStudent.tokens - selectedReward.cost };
          setUserTokens(updatedStudent.tokens);
          return updatedStudent;
        }
        return prevStudent;
      });

      // Actualizar el contador de recompensas disponibles localmente
      setRewards((prevRewards) =>
        prevRewards.map((r) =>
          r.id === selectedReward.id
            ? { ...r, available: r.available - 1 }
            : r
        )
      );

      setShowConfirmation(true); // Mostrar notificación de éxito
      setTimeout(() => {
        setShowConfirmation(false); // Ocultar notificación tras 3 segundos
        setSelectedReward(null); // Cerrar modal de confirmación
      }, 3000);
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

      {/* --- Renderizado Condicional de Modales y Notificaciones --- */}
      {/* Modal de Confirmación de Canje */}
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
                <span className={userTokens - selectedReward.cost >= 0 ? 'text-green-600' : 'text-red-600'}>
                  Balance después: {userTokens - selectedReward.cost} tokens
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