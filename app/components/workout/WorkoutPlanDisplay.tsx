'use client';

import React, { useState } from 'react';
import { WorkoutPlan, WorkoutDay, Exercise } from '@/lib/types/workout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Clock, Target, Dumbbell, Users, Calendar, Play, RefreshCw } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface WorkoutPlanDisplayProps {
  workoutPlan: WorkoutPlan;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export default function WorkoutPlanDisplay({ workoutPlan, onRegenerate, isRegenerating = false }: WorkoutPlanDisplayProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  const toggleDay = (dayName: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayName)) {
      newExpanded.delete(dayName);
    } else {
      newExpanded.add(dayName);
    }
    setExpandedDays(newExpanded);
  };

  const toggleExercise = (exerciseName: string) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseName)) {
      newExpanded.delete(exerciseName);
    } else {
      newExpanded.add(exerciseName);
    }
    setExpandedExercises(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ExerciseCard = ({ exercise, index }: { exercise: Exercise; index: number }) => {
    const isExpanded = expandedExercises.has(exercise.name);
    
    return (
      <Card className="mb-4">
        <Collapsible open={isExpanded} onOpenChange={() => toggleExercise(exercise.name)}>
          <CollapsibleTrigger asChild>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <CardDescription>{exercise.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {exercise.videoUrl && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <Play className="h-3 w-3" />
                      <span className="text-xs font-medium">Video</span>
                    </div>
                  )}
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Sets & Reps:</span>
                    <span className="text-sm">{exercise.sets} sets × {exercise.reps}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Rest:</span>
                    <span className="text-sm">{exercise.restTime}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Equipment:</span>
                    <span className="text-sm">{exercise.equipment.join(', ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Muscles:</span>
                    <span className="text-sm">{exercise.muscleGroups.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <VideoPlayer
                videoUrl={exercise.videoUrl}
                videoThumbnail={exercise.videoThumbnail}
                exerciseName={exercise.name}
                className="mb-4"
              />

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {exercise.instructions.map((instruction, idx) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                {exercise.tips && exercise.tips.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Tips:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {exercise.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Workout Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{workoutPlan.name}</CardTitle>
              <CardDescription className="text-base mt-2">{workoutPlan.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getDifficultyColor(workoutPlan.difficulty)}>
                {workoutPlan.difficulty}
              </Badge>
              {onRegenerate && (
                <Button
                  onClick={() => {
                    console.log('Regenerate button clicked in component');
                    onRegenerate();
                  }}
                  disabled={isRegenerating}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Generating...' : 'Regenerate'}</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{workoutPlan.duration}</div>
              <div className="text-sm text-muted-foreground">Weeks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{workoutPlan.frequency}</div>
              <div className="text-sm text-muted-foreground">Days/Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{workoutPlan.days.length}</div>
              <div className="text-sm text-muted-foreground">Workout Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{workoutPlan.equipment.length}</div>
              <div className="text-sm text-muted-foreground">Equipment Types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Your Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {workoutPlan.goals.map((goal, index) => (
              <Badge key={index} variant="secondary">
                {goal}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Workout Schedule</span>
        </h2>
        
        {workoutPlan.days.map((day, dayIndex) => {
          const isExpanded = expandedDays.has(day.day);
          
          return (
            <Card key={day.day}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleDay(day.day)}>
                <CollapsibleTrigger asChild>
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{day.day}</CardTitle>
                        <CardDescription>
                          {day.focus} • {day.duration} minutes
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{day.exercises.length} exercises</Badge>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Warm-up */}
                    {day.warmup && day.warmup.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-base mb-3 text-green-600">Warm-up</h4>
                        {day.warmup.map((exercise, index) => (
                          <ExerciseCard key={`warmup-${index}`} exercise={exercise} index={index} />
                        ))}
                      </div>
                    )}

                    {/* Main Exercises */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-base mb-3">Main Workout</h4>
                      {day.exercises.map((exercise, index) => (
                        <ExerciseCard key={`exercise-${index}`} exercise={exercise} index={index} />
                      ))}
                    </div>

                    {/* Cool-down */}
                    {day.cooldown && day.cooldown.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-base mb-3 text-blue-600">Cool-down</h4>
                        {day.cooldown.map((exercise, index) => (
                          <ExerciseCard key={`cooldown-${index}`} exercise={exercise} index={index} />
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {day.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <h5 className="font-medium text-sm mb-1">Notes:</h5>
                        <p className="text-sm text-muted-foreground">{day.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
