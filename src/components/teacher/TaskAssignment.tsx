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
    if (selectedStudents.size > 0 && selectedTask) {
      try {
        const assignments = Array.from(selectedStudents).map(studentId => ({
          student_id: studentId,
          task_id: selectedTask,
          status: 'assigned',
          assigned_date: new Date().toISOString(),
        }));

        const { error: insError } = await supabase.from('student_tasks').insert(assignments);
        if (insError) throw insError;

        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedStudents(new Set());
        }, 2000);
      } catch (err: any) {
        alert("Error al asignar: " + err.message);
      }
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
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">
              {filteredStudents.length} encontrados
            </span>
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

      {showSuccess && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce font-bold">
          ¡Tarea asignada con éxito!
        </div>
      )}
    </div>
  );
}
