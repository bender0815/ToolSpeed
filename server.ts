import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    })
  : null;

/**
 * Robust JSON extraction helper from AI text response
 */
function extractJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
  // Strip ```json or ``` code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  
  // Find first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Fallback ISO-Tool-Decoder if AI fails or no API key is set
 */
function fallbackToolDecoder(query: string): any {
  const q = query.toUpperCase().trim();
  let insertShape = 'C';
  let category = 'roughing_external';
  let cornerRadius = 0.8;
  let shank = '20x20 mm';
  let bladeWidth = 2.0;
  let isAluPolished = false;
  let toolMaterial = 'carbide';
  const isoClasses = ['P', 'M', 'K'];

  if (q.includes('CCMT') || q.includes('CCGT')) {
    insertShape = 'C';
    category = 'finishing_external';
    cornerRadius = 0.4;
    shank = '16x16 mm';
    if (q.includes('CCGT') || q.includes('AL')) {
      isAluPolished = true;
      isoClasses.unshift('N');
    }
  } else if (q.includes('DCMT') || q.includes('DCGT')) {
    insertShape = 'D';
    category = 'finishing_external';
    cornerRadius = 0.4;
    shank = '16x16 mm';
    if (q.includes('DCGT')) isAluPolished = true;
  } else if (q.includes('VBMT') || q.includes('VCGT') || q.includes('VNMG')) {
    insertShape = 'V';
    category = 'finishing_external';
    cornerRadius = 0.4;
    shank = '16x16 mm';
  } else if (q.includes('WNMG')) {
    insertShape = 'W';
    category = 'roughing_external';
    cornerRadius = 0.8;
  } else if (q.includes('TNMG') || q.includes('TCMT')) {
    insertShape = 'T';
    category = 'roughing_external';
    cornerRadius = 0.8;
  } else if (q.includes('MGMN') || q.includes('ABSTECH') || q.includes('MGEHR')) {
    insertShape = 'groove';
    category = 'parting_grooving';
    bladeWidth = 2.0;
    if (q.includes('300') || q.includes('3MM')) bladeWidth = 3.0;
  } else if (q.includes('SER') || q.includes('SEL') || q.includes('16ER') || q.includes('16IR')) {
    insertShape = 'thread';
    category = 'threading';
    cornerRadius = 0.1;
  } else if (q.includes('SCLCR') || q.includes('S16') || q.includes('S20') || q.includes('BOHR')) {
    category = 'boring_internal';
    shank = 'Ø16 mm';
  } else if (q.includes('HSS')) {
    toolMaterial = 'hss';
    insertShape = 'hss';
    category = 'hss_custom';
    cornerRadius = 0.4;
  }

  // Detect radius from 04, 08, 02
  if (q.includes('02') && !q.includes('020')) cornerRadius = 0.2;
  else if (q.includes('04')) cornerRadius = 0.4;
  else if (q.includes('08')) cornerRadius = 0.8;
  else if (q.includes('12')) cornerRadius = 1.2;

  return {
    name: query.trim(),
    category,
    holderDesignation: q.includes('SCLCR') || q.includes('MGEHR') || q.includes('DCLNR') ? query.trim() : '',
    insertDesignation: query.trim(),
    insertShape,
    toolMaterial,
    cornerRadiusMm: cornerRadius,
    bladeWidthMm: bladeWidth,
    shankSize: shank,
    suitableIsoClasses: isoClasses,
    isAluminumPolished: isAluPolished,
    notes: `ISO-Klassifiziert nach ${query.trim()}. Geeignet für Werkstattdrehbänke.`,
    recommendedVcCarbide: 160,
    recommendedFeed: 0.22,
  };
}

/**
 * Fallback Material-Decoder if AI fails or no API key is set
 */
