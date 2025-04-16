import { CheckCircle2 } from "lucide-react"

interface FormSuccessProps {
  message?: string
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null

  return (
    <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-600 mt-2">
      <CheckCircle2 className="h-4 w-4" />
      <p>{message}</p>
    </div>
  )
}
