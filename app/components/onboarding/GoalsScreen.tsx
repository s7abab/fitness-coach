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
    icon: '⚖️',
    color: 'from-primary-orange to-primary-orange-light'
  },
  {
    id: 'build-muscle',
    title: 'Build Muscle',
    description: 'Increase muscle mass and strength',
    icon: '💪',
    color: 'from-primary-orange to-primary-orange-dark'
  },
  {
    id: 'improve-endurance',
    title: 'Improve Endurance',
    description: 'Build cardiovascular fitness and stamina',
    icon: '🏃',
    color: 'from-success-green to-success-green-light'
  },
  {
    id: 'increase-flexibility',
    title: 'Increase Flexibility',
    description: 'Improve mobility and range of motion',
    icon: '🧘',
    color: 'from-neutral-blue to-neutral-blue-light'
  },
  {
    id: 'general-health',
    title: 'General Health',
    description: 'Maintain overall wellness and energy',
    icon: '❤️',
    color: 'from-success-green to-neutral-blue'
  },
  {
    id: 'sport-specific',
    title: 'Sport-Specific Training',
    description: 'Improve performance in a specific sport',
    icon: '⚽',
    color: 'from-neutral-blue to-neutral-blue-dark'
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
    <div className="min-h-screen bg-gradient-to-br from-light-gray to-pure-white p-4">
      <div className="max-w-4xl mx-auto px-2">
        <ProgressStepper currentStep={4} totalSteps={7} className="mb-8" />
        
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary-orange to-neutral-blue bg-clip-text text-transparent">What are your fitness goals?</CardTitle>
            <CardDescription className="text-lg text-primary">Select all that apply - you can choose multiple goals!</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fitnessGoals.map((goal) => (
                <Card
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id)}
                  className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                    state.data.goals.includes(goal.id)
                      ? 'ring-2 ring-primary-orange shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                >
                  {/* Selection indicator */}
                  {state.data.goals.includes(goal.id) && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${goal.color} flex items-center justify-center text-2xl`}>
                      {goal.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-primary">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Goal Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">
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
              <Card className="bg-primary-orange/5">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 text-primary">Selected Goals:</h4>
                  <div className="flex flex-wrap gap-2">
                    {state.data.goals.map((goalId) => {
                      const goal = fitnessGoals.find(g => g.id === goalId);
                      return (
                        <Badge key={goalId} variant="secondary" className="text-sm bg-primary-orange/10 text-primary-orange border-primary-orange/20">
                          {goal?.icon} {goal?.title}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Motivation */}
            <Card className="bg-gradient-to-r from-primary-orange/5 to-neutral-blue/10">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-primary">You're on the right track!</h4>
                    <p className="text-sm text-muted-foreground">
                      Having clear goals helps our AI create more effective and personalized workout plans. 
                      We'll track your progress and adjust your training as you achieve milestones.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6 pt-0">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="px-6"
            >
              ← Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={state.data.goals.length === 0 && !customGoal.trim()}
              className="px-8"
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
