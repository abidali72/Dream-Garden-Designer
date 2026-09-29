import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  Compass, 
  Sparkles, 
  Image as ImageIcon, 
  BookOpen, 
  MessageSquare, 
  Download, 
  Plus, 
  Layers,
  ChevronDown,
  Check
} from 'lucide-react';
import { GardenDesign } from '../types/garden';

interface HeaderProps {
  currentGarden: GardenDesign;
  activeTab: 'blueprint' | 'visuals' | 'plants' | 'gardener';
  setActiveTab: (tab: 'blueprint' | 'visuals' | 'plants' | 'gardener') => void;
  onOpenGenerator: () => void;
  onSelectPreset: (garden: GardenDesign) => void;
  starterGardens: GardenDesign[];
  onExportPlan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGarden,
  activeTab,
  setActiveTab,
  onOpenGenerator,
  onSelectPreset,
  starterGardens,
  onExportPlan,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0c130e]/95 backdrop-blur-md border-b border-emerald-950/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5">
        {/* Brand identity & Mobile actions */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner shadow-emerald-500/10">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-bold tracking-tight text-emerald-50">Verdant</span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400/90 font-medium px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/40">
                  Studio
                </span>
              </div>
              <p className="text-xs text-emerald-300/70 hidden sm:block truncate max-w-[240px] lg:max-w-none">
                Dream Garden Architecture & Visual Synthesizer
              </p>
            </div>
          </div>

          {/* Mobile action buttons */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onExportPlan}
              title="Download Plan"
              className="p-2 rounded-lg text-emerald-300 hover:text-emerald-100 bg-emerald-950/60 border border-emerald-800/40"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenGenerator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Design</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#121c15] p-1 rounded-xl border border-emerald-900/60 shadow-inner w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'blueprint'
                ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/50 font-semibold'
                : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2D Blueprint & Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('visuals')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'visuals'
                ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/50 font-semibold'
                : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Visual Studio</span>
            <span className="text-[9px] font-mono uppercase bg-emerald-400/20 text-emerald-300 px-1 py-0.5 rounded">AI Edit</span>
          </button>

          <button
            onClick={() => setActiveTab('plants')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'plants'
                ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/50 font-semibold'
                : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Plants & Synergies</span>
            <span className="text-[10px] opacity-75 font-mono">({currentGarden.plants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gardener')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'gardener'
                ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/50 font-semibold'
                : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Gardener AI</span>
          </button>
        </nav>

        {/* Preset selector and Primary Action */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Garden Switcher with click toggle */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-emerald-950/70 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-200 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="max-w-[140px] truncate">{currentGarden.title}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 p-1.5 bg-[#121c15] border border-emerald-800 rounded-2xl shadow-2xl shadow-black/80 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider">
                  Select Garden Plan
                </div>
                {starterGardens.map((preset) => {
                  const isCurrent = preset.id === currentGarden.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onSelectPreset(preset);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-colors flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-emerald-800/50 text-emerald-100 font-semibold'
                          : 'text-emerald-300/80 hover:bg-emerald-900/30 hover:text-emerald-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate">{preset.title}</div>
                        <div className="text-[10px] text-emerald-400/60 truncate">{preset.style}</div>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export Plan button */}
          <button
            onClick={onExportPlan}
            title="Download Blueprint Specification"
            className="p-2 rounded-lg text-emerald-300 hover:text-emerald-100 bg-emerald-950/60 hover:bg-emerald-900/40 border border-emerald-800/40 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* AI Generator Trigger */}
          <button
            onClick={onOpenGenerator}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/60 hover:shadow-emerald-700/20 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>AI Garden Generator</span>
          </button>
        </div>
      </div>
    </header>
  );
};
