'use client';

import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, TrendingUp, Clock, Heart } from 'lucide-react';

export default function WelcomeScreen() {
  const { dispatch } = useOnboarding();

  const handleGetStarted = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleSkip = () => {
    dispatch({ type: 'GO_TO_STEP', step: 7 });
  };

  const features = [
    {
      icon: CheckCircle,
      text: 'Personalized AI workout plans'
    },
    {
      icon: TrendingUp,
      text: 'Progress tracking & analytics'
    },
    {
      icon: Clock,
      text: 'Flexible scheduling'
    },
    {
      icon: Heart,
      text: 'Motivational guidance'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border shadow-sm animate-fade-in">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            FitAI Coach
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your Personal AI Fitness Trainer
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Welcome to Your Fitness Journey</h2>
            <p className="text-muted-foreground">
              Get personalized workout plans powered by AI. Let's create a plan that works for you.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleGetStarted}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              Get Started
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full h-10 text-muted-foreground hover:text-foreground"
            >
              I'm a returning user
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Takes about 3-5 minutes to complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
