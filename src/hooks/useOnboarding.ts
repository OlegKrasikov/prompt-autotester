import { useState, useEffect } from 'react';

interface OnboardingState {
  hasSeenWelcome: boolean;
  hasCreatedPrompt: boolean;
  hasCreatedScenario: boolean;
  hasRunFirstTest: boolean;
}

export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    hasSeenWelcome: false,
    hasCreatedPrompt: false,
    hasCreatedScenario: false,
    hasRunFirstTest: false,
  });

  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  // Load onboarding state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('onboarding-state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOnboardingState(parsed);
        
        // Show welcome dialog if user hasn't seen it
        if (!parsed.hasSeenWelcome) {
          setTimeout(() => setShowWelcomeDialog(true), 1000);
        }
      } catch (e) {
        console.error('Failed to parse onboarding state:', e);
      }
    } else {
      // First time user - show welcome dialog
      setTimeout(() => setShowWelcomeDialog(true), 1000);
    }
  }, []);

  // Save onboarding state to localStorage
  const updateOnboardingState = (updates: Partial<OnboardingState>) => {
    const newState = { ...onboardingState, ...updates };
    setOnboardingState(newState);
    localStorage.setItem('onboarding-state', JSON.stringify(newState));
  };

  const markWelcomeSeen = () => {
    updateOnboardingState({ hasSeenWelcome: true });
    setShowWelcomeDialog(false);
  };

  const markPromptCreated = () => {
    updateOnboardingState({ hasCreatedPrompt: true });
  };

  const markScenarioCreated = () => {
    updateOnboardingState({ hasCreatedScenario: true });
  };

  const markFirstTestRun = () => {
    updateOnboardingState({ hasRunFirstTest: true });
  };

  const isNewUser = () => {
    return !onboardingState.hasSeenWelcome;
  };

  const needsBasicSetup = () => {
    return !onboardingState.hasCreatedPrompt || !onboardingState.hasCreatedScenario;
  };

  const getNextStep = () => {
    if (!onboardingState.hasCreatedPrompt) {
      return {
        title: "Create Your First Prompt",
        description: "Start by creating a prompt to test different AI behaviors",
        action: "Create Prompt",
        href: "/prompts/new"
      };
    }
    
    if (!onboardingState.hasCreatedScenario) {
      return {
        title: "Create a Test Scenario", 
        description: "Define conversation flows to test your prompts against",
        action: "Create Scenario",
        href: "/scenarios/new"
      };
    }
    
    if (!onboardingState.hasRunFirstTest) {
      return {
        title: "Run Your First Test",
        description: "Test your prompt against scenarios to see how it performs",
        action: "Start Testing",
        href: "/testing"
      };
    }
    
    return null;
  };

  return {
    onboardingState,
    showWelcomeDialog,
    markWelcomeSeen,
    markPromptCreated,
    markScenarioCreated,  
    markFirstTestRun,
    isNewUser,
    needsBasicSetup,
    getNextStep,
    setShowWelcomeDialog
  };
}