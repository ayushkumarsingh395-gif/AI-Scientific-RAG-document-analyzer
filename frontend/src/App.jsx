import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Signup from './components/Signup';
import { TopNav } from './components/TopNav';
import { SidebarHistory } from './components/SidebarHistory';
import { StatsGrid } from './components/StatsGrid';
import { QuickActions } from './components/QuickActions';
import { ChatConsole } from './components/ChatConsole';
import { DocumentViewer } from './components/DocumentViewer';
import { KnowledgeViz } from './components/KnowledgeViz';
import { UploadZone } from './components/UploadZone';
import { IndexedFilesList } from './components/IndexedFilesList';
import { SettingsModal } from './components/SettingsModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { UserProfile } from './components/UserProfile';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './context/ThemeContext';

function Dashboard() {
  const { darkMode, toggleTheme } = useTheme();
  const [previewFile, setPreviewFile] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [actionPrompt, setActionPrompt] = useState('');
  const [currentModel, setCurrentModel] = useState(localStorage.getItem('nexus_model') || 'openai/gpt-oss-120b');


  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search sessions"]');
        if (searchInput) searchInput.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  const handleUploadSuccess = (filename, targetSessionId) => {
    setPreviewFile(filename);
    if (targetSessionId && !currentSessionId) {
      setCurrentSessionId(targetSessionId);
    }
    setRefreshList(prev => prev + 1);
  };

  const handleTriggerAction = (prompt) => {
    setActionPrompt(prompt);
    setTimeout(() => setActionPrompt(''), 100);
  };

  const handleCitationClick = (citationDoc) => {
    setPreviewFile(citationDoc);
  };

  return (
    <div className={`h-screen ${darkMode ? 'bg-nexus-900 text-slate-200' : 'bg-white text-slate-900'} font-sans flex flex-col overflow-hidden`}>
      <TopNav 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onSearchClick={() => {
          const searchInput = document.querySelector('input[placeholder*="Search sessions"]');
          if (searchInput) searchInput.focus();
        }}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <SidebarHistory 
          onSelectChat={setCurrentSessionId} 
          currentSessionId={currentSessionId} 
        />
        
        <div className="flex-1 flex flex-col lg:flex-row p-3.5 gap-3.5 overflow-hidden">
          {/* Main Left Section: Stats, Actions, Chat Console */}
          <div className="flex flex-col flex-[1.7] gap-3.5 min-h-0">
            <div className="flex flex-col gap-2.5 shrink-0">
              <StatsGrid sessionId={currentSessionId} refreshTrigger={refreshList} />
              <QuickActions onTriggerAction={handleTriggerAction} />
            </div>
            <div className="flex-1 min-h-0 rounded-xl border border-nexus-500/60 bg-nexus-800/80 overflow-hidden flex flex-col shadow-lg">
              <ChatConsole 
                key={currentSessionId || 'default'} 
                sessionId={currentSessionId} 
                incomingPrompt={actionPrompt}
                onCitationClick={handleCitationClick}
                currentModel={currentModel}
              />
            </div>
          </div>

          {/* Right Section: Upload, Files, Viewer, Architecture Viz */}
          <div className="flex flex-col flex-1 gap-3.5 min-h-0">
            <div className="flex-1 flex flex-col gap-2.5 min-h-0">
              <UploadZone 
                sessionId={currentSessionId} 
                onUploadSuccess={handleUploadSuccess}
                onSessionCreated={(newId) => setCurrentSessionId(newId)}
              />
              <div className="flex flex-col flex-1 gap-2 min-h-0">
                <IndexedFilesList 
                  sessionId={currentSessionId} 
                  refreshTrigger={refreshList} 
                  onSelectFile={(f) => setPreviewFile(f)}
                />
                <div className="flex-1 min-h-[140px] bg-nexus-800/50 rounded-xl border border-nexus-500/40 overflow-hidden">
                  <DocumentViewer fileName={previewFile} sessionId={currentSessionId} />
                </div>
              </div>
            </div>
            <div className="h-[125px] shrink-0 rounded-xl border border-nexus-500/40 bg-nexus-800/50 overflow-hidden p-2.5">
              <KnowledgeViz />
            </div>
          </div>
        </div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentModel={currentModel}
        onModelChange={(model) => setCurrentModel(model)}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0E1C1D',
            color: '#FFFFFF',
            border: '1px solid #27484B',
            borderRadius: '12px',
            fontSize: '12px'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#0E1C1D'
            }
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#0E1C1D'
            }
          }
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;