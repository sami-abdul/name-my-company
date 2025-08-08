import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({ message = "Loading...", size = "md" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      <span className="text-neutral-600 dark:text-neutral-400">{message}</span>
    </div>
  );
}