function fallbackMaterialDecoder(query: string): any {
  const q = query.toLowerCase().trim();
  let group = 'steel';
  let isoClass = 'P';
  let kc = 1800;
  let hardness = 'ca. 180 HB';
  let cooling = 'KSS / Emulsion';
  let notes = 'Standard-Zerspanungswerkstoff.';

  if (q.includes('1.4301') || q.includes('1.4404') || q.includes('v2a') || q.includes('v4a') || q.includes('edelstahl') || q.includes('inox')) {
    group = 'stainless';
    isoClass = 'M';
    kc = 2100;
    hardness = 'ca. 210 HB';
    notes = 'Neigt zur Kaltverfestigung. Kontinuierlichen Schnittdruck halten, niemals im Schnitt verharren.';
  } else if (q.includes('alu') || q.includes('6060') || q.includes('6082') || q.includes('7075') || q.includes('2007') || q.includes('en-aw')) {
    group = 'aluminum';
    isoClass = 'N';
    kc = 750;
    hardness = '70-150 HB';
    cooling = 'Spiritus, Petroleum oder KSS';
    notes = 'Polierte HM-Wendeplatten mit scharfer Schneide verwenden, um Aufbauschneidenbildung zu verhindern.';
  } else if (q.includes('pom') || q.includes('peek') || q.includes('pa6') || q.includes('ptfe') || q.includes('kunststoff') || q.includes('delrin')) {
    group = 'plastics';
    isoClass = 'N';
    kc = 320;
    hardness = 'ca. 85 Shore D';
    cooling = 'Druckluft oder trocken';
    notes = 'Scharfe Schneide, mäßige Drehzahl und guter Spanabfluss, um Hitzeentwicklung und Schmelzen zu vermeiden.';
  } else if (q.includes('messing') || q.includes('bronze') || q.includes('kupfer') || q.includes('ms58') || q.includes('cuzn')) {
    group = 'brass_bronze';
    isoClass = 'N';
    kc = 950;
    hardness = 'ca. 120 HB';
    cooling = 'Trocken oder KSS';
    notes = 'Bei Messing Ms58 kurzer Bröckelspan, ideal für hohe Schnittgeschwindigkeiten.';
  } else if (q.includes('titan') || q.includes('inconel') || q.includes('hastelloy')) {
    group = 'special';
    isoClass = 'S';
    kc = 2500;
    hardness = 'ca. 320 HB';
    cooling = 'KSS / Emulsion (reichlich)';
    notes = 'Geringe Wärmeleitfähigkeit, niedrige Schnittgeschwindigkeit und reichliche Kühlung zwingend erforderlich.';
  } else if (q.includes('guss') || q.includes('gg') || q.includes('ggg') || q.includes('grauguss')) {
    group = 'cast_iron';
    isoClass = 'K';
    kc = 1300;
    hardness = 'ca. 200 HB';
    cooling = 'Trocken';
    notes = 'Kurzbrechender Span, abrasive Wirkung durch Graphit/Perlit.';
  }

  return {
    name: query.trim(),
    standardCode: query.trim(),
    shortDesc: `Benutzerdefinierter Werkstoff (${group})`,
    group,
    isoClass,
    kc1_1: kc,
    hardnessBrinell: hardness,
    cooling,
    notes,
    params: {
      carbide: {
        roughing: { vc: { min: 100, rec: 160, max: 220 }, f: { min: 0.15, rec: 0.25, max: 0.4 }, ap: { min: 1.0, rec: 2.0, max: 4.0 } },
        finishing: { vc: { min: 140, rec: 220, max: 300 }, f: { min: 0.05, rec: 0.1, max: 0.16 }, ap: { min: 0.2, rec: 0.5, max: 1.2 } },
        parting: { vc: { min: 70, rec: 110, max: 150 }, f: { min: 0.04, rec: 0.08, max: 0.12 }, ap: { min: 1.5, rec: 2.0, max: 3.0 } },
      },
      hss: {
        roughing: { vc: { min: 18, rec: 28, max: 38 }, f: { min: 0.12, rec: 0.2, max: 0.3 }, ap: { min: 0.8, rec: 1.5, max: 2.5 } },
        finishing: { vc: { min: 25, rec: 38, max: 55 }, f: { min: 0.04, rec: 0.08, max: 0.12 }, ap: { min: 0.2, rec: 0.4, max: 0.8 } },
        parting: { vc: { min: 12, rec: 20, max: 30 }, f: { min: 0.03, rec: 0.05, max: 0.08 }, ap: { min: 1.5, rec: 2.0, max: 2.5 } },
      },
    },
  };
}

