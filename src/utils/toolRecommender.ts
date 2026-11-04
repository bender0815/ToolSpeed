import { Material, OperationType, ToolType, WorkshopTool, ToolRecommendation, DualRecommendationResult } from '../types/machining';

export function rankToolsForJob(
  material: Material,
  diameter: number,
  operation: OperationType,
  preferredToolType: ToolType,
  tools: WorkshopTool[]
): ToolRecommendation[] {
  if (!tools || tools.length === 0) return [];

  const recommendations: ToolRecommendation[] = tools.map((tool) => {
    let score = 50;
    const reasons: string[] = [];
    const drawbacks: string[] = [];

    const isAluOrPlastic = material.group === 'aluminum' || material.group === 'plastics' || material.group === 'brass_bronze';
    const isStainless = material.group === 'stainless';
    const isThinPart = diameter <= 14;

    // 1. Tool Material Match (HM vs HSS)
    if (tool.toolMaterial === preferredToolType) {
      score += 10;
      reasons.push(
        tool.toolMaterial === 'carbide'
          ? 'Hartmetall (HM) für moderne Schnittgeschwindigkeiten'
          : 'HSS für weichen, schwingungsarmen Schnitt'
      );
    } else {
      score -= 15;
      drawbacks.push(
        `Werkzeug ist ${tool.toolMaterial.toUpperCase()}, gewünscht ist ${preferredToolType.toUpperCase()}`
      );
    }

    // 2. Operation Matching
    if (operation === 'parting') {
      if (tool.category === 'parting_grooving') {
        score += 45;
        reasons.push(`Spezialisiertes Abstechwerkzeug mit ${tool.bladeWidthMm ?? 2.0} mm Stechbreite`);
        if ((tool.bladeWidthMm ?? 2.0) <= 2.2) {
          reasons.push('Schmale Klinge reduziert Schnittkräfte beim Abstechen');
        }
      } else {
        score -= 60;
        drawbacks.push('Kein Abstechwerkzeug – nicht zum Abstechen geeignet');
      }
    } else if (operation === 'roughing') {
      if (tool.category === 'parting_grooving') {
        score -= 50;
        drawbacks.push('Abstechmeißel ist nicht für Längsschruppen ausgelegt');
      } else if (tool.category === 'boring_internal') {
        score -= 40;
        drawbacks.push('Innen-Bohrstange – primär für Innenbearbeitung ab Bohrungs-Ø 16 mm konstruiert');
      } else if (tool.category === 'threading') {
        score -= 50;
        drawbacks.push('Gewindedrehstahl – Spezialprofil nicht zum Längsschruppen geeignet');
      } else if (tool.category === 'roughing_external') {
        score += 35;
        reasons.push('Stabile Schruppgeometrie für hohe Spanabnahme und Standzeit');
      } else if (tool.category === 'finishing_external') {
        score += 18;
        reasons.push('Kann schruppen, Schneidecke ist jedoch empfindlicher als bei reinem Schruppstahl');
      }

      // Corner radius for roughing
      if (!isThinPart && tool.cornerRadiusMm >= 0.8) {
        score += 15;
        reasons.push(`Robuster Eckenradius r=${tool.cornerRadiusMm}mm hält hoher Schnitttiefe ap stand`);
      } else if (isThinPart && tool.cornerRadiusMm <= 0.4) {
        score += 15;
        reasons.push(`Kleiner Eckenradius r=${tool.cornerRadiusMm}mm verhindert Durchbiegen bei Ø${diameter}mm`);
      } else if (!isThinPart && tool.cornerRadiusMm <= 0.4) {
        // Works well on small/medium lathes
        score += 8;
        reasons.push(`Eckenradius r=${tool.cornerRadiusMm}mm schont kleinere Werkstatt-Drehbänke`);
      }

      // Insert shape stability
      if (tool.insertShape === 'C' || tool.insertShape === 'W' || tool.insertShape === 'S') {
        score += 10;
        reasons.push(`Stabiler 80°-Spitzenwinkel (${tool.insertShape}) für maximale Schneidkantenbelastbarkeit`);
      }
    } else if (operation === 'finishing') {
      if (tool.category === 'parting_grooving') {
        score -= 50;
        drawbacks.push('Abstechmeißel nicht für Längsschlichten geeignet');
      } else if (tool.category === 'boring_internal') {
        score -= 40;
        drawbacks.push('Innen-Bohrstange – primär für Innenbearbeitung ab Bohrungs-Ø 16 mm konstruiert');
      } else if (tool.category === 'threading') {
        score -= 50;
        drawbacks.push('Gewindedrehstahl – Spezialprofil nicht zum Schlichten geeignet');
      } else if (tool.category === 'finishing_external') {
        score += 35;
        reasons.push('Schlicht- und Kopiergeometrie für beste Oberflächengüte Ra');
      } else if (tool.category === 'roughing_external') {
        score += 10;
        reasons.push('Schlichten möglich, Schlichtstahl bringt jedoch feineres Oberflächenfinish');
      }

      // Sharp insert shapes for finishing
      if (tool.insertShape === 'D' || tool.insertShape === 'V') {
        score += 15;
        reasons.push(`Schlanker Spitzenwinkel (${tool.insertShape}) für geringe Passivkräfte und Konturfreiheit`);
      }

      // Small corner radius for finishing
      if (tool.cornerRadiusMm <= 0.4) {
        score += 15;
        reasons.push(`Feiner Eckenradius r=${tool.cornerRadiusMm}mm erzeugt geringe Rauhtiefe Rz`);
      }
    }

    // 3. Material ISO Matching
    if (tool.suitableIsoClasses.includes(material.isoClass)) {
      score += 20;
      reasons.push(`Schneidstoff/Beschichtung ausgelegt für ISO ${material.isoClass} (${material.name.split(' ')[0]})`);
    } else {
      score -= 20;
      drawbacks.push(`Nicht primär ausgelegt für ISO ${material.isoClass} (${material.name.split(' ')[0]})`);
    }

    // 4. Aluminum / Plastics Polish Check
    if (isAluOrPlastic) {
      if (tool.isAluminumPolished) {
        score += 25;
        reasons.push('Hochglanzpolierte Spanmulde verhindert Aufbauschneiden und Schmieren');
      } else if (tool.toolMaterial === 'carbide') {
        score -= 15;
        drawbacks.push('Keine polierte Spanmulde – kann bei Alu/Kunststoff zum Schmieren neigen');
      }
    }

    // 5. Stainless Steel Check
    if (isStainless) {
      if (tool.insertShape === 'D' || tool.cornerRadiusMm <= 0.4) {
        score += 10;
        reasons.push('Scharfe Geometrie verhindert schädliches Reiben bei Edelstahl (V2A/V4A)');
      }
    }

    // Clamp score
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    let verdict: ToolRecommendation['verdict'] = 'ungeeignet';
    if (finalScore >= 80) verdict = 'optimal';
    else if (finalScore >= 60) verdict = 'gut';
    else if (finalScore >= 35) verdict = 'bedingt';

    const isHolderOwned = tool.isHolderOwned ?? tool.isOwned;
    const isInsertOwned = tool.isInsertOwned ?? tool.isOwned;

    let insertTip = '';
    if (isAluOrPlastic && tool.isAluminumPolished) {
      insertTip = 'Hochglanzpolierte Spanmulde verhindert Aufbauschneiden & Materialaufschweißung.';
    } else if (operation === 'roughing') {
      insertTip = `Stabile Schneidkante mit r=${tool.cornerRadiusMm}mm für hohe Spantiefe ap.`;
    } else if (operation === 'finishing') {
      insertTip = `Feine Schneidecke r=${tool.cornerRadiusMm}mm für beste Oberflächengüte Ra.`;
    } else if (operation === 'parting') {
      insertTip = `Präziser Stecheinsatz (${tool.bladeWidthMm ?? 2.0}mm) für minimalen Schnittdruck.`;
    } else {
      insertTip = `Standard-Wendeplatte für Werkstoffgruppe ISO ${material.isoClass}.`;
    }

    let holderTip = '';
    if (tool.inToolPost) {
      holderTip = 'Bereits im Schnellwechselhalter (Multifix) eingespannt & ausgerichtet!';
    } else if (isHolderOwned) {
      holderTip = `Halter im Werkstattbestand (${tool.shankSize}) vorhanden.`;
    } else {
      holderTip = `Passender Drehstahlhalter (${tool.shankSize}) erforderlich.`;
    }

    return {
      tool,
      score: finalScore,
      verdict,
      reasons,
      drawbacks: drawbacks.length > 0 ? drawbacks : undefined,
      isOwned: Boolean(tool.isOwned),
      recommendedInsert: {
        designation: tool.insertDesignation,
        shape: tool.insertShape,
        cornerRadiusMm: tool.cornerRadiusMm,
        bladeWidthMm: tool.bladeWidthMm,
        isPolished: tool.isAluminumPolished,
        isOwned: isInsertOwned,
        tip: insertTip,
      },
      matchingHolder: {
        designation: tool.holderDesignation || tool.name,
        shankSize: tool.shankSize,
        inToolPost: tool.inToolPost,
        isOwned: isHolderOwned,
        tip: holderTip,
      },
    };
  });

  // Sort descending by score
  return recommendations.sort((a, b) => b.score - a.score);
}

