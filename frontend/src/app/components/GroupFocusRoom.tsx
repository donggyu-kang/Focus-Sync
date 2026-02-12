import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Play, Square, Coffee, User, Bed, Armchair, Home, LogOut, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { getSettings } from './Settings';

type TimerState = 'idle' | 'focusing' | 'resting';

interface Participant {
  id: string;
  name: string;
  status: TimerState;
  totalTime: number;
}

interface GroupFocusRoomProps {
  roomCode: string;
  onNavigateHome: () => void;
  onLeaveRoom: () => void;
}

export function GroupFocusRoom({ roomCode, onNavigateHome, onLeaveRoom }: GroupFocusRoomProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTime, setRestTime] = useState(600);
  const [myTotalTime, setMyTotalTime] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '2', name: '참여자 1', status: 'focusing', totalTime: 3600 },
    { id: '3', name: '참여자 2', status: 'resting', totalTime: 1800 },
    { id: '4', name: '참여자 3', status: 'idle', totalTime: 5400 },
  ]);
  const intervalRef = useRef<number | null>(null);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    const rooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    const room = rooms.find((r: any) => r.code === roomCode);
    if (room) {
      setRoomName(room.name);
    }

    const settings = getSettings();
    setRestTime(settings.restDuration);
  }, [roomCode]);

  useEffect(() => {
    const settings = getSettings();
    
    if (timerState === 'focusing') {
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => {
          const newTime = settings.pomodoroEnabled ? prev - 1 : prev + 1;
          
          if (!settings.pomodoroEnabled) {
            setMyTotalTime(t => t + 1);
          }
          
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
    
    const pomodoroSeconds = settings.pomodoroDuration * 60;
    setMyTotalTime(t => t + pomodoroSeconds);
    
    const shouldBeLongBreak = newCount % settings.longBreakInterval === 0;
    setIsLongBreak(shouldBeLongBreak);
    
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
      setElapsedTime(settings.pomodoroDuration * 60);
    } else {
      setElapsedTime(0);
    }
    
    setTimerState('focusing');
  };

  const handleEnd = () => {
    const settings = getSettings();
    
    const timeToAdd = settings.pomodoroEnabled 
      ? (settings.pomodoroDuration * 60) - elapsedTime
      : elapsedTime;
    
    setMyTotalTime(t => t + timeToAdd);
    setElapsedTime(0);
    setTimerState('idle');
  };

  const handleRest = () => {
    const settings = getSettings();
    
    const timeToAdd = settings.pomodoroEnabled 
      ? (settings.pomodoroDuration * 60) - elapsedTime
      : elapsedTime;
    
    setMyTotalTime(t => t + timeToAdd);
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

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
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

  const getParticipantIcon = (status: TimerState) => {
    switch (status) {
      case 'focusing':
        return (
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <User className="size-5 text-[#6B7B5C]" />
          </motion.div>
        );
      case 'resting':
        return (
          <motion.div
            animate={{ rotate: [0, -5, 0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bed className="size-5 text-stone-400" />
          </motion.div>
        );
      case 'idle':
        return <Armchair className="size-5 text-stone-400" />;
    }
  };

  const getStatusText = (status: TimerState) => {
    switch (status) {
      case 'focusing':
        return '집중';
      case 'resting':
        return '휴식';
      case 'idle':
        return '대기';
    }
  };

  const settings = getSettings();
  const myNickname = settings.nickname;

  return (
    <div className="h-full w-full flex items-center justify-center relative p-4 min-h-0">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1759035016336-3e2bae2f8c72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMGZvcmVzdCUyMG5hdHVyZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcwODcyNDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080)',
        }}
      >
        <div className="absolute inset-0 bg-[#F7F5F2]/80 backdrop-blur-sm" />
      </div>
      <Card className="w-full max-w-lg shadow-lg border border-stone-200/80 bg-[#FDFCFA]/98 backdrop-blur relative z-10">
        <CardHeader className="border-b border-stone-200/80 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onNavigateHome} className="hover:bg-stone-100 h-10 w-10 transition-colors text-stone-600">
                <Home className="size-5" />
              </Button>
              <div>
                <CardTitle className="text-xl font-semibold text-stone-700">{roomName || '그룹 집중'}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-stone-500">코드: {roomCode}</span>
                  <Button variant="ghost" size="sm" onClick={copyRoomCode} className="h-6 px-2 hover:bg-stone-100 text-stone-600 transition-colors">
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StateIcon />
              <Button variant="outline" size="sm" onClick={onLeaveRoom} className="border border-stone-300 hover:bg-stone-50 font-medium text-xs h-9 text-stone-700 transition-all">
                <LogOut className="size-4 mr-1" />
                나가기
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5 pb-6 max-h-[calc(100dvh-180px)] overflow-y-auto">
          {/* Timer Display */}
          <div className="text-center">
            <div className={`text-5xl font-bold transition-colors tabular-nums ${
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
                완료: {pomodoroCount}개
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            {timerState === 'idle' && (
              <Button size="lg" onClick={handleStart} className="px-8 h-14 bg-[#8B9A7C] hover:bg-[#7A8A6B] text-white border-0 font-semibold text-base shadow-sm hover:shadow transition-all">
                <Play className="mr-2 size-5" />
                시작
              </Button>
            )}
            
            {timerState === 'focusing' && (
              <>
                <Button size="lg" variant="outline" onClick={handleEnd} className="px-5 h-14 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-base transition-all">
                  <Square className="mr-2 size-5" />
                  종료
                </Button>
                {!settings.pomodoroEnabled && (
                  <Button size="lg" onClick={handleRest} className="px-5 h-14 bg-stone-600 hover:bg-stone-700 text-white border-0 font-semibold text-base shadow-sm transition-all">
                    <Coffee className="mr-2 size-5" />
                    휴식
                  </Button>
                )}
              </>
            )}
            
            {timerState === 'resting' && (
              <Button size="lg" variant="outline" onClick={handleEndRest} className="px-5 h-14 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-base transition-all">
                <Square className="mr-2 size-5" />
                휴식 종료
              </Button>
            )}
          </div>

          {/* My Total Time */}
          <div className="flex justify-center">
            <div className="px-6 py-3 bg-[#E8EBE4] rounded-xl text-center border border-[#d4d9cc]">
              <div className="text-xs font-medium text-stone-600 mb-1">
                나의 총 집중시간
              </div>
              <div className="text-xl font-bold text-[#6B7B5C] tabular-nums">
                {formatTime(myTotalTime)}
              </div>
            </div>
          </div>

          {/* Participants - 한 줄에 4명, 정사각형 카드 */}
          <div className="border-t border-stone-200 pt-4">
            <h3 className="text-sm font-semibold text-stone-700 mb-3">참여자 ({participants.length + 1}명)</h3>
            <div className="grid grid-cols-4 gap-2">
              {/* My Card - 정사각형 */}
              <div className="aspect-square p-3 bg-[#E8EBE4] rounded-xl border border-[#d4d9cc] flex flex-col items-center justify-center text-center gap-1 min-w-0">
                {timerState === 'focusing' ? (
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                    <User className="size-6 text-[#6B7B5C] mx-auto" />
                  </motion.div>
                ) : timerState === 'resting' ? (
                  <motion.div animate={{ rotate: [0, -5, 0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                    <Bed className="size-6 text-stone-400 mx-auto" />
                  </motion.div>
                ) : (
                  <Armchair className="size-6 text-stone-400 mx-auto" />
                )}
                <span className="font-semibold text-sm text-stone-700 truncate w-full">{myNickname}</span>
                <span className="text-[10px] text-stone-500">{getStatusText(timerState)}</span>
                <span className="text-xs font-bold text-[#6B7B5C] tabular-nums">{formatTime(myTotalTime)}</span>
              </div>
              {/* Other Participants */}
              {participants.map((participant) => (
                <div key={participant.id} className="aspect-square p-2 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center justify-center text-center gap-0.5 min-w-0 hover:bg-stone-100/80 transition-colors">
                  {getParticipantIcon(participant.status)}
                  <span className="font-medium text-sm text-stone-700 truncate w-full">{participant.name}</span>
                  <span className="text-[10px] text-stone-500">{getStatusText(participant.status)}</span>
                  <span className="text-xs font-semibold text-stone-600 tabular-nums">{formatTime(participant.totalTime)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
