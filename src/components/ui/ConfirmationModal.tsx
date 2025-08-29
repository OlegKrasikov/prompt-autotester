'use client'

import React from 'react';
import { Modal, ModalContent, ModalFooter } from './Modal';
import { Button, ButtonProps } from './Button';
import { formatMultilineMessage } from '@/utils/formatMessage';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: ButtonProps['variant'];
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  cancelText = 'Cancel',
  isLoading = false
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="md"
    >
      <ModalContent>
        <div className="space-y-4">
          {/* Message */}
          <div className="text-[color:var(--color-foreground)]">
            {formatMultilineMessage(message)}
          </div>

          {/* Warning icon for danger confirmations */}
          {confirmVariant === 'danger' && (
            <div className="flex items-center gap-2 p-3 rounded-[var(--radius)] bg-[color:var(--color-danger)]/10 border border-[color:var(--color-danger)]/20">
              <div className="w-5 h-5 text-[color:var(--color-danger)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <p className="text-sm text-[color:var(--color-danger)]">
                This action cannot be undone.
              </p>
            </div>
          )}
        </div>
      </ModalContent>

      <ModalFooter>
        <Button 
          variant="secondary" 
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button 
          variant={confirmVariant} 
          onClick={handleConfirm}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}