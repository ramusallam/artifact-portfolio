import { useState, useRef } from 'react';
import type { Artifact } from '../services/firestore';

interface ArtifactUploadProps {
  index: number;
  studentName: string;
  artifact: Artifact;
  onChange: (artifact: Artifact) => void;
  isGeneratingAI: boolean;
  onUploadPDF: (file: File) => Promise<string>;
  onGenerateAI: (artifact: Artifact, pdfFile?: File) => void;
}

export default function ArtifactUpload({
  index,
  studentName,
  artifact,
  onChange,
  isGeneratingAI,
  onUploadPDF,
  onGenerateAI,
}: ArtifactUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setUploading(true);
    setPdfFile(file);
    try {
      const url = await onUploadPDF(file);
      onChange({ ...artifact, url, type: 'pdf' });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const toggleType = () => {
    const newType = artifact.type === 'pdf' ? 'link' : 'pdf';
    onChange({ ...artifact, type: newType, url: '' });
    setPdfFile(null);
  };

  const canGenerate =
    artifact.title.trim() &&
    artifact.url.trim() &&
    studentName.trim() &&
    !isGeneratingAI;

  return (
    <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sa-green text-sm">
          Artifact {index + 1}
        </h3>
        <button
          type="button"
          onClick={toggleType}
          className="text-xs font-medium px-3 py-1 rounded-full border border-stone-300 text-sa-slate hover:bg-white transition-colors"
        >
          {artifact.type === 'pdf' ? 'Switch to Link' : 'Switch to PDF'}
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Artifact title"
          value={artifact.title}
          onChange={(e) => onChange({ ...artifact, title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold"
        />

        {artifact.type === 'pdf' ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {artifact.url ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 border-2 border-sa-green/30 bg-sa-green/5 rounded-lg py-3 px-4 cursor-pointer hover:border-sa-gold transition-colors"
              >
                <svg className="w-6 h-6 text-sa-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sa-green truncate">
                    {pdfFile?.name || 'PDF uploaded'}
                  </p>
                  <p className="text-xs text-sa-slate-light">Click to replace</p>
                </div>
                <svg className="w-5 h-5 text-sa-rust flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-stone-300 rounded-lg py-4 text-sm text-sa-slate hover:border-sa-gold hover:bg-sa-gold/5 transition-colors"
              >
                {uploading ? 'Uploading...' : 'Click to upload PDF'}
              </button>
            )}
          </div>
        ) : (
          <input
            type="url"
            placeholder="https://..."
            value={artifact.url}
            onChange={(e) => onChange({ ...artifact, url: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold"
          />
        )}

        <div className="flex gap-2">
          <textarea
            placeholder="AI-generated description will appear here..."
            value={artifact.aiDescription}
            onChange={(e) =>
              onChange({ ...artifact, aiDescription: e.target.value })
            }
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold resize-none"
          />
          <button
            type="button"
            onClick={() => onGenerateAI(artifact, pdfFile ?? undefined)}
            disabled={!canGenerate}
            className="self-end px-3 py-2 bg-sa-gold text-white text-xs font-medium rounded-lg hover:bg-sa-gold/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isGeneratingAI ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Generating
              </span>
            ) : (
              'Generate AI'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
