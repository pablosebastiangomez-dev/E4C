import { useState } from 'react';
import { Upload, Award, CheckCircle, FileText } from 'lucide-react';
import { type Student, type AchievementTemplate } from '../../types';

import type { NFTRequest } from '../../types';

interface NFTRequestFormProps {
  onSubmit: (request: Omit<NFTRequest, 'id' | 'requestDate' | 'status' | 'teacherSignature' | 'teacherId' | 'teacherName'>) => void;
  teacherId: string | undefined;
}

export function NFTRequestForm({ onSubmit }: NFTRequestFormProps) {
  // --- Estados para la Gestión del Formulario ---
  // `selectedStudent`: ID del estudiante seleccionado en el desplegable.
  // `achievementName`: Nombre del logro, puede ser de una plantilla o 'custom'.
  // `customAchievement`: Nombre si el logro es personalizado.
  // `description`: Descripción del logro.
  // `evidence`: Enlace o descripción de la evidencia.
  // `showSuccess`: Controla la visibilidad de la notificación de éxito.
  const [selectedStudent, setSelectedStudent] = useState('');
  const [achievementName, setAchievementName] = useState('');
  const [customAchievement, setCustomAchievement] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // --- Datos Simulados ---
  // En un entorno real, estos datos vendrían de un backend o de un contexto global.
  const mockStudents: Student[] = [
    { id: 'student-1', name: 'Lionel Messi', email: 'lionel.messi@example.com', tokens: 150, tasksCompleted: 10, nfts: [], grade: '10th', enrollmentDate: '2022-09-01' },
    { id: 'student-2', name: 'Juana Molina', email: 'juana.molina@example.com', tokens: 200, tasksCompleted: 12, nfts: [], grade: '11th', enrollmentDate: '2021-09-01' },
    { id: 'student-3', name: 'René Favaloro', email: 'rene.favaloro@example.com', tokens: 75, tasksCompleted: 5, nfts: [], grade: '9th', enrollmentDate: '2023-09-01' },
  ];

  const mockAchievementTemplates: AchievementTemplate[] = [
    { name: 'Excelencia Académica', emoji: '🏆', description: 'Reconocimiento por desempeño sobresaliente en estudios.' },
    { name: 'Líder Estudiantil', emoji: '🌟', description: 'Por liderazgo y contribución significativa a la comunidad.' },
    { name: 'Innovador Creativo', emoji: '💡', description: 'Premio a la originalidad y creatividad en proyectos.' },
  ];

  const currentStudents = mockStudents;
  const currentAchievementTemplates = mockAchievementTemplates;

  // --- Lógica de Envío del Formulario ---
  // Se encarga de procesar los datos del formulario, preparar la solicitud y notificar al componente padre.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const student = currentStudents.find(s => s.id === selectedStudent);
    if (!student) return;

    // Determina el nombre final del logro, usando el personalizado si aplica.
    const finalAchievementName = achievementName === 'custom' ? customAchievement : achievementName;

    // Llama a la función `onSubmit` del componente padre con los datos de la solicitud.
    onSubmit({
      studentId: selectedStudent,
      studentName: student.name,
      achievementName: finalAchievementName,
      description,
      evidence,
    });

    // --- Reinicio del Formulario y Notificación de Éxito ---
    // Limpia todos los campos del formulario después del envío exitoso.
    setSelectedStudent('');
    setAchievementName('');
    setCustomAchievement('');
    setDescription('');
    setEvidence('');
    
    // Muestra una notificación de éxito que desaparece automáticamente después de 3 segundos.
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // --- Lógica de Validación del Formulario ---
  // Determina si todos los campos requeridos están llenos para habilitar el botón de envío.
  const isFormValid = selectedStudent && 
    (achievementName && (achievementName !== 'custom' || customAchievement)) && 
    description && 
    evidence;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-purple-900">Solicitud de NFT de Mérito</h3>
              <p className="text-sm text-purple-700 opacity-80 mt-1">
                Completa el formulario para iniciar el proceso de certificación
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selección de Estudiante */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Estudiante <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">-- Seleccionar Estudiante --</option>
              {currentStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.grade}
                </option>
              ))}
            </select>
          </div>

          {/* --- Selección de Tipo de Logro --- */}
          {/* Permite seleccionar logros de una lista predefinida o definir uno personalizado. */}
          {/* Al seleccionar una plantilla, se auto-completan el nombre y la descripción. */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Tipo de Logro <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentAchievementTemplates.map(template => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => {
                    setAchievementName(template.name);
                    setDescription(template.description);
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    achievementName === template.name
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.emoji}</span>
                    <div className="flex-1">
                      <p className="text-gray-900">{template.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAchievementName('custom');
                  setDescription('');
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  achievementName === 'custom'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✏️</span>
                  <div className="flex-1">
                    <p className="text-gray-900">Logro Personalizado</p>
                    <p className="text-xs text-gray-600 mt-1">Define tu propio logro</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* --- Renderizado Condicional: Campo de Logro Personalizado --- */}
          {/* Este campo solo se muestra si el usuario ha seleccionado la opción 'Logro Personalizado'. */}
          {achievementName === 'custom' && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Nombre del Logro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customAchievement}
                onChange={(e) => setCustomAchievement(e.target.value)}
                placeholder="Ej: Investigador Destacado"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Descripción del Logro <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe detalladamente el logro del estudiante..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Evidencia */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Evidencia del Logro <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Ej: Reporte académico Q4 2024, Certificado de proyecto, etc."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Describe el documento o evidencia que respalda este logro
            </p>
          </div>

          {/* Información de Firma */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-full text-sm">
                1/2
              </div>
              <div>
                <p className="text-gray-900 mb-1">Firma del Docente (Automática)</p>
                <p className="text-sm text-gray-600">
                  Al enviar esta solicitud, se registrará tu firma como docente certificador.
                  La solicitud quedará pendiente de aprobación por parte del Administrador.
                </p>
              </div>
            </div>
          </div>

          {/* Botón de Envío del Formulario */}
          <button
            type="submit"
            disabled={!isFormValid} // El botón se deshabilita si el formulario no es válido.
            className={`w-full py-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
              isFormValid
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>Enviar Solicitud de NFT</span>
          </button>
        </form>
      </div>

      {/* --- Notificación de Éxito --- */}
      {/* Se muestra una notificación flotante cuando la solicitud se ha enviado correctamente. */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-in slide-in-from-top">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 mt-1" />
            <div>
              <p className="mb-1">¡Solicitud Enviada!</p>
              <p className="text-sm opacity-90">Firma 1 de 2 completada</p>
              <p className="text-sm opacity-90 mt-1">
                Pendiente de aprobación por el Administrador
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}