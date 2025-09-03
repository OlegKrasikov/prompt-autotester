'use client';

import { EmptyState, EmptyStateIcons } from '@/components/ui/EmptyState';

export default function AccessDenied() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 md:px-10">
      <EmptyState
        icon={EmptyStateIcons.Settings}
        title="You don’t have access to Settings"
        description="Only organization admins can view and manage settings. Please contact an admin if you need access."
        action={{
          label: 'Back to Home',
          onClick: () => (window.location.href = '/'),
          variant: 'secondary',
        }}
      />
    </div>
  );
}
