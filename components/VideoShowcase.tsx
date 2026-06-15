
import React, { useRef } from 'react';
import { GeneratedContent, GeneratedVideo, GeneratedComic, SyllabusData } from '../types';
import SyllabusProgress from './SyllabusProgress';

interface VideoShowcaseProps {
  videos: GeneratedContent[];
  syllabus?: SyllabusData | null;
  onSelectSyllabusConcept?: (id: string) => void;
}

const VideoShowcase: React.FC<VideoShowcaseProps> = ({ videos, syllabus, onSelectSyllabusConcept }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const hasVideos = videos.length > 0;
  
  // The most recent video/comic is "Now Playing"
  const latestContent = hasVideos ? videos[0] : null;
  const previousContent = hasVideos ? videos.slice(1) : [];

  const isVideo = (content: GeneratedContent): content is GeneratedVideo => content.type === 'video';

  return (
    <div className="w-full pb-24 relative z-20 bg-[#141414] border-t border-gray-900 mt-[-50px]">
      
      {/* Syllabus Progress Section (Visible if syllabus loaded) */}
      {syllabus && onSelectSyllabusConcept && (
        <SyllabusProgress 
            syllabus={syllabus} 
            onSelectConcept={onSelectSyllabusConcept} 
            selectedConceptId={latestContent?.conceptId} 
        />
      )}

      {/* Featured Player/Viewer Section */}
      {latestContent && (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-12 pt-16">
          <div className="flex flex-col md:flex-row items-end gap-4 mb-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#E50914] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">New Release</span>
                  <span className="text-gray-400 text-xs uppercase font-bold tracking-wide">
                      {isVideo(latestContent) ? 'Video' : 'Comic Strip'} 
                      {isVideo(latestContent) ? ` • ${latestContent.duration}` : ''}
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg brand-font leading-none">
                  {latestContent.series}
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mt-2 font-light">
                  Explaining <span className="text-white font-semibold">{latestContent.topic}</span>
                </p>
            </div>
          </div>

          <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
              {isVideo(latestContent) ? (
                  <div className={`relative w-full mx-auto ${latestContent.aspectRatio === '9:16' ? 'max-w-sm aspect-[9/16]' : 'aspect-video'}`}>
                      <video 
                          ref={videoRef}
                          src={latestContent.url} 
                          controls 
                          autoPlay 
                          loop
                          className="w-full h-full object-contain bg-black"
                      />
                  </div>
              ) : (
                  <div className="w-full aspect-auto md:aspect-[16/9] bg-gray-900 flex items-center justify-center p-2">
                      <img 
                        src={(latestContent as GeneratedComic).imageUrl} 
                        alt="Comic Strip" 
                        className="max-w-full max-h-screen object-contain rounded-lg"
                      />
                  </div>
              )}
          </div>
        </div>
      )}

      {/* History Row */}
      {previousContent.length > 0 && (
        <div className="mt-16 pl-4 md:pl-12 overflow-hidden">
          <h3 className="text-lg text-gray-200 font-bold mb-4 flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
            More Like This
            <i className="fas fa-chevron-right text-xs text-[#E50914] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"></i>
          </h3>
          
          <div className="flex gap-4 overflow-x-auto pb-8 pr-12 scrollbar-hide snap-x snap-mandatory">
            {previousContent.map((item) => (
              <div 
                key={item.id} 
                className={`
                  flex-none snap-start relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10
                  ${isVideo(item) && item.aspectRatio === '9:16' ? 'w-48' : 'w-72'}
                `}
                onClick={() => {
                   if (isVideo(item)) {
                       window.open(item.url, '_blank');
                   } else {
                       const win = window.open();
                       win?.document.write(`<img src="${(item as GeneratedComic).imageUrl}" style="width:100%"/>`);
                   }
                }}
              >
                {/* Thumbnail Preview */}
                <div className={`
                  bg-gray-800 rounded-md overflow-hidden relative border border-gray-800 shadow-lg
                  ${isVideo(item) ? (item.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video') : 'aspect-video'}
                `}>
                  {isVideo(item) ? (
                    <video 
                        src={item.url} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        muted
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                        }}
                    />
                  ) : (
                    <img 
                        src={(item as GeneratedComic).imageUrl} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        alt="Comic cover"
                    />
                  )}
                  
                  {/* Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/50">
                        <i className={`fas ${isVideo(item) ? 'fa-play' : 'fa-book-open'} text-white text-sm ml-1`}></i>
                    </div>
                  </div>
                  
                  {/* Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {isVideo(item) ? item.duration.split(' ')[0] : 'Strip'}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                  <h4 className="text-sm font-bold text-white truncate">{item.series}</h4>
                  <p className="text-xs text-gray-400 truncate">Top: {item.topic}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoShowcase;
