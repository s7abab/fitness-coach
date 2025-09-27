'use client';

import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressStepper from '../ProgressStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const splitOptions = [
  { value: 'auto', label: 'Suggest best split', description: 'We pick based on your days/goals' },
  { value: 'full body', label: 'Full Body', description: 'Same pattern each day' },
  { value: 'upper/lower', label: 'Upper / Lower', description: 'Alternate upper and lower' },
  { value: 'push/pull/legs', label: 'Push / Pull / Legs', description: 'Classic PPL rotation' },
  { value: 'bro split', label: 'Bro Split', description: 'Body part per day' }
];

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

  const handleSplitSelect = (splitPreference: string) => {
    dispatch({ type: 'UPDATE_DATA', data: { splitPreference } });
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto px-2">
        <ProgressStepper currentStep={5} totalSteps={7} className="mb-8" />
        
        <Card className="border-2 border-gray-200 shadow-lg animate-fade-in bg-white">
          <CardHeader className="text-center pb-8 pt-10 px-8">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Let&apos;s customize your experience
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Tell us about your preferences and availability
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 px-6 pb-6">
            {/* Workout Duration */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Preferred workout duration</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {workoutDurations.map((duration) => (
                  <Button
                    key={duration.value}
                    onClick={() => handleDurationSelect(duration.value)}
                    variant={state.data.workoutDuration === duration.value ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center space-y-2 rounded-xl"
                  >
                    <div className="font-semibold text-base">{duration.label}</div>
                    <div className="text-sm opacity-70">{duration.description}</div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Available Days */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Available workout days</h3>
              <p className="text-sm text-muted-foreground mb-4">Select the days you can work out each week</p>
              
              <div className="flex flex-wrap gap-2 sm:grid sm:grid-cols-7 sm:gap-3">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => handleDayToggle(day.id)}
                    className={`flex-1 min-w-[50px] sm:min-w-0 p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                      state.data.availableDays.includes(day.id)
                        ? 'border-black bg-black text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-sm sm:text-base">{day.label}</div>
                  </button>
                ))}
              </div>
              {state.data.availableDays.length > 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Selected: {state.data.availableDays.map(day => daysOfWeek.find(d => d.id === day)?.full).join(', ')}
                </p>
              )}
            </div>

            {/* Workout Time */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Preferred workout time</h3>
              <div className="grid grid-cols-2 gap-4">
                {workoutTimes.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => handleTimeSelect(time.value)}
                    className={`p-6 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 ${
                      state.data.workoutTime === time.value
                        ? 'border-black bg-black text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl mb-3">{time.icon}</div>
                    <div className="font-semibold text-base mb-1">{time.label}</div>
                    <div className="text-sm opacity-80">{time.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Equipment availability</h3>
              <div className="grid grid-cols-2 gap-4">
                {equipmentOptions.map((equipment) => (
                  <button
                    key={equipment.value}
                    onClick={() => handleEquipmentSelect(equipment.value)}
                    className={`p-6 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 ${
                      state.data.equipment === equipment.value
                        ? 'border-black bg-black text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl mb-3">{equipment.icon}</div>
                    <div className="font-semibold text-base mb-1">{equipment.label}</div>
                    <div className="text-sm opacity-80">{equipment.description}</div>
                  </button>
                ))}
              </div>
            </div>

          {/* Split Preference */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Preferred workout split</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {splitOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSplitSelect(opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    state.data.splitPreference === opt.value
                      ? 'border-black bg-black text-white shadow-lg'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-sm opacity-80">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {(state.data.workoutDuration || state.data.workoutTime || state.data.equipment || state.data.availableDays.length > 0) && (
            <div className="bg-gray-50 rounded-xl p-6 mt-8 border border-gray-200">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Your Preferences Summary:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {state.data.workoutDuration && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{workoutDurations.find(d => d.value === state.data.workoutDuration)?.label}</span>
                  </div>
                )}
                {state.data.workoutTime && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">{workoutTimes.find(t => t.value === state.data.workoutTime)?.label}</span>
                  </div>
                )}
                {state.data.equipment && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Equipment:</span>
                    <span className="font-medium text-gray-900">{equipmentOptions.find(e => e.value === state.data.equipment)?.label}</span>
                  </div>
                )}
                {state.data.availableDays.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Days:</span>
                    <span className="font-medium text-gray-900">{state.data.availableDays.length} days selected</span>
                  </div>
                )}
                {state.data.splitPreference && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Split:</span>
                    <span className="font-medium text-gray-900">{splitOptions.find(s => s.value === state.data.splitPreference)?.label || 'Suggest best split'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between p-8 pt-4 border-t border-gray-200">
            <Button
              onClick={handleBack}
              variant="outline"
              className="px-8 h-12 text-base font-medium border-2 border-gray-300 hover:border-gray-400"
            >
              ← Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!state.data.workoutDuration || !state.data.workoutTime || !state.data.equipment || state.data.availableDays.length === 0}
              className="px-8 h-12 text-base font-medium bg-black hover:bg-gray-800 text-white"
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
