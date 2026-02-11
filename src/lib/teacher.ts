import { supabase } from './supabaseClient';
import { Teacher } from '../types'; // Import Teacher type

export const createTeacher = async (teacherData: {
  name: string;
  email: string;
  curso?: string;
  division?: string;
  escuela?: string;
  stellar_public_key?: string; // Add optional stellar_public_key
}) : Promise<Teacher> => {
  // 1. Verificar si el profesor ya existe antes de intentar insertar
  const { data: existingTeacher } = await supabase
    .from('teachers') // Assuming a 'teachers' table exists
    .select('id')
    .eq('email', teacherData.email)
    .maybeSingle();

  if (existingTeacher) {
    // Lanzamos un error amigable que el frontend pueda capturar
    throw new Error('Este correo electrónico ya está registrado con otro profesor.');
  }

  // 2. Si no existe, procedemos con la inserción
  const { data, error } = await supabase
    .from('teachers') // Assuming a 'teachers' table exists
    .insert([teacherData])
    .select()
    .single();

  if (error) {
    console.error("Error original de Supabase:", error);
    throw new Error('No se pudo crear el profesor. Por favor, intenta de nuevo.');
  }

  return data;
};