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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Generate a simple JSON response with a test message. Return only valid JSON in this format:
{
  "message": "Hello from Gemini 2.0 Flash!",
  "status": "success",
  "timestamp": "current timestamp"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: "Gemini API test successful",
      geminiResponse: text,
      model: "gemini-2.0-flash-exp"
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
