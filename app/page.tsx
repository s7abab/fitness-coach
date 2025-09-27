'use client';

import { OnboardingProvider } from './contexts/OnboardingContext';
import { WorkoutProvider } from './contexts/WorkoutContext';
import OnboardingFlow from './components/OnboardingFlow';

export default function Home() {
  return (
    <OnboardingProvider>
      <WorkoutProvider>
        <OnboardingFlow />
      </WorkoutProvider>
    </OnboardingProvider>
  );
}
