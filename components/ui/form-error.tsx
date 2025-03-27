import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  message: string
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <div className="bg-destructive/10 p-3 rounded-md border border-destructive flex items-start gap-2" role="alert">
      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
      <p className="text-destructive text-sm">{message}</p>
    </div>
  )
}

