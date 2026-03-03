import { useState, useEffect, useRef } from 'react';
import { getReportCardsForStudent, deleteReportCard } from '../services/firestore';
import type { ReportCard } from '../services/firestore';
import ArtifactCard from './ArtifactCard';

interface StudentViewProps {
  autoLoadStudent?: string;
}

export default function StudentView({ autoLoadStudent }: StudentViewProps) {
  const [searchName, setSearchName] = useState('');
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentStudent, setCurrentStudent] = useState('');
  const autoLoaded = useRef(false);

  // Auto-load from teacher save
  useEffect(() => {
    if (autoLoadStudent && !autoLoaded.current) {
      autoLoaded.current = true;
      setSearchName(autoLoadStudent);
      loadStudent(autoLoadStudent);
    }
  }, [autoLoadStudent]);

  const loadStudent = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setSearched(true);
    setCurrentStudent(name.trim());
    try {
      const cards = await getReportCardsForStudent(name.trim());
      setReportCards(cards);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => loadStudent(searchName);

  const handleDelete = async (id: string) => {
    try {
      await deleteReportCard(id);
      setReportCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="font-serif text-2xl text-sa-green font-bold mb-6">
        Student / Parent View
      </h1>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          placeholder="Enter student name"
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !searchName.trim()}
          className="px-6 py-2.5 bg-sa-green text-white text-sm font-medium rounded-xl hover:bg-sa-green-light disabled:opacity-40 transition-colors"
        >
          {loading ? 'Searching...' : 'View'}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-sa-gold border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && searched && reportCards.length === 0 && (
        <p className="text-center text-sa-slate py-12">
          No report cards found for &ldquo;{currentStudent}&rdquo;.
        </p>
      )}

      {!loading && reportCards.length > 0 && (
        <div className="space-y-8">
          {reportCards.map((card) => (
            <div key={card.id} className="animate-fade-in">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <h2 className="font-serif text-xl text-sa-green font-bold">
                    {card.studentName}
                  </h2>
                  <p className="text-sm text-sa-slate">
                    {card.className} &middot; {card.semester === 'S1' ? 'Semester 1' : 'Semester 2'} &middot; {card.schoolYear}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold bg-sa-gold/15 text-sa-green px-3 py-1 rounded-lg">
                    {card.grade}
                  </span>
                  <button
                    onClick={() => card.id && handleDelete(card.id)}
                    title="Delete entry"
                    className="text-stone-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-3">
                {card.artifacts.map((artifact, i) => (
                  <ArtifactCard
                    key={i}
                    title={artifact.title}
                    description={artifact.aiDescription}
                    type={artifact.type}
                    url={artifact.url}
                    showTeacherComment={false}
                  />
                ))}
              </div>

              {card.teacherComment && (
                <div className="bg-sa-gold/5 border border-sa-gold/20 rounded-xl p-4">
                  <p className="text-sm text-sa-slate italic">
                    <span className="font-medium text-sa-green not-italic">Teacher: </span>
                    {card.teacherComment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
