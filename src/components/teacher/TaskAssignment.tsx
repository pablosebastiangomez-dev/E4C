import { useState, useEffect, useCallback } from 'react';
import { Coins, Users, CheckCircle, PlusCircle, Filter } from 'lucide-react';
import { type Student, type Task, type Teacher } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../authContext';

interface TaskAssignmentProps {
  teacherId?: string;
}

export function TaskAssignment({ teacherId }: TaskAssignmentProps) {
  const { allStudents } = useAuth();
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Filtro de Contexto
  const [filterSubject, setFilterSubject] = useState('');
  const [filterCurso, setFilterCurso] = useState('');
  const [filterDivision, setFilterDivision] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState<number>(0);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  useEffect(() => {
    const loadTeacherAndTasks = async () => {
      if (!teacherId) return;
      setLoading(true);
      try {
        const { data: tData } = await supabase.from('teachers').select('*').eq('id', teacherId).single();
        if (tData) {
          setTeacherData(tData as Teacher);
          setFilterCurso(tData.curso || '');
          setFilterDivision(tData.division || '');
        }

        const { data: tTasks } = await supabase.from('tasks').select('*').eq('teacherid', teacherId);
        setTasks(tTasks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTeacherAndTasks();
  }, [teacherId]);

  // Lógica de filtrado de alumnos: Solo de la misma escuela Y que coincidan con los filtros seleccionados
  const filteredStudents = allStudents.filter(student => {
    if (!teacherData) return false;
    
    const matchEscuela = student.escuela === teacherData.escuela;
    const matchCurso = filterCurso ? student.curso === filterCurso : true;
    const matchDivision = filterDivision ? student.division === filterDivision : true;
    
    return matchEscuela && matchCurso && matchDivision;
  });

  const handleAssign = async () => {
    if (selectedStudents.size === 0 || !selectedTask) {
      setError("Por favor, selecciona al menos un alumno y una tarea.");
      return;
    }
    setError(null);
    setShowSuccess(false);

    let successfullyAssignedStudents: string[] = [];
    let alreadyAssignedStudents: string[] = [];

    const assignmentsToAttempt = Array.from(selectedStudents).map(studentId => ({
      student_id: studentId,
      task_id: selectedTask,
      status: 'assigned',
      assigned_date: new Date().toISOString(),
    }));

    try {
      // Attempt to insert all selected assignments
      const { data: insertedData, error: insError } = await supabase
        .from('student_tasks')
        .insert(assignmentsToAttempt)
        .select('student_id'); // Select student_id of successfully inserted rows

      if (insError) {
        if (insError.code === '23505') { // PostgreSQL unique_violation error code
          // This is a unique constraint violation, meaning some tasks were already assigned.
          // We need to figure out which ones failed and which (if any) succeeded.
          // Supabase insert with 'onConflict' or 'ignoreDuplicates' would be ideal,
          // but current version of supabase-js insert doesn't support returning affected rows easily for partial failures.
          // So, we'll re-query to find out which ones already existed.
          
          const { data: existingAssignments, error: queryError } = await supabase
            .from('student_tasks')
            .select('student_id')
            .eq('task_id', selectedTask)
            .in('student_id', Array.from(selectedStudents));

          if (queryError) {
            console.error("Error al verificar asignaciones existentes después de un conflicto:", queryError);
            setError("Error interno al verificar asignaciones existentes.");
            return;
          }
          
          const existingStudentIdsSet = new Set(existingAssignments.map(sa => sa.student_id));
          
          alreadyAssignedStudents = Array.from(selectedStudents).filter(studentId => existingStudentIdsSet.has(studentId));
          successfullyAssignedStudents = Array.from(selectedStudents).filter(studentId => !existingStudentIdsSet.has(studentId));

        } else {
          // Other types of insertion errors
          console.error("Error al asignar tarea:", insError);
          setError("Error al asignar tarea: " + insError.message);
          return;
        }
      } else {
        // All assignments were successful
        successfullyAssignedStudents = insertedData.map(d => d.student_id);
      }

      let feedbackMessage = '';
      if (successfullyAssignedStudents.length > 0 && alreadyAssignedStudents.length === 0) {
        feedbackMessage = `¡Tarea asignada a ${successfullyAssignedStudents.length} alumno(s) con éxito!`;
      } else if (successfullyAssignedStudents.length > 0 && alreadyAssignedStudents.length > 0) {
        feedbackMessage = `Tarea asignada a ${successfullyAssignedStudents.length} alumno(s). ${alreadyAssignedStudents.length} alumno(s) ya tenían esta tarea asignada.`;
      } else if (successfullyAssignedStudents.length === 0 && alreadyAssignedStudents.length > 0) {
        feedbackMessage = `${alreadyAssignedStudents.length} alumno(s) ya tenían esta tarea asignada.`;
      } else {
        feedbackMessage = "No se realizaron nuevas asignaciones.";
      }
      
      setError(null); // Clear previous error
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedStudents(new Set());
      }, 3000); // Show success message a bit longer

      // Use a custom toast or notification instead of alert for better UX
      // For now, let's update the error state to display the feedback message in the UI's error component.
      // If no real error, we just show success.
      if (alreadyAssignedStudents.length > 0) {
        setError(feedbackMessage); // Display feedback for partially failed/already assigned
      } else {
        setError(null); // Ensure error is clear for full success
      }

    } catch (err: any) {
      console.error("Error al asignar tarea:", err);
      setError("Error al asignar tarea: " + err.message);
    }
  };

  const handleSelectAll = () => {
    const allFilteredStudentIds = new Set(filteredStudents.map(s => s.id));
    if (selectedStudents.size === filteredStudents.length && filteredStudents.length > 0) {
      // All selected, deselect all
      setSelectedStudents(new Set());
    } else {
      // Not all selected, select all
      setSelectedStudents(allFilteredStudentIds);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle || !filterSubject || newTaskPoints <= 0 || !teacherId) {
      alert("Completa los datos de la tarea y selecciona una materia");
      return;
    }

    try {
      const { data, error: insError } = await supabase.from('tasks').insert([{
        id: crypto.randomUUID(),
        title: newTaskTitle,
        subject: filterSubject,
        points: newTaskPoints,
        duedate: newTaskDueDate,
        description: newTaskDescription,
        teacherid: teacherId,
        status: 'pending'
      }]).select().single();

      if (insError) throw insError;
      setTasks([...tasks, data]);
      
      // Blanquear todos los campos
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPoints(0);
      setNewTaskDueDate('');
      setFilterSubject(''); // También reseteamos la materia seleccionada para forzar nueva elección
      
      alert("Tarea creada correctamente");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div className="p-12 text-center">Cargando contexto del docente...</div>;

  return (
    <div className="space-y-6">
      {/* Selector de Contexto (Filtros) */}
      <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold">
          <Filter size={20} />
          <h3>Filtrar Alumnos por Grupo</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Materia</label>
            <select 
              value={filterSubject} 
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar Materia...</option>
              {teacherData?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Curso</label>
            <select 
              value={filterCurso} 
              onChange={(e) => setFilterCurso(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg"
            >
              <option value="primero">Primero</option>
              <option value="segundo">Segundo</option>
              <option value="tercero">Tercero</option>
              <option value="cuarto">Cuarto</option>
              <option value="quinto">Quinto</option>
              <option value="sexto">Sexto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">División</label>
            <input 
              type="text" 
              value={filterDivision} 
              onChange={(e) => setFilterDivision(e.target.value)}
              placeholder="Ej: 1"
              className="w-full p-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Alumnos Filtrada */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Alumnos en {teacherData?.escuela}</h3>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="selectAllStudents"
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                onChange={handleSelectAll}
              />
              <label htmlFor="selectAllStudents" className="text-sm font-medium text-gray-700">Seleccionar Todos</label>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">
                {filteredStudents.length} encontrados
              </span>
            </div>
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No hay alumnos que coincidan con el filtro en tu escuela.</p>
            ) : (
              filteredStudents.map(student => (
                <div 
                  key={student.id} 
                  onClick={() => {
                    const newSet = new Set(selectedStudents);
                    newSet.has(student.id) ? newSet.delete(student.id) : newSet.add(student.id);
                    setSelectedStudents(newSet);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedStudents.has(student.id) ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.curso}° "{student.division}"</p>
                    </div>
                    {selectedStudents.has(student.id) && <CheckCircle className="text-indigo-600" size={20} />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

                {/* Acciones de Tarea */}
                <div className="space-y-6">
                  <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><CheckCircle size={18} /> Asignar Existente</h3>
                    <select 
                      value={selectedTask} 
                      onChange={e => setSelectedTask(e.target.value)}
                      className="w-full p-2 border-none rounded-lg text-gray-900 text-sm mb-4"
                    >
                      <option value="">Seleccionar tarea...</option>
                      {tasks.filter(t => !filterSubject || t.subject === filterSubject).map(t => (
                        <option key={t.id} value={t.id}>{t.title} ({t.points} E4C)</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAssign}
                      disabled={selectedStudents.size === 0 || !selectedTask}
                      className="w-full bg-white text-indigo-600 py-3 rounded-lg font-bold hover:bg-indigo-50 disabled:opacity-50 transition-all"
                    >
                      Asignar a {selectedStudents.size} Alumnos
                    </button>
                  </div>
        
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-green-600" /> Crear Tarea</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Título (Ej: TP 1)" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                      
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Materia</label>
                        <select 
                          value={filterSubject} 
                          onChange={(e) => setFilterSubject(e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        >
                          <option value="">Seleccionar Materia...</option>
                          {teacherData?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
        
                      <textarea placeholder="Descripción (Ej: Números Naturales)" value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} className="w-full p-2 border rounded-lg text-sm" rows={2} />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tokens E4C</label>
                          <select 
                            value={newTaskPoints} 
                            onChange={e => setNewTaskPoints(Number(e.target.value))} 
                            className="w-full p-2 border rounded-lg text-sm bg-white"
                          >
                            <option value="0" disabled>Tokens...</option>
                            <option value="5">5 E4C</option>
                            <option value="10">10 E4C</option>
                            <option value="15">15 E4C</option>
                            <option value="20">20 E4C</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha Límite</label>
                          <input type="date" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                      </div>
                      <button onClick={handleCreateTask} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors">Crear Nueva</button>
                    </div>
                  </div>
                </div>
        
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce font-bold">
          ¡Tarea asignada con éxito!
        </div>
      )}
    </div>
  );
}
