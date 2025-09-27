import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { WorkoutGenerationRequest, WorkoutGenerationResponse, WorkoutPlan } from '@/lib/types/workout';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries - 1;
      const errorObj = error as { status?: number; message?: string };
      const isOverloadError = errorObj.status === 503 || errorObj.message?.includes('overloaded');
      
      if (isLastAttempt || !isOverloadError) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Fallback workout plan generator for when AI is unavailable
function generateFallbackWorkoutPlan(userProfile: WorkoutGenerationRequest['userProfile']): WorkoutPlan {
  const workoutDays = userProfile.availableDays.map((day: string, index: number) => {
    const isUpperBody = index % 2 === 0;
    const focus = isUpperBody ? 'Upper Body' : 'Lower Body';
    
    return {
      day,
      focus,
      duration: parseInt(userProfile.workoutDuration),
      warmup: [
        {
          name: "Arm Circles",
          description: "Warm up your shoulder joints",
          sets: 1,
          reps: "10 each direction",
          restTime: "0 seconds",
          equipment: ["none"],
          muscleGroups: ["shoulders"],
          instructions: [
            "Stand with feet shoulder-width apart",
            "Extend arms out to sides",
            "Make small circles with arms",
            "Reverse direction after 10 reps"
          ],
          difficulty: userProfile.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
          videoUrl: "https://www.youtube.com/watch?v=UwR4q2Y4LJY",
          videoThumbnail: "https://img.youtube.com/vi/UwR4q2Y4LJY/maxresdefault.jpg"
        }
      ],
      exercises: isUpperBody ? [
        {
          name: "Push-ups",
          description: "Classic bodyweight exercise for chest, shoulders, and triceps",
          sets: userProfile.fitnessLevel === 'beginner' ? 2 : 3,
          reps: userProfile.fitnessLevel === 'beginner' ? "5-8" : "8-12",
          restTime: "60 seconds",
          equipment: ["none"],
          muscleGroups: ["chest", "shoulders", "triceps"],
          instructions: [
            "Start in plank position with hands slightly wider than shoulders",
            "Lower body until chest nearly touches floor",
            "Push back up to starting position",
            "Keep core tight throughout movement"
          ],
          tips: ["Modify by doing knee push-ups if needed", "Keep body in straight line"],
          difficulty: userProfile.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
          videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
          videoThumbnail: "https://img.youtube.com/vi/IODxDxX7oi4/maxresdefault.jpg"
        },
        {
          name: "Bodyweight Squats",
          description: "Fundamental lower body exercise",
          sets: userProfile.fitnessLevel === 'beginner' ? 2 : 3,
          reps: userProfile.fitnessLevel === 'beginner' ? "8-10" : "10-15",
          restTime: "60 seconds",
          equipment: ["none"],
          muscleGroups: ["quadriceps", "glutes", "hamstrings"],
          instructions: [
            "Stand with feet shoulder-width apart",
            "Lower down as if sitting in a chair",
            "Keep knees behind toes",
            "Return to standing position"
          ],
          tips: ["Keep chest up", "Weight on heels"],
          difficulty: userProfile.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
          videoUrl: "https://www.youtube.com/watch?v=YaXPRqUwP_Q",
          videoThumbnail: "https://img.youtube.com/vi/YaXPRqUwP_Q/maxresdefault.jpg"
        }
      ] : [
        {
          name: "Lunges",
          description: "Single-leg exercise for lower body strength",
          sets: userProfile.fitnessLevel === 'beginner' ? 2 : 3,
          reps: userProfile.fitnessLevel === 'beginner' ? "6 each leg" : "8-10 each leg",
          restTime: "60 seconds",
          equipment: ["none"],
          muscleGroups: ["quadriceps", "glutes", "hamstrings"],
          instructions: [
            "Step forward with one leg",
            "Lower back knee toward ground",
            "Push back to starting position",
            "Alternate legs"
          ],
          tips: ["Keep front knee over ankle", "Don't let knee cave in"],
          difficulty: userProfile.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
          videoUrl: "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
          videoThumbnail: "https://img.youtube.com/vi/QOVaHwm-Q6U/maxresdefault.jpg"
        },
        {
          name: "Plank",
          description: "Core strengthening exercise",
          sets: 2,
          reps: userProfile.fitnessLevel === 'beginner' ? "15-30 seconds" : "30-60 seconds",
          restTime: "60 seconds",
          equipment: ["none"],
          muscleGroups: ["core", "shoulders"],
          instructions: [
            "Start in push-up position",
            "Lower to forearms",
            "Keep body in straight line",
            "Hold position"
          ],
          tips: ["Don't let hips sag", "Engage core muscles"],
          difficulty: userProfile.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
          videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
          videoThumbnail: "https://img.youtube.com/vi/pSHjTRCQxIw/maxresdefault.jpg"
        }
      ],
      cooldown: [
        {
          name: "Chest Stretch",
          description: "Stretch the chest muscles",
          sets: 1,
          reps: "30 seconds",
          restTime: "0 seconds",
          equipment: ["none"],
          muscleGroups: ["chest"],
          instructions: [
            "Stand in doorway",
            "Place forearm on door frame",
            "Step forward to feel stretch",
            "Hold for 30 seconds"
          ],
          difficulty: "beginner" as const,
          videoUrl: "https://www.youtube.com/watch?v=3VcKX3J4q8Q",
          videoThumbnail: "https://img.youtube.com/vi/3VcKX3J4q8Q/maxresdefault.jpg"
        }
      ],
      notes: "This is a basic workout plan. For personalized recommendations, try again when the AI service is available."
    };
  });

  return {
    id: `workout-fallback-${Date.now()}`,
    name: `${userProfile.name}'s Basic Workout Plan`,
    description: 'A basic workout plan generated when AI service is unavailable. Includes fundamental exercises for your fitness level.',
    duration: 4,
    difficulty: userProfile.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
    frequency: userProfile.availableDays.length,
    days: workoutDays,
    goals: userProfile.goals,
    equipment: [userProfile.equipment],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function POST(request: NextRequest) {
  let userProfile: WorkoutGenerationRequest['userProfile'] | null = null;
  
  try {
    const body: WorkoutGenerationRequest = await request.json();
    userProfile = body.userProfile;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Create the prompt for Gemini
    const prompt = createWorkoutPrompt(userProfile);

    // Generate workout plan using Gemini Flash 2.5 with retry logic
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt);
    });
    
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response from Gemini
    let workoutPlanData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        workoutPlanData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to parse workout plan from AI response' },
        { status: 500 }
      );
    }

    // Create the workout plan object
    const workoutPlan: WorkoutPlan = {
      id: `workout-${Date.now()}`,
      name: workoutPlanData.name || `${userProfile.name}'s Personal Workout Plan`,
      description: workoutPlanData.description || 'A personalized workout plan designed for your fitness goals',
      duration: workoutPlanData.duration || 4,
      difficulty: workoutPlanData.difficulty || userProfile.fitnessLevel,
      frequency: workoutPlanData.frequency || userProfile.availableDays.length,
      days: workoutPlanData.days || [],
      goals: userProfile.goals,
      equipment: [userProfile.equipment],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const response_data: WorkoutGenerationResponse = {
      success: true,
      workoutPlan,
    };

    return NextResponse.json(response_data);
  } catch (error: unknown) {
    console.error('Error generating workout plan:', error);
    
    // Check if it's an overload error and provide fallback
    const errorObj = error as { status?: number; message?: string };
    if (errorObj.status === 503 || errorObj.message?.includes('overloaded')) {
      console.log('Gemini API overloaded, generating fallback workout plan...');
      
      try {
        if (userProfile) {
          const fallbackWorkoutPlan = generateFallbackWorkoutPlan(userProfile);
          return NextResponse.json({
            success: true,
            workoutPlan: fallbackWorkoutPlan,
            isFallback: true,
            message: 'AI service is temporarily overloaded. Generated a basic workout plan instead.'
          });
        }
      } catch (fallbackError) {
        console.error('Error generating fallback workout plan:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorObj.status === 503 
          ? 'AI service is temporarily overloaded. Please try again in a few minutes.'
          : 'Failed to generate workout plan. Please try again later.'
      },
      { status: errorObj.status || 500 }
    );
  }
}

