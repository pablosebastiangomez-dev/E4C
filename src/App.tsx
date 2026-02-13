import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { ValidatorDashboard } from './components/validator/ValidatorDashboard';
import { RankingDashboard } from './components/ranking/RankingDashboard';
import { type UserRole, type NFTRequest } from './types';
import { supabase } from './lib/supabaseClient'; // Import supabase client
import { useAuth } from './authContext';
import { AuthStatus } from './components/auth/AuthStatus';



export default function App() {

  const { user, loading, allStudents, allTeachers } = useAuth();

  const userRole = user?.user_metadata?.role as UserRole || 'unauthenticated';



  const [nftRequests, setNftRequests] = useState<NFTRequest[]>([]);

  const [fetchError, setFetchError] = useState<string | null>(null);



  // Fetch NFT requests on component mount or when user changes

  useEffect(() => {

    const fetchNftRequests = async () => {

      setFetchError(null);

      if (!user) {

        setNftRequests([]);

        return;

      }

      const { data, error } = await supabase.from('nft_requests').select('*');

      if (error) {

        console.error('Error fetching NFT requests:', error);

        setFetchError('Error cargando solicitudes de NFT.');

      } else {

        setNftRequests(data as NFTRequest[]);

      }

    };

    fetchNftRequests();

  }, [user]); // Re-fetch when user changes



  // --- Manejadores de Estado (State Handlers) ---

  const handleCreateStudent = async () => {

    console.log("handleCreateStudent at App.tsx level is now a placeholder.");

  };



  const handleCreateTeacher = async () => {

    console.log("handleCreateTeacher at App.tsx level is now a placeholder.");

  };



  const handleCreateNFTRequest = (request: Omit<NFTRequest, 'id' | 'requestDate' | 'status' | 'teacherSignature' | 'teacherId' | 'teacherName'>) => {

    const dummyTeacher = allTeachers.length > 0 ? allTeachers[0] : { id: 't1', name: 'Profesor Dummy', email: 'dummy@example.com', subjects: [] };

    

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

    if (loading) {

      return (

        <div className="flex justify-center items-center h-screen text-lg">

          Cargando datos...

        </div>

      );

    }



    if (!user) {

      return (

        <div className="flex justify-center items-center h-screen text-lg">

          Por favor, selecciona un rol para acceder al panel.

        </div>

      );

    }



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

            studentId={user.id}

            nftRequests={nftRequests}

          />

        );

      case 'teacher':

        return (

          <TeacherDashboard

            teacherId={user.id}

            nftRequests={nftRequests}

            onCreateNFTRequest={handleCreateNFTRequest}

          />

        );

            case 'admin':

              return (

                <AdminDashboard />

              );

      case 'validator':

        return (

          <ValidatorDashboard

            nftRequests={nftRequests}

            onApproveRequest={handleValidatorApprove}

            onRejectRequest={handleValidatorReject}

          />

        );

      case 'ranking':

        return <RankingDashboard nftRequests={nftRequests} students={allStudents} />;

      default:

        return (

            <div className="flex justify-center items-center h-screen text-lg">

                Rol no reconocido o sin selección.

            </div>

        );

    }

  };



  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

      <Navigation>

        <AuthStatus />

      </Navigation>

      <main className="container mx-auto px-4 py-8 max-w-7xl">

        {renderDashboard()}

      </main>

    </div>

  );

}