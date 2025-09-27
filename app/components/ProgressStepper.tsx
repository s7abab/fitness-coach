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
      <div className="mb-6">
        <Progress value={progressPercentage} className="h-2 bg-muted" />
        <div className="flex justify-between text-sm font-medium text-muted-foreground mt-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
      </div>
      
      {/* Desktop Step Indicators - Full View */}
      <div className="hidden md:flex justify-between items-center">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center group">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step.number <= currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-xs mt-2 px-2 py-1 rounded transition-colors ${
                step.number <= currentStep 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground'
              }`}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile Step Indicators - Clean View */}
      <div className="md:hidden">
        {/* Current Step Display */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium mb-2">
            {currentStep}
          </div>
          <h3 className="text-base font-medium text-foreground">
            {steps[currentStep - 1]?.title}
          </h3>
        </div>

        {/* Mobile Progress Dots */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index < currentStep
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
