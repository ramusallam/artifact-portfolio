import { useState, useEffect } from 'react';
import {
  getPortfolioForStudent,
  getSeniorSpeech,
  createPortfolioLink,
  getPortfolioLink,
} from '../services/firestore';
import type { ReportCard, SeniorSpeech } from '../services/firestore';
import { auth } from '../services/firebase';
import ArtifactCard from './ArtifactCard';
import PasswordModal from './PasswordModal';

interface PortfolioViewProps {
  linkId?: string;
  isShared?: boolean;
}

interface GroupedPortfolio {
  [gradeLevel: string]: {
    [semester: string]: {
      [className: string]: ReportCard;
    };
  };
}

const GRADE_LABELS: Record<string, string> = {
  '9': '9th Grade',
  '10': '10th Grade',
  '11': '11th Grade',
  '12': '12th Grade',
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function PortfolioView({ linkId, isShared }: PortfolioViewProps) {
  const [searchName, setSearchName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [seniorSpeech, setSeniorSpeech] = useState<SeniorSpeech | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSemester, setActiveSemester] = useState<Record<string, string>>({});

  // Share link state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  // Password gate for shared links
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [sharedLinkData, setSharedLinkData] = useState<{
    studentName: string;
    passwordHash: string;
  } | null>(null);

  // Handle shared link access
  useEffect(() => {
    if (isShared && linkId) {
      loadSharedLink(linkId);
    }
  }, [isShared, linkId]);

  const loadSharedLink = async (id: string) => {
    const link = await getPortfolioLink(id);
    if (!link) return;
    setSharedLinkData({
      studentName: link.studentName,
      passwordHash: link.passwordHash,
    });
    setNeedsPassword(true);
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!sharedLinkData) return;
    const hash = await hashPassword(password);
    if (hash === sharedLinkData.passwordHash) {
      setNeedsPassword(false);
      setPasswordError('');
      loadPortfolio(sharedLinkData.studentName);
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const loadPortfolio = async (name: string) => {
    setLoading(true);
    setStudentName(name);
    try {
      const [cards, speech] = await Promise.all([
        getPortfolioForStudent(name),
        getSeniorSpeech(name),
      ]);
      setReportCards(cards);
      setSeniorSpeech(speech);

      // Default all years to S1
      const defaults: Record<string, string> = {};
      cards.forEach((c) => {
        if (!defaults[c.gradeLevel]) defaults[c.gradeLevel] = 'S1';
      });
      setActiveSemester(defaults);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchName.trim()) return;
    loadPortfolio(searchName.trim());
  };

  const handleGenerateLink = async () => {
    if (!studentName || !auth.currentUser) return;
    setGeneratingLink(true);

    const password = generatePassword();
    const passwordHash = await hashPassword(password);

    try {
      const docRef = await createPortfolioLink({
        studentName,
        passwordHash,
        createdBy: auth.currentUser.uid,
      });
      const url = `${window.location.origin}/#shared/${docRef.id}`;
      setShareUrl(url);
      setSharePassword(password);
      setShowShareModal(true);
    } catch (err) {
      console.error('Failed to generate link:', err);
    } finally {
      setGeneratingLink(false);
    }
  };

  // Group report cards
  const grouped: GroupedPortfolio = {};
  reportCards.forEach((card) => {
    if (!grouped[card.gradeLevel]) grouped[card.gradeLevel] = {};
    if (!grouped[card.gradeLevel][card.semester])
      grouped[card.gradeLevel][card.semester] = {};
    grouped[card.gradeLevel][card.semester][card.className] = card;
  });

  const sortedGradeLevels = Object.keys(grouped).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  if (needsPassword) {
    return (
      <PasswordModal
        mode="enter"
        onSubmit={handlePasswordSubmit}
        onClose={() => (window.location.hash = '')}
        error={passwordError}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header / search */}
      {!studentName && !isShared && (
        <>
          <h1 className="font-serif text-2xl text-sa-green font-bold mb-6">
            Student Portfolio
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
              View
            </button>
          </div>
        </>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-sa-gold border-t-transparent rounded-full" />
        </div>
      )}

      {/* Portfolio content */}
      {!loading && studentName && (
        <>
          {/* Portfolio header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl text-sa-green font-bold">
                {studentName}
              </h1>
              <p className="text-sa-slate text-lg">Student Portfolio</p>
            </div>
            {!isShared && (
              <button
                onClick={handleGenerateLink}
                disabled={generatingLink}
                className="px-4 py-2 text-sm font-medium border border-sa-green text-sa-green rounded-xl hover:bg-sa-green hover:text-white transition-colors"
              >
                {generatingLink ? 'Generating...' : 'Generate Private Link'}
              </button>
            )}
          </div>

          {sortedGradeLevels.length === 0 && (
            <p className="text-center text-sa-slate py-12">
              No artifacts found for this student.
            </p>
          )}

          {/* Year sections */}
          {sortedGradeLevels.map((gl) => {
            const semesters = Object.keys(grouped[gl]).sort();
            const currentSemester = activeSemester[gl] || 'S1';
            const classes = grouped[gl][currentSemester] || {};

            return (
              <div key={gl} className="year-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl text-sa-green font-bold">
                    {GRADE_LABELS[gl] || `${gl}th Grade`}
                  </h2>
                  <div className="flex bg-stone-100 rounded-lg p-0.5">
                    {semesters.map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setActiveSemester({ ...activeSemester, [gl]: s })
                        }
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          currentSemester === s
                            ? 'bg-white text-sa-green shadow-sm'
                            : 'text-sa-slate-light hover:text-sa-slate'
                        }`}
                      >
                        {s === 'S1' ? 'Semester 1' : 'Semester 2'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  {Object.entries(classes).map(([clsName, card]) => (
                    <div key={clsName}>
                      <h3 className="text-sm font-semibold text-sa-slate mb-2">
                        {clsName}
                      </h3>
                      <div className="space-y-2">
                        {card.artifacts.map((artifact, i) => (
                          <ArtifactCard
                            key={i}
                            title={artifact.title}
                            description={artifact.aiDescription}
                            type={artifact.type}
                            url={artifact.url}
                          />
                        ))}
                      </div>
                      {card.teacherComment && (
                        <p className="mt-2 text-sm text-sa-rust italic pl-8">
                          {card.teacherComment}
                        </p>
                      )}
                    </div>
                  ))}
                  {Object.keys(classes).length === 0 && (
                    <p className="text-sm text-sa-slate-light italic">
                      No artifacts for this semester.
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Senior Speech */}
          <div className="senior-speech-card rounded-2xl p-6 mt-4">
            <h2 className="font-serif text-xl text-sa-green font-bold mb-4">
              Senior Speech
            </h2>
            {seniorSpeech ? (
              <div className="flex gap-6">
                {seniorSpeech.scriptUrl && (
                  <a
                    href={seniorSpeech.scriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-stone-200 card-hover"
                  >
                    <svg className="w-8 h-8 text-sa-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm font-medium text-sa-green">Script</span>
                  </a>
                )}
                {seniorSpeech.videoUrl && (
                  <a
                    href={seniorSpeech.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-stone-200 card-hover"
                  >
                    <svg className="w-8 h-8 text-sa-green-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                    </svg>
                    <span className="text-sm font-medium text-sa-green">Video</span>
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-sa-slate-light italic">
                Senior speech will appear here when available.
              </p>
            )}
          </div>
        </>
      )}

      {/* Share modal */}
      {showShareModal && (
        <PasswordModal
          mode="generate"
          shareUrl={shareUrl}
          password={sharePassword}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
