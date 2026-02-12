import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Home, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StatisticsProps {
  onNavigateHome: () => void;
  onBack: () => void;
}

interface DailyStats {
  date: string;
  total: number;
}

export function Statistics({ onNavigateHome, onBack }: StatisticsProps) {
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    const data: DailyStats[] = [];
    const today = new Date();
    
    for (let i = 59; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const stored = localStorage.getItem('focusTimer');
      let total = 0;
      
      if (stored) {
        const focusData = JSON.parse(stored);
        if (focusData.date === dateStr) {
          total = focusData.total;
        }
      }
      
      if (i > 0) {
        total = Math.floor(Math.random() * 7200);
      }
      
      data.push({ date: dateStr, total });
    }
    
    setDailyData(data);
  };

  const formatTimeShort = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTodayTotal = () => {
    const today = new Date().toDateString();
    const todayData = dailyData.find(d => d.date === today);
    return todayData?.total || 0;
  };

  const getWeekTotal = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    
    return dailyData
      .filter(d => {
        const date = new Date(d.date);
        return date >= weekStart && date <= today;
      })
      .reduce((sum, d) => sum + d.total, 0);
  };

  const getMonthTotal = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return dailyData
      .filter(d => {
        const date = new Date(d.date);
        return date >= monthStart && date <= today;
      })
      .reduce((sum, d) => sum + d.total, 0);
  };

  const getWeekAverage = () => {
    const weekTotal = getWeekTotal();
    const today = new Date();
    const daysFromMonday = (today.getDay() + 6) % 7 + 1;
    return Math.floor(weekTotal / daysFromMonday);
  };

  const getMonthAverage = () => {
    const monthTotal = getMonthTotal();
    const today = new Date();
    const daysInMonth = today.getDate();
    return Math.floor(monthTotal / daysInMonth);
  };

  const getWeeklyChartData = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    
    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    
    return weekDays.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toDateString();
      const dayData = dailyData.find(d => d.date === dateStr);
      
      return {
        name: day,
        time: Math.floor((dayData?.total || 0) / 60),
      };
    });
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getDayTotal = (day: number | null) => {
    if (day === null) return 0;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toDateString();
    const dayData = dailyData.find(d => d.date === dateStr);
    return dayData?.total || 0;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const rawDays = getDaysInMonth();
  const days = [...rawDays];
  while (days.length < 42) days.push(null);
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

  /* 편안한 색감: 세이지/크림 톤 */
  const chartColor = '#8B9A7C';
  const intensityColors = {
    none: 'bg-stone-100',
    low: 'bg-[#b5c4a8]',
    mid: 'bg-[#8B9A7C]',
    high: 'bg-[#6B7B5C]',
  };

  const getIntensityClass = (day: number | null) => {
    if (day === null) return 'bg-transparent';
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toDateString();
    const dayData = dailyData.find(d => d.date === dateStr);
    const total = dayData?.total || 0;
    if (total === 0) return intensityColors.none;
    if (total < 1800) return intensityColors.low;
    if (total < 3600) return intensityColors.mid;
    return intensityColors.high;
  };

  return (
    <div className="h-full w-full flex items-center justify-center relative p-3 min-h-0">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1759035016336-3e2bae2f8c72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMGZvcmVzdCUyMG5hdHVyZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcwODcyNDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080)',
        }}
      >
        <div className="absolute inset-0 bg-[#F7F5F2]/85 backdrop-blur-sm" />
      </div>
      <Card className="w-full max-w-5xl h-full max-h-[100%] flex flex-col shadow-lg border border-stone-200/80 bg-[#FDFCFA]/98 backdrop-blur relative z-10 min-h-0">
        <CardHeader className="shrink-0 border-b border-stone-200/80 py-3 px-5">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 hover:bg-stone-100 text-stone-600 transition-colors">
              <ArrowLeft className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNavigateHome} className="h-9 w-9 hover:bg-stone-100 text-stone-600 transition-colors">
              <Home className="size-5" />
            </Button>
            <CardTitle className="text-xl font-semibold text-stone-700">통계</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            {/* Summary - 컴팩트 */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="text-center py-4 px-3 rounded-xl bg-[#E8EBE4] border border-[#d4d9cc]">
                <div className="text-xs font-medium text-stone-600 mb-1">오늘</div>
                <div className="text-2xl font-bold text-[#6B7B5C] tabular-nums">{formatTimeShort(getTodayTotal())}</div>
              </div>
              <div className="text-center py-4 px-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-xs font-medium text-stone-600 mb-1">주간</div>
                <div className="text-2xl font-bold text-stone-700 tabular-nums">{formatTimeShort(getWeekTotal())}</div>
                <div className="text-xs text-stone-500 mt-0.5">평균 {formatTimeShort(getWeekAverage())}</div>
              </div>
              <div className="text-center py-4 px-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-xs font-medium text-stone-600 mb-1">월간</div>
                <div className="text-2xl font-bold text-stone-700 tabular-nums">{formatTimeShort(getMonthTotal())}</div>
                <div className="text-xs text-stone-500 mt-0.5">평균 {formatTimeShort(getMonthAverage())}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
              {/* Weekly Chart - 높이 유연 */}
              <div className="bg-white/80 rounded-xl p-4 border border-stone-200/80 flex flex-col min-h-0">
                <h3 className="text-sm font-semibold text-stone-700 mb-2 shrink-0">이번 주 집중 시간</h3>
                <div className="flex-1 min-h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getWeeklyChartData()}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#78716c" 
                        fontSize={11} 
                        tick={{ fontWeight: 500 }} 
                      />
                      <YAxis 
                        stroke="#78716c" 
                        fontSize={11}
                        width={28}
                        tick={{ fontWeight: 500 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}분`, '집중시간']}
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: '1px solid #e7e5e4', 
                          fontWeight: 500,
                          backgroundColor: '#FDFCFA'
                        }}
                      />
                      <Bar dataKey="time" fill={chartColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Calendar - 세로 공간 꽉 채움 */}
              <div className="bg-white/80 rounded-xl p-4 border border-stone-200/80 flex flex-col min-h-0 flex-1">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <h3 className="text-sm font-semibold text-stone-700">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </h3>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-stone-100 text-stone-600 transition-colors">
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-stone-100 text-stone-600 transition-colors">
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
                {/* 요일 헤더 + 6줄 날짜 그리드: 남는 세로 공간 채움 */}
                <div className="grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-1 flex-1 min-h-0 w-full">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="flex items-center justify-center text-[10px] font-medium text-stone-500 min-h-0"
                    >
                      {day}
                    </div>
                  ))}
                  {days.map((day, index) => (
                    <div
                      key={index}
                      className={`min-w-0 min-h-0 rounded flex items-center justify-center text-[11px] transition-colors ${
                        day ? 'cursor-pointer hover:ring-2 hover:ring-[#8B9A7C]/50 hover:ring-inset' : ''
                      } ${getIntensityClass(day)}`}
                      title={day ? `${day}일: ${formatTimeShort(getDayTotal(day))}` : ''}
                    >
                      {day != null && (
                        <span className="font-medium text-stone-700">{day}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-stone-500 shrink-0 flex-wrap">
                  <span>강도:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-stone-100" />
                    <span>없음</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-[#b5c4a8]" />
                    <span>낮음</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-[#8B9A7C]" />
                    <span>중간</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-[#6B7B5C]" />
                    <span>높음</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
