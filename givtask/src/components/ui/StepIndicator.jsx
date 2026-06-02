import React from 'react'
import { Check } from 'lucide-react'

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8 md:mb-10">
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isUpcoming = stepNum > currentStep

        return (
          <React.Fragment key={step.label || stepNum}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : isActive
                    ? 'bg-royal-600 text-white shadow-md ring-4 ring-royal-100'
                    : 'bg-white text-slate-400 border-2 border-[#E2E8F0]'
                  }
                `}
              >
                {isCompleted ? <Check size={16} strokeWidth={2.5} /> : stepNum}
              </div>
              {step.label && (
                <span
                  className={`mt-1.5 text-xs font-medium hidden sm:block transition-colors duration-200
                    ${isActive ? 'text-royal-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}
                  `}
                >
                  {step.label}
                </span>
              )}
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 mb-4 sm:mb-5">
                <div
                  className={`h-[2px] rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-400' : 'bg-[#E2E8F0]'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
