import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Play, Square, Coffee, User, Bed, Armchair, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { getSettings } from './Settings';

type TimerState = 'idle' | 'focusing' | 'resting';

interface PersonalTimerProps {
  onNavigateHome: () => void;
  onBack: () => void;
}

export function PersonalTimer({ onNavigateHome, onBack }: PersonalTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTime, setRestTime] = useState(600); // 10 minutes in seconds
  const [todayTotal, setTodayTotal] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Load today's total from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('focusTimer');
    
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        setTodayTotal(data.total);
      } else {
        // New day, reset
        localStorage.setItem('focusTimer', JSON.stringify({ date: today, total: 0 }));
        setTodayTotal(0);
      }
    } else {
      localStorage.setItem('focusTimer', JSON.stringify({ date: today, total: 0 }));
    }

    // Load rest time from settings
    const settings = getSettings();
    setRestTime(settings.restDuration);
  }, []);

  // Timer logic
  useEffect(() => {
    const settings = getSettings();
    
    if (timerState === 'focusing') {
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => {
          const newTime = settings.pomodoroEnabled ? prev - 1 : prev + 1;
          
          // Pomodoro countdown finished
          if (settings.pomodoroEnabled && newTime <= 0) {
            handlePomodoroComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timerState === 'resting') {
      intervalRef.current = window.setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            // Rest time is over
            setTimerState('idle');
            const settings = getSettings();
            const resetTime = settings.pomodoroEnabled 
              ? (isLongBreak ? settings.longBreak : settings.shortBreak) * 60
              : settings.restDuration;
            setRestTime(resetTime);
            setIsLongBreak(false);
            return resetTime;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, isLongBreak]);

  const handlePomodoroComplete = () => {
    const settings = getSettings();
    const newCount = pomodoroCount + 1;
    setPomodoroCount(newCount);
    
    // Add pomodoro duration to today's total
    const pomodoroSeconds = settings.pomodoroDuration * 60;
    const newTotal = todayTotal + pomodoroSeconds;
    setTodayTotal(newTotal);
    
    const today = new Date().toDateString();
    localStorage.setItem('focusTimer', JSON.stringify({ date: today, total: newTotal }));
    
    // Determine if it's time for long break
    const shouldBeLongBreak = newCount % settings.longBreakInterval === 0;
    setIsLongBreak(shouldBeLongBreak);
    
    // Auto start rest
    const breakDuration = shouldBeLongBreak ? settings.longBreak : settings.shortBreak;
    setRestTime(breakDuration * 60);
    setTimerState('resting');
  };

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = () => {
    const settings = getSettings();
    
    if (settings.pomodoroEnabled) {
      // Start countdown from pomodoro duration
      setElapsedTime(settings.pomodoroDuration * 60);
    } else {
      setElapsedTime(0);
    }
    
    setTimerState('focusing');
  };

  const handleEnd = () => {
    const settings = getSettings();
    
    // Add elapsed time to today's total
    const timeToAdd = settings.pomodoroEnabled 
      ? (settings.pomodoroDuration * 60) - elapsedTime
      : elapsedTime;
    
    const newTotal = todayTotal + timeToAdd;
    setTodayTotal(newTotal);
    
    const today = new Date().toDateString();
    localStorage.setItem('focusTimer', JSON.stringify({ date: today, total: newTotal }));
    
    setElapsedTime(0);
    setTimerState('idle');
  };

  const handleRest = () => {
    const settings = getSettings();
    
    // Add elapsed time to today's total (rest time is NOT added)
    const timeToAdd = settings.pomodoroEnabled 
      ? (settings.pomodoroDuration * 60) - elapsedTime
      : elapsedTime;
    
    const newTotal = todayTotal + timeToAdd;
    setTodayTotal(newTotal);
    
    const today = new Date().toDateString();
    localStorage.setItem('focusTimer', JSON.stringify({ date: today, total: newTotal }));
    
    setElapsedTime(0);
    setRestTime(settings.restDuration);
    setTimerState('resting');
  };

  const handleEndRest = () => {
    const settings = getSettings();
    setRestTime(settings.restDuration);
    setIsLongBreak(false);
    setTimerState('idle');
  };

  const getStateLabel = () => {
    const settings = getSettings();
    
    switch (timerState) {
      case 'focusing':
        return settings.pomodoroEnabled ? '뽀모도로 집중 중...' : '집중 중...';
      case 'resting':
        return isLongBreak ? '긴 휴식 중...' : '휴식 중...';
      case 'idle':
        return '준비 상태';
    }
  };

  const StateIcon = () => {
    if (timerState === 'focusing') {
      return (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <User className="size-7 text-[#6B7B5C]" />
        </motion.div>
      );
    }
    
    if (timerState === 'resting') {
      return (
        <motion.div
          animate={{ rotate: [0, -5, 0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Bed className="size-7 text-stone-400" />
        </motion.div>
      );
    }
    
    return <Armchair className="size-7 text-stone-400" />;
  };

  const settings = getSettings();

  return (
    <div className="h-full w-full flex items-center justify-center relative min-h-0">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1759035016336-3e2bae2f8c72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMGZvcmVzdCUyMG5hdHVyZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcwODcyNDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080)',
        }}
      >
        <div className="absolute inset-0 bg-[#F7F5F2]/80 backdrop-blur-sm" />
      </div>
      <Card className="w-full max-w-md shadow-lg border border-stone-200/80 bg-[#FDFCFA]/98 backdrop-blur relative z-10 mx-4">
        <CardHeader className="border-b border-stone-200/80 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-stone-100 h-10 w-10 transition-colors text-stone-600"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <CardTitle className="text-xl font-semibold text-stone-700">개인 집중</CardTitle>
            </div>
            <StateIcon />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 pb-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className={`text-6xl font-bold transition-colors tabular-nums ${
              timerState === 'focusing' ? 'text-[#6B7B5C]' : 
              timerState === 'resting' ? 'text-stone-400' : 
              'text-stone-700'
            }`}>
              {timerState === 'resting' ? formatTime(restTime) : formatTime(elapsedTime)}
            </div>
            <div className="mt-2 text-sm text-stone-600 font-medium">
              {getStateLabel()}
            </div>
            {settings.pomodoroEnabled && timerState === 'idle' && (
              <div className="mt-1 text-xs text-stone-500">
                완료한 뽀모도로: {pomodoroCount}개
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            {timerState === 'idle' && (
              <Button
                size="lg"
                onClick={handleStart}
                className="px-10 h-14 bg-[#8B9A7C] hover:bg-[#7A8A6B] text-white border-0 font-semibold text-base shadow-sm hover:shadow transition-all"
              >
                <Play className="mr-2 size-5" />
                시작
              </Button>
            )}
            
            {timerState === 'focusing' && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleEnd}
                  className="px-6 h-14 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-base transition-all"
                >
                  <Square className="mr-2 size-5" />
                  종료
                </Button>
                {!settings.pomodoroEnabled && (
                  <Button
                    size="lg"
                    onClick={handleRest}
                    className="px-6 h-14 bg-stone-600 hover:bg-stone-700 text-white border-0 font-semibold text-base shadow-sm transition-all"
                  >
                    <Coffee className="mr-2 size-5" />
                    휴식
                  </Button>
                )}
              </>
            )}
            
            {timerState === 'resting' && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleEndRest}
                className="px-6 h-14 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-base transition-all"
              >
                <Square className="mr-2 size-5" />
                휴식 종료
              </Button>
            )}
          </div>

          {/* Today's Total */}
          <div className="pt-5 border-t border-stone-200">
            <div className="text-center">
              <div className="text-sm text-stone-600 mb-1 font-medium">오늘 누적 집중시간</div>
              <div className="text-3xl font-bold text-[#6B7B5C] tabular-nums">
                {formatTime(todayTotal)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}