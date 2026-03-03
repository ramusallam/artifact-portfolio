import { useState, useEffect } from 'react';
import { useAuthState, signInWithGoogle, signOutUser } from './services/firebase';
import Header from './components/Header';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';
import PortfolioView from './components/PortfolioView';
import LoginScreen from './components/LoginScreen';

export type Tab = 'teacher' | 'student' | 'portfolio';

export default function App() {
  const { user, loading } = useAuthState();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50">
        <div className="animate-spin w-10 h-10 border-4 border-sa-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.location.hash = tab;
        }}
        onSignOut={signOutUser}
      />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'teacher' && <TeacherView user={user} />}
        {activeTab === 'student' && <StudentView />}
        {activeTab === 'portfolio' && <PortfolioView />}
      </main>
    </div>
  );
}
