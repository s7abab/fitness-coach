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
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
      </div>
      
      {/* Desktop Step Indicators - Full View */}
      <div className="hidden md:flex justify-between items-center">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step.number <= currentStep
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                step.number
              )}
            </div>
            <Badge
              variant={step.number <= currentStep ? 'default' : 'secondary'}
              className={`text-xs mt-2 ${
                step.number <= currentStep ? 'bg-primary text-primary-foreground' : ''
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-lg mb-2">
            {currentStep}
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {steps[currentStep - 1]?.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Mobile Progress Dots */}
        <div className="flex justify-center space-x-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index < currentStep
                  ? 'bg-primary'
                  : index === currentStep - 1
                  ? 'bg-primary ring-2 ring-primary/20'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
