# AI Fitness Trainer

A modern, AI-powered fitness application that provides real-time pose detection and form correction using MediaPipe Holistic. Accessible from any device with a camera, including your phone!

## Features

- **12+ Workout Exercises**: From beginner to advanced levels
  - Push-ups, Squats, Lunges, Plank
  - Burpees, Mountain Climbers, Tricep Dips
  - Jumping Jacks, High Knees
  - Diamond Push-ups, Pike Push-ups, Bulgarian Split Squats

- **Real-time AI Pose Detection**
  - Uses MediaPipe Holistic for accurate body tracking
  - Tracks 33 body landmarks in real-time
  - Provides instant form feedback and suggestions

- **Exercise-Specific Analysis**
  - Push-up form: Checks body alignment and elbow angle
  - Squat depth: Monitors knee angle and hip position
  - Plank posture: Ensures straight body line
  - And more!

- **Responsive Design**
  - Works on desktop, tablet, and mobile devices
  - Touch-friendly interface for phone access
  - Camera-optimized for front-facing selfie cameras

- **Professional Video Guides**
  - Embedded tutorial videos for each exercise
  - Learn proper form before starting

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI/ML**: MediaPipe Holistic
- **Deployment**: GitHub Pages / Netlify / Vercel

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- A device with a camera (webcam or phone camera)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands

```bash
# Run development server (accessible on local network)
npm run dev -- --host

# Build optimized production bundle
npm run build

# Lint codebase
npm run lint
```

## Deploying to GitHub Pages

### Step 1: Update package.json

Add these fields to your `package.json`:

```json
{
  "homepage": "https://yourusername.github.io/ai-fitness-trainer",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Step 2: Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 3: Deploy

```bash
npm run deploy
```

### Step 4: Configure GitHub Pages

1. Go to your repository Settings
2. Navigate to Pages section
3. Select source as `gh-pages` branch
4. Your app will be live at `https://yourusername.github.io/ai-fitness-trainer`

## Alternative Deployment Options

### Netlify

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy!

### Vercel

1. Import your GitHub repository to Vercel
2. Framework preset: Vite
3. Deploy automatically on push

## Mobile Access

The app is fully responsive and works great on mobile devices:

1. Deploy the app using one of the methods above
2. Open the URL on your phone's browser
3. Allow camera permissions when prompted
4. Position your phone so your full body is visible
5. Start your workout with AI guidance!

### PWA Support

For better mobile experience, you can add PWA (Progressive Web App) support:

1. Add a `manifest.json` file
2. Register a service worker
3. Users can then "Add to Home Screen" for app-like experience

## How the AI Trainer Works

1. **Camera Input**: Captures video from your device camera
2. **Pose Detection**: MediaPipe Holistic detects 33 body landmarks
3. **Angle Calculation**: Computes joint angles for form analysis
4. **Feedback Generation**: Provides real-time suggestions based on exercise type
5. **Visual Overlay**: Draws skeleton overlay on your video feed

## Exercise Form Checks

### Push-ups
- Body alignment (shoulder-hip line)
- Elbow angle (target: 90 degrees)
- Core engagement

### Squats
- Knee angle (target: < 90 degrees for depth)
- Hip position relative to knees
- Balanced stance

### Plank
- Straight body line (shoulder-hip-ankle)
- No sagging or arching
- Core stability

## Troubleshooting

### Camera Not Working
- Ensure you've granted camera permissions
- Try using HTTPS (required for camera access)
- Check if another app is using the camera

### AI Model Loading Slowly
- First load downloads the MediaPipe models (~10MB)
- Subsequent loads use browser cache
- Ensure stable internet connection

### Poor Pose Detection
- Ensure good lighting
- Wear contrasting clothing
- Keep full body in frame
- Position camera at appropriate distance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for the amazing pose detection library
- YouTube for exercise tutorial videos
- The fitness community for inspiration

---

**Built with ❤️ for fitness enthusiasts everywhere**

Access your personal AI trainer anytime, anywhere - even from your phone!
