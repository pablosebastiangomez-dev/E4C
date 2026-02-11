import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { StudentTask, Task, Student, Teacher } from '../../types';
import { CheckCircle, Clock, XCircle, User, BookOpen } from 'lucide-react';

interface TaskReviewProps {
  teacherId: string;
}

export function TaskReview({ teacherId }: TaskReviewProps) {
  const [studentTasksToReview, setStudentTasksToReview] = useState<StudentTask[]>([]);
  const [tasksDetails, setTasksDetails] = useState<Map<string, Task>>(new Map());
  const [studentsDetails, setStudentsDetails] = useState<Map<string, Student>>(new Map());
  const [teacherDetail, setTeacherDetail] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasksForReview = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch teacher details
      const { data: currentTeacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single();
      
      if (teacherError) throw teacherError;
      setTeacherDetail(currentTeacher as Teacher);

      // 1. Fetch student_tasks that are 'completed'
      const { data: studentTasksData, error: studentTasksError } = await supabase
        .from('student_tasks')
        .select('*')
        .eq('status', 'completed'); // Only fetch tasks marked as completed by students

      if (studentTasksError) throw studentTasksError;

      // Filter by tasks created by this teacher
      const { data: teacherTasks, error: teacherTasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('teacherid', teacherId);

      if (teacherTasksError) throw teacherTasksError;

      const teacherTaskIds = new Set(teacherTasks.map(t => t.id));
      const filteredStudentTasks = studentTasksData.filter(st => teacherTaskIds.has(st.task_id));

      setStudentTasksToReview(filteredStudentTasks || []);

      // 2. Collect unique task_ids and student_ids
      const uniqueTaskIds = [...new Set(filteredStudentTasks.map(st => st.task_id))];
      const uniqueStudentIds = [...new Set(filteredStudentTasks.map(st => st.student_id))];

      // 3. Fetch details for these tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', uniqueTaskIds);

      if (tasksError) throw tasksError;

      const detailsMap = new Map<string, Task>();
      tasksData.forEach(task => detailsMap.set(task.id, task as Task));
      setTasksDetails(detailsMap);

      // 4. Fetch details for these students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', uniqueStudentIds);

      if (studentsError) throw studentsError;

      const studentsMap = new Map<string, Student>();
      studentsData.forEach(student => studentsMap.set(student.id, student as Student));
      setStudentsDetails(studentsMap);

    } catch (err: any) {
      console.error('Error fetching tasks for review:', err);
      setError('Error al cargar las tareas para revisión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksForReview();
  }, [teacherId]);

  const handleApproveTask = async (studentTaskId: string, taskPoints: number, studentIdToUpdate: string) => {
    try {
      // 1. Update student_task status
      const { error: updateError } = await supabase
        .from('student_tasks')
        .update({ status: 'teacher_approved' })
        .eq('id', studentTaskId);

      if (updateError) throw updateError;

      // 2. Update student's tokens and tasks_completed
      const studentToUpdate = studentsDetails.get(studentIdToUpdate);
      // Ensure teacherDetail and taskDetail are available for NFTRequest
      const taskDetail = tasksDetails.get(studentTasksToReview.find(st => st.id === studentTaskId)?.task_id || '');

      if (!studentToUpdate || !teacherDetail || !taskDetail) {
        console.error("Missing student, teacher, or task details for NFT request creation.");
        return;
      }
      
      const newTokens = (studentToUpdate.tokens || 0) + taskPoints;
      const newTasksCompleted = (studentToUpdate.tasksCompleted || 0) + 1;
      const { error: studentUpdateError } = await supabase
        .from('students')
        .update({ tokens: newTokens, tasksCompleted: newTasksCompleted })
        .eq('id', studentIdToUpdate);
      if (studentUpdateError) throw studentUpdateError;
      
      alert('Tarea aprobada y tokens asignados al estudiante.');

      // 3. Create NFTRequest for validator flow
      const newNFTRequest = {
        id: crypto.randomUUID(),
        studentId: studentToUpdate.id,
        studentName: studentToUpdate.name,
        achievementName: `Completó: ${taskDetail.title}`,
        description: taskDetail.description,
        evidence: `Tarea #${taskDetail.id} completada por ${studentToUpdate.name} y aprobada por el docente.`, // Placeholder evidence
        requestDate: new Date().toISOString(),
        teacherName: teacherDetail.name, // Assuming teacherDetail is available
        teacherId: teacherDetail.id, // Assuming teacherDetail is available
        status: 'pending-validator',
        teacherSignature: {
          name: teacherDetail.name,
          timestamp: new Date().toISOString(),
        },
      };

      const { error: nftRequestError } = await supabase
        .from('nft_requests')
        .insert([newNFTRequest]);

      if (nftRequestError) throw nftRequestError;
      alert('Solicitud de NFT enviada al validador.');

      fetchTasksForReview(); // Re-fetch to update the list
    } catch (err: any) {
      console.error('Error approving task:', err);
      setError('Error al aprobar la tarea.');
    }
  };

  const handleRejectTask = async (studentTaskId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('student_tasks')
        .update({ status: 'rejected_by_teacher' })
        .eq('id', studentTaskId);

      if (updateError) throw updateError;
      alert('Tarea rechazada.');
      fetchTasksForReview(); // Re-fetch to update the list
    } catch (err: any) {
      console.error('Error rejecting task:', err);
      setError('Error al rechazar la tarea.');
    }
  };

  const getStatusBadge = (status: StudentTask['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
            <Clock className="inline w-3 h-3 mr-1" />
            Pendiente de tu revisión
          </span>
        );
      case 'teacher_approved':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
            <CheckCircle className="inline w-3 h-3 mr-1" />
            Aprobada por ti
          </span>
        );
      case 'rejected_by_teacher':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
            <XCircle className="inline w-3 h-3 mr-1" />
            Rechazada por ti
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="text-center py-4">Cargando tareas para revisión...</div>;
  if (error) return <div className="text-center py-4 text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {studentTasksToReview.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay tareas pendientes de revisión.
        </div>
      ) : (
        studentTasksToReview.map(st => {
          const taskDetail = tasksDetails.get(st.task_id);
          const studentDetail = studentsDetails.get(st.student_id);

          if (!taskDetail || !studentDetail) return null;

          return (
            <div key={st.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{taskDetail.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <User className="w-4 h-4" /> {studentDetail.name} ({studentDetail.email})
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <BookOpen className="w-4 h-4" /> {taskDetail.subject} - {taskDetail.points} puntos
                  </p>
                  <p className="text-sm text-gray-500 ml-5">
                    Completada: {new Date(st.completed_date || '').toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(st.status)}
              </div>
              
              {st.status === 'completed' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApproveTask(st.id, taskDetail.points, studentDetail.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Aprobar Tarea
                  </button>
                  <button
                    onClick={() => handleRejectTask(st.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Rechazar Tarea
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}