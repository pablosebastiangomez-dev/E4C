// src/components/student/StudentProfileSettings.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../authContext';
import type { Student } from '../../types';
import { User, Save, XCircle } from 'lucide-react';

interface StudentProfileSettingsProps {
  studentId: string;
}

export function StudentProfileSettings({ studentId }: StudentProfileSettingsProps) {
  const { allStudents } = useAuth(); // Para actualizar potencialmente la lista de estudiantes si es necesario
  const [student, setStudent] = useState<Student | null>(null);
  const [alias, setAlias] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) {
        setError(error.message);
        setStudent(null);
      } else {
        setStudent(data as Student);
        setAlias(data.alias || ''); // Establecer el alias actual o una cadena vacía si es nulo
        setError(null);
      }
      setLoading(false);
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const handleSaveAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!alias.trim()) {
      setError('El alias no puede estar vacío.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .update({ alias: alias.trim() })
        .eq('id', studentId)
        .select(); // Seleccionar la fila actualizada para obtener datos recientes

      if (error) {
        if (error.code === '23505') { // Código de error de violación de unicidad para PostgreSQL
          setError('Este alias ya está en uso. Por favor, elige otro.');
        } else {
          setError(error.message);
        }
      } else {
        setStudent(data[0] as Student); // Actualizar el estado del estudiante local
        setSuccess('¡Alias guardado con éxito!');
        // Opcionalmente, activar una actualización de los datos del estudiante en authContext o en el padre
        // si la lista de allStudents necesita reflejar el nuevo alias inmediatamente.
        // Por ahora, se asume que es principalmente para visualización y se volverá a cargar en la próxima carga.
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Cargando configuración del perfil...</div>;
  if (error && !student) return <div className="flex items-center justify-center p-8 text-red-600"><XCircle className="mr-2"/> Error: {error}</div>;
  if (!student) return <div className="text-center p-8 text-gray-500">No se encontraron datos de estudiante.</div>;


  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <User className="mr-3 text-indigo-600" size={24} /> Configuración de Perfil
      </h3>
      <form onSubmit={handleSaveAlias} className="space-y-5 max-w-lg">
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Alumno (no editable públicamente)
          </label>
          <input
            type="text"
            id="studentName"
            value={student.name}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
          />
        </div>
        <div>
          <label htmlFor="studentAlias" className="block text-sm font-medium text-gray-700 mb-1">
            Alias Público
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Este alias se mostrará en los rankings públicos y tablas de líderes. Tu nombre real solo será visible para administradores y docentes.
          </p>
          <input
            type="text"
            id="studentAlias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
            placeholder="Introduce tu alias público"
            maxLength={30} // Limitar la longitud del alias
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <XCircle className="mr-1" size={16} /> {error}
            </p>
          )}
          {success && (
            <p className="mt-2 text-sm text-green-600">
              {success}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        >
          {loading ? 'Guardando...' : <><Save className="mr-2" size={20} /> Guardar Alias</>}
        </button>
      </form>
    </div>
  );
}