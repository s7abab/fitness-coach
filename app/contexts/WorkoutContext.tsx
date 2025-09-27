'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { WorkoutPlan, WorkoutGenerationRequest, WorkoutGenerationResponse, DailyWorkoutSession, WorkoutProgress } from '@/lib/types/workout';

interface WorkoutState {
  currentWorkoutPlan: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
  isGenerating: boolean;
  notification: string | null;
  dailySessions: DailyWorkoutSession[];
  currentSession: DailyWorkoutSession | null;
  progress: WorkoutProgress | null;
}

type WorkoutAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_GENERATING'; generating: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_WORKOUT_PLAN'; workoutPlan: WorkoutPlan | null }
  | { type: 'SET_NOTIFICATION'; notification: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_NOTIFICATION' }
  | { type: 'RESET' }
  | { type: 'SET_DAILY_SESSIONS'; sessions: DailyWorkoutSession[] }
  | { type: 'ADD_DAILY_SESSION'; session: DailyWorkoutSession }
  | { type: 'UPDATE_DAILY_SESSION'; sessionId: string; updates: Partial<DailyWorkoutSession> }
  | { type: 'SET_CURRENT_SESSION'; session: DailyWorkoutSession | null }
  | { type: 'SET_PROGRESS'; progress: WorkoutProgress };

const initialState: WorkoutState = {
  currentWorkoutPlan: null,
  isLoading: false,
  error: null,
  isGenerating: false,
  notification: null,
  dailySessions: [],
  currentSession: null,
  progress: null,
};

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };
    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.generating,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
        isGenerating: false,
      };
    case 'SET_WORKOUT_PLAN':
      return {
        ...state,
        currentWorkoutPlan: action.workoutPlan,
        isLoading: false,
        isGenerating: false,
        error: null,
      };
    case 'SET_NOTIFICATION':
      return {
        ...state,
        notification: action.notification,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notification: null,
      };
    case 'RESET':
      return initialState;
    case 'SET_DAILY_SESSIONS':
      return {
        ...state,
        dailySessions: action.sessions,
      };
    case 'ADD_DAILY_SESSION':
      return {
        ...state,
        dailySessions: [...state.dailySessions, action.session],
      };
    case 'UPDATE_DAILY_SESSION':
      return {
        ...state,
        dailySessions: state.dailySessions.map(session =>
          session.id === action.sessionId
            ? { ...session, ...action.updates }
            : session
        ),
        currentSession: state.currentSession?.id === action.sessionId
          ? { ...state.currentSession, ...action.updates }
          : state.currentSession,
      };
    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSession: action.session,
      };
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.progress,
      };
    default:
      return state;
  }
}

