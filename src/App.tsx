import React, { useState } from 'react';
import { workouts, Workout } from '../data/workouts';
import { WorkoutCard } from './WorkoutCard';
import { WorkoutSession } from './WorkoutSession';

export const App: React.FC = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filteredWorkouts = filterDifficulty === 'all' 
    ? workouts 
    : workouts.filter((w: Workout) => w.difficulty === filterDifficulty);

  if (selectedWorkout) {
    return (
      <WorkoutSession 
        workout={selectedWorkout} 
        onBack={() => setSelectedWorkout(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                AI Fitness Trainer
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time pose detection and form correction powered by AI
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Personal AI Trainer
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Get instant feedback on your form with real-time pose detection. 
            Train smarter, prevent injuries, and maximize your results.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-indigo-100">Real-time pose tracking using MediaPipe Holistic</p>
            </div>
            
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Video Guidance</h3>
              <p className="text-indigo-100">Professional tutorial videos for each exercise</p>
            </div>
            
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Form Correction</h3>
              <p className="text-indigo-100">Instant feedback to improve your technique</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workouts Grid */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Choose Your Workout
          </h2>
          <p className="text-gray-600">
            {filteredWorkouts.length} exercises available • {workouts.filter((w: Workout) => w.difficulty === 'beginner').length} beginner • {workouts.filter((w: Workout) => w.difficulty === 'intermediate').length} intermediate • {workouts.filter((w: Workout) => w.difficulty === 'advanced').length} advanced
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorkouts.map((workout: Workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onSelect={setSelectedWorkout}
            />
          ))}
        </div>

        {filteredWorkouts.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No workouts found</h3>
            <p className="text-gray-500">Try adjusting your filter criteria</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">
            Built with React, TypeScript, and MediaPipe Holistic
          </p>
          <p className="text-sm text-gray-500">
            © 2024 AI Fitness Trainer. Train smart, stay healthy.
          </p>
        </div>
      </footer>
    </div>
  );
};
