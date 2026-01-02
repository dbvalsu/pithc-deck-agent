
import React, { useState } from 'react';
import { AppTab } from './types';
import DeckStudio from './components/DeckStudio';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DECKS);

  const handleGithubSave = () => {
    alert("Establishing Github Tunnel... Codebase snapshot being committed to repository.");
  };

  const handleDeployment = () => {
    alert("Initializing Cloud Infrastructure... Vision is being deployed to edge networks.");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Project access link copied to clipboard.");
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DECKS:
        return <DeckStudio />;
      case AppTab.ASSETS:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-y-auto p-4">
            <ImageEditor />
            <VideoGenerator />
          </div>
        );
      default:
        return <DeckStudio />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <header className="h-14 bg-slate-950/50 backdrop-blur-md border-b border-slate-900 flex items-center justify-between px-6 shrink-0 z-[1000]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
              <i className="fas fa-cube text-white text-[10px]"></i>
            </div>
            <h1 className="text-sm font-black tracking-tighter text-white uppercase">
              Manus <span className="text-emerald-500">AI</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-6">
            {[
              { id: AppTab.DECKS, label: 'Strategist' },
              { id: AppTab.ASSETS, label: 'Asset Forge' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all relative py-4 ${
                  activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleGithubSave} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all" title="Push to Github"><i className="fab fa-github"></i></button>
          <button onClick={handleDeployment} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all" title="Deploy to Vercel"><i className="fas fa-rocket"></i></button>
          <button onClick={handleShare} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all" title="Share Project"><i className="fas fa-share-alt"></i></button>
          <div className="h-6 w-px bg-slate-800 mx-2"></div>
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Unsaved</span>
             <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/10"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-hidden relative">
        {renderContent()}
      </main>

      <footer className="h-8 bg-slate-950 border-t border-slate-900 flex items-center justify-between px-6 shrink-0 z-[1000]">
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1.5 text-[8px] uppercase font-black text-slate-600 tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Gemini-3-Pro Online
          </span>
          <span className="text-[8px] uppercase font-black text-slate-700 tracking-widest">Latency: 24ms</span>
        </div>
        <div className="flex gap-4">
           <button className="text-[8px] uppercase font-black text-slate-600 hover:text-slate-400 tracking-widest">Documentation</button>
           <button className="text-[8px] uppercase font-black text-slate-600 hover:text-slate-400 tracking-widest">Support</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
