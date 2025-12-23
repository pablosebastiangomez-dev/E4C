import { useState } from 'react';
import { Search, Coins, Users, CheckCircle } from 'lucide-react';
import { type Student, type Task, type TokenTransaction } from '../../types';
import { useSupabaseCrud } from '../../hooks';

export function TaskAssignment() {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
    updateItem: updateStudent,
    refresh: refreshStudents,
  } = useSupabaseCrud<Student>('students');

  const {
    data: tasks,
    loading: tasksLoading,
    error: tasksError,
  } = useSupabaseCrud<Task>('tasks');

  const { createItem: createTokenTransaction } = useSupabaseCrud<TokenTransaction>('token_transactions');

  if (studentsLoading || tasksLoading) {
    return <div className="text-center py-8">Cargando asignación de tareas...</div>;
  }

  if (studentsError || tasksError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar datos para asignación: {studentsError || tasksError}
      </div>
    );
  }

  const currentStudents = students || [];
  const currentTasks = tasks || [];

  const filteredStudents = currentStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedStudents.size > 0 && selectedTask) {
      const taskData = currentTasks.find(t => t.id === selectedTask);
      if (!taskData) return;

      try {
        for (const studentId of selectedStudents) {
          const student = currentStudents.find(s => s.id === studentId);
          if (student) {
            // Update student's tokens
            await updateStudent(student.id, {
              tokens: student.tokens + taskData.points,
            });

            // Create a token transaction record
            await createTokenTransaction({
              studentId: student.id,
              studentName: student.name,
              amount: taskData.points,
              type: 'earn',
              description: `Completó tarea: ${taskData.title}`,
              date: new Date().toISOString(),
              teacherId: 'current_teacher_id', // TODO: Get actual teacher ID from auth
              teacherName: 'Current Teacher', // TODO: Get actual teacher name from auth
            });
          }
        }
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedStudents(new Set());
          setSelectedTask('');
          refreshStudents(); // Refresh student data after updates
        }, 2000);
      } catch (error: any) {
        console.error('Error assigning tokens:', error.message);
        // Handle error, e.g., show an error message
      }
    }
  };

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