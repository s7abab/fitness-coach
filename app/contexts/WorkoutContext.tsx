'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { WorkoutPlan, WorkoutGenerationRequest, WorkoutGenerationResponse } from '@/lib/types/workout';

interface WorkoutState {
  currentWorkoutPlan: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
  isGenerating: boolean;
}

type WorkoutAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_GENERATING'; generating: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_WORKOUT_PLAN'; workoutPlan: WorkoutPlan | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

const initialState: WorkoutState = {
  currentWorkoutPlan: null,
  isLoading: false,
  error: null,
  isGenerating: false,
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
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const WorkoutContext = createContext<{
  state: WorkoutState;
  dispatch: React.Dispatch<WorkoutAction>;
  generateWorkoutPlan: (userProfile: any) => Promise<void>;
  clearError: () => void;
} | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  // Load saved workout plan from localStorage on mount
  useEffect(() => {
    const savedWorkoutPlan = localStorage.getItem('fitness-workout-plan');
    if (savedWorkoutPlan) {
      try {
        const parsedWorkoutPlan = JSON.parse(savedWorkoutPlan);
        dispatch({ type: 'SET_WORKOUT_PLAN', workoutPlan: parsedWorkoutPlan });
      } catch (error) {
        console.error('Failed to load workout plan from localStorage:', error);
      }
    }
  }, []);

  // Save workout plan to localStorage whenever it changes
  useEffect(() => {
    if (state.currentWorkoutPlan) {
      localStorage.setItem('fitness-workout-plan', JSON.stringify(state.currentWorkoutPlan));
    }
  }, [state.currentWorkoutPlan]);

  const generateWorkoutPlan = async (userProfile: any) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      dispatch({ type: 'SET_GENERATING', generating: true });

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

  return (
    <WorkoutContext.Provider value={{ state, dispatch, generateWorkoutPlan, clearError }}>
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
