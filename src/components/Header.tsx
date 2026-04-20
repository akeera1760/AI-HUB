import { Zap, User, LogOut, LogIn } from 'lucide-react';

interface HeaderProps {
  userEmail?: string;
  onSignOut?: () => void;
  onLoginClick?: () => void;
  showHero?: boolean;
}

export function Header({ userEmail, onSignOut, onLoginClick, showHero = true }: HeaderProps) {
  return (
    <div>
      <nav className="border-b border-violet-400/10 bg-[#120b22]/70 px-6 py-4 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 p-2 shadow-lg shadow-violet-950/30">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-xl font-bold text-violet-50">AI Hub</span>
          </div>
          <div className="flex items-center gap-6">
            {userEmail && (
              <div className="flex items-center gap-2 text-violet-200">
                <User className="w-5 h-5 text-violet-300" />
                <span className="text-sm truncate max-w-xs">{userEmail}</span>
              </div>
            )}
            {!userEmail && onLoginClick && (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 text-violet-300 hover:text-fuchsia-300 transition-colors font-medium"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 text-rose-300 hover:text-rose-200 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {showHero && (
        <header className="relative overflow-hidden pt-16 pb-12 px-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-8rem] top-[-4rem] h-72 w-72 rounded-full bg-violet-600/18 blur-3xl" />
            <div className="absolute right-[-5rem] top-2 h-80 w-80 rounded-full bg-fuchsia-500/14 blur-3xl" />
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Zap className="w-10 h-10 text-violet-300" />
              <h1 className="text-5xl font-bold">
                <span className="text-violet-100">AI </span>
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">Hub</span>
              </h1>
            </div>
            <p className="text-lg text-violet-200/90 leading-relaxed">
              Discover and access the most powerful AI models across all categories. From image generation to code completion, find the perfect AI tool for your needs.
            </p>
          </div>
        </header>
      )}
    </div>
  );
}
