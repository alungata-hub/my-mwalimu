import { useRouter } from '@/lib/router';
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { DomainPage } from '@/pages/DomainPage';
import { PracticePage } from '@/pages/PracticePage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { StudyBuddyPage } from '@/pages/StudyBuddyPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  const route = useRouter();
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
