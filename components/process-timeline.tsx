import { cn } from "@/lib/utils"

interface Step {
  title: string
  description: string
}

interface ProcessTimelineProps {
  steps: Step[]
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-200 hidden sm:block" />

      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 hidden sm:block">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 z-10 relative",
                    "bg-white border-primary-500 text-primary-500 font-bold",
                  )}
                >
                  {index + 1}
                </div>
              </div>
              <div className="sm:pt-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 z-10 relative sm:hidden",
                      "bg-white border-primary-500 text-primary-500 font-bold",
                    )}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                </div>
                <div className="card-base p-4">
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