const WorkoutContext = createContext<{
  state: WorkoutState;
  dispatch: React.Dispatch<WorkoutAction>;
  generateWorkoutPlan: (userProfile: any) => Promise<void>;
  clearError: () => void;
  clearNotification: () => void;
  startDailyWorkout: (dayName: string) => void;
  completeExercise: (exerciseName: string) => void;
  finishDailyWorkout: (rating?: number, notes?: string) => void;
  getTodaysWorkout: () => DailyWorkoutSession | null;
  calculateProgress: () => WorkoutProgress;
} | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  // Load saved workout plan from localStorage on mount
  useEffect(() => {
    const savedWorkoutPlan = localStorage.getItem('fitness-daily-workouts-plan');
    if (savedWorkoutPlan) {
      try {
        const parsedWorkoutPlan = JSON.parse(savedWorkoutPlan);
        dispatch({ type: 'SET_WORKOUT_PLAN', workoutPlan: parsedWorkoutPlan });
      } catch (error) {
        console.error('Failed to load workout plan from localStorage:', error);
      }
    }

    // Load saved daily sessions
    const savedSessions = localStorage.getItem('fitness-daily-workouts-sessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        dispatch({ type: 'SET_DAILY_SESSIONS', sessions: parsedSessions });
      } catch (error) {
        console.error('Failed to load daily sessions from localStorage:', error);
      }
    }
  }, []);

  // Save workout plan to localStorage whenever it changes
  useEffect(() => {
    if (state.currentWorkoutPlan) {
      localStorage.setItem('fitness-daily-workouts-plan', JSON.stringify(state.currentWorkoutPlan));
    }
  }, [state.currentWorkoutPlan]);

  // Save daily sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fitness-daily-workouts-sessions', JSON.stringify(state.dailySessions));
  }, [state.dailySessions]);

  const generateWorkoutPlan = async (userProfile: any) => {
    console.log('generateWorkoutPlan called with:', userProfile);
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      dispatch({ type: 'SET_GENERATING', generating: true });
      console.log('Set generating state to true');

      const request: WorkoutGenerationRequest = {
        userProfile: {
          name: userProfile.name,
          age: userProfile.age,
          gender: userProfile.gender,
          height: userProfile.height,
          weight: userProfile.weight,
          fitnessLevel: userProfile.fitnessLevel,
          goals: userProfile.goals,
          workoutDuration: userProfile.workoutDuration,
          availableDays: userProfile.availableDays,
          workoutTime: userProfile.workoutTime,
          equipment: userProfile.equipment,
          healthConditions: userProfile.healthConditions,
          splitPreference: userProfile.splitPreference,
        },
      };

      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate workout plan');
      }

      const data: WorkoutGenerationResponse = await response.json();

      if (data.success && data.workoutPlan) {
        dispatch({ type: 'SET_WORKOUT_PLAN', workoutPlan: data.workoutPlan });
        
        // Show notification if it's a fallback plan
        if (data.isFallback && data.message) {
          dispatch({ type: 'SET_NOTIFICATION', notification: data.message });
        }
      } else {
        throw new Error(data.error || 'Failed to generate workout plan');
      }
    } catch (error) {
      console.error('Error generating workout plan:', error);
      dispatch({
        type: 'SET_ERROR',
        error: error instanceof Error ? error.message : 'Failed to generate workout plan',
      });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearNotification = () => {
    dispatch({ type: 'CLEAR_NOTIFICATION' });
  };

  const startDailyWorkout = (dayName: string) => {
    if (!state.currentWorkoutPlan) return;

    const today = new Date().toISOString().split('T')[0];
    const existingSession = state.dailySessions.find(
      session => session.dayName === dayName && session.date === today
    );

    if (existingSession) {
      dispatch({ type: 'SET_CURRENT_SESSION', session: existingSession });
    } else {
      const newSession: DailyWorkoutSession = {
        id: `session-${Date.now()}`,
        workoutPlanId: state.currentWorkoutPlan.id,
        dayName,
        date: today,
        startTime: new Date(),
        completedExercises: [],
        isCompleted: false,
      };
      dispatch({ type: 'ADD_DAILY_SESSION', session: newSession });
      dispatch({ type: 'SET_CURRENT_SESSION', session: newSession });
    }
  };

  const completeExercise = (exerciseName: string) => {
    if (!state.currentSession) return;

    const isCompleted = state.currentSession.completedExercises.includes(exerciseName);
    const updatedExercises = isCompleted
      ? state.currentSession.completedExercises.filter(name => name !== exerciseName)
      : [...state.currentSession.completedExercises, exerciseName];

    dispatch({
      type: 'UPDATE_DAILY_SESSION',
      sessionId: state.currentSession.id,
      updates: { completedExercises: updatedExercises },
    });
  };

  const finishDailyWorkout = (rating?: number, notes?: string) => {
    if (!state.currentSession) return;

    const updates: Partial<DailyWorkoutSession> = {
      endTime: new Date(),
      isCompleted: true,
    };

    if (rating !== undefined) updates.rating = rating;
    if (notes !== undefined) updates.notes = notes;

    dispatch({
      type: 'UPDATE_DAILY_SESSION',
      sessionId: state.currentSession.id,
      updates,
    });

    dispatch({ type: 'SET_CURRENT_SESSION', session: null });
  };

  const getTodaysWorkout = () => {
    const today = new Date().toISOString().split('T')[0];
    return state.dailySessions.find(session => session.date === today) || null;
  };

  const calculateProgress = (): WorkoutProgress => {
    const sessions = state.dailySessions;
    const completedSessions = sessions.filter(session => session.isCompleted);
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedSessions = sessions
      .filter(session => session.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const today = new Date();
    let checkDate = new Date(today);
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      const daysDiff = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0 || daysDiff === 1) {
        currentStreak++;
        checkDate = new Date(sessionDate);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedByDate = sessions
      .filter(session => session.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (let i = 0; i < sortedByDate.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedByDate[i - 1].date);
        const currDate = new Date(sortedByDate[i].date);
        const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate weekly progress
    const weeklyProgress: { [week: string]: { completed: number; total: number } } = {};
    const weeks = new Set<string>();
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weeks.add(weekKey);
    });

    weeks.forEach(weekKey => {
      const weekStart = new Date(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
      
      weeklyProgress[weekKey] = {
        completed: weekSessions.filter(session => session.isCompleted).length,
        total: weekSessions.length,
      };
    });

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      currentStreak,
      longestStreak,
      lastWorkoutDate: completedSessions.length > 0 
        ? completedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : undefined,
      weeklyProgress,
    };
  };

  return (
    <WorkoutContext.Provider value={{ 
      state, 
      dispatch, 
      generateWorkoutPlan, 
      clearError, 
      clearNotification,
      startDailyWorkout,
      completeExercise,
      finishDailyWorkout,
      getTodaysWorkout,
      calculateProgress,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
