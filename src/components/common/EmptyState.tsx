import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <FileQuestion size={32} className="text-[var(--color-text-muted)] mb-3" />
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{message}</p>
      {description && (
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1 max-w-xs">{description}</p>
      )}
    </div>
  );
}
