import { NextRequest, NextResponse } from "next/server";
import {
  WorkoutGenerationRequest,
  WorkoutGenerationResponse,
  WorkoutPlan,
  WorkoutDay,
  Exercise,
} from "@/lib/types/workout";
import { youtubeAPI } from "@/lib/youtube-api";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      const isOverloadError =
        errorObj.status === 503 || errorObj.message?.includes("overloaded");

      if (isLastAttempt || !isOverloadError) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

// Function to validate JSON response (simplified since Gemini now returns clean JSON)
function validateJsonResponse(response: string): boolean {
  try {
    JSON.parse(response);
    return true;
  } catch {
    return false;
  }
}


// Function to normalize exercise data structure
function normalizeExercise(exercise: Partial<Exercise> & Record<string, unknown>): Exercise {
  return {
    name: exercise.name || "Unknown Exercise",
    description: exercise.description || "Exercise description not available",
    sets: exercise.sets || 3,
    reps: exercise.reps || "10-12",
    restTime: exercise.restTime || "60 seconds",
    equipment: Array.isArray(exercise.equipment) ? exercise.equipment : 
               exercise.equipment ? [exercise.equipment] : ["bodyweight"],
    muscleGroups: Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups :
                  Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles :
                  exercise.muscleGroups ? [exercise.muscleGroups] :
                  exercise.targetMuscles ? [exercise.targetMuscles] : ["full body"],
    instructions: Array.isArray(exercise.instructions) ? exercise.instructions :
                  exercise.instructions ? [exercise.instructions] : 
                  ["Follow proper form and technique for this exercise."],
    tips: Array.isArray(exercise.tips) ? exercise.tips : 
          exercise.tips ? [exercise.tips] : undefined,
    difficulty: exercise.difficulty || "beginner",
    videoUrl: exercise.videoUrl,
    videoThumbnail: exercise.videoThumbnail,
  };
}

// Function to generate workout plan using Gemini 2.5 Turbo with strict JSON validation
async function generateWorkoutWithGemini(
  userProfile: WorkoutGenerationRequest["userProfile"]
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.1, // Lower temperature for more consistent output
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8000,
      responseMimeType: "application/json", // Force JSON response
    },
    systemInstruction: "You are a professional fitness trainer. You MUST respond with ONLY valid JSON. No markdown, no explanations, no code blocks. Your response must be parseable JSON that starts with { and ends with }. All keys and string values must be in double quotes. No trailing commas allowed."
  });

  const prompt = createWorkoutPrompt(userProfile);

  // Retry logic with JSON validation
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Gemini attempt ${attempt + 1}/${maxRetries}`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Validate JSON before returning
      if (validateJsonResponse(text)) {
        console.log(`Gemini attempt ${attempt + 1} successful - valid JSON`);
        return text;
      } else {
        console.warn(`Gemini attempt ${attempt + 1} - invalid JSON, retrying...`);
        lastError = new Error("Invalid JSON response");
        
        if (attempt === maxRetries - 1) {
          throw new Error(`Gemini returned invalid JSON after ${maxRetries} attempts`);
        }
        
        // Add a small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    } catch (error) {
      console.error(`Gemini attempt ${attempt + 1} failed:`, error);
      lastError = error as Error;
      
      if (attempt === maxRetries - 1) {
        throw new Error(`Gemini API error after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Add exponential backoff
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Gemini API failed after all retries");
}

// Function to enhance exercises with YouTube videos
async function enhanceExercisesWithVideos<T extends { name: string }>(
  exercises: T[]
): Promise<T[]> {
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
          "short" // Prefer shorter videos for exercises
        );

        if (searchResult.videos.length > 0) {
          const video = searchResult.videos[0];
          return {
            ...exercise,
            videoUrl: video.url,
            videoThumbnail: video.thumbnailUrl,
          };
        }
      } catch (error) {
        console.warn(
          `Failed to find YouTube video for exercise: ${exercise.name}`,
          error
        );
      }

      return exercise as T;
    })
  );

  return enhancedExercises;
}

