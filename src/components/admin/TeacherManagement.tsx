import { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import type { Teacher } from '../../data/mockData';

interface TeacherManagementProps {
  teachers: Teacher[];
  onCreateTeacher: (teacher: Omit<Teacher, 'id'>) => void;
}

export function TeacherManagement({ teachers, onCreateTeacher }: TeacherManagementProps) {
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherSubjects, setNewTeacherSubjects] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subjects.join(', ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeacher = () => {
    if (newTeacherName && newTeacherEmail && newTeacherSubjects) {
      onCreateTeacher({
        name: newTeacherName,
        email: newTeacherEmail,
        subjects: newTeacherSubjects.split(',').map(s => s.trim()),
      });
      setNewTeacherName('');
      setNewTeacherEmail('');
      setNewTeacherSubjects('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus className="w-5 h-5 text-purple-600" />
          <h3 className="text-purple-900">Agregar Nuevo Docente</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nombre del docente"
            value={newTeacherName}
            onChange={(e) => setNewTeacherName(e.target.value)}
            className="md:col-span-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="email"
            placeholder="Email del docente"
            value={newTeacherEmail}
            onChange={(e) => setNewTeacherEmail(e.target.value)}
            className="md:col-span-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Materias (separadas por coma)"
            value={newTeacherSubjects}
            onChange={(e) => setNewTeacherSubjects(e.target.value)}
            className="md:col-span-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleCreateTeacher}
            className="md:col-span-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Agregar Docente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-gray-900">Lista de Docentes</h3>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar docente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredTeachers.map(teacher => (
            <div key={teacher.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{teacher.name}</p>
                  <p className="text-sm text-gray-500">{teacher.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{teacher.subjects.join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}