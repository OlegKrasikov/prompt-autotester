'use client';

import React from 'react';
import { VariableListItem } from '@/lib/types';
import { useVariableAutocomplete } from '@/hooks/useVariables';

interface VariableAutocompleteProps {
  query: string;
  position: { top: number; left: number };
  onSelect: (variable: VariableListItem) => void;
  onClose: () => void;
  maxHeight?: number;
}

export function VariableAutocomplete({
  query,
  position,
  onSelect,
  onClose,
  maxHeight = 200,
}: VariableAutocompleteProps) {
  const filteredVariables = useVariableAutocomplete(query);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Reset selected index when query changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredVariables.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filteredVariables.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredVariables.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredVariables[selectedIndex]) {
            onSelect(filteredVariables[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredVariables, selectedIndex, onSelect, onClose]);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-variable-autocomplete]')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filteredVariables.length === 0) {
    return (
      <div
        data-variable-autocomplete
        className="absolute z-50 min-w-[250px] rounded-[var(--radius)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 shadow-[var(--shadow-lg)]"
        style={{
          top: position.top,
          left: position.left,
          maxHeight,
        }}
      >
        <div className="text-sm text-[color:var(--color-muted-foreground)]">No variables found</div>
        <div className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
          Create variables in the Variables page
        </div>
      </div>
    );
  }

  return (
    <div
      data-variable-autocomplete
      className="absolute z-50 min-w-[280px] overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-lg)]"
      style={{
        top: position.top,
        left: position.left,
        maxHeight,
      }}
    >
      <div className="border-b border-[color:var(--color-divider)] bg-[color:var(--color-surface-1)] px-3 py-1.5">
        <div className="text-xs font-medium tracking-wide text-[color:var(--color-muted-foreground)] uppercase">
          Variables
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filteredVariables.map((variable, index) => (
          <div
            key={variable.id}
            className={`cursor-pointer px-3 py-2 transition-colors ${
              index === selectedIndex
                ? 'bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]'
                : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-1)]'
            }`}
            onClick={() => onSelect(variable)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{variable.key}</span>
                  <span className="font-mono text-xs text-[color:var(--color-muted-foreground)]">
                    {`{{${variable.key}}}`}
                  </span>
                </div>
                {variable.description && (
                  <div className="mt-1 truncate text-xs text-[color:var(--color-muted-foreground)]">
                    {variable.description}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-1 truncate text-xs text-[color:var(--color-muted-foreground)]">
              {variable.value.length > 50 ? `${variable.value.slice(0, 50)}...` : variable.value}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[color:var(--color-divider)] bg-[color:var(--color-surface-1)] px-3 py-1.5">
        <div className="text-xs text-[color:var(--color-muted-foreground)]">
          ↑↓ Navigate • Enter Select • Esc Close
        </div>
      </div>
    </div>
  );
}
