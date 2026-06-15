
import React, { useState, useEffect } from 'react';
import NetflixHeader from './components/NetflixHeader';
import NetflixHero from './components/NetflixHero';
import VideoShowcase from './components/VideoShowcase';
import { generateVeoVideo } from './services/veoService';
import { generateComicStrip } from './services/comicService';
import { extractSyllabus } from './services/syllabusService';
import { VideoRequest, GeneratedContent, GenerationStatus, SyllabusData } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [contentList, setContentList] = useState<GeneratedContent[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Syllabus State
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        console.warn("window.aistudio not found. Assuming development or degraded mode.");
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
        setErrorMsg(null);
      } catch (e) {
        console.error("Failed to select key", e);
        setErrorMsg("Failed to select API key. Please try again.");
      }
    }
  };

  const handleUploadSyllabus = async (file: File) => {
    if (!hasApiKey) await handleSelectKey();
    setStatus(GenerationStatus.GENERATING);
    setProgressMsg("Extracting syllabus...");
    setErrorMsg(null);
    try {
        const data = await extractSyllabus(file, (msg) => setProgressMsg(msg));
        setSyllabus(data);
        setStatus(GenerationStatus.COMPLETE);
    } catch (e: any) {
        setStatus(GenerationStatus.ERROR);
        setErrorMsg(e.message || "Failed to analyze syllabus.");
    }
  };

  const markConceptComplete = (conceptId: string) => {
    if (!syllabus) return;
    const updatedConcepts = syllabus.concepts.map(c => 
        c.id === conceptId ? { ...c, isCompleted: true } : c
    );
    setSyllabus({ ...syllabus, concepts: updatedConcepts });
  };

  const handleGenerateVideo = async (request: VideoRequest) => {
    if (!hasApiKey) {
      await handleSelectKey();
    }

    setStatus(GenerationStatus.GENERATING);
    setProgressMsg("Initializing...");
    setErrorMsg(null);

    try {
      const url = await generateVeoVideo(request, (msg) => setProgressMsg(msg));
      
      const newVideo: GeneratedContent = {
        type: 'video',
        id: Date.now().toString(),
        url,
        topic: request.topic,
        series: request.series,
        character: request.character,
        aspectRatio: request.aspectRatio,
        difficulty: request.difficulty,
        duration: request.duration,
        createdAt: Date.now(),
        conceptId: request.context?.conceptId
      };

      if (request.context?.conceptId) {
        markConceptComplete(request.context.conceptId);
      }

      setContentList(prev => [newVideo, ...prev]);
      setStatus(GenerationStatus.COMPLETE);
    } catch (error: any) {
      console.error("Video generation failed:", error);
      setStatus(GenerationStatus.ERROR);
      
      if (error.message && (error.message.includes("Requested entity was not found") || error.message.includes("API Key"))) {
         setHasApiKey(false);
         setErrorMsg("API Key validation failed. Please select your paid API key again.");
      } else {
        setErrorMsg(error.message || "Something went wrong creating your video.");
      }
    }
  };

  const handleGenerateComic = async (topic: string, series: string, character: string, context?: any) => {
    if (!hasApiKey) {
      await handleSelectKey();
    }
    
    setStatus(GenerationStatus.GENERATING);
    setProgressMsg("Writing comic script...");
    setErrorMsg(null);

    try {
        const result = await generateComicStrip(topic, series, character, context, (msg) => setProgressMsg(msg));
        
        const newComic: GeneratedContent = {
            ...result,
            id: Date.now().toString(),
            createdAt: Date.now(),
            conceptId: context?.conceptId
        };
        
        if (context?.conceptId) {
            markConceptComplete(context.conceptId);
        }

        setContentList(prev => [newComic, ...prev]);
        setStatus(GenerationStatus.COMPLETE);
    } catch (error: any) {
        console.error("Comic generation failed:", error);
        setStatus(GenerationStatus.ERROR);
        setErrorMsg(error.message || "Failed to create comic strip.");
    }
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white">
      <NetflixHeader />
      
      <main className="relative">
        {!hasApiKey && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to EduFlix</h2>
            <p className="max-w-md text-gray-300 mb-8">
              To generate high-quality content with Veo 3 and Gemini, you need to connect your Google Cloud Project with a paid billing account.
            </p>
            <button 
              onClick={handleSelectKey}
              className="px-8 py-3 bg-[#E50914] rounded font-bold hover:bg-[#f40612] transition-colors"
            >
              Select Paid API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noreferrer"
              className="mt-4 text-sm text-gray-500 hover:text-white underline"
            >
              Learn more about billing
            </a>
          </div>
        )}

        <NetflixHero 
          onGenerate={handleGenerateVideo} 
          onGenerateComic={handleGenerateComic}
          onUploadSyllabus={handleUploadSyllabus}
          isGenerating={status === GenerationStatus.GENERATING}
          progressMessage={progressMsg}
          syllabus={syllabus}
        />

        {errorMsg && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-white px-6 py-4 rounded shadow-lg border border-red-500 flex items-center gap-3">
             <i className="fas fa-exclamation-circle text-xl"></i>
             <span>{errorMsg}</span>
             <button onClick={() => setErrorMsg(null)} className="ml-4 hover:text-gray-300">
               <i className="fas fa-times"></i>
             </button>
          </div>
        )}

        <VideoShowcase 
            videos={contentList} 
            syllabus={syllabus}
            onSelectSyllabusConcept={(id) => {
                // Not ideal UX to jump up without feedback, but simple for now
                scrollToHero(); 
                // We don't have a direct prop to set concept ID in Hero from here easily 
                // without lifting more state. For now, the user sees the progress map.
            }}
        />
      </main>

      <footer className="w-full py-8 text-center text-gray-500 text-sm bg-black/50 mt-12 border-t border-gray-800">
        <p>Powered by Google Gemini Veo 3.1 & Imagen</p>
        <p className="mt-2">&copy; {new Date().getFullYear()} EduFlix. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
