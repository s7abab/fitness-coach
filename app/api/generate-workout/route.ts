import { NextRequest, NextResponse } from 'next/server';
import { WorkoutGenerationRequest, WorkoutGenerationResponse, WorkoutPlan } from '@/lib/types/workout';
import { youtubeAPI } from '@/lib/youtube-api';

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

// Function to enhance exercises with YouTube videos
async function enhanceExercisesWithVideos(exercises: any[]): Promise<any[]> {
  if (!process.env.YOUTUBE_API_KEY || exercises.length === 0) {
    return exercises;
  }

  const enhancedExercises = await Promise.all(
    exercises.map(async (exercise) => {
      try {
        // Search for relevant videos
        const searchResult = await youtubeAPI.searchExerciseVideos(
          exercise.name,
          1, // Get only the best match
          'short' // Prefer shorter videos for exercises
        );

        if (searchResult.videos.length > 0) {
          const video = searchResult.videos[0];
          return {
            ...exercise,
            videoUrl: video.url,
            videoThumbnail: video.thumbnailUrl
          };
        }
      } catch (error) {
        console.warn(`Failed to find YouTube video for exercise: ${exercise.name}`, error);
      }

      return exercise;
    })
  );

  return enhancedExercises;
}


export async function POST(request: NextRequest) {
  let userProfile: WorkoutGenerationRequest['userProfile'] | null = null;
  
  try {
    const body: WorkoutGenerationRequest = await request.json();
    userProfile = body.userProfile;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Create the prompt for OpenAI
    const prompt = createWorkoutPrompt(userProfile);

    // Generate workout plan using OpenAI GPT-4o-mini with retry logic
    const result = await retryWithBackoff(async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fitness trainer and nutritionist with 15+ years of experience. Create comprehensive, personalized workout plans. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    });
    
    const text = result.choices[0]?.message?.content;

    // Parse the JSON response from OpenAI
    let workoutPlanData;
    try {
      if (!text) {
        throw new Error('No content in OpenAI response');
      }
      
      console.log('Raw AI response:', text.substring(0, 500) + '...');
      
      // Try to find and extract JSON from the response
      let jsonString = text.trim();
      
      // Remove any markdown code blocks
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to find JSON object boundaries more precisely
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      }
      
      // Clean up common JSON issues
      jsonString = jsonString
        .replace(/,\s*}/g, '}')  // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']')  // Remove trailing commas before closing brackets
        .replace(/(\w+):/g, '"$1":')  // Quote unquoted keys
        .replace(/:(\w+)/g, ':"$1"')  // Quote unquoted string values
        .replace(/:(\d+)/g, ':$1')    // Keep numbers unquoted
        .replace(/:(\d+\.\d+)/g, ':$1') // Keep decimals unquoted
        .replace(/:true/g, ':true')   // Keep booleans unquoted
        .replace(/:false/g, ':false')
        .replace(/:null/g, ':null');
      
      console.log('Cleaned JSON string:', jsonString.substring(0, 500) + '...');
      
      workoutPlanData = JSON.parse(jsonString);
    } catch (parseError: unknown) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response:', text);
      
      // Try a more aggressive JSON extraction
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const rawJson = jsonMatch[0];
          console.log('Attempting to parse raw JSON match:', rawJson.substring(0, 500) + '...');
          workoutPlanData = JSON.parse(rawJson);
        } else {
          throw new Error('No JSON object found in response');
        }
      } catch (secondParseError: unknown) {
        console.error('Second parse attempt failed:', secondParseError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to parse workout plan from AI response. The AI may have returned malformed JSON.',
            debug: {
              rawResponse: text.substring(0, 1000),
              parseError: parseError instanceof Error ? parseError.message : String(parseError)
            }
          },
          { status: 500 }
        );
      }
    }

    // Enhance exercises with YouTube videos
    const enhancedDays = await Promise.all(
      (workoutPlanData.days || []).map(async (day: any) => {
        const enhancedWarmup = await enhanceExercisesWithVideos(day.warmup || []);
        const enhancedExercises = await enhanceExercisesWithVideos(day.exercises || []);
        const enhancedCooldown = await enhanceExercisesWithVideos(day.cooldown || []);

        return {
          ...day,
          warmup: enhancedWarmup,
          exercises: enhancedExercises,
          cooldown: enhancedCooldown
        };
      })
    );

    // Create the workout plan object
    const workoutPlan: WorkoutPlan = {
      id: `workout-${Date.now()}`,
      name: workoutPlanData.name || `${userProfile.name}'s Personal Workout Plan`,
      description: workoutPlanData.description || 'A personalized workout plan designed for your fitness goals',
      duration: workoutPlanData.duration || 4,
      difficulty: workoutPlanData.difficulty || userProfile.fitnessLevel,
      frequency: workoutPlanData.frequency || userProfile.availableDays.length,
      days: enhancedDays,
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
    
    const errorObj = error as { status?: number; message?: string };
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorObj.status === 503 || errorObj.message?.includes('rate limit')
          ? 'AI service is temporarily overloaded. Please try again in a few minutes.'
          : 'Failed to generate workout plan. Please try again later.'
      },
      { status: errorObj.status || 500 }
    );
  }
}

