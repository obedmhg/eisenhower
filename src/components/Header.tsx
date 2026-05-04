import React, { useState } from 'react';
import { Sun, Moon, UserPlus, LogIn, LogOut, User as UserIcon, Cloud } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMatrix } from '../context/MatrixContext';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const { syncing, syncError } = useMatrix();
  const [authModal, setAuthModal] = useState<'signup' | 'login' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 dark:text-gray-100">Eisenhower</span>
          {user && syncing && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Cloud size={14} className="animate-pulse" /> syncing
            </span>
          )}
          {user && syncError && (
            <span className="text-xs text-red-600 dark:text-red-400" title={syncError}>
              sync failed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!loading && !user && (
            <>
              <button
                onClick={() => setAuthModal('login')}
                className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogIn size={16} /> Log in
              </button>
              <button
                onClick={() => setAuthModal('signup')}
                className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                <UserPlus size={16} /> Create user
              </button>
            </>
          )}

          {!loading && user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserIcon size={16} />
                <span className="max-w-[160px] truncate">{user.email}</span>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 z-20">
                    <button
                      onClick={async () => {
                        setMenuOpen(false);
                        await logout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-blue-400" />
            )}
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={authModal !== null}
        mode={authModal || 'login'}
        onClose={() => setAuthModal(null)}
      />
    </header>
  );
};

export default Header;
