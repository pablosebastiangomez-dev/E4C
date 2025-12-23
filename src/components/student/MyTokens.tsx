import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { type TokenTransaction, type Student } from '../../types';
import { useSupabaseCrud } from '../../hooks';
import { useEffect, useState } from 'react';

interface MyTokensProps {
  studentId: string; // The ID of the current student
}

export function MyTokens({ studentId }: MyTokensProps) {
  const {
    data: allTransactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useSupabaseCrud<TokenTransaction>('token_transactions');

  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
  } = useSupabaseCrud<Student>('students');

  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    if (students && studentId) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setCurrentBalance(student.tokens);
      }
    }
  }, [students, studentId]);

  if (transactionsLoading || studentsLoading) {
    return <div className="text-center py-8">Cargando tokens y transacciones...</div>;
  }

  if (transactionsError || studentsError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar datos de tokens: {transactionsError || studentsError}
      </div>
    );
  }

  const studentTransactions = (allTransactions || []).filter(
    (transaction) => transaction.studentId === studentId
  );

  const totalEarned = studentTransactions
    .filter((t) => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(
    studentTransactions
      .filter((t) => t.type === 'spend')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <p className="opacity-90 mb-2">Balance Total</p>
        <p className="mb-6">{currentBalance} Tokens</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Ganados</p>
            <p>+{totalEarned}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Canjeados</p>
            <p>-{totalSpent}</p>
          </div>
        </div>
      </div>

      {/* Historial de Transacciones */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-gray-900">Historial de Transacciones</h3>
          <p className="text-sm text-gray-600 mt-1">
            Todas tus actividades de tokens
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {studentTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No hay transacciones para mostrar.</div>
          ) : (
            studentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-full ${
                        transaction.type === 'earn' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {transaction.type === 'earn' ? (
                        <TrendingUp className={`w-5 h-5 text-green-600`} />
                      ) : (
                        <TrendingDown className={`w-5 h-5 text-red-600`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-1">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(transaction.date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {transaction.teacherName && (
                        <p className="text-xs text-gray-500 mt-1">
                          Asignado por {transaction.teacherName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-right ${
                      transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <p className="mb-1">
                      {transaction.type === 'earn' ? '+' : ''}
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-gray-500">tokens</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}