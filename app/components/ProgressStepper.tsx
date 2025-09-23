'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const steps = [
  { number: 1, title: 'Welcome' },
  { number: 2, title: 'Personal Info' },
  { number: 3, title: 'Fitness Level' },
  { number: 4, title: 'Goals' },
  { number: 5, title: 'Preferences' },
  { number: 6, title: 'Health & Safety' },
  { number: 7, title: 'Complete' },
];

export default function ProgressStepper({ currentStep, totalSteps, className = '' }: ProgressStepperProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Progress value={progressPercentage} className="h-2 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-full opacity-20"></div>
        </div>
        <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-600 mt-2">
          <span className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
            <span>Step {currentStep} of {totalSteps}</span>
          </span>
          <span className="flex items-center space-x-1 sm:space-x-2">
            <span>{Math.round(progressPercentage)}% complete</span>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full"></div>
          </span>
        </div>
      </div>
      
      {/* Desktop Step Indicators - Full View */}
      <div className="hidden md:flex justify-between items-center">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center group">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step.number <= currentStep
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transform hover:scale-110'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <Badge
              variant={step.number <= currentStep ? 'default' : 'secondary'}
              className={`text-xs mt-3 px-3 py-1 rounded-full transition-all duration-300 ${
                step.number <= currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {step.title}
            </Badge>
          </div>
        ))}
      </div>

      {/* Mobile Step Indicators - Clean View */}
      <div className="md:hidden">
        {/* Current Step Display */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg font-bold shadow-lg mb-2">
            {currentStep}
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {steps[currentStep - 1]?.title}
          </h3>
        </div>

        {/* Mobile Progress Dots */}
        <div className="flex justify-center space-x-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index < currentStep
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md'
                  : index === currentStep - 1
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 ring-2 ring-blue-200 scale-110'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
