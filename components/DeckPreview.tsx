
import React from 'react';
import { Slide } from '../types';

interface DeckPreviewProps {
  slide: Slide;
  style: string;
}

const DeckPreview: React.FC<DeckPreviewProps> = ({ slide, style }) => {
  const getThemeBase = () => {
    switch (style) {
      case 'corporate': return 'bg-[#F2F2F2] text-slate-900';
      case 'minimalist': return 'bg-white text-slate-900';
      case 'creative': return 'bg-slate-950 text-white';
      default: return 'bg-[#020617] text-white';
    }
  };

  const accentColor = style === 'corporate' ? 'bg-[#FF3B30]' : 'bg-emerald-500';
  const textColor = (style === 'corporate' || style === 'minimalist') ? 'text-slate-900' : 'text-white';
  const subTextColor = (style === 'corporate' || style === 'minimalist') ? 'text-slate-600' : 'text-slate-400';

  // Defensive helper to prevent React rendering errors if Gemini returns objects instead of strings
  const renderItem = (item: any): React.ReactNode => {
    if (typeof item === 'string' || typeof item === 'number') {
      return item;
    }
    if (item && typeof item === 'object') {
      // Handle the specific error case: {icon, title, description}
      if (item.description) return item.description;
      if (item.title) return item.title;
      if (item.value) return item.value;
      if (item.text) return item.text;
      // Fallback: try to stringify or show first value
      try {
        return JSON.stringify(item);
      } catch {
        return "[Object]";
      }
    }
    return "";
  };

  const renderLayout = () => {
    const content = slide.content || [];
    const stats = slide.stats || [];
    const tableData = slide.tableData || [];

    switch (slide.layout) {
      case 'web-hero':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full max-w-4xl mx-auto space-y-10">
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 border border-white/10 ${textColor}`}>Web Blueprint v1.0</span>
            <h1 className={`text-7xl font-black leading-tight ${textColor}`}>{slide.title}</h1>
            <p className={`text-2xl ${subTextColor}`}>{renderItem(content[0])}</p>
            <div className="flex gap-6 pt-4">
               <button className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs ${accentColor} text-white shadow-2xl`}>Get Started</button>
               <button className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/20 hover:bg-white/5 transition-all">View Demo</button>
            </div>
          </div>
        );

      case 'feature-grid':
        return (
          <div className="flex flex-col h-full gap-10">
            <h2 className={`text-5xl font-black uppercase ${textColor}`}>{slide.title}</h2>
            <div className="grid grid-cols-3 gap-6 flex-1">
              {content.map((c, i) => (
                <div key={i} className={`p-8 rounded-3xl border border-white/10 ${style === 'corporate' ? 'bg-white' : 'bg-slate-900/50'} flex flex-col gap-4 shadow-xl`}>
                   <div className={`w-12 h-12 rounded-2xl ${accentColor} flex items-center justify-center text-white`}>
                      <i className={`fas ${['fa-bolt', 'fa-shield-halved', 'fa-layer-group', 'fa-code', 'fa-gears', 'fa-globe'][i % 6]}`}></i>
                   </div>
                   <h4 className={`text-xl font-black ${textColor}`}>
                     {typeof c === 'object' && c !== null ? (c as any).title || `Feature ${i+1}` : `Feature ${i+1}`}
                   </h4>
                   <p className={`text-sm ${subTextColor}`}>{renderItem(c)}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'data-table':
        return (
          <div className="flex flex-col h-full gap-8">
            <h2 className={`text-4xl font-black uppercase ${textColor}`}>{slide.title}</h2>
            <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <table className="w-full h-full text-left border-collapse">
                <thead className="bg-white/5 uppercase text-[10px] font-black tracking-widest text-slate-500">
                  <tr>
                    {tableData[0]?.map((cell, i) => (
                      <th key={i} className="px-6 py-4 border-b border-white/10">{renderItem(cell)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`text-sm ${textColor}`}>
                  {tableData.slice(1).map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      {row.map((cell, j) => (
                        <td key={j} className="px-6 py-4 border-b border-white/5">{renderItem(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'market-tiers':
        return (
          <div className="flex flex-col h-full gap-10">
            <h2 className={`text-5xl font-black uppercase ${textColor}`}>{slide.title}</h2>
            <div className="grid grid-cols-5 gap-8 flex-1 items-end">
              <div className="col-span-2 space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-slate-400">Market Dynamics</h3>
                <ul className="space-y-4">
                  {content.map((c, i) => (
                    <li key={i} className="flex gap-3">
                      <span className={`w-1 h-8 ${accentColor}`}></span>
                      <p className={`text-sm leading-relaxed ${subTextColor}`}>{renderItem(c)}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-3 space-y-4">
                {stats.map((s, i) => (
                  <div key={i} className={`p-6 rounded-lg flex justify-between items-center transition-all ${
                    i === 0 ? 'bg-slate-200' : i === 1 ? 'bg-slate-700 text-white' : accentColor + ' text-white'
                  }`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">{renderItem(s.label)}</span>
                      <span className="text-3xl font-black">{renderItem(s.value)}</span>
                    </div>
                    {i === 2 && <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded">Target (5%)</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'business-model':
        return (
          <div className="flex flex-col h-full gap-8">
            <h2 className={`text-5xl font-black uppercase ${textColor}`}>{slide.title}</h2>
            <div className="grid grid-cols-3 gap-6 flex-1">
              {stats.map((s, i) => (
                <div key={i} className={`p-8 rounded-2xl border-2 flex flex-col justify-between ${
                  style === 'corporate' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/50'
                }`}>
                  <span className={`text-sm font-black uppercase tracking-widest ${subTextColor}`}>{renderItem(s.label)}</span>
                  <span className={`text-5xl font-black ${accentColor.replace('bg-', 'text-')}`}>{renderItem(s.value)}</span>
                </div>
              ))}
              <div className="col-span-3 h-20 bg-slate-900 rounded-xl flex items-center px-10 gap-20 overflow-hidden relative">
                 <div className="z-10 text-[10px] font-black uppercase text-slate-500">Revenue Breakdown</div>
                 <div className="flex-1 h-8 flex rounded-md overflow-hidden z-10">
                    <div className="bg-slate-700 w-[70%] flex items-center justify-center text-[10px] font-bold">Subscription (70%)</div>
                    <div className={`${accentColor} w-[30%] flex items-center justify-center text-[10px] font-bold`}>Services (30%)</div>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'team-grid':
        return (
          <div className="flex flex-col h-full gap-10">
            <h2 className={`text-5xl font-black uppercase ${textColor}`}>{slide.title}</h2>
            <div className="grid grid-cols-4 gap-6 flex-1">
              {[0, 1, 2, 3].map((_, i) => (
                <div key={i} className={`p-6 rounded-2xl flex flex-col items-center text-center gap-4 ${
                  style === 'corporate' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900 border border-slate-800'
                }`}>
                  <div className="w-24 h-24 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden grayscale">
                     <i className={`fas ${['fa-user-tie', 'fa-code', 'fa-chart-line', 'fa-calculator'][i]} text-4xl text-slate-500`}></i>
                  </div>
                  <div>
                    <h4 className={`font-black text-lg ${textColor}`}>{renderItem(content[i]) || 'Leadership'}</h4>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${accentColor.replace('bg-', 'text-')}`}>Founder & CEO</p>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${subTextColor}`}>Industry veteran with proven track record in strategic growth.</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'big-text':
        return (
          <div className="grid grid-cols-2 h-full -m-16 overflow-hidden">
            <div className="p-16 flex flex-col justify-center space-y-8 bg-transparent">
               <div className={`w-16 h-1.5 ${accentColor}`}></div>
               <h1 className={`text-7xl font-black leading-none ${textColor}`}>{slide.title}</h1>
               <p className={`text-2xl font-medium ${subTextColor}`}>{slide.subtitle || renderItem(content[0])}</p>
            </div>
            {style === 'corporate' ? (
              <div className={`${accentColor} p-16 flex flex-col justify-end text-white text-right`}>
                 <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">Confidential - 2025 Series A</p>
                 <h3 className="text-4xl font-black mt-4">Investment Opportunity</h3>
              </div>
            ) : (
              <div className="bg-slate-900/50 flex items-center justify-center p-20 text-center italic opacity-30 text-xl">
                 [High Fidelity Render: {slide.visualPrompt}]
              </div>
            )}
          </div>
        );

      case 'pitch-stats':
        return (
           <div className="flex flex-col h-full gap-8">
              <h3 className={`text-sm font-black uppercase tracking-[0.4em] ${accentColor.replace('bg-', 'text-')}`}>The Problem</h3>
              <h2 className={`text-5xl font-black ${textColor}`}>{slide.title}</h2>
              <div className="grid grid-cols-3 gap-8 flex-1">
                 {stats.map((s, i) => (
                   <div key={i} className="flex flex-col gap-4">
                      <div className={`h-1 ${accentColor}`}></div>
                      <h4 className={`text-2xl font-black ${textColor}`}>{renderItem(s.label)}</h4>
                      <div className={`text-5xl font-black ${accentColor.replace('bg-', 'text-')}`}>{renderItem(s.value)}</div>
                      <p className={`text-sm leading-relaxed ${subTextColor}`}>{renderItem(content[i]) || 'Operational inefficiencies costing enterprise users millions.'}</p>
                   </div>
                 ))}
              </div>
              <div className="bg-slate-900 text-white p-5 rounded-lg flex justify-between items-center mt-auto">
                 <span className="text-xs uppercase font-bold tracking-widest opacity-60">Global Market Impact</span>
                 <span className="text-xl font-black">$15 Billion Problem</span>
              </div>
           </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 h-full">
            <h2 className={`text-5xl font-black mb-10 ${textColor}`}>{slide.title}</h2>
            <ul className="space-y-6">
              {content.map((c, i) => (
                <li key={i} className={`text-2xl flex gap-4 ${subTextColor}`}>
                  <span className={`w-8 h-8 rounded-lg ${accentColor} flex items-center justify-center text-xs text-white font-black shrink-0`}>{i+1}</span>
                  {renderItem(c)}
                </li>
              ))}
            </ul>
          </div>
        );
    }
  };

  return (
    <div className={`w-full aspect-video rounded-[2.5rem] shadow-3xl overflow-hidden relative flex flex-col p-16 border border-white/5 ${getThemeBase()}`}>
      {renderLayout()}
      <div className="absolute bottom-6 left-16 right-16 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] opacity-30">
        <span>STRATEGIST BLUEPRINT // 2025</span>
        <div className="flex items-center gap-3">
           <span className="w-10 h-px bg-slate-400"></span>
           <span>SLIDE {slide.id?.split('-').pop() || '01'}</span>
        </div>
      </div>
    </div>
  );
};

export default DeckPreview;
