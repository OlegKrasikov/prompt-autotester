"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { TestingMainContent } from "@/components/testing/TestingMainContent";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useScenarios } from "@/hooks/useScenarios";
import { useOnboarding } from "@/hooks/useOnboarding";
import { WelcomeDialog } from "@/components/ui/WelcomeDialog";
import type { ModelConfig } from "@/lib/types";
import { SimulateResponseBody } from "@/lib/types";

export default function PromptTestingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const scenarios = useScenarios();
  const onboarding = useOnboarding();
  
  const [selectedPromptId, setSelectedPromptId] = React.useState<string>("");
  const [oldPrompt, setOldPrompt] = React.useState<string>(`# Booking policy\n\n- Walk-ins welcome\n- Appointments prioritized`);
  const [newPrompt, setNewPrompt] = React.useState<string>(`# Booking policy (v2)\n\n- Appointments required after 5pm\n- 10 min grace period`);
  const [scenarioKey, setScenarioKey] = React.useState<string>("");
  const [model, setModel] = React.useState<ModelConfig>({ 
    model: "gpt-5", 
    reasoningEffort: "medium", 
    verbosity: "medium", 
    serviceTier: "default" 
  });
  const [sim, setSim] = React.useState<SimulateResponseBody | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasApiKeys, setHasApiKeys] = React.useState<boolean>(false);
  const [apiKeysLoading, setApiKeysLoading] = React.useState<boolean>(true);
  const [hasPrompts, setHasPrompts] = React.useState<boolean>(false);
  const [promptsLoading, setPromptsLoading] = React.useState<boolean>(true);
  const [streamingState, setStreamingState] = React.useState<{
    current: boolean;
    edited: boolean;
  }>({ current: false, edited: false });

  const handlePromptSelection = (promptId: string, promptContent: string) => {
    setSelectedPromptId(promptId);
    if (promptContent) {
      setOldPrompt(promptContent);
      setNewPrompt(promptContent);
    }
  };

  const handleRestart = () => {
    setSim(null);
    setError(null);
    setStreamingState({ current: false, edited: false });
  };

  const { markScenarioAsUsed } = scenarios;
  const handleScenarioSwitch = React.useCallback((scenarioId: string) => {
    setScenarioKey(scenarioId);
    markScenarioAsUsed(scenarioId);
  }, [markScenarioAsUsed]);

  // Ensure a valid scenario is selected once scenarios load
  React.useEffect(() => {
    if (!scenarios.loading && scenarios.scenarios.length > 0) {
      const hasSelected = scenarios.scenarios.some(s => s.id === scenarioKey);
      if (!hasSelected) {
        setScenarioKey(scenarios.scenarios[0].id);
      }
    }
  }, [scenarios.loading, scenarios.scenarios, scenarioKey]);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onRunSimulation: runSimulation,
    onRestart: handleRestart,
    onScenarioSwitch: handleScenarioSwitch,
    scenarios: scenarios.scenarios,
    disabled: loading || !selectedPromptId || !hasApiKeys
  });

  async function runSimulation() {
    if (!scenarioKey) {
      setError("Please select a published scenario to run simulation");
      return;
    }

    // Mark scenario as used when starting simulation
    scenarios.markScenarioAsUsed(scenarioKey);
    
    // Mark first test as run for onboarding
    if (!onboarding.onboardingState.hasRunFirstTest) {
      onboarding.markFirstTestRun();
    }

    try {
      setLoading(true);
      setError(null);
      setSim(null);

      // Initialize empty conversations for streaming
      setSim({
        old: { title: "Current Prompt", messages: [] },
        new: { title: "Edited Prompt", messages: [] }
      });

      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPrompt, newPrompt, scenarioKey, modelConfig: model }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamEvent(data);
            } catch (parseError) {
              console.error('Failed to parse stream data:', parseError);
            }
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to simulate");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleStreamEvent(data: Record<string, unknown>) {
    switch (data.type) {
      case 'start':
        console.log(`Starting simulation: ${data.scenarioName}, ${data.totalTurns} turns`);
        setStreamingState({ current: true, edited: true });
        break;

      case 'message':
        if (data.data.role === 'user') {
          // User message - set streaming to true for this conversation (waiting for AI response)
          setStreamingState(current => ({
            ...current,
            [data.promptType]: true
          }));
        } else if (data.data.role === 'assistant') {
          // AI response - set streaming to false for this conversation
          setStreamingState(current => ({
            ...current,
            [data.promptType]: false
          }));
        }

        setSim(current => {
          if (!current) return null;
          
          const targetConversation = data.promptType === 'current' ? 'old' : 'new';
          return {
            ...current,
            [targetConversation]: {
              ...current[targetConversation],
              messages: [...current[targetConversation].messages, data.data]
            }
          };
        });
        break;

      case 'complete':
        setSim(current => {
          if (!current) return null;
          
          const targetConversation = data.promptType === 'current' ? 'old' : 'new';
          return {
            ...current,
            [targetConversation]: {
              ...current[targetConversation],
              title: data.data.title
            }
          };
        });
        
        // Stop streaming for this conversation
        setStreamingState(current => ({
          ...current,
          [data.promptType]: false
        }));
        break;

      case 'done':
        console.log('Simulation complete');
        setStreamingState({ current: false, edited: false });
        break;

      case 'error':
        setError(data.error);
        setStreamingState({ current: false, edited: false });
        break;
    }
  }

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login?redirect=/testing");
    }
  }, [isPending, session, router]);

  React.useEffect(() => {
    const fetchApiKeys = async () => {
      if (!session) return;
      
      setApiKeysLoading(true);
      try {
        const response = await fetch('/api/user/api-keys');
        if (response.ok) {
          const data = await response.json();
          setHasApiKeys((data.apiKeys || []).length > 0);
        } else {
          setHasApiKeys(false);
        }
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
        setHasApiKeys(false);
      } finally {
        setApiKeysLoading(false);
      }
    };

    const fetchPrompts = async () => {
      if (!session) return;
      
      setPromptsLoading(true);
      try {
        const response = await fetch('/api/prompts?status=PUBLISHED');
        if (response.ok) {
          const data = await response.json();
          setHasPrompts(data.length > 0);
        } else {
          setHasPrompts(false);
        }
      } catch (error) {
        console.error('Failed to fetch prompts:', error);
        setHasPrompts(false);
      } finally {
        setPromptsLoading(false);
      }
    };

    fetchApiKeys();
    fetchPrompts();
  }, [session]);

  if (!session) return null;

  // Calculate run button availability
  const canRunSimulation = selectedPromptId && scenarioKey && hasApiKeys && !apiKeysLoading && hasPrompts;

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <div className="p-4 sm:p-6">
        <TestingMainContent
          selectedPromptId={selectedPromptId}
          oldPrompt={oldPrompt}
          newPrompt={newPrompt}
          onPromptSelection={handlePromptSelection}
          onNewPromptChange={setNewPrompt}
          scenarioKey={scenarioKey}
          onScenarioChange={handleScenarioSwitch}
          promptsLoading={promptsLoading}
          hasPrompts={hasPrompts}
          sim={sim}
          loading={loading}
          streamingState={streamingState}
          error={error}
          model={model}
          onModelChange={setModel}
          onRunSimulation={runSimulation}
          canRun={canRunSimulation}
          hasApiKeys={hasApiKeys}
          apiKeysLoading={apiKeysLoading}
          scenariosData={{
            items: scenarios.scenarios,
            loading: scenarios.loading,
            error: scenarios.error,
          }}
          statusMessage={!loading && !apiKeysLoading && !promptsLoading ? (
            !hasPrompts ? "No published prompts available" :
            hasPrompts && !selectedPromptId ? "Please select a prompt" :
            hasPrompts && selectedPromptId && !scenarioKey ? "Please select a test scenario" :
            hasPrompts && selectedPromptId && scenarioKey && !hasApiKeys ? "Please configure API keys in Settings" :
            null
          ) : null}
        />
      </div>

      {/* Welcome Dialog */}
      <WelcomeDialog
        isOpen={onboarding.showWelcomeDialog}
        onClose={onboarding.markWelcomeSeen}
        onGetStarted={() => {
          onboarding.markWelcomeSeen();
          // If user needs to create prompts/scenarios, redirect them
          const nextStep = onboarding.getNextStep();
          if (nextStep && nextStep.href !== "/testing") {
            router.push(nextStep.href);
          }
        }}
      />
    </div>
  );
}
