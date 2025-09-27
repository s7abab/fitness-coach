# FitAI Coach - AI Fitness App with Workout Generation

A comprehensive AI-powered fitness application with personalized workout plan generation using Gemini Flash 2.5, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🎯 Complete Onboarding Experience
- **7-step guided flow** with progress tracking
- **Personal information collection** with metric/imperial unit support
- **Fitness level assessment** with visual indicators
- **Goals selection** with multiple choice and custom input
- **Preferences & availability** configuration
- **Health & safety** information gathering
- **Setup completion** with profile summary

### 🛠️ Technical Features
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for modern, responsive styling
- **Context API** for state management
- **Form validation** with error handling
- **localStorage persistence** for data backup
- **Mobile-first responsive design**
- **Smooth animations** and transitions
- **Accessibility features** built-in
- **Gemini Flash 2.5** AI integration for workout generation
- **YouTube Data API v3** integration for exercise videos
- **RESTful API** for workout plan creation
- **TypeScript types** for type safety

### 📱 User Experience
- Clean, modern interface with plenty of white space
- Consistent blue/teal color scheme
- Engaging icons and visual elements
- Intuitive navigation with Next/Back/Skip options
- Progress indicator showing current step
- Motivational copy and encouraging language
- Estimated completion time display

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory and add your API keys:
```bash
# OpenAI API (for workout generation)
OPENAI_API_KEY=your_openai_api_key_here

# YouTube Data API v3 (for exercise videos)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

Get your API keys from:
- OpenAI: https://platform.openai.com/api-keys
- YouTube: https://console.developers.google.com/

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the onboarding flow

## YouTube Integration

The app includes comprehensive YouTube Data API v3 integration for exercise videos:

### Features
- **Automatic Video Discovery**: Finds relevant exercise demonstration videos
- **Smart Video Selection**: Searches for high-quality, short-duration videos
- **Interactive Video Player**: Embedded YouTube player with fallback options
- **Manual Search**: Users can search for alternative videos
- **Video Metadata**: Displays titles, descriptions, thumbnails, and view counts

### Demo Page
Visit [http://localhost:3000/youtube-demo](http://localhost:3000/youtube-demo) to test the YouTube integration.

### API Endpoints
- `GET /api/youtube/search` - Search for exercise videos
- `GET /api/youtube/video` - Get video details
- `GET /api/youtube/test` - Test API connection

For detailed setup instructions, see [YOUTUBE_INTEGRATION.md](./YOUTUBE_INTEGRATION.md).

## Project Structure

```
app/
├── components/
│   ├── onboarding/
│   │   ├── WelcomeScreen.tsx          # Step 1: Welcome & introduction
│   │   ├── PersonalInfoScreen.tsx     # Step 2: Personal information
│   │   ├── FitnessLevelScreen.tsx     # Step 3: Fitness level assessment
│   │   ├── GoalsScreen.tsx            # Step 4: Goals selection
│   │   ├── PreferencesScreen.tsx      # Step 5: Preferences & availability
│   │   ├── HealthSafetyScreen.tsx     # Step 6: Health & safety
│   │   └── SetupCompleteScreen.tsx    # Step 7: Setup completion
│   ├── ProgressStepper.tsx            # Progress indicator component
│   └── OnboardingFlow.tsx             # Main flow controller
├── contexts/
│   └── OnboardingContext.tsx          # State management context
├── globals.css                        # Global styles and animations
├── layout.tsx                         # Root layout
└── page.tsx                           # Main page with onboarding
```

## Onboarding Flow Details

### Step 1: Welcome Screen
- App branding and logo
- Value proposition with key benefits
- "Get Started" and "Skip" options
- Time estimate display

### Step 2: Personal Information
- Name, age, gender inputs
- Height and weight with unit toggles
- Form validation with error states
- Metric/Imperial system support

### Step 3: Fitness Level Assessment
- Visual selection cards for fitness levels
- Beginner, Intermediate, Advanced, Athlete options
- Detailed descriptions for each level
- Encouraging messaging

### Step 4: Goals Selection
- Multiple goal selection with visual icons
- Predefined goals: Weight loss, muscle building, endurance, etc.
- Custom goal input option
- Selected goals summary

### Step 5: Preferences & Availability
- Workout duration preferences
- Weekly calendar for available days
- Preferred workout time selection
- Equipment availability options

### Step 6: Health & Safety
- Health conditions questionnaire
- Terms of service and privacy policy agreements
- Safety disclaimers and recommendations
- Required legal checkboxes

### Step 7: Setup Complete
- Success animation and celebration
- Complete profile summary
- Motivational messaging
- "Generate Your Workout Plan" button with AI integration
- Workout plan display and management

## AI Workout Generation

The app uses Google's Gemini Flash 2.5 model to generate personalized workout plans based on:

- **User Profile**: Age, gender, height, weight, fitness level
- **Goals**: Weight loss, muscle building, endurance, flexibility, etc.
- **Preferences**: Workout duration, available days, equipment
- **Health Conditions**: Any limitations or special considerations

### Generated Workout Features:
- **Personalized Exercises**: Tailored to fitness level and goals
- **Detailed Instructions**: Step-by-step exercise guidance
- **Video Demonstrations**: YouTube videos for each exercise
- **Equipment Requirements**: Based on available equipment
- **Progressive Difficulty**: Appropriate for user's fitness level
- **Warm-up & Cool-down**: Complete workout structure
- **Rest Periods**: Optimized recovery between exercises
- **Muscle Group Focus**: Balanced training approach
- **Interactive Video Player**: Click to play exercise demonstrations

## Video Integration

The app includes comprehensive video support for exercise demonstrations:

### Video Features:
- **YouTube Integration**: Seamless video playback using YouTube's embed API
- **Thumbnail Previews**: High-quality video thumbnails for quick identification
- **Responsive Design**: Videos adapt to different screen sizes
- **Play Controls**: Easy play/pause and external link options
- **Error Handling**: Graceful fallbacks for missing or invalid videos
- **Performance Optimized**: Lazy loading and efficient video embedding

### Video Player Features:
- **Click to Play**: Interactive thumbnails with play button overlay
- **Full-Screen Support**: YouTube's native full-screen functionality
- **External Links**: Option to open videos in new tabs
- **Auto-Generated Thumbnails**: Automatic fallback to YouTube's thumbnail service
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Customization

The onboarding flow is highly customizable:

- **Colors**: Update the gradient colors in Tailwind classes
- **Content**: Modify text, icons, and messaging in each screen
- **Validation**: Adjust form validation rules in each component
- **Steps**: Add or remove steps by updating the context and flow
- **Styling**: Customize the design system in `globals.css`

## Browser Support

- Modern browsers with ES6+ support
- Mobile responsive design
- Touch-friendly interface
- Accessibility compliant

## License

This project is open source and available under the MIT License.
