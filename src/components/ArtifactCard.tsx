interface ArtifactCardProps {
  title: string;
  description: string;
  type: 'pdf' | 'link';
  url: string;
  teacherComment?: string;
  showTeacherComment?: boolean;
}

export default function ArtifactCard({
  title,
  description,
  type,
  url,
  teacherComment,
  showTeacherComment = false,
}: ArtifactCardProps) {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl border border-stone-200 p-5 cursor-pointer card-hover animate-scale-in"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {type === 'pdf' ? (
            <svg className="w-5 h-5 text-sa-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-sa-green-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sa-green text-base mb-1">{title}</h3>
          <p className="text-sa-slate text-sm leading-relaxed">{description}</p>
          {showTeacherComment && teacherComment && (
            <p className="mt-3 text-sm text-sa-rust italic border-t border-stone-100 pt-3">
              {teacherComment}
            </p>
          )}
        </div>
        <svg className="w-4 h-4 text-stone-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </div>
  );
}
