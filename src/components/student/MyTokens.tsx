import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { type TokenTransaction, type Student } from '../../types';

import { useEffect, useState } from 'react';

interface MyTokensProps {
  studentId: string; // The ID of the current student
}

export function MyTokens({ studentId }: MyTokensProps) {
  // --- Datos Simulados (Mock Data) ---
  // En una aplicación real, estos datos vendrían de un contexto global, una API o un backend.
  const mockStudents: Student[] = [
    { id: 'demo-student-id', name: 'Demo Student', email: 'demo.student@example.com', enrollmentDate: '2023-09-01', tokens: 250, tasksCompleted: 15, nfts: [], grade: '10th' },
  ];

  const mockTransactions: TokenTransaction[] = [
    { id: 'trans-1', studentId: 'demo-student-id', studentName: 'Demo Student', amount: 50, type: 'earn', description: 'Tarea completada: Álgebra', date: '2024-01-10T10:00:00Z', teacherName: 'Prof. Rodriguez' },
    { id: 'trans-2', studentId: 'demo-student-id', studentName: 'Demo Student', amount: 20, type: 'spend', description: 'Canje: Pegatinas', date: '2024-01-15T14:30:00Z' },
    { id: 'trans-3', studentId: 'demo-student-id', studentName: 'Demo Student', amount: 100, type: 'earn', description: 'Proyecto: Historia Antigua', date: '2024-01-20T09:00:00Z', teacherName: 'Prof. Garcia' },
  ];

  // --- Procesamiento y Cálculo de Datos ---
  // Busca el estudiante actual y calcula su balance y transacciones.
  const currentStudent = mockStudents.find((s) => s.id === studentId);
  const currentBalance = currentStudent?.tokens || 0;
  const studentTransactions = mockTransactions.filter((transaction) => transaction.studentId === studentId);

  // Calcula el total de tokens ganados.
  const totalEarned = studentTransactions
    .filter((t) => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);
  // Calcula el total de tokens gastados. Math.abs para asegurar que el valor sea positivo para la visualización.
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
                    {/* Renderizado dinámico de iconos y colores según el tipo de transacción (ganar/gastar) */}
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