import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Home, ArrowLeft, LogIn } from 'lucide-react';

interface GroupRoomListProps {
  onNavigateHome: () => void;
  onBack: () => void;
  onJoinRoom: (code: string) => void;
}

interface Room {
  code: string;
  name: string;
  createdAt: string;
  participants: any[];
}

export function GroupRoomList({ onNavigateHome, onBack, onJoinRoom }: GroupRoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    setRooms(storedRooms);
  }, []);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoinRoom(roomCode.toUpperCase());
    }
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onNavigateHome}
              className="hover:bg-stone-100 h-10 w-10 transition-colors text-stone-600"
            >
              <Home className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-stone-100 h-10 w-10 transition-colors text-stone-600"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <CardTitle className="text-xl font-semibold text-stone-700">방 참여</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5 pb-8">
          {/* Join by code */}
          <form onSubmit={handleJoinByCode} className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">방 코드로 참여</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="코드 입력"
                className="flex-1 px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-[#8B9A7C] focus:ring-1 focus:ring-[#8B9A7C]/30 uppercase bg-white text-center text-base text-stone-700"
                maxLength={6}
              />
              <Button type="submit" className="h-12 w-12 bg-[#8B9A7C] hover:bg-[#7A8A6B] text-white border-0 rounded-lg flex-shrink-0 shadow-sm hover:shadow transition-all">
                <LogIn className="size-5" />
              </Button>
            </div>
          </form>

          {/* Room list - 리스트 형태 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">생성된 방 목록</label>
            {rooms.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-sm">
                생성된 방이 없습니다
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto rounded-lg border border-stone-200 divide-y divide-stone-200 bg-white">
                {rooms.map((room) => (
                  <li
                    key={room.code}
                    className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 active:bg-stone-100 transition-colors"
                    onClick={() => onJoinRoom(room.code)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-700 truncate">{room.name}</div>
                      <div className="text-xs text-stone-500 mt-0.5">코드: {room.code}</div>
                    </div>
                    <span className="text-sm font-medium text-[#6B7B5C] shrink-0">{room.participants.length}명</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}