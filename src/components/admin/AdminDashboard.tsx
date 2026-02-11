import { useState } from 'react';
import { Users, UserPlus, BookCopy, UserCheck } from 'lucide-react';
import { StudentManagement } from './StudentManagement';
import { TeacherManagement } from './TeacherManagement';
import UserApproval from './UserApproval';
import type { Student, Teacher } from '../../types';

interface AdminDashboardProps {
  students: Student[];
  teachers: Teacher[];
  onCreateStudent: (student: Omit<Student, 'id' | 'tokens' | 'tasksCompleted' | 'nfts' | 'stellar_public_key' | 'enrollmentDate' | 'grade'> & { stellar_public_key: string }) => Promise<void>;
  onCreateTeacher: (teacher: Omit<Teacher, 'id' | 'stellar_public_key'>) => Promise<void>;
}

export function AdminDashboard({ teachers, onCreateTeacher }: AdminDashboardProps) {
  // Estado para controlar la vista activa (pestaña seleccionada).
  const [activeView, setActiveView] = useState<'students' | 'teachers' | 'approve'>('students');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/10 p-3 rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2>Gestión de Usuarios</h2>
            <p className="mt-2 opacity-80">
              Administra estudiantes y docentes del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex gap-2">
        <button
          onClick={() => setActiveView('students')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeView === 'students'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <UserPlus className="w-5 h-5" />
          <span>Gestión de Estudiantes</span>
        </button>
        <button
          onClick={() => setActiveView('teachers')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeView === 'teachers'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BookCopy className="w-5 h-5" />
          <span>Gestión de Docentes</span>
        </button>
        <button
          onClick={() => setActiveView('approve')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeView === 'approve'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>Aprobar Usuarios</span>
        </button>
      </div>

      {/* Contenido dinámico según la vista activa */}
      {/* Aquí se renderiza uno de los tres componentes de gestión basados en el estado 'activeView'. */}
      <div>
        {activeView === 'students' && (
          <StudentManagement />
        )}
        {activeView === 'teachers' && (
          <TeacherManagement teachers={teachers} onCreateTeacher={onCreateTeacher} />
        )}
        {activeView === 'approve' && (
          <UserApproval />
        )}
      </div>
    </div>
  );
}