CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT, -- Added description column
  dueDate TEXT, -- Or DATE type if preferred
  points INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  teacherid TEXT NOT NULL -- Added teacherid column to link tasks to teachers
);

-- Optional: Insert some initial data
INSERT INTO public.tasks (id, title, subject, description, dueDate, points, status, teacherid) VALUES
('task-1', 'Ensayo sobre Historia Antigua', 'Historia', 'Escribe un ensayo detallado sobre el impacto de las civilizaciones antiguas en la sociedad moderna.', '2024-03-15', 50, 'pending', 'teacher-id-1'),
('task-2', 'Resolución de Problemas de Álgebra', 'Matemáticas', 'Resuelve los ejercicios del capítulo 5 del libro de texto, demostrando cada paso.', '2024-03-10', 30, 'pending', 'teacher-id-1'),
('task-3', 'Proyecto de Ciencias: Sistema Solar', 'Ciencias', 'Crea una presentación interactiva sobre los planetas del sistema solar y sus características.', '2024-03-20', 100, 'pending', 'teacher-id-2');