function createWorkoutPrompt(userProfile: WorkoutGenerationRequest['userProfile']): string {
  return `You are a professional fitness trainer creating a personalized workout plan. Generate a comprehensive ${userProfile.availableDays.length}-day workout plan based on the user's profile.

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

WORKOUT PLAN REQUIREMENTS:
1. Create exactly ${userProfile.availableDays.length} workout days
2. Each workout must be ${userProfile.workoutDuration} minutes total
3. Design exercises appropriate for ${userProfile.fitnessLevel} level
4. Focus on achieving these goals: ${userProfile.goals.join(', ')}
5. Use only this equipment: ${userProfile.equipment}
6. Include 5-10 minute warm-up and 5-10 minute cool-down
7. Provide detailed step-by-step instructions
8. Include proper rest periods (30-90 seconds between sets)
9. Consider age-appropriate modifications for ${userProfile.age} years old
10. Focus on clear exercise descriptions (YouTube videos will be added automatically)

EXERCISE GUIDELINES:
- For beginners: 2-3 sets, 8-12 reps, focus on form
- For intermediate: 3-4 sets, 10-15 reps, moderate intensity
- For advanced: 4-5 sets, 12-20 reps, high intensity
- Include both strength and cardio elements
- Vary exercises to prevent boredom
- Progress difficulty over the 4-week duration

RESPONSE FORMAT:
Return ONLY valid JSON with this exact structure:

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
          "name": "Exercise Name",
          "description": "Brief exercise description",
          "sets": 1,
          "reps": "10-15 reps",
          "restTime": "0 seconds",
          "equipment": ["none"],
          "muscleGroups": ["muscle group"],
          "instructions": [
            "Step 1: Starting position",
            "Step 2: Movement execution",
            "Step 3: Return to start",
            "Step 4: Repeat"
          ],
          "difficulty": "${userProfile.fitnessLevel}"
        }
      ],
      "exercises": [
        {
          "name": "Exercise Name",
          "description": "Detailed exercise description",
          "sets": 3,
          "reps": "8-12",
          "restTime": "60 seconds",
          "equipment": ["${userProfile.equipment}"],
          "muscleGroups": ["primary", "secondary"],
          "instructions": [
            "Step 1: Starting position",
            "Step 2: Movement execution",
            "Step 3: Return to start",
            "Step 4: Repeat"
          ],
          "tips": [
            "Form tip 1",
            "Form tip 2"
          ],
          "difficulty": "${userProfile.fitnessLevel}"
        }
      ],
      "cooldown": [
        {
          "name": "Stretch Name",
          "description": "Stretch description",
          "sets": 1,
          "reps": "30 seconds",
          "restTime": "0 seconds",
          "equipment": ["none"],
          "muscleGroups": ["muscle group"],
          "instructions": [
            "Step 1: Starting position",
            "Step 2: Stretch execution",
            "Step 3: Hold position",
            "Step 4: Release"
          ],
          "difficulty": "beginner",
          "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
          "videoThumbnail": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
        }
      ],
      "notes": "Workout-specific notes and tips"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON, no markdown, no code blocks, no explanations
- Ensure all JSON keys are properly quoted with double quotes
- No trailing commas in arrays or objects
- All string values must be in double quotes
- Focus on clear, descriptive exercise names for automatic video matching
- Ensure all exercises match the user's fitness level
- Include 4-8 exercises per workout day
- Vary workout focus (upper body, lower body, cardio, full body)
- Make exercises progressive and challenging
- Include proper warm-up and cool-down for each day
- Use only the specified equipment: ${userProfile.equipment}
- Focus on the user's goals: ${userProfile.goals.join(', ')}

EXAMPLE VALID JSON FORMAT:
{
  "name": "John's Beginner Workout Plan",
  "description": "A 3-day beginner workout plan",
  "duration": 4,
  "difficulty": "beginner",
  "frequency": 3,
  "days": [
    {
      "day": "Monday",
      "focus": "Upper Body",
      "duration": 30,
      "warmup": [
        {
          "name": "Arm Circles",
          "description": "Warm up shoulders",
          "sets": 1,
          "reps": "10 each direction",
          "restTime": "0 seconds",
          "equipment": ["none"],
          "muscleGroups": ["shoulders"],
          "instructions": ["Stand with feet shoulder-width apart", "Extend arms out to sides"],
          "difficulty": "beginner"
        }
      ],
      "exercises": [],
      "cooldown": [],
      "notes": "Focus on proper form"
    }
  ]
}
`;
}
