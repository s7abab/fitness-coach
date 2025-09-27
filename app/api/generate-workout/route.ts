import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { WorkoutGenerationRequest, WorkoutGenerationResponse, WorkoutPlan, WorkoutDay, Exercise } from '@/lib/types/workout';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body: WorkoutGenerationRequest = await request.json();
    const { userProfile } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Create the prompt for Gemini
    const prompt = createWorkoutPrompt(userProfile);

    // Generate workout plan using Gemini Flash 2.5
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
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
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}

function createWorkoutPrompt(userProfile: any): string {
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
          "difficulty": "beginner"
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
          "difficulty": "${userProfile.fitnessLevel}"
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
          "difficulty": "beginner"
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
