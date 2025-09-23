'use client';

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressStepper from '../ProgressStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Clock, Heart } from 'lucide-react';

export default function SetupCompleteScreen() {
  const { state, dispatch } = useOnboarding();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger completion and animation
    dispatch({ type: 'COMPLETE' });
    setShowAnimation(true);
  }, [dispatch]);

  const handleStartWorkout = () => {
    // Here you would typically redirect to the main app or first workout
    console.log('Starting first workout with data:', state.data);
    // For now, we'll just show an alert
    alert('Welcome to FitAI Coach! Your personalized fitness journey is ready to begin.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        <ProgressStepper currentStep={7} totalSteps={7} className="mb-8" />
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className={`transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
              <p className="text-xl text-gray-600">Your AI trainer is ready to help you achieve your goals</p>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Your Fitness Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{state.data.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{state.data.age} years old</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium capitalize">{state.data.gender.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Height:</span>
                    <span className="font-medium">
                      {state.data.unitSystem === 'metric' 
                        ? `${state.data.height} cm`
                        : `${Math.floor((state.data.height || 0) / 30.48)}'${Math.floor(((state.data.height || 0) % 30.48) / 2.54)}"`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
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
                <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Fitness Profile</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{getFitnessLevelDisplay(state.data.fitnessLevel)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{state.data.workoutDuration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium capitalize">{state.data.workoutTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipment:</span>
                    <span className="font-medium capitalize">{state.data.equipment.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days:</span>
                    <span className="font-medium">{state.data.availableDays.length} days/week</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">Your Goals</h4>
              <div className="flex flex-wrap gap-2">
                {getGoalsDisplay(state.data.goals).map((goal, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {goal}
                  </span>
                ))}
                {state.data.customGoal && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                    {state.data.customGoal}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Ready to Transform Your Fitness?</h3>
              <p className="text-blue-100 mb-4">
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

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <button
              onClick={handleStartWorkout}
              className="w-full md:w-auto bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-8 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🏋️ Start Your First Workout
            </button>
            
            <div className="text-sm text-gray-500">
              You can always update your preferences in the settings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
