import type { User } from 'firebase/auth';
import type { Tab } from '../App';

const tabs: { key: Tab; label: string }[] = [
  { key: 'teacher', label: 'Teacher' },
  { key: 'student', label: 'Student / Parent' },
  { key: 'portfolio', label: 'Portfolio' },
];

interface HeaderProps {
  user: User;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onSignOut: () => void;
}

export default function Header({ user, activeTab, onTabChange, onSignOut }: HeaderProps) {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sa-green flex items-center justify-center">
            <span className="text-white text-sm font-bold">SA</span>
          </div>
          <span className="font-serif text-sa-green font-semibold text-lg hidden sm:block">
            Sonoma Academy
          </span>
        </div>

        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-sa-gold/10 text-sa-green border-b-2 border-sa-gold'
                  : 'text-sa-slate hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-sa-slate hidden sm:block">
            {user.displayName?.split(' ')[0]}
          </span>
          <button
            onClick={onSignOut}
            className="text-xs text-sa-slate-light hover:text-sa-rust transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