/**
 * POST /api/assist/tool
 * Input: { query: string }
 */
app.post('/api/assist/tool', async (req, res) => {
  const { query } = req.body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'Query parameter is required' });
  }

  if (!ai) {
    // Fallback if no API key
    const fallback = fallbackToolDecoder(query);
    return res.json({ success: true, data: fallback, source: 'heuristic' });
  }

  try {
    const prompt = `You are an expert machining tool engineer and tooling specialist.
A machinist has provided a turning tool or carbide insert ISO code / manufacturer designation: "${query}".
Use Google Search to find catalog specifications from tool manufacturers (e.g. Sandvik Coromant, Walter Tools, Iscar, Seco, Hoffmann Garant, Kennametal, Kyocera, ISO 1832).

Extract the exact technical specs and return ONLY a valid JSON object (no markdown wrapping, or pure JSON):
{
  "name": string (Clear readable tool/insert name, e.g. "CNMG 120408-PR 4325"),
  "category": "roughing_external" | "finishing_external" | "parting_grooving" | "boring_internal" | "threading" | "hss_custom",
  "holderDesignation": string (Matching toolholder if applicable, e.g. "DCLNR 2020 K12", "SCLCR 1616 H09", or empty),
  "insertDesignation": string (ISO insert code, e.g. "CNMG 120408", "CCMT 060204", "MGMN 200-G"),
  "insertShape": "C" | "D" | "V" | "W" | "S" | "T" | "groove" | "thread" | "hss",
  "toolMaterial": "carbide" | "hss",
  "cornerRadiusMm": number (Corner radius in mm, e.g. 0.8, 0.4, 0.2, 1.2),
  "bladeWidthMm": number (Blade width in mm for grooving/parting inserts, or 2.0 default),
  "shankSize": string (Typical shank size for lathe, e.g. "20x20 mm", "16x16 mm", "12x12 mm", or "Ø16 mm" for boring bars),
  "suitableIsoClasses": Array<"P" | "M" | "K" | "N" | "S" | "H"> (e.g. ["P", "M"]),
  "isAluminumPolished": boolean (true if ground/polished rake face for aluminum/plastics like -AL, CCGT, DCGT),
  "notes": string (1-2 sentences practical workshop advice: chipbreaker type, application range, feed rate tip),
  "recommendedVcCarbide": number (typical vc in m/min for steel/main application),
  "recommendedFeed": number (typical f in mm/rev)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';
    let parsedData = null;
    try {
      parsedData = extractJsonFromText(responseText);
    } catch (parseErr) {
      console.warn('Failed to parse GenAI JSON for tool, using fallback:', parseErr);
      parsedData = fallbackToolDecoder(query);
    }

    // Sanitize and validate essential fields
    if (!parsedData.name) parsedData.name = query;
    if (!parsedData.category) parsedData.category = 'roughing_external';
    if (!parsedData.cornerRadiusMm && parsedData.cornerRadiusMm !== 0) parsedData.cornerRadiusMm = 0.8;
    if (!parsedData.shankSize) parsedData.shankSize = '20x20 mm';
    if (!Array.isArray(parsedData.suitableIsoClasses) || parsedData.suitableIsoClasses.length === 0) {
      parsedData.suitableIsoClasses = ['P', 'M'];
    }

    return res.json({ success: true, data: parsedData, source: 'gemini_search' });
  } catch (error: any) {
    console.error('Error in /api/assist/tool:', error);
    const fallback = fallbackToolDecoder(query);
    return res.json({ success: true, data: fallback, source: 'fallback_error', error: error.message });
  }
});

/**
 * POST /api/assist/material
 * Input: { query: string }
 */
app.post('/api/assist/material', async (req, res) => {
  const { query } = req.body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'Query parameter is required' });
  }

  if (!ai) {
    const fallback = fallbackMaterialDecoder(query);
    return res.json({ success: true, data: fallback, source: 'heuristic' });
  }

  try {
    const prompt = `You are a world-class metallurgist and lathe machining parameters specialist.
A lathe operator needs complete cutting data and material characteristics for: "${query}".
Use Google Search to find material standards (DIN / EN / ISO / AISI), mechanical properties (tensile strength, hardness), and recommended turning cutting speeds (vc in m/min), feeds (f in mm/rev), and depths of cut (ap in mm) for workshop lathes.

Extract the data and return ONLY a valid JSON object matching this schema:
{
  "name": string (Official and common name, e.g. "1.4404 (X2CrNiMo17-12-2 / V4A / AISI 316L)", "42CrMo4+QT (1.7225)"),
  "standardCode": string (e.g. "1.4404 / AISI 316L", "1.7225 / 42CrMo4"),
  "shortDesc": string (one concise sentence describing the material and machinability in a workshop),
  "group": "plastics" | "aluminum" | "steel" | "stainless" | "brass_bronze" | "cast_iron" | "special",
  "isoClass": "P" | "M" | "K" | "N" | "S" | "H",
  "kc1_1": number (Specific cutting force kc1.1 in N/mm²: typical ~1800 for mild steel, ~2100 for stainless, ~750 for alu, ~300 for plastic, ~2500 for titanium),
  "hardnessBrinell": string (e.g. "ca. 210 HB", "280-320 HB", "85 Shore D"),
  "cooling": string (e.g. "KSS / Emulsion (reichlich)", "Druckluft oder trocken", "Spiritus / Petroleum"),
  "notes": string (Important workshop machinist tips: chip breaking, avoiding work hardening, heat control),
  "params": {
    "carbide": {
      "roughing": { "vc": { "min": number, "rec": number, "max": number }, "f": { "min": number, "rec": number, "max": number }, "ap": { "min": number, "rec": number, "max": number } },
      "finishing": { "vc": { "min": number, "rec": number, "max": number }, "f": { "min": number, "rec": number, "max": number }, "ap": { "min": number, "rec": number, "max": number } },
      "parting": { "vc": { "min": number, "rec": number, "max": number }, "f": { "min": number, "rec": number, "max": number }, "ap": { "min": number, "rec": number, "max": number } }
    },
    "hss": {
      "roughing": { "vc": { "min": number, "rec": number, "max": number }, "f": { "min": number, "rec": number, "max": number }, "ap": { "min": number, "rec": number, "max": number } },
      "finishing": { "vc": { "min": number, "rec": number, "max": number }, "f": { "min": number, "rec": number, "max": number }, "ap": { "min": number, "rec": number, "max": number } },
      "parting": { "vc": { "min": number, "rec": number, "max": number }, "f": { "min": number, "rec": number, "max": number }, "ap": { "min": number, "rec": number, "max": number } }
    }
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';
    let parsedData = null;
    try {
      parsedData = extractJsonFromText(responseText);
    } catch (parseErr) {
      console.warn('Failed to parse GenAI JSON for material, using fallback:', parseErr);
      parsedData = fallbackMaterialDecoder(query);
    }

    if (!parsedData.name) parsedData.name = query;
    if (!parsedData.standardCode) parsedData.standardCode = query;
    if (!parsedData.group) parsedData.group = 'steel';
    if (!parsedData.isoClass) parsedData.isoClass = 'P';
    if (!parsedData.kc1_1) parsedData.kc1_1 = 1800;
    if (!parsedData.params) parsedData = fallbackMaterialDecoder(query);

    return res.json({ success: true, data: parsedData, source: 'gemini_search' });
  } catch (error: any) {
    console.error('Error in /api/assist/material:', error);
    const fallback = fallbackMaterialDecoder(query);
    return res.json({ success: true, data: fallback, source: 'fallback_error', error: error.message });
  }
});

// Setup Vite middleware for development or serve dist for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DrehSpeed server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
