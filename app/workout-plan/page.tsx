'use client';

import React from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import WorkoutPlanDisplay from '../components/workout/WorkoutPlanDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutPlanPage() {
  const { state } = useWorkout();

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
      
      <WorkoutPlanDisplay workoutPlan={state.currentWorkoutPlan} />
    </div>
  );
}
