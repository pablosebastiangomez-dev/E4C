import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ValidatorDashboard } from './components/validator/ValidatorDashboard';
import { RankingDashboard } from './components/ranking/RankingDashboard';
import { type Student, type Teacher, type UserRole, type NFTRequest } from './types';
import { supabase } from './lib/supabaseClient'; // Import supabase client
import { useAuth } from './authContext';
import { AuthStatus } from './components/auth/AuthStatus';

export default function App() {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role as UserRole || 'unauthenticated';

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [currentSelectedStudent, setCurrentSelectedStudent] = useState<Student | null>(null);

  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [currentSelectedTeacher, setCurrentSelectedTeacher] = useState<Teacher | null>(null);
  
  const [nftRequests, setNftRequests] = useState<NFTRequest[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setFetchError(null); // Clear any previous errors

      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        setFetchError('Error cargando estudiantes. Por favor, intente de nuevo más tarde.');
      } else {
        setAllStudents(studentsData as Student[]);
        // Initialize currentSelectedStudent
        if (studentsData && studentsData.length > 0) {
          let defaultStudent = studentsData[0];
          // Check if authenticated user's ID is valid and exists in fetched students
          if (user?.id && user.id !== 'demo-student-id' && user.id !== 'demo-teacher-id') { // Explicitly check for known bad ID
            const authenticatedStudent = studentsData.find(s => s.id === user.id);
            if (authenticatedStudent) {
              defaultStudent = authenticatedStudent;
            }
          }
          setCurrentSelectedStudent(defaultStudent);
        } else {
          setCurrentSelectedStudent(null);
        }
      }

      // Fetch all teachers
      const { data: teachersData, error: teachersError } = await supabase.from('teachers').select('*');
      if (teachersError) {
        console.error('Error fetching teachers:', teachersError);
        setFetchError('Error cargando profesores. Por favor, intente de nuevo más tarde.');
      } else {
        setAllTeachers(teachersData as Teacher[]);
        // Initialize currentSelectedTeacher
        if (teachersData && teachersData.length > 0) {
          let defaultTeacher = teachersData[0];
          // Check if authenticated user's ID is valid and exists in fetched teachers
          if (user?.id && user.id !== 'demo-student-id' && user.id !== 'demo-teacher-id') { // Assuming a similar placeholder for teachers
            const authenticatedTeacher = teachersData.find(t => t.id === user.id);
            if (authenticatedTeacher) {
              defaultTeacher = authenticatedTeacher;
            }
          }
          setCurrentSelectedTeacher(defaultTeacher);
        } else {
          setCurrentSelectedTeacher(null);
        }
      }
    };

    fetchInitialData();
  }, [user]); // Re-fetch if user changes to prioritize authenticated user


  // --- Manejadores de Estado (State Handlers) ---
  // Las siguientes funciones modifican el estado principal de la aplicación.
  // Se pasan como props a los componentes hijos para permitirles actualizar el estado global.

  // NOTE: handleCreateStudent and handleCreateTeacher are now placeholders for direct Supabase insertion
  // as useSupabaseCrud is removed and actual creation logic with Stellar is in Management components.
  const handleCreateStudent = async () => {
    // This function might not be called directly from App.tsx anymore for MVP
    console.log("handleCreateStudent at App.tsx level is now a placeholder.");
  };

  const handleCreateTeacher = async () => {
    // This function might not be called directly from App.tsx anymore for MVP
    console.log("handleCreateTeacher at App.tsx level is now a placeholder.");
  };

  const handleCreateNFTRequest = (request: Omit<NFTRequest, 'id' | 'requestDate' | 'status' | 'teacherSignature' | 'teacherId' | 'teacherName'>) => {
    // Simplified for MVP, assuming a dummy teacher or finding one from fetched teachers
    const dummyTeacher = allTeachers.length > 0 ? allTeachers[0] : { id: 't1', name: 'Profesor Dummy', email: 'dummy@example.com', subjects: [] }; // Fallback
    
    const newRequest: NFTRequest = {
      ...request,
      id: `req${Date.now()}`,
      requestDate: new Date().toISOString(),
      status: 'pending-admin',
      teacherId: dummyTeacher.id,
      teacherName: dummyTeacher.name,
      teacherSignature: {
        name: dummyTeacher.name,
        timestamp: new Date().toISOString(),
      },
    };
    setNftRequests(prev => [newRequest, ...prev]);
  };

  const handleValidatorApprove = (requestId: string) => {
    setNftRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: 'blockchain-pending' as const,
              validatorSignature: {
                name: 'Validador Técnico',
                timestamp: new Date().toISOString(),
              },
            }
          : req
      )
    );

    setTimeout(() => {
      setNftRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req,
                status: 'approved' as const,
                blockchainHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
              }
            : req
        )
      );
    }, 3000);
  };

  const handleValidatorReject = (requestId: string, reason: string) => {
    setNftRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: 'rejected' as const,
              rejectionReason: reason,
            }
          : req
      )
    );
  };

  const renderDashboard = () => {
    if (fetchError) {
      return (
        <div className="flex justify-center items-center h-screen text-lg text-red-600">
          <p>{fetchError}</p>
        </div>
      );
    }
    switch (userRole) {
      case 'student':
        return (
          <StudentDashboard
            studentId={currentSelectedStudent?.id}
            nftRequests={nftRequests}
          />
        );
      case 'teacher':
        return (
          <TeacherDashboard
            teacherId={currentSelectedTeacher?.id}
            nftRequests={nftRequests}
            onCreateNFTRequest={handleCreateNFTRequest}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            students={allStudents || []}
            teachers={allTeachers || []}
            onCreateStudent={handleCreateStudent} // Placeholder, actual creation in StudentManagement
            onCreateTeacher={handleCreateTeacher} // Placeholder, actual creation in TeacherManagement
          />
        );
      case 'validator':
        return (
          <ValidatorDashboard
            nftRequests={nftRequests}
            onApproveRequest={handleValidatorApprove}
            onRejectRequest={handleValidatorReject}
          />
        );
      case 'unapproved':
        return <RankingDashboard nftRequests={nftRequests} students={allStudents || []} />;
      case 'ranking':
        return <RankingDashboard nftRequests={nftRequests} students={allStudents || []} />;
      case 'unauthenticated':
      default:
        return (
            <div className="flex justify-center items-center h-screen text-lg">
                Por favor, inicie sesión para acceder al panel.
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation
        allStudents={allStudents}
        currentSelectedStudent={currentSelectedStudent}
        onSelectStudent={setCurrentSelectedStudent}
        allTeachers={allTeachers}
        currentSelectedTeacher={currentSelectedTeacher}
        onSelectTeacher={setCurrentSelectedTeacher}
      >
        <AuthStatus />
      </Navigation>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {renderDashboard()}
      </main>
    </div>
  );
}