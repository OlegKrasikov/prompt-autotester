"use client";

import React from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export function WelcomeDialog({ isOpen, onClose, onGetStarted }: WelcomeDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to Prompt Autotester!" size="md">
      <ModalContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[color:var(--color-accent)] rounded-2xl flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/>
                <path d="M2 6h4"/>
                <path d="M2 10h4"/>
                <path d="M2 14h4"/>
                <path d="M2 18h4"/>
                <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-2">
              Ready to Test Your Prompts?
            </h2>
            <p className="text-sm text-[color:var(--color-muted-foreground)] mb-6">
              Compare different prompt versions side-by-side with real AI conversations to find what works best.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[color:var(--color-accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[color:var(--color-accent)]">1</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[color:var(--color-foreground)]">Create Prompts</h3>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">Write and manage different versions of your AI prompts</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[color:var(--color-accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[color:var(--color-accent)]">2</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[color:var(--color-foreground)]">Define Scenarios</h3>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">Set up conversation flows to test how prompts perform</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[color:var(--color-accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[color:var(--color-accent)]">3</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[color:var(--color-foreground)]">Compare Results</h3>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">Run real-time comparisons and see which prompts work better</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-[color:var(--color-surface-1)] rounded-[var(--radius)] border border-[color:var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-accent)]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span className="text-sm font-medium text-[color:var(--color-foreground)]">Pro Tip</span>
            </div>
            <p className="text-xs text-[color:var(--color-muted-foreground)]">
              Use <kbd className="px-1.5 py-0.5 text-xs bg-[color:var(--color-surface-2)] rounded border">⌘+Enter</kbd> to quickly run simulations and <kbd className="px-1.5 py-0.5 text-xs bg-[color:var(--color-surface-2)] rounded border">⌘+1/2/3</kbd> to switch between scenarios!
            </p>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Skip for Now
        </Button>
        <Button variant="primary" onClick={onGetStarted}>
          Get Started
        </Button>
      </ModalFooter>
    </Modal>
  );
}