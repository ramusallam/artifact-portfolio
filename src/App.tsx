import { useState, useEffect } from 'react';
import { useAuthReady } from './services/firebase';
import Header from './components/Header';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';
import PortfolioView from './components/PortfolioView';

export type Tab = 'teacher' | 'student' | 'portfolio';

export default function App() {
  const authReady = useAuthReady();
  const [activeTab, setActiveTab] = useState<Tab>('teacher');
  const [lastSavedStudent, setLastSavedStudent] = useState('');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1) as Tab;
      if (['teacher', 'student', 'portfolio'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50">
        <div className="animate-spin w-10 h-10 border-4 border-sa-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (window.location.hash.startsWith('#shared/')) {
    const linkId = window.location.hash.replace('#shared/', '');
    return <PortfolioView linkId={linkId} isShared />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.location.hash = tab;
        }}
      />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'teacher' && (
          <TeacherView onSaved={(name) => setLastSavedStudent(name)} />
        )}
        {activeTab === 'student' && (
          <StudentView autoLoadStudent={lastSavedStudent} />
        )}
        {activeTab === 'portfolio' && (
          <PortfolioView autoLoadStudent={lastSavedStudent} />
        )}
      </main>
    </div>
  );
}