export function getDualToolRecommendation(
  material: Material,
  diameter: number,
  operation: OperationType,
  preferredToolType: ToolType,
  tools: WorkshopTool[]
): DualRecommendationResult {
  const ranked = rankToolsForJob(material, diameter, operation, preferredToolType, tools);

  const allOwned = ranked.filter((r) => r.isOwned);
  const allUnowned = ranked.filter((r) => !r.isOwned);

  const bestOwned = allOwned[0];
  const bestOverall = ranked[0];

  let hasBetterUnownedAlternative = false;
  let scoreDifference = 0;
  let upgradeRationale: string | undefined;

  if (bestOverall && !bestOverall.isOwned) {
    if (!bestOwned) {
      hasBetterUnownedAlternative = true;
      scoreDifference = bestOverall.score;
      upgradeRationale = `Du hast kein passendes Werkzeug für ${operation === 'parting' ? 'Abstechen' : operation === 'finishing' ? 'Schlichten' : 'Schruppen'} im Bestand. ${bestOverall.tool.name} wäre ideal.`;
    } else {
      scoreDifference = bestOverall.score - bestOwned.score;
      if (scoreDifference >= 12 || (bestOwned.score < 70 && bestOverall.score >= 82)) {
        hasBetterUnownedAlternative = true;

        if (operation === 'parting' && bestOwned.tool.category !== 'parting_grooving') {
          upgradeRationale = `In deinem Bestand fehlt ein Abstechhalter. ${bestOverall.tool.name} trennt das Werkstück ohne Verkanten und mit minimalem Spanungsdruck ab.`;
        } else if ((material.group === 'aluminum' || material.group === 'plastics') && !bestOwned.tool.isAluminumPolished && bestOverall.tool.isAluminumPolished) {
          upgradeRationale = `Dein vorhandenes Werkzeug hat keine polierte Spanmulde. ${bestOverall.tool.name} verhindert Aufbauschneiden und erzeugt spiegelglatte Oberflächen.`;
        } else if (operation === 'roughing' && bestOverall.tool.cornerRadiusMm >= 0.8 && bestOwned.tool.cornerRadiusMm <= 0.4 && diameter >= 30) {
          upgradeRationale = `Dein vorhandenes Werkzeug hat r=0.4mm. Ein Schruppmeißel mit r=0.8mm (${bestOverall.tool.name}) erlaubt bis zu 60% mehr Schnitttiefe ap ohne Schneidkantenbruch.`;
        } else {
          upgradeRationale = `${bestOverall.tool.name} bietet mit ${bestOverall.score}% Match eine spürbar bessere Geometrie für diesen Job als dein bestes vorhandenes Werkzeug (${bestOwned.score}%).`;
        }
      }
    }
  }

  // Find other owned tools that are equally or nearly equally suitable (within 5 points and >= 50% score)
  const equallySuitableOwned = bestOwned
    ? allOwned.filter(
        (r) =>
          r.tool.id !== bestOwned.tool.id &&
          bestOwned.score - r.score <= 5 &&
          r.score >= 50
      )
    : [];

  return {
    bestOwned,
    bestOverall,
    hasBetterUnownedAlternative,
    scoreDifference,
    upgradeRationale,
    allOwned,
    allUnowned,
    equallySuitableOwned,
  };
}

