import { useEffect, useState, useCallback, useRef } from 'react';
import { PoseLandmark, PoseFeedback } from '../data/workouts';

declare global {
  interface Window {
    Holistic: any;
    camera: any;
  }
}

interface UsePoseDetectionReturn {
  isReady: boolean;
  isDetecting: boolean;
  landmarks: PoseLandmark[] | null;
  feedback: PoseFeedback | null;
  error: string | null;
  startDetection: (videoElement: HTMLVideoElement, exercise: string) => void;
  stopDetection: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function usePoseDetection(): UsePoseDetectionReturn {
  const [isReady, setIsReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [landmarks, setLandmarks] = useState<PoseLandmark[] | null>(null);
  const [feedback, setFeedback] = useState<PoseFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const holisticRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const loadHolistic = async () => {
      try {
        if (!window.Holistic) {
          await import('@mediapipe/holistic');
        }
        
        const { Holistic } = await import('@mediapipe/holistic');
        holisticRef.current = new Holistic({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675469240/${file}`;
          },
        });

        holisticRef.current.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        holisticRef.current.onResults(onResults);
        setIsReady(true);
      } catch (err) {
        setError('Failed to load AI model. Please refresh the page.');
        console.error('Error loading Holistic:', err);
      }
    };

    loadHolistic();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const analyzePose = useCallback((poseLandmarks: any[], _exercise: string): PoseFeedback => {
    if (poseLandmarks.length < 33) {
      return {
        exercise,
        status: 'incorrect',
        message: 'Body not fully visible',
        suggestion: 'Make sure your entire body is in the camera frame',
        score: 0,
      };
    }

    const getLandmark = (idx: number) => poseLandmarks[idx];
    
    let status: 'correct' | 'needs-improvement' | 'incorrect' = 'correct';
    let message = 'Good form!';
    let suggestion = 'Keep it up!';
    let score = 100;

    switch (exercise) {
      case 'pushups':
      case 'diamond-pushups':
      case 'pike-pushups': {
        const leftShoulder = getLandmark(11);
        const rightShoulder = getLandmark(12);
        const leftElbow = getLandmark(13);
        const _rightElbow = getLandmark(14);
        const leftWrist = getLandmark(15);
        const _rightWrist = getLandmark(16);
        const leftHip = getLandmark(23);
        const rightHip = getLandmark(24);

        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipY = (leftHip.y + rightHip.y) / 2;
        
        if (Math.abs(shoulderY - hipY) > 0.1) {
          status = 'needs-improvement';
          message = 'Keep your body in a straight line';
          suggestion = 'Engage your core and avoid sagging hips';
          score -= 20;
        }

        const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        if (elbowAngle > 90) {
          status = 'needs-improvement';
          message = 'Go lower for better results';
          suggestion = 'Lower your body until elbows are at 90 degrees';
          score -= 15;
        }
        break;
      }

      case 'squats':
      case 'bulgarian-split-squats': {
        const leftHip = getLandmark(23);
        const rightHip = getLandmark(24);
        const leftKnee = getLandmark(25);
        const rightKnee = getLandmark(26);
        const leftAnkle = getLandmark(27);
        const _rightAnkle = getLandmark(28);

        const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        if (kneeAngle > 100) {
          status = 'needs-improvement';
          message = 'Squat deeper for better activation';
          suggestion = 'Lower until thighs are parallel to the ground';
          score -= 20;
        }

        const hipY = (leftHip.y + rightHip.y) / 2;
        const kneeY = (leftKnee.y + rightKnee.y) / 2;
        if (hipY < kneeY - 0.05) {
          status = 'correct';
          message = 'Great depth!';
          suggestion = 'Maintain this form';
        }
        break;
      }

      case 'plank': {
        const leftShoulder = getLandmark(11);
        const rightShoulder = getLandmark(12);
        const leftHip = getLandmark(23);
        const rightHip = getLandmark(24);
        const leftAnkle = getLandmark(27);
        const rightAnkle = getLandmark(28);

        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipY = (leftHip.y + rightHip.y) / 2;
        const ankleY = (leftAnkle.y + rightAnkle.y) / 2;

        if (Math.abs(shoulderY - hipY) > 0.1 || Math.abs(hipY - ankleY) > 0.1) {
          status = 'needs-improvement';
          message = 'Keep your body in a straight line';
          suggestion = 'Avoid arching your back or lifting hips too high';
          score -= 25;
        }
        break;
      }

      case 'lunges': {
        const leftHip = getLandmark(23);
        const _rightHip = getLandmark(24);
        const leftKnee = getLandmark(25);
        const _rightKnee = getLandmark(26);

        const kneeAngle = calculateAngle(leftHip, leftKnee, getLandmark(27));
        if (kneeAngle > 100) {
          status = 'needs-improvement';
          message = 'Lower deeper into the lunge';
          suggestion = 'Both knees should be at approximately 90 degrees';
          score -= 20;
        }
        break;
      }

      default:
        message = 'Perform the exercise with controlled movements';
        suggestion = 'Focus on proper form over speed';
    }

    return { exercise, status, message, suggestion, score };
  }, []);

  const onResults = useCallback((results: any) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
          setLandmarks(results.poseLandmarks.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility || 0,
          })));

          // Draw landmarks
          results.poseLandmarks.forEach((landmark: any) => {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#4f46e5';
            ctx.fill();
          });

          // Draw connections
          const connections: [number, number][] = [
            [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
            [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
            [24, 26], [26, 28], [11, 21], [12, 22]
          ];
          
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 2;
          connections.forEach(([start, end]) => {
            const startPoint = results.poseLandmarks[start];
            const endPoint = results.poseLandmarks[end];
            if (startPoint && endPoint) {
              ctx.beginPath();
              ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
              ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
              ctx.stroke();
            }
          });
        }
      }
    }
  }, []);

  const startDetection = useCallback((videoElement: HTMLVideoElement, exercise: string) => {
    if (!holisticRef.current || !isReady) return;

    setIsDetecting(true);
    setError(null);

    const detect = async () => {
      try {
        await holisticRef.current.send({ image: videoElement });
        
        if (holisticRef.current && isDetecting) {
          animationFrameRef.current = requestAnimationFrame(detect);
        }
      } catch (err) {
        setError('Error during pose detection');
        console.error(err);
      }
    };

    detect();
  }, [isReady, isDetecting]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setLandmarks(null);
    setFeedback(null);
  }, []);

  return {
    isReady,
    isDetecting,
    landmarks,
    feedback,
    error,
    startDetection,
    stopDetection,
    canvasRef,
  };
}

function calculateAngle(a: any, b: any, c: any): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}
