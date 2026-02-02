import { useState } from 'react';
import { Search, Coins, Users, CheckCircle } from 'lucide-react';
import { type Student, type Task, type TokenTransaction } from '../../types';


export function TaskAssignment() {
  // --- Estados Locales del Componente ---
  // `selectedStudents`: Un Set para almacenar los IDs de los estudiantes seleccionados para la asignación.
  // `selectedTask`: El ID de la tarea seleccionada en el dropdown.
  // `searchQuery`: Texto para filtrar la lista de estudiantes.
  // `showSuccess`: Controla la visibilidad de la notificación de éxito.
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // --- Datos Simulados (Mock Data) ---
  // Estos datos representan estudiantes y tareas disponibles.
  // IMPORTANTE: Los cambios realizados en este componente son LOCALES
  // y no se propagan al estado global de la aplicación (e.g., App.tsx).
  // En una aplicación real, se usaría un contexto o un servicio de API
  // para gestionar el estado global.
  const initialStudents: Student[] = [
    { id: 'student-1', name: 'Alice Smith', email: 'alice.smith@example.com', tokens: 150, tasksCompleted: 10, nfts: [], grade: '10th' },
    { id: 'student-2', name: 'Bob Johnson', email: 'bob.johnson@example.com', tokens: 200, tasksCompleted: 12, nfts: [], grade: '11th' },
    { id: 'student-3', name: 'Charlie Brown', email: 'charlie.brown@example.com', tokens: 75, tasksCompleted: 5, nfts: [], grade: '9th' },
  ];

  const initialTasks: Task[] = [
    { id: 'task-1', title: 'Ensayo sobre Historia Antigua', subject: 'Historia', dueDate: '2024-03-15', points: 50, status: 'pending' },
    { id: 'task-2', title: 'Resolución de Problemas de Álgebra', subject: 'Matemáticas', dueDate: '2024-03-10', points: 30, status: 'pending' },
    { id: 'task-3', title: 'Proyecto de Ciencias: Sistema Solar', subject: 'Ciencias', dueDate: '2024-03-20', points: 100, status: 'pending' },
  ];

  const [currentStudents, setCurrentStudents] = useState<Student[]>(initialStudents);
  const [currentTasks, setCurrentTasks] = useState<Task[]>(initialTasks);

  // --- Lógica de Filtrado de Estudiantes ---
  // Filtra la lista de estudiantes basándose en la cadena de búsqueda.
  const filteredStudents = currentStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Funciones de Selección de Estudiantes ---
  // `toggleStudent`: Añade o quita un estudiante individual del Set de seleccionados.
  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // `toggleAll`: Selecciona o deselecciona todos los estudiantes filtrados.
  const toggleAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set()); // Deseleccionar todos
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id))); // Seleccionar todos
    }
  };

  // --- Lógica de Asignación de Tokens ---
  // Asigna tokens a los estudiantes seleccionados por la tarea elegida.
  // Los cambios son locales al estado de este componente.
  const handleAssign = async () => {
    if (selectedStudents.size > 0 && selectedTask) {
      const taskData = currentTasks.find(t => t.id === selectedTask);
      if (!taskData) return;

      try {
        setCurrentStudents(prevStudents =>
          prevStudents.map(student => {
            if (selectedStudents.has(student.id)) {
              return {
                ...student,
                tokens: student.tokens + taskData.points, // Actualiza los tokens localmente
              };
            }
            return student;
          })
        );
        setShowSuccess(true); // Muestra la notificación de éxito
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedStudents(new Set()); // Limpia la selección
          setSelectedTask(''); // Limpia la tarea seleccionada
        }, 2000);
      } catch (error: any) {
        console.error('Error assigning tokens:', error.message);
      }
    }
  };

  // --- Cálculos Dinámicos ---
  // Calcula los tokens totales a asignar basándose en la tarea y estudiantes seleccionados.
  const selectedTaskData = currentTasks.find(t => t.id === selectedTask);
  const totalTokens = selectedTaskData ? selectedTaskData.points * selectedStudents.size : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Estudiantes</p>
              <p className="text-gray-900">{currentStudents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Seleccionados</p>
              <p className="text-gray-900">{selectedStudents.size}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Coins className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total a Asignar</p>
              <p className="text-gray-900">{totalTokens}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Estudiantes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Lista de Estudiantes</h3>
              <button
                onClick={toggleAll}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {selectedStudents.size === filteredStudents.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o grado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {filteredStudents.map(student => {
              const isSelected = selectedStudents.has(student.id);
              return (
                <button
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.grade} • {student.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Balance actual</p>
                      <p className="text-indigo-600">{student.tokens} tokens</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de Asignación */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="text-gray-900">Asignar Tokens</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Selecciona la Tarea
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Seleccionar --</option>
                {currentTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} (+{task.points} tokens)
                  </option>
                ))}
              </select>
            </div>

            {selectedTaskData && (
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <p className="text-sm text-gray-600 mb-2">Resumen de Asignación</p>
                <div className="space-y-1">
                  <p className="text-gray-900">
                    {selectedStudents.size} estudiante{selectedStudents.size !== 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-900">
                    {selectedTaskData.points} tokens c/u
                  </p>
                  <div className="pt-2 border-t border-indigo-300">
                    <p className="text-indigo-600">
                      Total: {totalTokens} tokens
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAssign}
              disabled={selectedStudents.size === 0 || !selectedTask}
              className={`w-full py-3 rounded-lg transition-all ${
                selectedStudents.size > 0 && selectedTask
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Asignar Tokens
            </button>

            <p className="text-xs text-gray-500 text-center">
              Los tokens se acreditarán instantáneamente
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-top">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p>¡Tokens Asignados!</p>
            <p className="text-sm opacity-90">
              {selectedStudents.size} estudiante{selectedStudents.size !== 1 ? 's' : ''} ha{selectedStudents.size !== 1 ? 'n' : ''} recibido {selectedTaskData?.points} tokens
            </p>
          </div>
        </div>
      )}
    </div>
  );
}