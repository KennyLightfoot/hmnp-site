"use client";

interface SkipNavigationProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}

export function SkipNavigation({ links }: SkipNavigationProps) {
  const defaultLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#service-selection', label: 'Skip to service selection' },
    { href: '#booking-form', label: 'Skip to booking form' },
    { href: '#contact-info', label: 'Skip to contact information' },
  ];

  const navigationLinks = links || defaultLinks;

  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-lg p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-3">Skip Navigation</h2>
          <nav aria-label="Skip navigation links">
            <ul className="flex flex-wrap gap-4">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    onClick={(e) => {
                      const target = document.querySelector(link.href);
                      if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // Focus the target element if it's focusable
                        if (target instanceof HTMLElement) {
                          target.focus();
                        }
                      }
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function StepNavigation({ 
  currentStep, 
  totalSteps, 
  onStepChange 
}: { 
  currentStep: number; 
  totalSteps: number; 
  onStepChange: (step: number) => void;
}) {
  return (
    <nav aria-label="Booking steps navigation" className="mb-6">
      <h2 className="sr-only">Booking Progress</h2>
      <ol className="flex items-center justify-center space-x-2 md:space-x-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const isAccessible = step <= currentStep;

          return (
            <li key={step} className="flex items-center">
              <button
                type="button"
                onClick={() => isAccessible && onStepChange(step)}
                disabled={!isAccessible}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  ${isActive 
                    ? 'bg-indigo-600 text-white' 
                    : isCompleted 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : isAccessible
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${step}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
              >
                {isCompleted ? '✓' : step}
              </button>
              
              {step < totalSteps && (
                <div className={`
                  w-8 md:w-12 h-0.5 mx-1
                  ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'}
                `} 
                aria-hidden="true" 
                />
              )}
            </li>
          );
        })}
      </ol>
      
      <div className="text-center mt-2">
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </nav>
  );
}