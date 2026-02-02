import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ValidatorDashboard } from './components/validator/ValidatorDashboard';
import { RankingDashboard } from './components/ranking/RankingDashboard';
import { type Student, type Teacher } from './types';


import { useAuth } from './authContext';
import { AuthStatus } from './components/auth/AuthStatus';

export type UserRole = 'student' | 'teacher' | 'admin' | 'validator' | 'ranking' | 'unauthenticated' | 'unapproved';

export interface NFTRequest {
  id: string;
  studentId: string;
  studentName: string;
  achievementName: string;
  description: string;
  evidence: string;
  requestDate: string;
  teacherName: string;
  teacherId: string;
  status: 'pending-admin' | 'pending-validator' | 'approved' | 'rejected';
}

export interface TokenTransaction {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  date: string;
  teacherId?: string;
  teacherName?: string;
}

export default function App() {
  const { session, user, loading: authLoading } = useAuth();
  const userRole = user?.user_metadata?.role as UserRole || 'unauthenticated';
  const currentStudentId = user?.id;

  const initialStudents: Student[] = [
    { id: 'student-1', name: 'Alice Smith', email: 'alice.smith@example.com', tokens: 150, tasksCompleted: 10, nfts: [], grade: '10th' },
    { id: 'student-2', name: 'Bob Johnson', email: 'bob.johnson@example.com', tokens: 200, tasksCompleted: 12, nfts: [], grade: '11th' },
    { id: 'student-3', name: 'Charlie Brown', email: 'charlie.brown@example.com', tokens: 75, tasksCompleted: 5, nfts: [], grade: '9th' },
  ];

  const initialTeachers: Teacher[] = [
    { id: 'teacher-1', name: 'Prof. Garcia', email: 'prof.garcia@example.com', subjects: ['Math', 'Physics'] },
    { id: 'teacher-2', name: 'Prof. Rodriguez', email: 'prof.rodriguez@example.com', subjects: ['Literature', 'History'] },
  ];

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  
  // Estado central que gestiona las solicitudes de NFTs en toda la aplicación.
  const [nftRequests, setNftRequests] = useState<NFTRequest[]>([]);

  // --- Manejadores de Estado (State Handlers) ---
  // Las siguientes funciones modifican el estado principal de la aplicación.
  // Se pasan como props a los componentes hijos para permitirles actualizar el estado global.

  const handleCreateStudent = async (student: Omit<Student, 'id' | 'tokens' | 'tasksCompleted' | 'nfts'>) => {
    const newStudent: Student = {
      ...student,
      id: `student-${students.length + 1}`,
      tokens: 0,
      tasksCompleted: 0,
      nfts: [],
      grade: 'N/A', // Default grade
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleCreateTeacher = async (teacher: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacher,
      id: `teacher-${teachers.length + 1}`,
      subjects: [], // Default subjects
    };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const handleCreateNFTRequest = (request: Omit<NFTRequest, 'id' | 'requestDate' | 'status' | 'teacherSignature' | 'teacherId' | 'teacherName'>) => {
    const teacherId = 't1'; 
    const teacherName = 'Prof. María';

    const newRequest: NFTRequest = {
      ...request,
      id: `req${Date.now()}`,
      requestDate: new Date().toISOString(),
      status: 'pending-admin',
      teacherId: teacherId,
      teacherName: teacherName,
      teacherSignature: {
        name: teacherName,
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
              status: 'approved' as const,
              validatorSignature: {
                name: 'Validador Técnico',
                timestamp: new Date().toISOString(),
              },
            }
          : req
      )
    );
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


  // --- Renderizado Condicional del Dashboard ---
  // Esta función actúa como un enrutador principal para la UI.
  // Determina qué dashboard mostrar basándose en el 'userRole' del usuario autenticado.
  const renderDashboard = () => {
    switch (userRole) {
      case 'student':
        return (
          <StudentDashboard
            studentId={currentStudentId!}
            nftRequests={nftRequests}
          />
        );
      case 'teacher':
        return (
          <TeacherDashboard
            nftRequests={nftRequests}
            onCreateNFTRequest={handleCreateNFTRequest}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            students={students || []}
            teachers={teachers || []}
            onCreateStudent={handleCreateStudent}
            onCreateTeacher={handleCreateTeacher}
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
        return <RankingDashboard nftRequests={nftRequests} students={students || []} />;
      case 'ranking':
        return <RankingDashboard nftRequests={nftRequests} students={students || []} />;
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
      <Navigation>

      </Navigation>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {renderDashboard()}
      </main>
    </div>
  );
}