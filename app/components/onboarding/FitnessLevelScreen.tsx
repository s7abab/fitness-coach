'use client';

import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressStepper from '../ProgressStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const fitnessLevels = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'New to exercise or returning after a long break',
    icon: '🌱',
    details: [
      'Little to no exercise experience',
      'May feel intimidated by gym equipment',
      'Looking to build basic fitness foundation'
    ]
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Exercise 1-3 times per week regularly',
    icon: '💪',
    details: [
      'Some experience with basic exercises',
      'Comfortable with fundamental movements',
      'Ready to increase intensity gradually'
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Exercise 4+ times per week consistently',
    icon: '🔥',
    details: [
      'Experienced with various exercise types',
      'Can handle challenging workouts',
      'Looking to optimize performance'
    ]
  },
  {
    id: 'athlete',
    title: 'Athlete',
    description: 'Professional or competitive level training',
    icon: '🏆',
    details: [
      'Elite fitness level',
      'Competitive or professional training',
      'Seeking peak performance optimization'
    ]
  }
];

export default function FitnessLevelScreen() {
  const { state, dispatch } = useOnboarding();

  const handleLevelSelect = (level: string) => {
    dispatch({ type: 'UPDATE_DATA', data: { fitnessLevel: level } });
  };

  const handleNext = () => {
    if (state.data.fitnessLevel) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto px-2">
        <ProgressStepper currentStep={3} totalSteps={7} className="mb-8" />
        
        <Card className="border shadow-sm animate-fade-in">
          <CardHeader className="text-center pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-foreground">
              What's your current fitness level?
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              This helps us tailor the perfect workout intensity for you
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {fitnessLevels.map((level) => (
                <Card
                  key={level.id}
                  onClick={() => handleLevelSelect(level.id)}
                  className={`relative cursor-pointer transition-colors hover:bg-muted/50 ${
                    state.data.fitnessLevel === level.id
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                >
                  {/* Selection indicator */}
                  {state.data.fitnessLevel === level.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl mb-3">{level.icon}</div>
                      <h3 className="text-lg font-semibold mb-2">{level.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{level.description}</p>
                      
                      <div className="text-left space-y-1">
                        {level.details.map((detail, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-xs text-muted-foreground">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1 text-foreground">Don't worry about being perfect!</h4>
                  <p className="text-xs text-muted-foreground">
                    You can always adjust your fitness level later as you progress. 
                    We'll start with workouts that match your current abilities.
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
              disabled={!state.data.fitnessLevel}
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
