'use client';

import { OnboardingProvider } from './contexts/OnboardingContext';
import OnboardingFlow from './components/OnboardingFlow';

export default function Home() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
}
