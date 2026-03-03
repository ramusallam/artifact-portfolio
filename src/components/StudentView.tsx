import { useState } from 'react';
import { getReportCardsForStudent } from '../services/firestore';
import type { ReportCard } from '../services/firestore';
import ArtifactCard from './ArtifactCard';

export default function StudentView() {
  const [searchName, setSearchName] = useState('');
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const cards = await getReportCardsForStudent(searchName.trim());
      setReportCards(cards);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
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
          No report cards found for "{searchName}".
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
                <span className="text-lg font-bold bg-sa-gold/15 text-sa-green px-3 py-1 rounded-lg">
                  {card.grade}
                </span>
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
