import { useState, useEffect, useCallback } from 'react';
import { VariableListItem } from '@/lib/types';

export function useVariables() {
  const [variables, setVariables] = useState<VariableListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVariables = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/variables');
      if (response.ok) {
        const data = await response.json();
        setVariables(data);
      } else {
        setError('Failed to fetch variables');
      }
    } catch (err) {
      setError('Error fetching variables');
      console.error('Error fetching variables:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVariables();
  }, [fetchVariables]);

  return { variables, loading, error, refetch: fetchVariables };
}

export function useVariableAutocomplete(query: string) {
  const { variables } = useVariables();

  const filteredVariables = variables.filter((variable) =>
    variable.key.toLowerCase().includes(query.toLowerCase()),
  );

  return filteredVariables;
}
