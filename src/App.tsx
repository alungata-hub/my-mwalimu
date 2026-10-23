import { useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { DomainPage } from '@/pages/DomainPage';
import { PracticePage } from '@/pages/PracticePage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { StudyBuddyPage } from '@/pages/StudyBuddyPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AuthPage } from '@/pages/AuthPage';
import { GraduationCap, Loader2 } from 'lucide-react';

function App() {
  const { session, loading } = useAuth();
  const route = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 text-white">
            <GraduationCap className="w-6 h-6" />
          </span>
          <div className="flex items-center gap-2 text-ink-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  const { segments } = route;

  let page: React.ReactNode;
  let current: string;

  if (segments.length === 0 || segments[0] === 'dashboard') {
    page = <DashboardPage />;
    current = 'dashboard';
  } else if (segments[0] === 'domains' && segments[1]) {
    page = <DomainPage domainId={segments[1]} />;
    current = segments[1];
  } else if (segments[0] === 'practice') {
    page = <PracticePage />;
    current = 'practice';
  } else if (segments[0] === 'flashcards') {
    page = <FlashcardsPage />;
    current = 'flashcards';
  } else if (segments[0] === 'study-buddy') {
    page = <StudyBuddyPage />;
    current = 'study-buddy';
  } else if (segments[0] === 'settings') {
    page = <SettingsPage />;
    current = 'settings';
  } else {
    page = <NotFoundPage />;
    current = '';
  }

  return <Layout current={current}>{page}</Layout>;
}

export default App;
