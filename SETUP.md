# Setup Guide for FitAI Coach

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn**
3. **AI Service API Key** (OpenAI or Google Gemini - at least one required)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install all required packages
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# .env.local
# At least one AI service is required
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: YouTube integration
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Get Your API Keys

#### Option A: OpenAI (Primary, with Gemini fallback)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in with your OpenAI account
3. Click "Create new secret key"
4. Copy the generated key
5. Paste it in your `.env.local` file

#### Option B: Google Gemini (Fallback for OpenAI)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in your `.env.local` file

#### Option C: Both (Recommended for reliability)
- Configure both OpenAI and Gemini for maximum reliability
- The system will try OpenAI first, then fallback to Gemini if OpenAI fails

### 4. Run the Application

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## How to Use

1. **Complete Onboarding**: Go through the 7-step onboarding process
2. **Generate Workout**: Click "Generate Your Workout Plan" on the final screen
3. **View Workout**: Click "View Your Workout Plan" to see the generated plan
4. **Regenerate**: Use "Regenerate Workout Plan" to create a new plan

## Features

- ✅ **AI-Powered Workout Generation** using OpenAI GPT-4o-mini with Gemini 2.0 Flash fallback
- ✅ **Reliable Service** with automatic fallback if primary AI service fails
- ✅ **Personalized Plans** based on your profile and goals
- ✅ **Detailed Exercise Instructions** with sets, reps, and tips
- ✅ **Equipment-Based Workouts** tailored to your available equipment
- ✅ **Fitness Level Adaptation** from beginner to advanced
- ✅ **Video Demonstrations** with YouTube integration for each exercise
- ✅ **Interactive Video Player** with thumbnails and play controls
- ✅ **Responsive Design** works on all devices
- ✅ **Progress Tracking** with localStorage persistence

## Troubleshooting

### Common Issues

1. **"No AI service API key configured" error**
   - Make sure your `.env.local` file exists and contains at least one AI service API key
   - You need either `OPENAI_API_KEY` or `GEMINI_API_KEY` (or both for reliability)
   - Restart the development server after adding the environment variable

2. **"OpenAI API key not configured" error**
   - This is normal if you only have Gemini configured
   - The system will automatically use Gemini as the primary service
   - To use OpenAI, add your `OPENAI_API_KEY` to `.env.local`

3. **"Both AI services failed" error**
   - Check your internet connection
   - Verify your API keys are valid and have sufficient quota
   - Check the browser console for detailed error messages
   - Try testing individual services using the test endpoints

4. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that you're using Node.js version 18 or higher

### Testing AI Services

You can test your AI service configurations:

- **Test Gemini**: Visit `http://localhost:3000/api/test-gemini`
- **Test OpenAI**: The system will automatically test OpenAI when generating workouts

### API Key Security

- Never commit your `.env.local` file to version control
- Keep your API key secure and don't share it publicly
- Consider using environment-specific keys for production

## Next Steps

- Customize the workout generation prompts in `app/api/generate-workout/route.ts`
- Add more exercise types and variations
- Implement workout tracking and progress monitoring
- Add social features and sharing capabilities
