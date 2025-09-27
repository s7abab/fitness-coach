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

// Advanced JSON repair function
function repairJsonString(jsonString: string): string {
  let repaired = jsonString;

  // Remove any non-JSON content before the first {
  const firstBrace = repaired.indexOf("{");
  if (firstBrace > 0) {
    repaired = repaired.substring(firstBrace);
  }

  // Remove any content after the last }
  const lastBrace = repaired.lastIndexOf("}");
  if (lastBrace !== -1 && lastBrace < repaired.length - 1) {
    repaired = repaired.substring(0, lastBrace + 1);
  }

  // Fix common JSON issues with a more systematic approach
  repaired = repaired
    // Remove any markdown formatting that might have leaked in
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    // Fix missing commas between array elements more aggressively
    .replace(/"\s*\n\s*"/g, '",\n"')  // Missing comma between quoted strings
    .replace(/"\s*\n\s*\[/g, '",\n[')  // Missing comma between string and array
    .replace(/"\s*\n\s*{/g, '",\n{')   // Missing comma between string and object
    .replace(/}\s*\n\s*"/g, '},\n"')   // Missing comma between object and string
    .replace(/]\s*\n\s*"/g, '],\n"')   // Missing comma between array and string
    .replace(/}\s*\n\s*\[/g, '},\n[')  // Missing comma between object and array
    .replace(/]\s*\n\s*\[/g, '],\n[')  // Missing comma between array and array
    .replace(/}\s*\n\s*{/g, '},\n{')   // Missing comma between object and object
    .replace(/]\s*\n\s*{/g, '],\n{')   // Missing comma between array and object
    // Fix missing commas in single-line contexts
    .replace(/}\s*{/g, "}, {")
    .replace(/\]\s*\[/g, "], [")
    .replace(/}\s*\[/g, "}, [")
    .replace(/\]\s*{/g, "], {")
    // Fix missing commas after numeric values
    .replace(/(\d+)\s*\n\s*"/g, '$1,\n"')
    .replace(/(\d+)\s*\n\s*{/g, '$1,\n{')
    .replace(/(\d+)\s*\n\s*\[/g, '$1,\n[')
    // Remove trailing commas before closing brackets/braces
    .replace(/,(\s*[}\]])/g, "$1")
    // Fix unquoted keys - more comprehensive pattern
    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    // Fix unquoted string values (but not numbers, booleans, null)
    .replace(
      /:\s*([a-zA-Z_][a-zA-Z0-9_\s\-'.,!]*?)(\s*[,}\]\n])/g,
      (match: string, value: string, ending: string) => {
        const trimmed = value.trim();
        // Don't quote if it's a number, boolean, null, or already quoted
        if (
          /^\d+(\.\d+)?$/.test(trimmed) ||
          trimmed === "true" ||
          trimmed === "false" ||
          trimmed === "null" ||
          trimmed.startsWith('"') ||
          trimmed.startsWith('[') ||
          trimmed.startsWith('{')
        ) {
          return `: ${trimmed}${ending}`;
        }
        // Escape any quotes in the value
        const escapedValue = trimmed.replace(/"/g, '\\"');
        return `: "${escapedValue}"${ending}`;
      }
    )
    // Handle multi-line string values that might be broken
    .replace(/:\s*"([^"]*)\n([^"]*)"(\s*[,}\]])/g, ': "$1 $2"$3')
    // Remove extra spaces around colons
    .replace(/:\s+/g, ": ")
    // Remove extra spaces around commas
    .replace(/\s*,\s*/g, ", ")
    // Fix any double commas
    .replace(/,,+/g, ",")
    // Remove trailing commas one more time
    .replace(/,(\s*[}\]])/g, "$1")
    // Remove any stray characters that might cause issues
    .replace(/([}\]])\s*[^,}\]\s][^,}\]]*?([,}\]])/g, '$1$2');

  // Try to balance brackets and braces
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;

  // Close incomplete arrays
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    repaired += "]";
  }

  // Close incomplete objects
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += "}";
  }

  return repaired;
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

