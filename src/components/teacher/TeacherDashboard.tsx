import { useState, useEffect, useCallback } from 'react';
import { Coins, Award, History, CheckCircle } from 'lucide-react';
import { TaskAssignment } from './TaskAssignment';
import { NFTRequestForm } from './NFTRequestForm';
import { SubmissionHistory } from './SubmissionHistory';
import { TaskReview } from './TaskReview';
import { supabase } from '../../lib/supabaseClient';
import type { NFTRequest, Teacher, Task } from '../../types';

interface TeacherDashboardProps {
  teacherId?: string; // Make teacherId optional
  nftRequests: NFTRequest[];
  onCreateNFTRequest: (request: Omit<NFTRequest, 'id' | 'requestDate' | 'status' | 'teacherSignature' | 'teacherId' | 'teacherName'>) => void;
}

type TabView = 'assign-tasks' | 'review-tasks' | 'nft-request' | 'history';

export function TeacherDashboard({ teacherId, nftRequests, onCreateNFTRequest }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabView>('assign-tasks');
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [pendingReviewCount, setPendingReviewCount] = useState(0); // New state for the counter

  const fetchPendingReviewCount = useCallback(async () => {
    if (!teacherId) {
      setPendingReviewCount(0);
      return;
    }

    try {
      // 1. Get task IDs created by this teacher
      const { data: teacherTasks, error: teacherTasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('teacherid', teacherId);

      if (teacherTasksError) throw teacherTasksError;

      const teacherTaskIds = teacherTasks.map(t => t.id);

      if (teacherTaskIds.length === 0) {
        setPendingReviewCount(0);
        return;
      }

      // 2. Count student_tasks with status 'completed' and belonging to these tasks
      const { count, error: studentTasksCountError } = await supabase
        .from('student_tasks')
        .select('id', { count: 'exact' })
        .eq('status', 'completed')
        .in('task_id', teacherTaskIds);

      if (studentTasksCountError) throw studentTasksCountError;

      setPendingReviewCount(count || 0);
    } catch (err) {
      console.error('Error fetching pending review count:', err);
      setPendingReviewCount(0);
    }
  }, [teacherId]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!teacherId) { // Handle case where teacherId is not provided
        setTeacherData(null);
        setPendingReviewCount(0); // Reset count if no teacher
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
        setPendingReviewCount(0); // Reset count on error
      } else {
        setTeacherData(teacher as Teacher);
        fetchPendingReviewCount(); // Fetch count after teacher data is loaded
      }
    };

    fetchTeacherData();
  }, [teacherId, fetchPendingReviewCount]); // Add fetchPendingReviewCount to dependencies

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
              {tab.id === 'review-tasks' && pendingReviewCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {pendingReviewCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* --- Contenido Dinámico del Dashboard --- */}
      {/* Muestra el componente correspondiente (Asignación de Tareas, Formulario de Solicitud de NFT o Historial de Envíos)
          basado en la pestaña 'activeTab' seleccionada. */}
      <div>
        {activeTab === 'assign-tasks' && <TaskAssignment teacherId={teacherId} />}
        {activeTab === 'review-tasks' && teacherId && <TaskReview teacherId={teacherId} onTasksReviewed={fetchPendingReviewCount} />} {/* Pass callback */}
        {activeTab === 'nft-request' && <NFTRequestForm onSubmit={onCreateNFTRequest} teacherId={teacherId} />}
        {activeTab === 'history' && <SubmissionHistory requests={myRequests} />}
      </div>
    </div>
  );
}