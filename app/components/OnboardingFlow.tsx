'use client';

import React from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import WelcomeScreen from './onboarding/WelcomeScreen';
import PersonalInfoScreen from './onboarding/PersonalInfoScreen';
import FitnessLevelScreen from './onboarding/FitnessLevelScreen';
import GoalsScreen from './onboarding/GoalsScreen';
import PreferencesScreen from './onboarding/PreferencesScreen';
import HealthSafetyScreen from './onboarding/HealthSafetyScreen';
import SetupCompleteScreen from './onboarding/SetupCompleteScreen';

export default function OnboardingFlow() {
  const { state } = useOnboarding();

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <WelcomeScreen />;
      case 2:
        return <PersonalInfoScreen />;
      case 3:
        return <FitnessLevelScreen />;
      case 4:
        return <GoalsScreen />;
      case 5:
        return <PreferencesScreen />;
      case 6:
        return <HealthSafetyScreen />;
      case 7:
        return <SetupCompleteScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentStep()}
    </div>
  );
}
