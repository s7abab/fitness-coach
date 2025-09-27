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
Create a `.env.local` file in the root directory and add your Gemini API key:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```
Get your API key from: https://makersuite.google.com/app/apikey

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the onboarding flow

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
- **Equipment Requirements**: Based on available equipment
- **Progressive Difficulty**: Appropriate for user's fitness level
- **Warm-up & Cool-down**: Complete workout structure
- **Rest Periods**: Optimized recovery between exercises
- **Muscle Group Focus**: Balanced training approach

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
