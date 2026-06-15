
import React, { useState, useEffect, useRef } from 'react';
import { VideoRequest, DifficultyLevel, TargetDuration, SyllabusData } from '../types';

interface NetflixHeroProps {
  onGenerate: (request: VideoRequest) => void;
  onGenerateComic: (topic: string, series: string, character: string, context?: any) => void;
  onUploadSyllabus: (file: File) => Promise<void>;
  isGenerating: boolean;
  progressMessage?: string;
  syllabus?: SyllabusData | null;
}

const PRESETS = [
  { topic: 'Derivatives', series: 'Money Heist', character: 'The Professor', label: 'Derivatives x Money Heist', color: 'from-red-900 to-red-600' },
  { topic: 'Supply & Demand', series: 'Shark Tank', character: 'Kevin O\'Leary', label: 'Economics x Shark Tank', color: 'from-blue-900 to-cyan-600' },
  { topic: 'The Big Bang', series: 'Friends', character: 'Ross Geller', label: 'Big Bang x Friends', color: 'from-purple-900 to-pink-600' },
  { topic: 'Organic Chemistry', series: 'Breaking Bad', character: 'Walter White', label: 'Chemistry x Breaking Bad', color: 'from-green-900 to-emerald-600' },
];

const LOADING_TIPS = [
  "Tip: Explain a concept to a 5-year-old to test your true understanding.",
  "Fact: Honey never spoils. Edible honey has been found in ancient Egyptian tombs.",
  "Mnemonic: 'PEMDAS' helps remember the order of operations in math.",
  "Fact: Venus is the only planet in our solar system that spins clockwise.",
  "Tip: The Pomodoro technique suggests 25 minutes of focus followed by a 5-minute break.",
];

