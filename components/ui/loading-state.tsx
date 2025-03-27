import { LoadingSpinner } from "./loading-spinner"

interface LoadingStateProps {
  text?: string
  className?: string
}

export function LoadingState({ text = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground">{text}</p>
    </div>
  )
}