export async function POST(request: NextRequest) {
  let userProfile: WorkoutGenerationRequest["userProfile"] | null = null;

  try {
    const body: WorkoutGenerationRequest = await request.json();
    userProfile = body.userProfile;

    // Check if at least one AI service is configured
    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "No AI service API key configured (OpenAI or Gemini required)" },
        { status: 500 }
      );
    }

    // Create the prompt for AI generation
    const prompt = createWorkoutPrompt(userProfile);

    // Try OpenAI first, then fallback to Gemini
    let text: string;
    let aiProvider = "unknown";

    try {
      // Try OpenAI first if API key is available
      if (process.env.OPENAI_API_KEY) {
        console.log("Attempting to generate workout with OpenAI...");
        const result = await retryWithBackoff(async () => {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a professional fitness trainer and nutritionist with 15+ years of experience. Create comprehensive, personalized workout plans. Always respond with valid JSON only.",
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: 0.7,
                max_tokens: 8000,
              }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          }

          return await response.json();
        });

        text = result.choices[0]?.message?.content;
        aiProvider = "OpenAI";
        console.log("Successfully generated workout with OpenAI");
      } else {
        throw new Error("OpenAI API key not configured");
      }
    } catch (openaiError) {
      console.warn("OpenAI failed, falling back to Gemini:", openaiError);
      
      // Fallback to Gemini
      if (process.env.GEMINI_API_KEY) {
        try {
          console.log("Attempting to generate workout with Gemini...");
          text = await generateWorkoutWithGemini(userProfile);
          aiProvider = "Gemini";
          console.log("Successfully generated workout with Gemini");
        } catch (geminiError) {
          console.error("Both OpenAI and Gemini failed:", { openaiError, geminiError });
          throw new Error(`Both AI services failed. OpenAI: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}, Gemini: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`);
        }
      } else {
        console.error("OpenAI failed and Gemini API key not configured");
        throw new Error(`OpenAI failed: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}. Gemini API key not configured.`);
      }
    }

    // Parse the JSON response from AI service
    let workoutPlanData;
    try {
      if (!text) {
        throw new Error(`No content in ${aiProvider} response`);
      }

      console.log(`Raw ${aiProvider} response length:`, text.length);
      console.log(`Raw ${aiProvider} response preview:`, text.substring(0, 500) + "...");

      // Parse JSON directly since Gemini now returns clean JSON
      workoutPlanData = JSON.parse(text);
      console.log("JSON parsing successful!");
    } catch (parseError: unknown) {
      console.error(`Error parsing ${aiProvider} response:`, parseError);
      console.error("Raw response length:", text.length);
      console.error("Raw response preview:", text.substring(0, 1000));

      return NextResponse.json(
        {
          success: false,
          error: `Failed to parse workout plan from ${aiProvider} response. The AI response may be malformed.`,
          debug: {
            aiProvider,
            rawResponseLength: text.length,
            rawResponsePreview: text.substring(0, 1000),
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
          },
        },
        { status: 500 }
      );
    }

    // Enhance exercises with YouTube videos
    type DayLike = {
      warmup?: Array<{ name: string }>;
      exercises?: Array<{ name: string }>;
      cooldown?: Array<{ name: string }>;
      [key: string]: unknown;
    };

    const enhancedDays = await Promise.all(
      (workoutPlanData.days || []).map(async (day: DayLike) => {
        // Normalize exercise data structures
        const normalizedWarmup = (day.warmup || []).map(normalizeExercise);
        const normalizedExercises = (day.exercises || []).map(normalizeExercise);
        const normalizedCooldown = (day.cooldown || []).map(normalizeExercise);

        const enhancedWarmup = await enhanceExercisesWithVideos(
          normalizedWarmup
        );
        const enhancedExercises = await enhanceExercisesWithVideos(
          normalizedExercises
        );
        const enhancedCooldown = await enhanceExercisesWithVideos(
          normalizedCooldown
        );

        return {
          ...day,
          warmup: enhancedWarmup,
          exercises: enhancedExercises,
          cooldown: enhancedCooldown,
        };
      })
    );

    // Create the workout plan object
    const workoutPlan: WorkoutPlan = {
      id: `workout-${Date.now()}`,
      name:
        workoutPlanData.name || `${userProfile.name}'s Personal Workout Plan`,
      description:
        workoutPlanData.description ||
        "A personalized workout plan designed for your fitness goals",
      duration: workoutPlanData.duration || 4,
      difficulty: workoutPlanData.difficulty || userProfile.fitnessLevel,
      frequency: workoutPlanData.frequency || userProfile.availableDays.length,
      days: enhancedDays as unknown as WorkoutDay[],
      goals: userProfile.goals,
      equipment: [userProfile.equipment],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const response_data: WorkoutGenerationResponse = {
      success: true,
      workoutPlan,
    };

    console.log(`Workout plan successfully generated using ${aiProvider}`);
    return NextResponse.json(response_data);
  } catch (error: unknown) {
    console.error("Error generating workout plan:", error);

    const errorObj = error as { status?: number; message?: sftring };

    return NextResponse.json(
      {
        success: false,
        error:
          errorObj.status === 503 || errorObj.message?.includes("rate limit")
            ? "AI service is temporarily overloaded. Please try again in a few minutes."
            : "Failed to generate workout plan. Please try again later.",
      },
      { status: errorObj.status || 500 }
    );
  }
}

