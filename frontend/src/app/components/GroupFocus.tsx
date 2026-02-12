import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Home, Plus, Users, ArrowLeft } from 'lucide-react';
import { GroupFocusRoom } from './GroupFocusRoom';
import { GroupRoomList } from './GroupRoomList';

interface GroupFocusProps {
  onNavigateHome: () => void;
  onBack: () => void;
}

type GroupView = 'menu' | 'create' | 'join' | 'room';

export function GroupFocus({ onNavigateHome, onBack }: GroupFocusProps) {
  const [view, setView] = useState<GroupView>('menu');
  const [currentRoomCode, setCurrentRoomCode] = useState<string>('');

  const handleCreateRoom = (roomName: string) => {
    // Generate random room code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Save room to localStorage
    const rooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    const newRoom = {
      code,
      name: roomName,
      createdAt: new Date().toISOString(),
      participants: [
        { id: '1', name: '나', status: 'idle', totalTime: 0 }
      ]
    };
    rooms.push(newRoom);
    localStorage.setItem('groupRooms', JSON.stringify(rooms));
    
    setCurrentRoomCode(code);
    setView('room');
  };

  const handleJoinRoom = (code: string) => {
    setCurrentRoomCode(code);
    setView('room');
  };

  if (view === 'room') {
    return (
      <GroupFocusRoom
        roomCode={currentRoomCode}
        onNavigateHome={onNavigateHome}
        onLeaveRoom={() => setView('menu')}
      />
    );
  }

  if (view === 'join') {
    return (
      <GroupRoomList
        onNavigateHome={onNavigateHome}
        onBack={() => setView('menu')}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  if (view === 'create') {
    return <CreateRoomForm onNavigateHome={onNavigateHome} onBack={() => setView('menu')} onCreate={handleCreateRoom} />;
  }

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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNavigateHome}
              className="hover:bg-stone-100 h-10 w-10 transition-colors text-stone-600"
            >
              <Home className="size-5" />
            </Button>
            <CardTitle className="text-xl font-semibold text-stone-700">그룹 집중</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-6 pb-8">
          <Button
            size="lg"
            onClick={() => setView('create')}
            className="w-full h-14 text-base font-semibold bg-[#8B9A7C] hover:bg-[#7A8A6B] text-white border-0 shadow-sm hover:shadow transition-all"
          >
            <Plus className="mr-2 size-5" />
            방 생성
          </Button>
          
          <Button
            size="lg"
            onClick={() => setView('join')}
            className="w-full h-14 text-base font-semibold border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-all"
          >
            <Users className="mr-2 size-5" />
            방 참여
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface CreateRoomFormProps {
  onNavigateHome: () => void;
  onBack: () => void;
  onCreate: (roomName: string) => void;
}

function CreateRoomForm({ onNavigateHome, onBack, onCreate }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreate(roomName);
    }
  };

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
      <Card className="w-full max-w-sm shadow-lg border border-stone-200/80 bg-[#FDFCFA]/98 backdrop-blur relative z-10 mx-4">
        <CardHeader className="border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNavigateHome}
              className="hover:bg-stone-100 h-9 w-9 text-stone-600"
            >
              <Home className="size-5" />
            </Button>
            <CardTitle className="text-lg font-semibold text-stone-700">방 생성</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-2">방 제목</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="방 제목 입력"
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-[#8B9A7C] focus:ring-1 focus:ring-[#8B9A7C]/30 bg-white"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 h-11 border border-stone-200 hover:bg-stone-50 rounded-lg font-medium text-sm text-stone-700"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-[#8B9A7C] hover:bg-[#7A8A6B] text-white border-0 rounded-lg font-medium text-sm"
              >
                생성
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}