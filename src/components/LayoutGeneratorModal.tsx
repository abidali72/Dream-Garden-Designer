import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Carrot,
  Flower2,
  TreeDeciduous,
  Armchair,
  Wand2
} from 'lucide-react';
import { GardenDesign } from '../types/garden';

interface LayoutGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLayoutGenerated: (layout: GardenDesign) => void;
}

export const LayoutGeneratorModal: React.FC<LayoutGeneratorModalProps> = ({
  isOpen,
  onClose,
  onLayoutGenerated,
}) => {
  const [style, setStyle] = useState('English Cottage & Edible Permaculture');
  const [widthFt, setWidthFt] = useState(40);
  const [lengthFt, setLengthFt] = useState(60);
  const [shape, setShape] = useState('Rectangular');
  const [sunlight, setSunlight] = useState('Full Sun to Partial Shade (Mixed)');
  const [soilType, setSoilType] = useState('Rich Loam with good drainage');
  const [hardinessZone, setHardinessZone] = useState('Zone 7 (Temperate)');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Pollinator & Wildlife Haven',
    'Organic Vegetable & Herb Harvest',
    'Outdoor Dining & Entertaining',
  ]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Raised Cedar Planters',
    'Timber Pergola / Arbor',
    'Stone Winding Pathway',
    'Babbling Water Fountain',
  ]);
  const [lifestyleNotes, setLifestyleNotes] = useState(
    'Weekend gardener with moderate maintenance availability, loves fragrant herbs and cut flowers.'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const stylePresets = [
    'English Cottage & Edible Permaculture',
    'Serene Japanese Zen & Moss Sanctuary',
    'Sun-Drenched Mediterranean Xeriscape',
    'Modern Minimalist Architectural Oasis',
    'Wildflower Meadow & Pollinator Haven',
    'Compact Urban Courtyard Potager',
    'Woodland Shade Fernery',
  ];

  const quickTemplates = [
    {
      label: 'Cottage Potager (40×60)',
      style: 'English Cottage & Edible Permaculture',
      width: 40,
      length: 60,
      shape: 'Rectangular',
      sun: 'Full Sun to Partial Shade (Mixed)',
    },
    {
      label: 'Urban Zen Courtyard (25×35)',
      style: 'Serene Japanese Zen & Moss Sanctuary',
      width: 25,
      length: 35,
      shape: 'Courtyard (Walled)',
      sun: 'Dappled / Morning Sun (3-6 hrs)',
    },
    {
      label: 'Mediterranean Dry Patio (35×50)',
      style: 'Sun-Drenched Mediterranean Xeriscape',
      width: 35,
      length: 50,
      shape: 'Rectangular',
      sun: 'Full Sun (6+ hrs daily)',
    },
    {
      label: 'Pollinator Homestead (60×90)',
      style: 'Wildflower Meadow & Pollinator Haven',
      width: 60,
      length: 90,
      shape: 'Rectangular',
      sun: 'Full Sun (6+ hrs daily)',
    },
  ];

  const priorityOptions = [
    'Pollinator & Wildlife Haven',
    'Organic Vegetable & Herb Harvest',
    'Low Maintenance / Drought-Tolerant',
    'Child & Pet Safe (No toxic flora)',
    'Outdoor Dining & Entertaining',
    'Fragrant Aromatics & Cut Flowers',
    'Acoustic Peace (Water Masking)',
    'Four-Season Winter Visual Interest',
  ];

  const featureOptions = [
    'Raised Cedar Planters',
    'Timber Pergola / Arbor',
    'Stone Winding Pathway',
    'Babbling Water Fountain',
    'Natural Stone Fire Pit',
    'Outdoor Teak Dining Set',
    'Potting Bench & Tool Nook',
    'Espalier Fruit Trees',
    'Culinary Herb Spiral',
    'Rainwater Harvesting Barrel',
  ];

  const togglePriority = (item: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const toggleFeature = (item: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const applyTemplate = (t: typeof quickTemplates[0]) => {
    setStyle(t.style);
    setWidthFt(t.width);
    setLengthFt(t.length);
    setShape(t.shape);
    setSunlight(t.sun);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/garden/generate-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style,
          dimensions: {
            widthFt: Number(widthFt),
            lengthFt: Number(lengthFt),
            shape,
          },
          sunlight,
          soilType,
          hardinessZone,
          priorities: selectedPriorities,
          specialFeatures: selectedFeatures,
          lifestyleNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate garden design');
      }

      const generatedDesign: GardenDesign = {
        id: `custom-garden-${Date.now()}`,
        ...data.layout,
        createdAt: new Date().toISOString(),
      };

      onLayoutGenerated(generatedDesign);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while designing your garden.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#121c15] border border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <div className="p-5 sm:p-6 border-b border-emerald-900/80 flex items-center justify-between shrink-0 bg-[#0c130e]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">
                AI Dream Garden Generator
              </h2>
              <p className="text-xs text-emerald-300/80">
                Specify your lot constraints and preferences to synthesize a custom 2D layout and plant ecosystem.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="generator-form" onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quick Starter Templates */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 font-semibold">
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Start Templates</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickTemplates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="p-2.5 rounded-xl text-left bg-[#0c130e] hover:bg-emerald-950/70 border border-emerald-950 hover:border-emerald-800 transition-all text-xs"
                >
                  <div className="font-semibold text-white truncate">{t.label}</div>
                  <div className="text-[10px] text-emerald-400/70 truncate">{t.style}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Garden Style Presets */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-2 font-semibold">
              1. Garden Style & Aesthetic
            </label>
            <div className="flex flex-wrap gap-2">
              {stylePresets.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    style === s
                      ? 'bg-emerald-600 text-white shadow-md font-semibold'
                      : 'bg-[#0c130e] text-emerald-300/70 hover:text-white border border-emerald-950 hover:border-emerald-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Or enter custom aesthetic..."
              className="mt-2.5 w-full bg-[#0c130e] border border-emerald-900/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Dimensions & Shape */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-1.5 font-semibold">
                Width (ft)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={widthFt}
                onChange={(e) => setWidthFt(Number(e.target.value))}
                className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-1.5 font-semibold">
                Length (ft)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={lengthFt}
                onChange={(e) => setLengthFt(Number(e.target.value))}
                className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-1.5 font-semibold">
                Yard Shape
              </label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Rectangular" className="bg-[#121c15]">Rectangular</option>
                <option value="Square" className="bg-[#121c15]">Square</option>
                <option value="Courtyard (Walled)" className="bg-[#121c15]">Courtyard (Walled)</option>
                <option value="L-Shaped" className="bg-[#121c15]">L-Shaped</option>
                <option value="Narrow Urban Lot" className="bg-[#121c15]">Narrow Urban Lot</option>
              </select>
            </div>
          </div>

          {/* Sunlight & Soil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-1.5 font-semibold">
                Sun Exposure
              </label>
              <select
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value)}
                className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Full Sun (6+ hrs daily)" className="bg-[#121c15]">Full Sun (6+ hrs daily)</option>
                <option value="Full Sun to Partial Shade (Mixed)" className="bg-[#121c15]">Full Sun to Partial Shade (Mixed)</option>
                <option value="Dappled / Morning Sun (3-6 hrs)" className="bg-[#121c15]">Dappled / Morning Sun (3-6 hrs)</option>
                <option value="Deep Shade (< 3 hrs)" className="bg-[#121c15]">Deep Shade (&lt; 3 hrs)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-1.5 font-semibold">
                Soil Type & Drainage
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Rich Loam with good drainage" className="bg-[#121c15]">Rich Loam with good drainage</option>
                <option value="Sandy & Fast-Draining" className="bg-[#121c15]">Sandy & Fast-Draining</option>
                <option value="Heavy Clay (Moisture-Retentive)" className="bg-[#121c15]">Heavy Clay (Moisture-Retentive)</option>
                <option value="Raised Beds with Organic Compost" className="bg-[#121c15]">Raised Beds with Organic Compost</option>
              </select>
            </div>
          </div>

          {/* Hardiness Zone */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-1.5 font-semibold">
              Hardiness Zone & Climate
            </label>
            <select
              value={hardinessZone}
              onChange={(e) => setHardinessZone(e.target.value)}
              className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Zone 4-5 (Cold Winters, Moderate Summer)" className="bg-[#121c15]">Zone 4-5 (Cold Winters, Moderate Summer)</option>
              <option value="Zone 6-7 (Temperate Four Seasons)" className="bg-[#121c15]">Zone 6-7 (Temperate Four Seasons)</option>
              <option value="Zone 8-9 (Mild Winter, Hot Summer)" className="bg-[#121c15]">Zone 8-9 (Mild Winter, Hot Summer)</option>
              <option value="Zone 10-11 (Subtropical / Frost-Free)" className="bg-[#121c15]">Zone 10-11 (Subtropical / Frost-Free)</option>
              <option value="Arid / Desert High Sun" className="bg-[#121c15]">Arid / Desert High Sun</option>
            </select>
          </div>

          {/* Priorities */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-2 font-semibold">
              Design Priorities (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((p) => {
                const isSelected = selectedPriorities.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePriority(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-[#0c130e] text-emerald-300/70 hover:text-white border border-emerald-950'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desired Architectural Elements */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-2 font-semibold">
              Desired Hardscapes & Features
            </label>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map((f) => {
                const isSelected = selectedFeatures.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-[#0c130e] text-emerald-300/70 hover:text-white border border-emerald-950'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{f}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extra Notes */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 block mb-1.5 font-semibold">
              Lifestyle & Personal Vision Notes
            </label>
            <textarea
              rows={2}
              value={lifestyleNotes}
              onChange={(e) => setLifestyleNotes(e.target.value)}
              placeholder="e.g. Needs safe space for two dogs, want morning coffee seating area, prefer blue and purple flower palettes..."
              className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-xl p-3 text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-200">
              {error}
            </div>
          )}
        </form>

        {/* Fixed Footer */}
        <div className="p-4 sm:p-5 border-t border-emerald-900/80 bg-[#0c130e]/90 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-emerald-300/80 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="generator-form"
            disabled={isGenerating}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/80 transition-all active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Synthesizing Architectural Garden Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Generate Dream Garden Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
