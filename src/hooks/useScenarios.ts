import { useState, useEffect, useCallback } from 'react';
import { ScenarioListItem } from '@/lib/types';

export function useScenarios() {
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  // Load scenarios from API
  const loadScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/scenarios/published');
      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      } else {
        setError('Failed to load scenarios');
      }
    } catch (err) {
      console.error('Failed to fetch published scenarios:', err);
      setError('Network error loading scenarios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recently used scenarios from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recently-used-scenarios');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentlyUsed(parsed);
        }
      } catch (e) {
        console.error('Failed to parse recently used scenarios:', e);
      }
    }
  }, []);

  // Load scenarios on mount
  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  // Add scenario to recently used
  const markScenarioAsUsed = useCallback((scenarioId: string) => {
    if (!scenarioId) return;
    
    setRecentlyUsed(prev => {
      // Remove if already exists, then add to front
      const filtered = prev.filter(id => id !== scenarioId);
      const updated = [scenarioId, ...filtered].slice(0, 5); // Keep only last 5
      
      // Save to localStorage
      localStorage.setItem('recently-used-scenarios', JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  // Get scenario by index for quick switching
  const getScenarioByIndex = useCallback((index: number): ScenarioListItem | null => {
    if (index < 0 || index >= scenarios.length) return null;
    return scenarios[index];
  }, [scenarios]);

  // Get recently used scenarios as full objects
  const getRecentlyUsedScenarios = useCallback((): ScenarioListItem[] => {
    return recentlyUsed
      .map(id => scenarios.find(s => s.id === id))
      .filter(Boolean) as ScenarioListItem[];
  }, [recentlyUsed, scenarios]);

  // Switch to scenario by index (0-based)
  const switchToScenarioByIndex = useCallback((index: number): ScenarioListItem | null => {
    const scenario = getScenarioByIndex(index);
    if (scenario) {
      markScenarioAsUsed(scenario.id);
    }
    return scenario;
  }, [getScenarioByIndex, markScenarioAsUsed]);

  return {
    scenarios,
    loading,
    error,
    recentlyUsed: getRecentlyUsedScenarios(),
    markScenarioAsUsed,
    getScenarioByIndex,
    switchToScenarioByIndex,
    reload: loadScenarios
  };
}