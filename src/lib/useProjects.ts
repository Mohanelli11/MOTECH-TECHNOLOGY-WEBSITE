import { useCallback, useEffect, useState } from 'react';
import { studentsApi, studentsAvailable, type Project } from './students';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!studentsAvailable()) {
      setError('The students marketplace is not available right now.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setProjects(await studentsApi.list());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { projects, loading, error, reload };
}
