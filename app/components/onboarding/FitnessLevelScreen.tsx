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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-indigo-400/3 to-cyan-400/5"></div>
      <div className="absolute top-20 left-10 w-28 h-28 bg-blue-400/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-36 h-36 bg-cyan-400/10 rounded-full blur-xl"></div>
      
      <div className="max-w-4xl mx-auto px-2 relative">
        <ProgressStepper currentStep={3} totalSteps={7} className="mb-8" />
        
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
          <CardHeader className="text-center pb-6 pt-8">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              What's your current fitness level?
            </CardTitle>
            <CardDescription className="text-xl text-gray-600 font-medium">
              This helps us tailor the perfect workout intensity for you
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {fitnessLevels.map((level) => (
                <Card
                  key={level.id}
                  onClick={() => handleLevelSelect(level.id)}
                  className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                    state.data.fitnessLevel === level.id
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:shadow-md'
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
                      <div className="text-4xl mb-4">{level.icon}</div>
                      <h3 className="text-xl font-semibold mb-2">{level.title}</h3>
                      <p className="text-muted-foreground mb-4">{level.description}</p>
                      
                      <div className="text-left space-y-2">
                        {level.details.map((detail, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-muted-foreground">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Info */}
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Don't worry about being perfect!</h4>
                    <p className="text-sm text-muted-foreground">
                      You can always adjust your fitness level later as you progress. 
                      We'll start with workouts that match your current abilities and gradually increase the challenge.
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
              disabled={!state.data.fitnessLevel}
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
