import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Home, ArrowLeft, Plus, Minus } from 'lucide-react';

interface SettingsProps {
  onNavigateHome: () => void;
  onBack: () => void;
}

export interface AppSettings {
  nickname: string;
  restDuration: number; // in seconds
  pomodoroEnabled: boolean;
  pomodoroDuration: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  longBreakInterval: number; // number of pomodoros before long break
}

const DEFAULT_SETTINGS: AppSettings = {
  nickname: '나',
  restDuration: 600, // 10 minutes
  pomodoroEnabled: false,
  pomodoroDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

export function Settings({ onNavigateHome, onBack }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem('appSettings');
    if (stored) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  const handleNicknameChange = (value: string) => {
    saveSettings({ ...settings, nickname: value || '나' });
  };

  const handlePomodoroToggle = () => {
    saveSettings({ ...settings, pomodoroEnabled: !settings.pomodoroEnabled });
  };

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
      <Card className="w-full max-w-md shadow-lg border border-stone-200/80 bg-[#FDFCFA]/98 backdrop-blur relative z-10">
        <CardHeader className="border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-stone-100 h-10 w-10 transition-colors text-stone-600">
              <ArrowLeft className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNavigateHome} className="hover:bg-stone-100 h-10 w-10 transition-colors text-stone-600">
              <Home className="size-5" />
            </Button>
            <CardTitle className="text-xl font-semibold text-stone-700">설정</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5 pb-6 max-h-[calc(100dvh-160px)] overflow-y-auto">
          {/* Nickname */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-700">
              닉네임
            </label>
            <input
              type="text"
              value={settings.nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder="닉네임 입력"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-[#8B9A7C] focus:ring-1 focus:ring-[#8B9A7C]/30 bg-white"
            />
          </div>

          {/* Rest Duration */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-700">
              기본 휴식 시간
            </label>
            <NumberInput
              value={settings.restDuration / 60}
              onChange={(value) => saveSettings({ ...settings, restDuration: value * 60 })}
              min={1}
              max={120}
              step={5}
              unit="분"
            />
            <p className="text-[10px] text-stone-500">
              휴식 버튼 클릭 시 기본 시간
            </p>
          </div>

          {/* Pomodoro Toggle */}
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex-1 pr-2">
                <label className="block text-xs font-medium text-stone-700">
                  뽀모도로 모드
                </label>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  카운트다운으로 동작
                </p>
              </div>
              <button
                onClick={handlePomodoroToggle}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
                  settings.pomodoroEnabled ? 'bg-[#8B9A7C]' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    settings.pomodoroEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Pomodoro Settings */}
            {settings.pomodoroEnabled && (
              <div className="space-y-3 pl-3 border-l-4 border-[#8B9A7C]">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-700">
                    집중 시간
                  </label>
                  <NumberInput
                    value={settings.pomodoroDuration}
                    onChange={(value) => saveSettings({ ...settings, pomodoroDuration: value })}
                    min={1}
                    max={240}
                    step={5}
                    unit="분"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-700">
                    짧은 휴식
                  </label>
                  <NumberInput
                    value={settings.shortBreak}
                    onChange={(value) => saveSettings({ ...settings, shortBreak: value })}
                    min={1}
                    max={60}
                    step={5}
                    unit="분"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-700">
                    긴 휴식
                  </label>
                  <NumberInput
                    value={settings.longBreak}
                    onChange={(value) => saveSettings({ ...settings, longBreak: value })}
                    min={1}
                    max={120}
                    step={5}
                    unit="분"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-700">
                    긴 휴식 주기
                  </label>
                  <NumberInput
                    value={settings.longBreakInterval}
                    onChange={(value) => saveSettings({ ...settings, longBreakInterval: value })}
                    min={2}
                    max={20}
                    step={1}
                    unit="회"
                  />
                  <p className="text-[10px] text-stone-500">
                    몇 회 집중 후 긴 휴식
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reset to defaults */}
          <div className="border-t border-stone-200 pt-3">
            <Button
              variant="outline"
              onClick={() => saveSettings(DEFAULT_SETTINGS)}
              className="w-full py-4 border border-stone-200 hover:border-[#8B9A7C] hover:bg-stone-50 rounded-lg transition-all font-medium text-sm text-stone-700"
            >
              기본값으로 초기화
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

function NumberInput({ value, onChange, min, max, step, unit }: NumberInputProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(min);
      return;
    }
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, newValue));
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        className="h-10 w-10 rounded-lg border border-stone-200 hover:border-[#8B9A7C] hover:bg-stone-50 transition-all flex-shrink-0 text-stone-600"
      >
        <Minus className="size-4" />
      </Button>
      <div className="flex-1 relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleInputChange}
          min={min}
          className="w-full px-3 py-2 text-center text-lg font-medium border border-stone-200 rounded-lg focus:outline-none focus:border-[#8B9A7C] focus:ring-1 focus:ring-[#8B9A7C]/30 bg-white text-stone-700"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 pointer-events-none">
          {unit}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        className="h-10 w-10 rounded-lg border border-stone-200 hover:border-[#8B9A7C] hover:bg-stone-50 transition-all flex-shrink-0 text-stone-600"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

export function getSettings(): AppSettings {
  const stored = localStorage.getItem('appSettings');
  if (stored) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  }
  return DEFAULT_SETTINGS;
}