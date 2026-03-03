import { useState, useEffect } from 'react';
import Header from './components/Header';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';
import PortfolioView from './components/PortfolioView';

export type Tab = 'teacher' | 'student' | 'portfolio';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('teacher');

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
        {activeTab === 'teacher' && <TeacherView />}
        {activeTab === 'student' && <StudentView />}
        {activeTab === 'portfolio' && <PortfolioView />}
      </main>
    </div>
  );
}
