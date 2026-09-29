import React, { useEffect } from 'react';
import { 
  X, 
  Sun, 
  Droplets, 
  Sparkles, 
  RefreshCw, 
  Flower2
} from 'lucide-react';
import { GardenPlant } from '../types/garden';

interface PlantDetailModalProps {
  plant: GardenPlant | null;
  onClose: () => void;
  onGenerateVisual: (plant: GardenPlant) => Promise<void>;
  isGeneratingVisual: boolean;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  onClose,
  onGenerateVisual,
  isGeneratingVisual,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!plant) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-[#121c15] border border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Image or Placeholder */}
        <div className="relative aspect-[16/10] bg-[#0c130e] overflow-hidden">
          {plant.generatedImageUrl ? (
            <img
              src={plant.generatedImageUrl}
              alt={plant.commonName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#121c15] to-[#0c130e]">
              <Flower2 className="w-10 h-10 text-emerald-600/60 mb-2" />
              <p className="text-xs text-emerald-400/80 font-mono">
                No visual synthesized for {plant.commonName} yet.
              </p>
              <button
                disabled={isGeneratingVisual}
                onClick={() => onGenerateVisual(plant)}
                className="mt-3 text-xs px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold flex items-center gap-2 shadow-md transition-colors"
              >
                {isGeneratingVisual ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Generate Photorealistic Botanical Visual</span>
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white transition-colors z-10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-3 bg-[#0c130e]/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-900 text-xs font-mono text-emerald-300">
            {plant.type}
          </div>
        </div>

        {/* Details Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-white">
              {plant.commonName}
            </h3>
            <p className="text-xs text-emerald-400/80 italic font-serif mt-0.5">
              {plant.botanicalName}
            </p>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#0c130e] p-3 rounded-2xl border border-emerald-950">
            <div className="flex items-center gap-2 text-emerald-200">
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{plant.sunRequirement}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-200">
              <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{plant.waterNeeds}</span>
            </div>
            <div className="col-span-2 text-[11px] text-emerald-400/70 pt-1.5 border-t border-emerald-950 flex justify-between">
              <span>Height: {plant.matureHeight}</span>
              <span>Spread: {plant.matureSpread}</span>
            </div>
          </div>

          {/* Landscape Role */}
          {plant.landscapeRole && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1 font-semibold">
                Landscape Architecture Function
              </span>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                {plant.landscapeRole}
              </p>
            </div>
          )}

          {/* Companions */}
          {plant.companionPlants && plant.companionPlants.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1.5 font-semibold">
                Recommended Companions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {plant.companionPlants.map((c, i) => (
                  <span
                    key={i}
                    className="text-xs bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800/60 font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Care Tip */}
          <div className="p-3.5 rounded-2xl bg-[#0c130e] border border-emerald-950 text-xs text-emerald-200/90 leading-relaxed">
            <strong className="text-emerald-400 font-semibold block mb-0.5">
              Horticultural Care Note
            </strong>
            {plant.careTip}
          </div>

          {plant.generatedImageUrl && (
            <button
              disabled={isGeneratingVisual}
              onClick={() => onGenerateVisual(plant)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-mono flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingVisual ? 'animate-spin' : ''}`} />
              <span>Re-synthesize Botanical Visual</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
