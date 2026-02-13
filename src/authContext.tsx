import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, Student, Teacher, Admin, Validator } from './types';
import { supabase } from './lib/supabaseClient'; // Import supabase client

// Mock types for Session and User
interface User {
  id: string;
  app_metadata: {
    provider?: string;
  };
  user_metadata: {
    role?: UserRole;
    name?: string;
    email?: string;
    [key: string]: any;
  };
  aud: string;
  created_at: string;
  [key: string]: any;
}

interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: () => Promise<{ user: User | null; session: Session | null }>;
  signUp: () => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
  switchUserRole: (role: UserRole, id?: string) => void;
  allStudents: Student[];
  allTeachers: Teacher[];
  allAdmins: Admin[];
  allValidators: Validator[];
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const [allValidators, setAllValidators] = useState<Validator[]>([]);

  const signIn = async () => {
    return Promise.resolve({ user, session });
  };

  const signUp = async () => {
    return Promise.resolve({ user, session });
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    return Promise.resolve();
  };

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    let currentStudents: Student[] = [];

    const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
    if (studentsError) {
      console.error('Error fetching students:', studentsError);
    } else {
      setAllStudents(studentsData as Student[]);
      currentStudents = studentsData as Student[];
    }

    const { data: teachersData, error: teachersError } = await supabase.from('teachers').select('*');
    if (teachersError) {
      console.error('Error fetching teachers:', teachersError);
    } else {
      setAllTeachers(teachersData as Teacher[]);
    }
    
    const { data: adminsData, error: adminsError } = await supabase.from('admins').select('*');
    if (adminsError) {
      console.error('Error fetching admins:', adminsError);
    } else {
      setAllAdmins(adminsData as Admin[]);
    }
    
    const { data: validatorsData, error: validatorsError } = await supabase.from('validators').select('*');
    if (validatorsError) {
      console.error('Error fetching validators:', validatorsError);
    } else {
      setAllValidators(validatorsData as Validator[]);
    }
    setLoading(false);
    return currentStudents;
  }, []);

  const switchUserRole = (role: UserRole, id?: string) => {
    let selectedUser: User | null = null;
    let userMetadata: { role: UserRole; [key: string]: any } = { role };

    if (role === 'student') {
      const studentIdToUse = id || (allStudents.length > 0 ? allStudents[0].id : undefined);
      if (studentIdToUse) {
        const student = allStudents.find(s => s.id === studentIdToUse);
        if (student) {
          selectedUser = {
            id: student.id,
            app_metadata: {},
            user_metadata: { ...userMetadata, name: student.name, email: student.email },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          };
        }
      }
    } else if (role === 'teacher') {
      const teacherIdToUse = id || (allTeachers.length > 0 ? allTeachers[0].id : undefined);
      if (teacherIdToUse) {
        const teacher = allTeachers.find(t => t.id === teacherIdToUse);
        if (teacher) {
          selectedUser = {
            id: teacher.id,
            app_metadata: {},
            user_metadata: { ...userMetadata, name: teacher.name, email: teacher.email },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          };
        }
      }
    } else if (role === 'admin') {
      let admin = null;
      if (id) {
        admin = allAdmins.find(a => a.id === id);
      } else if (allAdmins.length > 0) {
        admin = allAdmins[0];
      }

      if (admin) {
        selectedUser = {
          id: admin.id,
          app_metadata: {},
          user_metadata: { ...userMetadata, name: admin.name, email: admin.email },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
      } else {
        selectedUser = {
          id: `mock-admin-id-${Date.now()}`,
          app_metadata: {},
          user_metadata: { ...userMetadata, name: "Admin (Mock)", email: "mock@admin.com" },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
      }
    } else if (role === 'validator') {
      const validatorIdToUse = id || (allValidators.length > 0 ? allValidators[0].id : undefined);
      if (validatorIdToUse) {
        const validator = allValidators.find(v => v.id === validatorIdToUse);
        if (validator) {
          selectedUser = {
            id: validator.id,
            app_metadata: {},
            user_metadata: { ...userMetadata, name: validator.name, email: validator.email },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          };
        }
      }
    } else {
      selectedUser = {
        id: `mock-${role}-id`,
        app_metadata: {},
        user_metadata: userMetadata,
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
    }
    setUser(selectedUser);

  };

  useEffect(() => {
    const initialLoad = async () => {
      const studentsForInitialUser = await refreshUsers();
      
      if (studentsForInitialUser && studentsForInitialUser.length > 0) {
        const initialStudent = studentsForInitialUser[0];
        const initialUser = {
          id: initialStudent.id,
          app_metadata: {},
          user_metadata: { role: 'student', name: initialStudent.name, email: initialStudent.email },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setUser(initialUser);
      } else {
        setUser(null);
      }
    };
    
    initialLoad();
  }, [refreshUsers]);

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, switchUserRole, allStudents, allTeachers, allAdmins, allValidators, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}; // Added missing closing brace for AuthProvider component

// Hook personalizado para acceder al contexto de autenticación.
// Proporciona una forma limpia y segura de obtener los datos de sesión y usuario en cualquier componente.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
