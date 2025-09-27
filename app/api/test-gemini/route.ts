import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Gemini API key not configured",
          message: "Please add GEMINI_API_KEY to your environment variables"
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
      },
      systemInstruction: "You MUST respond with ONLY valid JSON. No markdown, no explanations, no code blocks. Your response must be parseable JSON that starts with { and ends with }. All keys and string values must be in double quotes. No trailing commas allowed."
    });

    const prompt = `Generate a simple JSON response with a test message. Return only valid JSON in this format:
{
  "message": "Hello from Gemini 2.5 Flash!",
  "status": "success",
  "timestamp": "current timestamp"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Validate JSON response
    let isValidJson = false;
    let parsedResponse = null;
    try {
      parsedResponse = JSON.parse(text);
      isValidJson = true;
    } catch (parseError) {
      console.warn("Gemini returned invalid JSON:", parseError);
    }

    return NextResponse.json({
      success: true,
      message: "Gemini API test successful",
      geminiResponse: text,
      isValidJson: isValidJson,
      parsedResponse: parsedResponse,
      model: "gemini-2.5-flash"
    });

  } catch (error) {
    console.error("Gemini test error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Gemini API test failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
