import { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import type { Student } from '../../data/mockData';

interface StudentManagementProps {
  students: Student[];
  onCreateStudent: (student: Omit<Student, 'id' | 'tokens' | 'tasksCompleted' | 'nfts'>) => void;
}

export function StudentManagement({ students, onCreateStudent }: StudentManagementProps) {
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateStudent = () => {
    if (newStudentName && newStudentEmail && newStudentGrade) {
      onCreateStudent({
        name: newStudentName,
        email: newStudentEmail,
        grade: newStudentGrade,
      });
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentGrade('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus className="w-5 h-5 text-indigo-600" />
          <h3 className="text-indigo-900">Agregar Nuevo Estudiante</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nombre del estudiante"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="md:col-span-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Email del estudiante"
            value={newStudentEmail}
            onChange={(e) => setNewStudentEmail(e.target.value)}
            className="md:col-span-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Grado"
            value={newStudentGrade}
            onChange={(e) => setNewStudentGrade(e.target.value)}
            className="md:col-span-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleCreateStudent}
            className="md:col-span-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Agregar Estudiante
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-gray-900">Lista de Estudiantes</h3>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredStudents.map(student => (
            <div key={student.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{student.grade}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}