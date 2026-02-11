import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Award, Users, Zap } from 'lucide-react';
import type { NFTRequest } from '../../types';
import type { Student } from '../../types';

interface GeneralStatsProps {
  nftRequests: NFTRequest[];
  students: Student[];
}

export function GeneralStats({ nftRequests, students }: GeneralStatsProps) {
  // --- Datos para Gráficos (Actualmente Falsos/Mocked) ---
  // En una implementación real, estos datos se calcularían a partir de datos históricos o de la API.
  const weeklyActivity = [
    { day: 'Lun', tokens: 2340, nfts: 3 },
    { day: 'Mar', tokens: 2890, nfts: 5 },
    { day: 'Mié', tokens: 2650, nfts: 4 },
    { day: 'Jue', tokens: 3120, nfts: 6 },
    { day: 'Vie', tokens: 2180, nfts: 2 },
    { day: 'Sáb', tokens: 890, nfts: 1 },
    { day: 'Dom', tokens: 720, nfts: 0 },
  ];

  const nftsByCategory = [
    { name: 'Excelencia', value: 12, color: '#eab308' },
    { name: 'Logros', value: 18, color: '#8b5cf6' },
    { name: 'Participación', value: 8, color: '#10b981' },
  ];

  const monthlyGrowth = [
    { month: 'Jul', students: 120, tokens: 45000 },
    { month: 'Ago', students: 135, tokens: 68000 },
    { month: 'Sep', students: 142, tokens: 89000 },
    { month: 'Oct', students: 148, tokens: 102000 },
    { month: 'Nov', students: 152, tokens: 115000 },
    { month: 'Dic', students: 156, tokens: 125450 },
  ];

  // --- Cálculo de KPIs (Indicadores Clave de Rendimiento) ---
  // Estos valores se derivan de los props recibidos (nftRequests y students).
  const approvedNFTs = nftRequests.filter(r => r.status === 'approved').length;
  const pendingNFTs = nftRequests.filter(r => r.status === 'pending-admin').length;
  const totalTokens = students.reduce((acc, student) => acc + student.tokens, 0);
  const totalStudents = students.length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6" />
            <p className="opacity-90">Estudiantes Activos</p>
          </div>
          <p className="mb-2">{totalStudents}</p>
          <p className="text-sm opacity-75">Estudiantes en la plataforma</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6" />
            <p className="opacity-90">Tokens Distribuidos</p>
          </div>
          <p className="mb-2">{totalTokens}</p>
          <p className="text-sm opacity-75">Tokens en total</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-6 h-6" />
            <p className="opacity-90">NFTs Certificados</p>
          </div>
          <p className="mb-2">{approvedNFTs}</p>
          <p className="text-sm opacity-75">{pendingNFTs} en revisión</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6" />
            <p className="opacity-90">Promedio Tokens/Estudiante</p>
          </div>
          <p className="mb-2">{totalStudents > 0 ? Math.round(totalTokens / totalStudents) : 0}</p>
          <p className="text-sm opacity-75">Tokens promedio por estudiante</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras: Muestra la distribución de Tokens y NFTs durante la semana. */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Actividad Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px' 
                }}
              />
              <Legend />
              <Bar dataKey="tokens" fill="#6366f1" radius={[8, 8, 0, 0]} name="Tokens" />
              <Bar dataKey="nfts" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="NFTs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico Circular: Muestra la proporción de NFTs emitidos por categoría. */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Distribución de NFTs por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={nftsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {nftsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Líneas: Muestra la tendencia de crecimiento de estudiantes y tokens. */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Tendencia de Crecimiento (6 meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis yAxisId="left" stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px' 
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="students" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="Estudiantes Activos"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="tokens" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              name="Tokens Distribuidos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h4 className="text-green-900 mb-3">🎯 Insights Positivos</h4>
          <ul className="space-y-2 text-green-800 text-sm">
            <li>• El engagement estudiantil aumentó 12% este mes</li>
            <li>• 94% de los estudiantes están activamente participando</li>
            <li>• Los NFTs de logros son los más solicitados (47%)</li>
            <li>• El promedio de tokens por estudiante subió a 804</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-blue-900 mb-3">📊 Métricas Clave</h4>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Tiempo promedio de aprobación de NFT: 1.5 días</li>
            <li>• Tasa de aprobación de NFTs: 89%</li>
            <li>• Estudiantes con al menos 1 NFT: 78%</li>
            <li>• Tokens canjeados en marketplace: 15,230</li>
          </ul>
        </div>
      </div>
    </div>
  );
}