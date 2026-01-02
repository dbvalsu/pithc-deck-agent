
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';

// Removed manual Window extension to avoid conflicts with global AIStudio type.
// We'll use casting in the component to access these properties safely.

const VideoGenerator: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  useEffect(() => {
    const checkKey = async () => {
      // Cast window to any to access aistudio without type collision with pre-configured ambient types.
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setNeedsApiKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // Cast window to any to access aistudio without type collision with pre-configured ambient types.
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume success after triggering selection to avoid race condition as per guidelines.
      setNeedsApiKey(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnimate = async () => {
    if (!image) return;
    setLoading(true);
    setLoadingStatus('Initializing Veo engine...');
    try {
      const statusUpdates = [
        "Analyzing image composition...",
        "Simulating motion vectors...",
        "Rendering high-quality frames...",
        "Stitching video segments...",
        "Finalizing cinematic polish..."
      ];
      
      let statusIndex = 0;
      const interval = setInterval(() => {
        if (statusIndex < statusUpdates.length) {
          setLoadingStatus(statusUpdates[statusIndex++]);
        }
      }, 8000);

      // Fixed: generateVideo now exists on GeminiService
      const url = await GeminiService.generateVideo(image, prompt, aspectRatio);
      setVideoUrl(url);
      clearInterval(interval);
    } catch (err: any) {
      console.error(err);
      // Handle "Requested entity was not found" error by prompting for key re-selection
      if (err.message?.includes("Requested entity was not found")) {
        setNeedsApiKey(true);
        alert("API Key issue detected. Please re-select your paid GCP API Key.");
      } else {
        alert("Failed to animate image.");
      }
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  if (needsApiKey) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-800 rounded-3xl border border-slate-700 max-w-2xl mx-auto shadow-2xl">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-key text-amber-500 text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">Video Generation requires a Paid API Key</h2>
        <p className="text-slate-400 text-center mb-8">
          To use Veo video generation models, you must select a billing-enabled API key from a paid GCP project.
          See the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">billing documentation</a> for more info.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          Setup API Key
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-film text-orange-400"></i>
          Animate with Veo 3.1
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 bg-slate-900/50 min-h-[300px] flex items-center justify-center relative">
              {image ? (
                <img src={image} className="max-h-72 rounded-lg" alt="Source" />
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <i className="fas fa-camera text-4xl text-slate-500"></i>
                  <span className="text-slate-400">Upload Base Image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
            
            <div className="flex gap-4">
               <button 
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 py-2 rounded-lg font-medium border-2 transition-all ${aspectRatio === '16:9' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-slate-700 hover:border-slate-600'}`}
               >
                 16:9 Landscape
               </button>
               <button 
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 py-2 rounded-lg font-medium border-2 transition-all ${aspectRatio === '9:16' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-slate-700 hover:border-slate-600'}`}
               >
                 9:16 Portrait
               </button>
            </div>
          </div>

          <div className="border-2 border-slate-600 rounded-xl p-4 bg-slate-900/50 min-h-[300px] flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-6">
                 <div className="relative">
                   <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-orange-500"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <i className="fas fa-video text-orange-400 animate-pulse"></i>
                   </div>
                 </div>
                 <div className="text-center">
                    <p className="text-orange-400 font-bold mb-1">Generating Cinematic Magic</p>
                    <p className="text-slate-500 text-sm">{loadingStatus}</p>
                 </div>
              </div>
            ) : videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="max-h-72 rounded-lg shadow-2xl"
              />
            ) : (
              <span className="text-slate-500 italic text-center px-8">
                Your animated video will appear here. This process usually takes 2-3 minutes.
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
            placeholder="Describe the animation (e.g. dramatic camera sweep, wind blowing hair)..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleAnimate}
            disabled={loading || !image}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 px-8 py-2 rounded-lg font-bold transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-play"></i>}
            Create Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