const NetflixHero: React.FC<NetflixHeroProps> = ({ 
  onGenerate, 
  onGenerateComic, 
  onUploadSyllabus, 
  isGenerating, 
  progressMessage,
  syllabus 
}) => {
  const [topic, setTopic] = useState('');
  const [series, setSeries] = useState('');
  const [character, setCharacter] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [difficulty] = useState<DifficultyLevel>('Undergrad (Academic)');
  const [duration] = useState<TargetDuration>('60s (Short)');
  
  const [tipIndex, setTipIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string>('');

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
        interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
        }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !series) return;
    
    // Find context if a concept is selected
    let context = undefined;
    if (selectedConceptId && syllabus) {
        const concept = syllabus.concepts.find(c => c.id === selectedConceptId);
        if (concept) {
            context = {
                unit: concept.unit,
                conceptId: concept.id,
                description: concept.description
            };
        }
    }

    onGenerate({ topic, series, character, aspectRatio, difficulty, duration, context });
  };

  const handleComicClick = () => {
    if (!topic || !series) return;
    
    let context = undefined;
    if (selectedConceptId && syllabus) {
        const concept = syllabus.concepts.find(c => c.id === selectedConceptId);
        if (concept) {
            context = { unit: concept.unit, description: concept.description };
        }
    }
    onGenerateComic(topic, series, character, context);
  };

  const applyPreset = (p: { topic: string, series: string, character: string }) => {
    setTopic(p.topic);
    setSeries(p.series);
    setCharacter(p.character);
    setSelectedConceptId('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        await onUploadSyllabus(e.target.files[0]);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleConceptSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedConceptId(cid);
    if (cid && syllabus) {
        const c = syllabus.concepts.find(c => c.id === cid);
        if (c) setTopic(c.title);
    } else {
        setTopic('');
    }
  };

  const getProgressWidth = () => {
    if (!progressMessage) return '0%';
    if (progressMessage.includes("Initializing")) return '5%';
    if (progressMessage.includes("Writing")) return '10%';
    if (progressMessage.includes("Finalizing")) return '98%';
    const sceneMatch = progressMessage.match(/Scene (\d+) of (\d+)/);
    if (sceneMatch) {
      const current = parseInt(sceneMatch[1]);
      const total = parseInt(sceneMatch[2]);
      if (total > 0) return `${Math.max(10, ((current - 0.2) / total) * 90)}%`;
    }
    if (progressMessage.includes("Generating comic")) return '50%';
    return '5%';
  };

  return (
    <div className="relative w-full min-h-[90vh] flex flex-col justify-center items-center px-4 md:px-0 overflow-hidden pb-20 pt-24">
      
      <div className="absolute inset-0 z-0 bg-[#141414]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
      </div>

      <div className="z-10 max-w-5xl w-full flex flex-col items-center mt-8 md:mt-0">
        
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-center drop-shadow-2xl tracking-tight leading-tight brand-font">
          Unlimited learning, <br />
          <span className="text-[#E50914]">TV series style.</span>
        </h1>
        
        {/* Main Form Container */}
        <div className="w-full max-w-4xl glass-panel rounded-xl p-6 md:p-8 shadow-2xl animate-fade-in-up">
          
          {/* Syllabus Upload Bar */}
          <div className="flex items-center justify-between bg-black/40 rounded-lg p-3 mb-6 border border-gray-700">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
                    <i className="fas fa-book text-gray-400"></i>
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-200">Syllabus Context</h4>
                    <p className="text-xs text-gray-500">
                        {syllabus ? `Loaded: ${syllabus.title}` : "Upload a PDF/Image to extract concepts"}
                    </p>
                 </div>
             </div>
             <div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.txt,.doc,.docx,image/*"
                    onChange={handleFileChange}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || isGenerating}
                    className="text-xs font-bold bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-white transition-colors"
                >
                    {uploading ? <i className="fas fa-spinner fa-spin"></i> : (syllabus ? 'Change File' : 'Upload Syllabus')}
                </button>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group col-span-1 md:col-span-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Topic</label>
                
                {/* Dual Mode Input: Dropdown or Text */}
                {syllabus ? (
                    <div className="relative">
                        <select 
                            value={selectedConceptId} 
                            onChange={handleConceptSelect}
                            className="w-full p-4 h-14 bg-black/60 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white appearance-none"
                            disabled={isGenerating}
                        >
                            <option value="">-- Free Form --</option>
                            {syllabus.units.map(unit => (
                                <optgroup key={unit} label={unit}>
                                    {syllabus.concepts.filter(c => c.unit === unit).map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.isCompleted ? '✓ ' : ''}{c.title}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                            <i className="fas fa-chevron-down"></i>
                        </div>
                    </div>
                ) : (
                    <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Quantum Entanglement"
                    className="w-full p-4 h-14 bg-black/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all text-lg"
                    disabled={isGenerating}
                    />
                )}
                
                {/* If Dropdown selected 'Free Form', allow typing */}
                {syllabus && selectedConceptId === '' && (
                     <input
                     type="text"
                     value={topic}
                     onChange={(e) => setTopic(e.target.value)}
                     placeholder="Type custom topic..."
                     className="w-full mt-2 p-3 h-12 bg-black/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white text-sm"
                     disabled={isGenerating}
                     />
                )}

              </div>

              <div className="relative group md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Series Style</label>
                    <input
                    type="text"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    placeholder="e.g. Stranger Things"
                    className="w-full p-4 h-14 bg-black/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all text-lg"
                    disabled={isGenerating}
                    />
                </div>
                <div className="relative">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Character</label>
                    <input
                    type="text"
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    placeholder="e.g. Eleven"
                    className="w-full p-4 h-14 bg-black/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all text-lg"
                    disabled={isGenerating}
                    />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700/50 pt-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Format</span>
                <div className="flex bg-black/40 rounded-lg p-1 border border-gray-700">
                  <button 
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${aspectRatio === '16:9' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                    <i className="fas fa-desktop mr-2"></i>Landscape
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${aspectRatio === '9:16' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                    <i className="fas fa-mobile-alt mr-2"></i>Portrait
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-2">
                <button 
                  type="submit"
                  disabled={isGenerating || !topic || !series}
                  className={`
                    flex-1 h-16 rounded-lg bg-[#E50914] text-white text-xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-[#f40612] active:scale-[0.99] shadow-lg shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {isGenerating ? <span className="animate-pulse">Generating...</span> : <span>Create Video</span>}
                </button>

                <button 
                  type="button"
                  onClick={handleComicClick}
                  disabled={isGenerating || !topic || !series}
                  className={`
                    flex-1 h-16 rounded-lg bg-gray-700 text-white text-xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-gray-600 active:scale-[0.99] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                    <i className="fas fa-columns text-lg"></i>
                    <span>Create Comic Strip</span>
                </button>
            </div>
          </form>

          {isGenerating && (
            <div className="mt-6 w-full animate-fade-in">
              <div className="flex justify-between items-end mb-2">
                 <span className="text-sm font-semibold text-white">{progressMessage}</span>
                 <span className="text-xs text-gray-400 uppercase tracking-widest">Processing</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700 ease-out"
                  style={{ width: getProgressWidth() }}
                ></div>
              </div>
              <div className="min-h-[40px] flex items-center justify-center mt-3 overflow-hidden relative">
                 <p key={tipIndex} className="text-sm text-gray-400 text-center italic animate-fade-in-up">
                   <i className="fas fa-lightbulb text-[#E50914] mr-2"></i>
                   {LOADING_TIPS[tipIndex]}
                 </p>
              </div>
            </div>
          )}
        </div>

        {!isGenerating && !syllabus && (
          <div className="mt-16 w-full max-w-5xl px-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-white text-lg font-bold mb-4 drop-shadow-md flex items-center gap-2">
              <span className="w-1 h-6 bg-[#E50914] rounded-full inline-block"></span>
              Trending Mashups
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {PRESETS.map((preset, idx) => (
                <div 
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className={`
                    relative aspect-[2/3] rounded-md overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:z-10 bg-gradient-to-br ${preset.color}
                  `}
                >
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                   <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black via-black/40 to-transparent">
                      <p className="text-[#E50914] text-[10px] font-bold uppercase tracking-widest mb-1">Top Pick</p>
                      <h4 className="text-white font-black text-xl leading-tight brand-font mb-1">{preset.series}</h4>
                      <p className="text-gray-300 text-xs font-medium">x {preset.topic}</p>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                     <i className="far fa-play-circle text-5xl text-white drop-shadow-lg transform group-hover:scale-110 transition-transform"></i>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetflixHero;