// Function to generate workout plan using Gemini 2.5 Turbo
async function generateWorkoutWithGemini(
  userProfile: WorkoutGenerationRequest["userProfile"]
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = createWorkoutPrompt(userProfile);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
  }
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

      // Try to find and extract JSON from the response
      let jsonString = text.trim();

      // Remove any markdown code blocks
      jsonString = jsonString.replace(/```json\s*/g, "").replace(/```\s*/g, "");

      // Try to find JSON object boundaries more precisely
      const jsonStart = jsonString.indexOf("{");
      const jsonEnd = jsonString.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      }

      // Check if the JSON appears to be truncated
      const openBraces = (jsonString.match(/\{/g) || []).length;
      const closeBraces = (jsonString.match(/\}/g) || []).length;
      const openBrackets = (jsonString.match(/\[/g) || []).length;
      const closeBrackets = (jsonString.match(/\]/g) || []).length;

      if (openBraces > closeBraces || openBrackets > closeBrackets) {
        console.warn("JSON appears to be truncated, attempting to fix...");

        // Try to close incomplete structures
        let fixedJson = jsonString;

        // Close incomplete arrays
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          fixedJson += "]";
        }

        // Close incomplete objects
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixedJson += "}";
        }

        jsonString = fixedJson;
      }

      // Use iterative JSON repair with validation
      let attempts = 0;
      const maxAttempts = 5;
      let lastError: Error | null = null;

      while (attempts < maxAttempts) {
        try {
          // Apply repair function
          jsonString = repairJsonString(jsonString);
          
          console.log(`Repair attempt ${attempts + 1}, JSON length:`, jsonString.length);
          console.log("JSON preview:", jsonString.substring(0, 500) + "...");

          // Try to parse
          workoutPlanData = JSON.parse(jsonString);
          console.log("JSON parsing successful!");
          break;
        } catch (parseError) {
          lastError = parseError as Error;
          attempts++;
          console.warn(`Parse attempt ${attempts} failed:`, parseError);
          
          // Log specific error location for debugging
          if (parseError instanceof SyntaxError && parseError.message.includes("position")) {
            const position = parseError.message.match(/position (\d+)/)?.[1];
            if (position) {
              const pos = parseInt(position);
              const context = jsonString.substring(Math.max(0, pos - 50), pos + 50);
              console.log(`Error context around position ${pos}:`, context);
            }
          }
          
          if (attempts < maxAttempts) {
            // Additional repair strategies for specific errors
            const errorMessage = lastError.message.toLowerCase();
            
            if (errorMessage.includes("expected ',' or ']' after array element")) {
              // More aggressive comma insertion for array elements
              jsonString = jsonString
                .replace(/"\s*\n\s*"/g, '",\n"')
                .replace(/"\s*\n\s*\[/g, '",\n[')
                .replace(/"\s*\n\s*{/g, '",\n{')
                .replace(/}\s*\n\s*"/g, '},\n"')
                .replace(/]\s*\n\s*"/g, '],\n"')
                .replace(/}\s*\n\s*\[/g, '},\n[')
                .replace(/]\s*\n\s*\[/g, '],\n[')
                .replace(/}\s*\n\s*{/g, '},\n{')
                .replace(/]\s*\n\s*{/g, '],\n{');
            }
          }
        }
      }

      if (attempts >= maxAttempts) {
        throw lastError || new Error("Failed to parse JSON after multiple repair attempts");
      }
    } catch (parseError: unknown) {
      console.error(`Error parsing ${aiProvider} response:`, parseError);
      console.error("Raw response length:", text.length);
      console.error("Raw response preview:", text.substring(0, 1000));

      // Try a more aggressive JSON extraction and repair
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let rawJson = jsonMatch[0];
          console.log(
            "Attempting to parse raw JSON match length:",
            rawJson.length
          );

          // Use the advanced repair function
          rawJson = repairJsonString(rawJson);

          console.log(
            "Repaired JSON preview:",
            rawJson.substring(0, 500) + "..."
          );
          workoutPlanData = JSON.parse(rawJson);
        } else {
          throw new Error("No JSON object found in response");
        }
      } catch (secondParseError: unknown) {
        console.error("Second parse attempt failed:", secondParseError);

        // Try a third attempt with more aggressive repair
        try {
          console.log("Attempting third parse with aggressive repair...");
          let aggressiveRepair = text;

          // Extract just the JSON part
          const jsonStart = aggressiveRepair.indexOf("{");
          const jsonEnd = aggressiveRepair.lastIndexOf("}");

          if (jsonStart !== -1 && jsonEnd !== -1) {
            aggressiveRepair = aggressiveRepair.substring(
              jsonStart,
              jsonEnd + 1
            );
          }

          // More aggressive repairs
          aggressiveRepair = aggressiveRepair
            // Remove any potential markdown or formatting
            .replace(/```json\s*/g, "")
            .replace(/```\s*/g, "")
            // Fix missing commas after values
            .replace(/"\s*\n\s*"/g, '",\n"')
            .replace(/(\d+)\s*\n\s*"/g, '$1,\n"')
            .replace(/(\d+)\s*\n\s*{/g, '$1,\n{')
            .replace(/(\d+)\s*\n\s*\[/g, '$1,\n[')
            .replace(/}\s*\n\s*"/g, '},\n"')
            .replace(/}\s*\n\s*{/g, '},\n{')
            .replace(/]\s*\n\s*"/g, '],\n"')
            .replace(/]\s*\n\s*{/g, '],\n{')
            .replace(/]\s*\n\s*\[/g, '],\n[')
            // Remove trailing commas
            .replace(/,(\s*[}\]])/g, "$1")
            // Quote all unquoted keys
            .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
            // Quote unquoted string values
            .replace(
              /:\s*([a-zA-Z_][a-zA-Z0-9_\s\-'.,!]*?)(\s*[,}\]\n])/g,
              (match: string, value: string, ending: string) => {
                const trimmed = value.trim();
                if (
                  /^\d+(\.\d+)?$/.test(trimmed) ||
                  trimmed === "true" ||
                  trimmed === "false" ||
                  trimmed === "null" ||
                  trimmed.startsWith('"') ||
                  trimmed.startsWith('[') ||
                  trimmed.startsWith('{')
                ) {
                  return `: ${trimmed}${ending}`;
                }
                const escapedValue = trimmed.replace(/"/g, '\\"');
                return `: "${escapedValue}"${ending}`;
              }
            )
            // Handle broken multi-line strings
            .replace(/:\s*"([^"]*)\n([^"]*)"(\s*[,}\]])/g, ': "$1 $2"$3')
            // Clean up spacing
            .replace(/:\s+/g, ": ")
            .replace(/\s*,\s*/g, ", ")
            // Remove double commas
            .replace(/,,+/g, ",")
            // Final cleanup of trailing commas
            .replace(/,(\s*[}\]])/g, "$1")
            // Remove stray characters
            .replace(/([}\]])\s*[^,}\]\s][^,}\]]*?([,}\]])/g, '$1$2');

          console.log(
            "Aggressive repair preview:",
            aggressiveRepair.substring(0, 500) + "..."
          );
          workoutPlanData = JSON.parse(aggressiveRepair);
        } catch (thirdParseError: unknown) {
          console.error("Third parse attempt failed:", thirdParseError);

          return NextResponse.json(
            {
              success: false,
              error:
                `Failed to parse workout plan from ${aiProvider} response. The AI response may be too long or malformed.`,
              debug: {
                aiProvider,
                rawResponseLength: text.length,
                rawResponsePreview: text.substring(0, 1000),
                parseError:
                  parseError instanceof Error
                    ? parseError.message
                    : String(parseError),
                secondParseError:
                  secondParseError instanceof Error
                    ? secondParseError.message
                    : String(secondParseError),
                thirdParseError:
                  thirdParseError instanceof Error
                    ? thirdParseError.message
                    : String(thirdParseError),
              },
            },
            { status: 500 }
          );
        }
      }
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

    const errorObj = error as { status?: number; message?: string };

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
- Enforce exercise counts from the guidelines above based on fitness level
- Vary workout focus (upper body, lower body, cardio, full body)
- Make exercises progressive and challenging
- Include proper warm-up and cool-down for each day
- Use only the specified equipment: ${userProfile.equipment}
- Focus on the user's goals: ${userProfile.goals.join(", ")}

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
