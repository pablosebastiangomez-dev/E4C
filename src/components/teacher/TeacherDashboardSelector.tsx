import { useState, useEffect } from 'react';
import type { Teacher, NFTRequest } from '../../types';
import { TeacherDashboard } from './TeacherDashboard';
import { useAuth } from '../../authContext';

interface TeacherDashboardSelectorProps {
  teachers: Teacher[];
  nftRequests: NFTRequest[];
  onCreateNFTRequest: (request: Omit<NFTRequest, 'id' | 'requestDate' | 'status' | 'teacherSignature' | 'teacherId' | 'teacherName'>) => void;
}

export function TeacherDashboardSelector({
  teachers,
  nftRequests,
  onCreateNFTRequest,
}: TeacherDashboardSelectorProps) {
  const { user, switchUserRole } = useAuth();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    user?.id && teachers.some(t => t.id === user.id) ? user.id : null
  );

  // Initialize with first teacher if none selected and teachers available
  useEffect(() => {
    if (!selectedTeacherId && teachers.length > 0) {
      const firstTeacherId = teachers[0].id;
      setSelectedTeacherId(firstTeacherId);
      // Update user context to match selected teacher
      switchUserRole('teacher', firstTeacherId);
    }
  }, [teachers, selectedTeacherId, switchUserRole]);

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId) || null;

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    // Update user context when selecting a different teacher
    switchUserRole('teacher', teacherId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-900 font-semibold mb-3">
          Selecciona un docente
        </h3>
        {teachers.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay docentes registrados todavía.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {teachers.map((teacher) => {
              const isActive = teacher.id === selectedTeacherId;
              return (
                <button
                  key={teacher.id}
                  onClick={() => handleTeacherSelect(teacher.id)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap border transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  title={teacher.email}
                >
                  {teacher.name}
                  {teacher.curso && teacher.division && (
                    <span className="ml-1 text-xs text-gray-300">
                      ({teacher.curso}° &quot;{teacher.division}&quot;)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedTeacher ? (
        <TeacherDashboard
          teacherId={selectedTeacher.id}
          nftRequests={nftRequests}
          onCreateNFTRequest={onCreateNFTRequest}
        />
      ) : (
        <div className="flex justify-center items-center h-64 text-lg text-gray-600">
          Selecciona un docente de la lista superior para ver su dashboard.
        </div>
      )}
    </div>
  );
}
