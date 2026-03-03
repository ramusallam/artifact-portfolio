import { useState } from 'react';
import type { User } from 'firebase/auth';
import type { Artifact } from '../services/firestore';
import { saveReportCard } from '../services/firestore';
import { uploadFileToStorage } from '../services/firebase';
import {
  generateArtifactDescription,
  generateArtifactDescriptionFromPDF,
} from '../services/gemini';
import ArtifactUpload from './ArtifactUpload';

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
const GRADE_LEVELS = ['9', '10', '11', '12'];
const SEMESTERS = ['S1', 'S2'];

const emptyArtifact = (): Artifact => ({
  title: '',
  type: 'pdf',
  url: '',
  aiDescription: '',
});

interface TeacherViewProps {
  user: User;
}

export default function TeacherView({ user }: TeacherViewProps) {
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('A');
  const [gradeLevel, setGradeLevel] = useState('9');
  const [semester, setSemester] = useState('S1');
  const [schoolYear, setSchoolYear] = useState('2025-2026');
  const [artifacts, setArtifacts] = useState<[Artifact, Artifact]>([
    emptyArtifact(),
    emptyArtifact(),
  ]);
  const [teacherComment, setTeacherComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<[boolean, boolean]>([false, false]);
  const [success, setSuccess] = useState(false);

  const updateArtifact = (index: 0 | 1, artifact: Artifact) => {
    const updated: [Artifact, Artifact] = [...artifacts] as [Artifact, Artifact];
    updated[index] = artifact;
    setArtifacts(updated);
  };

  const handleUploadPDF = async (file: File): Promise<string> => {
    const path = `artifacts/${user.uid}/${Date.now()}_${file.name}`;
    return uploadFileToStorage(file, path);
  };

  const handleGenerateAI = async (
    index: 0 | 1,
    artifact: Artifact,
    pdfFile?: File
  ) => {
    const loading: [boolean, boolean] = [...aiLoading] as [boolean, boolean];
    loading[index] = true;
    setAiLoading(loading);

    try {
      let description: string;
      if (artifact.type === 'pdf' && pdfFile) {
        description = await generateArtifactDescriptionFromPDF(
          studentName,
          artifact.title,
          pdfFile
        );
      } else {
        description = await generateArtifactDescription(
          studentName,
          artifact.title,
          artifact.url
        );
      }
      updateArtifact(index, { ...artifact, aiDescription: description });
    } catch (err) {
      console.error('AI generation failed:', err);
      updateArtifact(index, {
        ...artifact,
        aiDescription: `This artifact showcases ${studentName}'s work in "${artifact.title}".`,
      });
    } finally {
      const done: [boolean, boolean] = [...aiLoading] as [boolean, boolean];
      done[index] = false;
      setAiLoading(done);
    }
  };

  const handleSave = async () => {
    if (!studentName.trim() || !className.trim()) return;

    const validArtifacts = artifacts.filter(
      (a) => a.title.trim() && a.url.trim()
    );
    if (validArtifacts.length === 0) return;

    setSaving(true);
    try {
      await saveReportCard({
        teacherId: user.uid,
        studentName: studentName.trim(),
        grade,
        className: className.trim(),
        gradeLevel,
        semester,
        schoolYear,
        artifacts: validArtifacts,
        teacherComment: teacherComment.trim(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Reset form
      setStudentName('');
      setClassName('');
      setArtifacts([emptyArtifact(), emptyArtifact()]);
      setTeacherComment('');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="font-serif text-2xl text-sa-green font-bold mb-6">
        Create Report Card Comment
      </h1>

      <div className="space-y-5">
        {/* Student & Class info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-sa-slate-light uppercase tracking-wide mb-1">
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-sa-slate-light uppercase tracking-wide mb-1">
              Class Name
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Chemistry"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-sa-slate-light uppercase tracking-wide mb-1">
              Grade
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold bg-white"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-sa-slate-light uppercase tracking-wide mb-1">
              Grade Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold bg-white"
            >
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>{g}th</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-sa-slate-light uppercase tracking-wide mb-1">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold bg-white"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'S1' ? 'Semester 1' : 'Semester 2'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-sa-slate-light uppercase tracking-wide mb-1">
              School Year
            </label>
            <input
              type="text"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold"
            />
          </div>
        </div>

        {/* Artifacts */}
        {([0, 1] as const).map((i) => (
          <ArtifactUpload
            key={i}
            index={i}
            studentName={studentName}
            artifact={artifacts[i]}
            onChange={(a) => updateArtifact(i, a)}
            isGeneratingAI={aiLoading[i]}
            onUploadPDF={handleUploadPDF}
            onGenerateAI={(artifact, pdfFile) =>
              handleGenerateAI(i, artifact, pdfFile)
            }
          />
        ))}

        {/* Teacher Comment */}
        <div>
          <label className="block text-xs font-medium text-sa-slate-light uppercase tracking-wide mb-1">
            Teacher Comment (next steps / suggestions)
          </label>
          <textarea
            value={teacherComment}
            onChange={(e) => setTeacherComment(e.target.value)}
            placeholder="Consider exploring advanced topics in..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold resize-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !studentName.trim() || !className.trim()}
          className="w-full py-3 bg-sa-green text-white font-medium rounded-xl hover:bg-sa-green-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Report Card'}
        </button>

        {success && (
          <div className="text-center text-sm text-sa-green-light font-medium animate-fade-in">
            Report card saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
