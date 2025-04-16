import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  message?: string
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 mt-2">
      <AlertCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  )
}
