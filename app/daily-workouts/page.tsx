'use client';

import React, { useState, useEffect } from 'react';
import { useWorkout, WorkoutProvider } from '../contexts/WorkoutContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle, 
  Circle, 
  Play, 
  Pause, 
  RotateCcw,
  Trophy,
  TrendingUp,
  ArrowLeft,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { WorkoutDay, Exercise } from '@/lib/types/workout';
import VideoPlayer from '../components/workout/VideoPlayer';

function DailyWorkoutsPageContent() {
  const { 
    state, 
    startDailyWorkout, 
    completeExercise, 
    finishDailyWorkout, 
    getTodaysWorkout,
    calculateProgress 
  } = useWorkout();
  const { state: onboardingState } = useOnboarding();

  const [currentDay, setCurrentDay] = useState<WorkoutDay | null>(null);
  const [workoutRating, setWorkoutRating] = useState<number>(0);
  const [workoutNotes, setWorkoutNotes] = useState<string>('');
  const [showFinishModal, setShowFinishModal] = useState(false);

  const todaysWorkout = getTodaysWorkout();
  const progress = calculateProgress();

  useEffect(() => {
    if (state.currentWorkoutPlan && todaysWorkout) {
      const day = state.currentWorkoutPlan.days.find(d => d.day === todaysWorkout.dayName);
      setCurrentDay(day || null);
    }
  }, [state.currentWorkoutPlan, todaysWorkout]);

  const handleStartWorkout = (dayName: string) => {
    startDailyWorkout(dayName);
    const day = state.currentWorkoutPlan?.days.find(d => d.day === dayName);
    setCurrentDay(day || null);
  };

  const handleCompleteExercise = (exerciseName: string) => {
    completeExercise(exerciseName);
  };

  const handleFinishWorkout = () => {
    finishDailyWorkout(workoutRating > 0 ? workoutRating : undefined, workoutNotes);
    setShowFinishModal(false);
    setWorkoutRating(0);
    setWorkoutNotes('');
    setCurrentDay(null);
  };

  const getExerciseProgress = () => {
    if (!currentDay || !todaysWorkout) return { completed: 0, total: 0 };
    
    const allExercises = [
      ...(currentDay.warmup || []),
      ...currentDay.exercises,
      ...(currentDay.cooldown || [])
    ];
    
    const completed = todaysWorkout.completedExercises.length;
    const total = allExercises.length;
    
    return { completed, total };
  };

  const isExerciseCompleted = (exerciseName: string) => {
    return todaysWorkout?.completedExercises.includes(exerciseName) || false;
  };

  const getWorkoutStatus = () => {
    if (!state.currentWorkoutPlan) return 'no-plan';
    if (!todaysWorkout) return 'not-started';
    if (todaysWorkout.isCompleted) return 'completed';
    return 'in-progress';
  };

  const status = getWorkoutStatus();

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
                <Target className="h-4 w-4" />
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
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold">Daily Workouts</h1>
          <p className="text-muted-foreground">
            Track your daily fitness journey
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Your Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{progress.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{progress.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Longest Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{progress.completedSessions}</div>
                <div className="text-sm text-muted-foreground">Workouts Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {progress.totalSessions > 0 ? Math.round((progress.completedSessions / progress.totalSessions) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Workout Status */}
        {status === 'no-plan' && (
          <Card>
            <CardHeader>
              <CardTitle>No Workout Plan</CardTitle>
              <CardDescription>
                Generate a workout plan to start your fitness journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button>Generate Workout Plan</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {status === 'not-started' && (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Work Out?</CardTitle>
              <CardDescription>
                Choose a workout day to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.currentWorkoutPlan.days.map((day) => (
                  <Card key={day.day} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => handleStartWorkout(day.day)}
                    >
                      <CardTitle className="text-lg">{day.day}</CardTitle>
                      <CardDescription>
                        {day.focus} • {day.duration} minutes
                      </CardDescription>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline">{day.exercises.length} exercises</Badge>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Workout Completed!</span>
              </CardTitle>
              <CardDescription>
                Great job! You completed your {todaysWorkout?.dayName} workout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button onClick={() => handleStartWorkout(todaysWorkout?.dayName || '')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Repeat Workout
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentDay(null)}
                >
                  View Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Progress Workout */}
        {status === 'in-progress' && currentDay && todaysWorkout && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5 text-blue-600" />
                    <span>{currentDay.day} Workout</span>
                  </CardTitle>
                  <CardDescription>
                    {currentDay.focus} • {currentDay.duration} minutes
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  In Progress
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {getExerciseProgress().completed} / {getExerciseProgress().total} exercises
                  </span>
                </div>
                <Progress 
                  value={(getExerciseProgress().completed / getExerciseProgress().total) * 100} 
                  className="h-2"
                />
              </div>

              {/* Warm-up */}
              {currentDay.warmup && currentDay.warmup.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-base mb-3 text-green-600">Warm-up</h4>
                  <div className="space-y-3">
                    {currentDay.warmup.map((exercise, index) => (
                      <ExerciseItem
                        key={`warmup-${index}`}
                        exercise={exercise}
                        index={index}
                        isCompleted={isExerciseCompleted(exercise.name)}
                        onToggle={() => handleCompleteExercise(exercise.name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Main Exercises */}
              <div className="mb-6">
                <h4 className="font-semibold text-base mb-3">Main Workout</h4>
                <div className="space-y-3">
                  {currentDay.exercises.map((exercise, index) => (
                    <ExerciseItem
                      key={`exercise-${index}`}
                      exercise={exercise}
                      index={index}
                      isCompleted={isExerciseCompleted(exercise.name)}
                      onToggle={() => handleCompleteExercise(exercise.name)}
                    />
                  ))}
                </div>
              </div>

              {/* Cool-down */}
              {currentDay.cooldown && currentDay.cooldown.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-base mb-3 text-blue-600">Cool-down</h4>
                  <div className="space-y-3">
                    {currentDay.cooldown.map((exercise, index) => (
                      <ExerciseItem
                        key={`cooldown-${index}`}
                        exercise={exercise}
                        index={index}
                        isCompleted={isExerciseCompleted(exercise.name)}
                        onToggle={() => handleCompleteExercise(exercise.name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Finish Workout Button */}
              <div className="mt-6 pt-4 border-t">
                <Button 
                  onClick={() => setShowFinishModal(true)}
                  className="w-full"
                  size="lg"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Finish Workout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Finish Workout Modal */}
        {showFinishModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Finish Workout</CardTitle>
                <CardDescription>
                  Rate your workout and add any notes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rate your workout (1-5)</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={workoutRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWorkoutRating(rating)}
                        className="p-2"
                      >
                        <Star className={`h-4 w-4 ${workoutRating >= rating ? 'fill-current' : ''}`} />
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                  <textarea
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="How did you feel? Any observations..."
                    className="w-full p-2 border rounded-md resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFinishModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleFinishWorkout}
                    className="flex-1"
                  >
                    Finish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

interface ExerciseItemProps {
  exercise: Exercise;
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
}

function ExerciseItem({ exercise, index, isCompleted, onToggle }: ExerciseItemProps) {
  return (
    <Card className={`transition-colors ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1 h-8 w-8"
          >
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">{exercise.name}</h5>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{exercise.sets} sets × {exercise.reps}</span>
                <span>•</span>
                <span>{exercise.restTime} rest</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
            {exercise.videoUrl && (
              <div className="mt-2">
                <VideoPlayer
                  videoUrl={exercise.videoUrl}
                  videoThumbnail={exercise.videoThumbnail}
                  exerciseName={exercise.name}
                  className="w-full"
                  autoSearch={false}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DailyWorkoutsPage() {
  return (
    <WorkoutProvider>
      <DailyWorkoutsPageContent />
    </WorkoutProvider>
  );
}
