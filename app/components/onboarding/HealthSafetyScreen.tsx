'use client';

import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressStepper from '../ProgressStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export default function HealthSafetyScreen() {
  const { state, dispatch } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleHealthConditionChange = (hasConditions: boolean) => {
    dispatch({ type: 'UPDATE_DATA', data: { 
      hasHealthConditions: hasConditions,
      healthConditions: hasConditions ? state.data.healthConditions : ''
    } });
  };

  const handleHealthConditionsTextChange = (text: string) => {
    dispatch({ type: 'UPDATE_DATA', data: { healthConditions: text } });
  };

  const handleTermsChange = (agreed: boolean) => {
    dispatch({ type: 'UPDATE_DATA', data: { agreedToTerms: agreed } });
    if (agreed && errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }));
    }
  };

  const handlePrivacyChange = (agreed: boolean) => {
    dispatch({ type: 'UPDATE_DATA', data: { agreedToPrivacy: agreed } });
    if (agreed && errors.privacy) {
      setErrors(prev => ({ ...prev, privacy: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!state.data.agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service';
    }
    if (!state.data.agreedToPrivacy) {
      newErrors.privacy = 'You must agree to the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        <ProgressStepper currentStep={6} totalSteps={7} className="mb-8" />
        
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Health & Safety</CardTitle>
            <CardDescription className="text-lg">Help us keep you safe during your fitness journey</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Health Conditions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Health Information</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">Important Safety Notice</h4>
                    <p className="text-sm text-amber-800">
                      Please consult with your healthcare provider before starting any new exercise program, 
                      especially if you have any health conditions or concerns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-4">
                    Do you have any injuries or health conditions we should know about?
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleHealthConditionChange(false)}
                      className={`px-6 py-3 rounded-xl border-2 font-medium transition-all duration-300 ${
                        !state.data.hasHealthConditions
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      No, I'm healthy
                    </button>
                    <button
                      onClick={() => handleHealthConditionChange(true)}
                      className={`px-6 py-3 rounded-xl border-2 font-medium transition-all duration-300 ${
                        state.data.hasHealthConditions
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Yes, I have conditions
                    </button>
                  </div>
                </div>

                {state.data.hasHealthConditions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please describe your health conditions or injuries:
                    </label>
                    <textarea
                      value={state.data.healthConditions}
                      onChange={(e) => handleHealthConditionsTextChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="e.g., Lower back pain, knee injury, high blood pressure, diabetes..."
                      rows={4}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      This information helps us modify exercises to keep you safe and comfortable.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Legal Agreements */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Terms & Privacy</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={state.data.agreedToTerms}
                    onChange={(e) => handleTermsChange(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                      Terms of Service
                    </a>{' '}
                    and understand that I should consult with a healthcare provider before starting any exercise program.
                  </label>
                </div>
                {errors.terms && <p className="text-red-500 text-sm ml-8">{errors.terms}</p>}

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={state.data.agreedToPrivacy}
                    onChange={(e) => handlePrivacyChange(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                      Privacy Policy
                    </a>{' '}
                    and consent to the collection and use of my health and fitness data to provide personalized recommendations.
                  </label>
                </div>
                {errors.privacy && <p className="text-red-500 text-sm ml-8">{errors.privacy}</p>}
              </div>
            </div>

            {/* Additional Safety Information */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Safety is Our Priority</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Always listen to your body and stop if you feel pain or discomfort</li>
                    <li>• Start slowly and gradually increase intensity</li>
                    <li>• Stay hydrated and take breaks as needed</li>
                    <li>• Consult your doctor if you experience any concerning symptoms</li>
                  </ul>
                </div>
              </div>
            </div>
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
              disabled={!state.data.agreedToTerms || !state.data.agreedToPrivacy}
              className="px-8"
              size="lg"
            >
              Complete Setup →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
