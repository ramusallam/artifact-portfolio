interface LoginScreenProps {
  onSignIn: () => void;
}

export default function LoginScreen({ onSignIn }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-sa-green mx-auto mb-6 flex items-center justify-center">
          <span className="text-white text-2xl font-bold font-serif">SA</span>
        </div>
        <h1 className="font-serif text-3xl text-sa-green font-bold mb-2">
          Sonoma Academy
        </h1>
        <p className="text-sa-slate mb-8 text-lg">
          Artifact Portfolio System
        </p>
        <button
          onClick={onSignIn}
          className="bg-sa-green text-white px-8 py-3 rounded-xl font-medium text-base hover:bg-sa-green-light transition-colors shadow-lg shadow-sa-green/20"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