function createWorkoutPrompt(userProfile: WorkoutGenerationRequest['userProfile']): string {
  return `
You are a professional fitness trainer and nutritionist with 15+ years of experience. Create a comprehensive, personalized workout plan for the following user profile.

USER PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age} years old
- Gender: ${userProfile.gender}
- Height: ${userProfile.height} cm
- Weight: ${userProfile.weight} kg
- Fitness Level: ${userProfile.fitnessLevel}
- Goals: ${userProfile.goals.join(', ')}
- Workout Duration: ${userProfile.workoutDuration} minutes per session
- Available Days: ${userProfile.availableDays.join(', ')}
- Preferred Workout Time: ${userProfile.workoutTime}
- Equipment Available: ${userProfile.equipment}
- Health Conditions: ${userProfile.healthConditions || 'None reported'}

REQUIREMENTS:
1. Create a ${userProfile.availableDays.length}-day workout plan that fits their schedule
2. Each workout should be approximately ${userProfile.workoutDuration} minutes
3. Include exercises appropriate for their ${userProfile.fitnessLevel} fitness level
4. Focus on their goals: ${userProfile.goals.join(', ')}
5. Use only equipment they have: ${userProfile.equipment}
6. Include proper warm-up and cool-down exercises
7. Provide clear instructions for each exercise
8. Include rest periods between sets
9. Consider their age and any health conditions
10. IMPORTANT: Include YouTube video URLs for exercise demonstrations
    - Use high-quality, educational fitness videos
    - Prefer videos from reputable fitness channels
    - Include both videoUrl and videoThumbnail fields
    - Choose videos that match the user's fitness level

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure:

{
  "name": "Personalized Workout Plan Name",
  "description": "Brief description of the workout plan",
  "duration": 4,
  "difficulty": "${userProfile.fitnessLevel}",
  "frequency": ${userProfile.availableDays.length},
  "days": [
    {
      "day": "Monday",
      "focus": "Upper Body Strength",
      "duration": ${parseInt(userProfile.workoutDuration)},
      "warmup": [
        {
          "name": "Arm Circles",
          "description": "Warm up your shoulder joints",
          "sets": 1,
          "reps": "10 each direction",
          "restTime": "0 seconds",
          "equipment": ["none"],
          "muscleGroups": ["shoulders"],
          "instructions": ["Stand with feet shoulder-width apart", "Extend arms out to sides", "Make small circles with arms", "Reverse direction after 10 reps"],
          "difficulty": "beginner",
          "videoUrl": "https://www.youtube.com/watch?v=1p3MQD7x0-s",
          "videoThumbnail": "https://img.youtube.com/vi/1p3MQD7x0-s/maxresdefault.jpg"
        }
      ],
      "exercises": [
        {
          "name": "Push-ups",
          "description": "Classic bodyweight exercise for chest, shoulders, and triceps",
          "sets": 3,
          "reps": "8-12",
          "restTime": "60 seconds",
          "equipment": ["none"],
          "muscleGroups": ["chest", "shoulders", "triceps"],
          "instructions": [
            "Start in plank position with hands slightly wider than shoulders",
            "Lower body until chest nearly touches floor",
            "Push back up to starting position",
            "Keep core tight throughout movement"
          ],
          "tips": ["Modify by doing knee push-ups if needed", "Keep body in straight line"],
          "difficulty": "${userProfile.fitnessLevel}",
          "videoUrl": "https://www.youtube.com/watch?v=IODxDxX7oi4",
          "videoThumbnail": "https://img.youtube.com/vi/IODxDxX7oi4/maxresdefault.jpg"
        }
      ],
      "cooldown": [
        {
          "name": "Chest Stretch",
          "description": "Stretch the chest muscles",
          "sets": 1,
          "reps": "30 seconds",
          "restTime": "0 seconds",
          "equipment": ["none"],
          "muscleGroups": ["chest"],
          "instructions": ["Stand in doorway", "Place forearm on door frame", "Step forward to feel stretch", "Hold for 30 seconds"],
          "difficulty": "beginner",
          "videoUrl": "https://www.youtube.com/watch?v=3VcKX3J4q8Q",
          "videoThumbnail": "https://img.youtube.com/vi/3VcKX3J4q8Q/maxresdefault.jpg"
        }
      ],
      "notes": "Focus on proper form over speed. Rest as needed between exercises."
    }
  ]
}

IMPORTANT: 
- Return ONLY the JSON object, no additional text
- Ensure all exercises are appropriate for their fitness level
- Include variety in exercises to prevent boredom
- Consider progressive overload (increasing difficulty over time)
- Make it realistic and achievable for their schedule
- Include both strength and cardio elements based on their goals
`;
}
