
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Deck, Slide } from '../types';

const SlideGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [presentation, setPresentation] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      // Fixed: property 'generateSlides' does not exist on type 'typeof GeminiService'.
      const data = await GeminiService.generateDeck(topic);
      setPresentation(data);
      setCurrentSlideIndex(0);
    } catch (err) {
      console.error(err);
      alert("Failed to generate slides.");
    } finally {
      setLoading(false);
    }
  };

  const currentSlide: Slide | null = presentation?.slides[currentSlideIndex] || null;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-magic text-purple-400"></i>
          AI Presentation Generator
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            placeholder="e.g. The History of Space Exploration..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-bolt"></i>}
            Generate
          </button>
        </div>
      </div>

      {presentation && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
             <button 
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
             >
               <i className="fas fa-chevron-left mr-2"></i> Previous
             </button>
             <span className="font-medium text-slate-400">
               Slide {currentSlideIndex + 1} of {presentation.slides.length}
             </span>
             <button 
              onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === presentation.slides.length - 1}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
             >
               Next <i className="fas fa-chevron-right ml-2"></i>
             </button>
          </div>

          <div className="aspect-video bg-white text-slate-900 rounded-2xl shadow-2xl p-12 relative overflow-hidden flex flex-col justify-center border-8 border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full -ml-32 -mb-32 blur-3xl opacity-50"></div>
            
            <h1 className="text-4xl font-extrabold mb-8 text-slate-800 border-l-4 border-purple-600 pl-4">
              {currentSlide?.title}
            </h1>
            <ul className="space-y-4">
              {currentSlide?.content.map((point, i) => (
                <li key={i} className="text-xl flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="absolute bottom-6 right-8 text-slate-400 text-sm italic">
              AI Generated Visualization: {currentSlide?.visualPrompt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideGenerator;
