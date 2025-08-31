# Modal System

Custom React modals replace browser dialogs.

## Components

- `src/components/ui/Modal.tsx`: Base modal with backdrop, ESC, focus trap, scroll lock, ARIA
- `src/components/ui/ConfirmationModal.tsx`: Confirm actions (supports loading, custom labels)
- `src/components/ui/AlertModal.tsx`: Info/success/warning/error alerts

## Hooks

- `useModal()` – boolean open/close
- `useConfirmModal()` – open(id, name), exposes `itemId`, `itemName`
- `useAlertModal()` – open(title, message, type)

## Usage

```tsx
const confirm = useConfirmModal();
<ConfirmationModal
  isOpen={confirm.isOpen}
  onClose={confirm.close}
  onConfirm={handleConfirm}
  title="Delete"
  message={`Delete "${confirm.itemName}"?`}
  confirmVariant="danger"
/>;
```

## Accessibility

- Focus management, ARIA roles/labels, ESC to close, backdrop click, keyboard navigation
