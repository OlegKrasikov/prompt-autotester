'use client';

import React from 'react';
import { Modal, ModalContent, ModalFooter } from './Modal';
import { Button } from './Button';
import { formatCompactMessage } from '@/utils/formatMessage';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
}: AlertModalProps) {
  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Success"
            >
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          ),
          bgColor: 'bg-[color:var(--color-success)]/10',
          borderColor: 'border-[color:var(--color-success)]/20',
          textColor: 'text-[color:var(--color-success)]',
          iconColor: 'text-[color:var(--color-success)]',
          ariaLabel: 'Success',
        };
      case 'warning':
        return {
          icon: (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Warning"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <path d="M12 17h.01" />
            </svg>
          ),
          bgColor: 'bg-[color:var(--color-warning)]/10',
          borderColor: 'border-[color:var(--color-warning)]/20',
          textColor: 'text-[color:var(--color-warning)]',
          iconColor: 'text-[color:var(--color-warning)]',
          ariaLabel: 'Warning',
        };
      case 'error':
        return {
          icon: (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Error"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ),
          bgColor: 'bg-[color:var(--color-danger)]/10',
          borderColor: 'border-[color:var(--color-danger)]/20',
          textColor: 'text-[color:var(--color-danger)]',
          iconColor: 'text-[color:var(--color-danger)]',
          ariaLabel: 'Error',
        };
      default: // info
        return {
          icon: (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Information"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          ),
          bgColor: 'bg-[color:var(--color-surface)]',
          borderColor: 'border-[color:var(--color-border)]',
          textColor: 'text-[color:var(--color-foreground)]',
          iconColor: 'text-[color:var(--color-muted-foreground)]',
          ariaLabel: 'Information',
        };
    }
  };

  const { icon, bgColor, borderColor, textColor, iconColor, ariaLabel } = getIconAndColors();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <ModalContent>
        <div className="space-y-4">
          {/* Alert message with icon */}
          <div
            className={`rounded-[var(--radius)] p-4 ${bgColor} border ${borderColor}`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 h-5 w-5 ${iconColor}`} role="img" aria-label={ariaLabel}>
                {icon}
              </div>
              <div className={textColor}>{formatCompactMessage(message)}</div>
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          {buttonText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
