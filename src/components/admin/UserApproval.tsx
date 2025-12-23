import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { User } from '@supabase/supabase-js';

const UserApproval: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      setError(error.message);
    } else {
      setUsers(users.filter(user => user.user_metadata.role === 'unapproved'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approveUser = async (id: string) => {
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      id,
      { user_metadata: { role: 'student' } }
    );
    if (error) {
      setError(error.message);
    } else {
      fetchUsers(); // Refresh the list
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

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
              <button
                onClick={() => approveUser(user.id)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserApproval;
