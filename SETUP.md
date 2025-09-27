# Setup Guide for FitAI Coach

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn**
3. **Google Gemini API Key**

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
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in your `.env.local` file

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

- ✅ **AI-Powered Workout Generation** using Gemini Flash 2.5
- ✅ **Personalized Plans** based on your profile and goals
- ✅ **Detailed Exercise Instructions** with sets, reps, and tips
- ✅ **Equipment-Based Workouts** tailored to your available equipment
- ✅ **Fitness Level Adaptation** from beginner to advanced
- ✅ **Responsive Design** works on all devices
- ✅ **Progress Tracking** with localStorage persistence

## Troubleshooting

### Common Issues

1. **"Gemini API key not configured" error**
   - Make sure your `.env.local` file exists and contains the correct API key
   - Restart the development server after adding the environment variable

2. **"Failed to generate workout plan" error**
   - Check your internet connection
   - Verify your Gemini API key is valid and has sufficient quota
   - Check the browser console for detailed error messages

3. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that you're using Node.js version 18 or higher

### API Key Security

- Never commit your `.env.local` file to version control
- Keep your API key secure and don't share it publicly
- Consider using environment-specific keys for production

## Next Steps

- Customize the workout generation prompts in `app/api/generate-workout/route.ts`
- Add more exercise types and variations
- Implement workout tracking and progress monitoring
- Add social features and sharing capabilities
