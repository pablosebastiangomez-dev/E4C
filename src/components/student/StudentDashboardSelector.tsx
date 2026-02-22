import { useState, useEffect } from 'react';
import type { Student, NFTRequest } from '../../types';
import { StudentDashboard } from './StudentDashboard';
import { useAuth } from '../../authContext';

interface StudentDashboardSelectorProps {
  students: Student[];
  nftRequests: NFTRequest[];
}

export function StudentDashboardSelector({
  students,
  nftRequests,
}: StudentDashboardSelectorProps) {
  const { user, switchUserRole } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    user?.id && students.some(s => s.id === user.id) ? user.id : null
  );

  // Initialize with first student if none selected and students available
  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      const firstStudentId = students[0].id;
      setSelectedStudentId(firstStudentId);
      // Update user context to match selected student
      switchUserRole('student', firstStudentId);
    }
  }, [students, selectedStudentId, switchUserRole]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || null;

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    // Update user context when selecting a different student
    switchUserRole('student', studentId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-900 font-semibold mb-3">
          Selecciona un estudiante
        </h3>
        {students.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay estudiantes registrados todavía.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {students.map((student) => {
              const isActive = student.id === selectedStudentId;
              return (
                <button
                  key={student.id}
                  onClick={() => handleStudentSelect(student.id)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap border transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  title={student.email}
                >
                  {student.name}
                  {student.curso && student.division && (
                    <span className="ml-1 text-xs text-gray-300">
                      ({student.curso}° &quot;{student.division}&quot;)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedStudent ? (
        <StudentDashboard
          studentId={selectedStudent.id}
          nftRequests={nftRequests}
        />
      ) : (
        <div className="flex justify-center items-center h-64 text-lg text-gray-600">
          Selecciona un estudiante de la lista superior para ver su dashboard.
        </div>
      )}
    </div>
  );
}
