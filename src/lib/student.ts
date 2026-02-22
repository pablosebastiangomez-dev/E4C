import { supabase } from './supabaseClient';
import { Student } from '../types'; // Importar tipo Student

export const createStudent = async (studentData: {
  name: string;
  email: string;
  curso?: string;
  division?: string;
  escuela?: string;
  stellar_public_key?: string; // Añadir stellar_public_key opcional
}): Promise<Student> => {
  // **Gestión de Cuentas Stellar en la Base de Datos:**
  // Este método `createStudent` se encarga de insertar un nuevo estudiante en la tabla `students` de Supabase.
  // Es importante destacar que el `stellar_public_key` del estudiante, generado previamente en el frontend
  // (por ejemplo, en StudentManagement.tsx), se almacena aquí. Esta clave pública es la dirección de su wallet Stellar.
  // La clave secreta NUNCA debe almacenarse en la base de datos ni exponerse en el frontend.

  // 1. Verificar si el estudiante ya existe antes de intentar insertar
  const { data: existingStudent } = await supabase
    .from('students')
    .select('id')
    .eq('email', studentData.email)
    .maybeSingle();

  if (existingStudent) {
    // Lanzamos un error amigable que el frontend pueda capturar
    throw new Error('Este correo electrónico ya está registrado con otro alumno.');
  }

  // 2. Si no existe, procedemos con la inserción
  const { data, error } = await supabase
    .from('students')
    .insert([studentData])
    .select()
    .single();

  if (error) {
    console.error("Error original de Supabase:", error);
    throw new Error('No se pudo crear el estudiante. Por favor, intenta de nuevo.');
  }

  return data;
};