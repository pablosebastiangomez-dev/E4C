import { supabase } from './supabaseClient';
import { Teacher } from '../types'; // Importar tipo Teacher

export const createTeacher = async (teacherData: {
  name: string;
  email: string;
  curso?: string;
  division?: string;
  escuela?: string;
  stellar_public_key?: string; // Añadir stellar_public_key opcional
}) : Promise<Teacher> => {
  // **Gestión de Clave Pública Stellar para Docentes (Uso Futuro):**
  // Actualmente, los docentes no interactúan directamente con la red Stellar para crear wallets
  // o tokens de la misma manera que los administradores o estudiantes.
  // Sin embargo, se incluye un campo `stellar_public_key` opcional para permitir una futura integración.
  // Esto podría usarse para:
  // - Firmar transacciones en nombre de la institución.
  // - Recibir tokens por tareas de enseñanza.
  // - Gestionar activos específicos en la red Stellar.
  // Por ahora, este campo solo se almacena si se proporciona, pero no se genera ni se usa activamente.

  // 1. Verificar si el profesor ya existe antes de intentar insertar
  const { data: existingTeacher } = await supabase
    .from('teachers') // Asumiendo que existe una tabla 'teachers'
    .select('id')
    .eq('email', teacherData.email)
    .maybeSingle();

  if (existingTeacher) {
    // Lanzamos un error amigable que el frontend pueda capturar
    throw new Error('Este correo electrónico ya está registrado con otro profesor.');
  }

  // 2. Si no existe, procedemos con la inserción
  const { data, error } = await supabase
    .from('teachers') // Asumiendo que existe una tabla 'teachers'
    .insert([teacherData])
    .select()
    .single();

  if (error) {
    console.error("Error original de Supabase:", error);
    throw new Error('No se pudo crear el profesor. Por favor, intenta de nuevo.');
  }

  return data;
};