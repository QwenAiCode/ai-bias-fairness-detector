import React from 'react';
import { Workout } from '../data/workouts';

interface WorkoutCardProps {
  workout: Workout;
  onSelect: (workout: Workout) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onSelect }) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      onClick={() => onSelect(workout)}
    >
      <div className="relative h-48 bg-gray-200">
        <iframe
          src={workout.videoUrl}
          title={workout.name}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{workout.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[workout.difficulty]}`}>
            {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{workout.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{Math.floor(workout.duration / 60)}:{(workout.duration % 60).toString().padStart(2, '0')}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <span>{workout.calories} cal/min</span>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {workout.targetMuscles.map((muscle) => (
            <span key={muscle} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
              {muscle}
            </span>
          ))}
        </div>
        
        <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Start Workout</span>
        </button>
      </div>
    </div>
  );
};
