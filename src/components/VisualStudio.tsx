import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Upload, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Check, 
  Split, 
  AlertCircle,
  Copy,
  Trash2
} from 'lucide-react';
import { GardenDesign, GeneratedImageHistoryItem } from '../types/garden';

interface VisualStudioProps {
  garden: GardenDesign;
  initialPrompt?: string;
  onUpdateGardenImage: (imageUrl: string) => void;
  imageHistory: GeneratedImageHistoryItem[];
  onAddImageHistory: (item: GeneratedImageHistoryItem) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({
  garden,
  initialPrompt,
  onUpdateGardenImage,
  imageHistory,
  onAddImageHistory,
}) => {
  const [activeMode, setActiveMode] = useState<'create' | 'edit'>('create');

  // Creation state
  const [createPrompt, setCreatePrompt] = useState<string>(
    initialPrompt ||
      garden.recommendedVisualPrompt ||
      `Photorealistic landscape rendering of a ${garden.style} with lush flora, natural stone pathways, and warm golden lighting.`
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Sync prompt if initialPrompt changes
  useEffect(() => {
    if (initialPrompt) {
      setCreatePrompt(initialPrompt);
      setActiveMode('create');
    }
  }, [initialPrompt]);

  // Sync prompt if garden changes
  useEffect(() => {
    if (!initialPrompt && garden.recommendedVisualPrompt) {
      setCreatePrompt(garden.recommendedVisualPrompt);
    }
    if (garden.renderedImageUrl) {
      setActiveDisplayImage(garden.renderedImageUrl);
      setBaseImageForEdit(garden.renderedImageUrl);
    }
  }, [garden.id]);

  // Editing state
  const [baseImageForEdit, setBaseImageForEdit] = useState<string>(
    garden.renderedImageUrl || (imageHistory[0]?.url ?? '')
  );
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Before / After compare slider
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [beforeImage, setBeforeImage] = useState<string | null>(garden.beforeEditImageUrl || null);
  const [activeDisplayImage, setActiveDisplayImage] = useState<string>(
    garden.renderedImageUrl || (imageHistory[0]?.url ?? '')
  );
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample prompt chips for generation
  const createChips = [
    'Golden hour panoramic view down the flagstone path with blooming lavender',
    'Aerial 3D architectural landscape rendering showing all zones and raised beds',
    'Twilight sanctuary with warm glowing bistro fairy lights over the wooden pergola',
    'Vibrant summer bloom peak with bumblebees and heirloom pollinator perennials',
    'Morning mist rising over stone water fountain and lush moss rock garden',
  ];

  // Sample edit prompt chips
  const editChips = [
    'Add an elegant curved stone water fountain in the center',
    'Add warm solar hanging lantern string lights along the pergola and pathway',
    'Change the grass lawn into a biodiverse flowering pollinator meadow',
    'Change the season to mid-autumn with scarlet maples and warm golden light',
    'Add two raised cedar planter boxes with lush ripe vegetables on the side',
    'Add a cozy natural stone fire pit with Adirondack wooden chairs',
  ];

  /**
   * Handle text-to-image generation via backend
   */
  const handleGenerateVisual = async (customPrompt?: string) => {
    const promptToUse = customPrompt || createPrompt;
    if (!promptToUse.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/garden/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          aspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate visual from Gemini API');
      }

      const newImage: GeneratedImageHistoryItem = {
        id: `img-${Date.now()}`,
        url: data.imageUrl,
        prompt: promptToUse,
        isEdit: false,
        timestamp: new Date().toISOString(),
        type: 'garden_overall',
      };

      onAddImageHistory(newImage);
      setActiveDisplayImage(data.imageUrl);
      setBaseImageForEdit(data.imageUrl);
      onUpdateGardenImage(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setGenerationError(
        err.message || 'Image generation service encountered an error. Please try again with a revised prompt.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle image-to-image modification via backend
   */
  const handleEditVisual = async (customPrompt?: string) => {
    const promptToUse = customPrompt || editPrompt;
    if (!promptToUse.trim() || !baseImageForEdit) return;

    setIsEditing(true);
    setEditError(null);

    try {
      const response = await fetch('/api/garden/edit-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: baseImageForEdit,
          prompt: promptToUse,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to edit visual with Gemini API');
      }

      // Record before image for comparison slider
      setBeforeImage(baseImageForEdit);

      const newImage: GeneratedImageHistoryItem = {
        id: `edit-${Date.now()}`,
        url: data.imageUrl,
        prompt: promptToUse,
        isEdit: true,
        parentUrl: baseImageForEdit,
        timestamp: new Date().toISOString(),
        type: 'garden_overall',
      };

      onAddImageHistory(newImage);
      setActiveDisplayImage(data.imageUrl);
      setBaseImageForEdit(data.imageUrl);
      onUpdateGardenImage(data.imageUrl);
      setEditPrompt('');
    } catch (err: any) {
      console.error(err);
      setEditError(
        err.message || 'Image editing service encountered an error. Please adjust your edit instruction.'
      );
    } finally {
      setIsEditing(false);
    }
  };

  /**
   * Handle user photo upload for editing
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setBaseImageForEdit(base64);
        setActiveDisplayImage(base64);
        setActiveMode('edit');

        onAddImageHistory({
          id: `upload-${Date.now()}`,
          url: base64,
          prompt: `User Upload: ${file.name}`,
          isEdit: false,
          timestamp: new Date().toISOString(),
          type: 'user_upload',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyPrompt = () => {
    const p = activeMode === 'create' ? createPrompt : editPrompt;
    navigator.clipboard.writeText(p);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Studio Header */}
      <div className="bg-[#121c15] p-5 rounded-3xl border border-emerald-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/40">
              Gemini Visual Synthesis & Editing
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Dream Garden Visual Studio
          </h2>
          <p className="text-xs text-emerald-300/80 mt-0.5">
            Create photorealistic renderings from text descriptions or iteratively edit your garden using natural language prompts.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#0c130e] p-1 rounded-xl border border-emerald-950">
          <button
            onClick={() => setActiveMode('create')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
              activeMode === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Image</span>
          </button>
          <button
            onClick={() => setActiveMode('edit')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
              activeMode === 'edit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Edit with Text Prompt</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls + Visual Canvas Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Prompting & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {activeMode === 'create' ? (
            /* Mode 1: Create Image */
            <div className="bg-[#121c15] p-5 rounded-3xl border border-emerald-900/60 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Text-to-Visual Prompt
                </span>
                <span className="text-[11px] font-mono text-emerald-400/70">gemini-3.1-flash-image</span>
              </div>

              {/* Prompt textarea */}
              <div className="space-y-1.5">
                <textarea
                  rows={4}
                  value={createPrompt}
                  onChange={(e) => setCreatePrompt(e.target.value)}
                  placeholder="Describe your dream garden scene in rich detail (e.g. golden hour light, cedar raised beds, fragrant lavender, stone fountain)..."
                  className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-2xl p-3.5 text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Aspect Ratio Selection */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wide text-emerald-400/80 block mb-2 font-semibold">
                  Aspect Ratio
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(['16:9', '4:3', '1:1', '9:16'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 px-2 text-xs font-mono rounded-xl border text-center transition-all ${
                        aspectRatio === ratio
                          ? 'bg-emerald-600/90 border-emerald-400 text-white font-semibold shadow-sm'
                          : 'bg-[#0c130e] border-emerald-950 text-emerald-400/70 hover:text-emerald-200 hover:border-emerald-800'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Prompt Suggestions */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wide text-emerald-400/80 block mb-2 font-semibold">
                  Inspiration Prompts
                </span>
                <div className="space-y-1.5">
                  {createChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCreatePrompt(chip)}
                      className="w-full text-left text-[11px] text-emerald-300/80 hover:text-white bg-[#0c130e] hover:bg-emerald-950/70 border border-emerald-950 hover:border-emerald-800/80 p-2.5 rounded-xl transition-colors line-clamp-1"
                    >
                      "{chip}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Error display */}
              {generationError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/70 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Generate Action Button */}
              <button
                disabled={isGenerating || !createPrompt.trim()}
                onClick={() => handleGenerateVisual()}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all active:scale-[0.99]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Synthesizing Dream Garden Visual...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Generate Dream Garden Visual</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Mode 2: Edit Image with Prompt */
            <div className="bg-[#121c15] p-5 rounded-3xl border border-emerald-900/60 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  AI Image Modification
                </span>
                <span className="text-[11px] font-mono text-emerald-400/70">gemini-3.1-flash-image</span>
              </div>

              {/* Base image preview & selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wide text-emerald-400/80 font-semibold">
                    Source Image to Modify
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-mono text-emerald-400 hover:text-emerald-200 flex items-center gap-1 underline underline-offset-2"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Yard Photo</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-emerald-900/80 bg-[#0c130e] aspect-[16/9] max-h-36">
                  {baseImageForEdit ? (
                    <img
                      src={baseImageForEdit}
                      alt="Source to edit"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-emerald-600 text-xs">
                      <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                      <span>Select or upload an image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit instruction prompt */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wide text-emerald-400/80 block font-semibold">
                  Modification Instruction
                </label>
                <textarea
                  rows={3}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g. Add an arched pergola with purple wisteria, add flagstone stepping stones, add a bird bath..."
                  className="w-full bg-[#0c130e] border border-emerald-900/80 rounded-2xl p-3.5 text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Quick Edit Suggestions */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wide text-emerald-400/80 block mb-2 font-semibold">
                  One-Click Landscape Adjustments
                </span>
                <div className="space-y-1.5">
                  {editChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEditPrompt(chip)}
                      className="w-full text-left text-[11px] text-emerald-300/80 hover:text-white bg-[#0c130e] hover:bg-emerald-950/70 border border-emerald-950 hover:border-emerald-800/80 p-2.5 rounded-xl transition-colors line-clamp-1"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit error message */}
              {editError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/70 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Edit Action Button */}
              <button
                disabled={isEditing || !editPrompt.trim() || !baseImageForEdit}
                onClick={() => handleEditVisual()}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all active:scale-[0.99]"
              >
                {isEditing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Applying Landscape Modification...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-emerald-200" />
                    <span>Apply AI Landscape Edit</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: High-Res Viewport + Compare Slider */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#121c15] p-5 rounded-3xl border border-emerald-900/60 shadow-xl flex flex-col gap-4">
            {/* Viewport Header with actions */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  {beforeImage ? 'Interactive Compare View' : 'Visual Preview'}
                </span>
                <h3 className="text-base font-serif font-bold text-white">
                  {garden.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPrompt}
                  title="Copy Prompt"
                  className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/50 text-emerald-300 hover:text-emerald-100 transition-colors"
                >
                  {copiedPrompt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                {beforeImage && (
                  <button
                    onClick={() => setBeforeImage(null)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800/50 text-emerald-300 hover:text-emerald-100 font-medium"
                  >
                    Hide Split Slider
                  </button>
                )}

                {activeDisplayImage && (
                  <a
                    href={activeDisplayImage}
                    download={`verdant-garden-${Date.now()}.png`}
                    className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/50 text-emerald-300 hover:text-emerald-100 transition-colors"
                    title="Download Image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Visual Viewport / Interactive Before-After Slider with clip-path */}
            <div className="relative w-full aspect-[16/10] bg-[#0c130e] rounded-2xl overflow-hidden border border-emerald-900/80 shadow-2xl flex items-center justify-center">
              {isGenerating || isEditing ? (
                <div className="absolute inset-0 bg-[#0c130e]/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30">
                  <div className="w-12 h-12 rounded-full border-3 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <p className="text-xs font-mono text-emerald-300 animate-pulse">
                    {isGenerating ? 'Synthesizing photorealistic foliage & lighting...' : 'Applying landscape prompt modifications...'}
                  </p>
                </div>
              ) : null}

              {beforeImage ? (
                /* Perfectly aligned interactive split slider with clip-path */
                <div className="relative w-full h-full select-none overflow-hidden">
                  {/* After Image (Full Background) */}
                  <img
                    src={activeDisplayImage}
                    alt="Modified Garden"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Before Image (Full Size with Clip-Path) */}
                  <div
                    style={{
                      clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                    }}
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  >
                    <img
                      src={beforeImage}
                      alt="Before Modification"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-white border border-white/20">
                      BEFORE
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 bg-emerald-950/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-200 border border-emerald-800/60 z-5">
                    AFTER
                  </div>

                  {/* Range Slider for Split */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize z-20 w-full h-full"
                  />

                  {/* Visual Handle Divider Line & Knob */}
                  <div
                    style={{ left: `${sliderPosition}%` }}
                    className="absolute inset-y-0 -translate-x-1/2 pointer-events-none z-15 flex items-center justify-center"
                  >
                    <div className="w-0.5 h-full bg-emerald-400 shadow-lg shadow-black/80" />
                    <div className="absolute w-8 h-8 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center shadow-xl border-2 border-[#0c130e]">
                      <Split className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ) : activeDisplayImage ? (
                /* Single Image View */
                <div className="relative w-full h-full">
                  <img
                    src={activeDisplayImage}
                    alt={garden.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-emerald-600">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No visual rendered yet. Enter a prompt to generate one!</p>
                </div>
              )}
            </div>

            {/* Set as current garden cover button */}
            {activeDisplayImage && activeDisplayImage !== garden.renderedImageUrl && (
              <button
                onClick={() => onUpdateGardenImage(activeDisplayImage)}
                className="py-2.5 px-3.5 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Set as Master Garden Visual</span>
              </button>
            )}
          </div>

          {/* Project Visual Gallery & History */}
          <div className="bg-[#121c15] p-5 rounded-3xl border border-emerald-900/60 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Studio Generation History ({imageHistory.length})
              </span>
              <span className="text-[10px] text-emerald-400/70 font-mono">
                Click any thumbnail to preview or edit
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {imageHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveDisplayImage(item.url);
                    setBaseImageForEdit(item.url);
                  }}
                  className={`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border transition-all ${
                    activeDisplayImage === item.url
                      ? 'border-emerald-400 ring-2 ring-emerald-500/50 shadow-md'
                      : 'border-emerald-950 hover:border-emerald-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {item.isEdit && (
                    <span className="absolute top-1 right-1 bg-emerald-900/90 text-emerald-200 text-[8px] font-mono px-1 rounded">
                      EDITED
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                    <p className="text-[9px] text-white line-clamp-2 leading-tight">
                      {item.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