function createWorkoutPrompt(
  userProfile: WorkoutGenerationRequest["userProfile"]
): string {
  return `You are a professional fitness trainer creating a personalized workout plan. Generate a comprehensive ${
    userProfile.availableDays.length
  }-day workout plan based on the user's profile.

USER PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age} years old
- Gender: ${userProfile.gender}
- Height: ${userProfile.height} cm
- Weight: ${userProfile.weight} kg
- Fitness Level: ${userProfile.fitnessLevel}
- Goals: ${userProfile.goals.join(", ")}
- Workout Duration: ${userProfile.workoutDuration} minutes per session
- Available Days: ${userProfile.availableDays.join(", ")}
- Preferred Workout Time: ${userProfile.workoutTime}
- Equipment Available: ${userProfile.equipment}
- Health Conditions: ${userProfile.healthConditions || "None reported"}
 - Split Preference: ${
   userProfile.splitPreference || "auto (you choose the optimal split)"
 }

WORKOUT PLAN REQUIREMENTS:
1. Create exactly ${userProfile.availableDays.length} workout days
2. Each workout must be ${userProfile.workoutDuration} minutes total
3. Design exercises appropriate for ${userProfile.fitnessLevel} level
4. Focus on achieving these goals: ${userProfile.goals.join(", ")}
5. Use only this equipment: ${userProfile.equipment}
6. Include 5-10 minute warm-up and 5-10 minute cool-down
7. Provide detailed step-by-step instructions
8. Include proper rest periods (30-90 seconds between sets)
9. Consider age-appropriate modifications for ${userProfile.age} years old
10. Focus on clear exercise descriptions (YouTube videos will be added automatically)
11. Split handling:
   - If Split Preference is not 'auto', strictly follow that split across the week
   - If 'auto', choose the optimal split based on goals and available days, and explicitly state it in the plan description as "Split: ..."

EXERCISE GUIDELINES:
- For beginners: 2-3 sets, 8-12 reps, focus on form
- For intermediate: 3-4 sets, 10-15 reps, moderate intensity
- For advanced: 4-6 sets, 8-15 reps for compounds and 12-20 for accessories, high intensity; allow supersets/giant sets if needed to fit time
- Include both strength and cardio elements
- Vary exercises to prevent boredom
- Progress difficulty over the 4-week duration
 - Exercise count per day:
   - Beginner: 4-6 exercises per day
   - Intermediate: 5-8 exercises per day
   - Advanced: 6-8 exercises per day (ABSOLUTE MINIMUM 5). Never return only 2-3 exercises for advanced plans.

CRITICAL JSON FORMATTING REQUIREMENTS:
- You MUST respond with ONLY valid JSON
- NO markdown formatting, NO code blocks, NO explanations before or after the JSON
- ALL JSON keys MUST be wrapped in double quotes
- ALL string values MUST be wrapped in double quotes
- NO trailing commas anywhere in the JSON
- NO single quotes, only double quotes
- NO comments in the JSON
- The JSON must start with { and end with }
- Every array and object must be properly closed
- All numbers must be unquoted
- All booleans must be unquoted (true/false)
- Escape any quotes inside string values with backslash

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
          "difficulty": "beginner"
        }
      ],
      "notes": "Workout-specific notes and tips"
    }
  ]
}

VALIDATION CHECKLIST:
Before responding, verify your JSON:
✓ Starts with { and ends with }
✓ All keys are in double quotes
✓ All string values are in double quotes
✓ No trailing commas
✓ All arrays and objects are properly closed
✓ No markdown formatting
✓ No explanations or text outside the JSON
✓ Numbers and booleans are unquoted
✓ All quotes inside strings are escaped

Focus on clear, descriptive exercise names for automatic video matching
Ensure all exercises match the user's fitness level
Enforce exercise counts from the guidelines above based on fitness level
Vary workout focus (upper body, lower body, cardio, full body)
Make exercises progressive and challenging
Include proper warm-up and cool-down for each day
Use only the specified equipment: ${userProfile.equipment}
Focus on the user's goals: ${userProfile.goals.join(", ")}

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
