import { CheckCircle2 } from "lucide-react"

interface FormSuccessProps {
  message: string
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null

  return (
    <div className="bg-green-100 p-3 rounded-md border border-green-500 flex items-start gap-2" role="status">
      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
      <p className="text-green-800 text-sm">{message}</p>
    </div>
  )
}

