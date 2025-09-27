'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useWorkout } from '../../contexts/WorkoutContext';
import ProgressStepper from '../ProgressStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Clock, Heart, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function SetupCompleteScreen() {
  const { state, dispatch } = useOnboarding();
  const { state: workoutState, generateWorkoutPlan, clearError } = useWorkout();
  const [showAnimation, setShowAnimation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Trigger completion and animation
    dispatch({ type: 'COMPLETE' });
    setShowAnimation(true);
  }, [dispatch]);

  const handleStartWorkout = async () => {
    try {
      await generateWorkoutPlan(state.data);
    } catch (error) {
      console.error('Error generating workout plan:', error);
    }
  };

  const handleViewWorkoutPlan = () => {
    router.push('/workout-plan');
  };

  const getFitnessLevelDisplay = (level: string) => {
    const levels = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate', 
      'advanced': 'Advanced',
      'athlete': 'Athlete'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getGoalsDisplay = (goals: string[]) => {
    const goalNames = {
      'lose-weight': 'Lose Weight',
      'build-muscle': 'Build Muscle',
      'improve-endurance': 'Improve Endurance',
      'increase-flexibility': 'Increase Flexibility',
      'general-health': 'General Health',
      'sport-specific': 'Sport-Specific Training'
    };
    return goals.map(goal => goalNames[goal as keyof typeof goalNames] || goal);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <ProgressStepper currentStep={7} totalSteps={7} className="mb-8" />
        
        <Card className="border shadow-sm animate-fade-in">
          {/* Success Animation */}
          <div className="text-center mb-8 p-8">
            <div className={`transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Setup Complete!</h2>
              <p className="text-lg text-muted-foreground">Your AI trainer is ready to help you achieve your goals</p>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Your Fitness Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="text-base font-medium text-foreground border-b border-border pb-2">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{state.data.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{state.data.age} years old</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="font-medium capitalize">{state.data.gender.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Height:</span>
                    <span className="font-medium">
                      {state.data.unitSystem === 'metric' 
                        ? `${state.data.height} cm`
                        : `${Math.floor((state.data.height || 0) / 30.48)}'${Math.floor(((state.data.height || 0) % 30.48) / 2.54)}"`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">
                      {state.data.unitSystem === 'metric' 
                        ? `${state.data.weight} kg`
                        : `${Math.round((state.data.weight || 0) * 2.205)} lbs`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Fitness Profile */}
              <div className="space-y-4">
                <h4 className="text-base font-medium text-foreground border-b border-border pb-2">Fitness Profile</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">{getFitnessLevelDisplay(state.data.fitnessLevel)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{state.data.workoutDuration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium capitalize">{state.data.workoutTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equipment:</span>
                    <span className="font-medium capitalize">{state.data.equipment.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days:</span>
                    <span className="font-medium">{state.data.availableDays.length} days/week</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="mt-6">
              <h4 className="text-base font-medium text-foreground border-b border-border pb-2 mb-3">Your Goals</h4>
              <div className="flex flex-wrap gap-2">
                {getGoalsDisplay(state.data.goals).map((goal, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {goal}
                  </Badge>
                ))}
                {state.data.customGoal && (
                  <Badge variant="secondary" className="text-xs">
                    {state.data.customGoal}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center mb-8">
            <div className="bg-primary rounded-lg p-6 text-primary-foreground">
              <h3 className="text-xl font-bold mb-2">Ready to Transform Your Fitness?</h3>
              <p className="text-primary-foreground/80 mb-4">
                Your personalized AI trainer has analyzed your profile and created a custom workout plan just for you.
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Personalized workouts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Progress tracking</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Flexible scheduling</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {workoutState.error && (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {workoutState.error}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearError}
                    className="ml-2"
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Success Message */}
          {workoutState.currentWorkoutPlan && (
            <div className="p-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your personalized workout plan has been generated successfully! 
                  You can now start your fitness journey.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-4 p-6">
            {!workoutState.currentWorkoutPlan ? (
              <Button
                onClick={handleStartWorkout}
                disabled={workoutState.isGenerating}
                className="w-full md:w-auto h-12 text-base font-medium"
                size="lg"
              >
                {workoutState.isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Your Workout Plan...
                  </>
                ) : (
                  'Generate Your Workout Plan'
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleViewWorkoutPlan}
                  className="w-full md:w-auto h-12 text-base font-medium"
                  size="lg"
                >
                  View Your Workout Plan
                </Button>
                <Button
                  onClick={handleStartWorkout}
                  variant="outline"
                  className="w-full md:w-auto h-10 text-base font-medium"
                  size="lg"
                >
                  Regenerate Workout Plan
                </Button>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              You can always update your preferences in the settings
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
