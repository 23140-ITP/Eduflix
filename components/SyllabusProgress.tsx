
import React from 'react';
import { SyllabusData } from '../types';

interface SyllabusProgressProps {
  syllabus: SyllabusData;
  onSelectConcept: (conceptId: string) => void;
  selectedConceptId?: string;
}

const SyllabusProgress: React.FC<SyllabusProgressProps> = ({ syllabus, onSelectConcept, selectedConceptId }) => {
  const totalConcepts = syllabus.concepts.length;
  const completedConcepts = syllabus.concepts.filter(c => c.isCompleted).length;
  const progressPercent = Math.round((completedConcepts / totalConcepts) * 100);

  return (
    <div className="w-full bg-[#181818] border-b border-gray-800 p-6">
       <div className="max-w-7xl mx-auto">
          {/* Header Stats */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-6">
              <div>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Learning Path</h3>
                  <h2 className="text-2xl font-bold text-white brand-font">{syllabus.title}</h2>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <div className="text-right">
                      <p className="text-2xl font-black text-white">{progressPercent}%</p>
                      <p className="text-xs text-gray-500 font-bold uppercase">Complete</p>
                  </div>
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E50914] transition-all duration-500" style={{ width: `${progressPercent}%`}}></div>
                  </div>
              </div>
          </div>

          {/* Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {syllabus.units.map((unit) => {
                  const unitConcepts = syllabus.concepts.filter(c => c.unit === unit);
                  return (
                      <div key={unit} className="bg-[#222] rounded-lg p-4 border border-gray-800">
                          <h4 className="text-white font-bold mb-3 border-b border-gray-700 pb-2 text-sm">{unit}</h4>
                          <div className="flex flex-col gap-2">
                              {unitConcepts.map(concept => (
                                  <button
                                    key={concept.id}
                                    onClick={() => onSelectConcept(concept.id)}
                                    className={`
                                        group flex items-center justify-between p-2 rounded text-left transition-all
                                        ${selectedConceptId === concept.id ? 'bg-[#E50914] text-white' : 'hover:bg-gray-700 text-gray-300'}
                                    `}
                                  >
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div className={`
                                            w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                                            ${concept.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-500'}
                                          `}>
                                              {concept.isCompleted && <i className="fas fa-check text-[10px] text-white"></i>}
                                          </div>
                                          <span className="truncate text-xs font-medium">{concept.title}</span>
                                      </div>
                                      <i className={`fas fa-play-circle opacity-0 group-hover:opacity-100 transition-opacity ${selectedConceptId === concept.id ? 'text-white' : 'text-[#E50914]'}`}></i>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )
              })}
          </div>
       </div>
    </div>
  );
};

export default SyllabusProgress;
