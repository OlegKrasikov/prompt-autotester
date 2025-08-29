import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onRunSimulation: () => void;
  onRestart: () => void;
  onScenarioSwitch?: (scenarioId: string) => void;
  scenarios?: Array<{ id: string; name: string }>;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onRunSimulation,
  onRestart,
  onScenarioSwitch,
  scenarios = [],
  disabled = false
}: KeyboardShortcutsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if disabled or if user is typing in an input/textarea
    if (disabled) return;
    
    const target = event.target as HTMLElement;
    const isInInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.contentEditable === 'true' ||
                     target.isContentEditable;
    
    // Allow Tab navigation even in inputs
    if (event.key === 'Tab') {
      return; // Let default tab behavior work
    }
    
    // Skip other shortcuts if typing in inputs (but not for specific combos)
    if (isInInput && !event.metaKey && !event.ctrlKey) return;
    
    // Ctrl + Enter: Run Simulation (non-conflicting)
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      onRunSimulation();
      return;
    }
    
    // Ctrl + Shift + R: Restart (non-conflicting with browser refresh)
    if (event.ctrlKey && event.shiftKey && event.key === 'R') {
      event.preventDefault();
      onRestart();
      return;
    }
    
    // Ctrl + 1/2/3: Switch scenarios (non-conflicting with browser tabs)
    if (event.ctrlKey && !event.shiftKey && !event.altKey && onScenarioSwitch && scenarios.length > 0) {
      const number = parseInt(event.key);
      if (number >= 1 && number <= Math.min(3, scenarios.length)) {
        event.preventDefault();
        const scenario = scenarios[number - 1]; // Convert to 0-based index
        onScenarioSwitch(scenario.id);
        return;
      }
    }
    
    // ESC: Clear focus from current element
    if (event.key === 'Escape') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
    }
  }, [onRunSimulation, onRestart, onScenarioSwitch, scenarios, disabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return helper functions for displaying shortcuts
  return {
    isMac: typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform),
    getModifierKey: () => 'Ctrl', // Always use Ctrl for consistency
    getShortcuts: () => ({
      run: 'Ctrl+Enter',
      restart: 'Ctrl+Shift+R',
      scenarios: 'Ctrl+1/2/3'
    })
  };
}