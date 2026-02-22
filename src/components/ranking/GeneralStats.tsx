import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Zap, CheckCircle } from 'lucide-react';
import type { Student, StudentTask, Task } from '../../types';

interface GeneralStatsProps {
  students: Student[];
  studentTasks: StudentTask[];
  tasks: Task[];
}

export function GeneralStats({ students, studentTasks, tasks }: GeneralStatsProps) {
  // --- Cálculo de KPIs Reales (Enfocados en Tokens) ---
  const totalStudents = students.length;
  const totalTokens = students.reduce((acc, student) => acc + (student.tokens || 0), 0);
  
  const validatedTasks = studentTasks.filter(st => st.status === 'validator_approved');
  const totalValidations = validatedTasks.length;
  const pendingValidations = studentTasks.filter(st => ['completed', 'teacher_approved'].includes(st.status)).length;
  
  const avgTokens = totalStudents > 0 ? Math.round(totalTokens / totalStudents) : 0;

  // --- Lógica para Gráfico de Actividad Semanal ---
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyActivity = last7Days.map(date => {
    const dayTasks = studentTasks.filter(st => st.completed_date?.startsWith(date));
    const dayTokens = dayTasks.reduce((acc, st) => {
      const task = tasks.find(t => t.id === st.task_id);
      return acc + (task?.points || 0);
    }, 0);

    return {
      day: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
      tokens: dayTokens,
      validations: dayTasks.filter(st => st.status === 'validator_approved').length,
    };
  });

  // --- Distribución de E4C por Materia (Suma de puntos reales) ---
  const tokensBySubject = tasks.reduce((acc: any[], task) => {
    const approvedForThisTask = studentTasks.filter(st => st.task_id === task.id && st.status === 'validator_approved');
    const totalPoints = approvedForThisTask.length * (task.points || 0);
    
    if (totalPoints > 0) {
      const existing = acc.find(a => a.name === task.subject);
      if (existing) {
        existing.value += totalPoints;
      } else {
        acc.push({ 
          name: task.subject, 
          value: totalPoints, 
          color: task.subject === 'Matemática' ? '#6366f1' : 
                 task.subject === 'Lengua' ? '#ec4899' : 
                 task.subject === 'Ciencias' ? '#10b981' : '#f59e0b' 
        });
      }
    }
    return acc;
  }, []);

  // --- Insights Dinámicos ---
  const participationRate = totalStudents > 0 
    ? Math.round((students.filter(s => studentTasks.some(st => st.student_id === s.id)).length / totalStudents) * 100) 
    : 0;
  
  const approvalRate = studentTasks.filter(st => st.status !== 'assigned').length > 0
    ? Math.round((validatedTasks.length / studentTasks.filter(st => st.status !== 'assigned').length) * 100)
    : 0;

  const studentsWithBalance = students.filter(s => (s.tokens || 0) > 0).length;
  const studentsWithBalancePercent = totalStudents > 0 ? Math.round((studentsWithBalance / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6" />
            <p className="opacity-90">Estudiantes</p>
          </div>
          <p className="text-3xl font-bold mb-2">{totalStudents}</p>
          <p className="text-sm opacity-75">Activos en la red</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6" />
            <p className="opacity-90">Total E4C</p>
          </div>
          <p className="text-3xl font-bold mb-2">{totalTokens}</p>
          <p className="text-sm opacity-75">Capital social circulante</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6" />
            <p className="opacity-90">Tareas Validadas</p>
          </div>
          <p className="text-3xl font-bold mb-2">{totalValidations}</p>
          <p className="text-sm opacity-75">{pendingValidations} pendientes de sello</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6" />
            <p className="opacity-90">Promedio E4C</p>
          </div>
          <p className="text-3xl font-bold mb-2">{avgTokens}</p>
          <p className="text-sm opacity-75">Por cada estudiante</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-gray-900 font-bold mb-4">Emisión Semanal de E4C</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px' 
                }}
              />
              <Legend />
              <Bar dataKey="tokens" fill="#6366f1" radius={[8, 8, 0, 0]} name="E4C Emitidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-gray-900 font-bold mb-4">Distribución de E4C por Materia</h3>
          {tokensBySubject.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tokensBySubject}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value} E4C`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tokensBySubject.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 italic">
              No hay tokens distribuidos aún.
            </div>
          )}
        </div>
      </div>

      {/* Insights Dinámicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-green-900 font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Análisis de Participación
          </h4>
          <ul className="space-y-2 text-green-800 text-sm">
            <li>• El <strong>{participationRate}%</strong> de los alumnos registrados ya han entregado tareas.</li>
            <li>• Un <strong>{studentsWithBalancePercent}%</strong> de la matrícula ya posee saldo en su billetera Stellar.</li>
            <li>• La tasa de efectividad pedagógica (aprobación) se mantiene en <strong>{approvalRate}%</strong>.</li>
            <li>• Se observa una concentración de actividad en <strong>{tokensBySubject.length}</strong> áreas del conocimiento.</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" /> Métricas Operativas
          </h4>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• <strong>{pendingValidations}</strong> transferencias están en cola de validación técnica.</li>
            <li>• El volumen total de valor educativo generado asciende a <strong>{totalTokens} E4C</strong>.</li>
            <li>• Promedio de recompensas por validación: <strong>{totalValidations > 0 ? Math.round(totalTokens / totalValidations) : 0} E4C</strong>.</li>
            <li>• Diversidad institucional: Alumnos de <strong>{[...new Set(students.map(s => s.escuela))].filter(Boolean).length}</strong> escuelas interactuando.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
