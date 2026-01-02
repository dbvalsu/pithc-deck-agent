
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeminiService } from '../services/geminiService';
import { Deck, ChatMessage, Slide } from '../types';
import DeckPreview from './DeckPreview';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';

const DeckStudio: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [chatWidth, setChatWidth] = useState(450);
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    if (newWidth > 320 && newWidth < rect.width - 400) {
      setChatWidth(newWidth);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const isCreateRequest = /generate|create|make|deck|slide|pitch|presentation|blueprint|code|mvp|app|website/i.test(input);
      if (isCreateRequest) {
        setMessages(prev => [...prev, { role: 'model', text: "🏗️ Manus Prime is architecting your vision... synthesizing strategic assets and technical blueprints." }]);
        const result = await GeminiService.generateDeck(input, messages);
        setDeck(result);
        setCurrentSlideIndex(0);
        
        if (result.code) {
          setViewMode('code');
          setMessages(prev => [...prev, { role: 'model', text: `✨ Vision materialized. I've architected a ${result.slides.length}-slide roadmap and a technical MVP. Access the source code in the logic tab.` }]);
        } else {
          setViewMode('preview');
          setMessages(prev => [...prev, { role: 'model', text: `✨ Artifact materialized. Review the strategic design in the preview pane.` }]);
        }
      } else {
        const responseText = await GeminiService.chatWithAgent(input, messages);
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Structural error in reasoning. Please retry." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: 'pdf' | 'pptx' | 'json') => {
    if (!deck) return;
    setIsExporting(true);
    setTimeout(() => {
      try {
        if (type === 'pdf') {
          const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] });
          deck.slides.forEach((s, i) => {
            if (i > 0) doc.addPage();
            doc.setFillColor(15, 23, 42); doc.rect(0, 0, 1280, 720, 'F');
            doc.setTextColor('#ffffff'); doc.setFontSize(40); doc.text(s.title || 'Slide', 60, 100);
            doc.setFontSize(18); (s.content || []).forEach((p, pi) => doc.text(`• ${p}`, 80, 200 + pi * 30));
          });
          doc.save(`${deck.id || 'presentation'}.pdf`);
        } else if (type === 'pptx') {
          const pres = new pptxgen();
          deck.slides.forEach(s => {
            const slide = pres.addSlide();
            slide.background = { color: '0F172A' };
            slide.addText(s.title || 'Slide', { x: 0.5, y: 0.5, fontSize: 36, color: 'FFFFFF', bold: true });
            const bulletContent = (s.content || []).map(p => ({ text: p, options: { bullet: true } }));
            if (bulletContent.length > 0) {
              slide.addText(bulletContent, { x: 0.7, y: 1.5, fontSize: 18, color: 'FFFFFF' });
            }
          });
          pres.writeFile({ fileName: `${deck.id || 'presentation'}.pptx` });
        }
      } finally {
        setIsExporting(false);
      }
    }, 1500);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div ref={containerRef} className="flex h-full w-full bg-[#050810] overflow-hidden relative border border-slate-900 rounded-[2.5rem] shadow-3xl">
      {/* LEFT PANEL */}
      <div 
        style={{ width: deck ? chatWidth : '100%' }}
        className="flex flex-col bg-slate-950/40 border-r border-slate-900/50 backdrop-blur-xl shrink-0 transition-[width] duration-500 ease-in-out"
      >
        <div className="p-6 border-b border-slate-800/60 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <i className="fas fa-robot text-emerald-500 text-sm"></i>
             </div>
             <div>
               <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Lead Strategist</h3>
               <span className="text-[8px] font-bold text-slate-500 uppercase">Manus AI Core</span>
             </div>
          </div>
          <button className="text-slate-600 hover:text-white transition-colors"><i className="fas fa-history"></i></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-12">
               <div className="w-24 h-24 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-center mb-8 shadow-inner">
                  <i className="fas fa-wand-magic-sparkles text-4xl text-emerald-500"></i>
               </div>
               <h4 className="text-2xl font-black text-white mb-4">Prime Suite</h4>
               <p className="text-sm text-slate-400 leading-relaxed">Describe your vision. I will architect the strategy, design the artifacts, and engineer the code.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3`}>
               <div className={`max-w-[85%] px-6 py-4 rounded-3xl text-sm leading-relaxed ${
                 m.role === 'user' 
                   ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg' 
                   : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
               }`}>
                 {m.text}
               </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-3xl flex gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-900/40 border-t border-slate-800/40">
           <div className="relative">
             <textarea 
               className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 pr-16 focus:ring-1 focus:ring-emerald-500/40 outline-none text-white text-sm resize-none shadow-inner transition-all placeholder:text-slate-700"
               placeholder="Enter strategic command..."
               rows={2}
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
             />
             <button 
               onClick={handleSend}
               disabled={loading || !input.trim()}
               className="absolute right-4 bottom-5 w-10 h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center shadow-lg transition-all"
             >
               <i className="fas fa-paper-plane text-xs"></i>
             </button>
           </div>
        </div>
      </div>

      {/* DRAG DIVIDER */}
      {deck && (
        <div 
          onMouseDown={startResizing}
          className="w-1.5 bg-slate-950 hover:bg-emerald-500/50 cursor-col-resize flex-none group transition-colors relative"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-slate-800 group-hover:bg-emerald-400/50"></div>
        </div>
      )}

      {/* RIGHT PANEL */}
      {deck && (
        <div className="flex-1 flex flex-col bg-[#02050A] animate-in slide-in-from-right duration-700">
           <div className="h-16 flex items-center justify-between px-8 bg-slate-900/20 border-b border-slate-800/60">
              <div className="flex items-center gap-6">
                 <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
                    <button onClick={() => setViewMode('preview')} className={`px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'preview' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Preview</button>
                    <button onClick={() => setViewMode('code')} className={`px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'code' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Code</button>
                 </div>
                 <button onClick={toggleFullscreen} className="text-xs text-slate-500 hover:text-white uppercase font-black tracking-widest flex items-center gap-2">
                    <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-[10px]`}></i>
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                 </button>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="group relative">
                    <button className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-800 transition-all">
                      <i className="fas fa-download"></i> Export
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl invisible group-hover:visible z-50">
                       <button onClick={() => handleExport('pdf')} className="w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-emerald-500 hover:text-slate-950 transition-all">PDF Document</button>
                       <button onClick={() => handleExport('pptx')} className="w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-emerald-500 hover:text-slate-950 transition-all">PowerPoint (PPTX)</button>
                       <button onClick={() => handleExport('json')} className="w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-emerald-500 hover:text-slate-950 transition-all">Manifest (JSON)</button>
                    </div>
                 </div>
                 <button className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                   <i className="fas fa-play text-[8px]"></i> Present
                 </button>
              </div>
           </div>

           <div className="flex-1 flex overflow-hidden">
              <div className="w-60 bg-slate-950 border-r border-slate-900 p-5 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
                 {(deck.slides || []).map((s, idx) => (
                   <button 
                     key={s.id || idx} 
                     onClick={() => {
                       setCurrentSlideIndex(idx);
                       setViewMode('preview');
                     }}
                     className={`group relative aspect-video rounded-2xl border-2 transition-all p-1 overflow-hidden ${currentSlideIndex === idx && viewMode === 'preview' ? 'border-emerald-500' : 'border-slate-800 hover:border-slate-700'}`}
                   >
                     <div className="absolute top-2 left-2 z-10 w-5 h-5 bg-black/60 backdrop-blur rounded-lg flex items-center justify-center text-[9px] font-black text-white">{idx+1}</div>
                     <span className="text-[8px] font-bold text-slate-500 uppercase px-4 line-clamp-2">{s.title || 'Slide'}</span>
                   </button>
                 ))}
                 {deck.code && (
                   <button 
                     onClick={() => setViewMode('code')}
                     className={`group relative aspect-video rounded-2xl border-2 transition-all p-1 overflow-hidden flex flex-col items-center justify-center gap-2 ${viewMode === 'code' ? 'border-emerald-500' : 'border-slate-800 hover:border-slate-700'}`}
                   >
                     <i className="fas fa-code text-slate-500"></i>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Source Blueprint</span>
                   </button>
                 )}
              </div>

              <div className="flex-1 overflow-hidden relative flex flex-col p-12 items-center justify-center bg-[#050810]">
                 {viewMode === 'preview' ? (
                   <div className="w-full max-w-6xl animate-in zoom-in-95 duration-500">
                      {deck.slides && deck.slides[currentSlideIndex] && (
                        <DeckPreview slide={deck.slides[currentSlideIndex]} style={deck.style} />
                      )}
                      <div className="mt-12 flex items-center gap-10 bg-slate-900/80 backdrop-blur-3xl px-10 py-4 rounded-[2.5rem] border border-white/5 shadow-3xl mx-auto w-max">
                         <button onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} disabled={currentSlideIndex === 0} className="text-slate-500 hover:text-emerald-400 transition-all"><i className="fas fa-chevron-left text-xl"></i></button>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Slide {currentSlideIndex + 1} // {(deck.slides || []).length}</div>
                         <button onClick={() => setCurrentSlideIndex(Math.min((deck.slides || []).length - 1, currentSlideIndex + 1))} disabled={currentSlideIndex === (deck.slides || []).length - 1} className="text-slate-500 hover:text-emerald-400 transition-all"><i className="fas fa-chevron-right text-xl"></i></button>
                      </div>
                   </div>
                 ) : (
                   <div className="h-full w-full flex flex-col bg-[#010409] rounded-3xl overflow-hidden border border-slate-900 shadow-2xl">
                      <div className="px-8 py-4 bg-slate-950 border-b border-slate-900 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">vision.manifest.source</span>
                         </div>
                         <button 
                            onClick={() => navigator.clipboard.writeText(deck.code || JSON.stringify(deck, null, 2))}
                            className="text-[10px] font-black text-emerald-500 hover:text-white transition-all uppercase tracking-widest"
                         >
                            Copy to Clipboard
                         </button>
                      </div>
                      <div className="flex-1 p-10 overflow-y-auto font-mono text-xs text-emerald-500/80 scrollbar-hide">
                         <pre className="whitespace-pre-wrap">{deck.code || JSON.stringify(deck, null, 2)}</pre>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {isExporting && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center animate-in fade-in">
           <div className="w-24 h-24 border-t-2 border-emerald-500 rounded-full animate-spin mb-8"></div>
           <h4 className="text-3xl font-black text-white uppercase tracking-[0.5em] animate-pulse text-center">Architecting Manifest</h4>
        </div>
      )}
    </div>
  );
};

export default DeckStudio;
