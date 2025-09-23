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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-cyan-400/10"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-xl"></div>
      
      <Card className="max-w-md w-full shadow-2xl mx-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up">
        <CardHeader className="text-center pb-6 pt-8">
          {/* Logo/Branding */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            FitAI Coach
          </CardTitle>
          <CardDescription className="text-xl text-gray-600 font-medium">
            Your Personal AI Fitness Trainer
          </CardDescription>
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
              <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50 hover:from-blue-50 hover:to-indigo-50/50 transition-all duration-300 animate-slide-in-right" style={{animationDelay: `${index * 0.1}s`}}>
                <div className={`w-10 h-10 ${feature.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <p className="text-sm font-medium text-gray-700">{feature.text}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleGetStarted}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              🚀 Get Started
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full h-12 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300"
            >
              I'm a returning user
            </Button>
          </div>

          {/* Time Estimate */}
          <div className="text-center">
            <Badge variant="secondary" className="text-xs px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-0">
              ⏱️ Takes about 3-5 minutes to complete
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
