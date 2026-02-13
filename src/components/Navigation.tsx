import React from 'react';
import { User, BookText, Shield, Fingerprint, Trophy, LogOut } from 'lucide-react';
import type { UserRole, Student, Teacher } from '../types'; // Import UserRole, Student, Teacher
import { useAuth } from '../authContext';
import { AuthStatus } from './auth/AuthStatus'; // Import AuthStatus


interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const { user, switchUserRole, signOut, allStudents, allTeachers } = useAuth();
  const userRole = user?.user_metadata.role as UserRole || 'unauthenticated';
  const currentSelectedStudentId = userRole === 'student' ? user?.id : '';
  const currentSelectedTeacherId = userRole === 'teacher' ? user?.id : '';

  const roles: { id: UserRole; label: string, icon: React.ComponentType<any> }[] = [
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'teacher', label: 'Docente', icon: BookText },
    { id: 'validator', label: 'Validador', icon: Fingerprint },
    { id: 'student', label: 'Estudiante', icon: User },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
  ];

  const handleRoleChange = (role: UserRole) => {
    switchUserRole(role);
  };

  const handleStudentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    switchUserRole('student', selectedId);
  };

  const handleTeacherChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    switchUserRole('teacher', selectedId);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-xl font-bold">
              Edu&Chain
            </h1>
            {/* Student Selector */}
            {allStudents.length > 0 && (userRole === 'student') && (
              <div className="flex items-center gap-2">
                <label htmlFor="student-selector" className="text-gray-600">Alumno:</label>
                <select
                  id="student-selector"
                  value={currentSelectedStudentId}
                  onChange={handleStudentChange}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {allStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Teacher Selector */}
            {allTeachers.length > 0 && (userRole === 'teacher') && (
              <div className="flex items-center gap-2">
                <label htmlFor="teacher-selector" className="text-gray-600">Docente:</label>
                <select
                  id="teacher-selector"
                  value={currentSelectedTeacherId}
                  onChange={handleTeacherChange}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-indigo-500"
                >
                  {allTeachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {roles.map(role => {
              const Icon = role.icon;
              const isActive = userRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'text-gray-500'}`} />
                  <span>{role.label}</span>
                </button>
              );
            })}
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
              <span>Cerrar Sesión</span>
            </button>
            <AuthStatus /> {/* AuthStatus component */}
          </div>
        </div>
      </div>
    </nav>
  );
}