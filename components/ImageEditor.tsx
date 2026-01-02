
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOriginalImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt) return;
    setLoading(true);
    try {
      // Fixed: Property 'editImage' now exists on GeminiService
      const result = await GeminiService.editImage(originalImage, prompt);
      setEditedImage(result);
    } catch (err) {
      console.error(err);
      alert("Failed to edit image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-image text-blue-400"></i>
          AI Image Editor
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-4 bg-slate-900/50 min-h-[200px]">
            {originalImage ? (
              <img src={originalImage} className="max-h-64 rounded-lg" alt="Original" />
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <i className="fas fa-cloud-upload-alt text-4xl text-slate-500"></i>
                <span className="text-slate-400">Upload Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
            {originalImage && (
               <button onClick={() => setOriginalImage(null)} className="mt-2 text-red-400 text-sm hover:underline">Remove</button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-4 bg-slate-900/50 min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                 <span className="text-slate-400 animate-pulse">Applying edits...</span>
              </div>
            ) : editedImage ? (
              <img src={editedImage} className="max-h-64 rounded-lg" alt="Edited" />
            ) : (
              <span className="text-slate-500 italic">Edited result will appear here</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Add a retro filter, remove the background..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleEdit}
            disabled={loading || !originalImage || !prompt}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
            Apply Magic
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
