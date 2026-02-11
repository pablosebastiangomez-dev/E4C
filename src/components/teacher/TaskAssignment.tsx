import { useState, useEffect } from 'react';
import { Coins, Users, CheckCircle, PlusCircle } from 'lucide-react';
import { type Student, type Task } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface TaskAssignmentProps {
  teacherId?: string;
}

export function TaskAssignment({ teacherId }: TaskAssignmentProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [searchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(''); // This will now be controlled by a select
  const [newTaskPoints, setNewTaskPoints] = useState<number>(0);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]); // New state for teacher's subjects

  const fetchStudentsAndTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
      if (studentsError) throw studentsError;
      setStudents(studentsData as Student[]);

      // Fetch tasks
      let taskQuery = supabase.from('tasks').select('*');
      if (teacherId) {
        taskQuery = taskQuery.eq('teacherid', teacherId); // Changed to 'teacherid'
      }
      const { data: tasksData, error: tasksError } = await taskQuery;
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      } else {
        setTasks(tasksData as Task[]);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Error al cargar estudiantes o tareas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndTasks();

    // Fetch teacher's subjects if teacherId is provided
    const fetchTeacherSubjects = async () => {
      if (!teacherId) return;
      const { data, error: teacherError } = await supabase
        .from('teachers')
        .select('subjects')
        .eq('id', teacherId)
        .single();

      if (teacherError) {
        console.error('Error fetching teacher subjects:', teacherError);
      } else if (data && data.subjects) {
        setTeacherSubjects(data.subjects);
      }
    };
    fetchTeacherSubjects();
  }, [teacherId]); // Depend on teacherId to re-fetch subjects

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.grade && student.grade.toLowerCase().includes(searchQuery.toLowerCase()))
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
      const taskData = tasks.find(t => t.id === selectedTask);
                if (!taskData) return;
      
                try {
                  const studentUpdates = Array.from(selectedStudents).map(async studentId => {
                    const studentToUpdate = students.find(s => s.id === studentId);
                    if (!studentToUpdate) return;
      
                    // 1. Insert into student_tasks table
                    const { error: studentTaskInsertError } = await supabase
                      .from('student_tasks')
                      .insert([{
                        student_id: studentId,
                        task_id: selectedTask,
                        status: 'assigned',
                        assigned_date: new Date().toISOString(),
                      }]);
      
                    if (studentTaskInsertError) throw studentTaskInsertError;
      
                    // 2. Update tokens in students table
                    const newTokens = (studentToUpdate.tokens || 0) + taskData.points;
                    const { error: updateError } = await supabase
                      .from('students')
                      .update({ tokens: newTokens })
                      .eq('id', studentId);
      
                    if (updateError) throw updateError;
                  });
      
                  await Promise.all(studentUpdates);
                  fetchStudentsAndTasks();
                  setShowSuccess(true);
                  setTimeout(() => {
                    setShowSuccess(false);
                    setSelectedStudents(new Set());
                    setSelectedTask('');
                  }, 2000);
                } catch (err: any) {
                  setError('Error al asignar tokens: ' + err.message);
                }
              }
            };
  const handleCreateTask = async () => {
    if (newTaskTitle && newTaskSubject && newTaskPoints > 0 && newTaskDueDate && newTaskDescription && teacherId) { // Ensure teacherId is present
      try {
        const { error: insertError } = await supabase
          .from('tasks')
          .insert([{
            id: crypto.randomUUID(), // Generate a unique UUID for the new task
            title: newTaskTitle,
            subject: newTaskSubject,
            points: newTaskPoints,
            duedate: newTaskDueDate,
            status: 'pending',
            description: newTaskDescription,
            teacherid: teacherId, // Include teacherId, matching database column name
          }]);

        if (insertError) throw insertError;
        
        await fetchStudentsAndTasks(); // Re-fetch tasks to update the list

        setNewTaskTitle('');
        setNewTaskSubject('');
        setNewTaskPoints(0);
        setNewTaskDueDate('');
        setNewTaskDescription(''); // Clear new task description
        alert('¡Tarea creada exitosamente!');
      } catch (err: any) {
        setError('Error al crear tarea: ' + err.message);
      }
    } else {
      alert('Por favor, completa todos los campos y asegúrate de que el profesor esté seleccionado.');
    }
  };

  const selectedTaskData = tasks.find(t => t.id === selectedTask);
  const totalTokens = selectedTaskData ? selectedTaskData.points * selectedStudents.size : 0;

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <Users className="text-indigo-600" />
          <span>{students.length} Estudiantes</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <CheckCircle className="text-purple-600" />
          <span>{selectedStudents.size} Seleccionados</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <Coins className="text-green-600" />
          <span>Total: {totalTokens} tokens</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium">Estudiantes</h3>
            <button onClick={toggleAll} className="text-indigo-600 text-sm">Alternar todos</button>
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {filteredStudents.map(student => (
              <div 
                key={student.id} 
                onClick={() => toggleStudent(student.id)}
                className={`p-3 rounded-lg border cursor-pointer ${selectedStudents.has(student.id) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'}`}
              >
                <p className="font-medium">{student.name}</p>
                <p className="text-xs text-gray-500">{student.email} • {student.tokens} tokens</p>
              </div>
            ))}
          </div>
        </div>

        {/* Asignación */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium mb-4">Asignar Tarea</h3>
          <select 
            value={selectedTask} 
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          >
            <option value="">Seleccionar tarea...</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title} ({t.points} pts)</option>
            ))}
          </select>
          <button 
            onClick={handleAssign} 
            className={`w-full text-white p-2 rounded ${selectedStudents.size > 0 && selectedTask ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!(selectedStudents.size > 0 && selectedTask)}
          >
            Asignar Tarea
          </button>
          <div className="mt-8 pt-6 border-t border-gray-200"> {/* Added margin top and border for separation */}
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Crear Nueva Tarea</h3>
            </div>
            <div className="space-y-4"> {/* Use space-y for vertical layout */}
              <div>
                <label htmlFor="newTaskTitle" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" id="newTaskTitle" placeholder="Título de la Tarea" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label htmlFor="newTaskSubject" className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
                <select id="newTaskSubject" value={newTaskSubject} onChange={(e) => setNewTaskSubject(e.target.value)} className="w-full border p-2 rounded">
                  <option value="">Selecciona una Materia</option>
                  {teacherSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="newTaskDescription" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea id="newTaskDescription" placeholder="Descripción de la Tarea" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} rows={3} className="w-full border p-2 rounded resize-y"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Adjusted grid for remaining fields */}
                <div>
                  <label htmlFor="newTaskPoints" className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                  <input type="number" id="newTaskPoints" placeholder="Puntos" value={newTaskPoints} onChange={(e) => setNewTaskPoints(Number(e.target.value))} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label htmlFor="newTaskDueDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
                  <input type="date" id="newTaskDueDate" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>
              <button onClick={handleCreateTask} className="w-full bg-indigo-600 text-white p-2 rounded">Crear Tarea</button>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
          ¡Tarea asignada con éxito!
        </div>
      )}
    </div>
  );
}