export interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: string; // Can be "10-12" or "30 seconds" for time-based
  restTime: string; // e.g., "60 seconds"
  equipment: string[];
  muscleGroups: string[];
  instructions: string[];
  tips?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutDay {
  day: string; // e.g., "Monday", "Tuesday"
  focus: string; // e.g., "Upper Body", "Cardio", "Full Body"
  duration: number; // in minutes
  exercises: Exercise[];
  warmup?: Exercise[];
  cooldown?: Exercise[];
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // in weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frequency: number; // workouts per week
  days: WorkoutDay[];
  goals: string[];
  equipment: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutGenerationRequest {
  userProfile: {
    name: string;
    age: number;
    gender: string;
    height: number;
    weight: number;
    fitnessLevel: string;
    goals: string[];
    workoutDuration: string;
    availableDays: string[];
    workoutTime: string;
    equipment: string;
    healthConditions?: string;
  };
}

export interface WorkoutGenerationResponse {
  success: boolean;
  workoutPlan?: WorkoutPlan;
  error?: string;
}
