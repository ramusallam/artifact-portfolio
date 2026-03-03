import { useState } from 'react';

interface GenerateLinkModalProps {
  mode: 'generate';
  shareUrl: string;
  password: string;
  onClose: () => void;
}

interface EnterPasswordModalProps {
  mode: 'enter';
  onSubmit: (password: string) => void;
  onClose: () => void;
  error?: string;
}

type PasswordModalProps = GenerateLinkModalProps | EnterPasswordModalProps;

export default function PasswordModal(props: PasswordModalProps) {
  const [inputPassword, setInputPassword] = useState('');
  const [copied, setCopied] = useState<'url' | 'password' | null>(null);

  const copyToClipboard = async (text: string, type: 'url' | 'password') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in">
        {props.mode === 'generate' ? (
          <>
            <h2 className="font-serif text-xl text-sa-green font-bold mb-4">
              Private Portfolio Link
            </h2>
            <p className="text-sm text-sa-slate mb-5">
              Share this link and password with colleges or recommendation writers.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-sa-slate-light uppercase tracking-wide">
                  Link
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    readOnly
                    value={props.shareUrl}
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm bg-stone-50"
                  />
                  <button
                    onClick={() => copyToClipboard(props.shareUrl, 'url')}
                    className="px-3 py-2 bg-sa-green text-white text-xs rounded-lg hover:bg-sa-green-light transition-colors"
                  >
                    {copied === 'url' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-sa-slate-light uppercase tracking-wide">
                  Password
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    readOnly
                    value={props.password}
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm bg-stone-50 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(props.password, 'password')}
                    className="px-3 py-2 bg-sa-green text-white text-xs rounded-lg hover:bg-sa-green-light transition-colors"
                  >
                    {copied === 'password' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={props.onClose}
              className="mt-6 w-full py-2 text-sm text-sa-slate border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="font-serif text-xl text-sa-green font-bold mb-4">
              Enter Password
            </h2>
            <p className="text-sm text-sa-slate mb-5">
              This portfolio is password protected.
            </p>

            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') props.onSubmit(inputPassword);
              }}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold mb-2"
            />
            {props.error && (
              <p className="text-sm text-red-500 mb-2">{props.error}</p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={props.onClose}
                className="flex-1 py-2 text-sm text-sa-slate border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => props.onSubmit(inputPassword)}
                className="flex-1 py-2 text-sm bg-sa-green text-white rounded-lg hover:bg-sa-green-light transition-colors"
              >
                Access Portfolio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
