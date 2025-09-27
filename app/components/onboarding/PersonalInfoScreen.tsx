'use client';

import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressStepper from '../ProgressStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function PersonalInfoScreen() {
  const { state, dispatch } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    dispatch({ type: 'UPDATE_DATA', data: { [field]: value } });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!state.data.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!state.data.age || state.data.age < 13 || state.data.age > 120) {
      newErrors.age = 'Please enter a valid age (13-120)';
    }
    if (!state.data.gender) {
      newErrors.gender = 'Please select your gender';
    }
    if (!state.data.height || state.data.height < 100 || state.data.height > 250) {
      newErrors.height = 'Please enter a valid height';
    }
    if (!state.data.weight || state.data.weight < 30 || state.data.weight > 300) {
      newErrors.weight = 'Please enter a valid weight';
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

  const toggleUnitSystem = () => {
    const newSystem = state.data.unitSystem === 'metric' ? 'imperial' : 'metric';
    dispatch({ type: 'UPDATE_DATA', data: { unitSystem: newSystem } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-gray to-pure-white p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-orange/5 via-neutral-blue/3 to-success-green/5"></div>
      <div className="absolute top-10 right-20 w-24 h-24 bg-primary-orange/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 left-20 w-32 h-32 bg-success-green/10 rounded-full blur-xl"></div>
      
      <div className="max-w-2xl mx-auto px-2 relative">
        <ProgressStepper currentStep={2} totalSteps={7} className="mb-8" />
        
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
          <CardHeader className="text-center pb-4 pt-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-orange to-neutral-blue bg-clip-text text-transparent">
              Tell us about yourself
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-primary font-medium">
              This helps us create your personalized fitness plan
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={state.data.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={state.data.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  placeholder="25"
                  min="13"
                  max="120"
                  className={errors.age ? 'border-destructive' : ''}
                />
                {errors.age && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.age}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={state.data.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.gender}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Unit System Toggle */}
            <div className="flex items-center justify-center space-x-4 p-6 bg-gradient-to-r from-primary-orange/10 to-neutral-blue/10 rounded-2xl border border-primary-orange/20">
              <Label htmlFor="unit-system" className={`text-sm font-semibold transition-colors duration-300 ${
                state.data.unitSystem === 'metric' ? 'text-primary-orange' : 'text-secondary'
              }`}>
                Metric
              </Label>
              <Switch
                id="unit-system"
                checked={state.data.unitSystem === 'imperial'}
                onCheckedChange={toggleUnitSystem}
                className="data-[state=checked]:bg-gradient-primary"
              />
              <Label htmlFor="unit-system" className={`text-sm font-semibold transition-colors duration-300 ${
                state.data.unitSystem === 'imperial' ? 'text-primary-orange' : 'text-secondary'
              }`}>
                Imperial
              </Label>
            </div>

            {/* Height and Weight Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="height">
                  Height * {state.data.unitSystem === 'metric' ? '(cm)' : '(ft/in)'}
                </Label>
                {state.data.unitSystem === 'metric' ? (
                  <Input
                    id="height"
                    type="number"
                    value={state.data.height || ''}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                    placeholder="170"
                    min="100"
                    max="250"
                    className={errors.height ? 'border-destructive' : ''}
                  />
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={Math.floor((state.data.height || 0) / 30.48) || ''}
                      onChange={(e) => {
                        const feet = parseInt(e.target.value) || 0;
                        const inches = Math.floor(((state.data.height || 0) % 30.48) / 2.54);
                        const totalCm = feet * 30.48 + inches * 2.54;
                        handleInputChange('height', totalCm);
                      }}
                      placeholder="5"
                      min="3"
                      max="8"
                      className={errors.height ? 'border-destructive' : ''}
                    />
                    <Input
                      type="number"
                      value={Math.floor(((state.data.height || 0) % 30.48) / 2.54) || ''}
                      onChange={(e) => {
                        const feet = Math.floor((state.data.height || 0) / 30.48);
                        const inches = parseInt(e.target.value) || 0;
                        const totalCm = feet * 30.48 + inches * 2.54;
                        handleInputChange('height', totalCm);
                      }}
                      placeholder="8"
                      min="0"
                      max="11"
                      className={errors.height ? 'border-destructive' : ''}
                    />
                  </div>
                )}
                {errors.height && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.height}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight * {state.data.unitSystem === 'metric' ? '(kg)' : '(lbs)'}
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={state.data.unitSystem === 'metric' ? (state.data.weight || '') : Math.round((state.data.weight || 0) * 2.205) || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    const weight = state.data.unitSystem === 'metric' ? value : value / 2.205;
                    handleInputChange('weight', weight);
                  }}
                  placeholder={state.data.unitSystem === 'metric' ? '70' : '154'}
                  min={state.data.unitSystem === 'metric' ? '30' : '66'}
                  max={state.data.unitSystem === 'metric' ? '300' : '660'}
                  step="0.1"
                  className={errors.weight ? 'border-destructive' : ''}
                />
                {errors.weight && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.weight}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6 pt-0">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="px-8 h-12 text-primary hover:text-primary-orange hover:bg-primary-orange/10 transition-all duration-300"
            >
              ← Back
            </Button>
            <Button
              onClick={handleNext}
              className="px-10 h-12 bg-gradient-primary hover:from-primary-orange-dark hover:to-primary-orange shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
