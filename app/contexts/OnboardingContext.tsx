'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface OnboardingData {
  // Personal Information
  name: string;
  age: number | null;
  gender: string;
  height: number | null;
  weight: number | null;
  unitSystem: 'metric' | 'imperial';
  
  // Fitness Level
  fitnessLevel: string;
  
  // Goals
  goals: string[];
  customGoal: string;
  
  // Preferences
  workoutDuration: string;
  availableDays: string[];
  workoutTime: string;
  equipment: string;
  splitPreference?: string; // e.g., 'auto', 'full body', 'upper/lower', 'push/pull/legs'
  
  // Health & Safety
  hasHealthConditions: boolean;
  healthConditions: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  isComplete: boolean;
}

type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'UPDATE_DATA'; data: Partial<OnboardingData> }
  | { type: 'RESET' }
  | { type: 'COMPLETE' };

const initialState: OnboardingState = {
  currentStep: 1,
  data: {
    name: '',
    age: null,
    gender: '',
    height: null,
    weight: null,
    unitSystem: 'metric',
    fitnessLevel: '',
    goals: [],
    customGoal: '',
    workoutDuration: '',
    availableDays: [],
    workoutTime: '',
    equipment: '',
    splitPreference: 'auto',
    hasHealthConditions: false,
    healthConditions: '',
    agreedToTerms: false,
    agreedToPrivacy: false,
  },
  isComplete: false,
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 7),
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: action.step,
      };
    case 'UPDATE_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.data },
      };
    case 'RESET':
      return initialState;
    case 'COMPLETE':
      return {
        ...state,
        isComplete: true,
      };
    default:
      return state;
  }
}

const OnboardingContext = createContext<{
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
} | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('fitness-onboarding-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'UPDATE_DATA', data: parsedData });
      } catch (error) {
        console.error('Failed to load onboarding data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fitness-onboarding-data', JSON.stringify(state.data));
  }, [state.data]);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
