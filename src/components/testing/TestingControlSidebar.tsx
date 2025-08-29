"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScenarioPicker } from "@/components/ScenarioPicker";
import { ModelPicker } from "@/components/ModelPicker";
import type { ModelConfig } from "@/lib/types";
import { Spinner } from "@/components/ui/Spinner";
import { Tooltip } from "@/components/ui/Tooltip";
import { ScenarioListItem } from "@/lib/types";

interface ScenariosHook {
  scenarios: ScenarioListItem[];
  loading: boolean;
  error: string | null;
  recentlyUsed: ScenarioListItem[];
  markScenarioAsUsed: (id: string) => void;
}

interface TestingControlSidebarProps {
  // Scenario state
  scenarioKey: string;
  onScenarioChange: (key: string) => void;
  
  // Model state
  model: ModelConfig;
  onModelChange: (config: ModelConfig) => void;
  
  // Actions
  onRunSimulation: () => void;
  onRestart: () => void;
  
  // Status
  loading: boolean;
  canRun: boolean;
  error?: string;
  hasApiKeys: boolean;
  apiKeysLoading: boolean;
  hasPrompts: boolean;
  promptsLoading: boolean;
  selectedPromptId: string;
  
  // Scenarios
  scenarios: ScenariosHook;
}

export function TestingControlSidebar({
  scenarioKey,
  onScenarioChange,
  model,
  onModelChange,
  onRunSimulation,
  onRestart,
  loading,
  canRun,
  error,
  hasApiKeys,
  apiKeysLoading,
  hasPrompts,
  promptsLoading,
  selectedPromptId,
  scenarios
}: TestingControlSidebarProps) {
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const statusMessage = React.useMemo(() => {
    if (!loading && !apiKeysLoading && !promptsLoading) {
      if (!hasPrompts) {
        return "No published prompts available";
      }
      if (hasPrompts && !selectedPromptId) {
        return "Please select a prompt";
      }
      if (hasPrompts && selectedPromptId && !scenarioKey) {
        return "Please select a test scenario";
      }
      if (hasPrompts && selectedPromptId && scenarioKey && !hasApiKeys) {
        return "Please configure API keys in Settings";
      }
    }
    return null;
  }, [loading, apiKeysLoading, promptsLoading, hasPrompts, selectedPromptId, scenarioKey, hasApiKeys]);

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 xl:hidden bg-[color:var(--color-accent)] text-white p-3 rounded-[var(--radius)] shadow-lg touch-manipulation transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-xl"
        aria-label="Open control panel"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Right Sidebar */}
      <div className={`
        fixed xl:static top-0 right-0 xl:right-auto z-50
        w-[90vw] max-w-[340px] sm:w-[340px] h-screen 
        bg-[color:var(--color-surface)] border-l xl:border-r xl:border-l-0 border-[color:var(--color-border)] 
        overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-[color:var(--color-border)] scrollbar-track-transparent
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
      {/* Close button for mobile - positioned at top right */}
      <div className="xl:hidden flex justify-end p-4">
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-3 touch-manipulation hover:bg-[color:var(--color-surface-2)] rounded-[var(--radius)] transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Close control panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {/* Scenario Selection - No header */}
        <ScenarioPicker 
          value={scenarioKey} 
          onChange={onScenarioChange}
          error={error && !scenarioKey ? "Scenario required" : undefined}
          scenariosData={{
            items: scenarios.scenarios,
            loading: scenarios.loading,
            error: scenarios.error,
          }}
        />
        
        {/* Status Message */}
        {statusMessage && (
          <div className="p-2 rounded-[var(--radius)] bg-[color:var(--color-warning)]/10 border border-[color:var(--color-warning)]/20">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-warning)] flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-xs text-[color:var(--color-warning)]">
                {statusMessage}
              </span>
            </div>
          </div>
        )}

        {/* Primary Action - Single button */}
        <Button
          size="sm"
          variant="primary"
          loading={loading}
          disabled={!canRun || loading}
          onClick={onRunSimulation}
          className="w-full touch-manipulation transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-md text-sm"
        >
          {loading ? (
            <span>Running...</span>
          ) : (
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Run Simulation
            </div>
          )}
        </Button>


        {/* Settings - Tiny inline */}
        <div className="border border-[color:var(--color-border)] rounded-[var(--radius)] p-2">
          <button 
            className="w-full flex items-center justify-between text-xs font-semibold text-[color:var(--color-foreground)] hover:text-[color:var(--color-accent)] py-1 transition-colors"
            onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)}
          >
            <span>Settings</span>
            <svg 
              width="10" 
              height="10" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${advancedSettingsOpen ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          
          {advancedSettingsOpen && (
            <div className="mt-1 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[color:var(--color-muted-foreground)] w-8">Model</span>
                <select
                  value={model.model}
                  onChange={(e) => onModelChange({ 
                    ...model, 
                    model: e.target.value 
                  })}
                  className="flex-1 h-5 px-1 text-xs bg-[color:var(--color-surface)] border rounded border-[color:var(--color-border)]"
                >
                  <option value="gpt-5">GPT-5</option>
                  <option value="gpt-5-mini">GPT-5 Mini</option>
                  <option value="gpt-5-nano">GPT-5 Nano</option>
                </select>
              </div>
              
              {(model.model === 'gpt-5' || model.model === 'gpt-5-mini' || model.model === 'gpt-5-nano') && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-[color:var(--color-muted-foreground)] w-8">Think</span>
                    <select
                      value={model.reasoningEffort || 'medium'}
                      onChange={(e) => onModelChange({ 
                        ...model, 
                        reasoningEffort: e.target.value as "minimal" | "medium" | "high" 
                      })}
                      className="flex-1 h-5 px-1 text-xs bg-[color:var(--color-surface)] border rounded border-[color:var(--color-border)]"
                    >
                      <option value="minimal">Min</option>
                      <option value="medium">Med</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[color:var(--color-muted-foreground)] w-8">Length</span>
                    <select
                      value={model.verbosity || 'medium'}
                      onChange={(e) => onModelChange({ 
                        ...model, 
                        verbosity: e.target.value as "low" | "medium" | "high" 
                      })}
                      className="flex-1 h-5 px-1 text-xs bg-[color:var(--color-surface)] border rounded border-[color:var(--color-border)]"
                    >
                      <option value="low">Short</option>
                      <option value="medium">Med</option>
                      <option value="high">Long</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[color:var(--color-muted-foreground)] w-8">Speed</span>
                    <select
                      value={model.serviceTier || 'default'}
                      onChange={(e) => onModelChange({ 
                        ...model, 
                        serviceTier: e.target.value as "default" | "priority" 
                      })}
                      className="flex-1 h-5 px-1 text-xs bg-[color:var(--color-surface)] border rounded border-[color:var(--color-border)]"
                    >
                      <option value="default">Normal</option>
                      <option value="priority">Fast</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
      </div>
    </>
  );
}
