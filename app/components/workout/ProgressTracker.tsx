'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Calendar, Target } from 'lucide-react';
import { WorkoutProgress } from '@/lib/types/workout';

interface ProgressTrackerProps {
  progress: WorkoutProgress;
}

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  const completionRate = progress.totalSessions > 0 
    ? Math.round((progress.completedSessions / progress.totalSessions) * 100) 
    : 0;

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStreakBadgeVariant = (streak: number) => {
    if (streak >= 7) return 'default';
    if (streak >= 3) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Your Progress</span>
          </CardTitle>
          <CardDescription>
            Track your fitness journey and stay motivated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStreakColor(progress.currentStreak)}`}>
                {progress.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
              <Badge variant={getStreakBadgeVariant(progress.currentStreak)} className="mt-1">
                {progress.currentStreak >= 7 ? 'On Fire!' : 
                 progress.currentStreak >= 3 ? 'Great!' : 
                 progress.currentStreak > 0 ? 'Keep Going!' : 'Start Today!'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{progress.longestStreak}</div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
              <Badge variant="outline" className="mt-1">
                <Trophy className="h-3 w-3 mr-1" />
                Best
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{progress.completedSessions}</div>
              <div className="text-sm text-muted-foreground">Workouts Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{completionRate}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Completion Rate</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progress.completedSessions} / {progress.totalSessions} workouts</span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <div className="text-xs text-muted-foreground text-center">
              {completionRate >= 80 ? 'Excellent consistency!' :
               completionRate >= 60 ? 'Great progress!' :
               completionRate >= 40 ? 'Good start!' :
               'Keep building momentum!'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      {Object.keys(progress.weeklyProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Weekly Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(progress.weeklyProgress)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .slice(0, 4) // Show last 4 weeks
                .map(([week, data]) => {
                  const weekStart = new Date(week);
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  
                  const weekRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                  
                  return (
                    <div key={week} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span>{data.completed} / {data.total} workouts</span>
                      </div>
                      <Progress value={weekRate} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Workout */}
      {progress.lastWorkoutDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {new Date(progress.lastWorkoutDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
