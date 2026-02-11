CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  dueDate TEXT, -- Or DATE type if preferred
  points INTEGER NOT NULL,
  status TEXT DEFAULT 'pending'
);

-- Optional: Insert some initial data
INSERT INTO public.tasks (id, title, subject, dueDate, points, status) VALUES
('task-1', 'Ensayo sobre Historia Antigua', 'Historia', '2024-03-15', 50, 'pending'),
('task-2', 'Resolución de Problemas de Álgebra', 'Matemáticas', '2024-03-10', 30, 'pending'),
('task-3', 'Proyecto de Ciencias: Sistema Solar', 'Ciencias', '2024-03-20', 100, 'pending');