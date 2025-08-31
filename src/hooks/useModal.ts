import { useState, useCallback } from 'react';

export interface ModalState {
  isOpen: boolean;
}

export interface ConfirmModalState extends ModalState {
  itemId: string;
  itemName: string;
}

export interface AlertModalState extends ModalState {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Custom hook for managing basic modal state
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, open, close };
}

/**
 * Custom hook for managing confirmation modal state
 */
export function useConfirmModal() {
  const [state, setState] = useState<ConfirmModalState>({
    isOpen: false,
    itemId: '',
    itemName: '',
  });

  const open = useCallback((itemId: string, itemName: string) => {
    setState({
      isOpen: true,
      itemId,
      itemName,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      itemId: '',
      itemName: '',
    });
  }, []);

  return { ...state, open, close };
}

/**
 * Custom hook for managing alert modal state
 */
export function useAlertModal() {
  const [state, setState] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const open = useCallback(
    (title: string, message: string, type: AlertModalState['type'] = 'info') => {
      setState({
        isOpen: true,
        title,
        message,
        type,
      });
    },
    [],
  );

  const close = useCallback(() => {
    setState({
      isOpen: false,
      title: '',
      message: '',
      type: 'info',
    });
  }, []);

  return { ...state, open, close };
}
