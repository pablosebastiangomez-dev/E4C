import { useState, useEffect } from 'react';
import { Coins, Award, History, CheckCircle } from 'lucide-react';
import { TaskAssignment } from './TaskAssignment';
import { NFTRequestForm } from './NFTRequestForm';
import { SubmissionHistory } from './SubmissionHistory';
import { TaskReview } from './TaskReview';
import { supabase } from '../../lib/supabaseClient';
import type { NFTRequest, Teacher } from '../../types';

interface TeacherDashboardProps {
  teacherId?: string; // Make teacherId optional
  nftRequests: NFTRequest[];
  onCreateNFTRequest: (request: Omit<NFTRequest, 'id' | 'requestDate' | 'status' | 'teacherSignature' | 'teacherId' | 'teacherName'>) => void;
}

type TabView = 'assign-tasks' | 'review-tasks' | 'nft-request' | 'history';

export function TeacherDashboard({ teacherId, nftRequests, onCreateNFTRequest }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabView>('assign-tasks');
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!teacherId) { // Handle case where teacherId is not provided
        setTeacherData(null);
        return;
      }

      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (error) {
        console.error('Error fetching teacher data:', error);
        setTeacherData(null);
      } else {
        setTeacherData(teacher as Teacher);
      }
    };

    fetchTeacherData();
  }, [teacherId]);

  if (!teacherData) {
    return (
      <div className="flex justify-center items-center h-full text-lg">
        {!teacherId ? 'Selecciona un docente para ver su dashboard.' : 'Cargando datos del docente...'}
      </div>
    );
  }

  // Filtra las solicitudes de NFT para mostrar solo las que pertenecen al docente actual.
  const myRequests = nftRequests.filter(req => teacherId && req.teacherId === teacherId);

  const tabs = [
    { id: 'assign-tasks' as TabView, label: 'Asignar Tareas', icon: Coins, color: 'indigo' },
    { id: 'review-tasks' as TabView, label: 'Corregir Tareas', icon: CheckCircle, color: 'emerald' }, // New tab for task review
    { id: 'nft-request' as TabView, label: 'Solicitar NFT de Mérito', icon: Award, color: 'purple' },
    { id: 'history' as TabView, label: 'Historial de Envíos', icon: History, color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2>Panel de Docente: {teacherData.name}</h2>
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
        {activeTab === 'assign-tasks' && <TaskAssignment teacherId={teacherId} />}
        {activeTab === 'review-tasks' && teacherId && <TaskReview teacherId={teacherId} />} {/* Render TaskReview */}
        {activeTab === 'nft-request' && <NFTRequestForm onSubmit={onCreateNFTRequest} teacherId={teacherId} />}
        {activeTab === 'history' && <SubmissionHistory requests={myRequests} />}
      </div>
    </div>
  );
}