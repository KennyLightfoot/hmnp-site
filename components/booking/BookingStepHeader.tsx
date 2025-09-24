import React from "react";

interface Props {
  currentStep: number;
  totalSteps: number;
  completion: number;      // 0-100
  totalPrice?: number;     // optional
}

const BookingStepHeader: React.FC<Props> = ({
  currentStep,
  totalSteps,
  completion,
  totalPrice = 0,
}) => (
  <div className="flex items-center justify-between py-4 px-6 border-b bg-white">
    <span className="text-sm text-gray-600 font-medium">
      Step {currentStep + 1} of {totalSteps}
    </span>

    <div className="flex-1 mx-6 h-1 bg-gray-200 rounded-full overflow-hidden">
      <div
        style={{ width: `${completion}%` }}
        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
      />
    </div>

    <span className="font-semibold text-primary text-lg">
      ${totalPrice.toFixed(2)}
    </span>
  </div>
);

export default BookingStepHeader;