'use client';

import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressStepper from '../ProgressStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';

const fitnessGoals = [
  {
    id: 'lose-weight',
    title: 'Lose Weight',
    description: 'Burn fat and achieve a healthier body composition',
    icon: '⚖️'
  },
  {
    id: 'build-muscle',
    title: 'Build Muscle',
    description: 'Increase muscle mass and strength',
    icon: '💪'
  },
  {
    id: 'improve-endurance',
    title: 'Improve Endurance',
    description: 'Build cardiovascular fitness and stamina',
    icon: '🏃'
  },
  {
    id: 'increase-flexibility',
    title: 'Increase Flexibility',
    description: 'Improve mobility and range of motion',
    icon: '🧘'
  },
  {
    id: 'general-health',
    title: 'General Health',
    description: 'Maintain overall wellness and energy',
    icon: '❤️'
  },
  {
    id: 'sport-specific',
    title: 'Sport-Specific Training',
    description: 'Improve performance in a specific sport',
    icon: '⚽'
  }
];

export default function GoalsScreen() {
  const { state, dispatch } = useOnboarding();
  const [customGoal, setCustomGoal] = useState(state.data.customGoal);

  const handleGoalToggle = (goalId: string) => {
    const currentGoals = state.data.goals;
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(goal => goal !== goalId)
      : [...currentGoals, goalId];
    
    dispatch({ type: 'UPDATE_DATA', data: { goals: newGoals } });
  };

  const handleCustomGoalChange = (value: string) => {
    setCustomGoal(value);
    dispatch({ type: 'UPDATE_DATA', data: { customGoal: value } });
  };

  const handleNext = () => {
    if (state.data.goals.length > 0 || customGoal.trim()) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto px-2">
        <ProgressStepper currentStep={4} totalSteps={7} className="mb-8" />
        
        <Card className="border shadow-sm animate-fade-in">
          <CardHeader className="text-center pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-foreground">What are your fitness goals?</CardTitle>
            <CardDescription className="text-base text-muted-foreground">Select all that apply - you can choose multiple goals!</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fitnessGoals.map((goal) => (
                <Card
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id)}
                  className={`relative cursor-pointer transition-colors hover:bg-muted/50 ${
                    state.data.goals.includes(goal.id)
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                >
                  {/* Selection indicator */}
                  {state.data.goals.includes(goal.id) && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}

                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {goal.icon}
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Goal Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Have a different goal? Tell us about it:
              </label>
              <Textarea
                value={customGoal}
                onChange={(e) => handleCustomGoalChange(e.target.value)}
                placeholder="e.g., Prepare for a marathon, improve posture, get stronger for rock climbing..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Selected Goals Summary */}
            {state.data.goals.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2 text-foreground">Selected Goals:</h4>
                <div className="flex flex-wrap gap-2">
                  {state.data.goals.map((goalId) => {
                    const goal = fitnessGoals.find(g => g.id === goalId);
                    return (
                      <Badge key={goalId} variant="secondary" className="text-xs">
                        {goal?.icon} {goal?.title}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Motivation */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1 text-foreground">You're on the right track!</h4>
                  <p className="text-xs text-muted-foreground">
                    Having clear goals helps our AI create more effective and personalized workout plans.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6 pt-0">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="px-6 h-10"
            >
              ← Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={state.data.goals.length === 0 && !customGoal.trim()}
              className="px-8 h-10"
              size="lg"
            >
              Next →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
