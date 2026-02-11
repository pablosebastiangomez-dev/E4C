import React, { useState } from 'react';

interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    role: string;
  };
}

// NOTA: Este componente actualmente utiliza su propia lista de usuarios falsos (mock data).
// En una aplicación real, estos datos vendrían del estado global o de una API.
const UserApproval: React.FC = () => {
  const [users, setUsers] = useState<MockUser[]>([
    { id: 'mock-user-1', email: 'futuro.estudiante@example.com', user_metadata: { role: 'unapproved' } },
    { id: 'mock-user-2', email: 'futuro.docente@example.com', user_metadata: { role: 'unapproved' } },
  ]);

  // Función para aprobar un usuario. Cambia el rol del usuario a 'student'.
  const approveUser = (id: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id ? { ...user, user_metadata: { role: 'student' } } : user
      )
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Approve New Users</h2>
      {users.length === 0 ? (
        <p>No users waiting for approval.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {users.map(user => (
            <li key={user.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-gray-500">Role: {user.user_metadata.role}</p>
              </div>
              {user.user_metadata.role === 'unapproved' ? (
                <button
                  onClick={() => approveUser(user.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Approve
                </button>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Approved</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserApproval;
