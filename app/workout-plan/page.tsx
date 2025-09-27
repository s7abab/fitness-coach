'use client';

import React from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import WorkoutPlanDisplay from '../components/workout/WorkoutPlanDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutPlanPage() {
  const { state, generateWorkoutPlan } = useWorkout();
  const { state: onboardingState } = useOnboarding();

  const handleRegenerate = async () => {
    console.log('Regenerate button clicked');
    console.log('Onboarding state:', onboardingState);
    console.log('Is complete:', onboardingState.isComplete);
    console.log('Workout state:', state);
    
    // Check if we have the minimum required data for regeneration
    const hasRequiredData = onboardingState.data.name && 
                           onboardingState.data.age && 
                           onboardingState.data.fitnessLevel && 
                           onboardingState.data.goals.length > 0;
    
    console.log('Has required data:', hasRequiredData);
    
    if (onboardingState.isComplete || hasRequiredData) {
      console.log('Starting workout generation with data:', onboardingState.data);
      try {
        await generateWorkoutPlan(onboardingState.data);
        console.log('Workout generation completed');
      } catch (error) {
        console.error('Error during regeneration:', error);
      }
    } else {
      console.log('Onboarding not complete or missing required data, cannot regenerate');
      console.log('Missing data:', {
        name: !onboardingState.data.name,
        age: !onboardingState.data.age,
        fitnessLevel: !onboardingState.data.fitnessLevel,
        goals: onboardingState.data.goals.length === 0
      });
    }
  };

  if (!state.currentWorkoutPlan) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>No Workout Plan Found</CardTitle>
              <CardDescription>
                You need to generate a workout plan first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please complete the onboarding process to generate your personalized workout plan.
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Link href="/">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go to Onboarding
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Your Workout Plan</h1>
              <p className="text-muted-foreground">
                Generated on {new Date(state.currentWorkoutPlan.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Setup
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <WorkoutPlanDisplay 
        workoutPlan={state.currentWorkoutPlan} 
        onRegenerate={handleRegenerate}
        isRegenerating={state.isGenerating}
      />
    </div>
  );
}
