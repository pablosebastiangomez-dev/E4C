import { useState } from 'react';
import { Coins, Award, History } from 'lucide-react';
import { TaskAssignment } from './TaskAssignment';
import { NFTRequestForm } from './NFTRequestForm';
import { SubmissionHistory } from './SubmissionHistory';
import type { NFTRequest } from '../../App';

interface TeacherDashboardProps {
  nftRequests: NFTRequest[];
  onCreateNFTRequest: (request: Omit<NFTRequest, 'id' | 'requestDate' | 'status' | 'teacherSignature' | 'teacherId' | 'teacherName'>) => void;
}

type TabView = 'tasks' | 'nft-request' | 'history';

export function TeacherDashboard({ nftRequests, onCreateNFTRequest }: TeacherDashboardProps) {
  // Estado para controlar la pestaña activa dentro del dashboard del docente.
  const [activeTab, setActiveTab] = useState<TabView>('tasks');

  // Configuración de las pestañas de navegación para el dashboard.
  // Cada objeto define una pestaña con su ID, etiqueta, icono y color para el estilo.
  const tabs = [
    { id: 'tasks' as TabView, label: 'Asignar Tokens', icon: Coins, color: 'indigo' },
    { id: 'nft-request' as TabView, label: 'Solicitar NFT de Mérito', icon: Award, color: 'purple' },
    { id: 'history' as TabView, label: 'Historial de Envíos', icon: History, color: 'blue' },
  ];

  // Filtra las solicitudes de NFT para mostrar solo las que pertenecen al docente actual.
  // 't1' es un ID de docente simulado para fines de demostración.
  const myRequests = nftRequests.filter(req => req.teacherId === 't1'); // Simular docente actual

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2>Panel de Docente</h2>
        <p className="mt-2 opacity-90">
          Gestiona tokens e incentiva el logro estudiantil
        </p>
      </div>

      {/* Pestañas de Navegación del Dashboard */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* --- Contenido Dinámico del Dashboard --- */}
      {/* Muestra el componente correspondiente (Asignación de Tareas, Formulario de Solicitud de NFT o Historial de Envíos)
          basado en la pestaña 'activeTab' seleccionada. */}
      <div>
        {activeTab === 'tasks' && <TaskAssignment />}
        {activeTab === 'nft-request' && <NFTRequestForm onSubmit={onCreateNFTRequest} />}
        {activeTab === 'history' && <SubmissionHistory requests={myRequests} />}
      </div>
    </div>
  );
}