export function getToolsComparisonNote(toolA: WorkshopTool, toolB: WorkshopTool): string {
  const parts: string[] = [];

  // Shape differences (e.g. C vs D)
  if (toolA.insertShape !== toolB.insertShape) {
    if (toolA.insertShape === 'C' && toolB.insertShape === 'D') {
      parts.push(`SCLCR (80° C-Platte) bietet maximale Stabilität für Längsschnitte; SDJCR (55° D-Platte) erlaubt engere Konturen, Absätze und 93°-Planfasen.`);
    } else if (toolA.insertShape === 'D' && toolB.insertShape === 'C') {
      parts.push(`SDJCR (55° D-Platte) bietet Kontur- und Kopierfreiheit; SCLCR (80° C-Platte) hat höhere Schnittkantenstabilität.`);
    } else {
      parts.push(`Unterschiedliche Schneidplattenformen (${toolA.insertShape} vs. ${toolB.insertShape}).`);
    }
  }

  // Polish / Coating differences
  if (toolA.isAluminumPolished !== toolB.isAluminumPolished) {
    if (toolA.isAluminumPolished) {
      parts.push(`Die polierte Platte (AK-A) verhindert Schmieren bei Alu/NE-Metallen; die beschichtete Platte ist für Stahl/Guss ausgelegt.`);
    } else {
      parts.push(`Die polierte Variante (AK-A) verhindert Schmieren und Aufbauschneiden.`);
    }
  }

  // Radius differences
  if (toolA.cornerRadiusMm !== toolB.cornerRadiusMm) {
    parts.push(`Radius r=${toolA.cornerRadiusMm}mm vs r=${toolB.cornerRadiusMm}mm (kleiner = geringere Passivkräfte, größer = belastbarere Schneide).`);
  }

  if (parts.length === 0) {
    return 'Beide Werkzeuge sind praktisch gleichwertig. Wähle das Werkzeug, das bereits im Stahlhalter eingespannt ist.';
  }

  return parts.join(' ');
}
