-- Función para incrementar tokens de forma atómica
CREATE OR REPLACE FUNCTION increment_student_tokens(row_id UUID, amount_to_add INT)
RETURNS void AS $$
BEGIN
  UPDATE students
  SET tokens = COALESCE(tokens, 0) + amount_to_add
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- Sincronizar tokens existentes basados en tareas ya aprobadas por el validador
-- Útil si ya hubo transferencias antes de aplicar el fix.
UPDATE students s
SET tokens = COALESCE((
  SELECT SUM(t.points)
  FROM student_tasks st
  JOIN tasks t ON st.task_id = t.id
  WHERE st.student_id = s.id 
  AND st.status = 'validator_approved'
), 0);
