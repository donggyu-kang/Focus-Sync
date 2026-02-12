import { useState } from 'react';
import { Home } from '@/app/components/Home';
import { PersonalTimer } from '@/app/components/PersonalTimer';
import { GroupFocus } from '@/app/components/GroupFocus';
import { Statistics } from '@/app/components/Statistics';
import { Settings } from '@/app/components/Settings';

type Page = 'home' | 'personal' | 'group' | 'stats' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageHistory, setPageHistory] = useState<Page[]>(['home']);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setPageHistory(prev => [...prev, page]);
  };

  const handleBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    }
  };

  const handleHome = () => {
    setCurrentPage('home');
    setPageHistory(['home']);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'personal':
        return <PersonalTimer onNavigateHome={handleHome} onBack={handleBack} />;
      case 'group':
        return <GroupFocus onNavigateHome={handleHome} onBack={handleBack} />;
      case 'stats':
        return <Statistics onNavigateHome={handleHome} onBack={handleBack} />;
      case 'settings':
        return <Settings onNavigateHome={handleHome} onBack={handleBack} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="h-full w-full min-h-0 overflow-hidden">
      {renderPage()}
    </div>
  );
}