export interface Workout {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in seconds
  calories: number;
  targetMuscles: string[];
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseFeedback {
  exercise: string;
  status: 'correct' | 'needs-improvement' | 'incorrect';
  message: string;
  suggestion: string;
  score: number;
}

export const workouts: Workout[] = [
  {
    id: 'pushups',
    name: 'Push-ups',
    description: 'Classic upper body strength exercise targeting chest, shoulders, and triceps.',
    videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4',
    difficulty: 'beginner',
    duration: 60,
    calories: 7,
    targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
  },
  {
    id: 'squats',
    name: 'Squats',
    description: 'Fundamental lower body exercise for building leg strength and mobility.',
    videoUrl: 'https://www.youtube.com/embed/aCl6Cc9a3KY',
    difficulty: 'beginner',
    duration: 60,
    calories: 8,
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'Unilateral leg exercise improving balance and leg strength.',
    videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U',
    difficulty: 'beginner',
    duration: 60,
    calories: 6,
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
  },
  {
    id: 'plank',
    name: 'Plank',
    description: 'Core stability exercise that strengthens the entire midsection.',
    videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw',
    difficulty: 'beginner',
    duration: 60,
    calories: 5,
    targetMuscles: ['Core', 'Abs', 'Lower Back'],
  },
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'Full-body cardio exercise combining strength and aerobic training.',
    videoUrl: 'https://www.youtube.com/embed/auBLJHR7o_s',
    difficulty: 'intermediate',
    duration: 45,
    calories: 12,
    targetMuscles: ['Full Body', 'Cardio'],
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    description: 'Dynamic core and cardio exercise simulating climbing motion.',
    videoUrl: 'https://www.youtube.com/embed/nmKFRPLcY8g',
    difficulty: 'intermediate',
    duration: 45,
    calories: 10,
    targetMuscles: ['Core', 'Hip Flexors', 'Shoulders'],
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    description: 'Isolation exercise targeting the triceps using bodyweight.',
    videoUrl: 'https://www.youtube.com/embed/6kALZikXxLc',
    difficulty: 'intermediate',
    duration: 45,
    calories: 6,
    targetMuscles: ['Triceps', 'Shoulders'],
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    description: 'Classic cardio warm-up exercise for full body activation.',
    videoUrl: 'https://www.youtube.com/embed/c4wdUxcXFzc',
    difficulty: 'beginner',
    duration: 60,
    calories: 8,
    targetMuscles: ['Cardio', 'Legs', 'Shoulders'],
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    description: 'Running in place with high knee lift for cardio and core engagement.',
    videoUrl: 'https://www.youtube.com/embed/COiBf_W0-BQ',
    difficulty: 'beginner',
    duration: 45,
    calories: 9,
    targetMuscles: ['Hip Flexors', 'Cardio', 'Core'],
  },
  {
    id: 'diamond-pushups',
    name: 'Diamond Push-ups',
    description: 'Advanced push-up variation targeting triceps and inner chest.',
    videoUrl: 'https://www.youtube.com/embed/J0DnG1_S96I',
    difficulty: 'advanced',
    duration: 45,
    calories: 8,
    targetMuscles: ['Triceps', 'Inner Chest', 'Shoulders'],
  },
  {
    id: 'pike-pushups',
    name: 'Pike Push-ups',
    description: 'Shoulder-focused push-up variation mimicking handstand push-ups.',
    videoUrl: 'https://www.youtube.com/embed/F8DbZ0ksnho',
    difficulty: 'advanced',
    duration: 45,
    calories: 7,
    targetMuscles: ['Shoulders', 'Upper Chest', 'Triceps'],
  },
  {
    id: 'bulgarian-split-squats',
    name: 'Bulgarian Split Squats',
    description: 'Advanced unilateral leg exercise for strength and balance.',
    videoUrl: 'https://www.youtube.com/embed/sLtVZbT5qOc',
    difficulty: 'advanced',
    duration: 45,
    calories: 9,
    targetMuscles: ['Quadriceps', 'Glutes', 'Balance'],
  },
];
