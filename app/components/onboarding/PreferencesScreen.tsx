'use client';

import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressStepper from '../ProgressStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const workoutDurations = [
  { value: '15', label: '15 minutes', description: 'Quick workouts' },
  { value: '30', label: '30 minutes', description: 'Standard sessions' },
  { value: '45', label: '45 minutes', description: 'Extended workouts' },
  { value: '60', label: '60+ minutes', description: 'Intensive training' }
];

const workoutTimes = [
  { value: 'morning', label: 'Morning', icon: '🌅', description: '6 AM - 12 PM' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️', description: '12 PM - 6 PM' },
  { value: 'evening', label: 'Evening', icon: '🌆', description: '6 PM - 10 PM' },
  { value: 'flexible', label: 'Flexible', icon: '🕐', description: 'Any time works' }
];

const equipmentOptions = [
  { value: 'none', label: 'No Equipment', icon: '🤸', description: 'Bodyweight only' },
  { value: 'basic', label: 'Basic', icon: '🏠', description: 'Dumbbells, resistance bands' },
  { value: 'home-gym', label: 'Home Gym', icon: '🏋️', description: 'Full home setup' },
  { value: 'full-gym', label: 'Full Gym', icon: '🏢', description: 'Commercial gym access' }
];

const daysOfWeek = [
  { id: 'monday', label: 'Mon', full: 'Monday' },
  { id: 'tuesday', label: 'Tue', full: 'Tuesday' },
  { id: 'wednesday', label: 'Wed', full: 'Wednesday' },
  { id: 'thursday', label: 'Thu', full: 'Thursday' },
  { id: 'friday', label: 'Fri', full: 'Friday' },
  { id: 'saturday', label: 'Sat', full: 'Saturday' },
  { id: 'sunday', label: 'Sun', full: 'Sunday' }
];

export default function PreferencesScreen() {
  const { state, dispatch } = useOnboarding();

  const handleDurationSelect = (duration: string) => {
    dispatch({ type: 'UPDATE_DATA', data: { workoutDuration: duration } });
  };

  const handleTimeSelect = (time: string) => {
    dispatch({ type: 'UPDATE_DATA', data: { workoutTime: time } });
  };

  const handleEquipmentSelect = (equipment: string) => {
    dispatch({ type: 'UPDATE_DATA', data: { equipment } });
  };

  const handleDayToggle = (day: string) => {
    const currentDays = state.data.availableDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    dispatch({ type: 'UPDATE_DATA', data: { availableDays: newDays } });
  };

  const handleNext = () => {
    if (state.data.workoutDuration && state.data.workoutTime && state.data.equipment && state.data.availableDays.length > 0) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto px-2">
        <ProgressStepper currentStep={5} totalSteps={7} className="mb-8" />
        
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Let's customize your experience</CardTitle>
            <CardDescription className="text-lg">Tell us about your preferences and availability</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Workout Duration */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Preferred workout duration</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {workoutDurations.map((duration) => (
                  <Button
                    key={duration.value}
                    onClick={() => handleDurationSelect(duration.value)}
                    variant={state.data.workoutDuration === duration.value ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <div className="font-semibold">{duration.label}</div>
                    <div className="text-sm opacity-70">{duration.description}</div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Available Days */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Available workout days</h3>
              <p className="text-gray-600 mb-4">Select the days you can work out each week</p>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => handleDayToggle(day.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                      state.data.availableDays.includes(day.id)
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{day.label}</div>
                  </button>
                ))}
              </div>
              {state.data.availableDays.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {state.data.availableDays.map(day => daysOfWeek.find(d => d.id === day)?.full).join(', ')}
                </p>
              )}
            </div>

            {/* Workout Time */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Preferred workout time</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {workoutTimes.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => handleTimeSelect(time.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                      state.data.workoutTime === time.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-2">{time.icon}</div>
                    <div className="font-semibold text-gray-900">{time.label}</div>
                    <div className="text-sm text-gray-600">{time.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Equipment availability</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {equipmentOptions.map((equipment) => (
                  <button
                    key={equipment.value}
                    onClick={() => handleEquipmentSelect(equipment.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                      state.data.equipment === equipment.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-2">{equipment.icon}</div>
                    <div className="font-semibold text-gray-900">{equipment.label}</div>
                    <div className="text-sm text-gray-600">{equipment.description}</div>
                  </button>
                ))}
              </div>
            </div>

          {/* Summary */}
          {(state.data.workoutDuration || state.data.workoutTime || state.data.equipment || state.data.availableDays.length > 0) && (
            <div className="bg-gray-50 rounded-xl p-6 mt-8">
              <h4 className="font-medium text-gray-900 mb-3">Your Preferences Summary:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {state.data.workoutDuration && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{workoutDurations.find(d => d.value === state.data.workoutDuration)?.label}</span>
                  </div>
                )}
                {state.data.workoutTime && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{workoutTimes.find(t => t.value === state.data.workoutTime)?.label}</span>
                  </div>
                )}
                {state.data.equipment && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Equipment:</span>
                    <span className="font-medium">{equipmentOptions.find(e => e.value === state.data.equipment)?.label}</span>
                  </div>
                )}
                {state.data.availableDays.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Days:</span>
                    <span className="font-medium">{state.data.availableDays.length} days selected</span>
                  </div>
                )}
              </div>
            </div>
          )}

          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6 pt-0">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="px-6"
            >
              ← Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!state.data.workoutDuration || !state.data.workoutTime || !state.data.equipment || state.data.availableDays.length === 0}
              className="px-8"
              size="lg"
            >
              Next →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
