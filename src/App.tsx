/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { VisualStudio } from './components/VisualStudio';
import { PlantCatalog } from './components/PlantCatalog';
import { MasterGardener } from './components/MasterGardener';
import { LayoutGeneratorModal } from './components/LayoutGeneratorModal';
import { PlantDetailModal } from './components/PlantDetailModal';
import { STARTER_GARDENS } from './data/gardenPresets';
import { 
  GardenDesign, 
  GardenZone, 
  GardenPlant, 
  GeneratedImageHistoryItem 
} from './types/garden';

export default function App() {
  const [gardens, setGardens] = useState<GardenDesign[]>(STARTER_GARDENS);
  const [currentGardenId, setCurrentGardenId] = useState<string>(STARTER_GARDENS[0].id);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'visuals' | 'plants' | 'gardener'>('blueprint');

  // Modal states
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<GardenZone | null>(null);
  const [inspectedPlant, setInspectedPlant] = useState<GardenPlant | null>(null);

  // Active prompt passed from other components to VisualStudio
  const [activeVisualPrompt, setActiveVisualPrompt] = useState<string | undefined>(undefined);

  // Plant visual generation loading state
  const [generatingPlantId, setGeneratingPlantId] = useState<string | null>(null);

  // Generation image history
  const [imageHistory, setImageHistory] = useState<GeneratedImageHistoryItem[]>([
    {
      id: 'init-1',
      url: STARTER_GARDENS[0].renderedImageUrl || '',
      prompt: STARTER_GARDENS[0].recommendedVisualPrompt,
      isEdit: false,
      timestamp: new Date().toISOString(),
      type: 'garden_overall',
    },
    {
      id: 'init-2',
      url: STARTER_GARDENS[1].renderedImageUrl || '',
      prompt: STARTER_GARDENS[1].recommendedVisualPrompt,
      isEdit: false,
      timestamp: new Date().toISOString(),
      type: 'garden_overall',
    },
    {
      id: 'init-3',
      url: STARTER_GARDENS[2].renderedImageUrl || '',
      prompt: STARTER_GARDENS[2].recommendedVisualPrompt,
      isEdit: false,
      timestamp: new Date().toISOString(),
      type: 'garden_overall',
    },
  ]);

  const currentGarden = gardens.find((g) => g.id === currentGardenId) || gardens[0];

  const handleUpdateGardenImage = (imageUrl: string) => {
    setGardens((prev) =>
      prev.map((g) =>
        g.id === currentGarden.id ? { ...g, renderedImageUrl: imageUrl } : g
      )
    );
  };

  const handleLayoutGenerated = (newGarden: GardenDesign) => {
    setGardens((prev) => [newGarden, ...prev]);
    setCurrentGardenId(newGarden.id);
    setSelectedZone(null);
    setActiveVisualPrompt(newGarden.recommendedVisualPrompt);
    setActiveTab('blueprint');

    if (newGarden.renderedImageUrl) {
      setImageHistory((prev) => [
        {
          id: `gen-${Date.now()}`,
          url: newGarden.renderedImageUrl!,
          prompt: newGarden.recommendedVisualPrompt,
          isEdit: false,
          timestamp: new Date().toISOString(),
          type: 'garden_overall',
        },
        ...prev,
      ]);
    }
  };

  /**
   * Synthesize individual plant visual
   */
  const handleGeneratePlantVisual = async (plant: GardenPlant) => {
    setGeneratingPlantId(plant.id);
    try {
      const response = await fetch('/api/garden/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: plant.defaultVisualPrompt,
          aspectRatio: '1:1',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize plant visual');
      }

      // Update plant in current garden
      setGardens((prev) =>
        prev.map((g) => {
          if (g.id !== currentGarden.id) return g;
          return {
            ...g,
            plants: g.plants.map((p) =>
              p.id === plant.id ? { ...p, generatedImageUrl: data.imageUrl } : p
            ),
          };
        })
      );

      // If currently inspecting this plant, update inspector view
      if (inspectedPlant?.id === plant.id) {
        setInspectedPlant((prev) => prev ? { ...prev, generatedImageUrl: data.imageUrl } : null);
      }

      // Add to image history
      setImageHistory((prev) => [
        {
          id: `plant-${Date.now()}`,
          url: data.imageUrl,
          prompt: plant.defaultVisualPrompt,
          isEdit: false,
          timestamp: new Date().toISOString(),
          type: 'plant_portrait',
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPlantId(null);
    }
  };

  /**
   * Jump from Zone inspector to Visual Studio with pre-loaded zone prompt
   */
  const handleGenerateZoneVisual = (zone: GardenZone) => {
    const prompt = `Photorealistic landscape design view of the "${zone.name}" zone in a ${currentGarden.style}: ${zone.description}. Featuring rich botanical textures under ${zone.sunExposure}, professional landscape photography.`;
    setActiveVisualPrompt(prompt);
    setActiveTab('visuals');
  };

  /**
   * Export Blueprint Plan Summary file
   */
  const handleExportPlan = () => {
    const planText = `=====================================================
VERDANT: DREAM GARDEN BLUEPRINT SPECIFICATION
=====================================================
Garden Title: ${currentGarden.title}
Aesthetic Style: ${currentGarden.style}
Lot Dimensions: ${currentGarden.dimensions.widthFt}' wide x ${currentGarden.dimensions.lengthFt}' deep (${currentGarden.dimensions.totalSqFt.toLocaleString()} sq ft)
Shape: ${currentGarden.dimensions.shape}
Created: ${new Date(currentGarden.createdAt).toLocaleDateString()}

EXECUTIVE SUMMARY:
${currentGarden.summary}

SOIL & HYDROLOGY STRATEGY:
${currentGarden.soilAndWateringStrategy}

ZONES & MICROCLIMATES:
${currentGarden.zones
  .map(
    (z, i) =>
      `[Zone ${i + 1}] ${z.name} (${z.type})
  - Coordinates: Position (${z.xPercent}%, ${z.yPercent}%), Dimensions: ${z.wPercent}% W x ${z.hPercent}% H
  - Sun Exposure: ${z.sunExposure}
  - Recommended Soil: ${z.recommendedSoil || 'Native amended'}
  - Description: ${z.description}
  - Key Features: ${z.keyFeatures?.join(', ') || 'N/A'}`
  )
  .join('\n\n')}

CURATED BOTANICAL PALETTE (${currentGarden.plants.length} Species):
${currentGarden.plants
  .map(
    (p, i) =>
      `${i + 1}. ${p.commonName} (${p.botanicalName})
   Type: ${p.type} | Sun: ${p.sunRequirement} | Water: ${p.waterNeeds}
   Mature Size: ${p.matureHeight} H x ${p.matureSpread} W
   Care Tip: ${p.careTip}
   Key Companions: ${p.companionPlants?.join(', ') || 'None'}`
  )
  .join('\n\n')}

COMPANION MUTUALISTIC MATRIX:
${currentGarden.companionPlantingMatrix
  .map(
    (m) =>
      `- ${m.plantA} + ${m.plantB}: [${m.relationship.toUpperCase()}] ${m.benefitReason}`
  )
  .join('\n')}

FOUR-SEASON CARE SCHEDULE:
Spring:
${currentGarden.seasonalGuide.spring.map((t) => `  * ${t}`).join('\n')}

Summer:
${currentGarden.seasonalGuide.summer.map((t) => `  * ${t}`).join('\n')}

Autumn:
${currentGarden.seasonalGuide.autumn.map((t) => `  * ${t}`).join('\n')}

Winter:
${currentGarden.seasonalGuide.winter.map((t) => `  * ${t}`).join('\n')}

=====================================================
Generated with Verdant Studio.
=====================================================`;

    const blob = new Blob([planText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentGarden.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-blueprint.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0c130e] text-[#f2f7f3] flex flex-col font-sans selection:bg-emerald-600/30 selection:text-emerald-200">
      {/* Header */}
      <Header
        currentGarden={currentGarden}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'visuals') {
            setActiveVisualPrompt(undefined);
          }
        }}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onSelectPreset={(preset) => {
          setCurrentGardenId(preset.id);
          setSelectedZone(null);
          setActiveVisualPrompt(undefined);
        }}
        starterGardens={gardens}
        onExportPlan={handleExportPlan}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'blueprint' && (
          <InteractiveCanvas
            garden={currentGarden}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            onSelectPlant={(plant) => setInspectedPlant(plant)}
            onGenerateZoneVisual={handleGenerateZoneVisual}
          />
        )}

        {activeTab === 'visuals' && (
          <VisualStudio
            garden={currentGarden}
            initialPrompt={activeVisualPrompt}
            onUpdateGardenImage={handleUpdateGardenImage}
            imageHistory={imageHistory}
            onAddImageHistory={(newImage) =>
              setImageHistory((prev) => [newImage, ...prev])
            }
          />
        )}

        {activeTab === 'plants' && (
          <PlantCatalog
            plants={currentGarden.plants}
            companionMatrix={currentGarden.companionPlantingMatrix}
            seasonalGuide={currentGarden.seasonalGuide}
            onGeneratePlantVisual={handleGeneratePlantVisual}
            onSelectPlant={(plant) => setInspectedPlant(plant)}
            generatingPlantId={generatingPlantId}
          />
        )}

        {activeTab === 'gardener' && (
          <MasterGardener garden={currentGarden} />
        )}
      </main>

      {/* Generator Modal */}
      <LayoutGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onLayoutGenerated={handleLayoutGenerated}
      />

      {/* Plant Inspection Modal */}
      <PlantDetailModal
        plant={inspectedPlant}
        onClose={() => setInspectedPlant(null)}
        onGenerateVisual={handleGeneratePlantVisual}
        isGeneratingVisual={generatingPlantId === inspectedPlant?.id}
      />
    </div>
  );
}
