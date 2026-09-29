import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Setup JSON parsing with generous limit for base64 images
app.use(express.json({ limit: '25mb' }));

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary models
const TEXT_MODEL = 'gemini-3.8-flash';
// User block specifically requested gemini-3.1-flash-image-preview
const IMAGE_MODELS = ['gemini-3.1-flash-image-preview', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

/**
 * Helper to call image generation with fallback across supported models
 */
async function generateOrEditImage(parts: any[], config?: any) {
  let lastError: any = null;

  for (const modelName of IMAGE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: config?.imageConfig ? { imageConfig: config.imageConfig } : undefined,
      });

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (err: any) {
      console.warn(`Image generation attempt with model ${modelName} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('No image was returned from Gemini API.');
}

/**
 * 1. Generate comprehensive garden layout and plant selections
 */
app.post('/api/garden/generate-layout', async (req: Request, res: Response) => {
  try {
    const {
      style = 'English Cottage & Edible Permaculture',
      dimensions = { widthFt: 40, lengthFt: 60, shape: 'Rectangular' },
      sunlight = 'Full Sun to Partial Shade (Mixed)',
      soilType = 'Rich Loam with good drainage',
      hardinessZone = 'Zone 7 (Temperate)',
      priorities = ['Pollinator friendly', 'Organic kitchen vegetables', 'Relaxing outdoor seating'],
      specialFeatures = ['Raised cedar garden beds', 'Stone pathway', 'Pergola arbor', 'Water fountain'],
      lifestyleNotes = 'Low to moderate weekend maintenance, pet-safe, fragrant herbs',
    } = req.body;

    const prompt = `You are a master landscape architect, certified master gardener, and permaculture designer.
Generate an intelligent, highly cohesive, professional garden design plan for a client with the following preferences:
- Garden Aesthetic & Style: ${style}
- Lot Dimensions & Shape: ${dimensions.widthFt} ft wide by ${dimensions.lengthFt} ft long (${dimensions.shape})
- Sunlight Conditions: ${sunlight}
- Soil & Drainage: ${soilType}
- Hardiness Zone / Climate: ${hardinessZone}
- Main Priorities: ${Array.isArray(priorities) ? priorities.join(', ') : priorities}
- Desired Elements & Features: ${Array.isArray(specialFeatures) ? specialFeatures.join(', ') : specialFeatures}
- Lifestyle & Maintenance Notes: ${lifestyleNotes}

Provide a meticulous garden plan with:
1. Distinct functional zones (with exact coordinates in percentages 0-100 across width and length so they fit nicely without awkward overlaps).
2. Hardscaping features (paths, patio, arbor, raised beds, water features) with clear materials.
3. 8 to 14 carefully chosen plants (trees, shrubs, perennials, vegetables, culinary herbs, climbers, groundcovers) that thrive together in these sun and soil conditions.
4. Companion planting synergies (which plants benefit each other, e.g., basil + tomatoes, marigolds + pest repelling, lavender + pollinators).
5. Four-season interest timeline (spring waking, summer peak, autumn harvest, winter structure).
6. A vivid, photorealistic prompt for generating a top-down and 3D garden rendering.`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'You are an award-winning botanical garden architect and ecological landscape designer. Always return valid, well-structured JSON complying with the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Creative name for this garden design' },
            style: { type: Type.STRING, description: 'Primary garden style' },
            summary: { type: Type.STRING, description: 'Elevator pitch overview of the landscape vision' },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                widthFt: { type: Type.NUMBER },
                lengthFt: { type: Type.NUMBER },
                totalSqFt: { type: Type.NUMBER },
                shape: { type: Type.STRING },
              },
              required: ['widthFt', 'lengthFt', 'totalSqFt', 'shape'],
            },
            zones: {
              type: Type.ARRAY,
              description: 'Functional layout zones positioned on the 0-100% canvas',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: 'Type: vegetable, perennial_border, patio_seating, water_feature, pollinator_path, herb_spiral, shade_sanctuary, lawn_turf, orchard_trees, compost_utility',
                  },
                  xPercent: { type: Type.NUMBER, description: 'Left position from 0 to 100' },
                  yPercent: { type: Type.NUMBER, description: 'Top position from 0 to 100' },
                  wPercent: { type: Type.NUMBER, description: 'Width percentage from 10 to 80' },
                  hPercent: { type: Type.NUMBER, description: 'Height percentage from 10 to 80' },
                  sunExposure: { type: Type.STRING },
                  description: { type: Type.STRING },
                  recommendedSoil: { type: Type.STRING },
                  keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['id', 'name', 'type', 'xPercent', 'yPercent', 'wPercent', 'hPercent', 'sunExposure', 'description'],
              },
            },
            plants: {
              type: Type.ARRAY,
              description: 'Curated botanical species for the garden',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  commonName: { type: Type.STRING },
                  botanicalName: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'Perennial, Shrub, Tree, Edible / Vegetable, Herb, Climber, Groundcover, or Ornamental Grass' },
                  zoneId: { type: Type.STRING, description: 'ID of the zone this plant belongs to' },
                  sunRequirement: { type: Type.STRING },
                  waterNeeds: { type: Type.STRING },
                  matureHeight: { type: Type.STRING },
                  matureSpread: { type: Type.STRING },
                  bloomSeason: { type: Type.STRING },
                  foliageColor: { type: Type.STRING },
                  flowerColor: { type: Type.STRING },
                  pollinatorFriendly: { type: Type.BOOLEAN },
                  companionPlants: { type: Type.ARRAY, items: { type: Type.STRING } },
                  landscapeRole: { type: Type.STRING },
                  careTip: { type: Type.STRING },
                  defaultVisualPrompt: { type: Type.STRING, description: 'Text prompt to render a photorealistic portrait of this plant' },
                },
                required: ['id', 'commonName', 'botanicalName', 'type', 'zoneId', 'sunRequirement', 'waterNeeds', 'matureHeight', 'matureSpread', 'careTip', 'defaultVisualPrompt'],
              },
            },
            hardscaping: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  material: { type: Type.STRING },
                  xPercent: { type: Type.NUMBER },
                  yPercent: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                },
                required: ['id', 'name', 'type', 'material', 'xPercent', 'yPercent', 'description'],
              },
            },
            companionPlantingMatrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  plantA: { type: Type.STRING },
                  plantB: { type: Type.STRING },
                  relationship: { type: Type.STRING },
                  benefitReason: { type: Type.STRING },
                },
                required: ['plantA', 'plantB', 'relationship', 'benefitReason'],
              },
            },
            seasonalGuide: {
              type: Type.OBJECT,
              properties: {
                spring: { type: Type.ARRAY, items: { type: Type.STRING } },
                summer: { type: Type.ARRAY, items: { type: Type.STRING } },
                autumn: { type: Type.ARRAY, items: { type: Type.STRING } },
                winter: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['spring', 'summer', 'autumn', 'winter'],
            },
            soilAndWateringStrategy: { type: Type.STRING },
            recommendedVisualPrompt: { type: Type.STRING },
          },
          required: ['title', 'style', 'summary', 'dimensions', 'zones', 'plants', 'hardscaping', 'companionPlantingMatrix', 'seasonalGuide', 'soilAndWateringStrategy', 'recommendedVisualPrompt'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, layout: parsed });
  } catch (error: any) {
    console.error('Error generating layout:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate garden layout',
    });
  }
});

/**
 * 2. Generate new garden visual or plant visual from text prompt
 */
app.post('/api/garden/generate-visual', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '16:9', imageSize = '1K' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required' });
    }

    const enhancedPrompt = `A high quality, photorealistic, professional garden landscape visual: ${prompt}. Natural soft outdoor lighting, rich foliage textures, vibrant botanical details, 4K crisp clarity.`;

    const imageUrl = await generateOrEditImage(
      [{ text: enhancedPrompt }],
      {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      }
    );

    res.json({ success: true, imageUrl, prompt });
  } catch (error: any) {
    console.error('Error in generate-visual:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image generation failed',
    });
  }
});

/**
 * 3. Edit existing garden visual using text prompt + base image
 */
app.post('/api/garden/edit-visual', async (req: Request, res: Response) => {
  try {
    const { imageBase64, prompt, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: 'Both imageBase64 and edit prompt are required' });
    }

    // Clean base64 string if it contains data URI header
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

    const parts = [
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      },
      {
        text: `Modify this garden image according to these specific landscape design instructions: ${prompt}. Maintain realistic lighting, seamless perspective, and cohesive botanical landscaping aesthetics.`,
      },
    ];

    const editedImageUrl = await generateOrEditImage(parts);
    res.json({ success: true, imageUrl: editedImageUrl, prompt });
  } catch (error: any) {
    console.error('Error in edit-visual:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image editing failed',
    });
  }
});

/**
 * 4. Ask Garden AI Expert for advice, troubleshooting, or plant combinations
 */
app.post('/api/garden/advice', async (req: Request, res: Response) => {
  try {
    const { question, gardenContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const contextStr = gardenContext
      ? `Current Garden Project Context:
Style: ${gardenContext.style || 'Custom'}
Dimensions: ${gardenContext.dimensions?.widthFt || 40}x${gardenContext.dimensions?.lengthFt || 60} ft
Plants present: ${gardenContext.plants?.map((p: any) => p.commonName).join(', ') || 'Various'}
Zones: ${gardenContext.zones?.map((z: any) => z.name).join(', ') || 'Mixed'}`
      : 'General garden design';

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `You are an expert master horticulturist and ecological garden consultant.
${contextStr}

User Question: ${question}

Provide actionable, practical, botanical advice formatted with clear markdown sections (bullet points, clear reasoning, ecological tips). Keep it warm, inspiring, and scientifically accurate.`,
      config: {
        systemInstruction: 'You are a warm, highly knowledgeable master gardener and ecological landscape designer.',
      },
    });

    res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error('Error getting garden advice:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get garden advice',
    });
  }
});

// Vite mounting in development & static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Verdant Garden Designer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
