'use client';

import React from 'react';
import { useWorkout, WorkoutProvider } from '../contexts/WorkoutContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Play, 
  Target, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import ProgressTracker from '../components/workout/ProgressTracker';

function DashboardPageContent() {
  const { state, getTodaysWorkout, calculateProgress } = useWorkout();
  const { state: onboardingState } = useOnboarding();

  const todaysWorkout = getTodaysWorkout();
  const progress = calculateProgress();

  if (!state.currentWorkoutPlan) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Fitness Dashboard</CardTitle>
              <CardDescription>
                Get started by creating your personalized workout plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Complete the onboarding process to generate your personalized workout plan.
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Link href="/">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getWorkoutStatus = () => {
    if (!todaysWorkout) return 'not-started';
    if (todaysWorkout.isCompleted) return 'completed';
    return 'in-progress';
  };

  const status = getWorkoutStatus();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysPlan = state.currentWorkoutPlan.days.find(day => day.day === today);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold">Fitness Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {onboardingState.data.name || 'Fitness Enthusiast'}!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Today's Workout Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Today's Workout - {today}</span>
            </CardTitle>
            <CardDescription>
              {todaysPlan ? `${todaysPlan.focus} • ${todaysPlan.duration} minutes` : 'No workout scheduled for today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!todaysPlan ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No workout scheduled for today</p>
                <Link href="/daily-workouts">
                  <Button>Choose a Workout</Button>
                </Link>
              </div>
            ) : status === 'not-started' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{todaysPlan.focus}</h3>
                    <p className="text-sm text-muted-foreground">
                      {todaysPlan.exercises.length} exercises • {todaysPlan.duration} minutes
                    </p>
                  </div>
                  <Badge variant="outline">Ready to Start</Badge>
                </div>
                <Link href="/daily-workouts">
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Today's Workout
                  </Button>
                </Link>
              </div>
            ) : status === 'in-progress' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{todaysPlan.focus}</h3>
                    <p className="text-sm text-muted-foreground">
                      {todaysWorkout?.completedExercises.length || 0} / {todaysPlan.exercises.length} exercises completed
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
                <Link href="/daily-workouts">
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Workout
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-600">{todaysPlan.focus}</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed! Great job today.
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Link href="/daily-workouts">
                    <Button variant="outline" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Repeat Workout
                    </Button>
                  </Link>
                  <Link href="/daily-workouts">
                    <Button className="flex-1">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Next Workout
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Current Streak</p>
                  <p className="text-2xl font-bold">{progress.currentStreak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Workouts Completed</p>
                  <p className="text-2xl font-bold">{progress.completedSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {progress.totalSessions > 0 ? Math.round((progress.completedSessions / progress.totalSessions) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker progress={progress} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Access your fitness tools and track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/daily-workouts">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Daily Workouts</h3>
                        <p className="text-sm text-muted-foreground">
                          Start or continue your workout
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/workout-plan">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Workout Plan</h3>
                        <p className="text-sm text-muted-foreground">
                          View your complete workout schedule
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <WorkoutProvider>
      <DashboardPageContent />
    </WorkoutProvider>
  );
}
