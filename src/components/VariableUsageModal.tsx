'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';

interface VariableUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  variableName: string;
  usage: {
    prompts: Array<{ id: string; name: string }>;
    scenarios: Array<{ id: string; name: string }>;
  };
}

export function VariableUsageModal({ isOpen, onClose, variableName, usage }: VariableUsageModalProps) {
  const router = useRouter();

  const handleNavigate = (type: 'prompt' | 'scenario', id: string) => {
    onClose();
    if (type === 'prompt') {
      router.push(`/prompts/${id}/edit`);
    } else {
      router.push(`/scenarios/${id}/edit`);
    }
  };

  const totalUsages = usage.prompts.length + usage.scenarios.length;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Cannot Delete Variable"
      size="md"
    >
      <ModalContent>
        <div className="space-y-4">
          {/* Error message */}
          <div className="p-4 rounded-[var(--radius)] bg-[color:var(--color-danger)]/10 border border-[color:var(--color-danger)]/20">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 mt-0.5 text-[color:var(--color-danger)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[color:var(--color-danger)] mb-1">
                  Variable is currently in use
                </h3>
                <p className="text-sm text-[color:var(--color-danger)]">
                  The variable <code className="px-1 py-0.5 bg-[color:var(--color-danger)]/10 rounded text-xs font-mono">
                    {`{{${variableName}}}`}
                  </code> cannot be deleted because it&apos;s being used in {totalUsages} location{totalUsages !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          </div>

          {/* Usage details */}
          <div className="space-y-4">
            {usage.prompts.length > 0 && (
              <div>
                <h4 className="font-medium text-[color:var(--color-foreground)] mb-2">
                  Used in {usage.prompts.length} prompt{usage.prompts.length !== 1 ? 's' : ''}:
                </h4>
                <div className="space-y-2">
                  {usage.prompts.map((prompt) => (
                    <div key={prompt.id} className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[color:var(--color-surface)] border border-[color:var(--color-border)]">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 text-[color:var(--color-muted-foreground)]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14,2 14,8 20,8"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                          {prompt.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigate('prompt', prompt.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M7 17L17 7"/>
                          <path d="M7 7h10v10"/>
                        </svg>
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {usage.scenarios.length > 0 && (
              <div>
                <h4 className="font-medium text-[color:var(--color-foreground)] mb-2">
                  Used in {usage.scenarios.length} scenario{usage.scenarios.length !== 1 ? 's' : ''}:
                </h4>
                <div className="space-y-2">
                  {usage.scenarios.map((scenario) => (
                    <div key={scenario.id} className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[color:var(--color-surface)] border border-[color:var(--color-border)]">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 text-[color:var(--color-muted-foreground)]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 2v4"/>
                            <path d="M16 2v4"/>
                            <rect width="18" height="18" x="3" y="4" rx="2"/>
                            <path d="M3 10h18"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                          {scenario.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigate('scenario', scenario.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M7 17L17 7"/>
                          <path d="M7 7h10v10"/>
                        </svg>
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="p-3 rounded-[var(--radius)] bg-[color:var(--color-surface)] border border-[color:var(--color-border)]">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 mt-0.5 text-[color:var(--color-muted-foreground)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                To delete this variable, first remove it from all prompts and scenarios listed above. 
                Click the &quot;Edit&quot; buttons to navigate directly to each location where it&apos;s used.
              </p>
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          Got it
        </Button>
      </ModalFooter>
    </Modal>
  );
}