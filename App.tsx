import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Github, Sun, Moon } from 'lucide-react';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import { MatrixProvider } from './context/MatrixContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun size={24} className="text-yellow-500" />
      ) : (
        <Moon size={24} className="text-blue-400" />
      )}
    </button>
  );
}

function AppContent() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-200">
        <ThemeToggle />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Eisenhower Matrix</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Built with{' '}
              <a 
                href="https://bolt.new" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                target="_blank" 
                rel="noopener noreferrer"
              >
                bolt.new
              </a>
            </p>
          </div>
          
          <MatrixProvider>
            <EisenhowerMatrix />
          </MatrixProvider>

          <footer className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
              <Github size={20} className="text-gray-700 dark:text-gray-300" />
              <a
                href="https://github.com/obedmhg/eisenhower"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
              >
                View on GitHub
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Want to contribute? Check out the{' '}
              <a
                href="https://github.com/obedmhg/eisenhower/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                issues
              </a>
              {' '}or submit a{' '}
              <a
                href="https://github.com/obedmhg/eisenhower/pulls"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                pull request
              </a>
            </p>
          </footer>
        </div>
      </div>
    </DndProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;