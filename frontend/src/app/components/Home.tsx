import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { User, Users, TrendingUp, Settings } from 'lucide-react';

type Page = 'home' | 'personal' | 'group' | 'stats' | 'settings';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export function Home({ onNavigate }: HomeProps) {
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('settings')}
          className="absolute top-4 right-4 hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <Settings className="size-5" />
        </Button>
        <CardHeader className="text-center pt-10 pb-6">
          <CardTitle className="text-4xl font-bold text-stone-700 mb-2 tracking-tight">
            집중 타이머
          </CardTitle>
          <p className="text-sm text-stone-500">시간을 소중히, 집중을 효율적으로</p>
        </CardHeader>
        <CardContent className="space-y-3 pb-8">
          <Button
            size="lg"
            onClick={() => onNavigate('personal')}
            className="w-full h-14 text-base font-semibold bg-[#8B9A7C] hover:bg-[#7A8A6B] text-white border-0 shadow-sm hover:shadow transition-all"
          >
            <User className="mr-2 size-5" />
            개인 집중
          </Button>
          
          <Button
            size="lg"
            onClick={() => onNavigate('group')}
            className="w-full h-14 text-base font-semibold border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-all"
          >
            <Users className="mr-2 size-5" />
            그룹 집중
          </Button>
          
          <Button
            size="lg"
            onClick={() => onNavigate('stats')}
            className="w-full h-14 text-base font-semibold border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-all"
          >
            <TrendingUp className="mr-2 size-5" />
            통계
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}