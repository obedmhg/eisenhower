import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Github, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import Header from './components/Header';
import SavedMatrices from './components/SavedMatrices';
import { MatrixProvider } from './context/MatrixContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Eisenhower Matrix</h1>
          </div>

          <main>
            <EisenhowerMatrix />
          </main>

          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={`fixed top-24 z-40 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-r-md shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ${
              sidebarOpen ? 'left-80' : 'left-0'
            }`}
            aria-label={sidebarOpen ? 'Close saved matrices' : 'Open saved matrices'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            {!sidebarOpen && <span className="text-sm font-medium hidden sm:inline">Saved</span>}
          </button>

          <aside
            className={`fixed top-0 left-0 h-full w-80 bg-gray-50 dark:bg-gray-900 shadow-2xl border-r border-gray-200 dark:border-gray-700 z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto pt-20 px-4 pb-6 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            aria-hidden={!sidebarOpen}
          >
            <SavedMatrices variant="sidebar" />
          </aside>

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
      <AuthProvider>
        <MatrixProvider>
          <AppContent />
        </MatrixProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
