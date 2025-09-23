'use client';

import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Clock, Heart } from 'lucide-react';

export default function WelcomeScreen() {
  const { dispatch } = useOnboarding();

  const handleGetStarted = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleSkip = () => {
    // Skip to the end or redirect to main app
    dispatch({ type: 'GO_TO_STEP', step: 7 });
  };

  const features = [
    {
      icon: CheckCircle,
      text: 'Personalized AI-powered workout plans',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: TrendingUp,
      text: 'Track progress with smart analytics',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    },
    {
      icon: Clock,
      text: 'Flexible scheduling that fits your life',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Heart,
      text: 'Motivational support and guidance',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl mx-2">
        <CardHeader className="text-center pb-4">
          {/* Logo/Branding */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold">FitAI Coach</CardTitle>
          <CardDescription className="text-lg">Your Personal AI Fitness Trainer</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Your Fitness Journey!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Get ready to transform your fitness with the power of AI. We'll create a personalized workout plan just for you.
            </p>
          </div>

          {/* Value Proposition */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${feature.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                </div>
                <p className="text-sm">{feature.text}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGetStarted}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              Get Started
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full"
            >
              I'm a returning user
            </Button>
          </div>

          {/* Time Estimate */}
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              ⏱️ Takes about 3-5 minutes to complete
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
