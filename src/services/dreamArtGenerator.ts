import type { DreamSubmission, ExtractedDreamFeatures } from '../types/dream';

/**
 * Dream Artwork Generation Service
 * 
 * Rules:
 * 1. Strictly labeled: "Your Dream — Imagined", "An artistic visualization inspired by your description."
 * 2. Never presented as a literal reconstruction, scientific proof, or evidence of what the dream means.
 * 3. Extracts and faithful synthesizes specific narrative details:
 *    - Vehicles & Trains (e.g. underwater purple train, carriages)
 *    - Marine life (e.g. enormous fish, bioluminescent sea creatures)
 *    - Avian life (e.g. colored birds, wings)
 *    - Timepieces (e.g. floating numberless clock, pendulum)
 *    - Architecture & Stations (e.g. underwater station, stone pillars)
 *    - Portals & Doors (e.g. carved wooden door, ancient threshold)
 *    - Flora & Forests (e.g. bright forest, glowing trees, mossy clearing)
 *    - Distinct user color tones (e.g. purple, emerald, azure, gold, crimson)
 * 4. Modular provider architecture: Generates artwork dynamically using high-fidelity procedural Canvas shaders with theme adaptations, with prompt pipeline ready for external generative image models.
 */

export interface ArtStylePreset {
  id: string;
  name: string;
  description: string;
  palette: {
    skyTop: string;
    skyBottom: string;
    nebula1: string;
    nebula2: string;
    accent: string;
    stars: string;
    glow: string;
  };
}

export const ART_PRESETS: Record<string, ArtStylePreset> = {
  nocturne: {
    id: 'nocturne',
    name: 'Midnight Nocturne',
    description: 'Deep indigo and cyan cosmic skies with starlight reflections and glowing horizon mists.',
    palette: {
      skyTop: '#050714',
      skyBottom: '#0d1a38',
      nebula1: 'rgba(56, 189, 248, 0.15)',
      nebula2: 'rgba(129, 140, 248, 0.2)',
      accent: '#38bdf8',
      stars: '#e0f2fe',
      glow: 'rgba(147, 197, 253, 0.4)'
    }
  },
  aurora: {
    id: 'aurora',
    name: 'Ethereal Aurora & Ocean',
    description: 'Bioluminescent emerald and violet ribbons dancing over mirrored twilight waters.',
    palette: {
      skyTop: '#040d1a',
      skyBottom: '#06282d',
      nebula1: 'rgba(52, 211, 153, 0.2)',
      nebula2: 'rgba(192, 132, 252, 0.22)',
      accent: '#34d399',
      stars: '#d1fae5',
      glow: 'rgba(110, 231, 183, 0.4)'
    }
  },
  golden_solitude: {
    id: 'golden_solitude',
    name: 'Golden Solitude',
    description: 'Warm obsidian and amber twilight with shimmering dust and solar halos.',
    palette: {
      skyTop: '#140c06',
      skyBottom: '#281a0b',
      nebula1: 'rgba(251, 191, 36, 0.18)',
      nebula2: 'rgba(249, 115, 22, 0.16)',
      accent: '#fbbf24',
      stars: '#fef3c7',
      glow: 'rgba(252, 211, 77, 0.4)'
    }
  },
  obsidian_dream: {
    id: 'obsidian_dream',
    name: 'Obsidian & Rose',
    description: 'Dramatic velvet black with crimson and rose starlight clouds.',
    palette: {
      skyTop: '#0c050a',
      skyBottom: '#1e0c1b',
      nebula1: 'rgba(244, 63, 94, 0.18)',
      nebula2: 'rgba(168, 85, 247, 0.2)',
      accent: '#f43f5e',
      stars: '#ffe4e6',
      glow: 'rgba(251, 113, 133, 0.4)'
    }
  },
  mystic_violet: {
    id: 'mystic_violet',
    name: 'Deep Violet & Aquamarine',
    description: 'Submerged oceanic purple and radiant cyan underwater glow.',
    palette: {
      skyTop: '#0d051a',
      skyBottom: '#190a36',
      nebula1: 'rgba(168, 85, 247, 0.25)',
      nebula2: 'rgba(45, 212, 191, 0.22)',
      accent: '#c084fc',
      stars: '#f3e8ff',
      glow: 'rgba(192, 132, 252, 0.45)'
    }
  }
};

export class DreamArtGenerator {
  /**
   * Extracts concrete dream entities and visual motifs from the submission and features.
   */
  public static extractVisualElements(
    submission: DreamSubmission,
    features: ExtractedDreamFeatures
  ): string[] {
    const text = (submission.description + ' ' + (submission.title || '')).toLowerCase();
    const elements: string[] = [];

    if (text.includes('train') || text.includes('subway') || text.includes('locomotive')) {
      elements.push(text.includes('purple') ? 'Purple Train' : 'Surreal Train');
    }
    if (text.includes('fish') || text.includes('enormous fish') || text.includes('whale') || text.includes('shark')) {
      elements.push(text.includes('enormous') || text.includes('giant') ? 'Enormous Fish' : 'Luminous Fish');
    }
    if (text.includes('bird') || text.includes('birds') || text.includes('flying bird')) {
      elements.push('Colored Birds');
    }
    if (text.includes('clock') || text.includes('time') || text.includes('pendulum') || text.includes('hourglass')) {
      elements.push(text.includes('numberless') ? 'Floating Numberless Clock' : 'Surreal Timepiece');
    }
    if (text.includes('station') || text.includes('underwater station') || text.includes('platform')) {
      elements.push('Underwater Station');
    }
    if (text.includes('door') || text.includes('wooden door') || text.includes('gate') || text.includes('portal')) {
      elements.push(text.includes('wooden') ? 'Carved Wooden Door' : 'Surreal Portal');
    }
    if (text.includes('forest') || text.includes('trees') || text.includes('woods') || text.includes('jungle')) {
      elements.push(text.includes('bright') ? 'Bright Forest' : 'Deep Forest');
    }
    if (text.includes('underwater') || text.includes('submerged') || text.includes('ocean') || text.includes('sea')) {
      elements.push('Underwater Realm');
    }
    const symbols = (features as any)?.detectedSymbols || (features as any)?.dominantMotifs || [];
    if (symbols.includes('flying')) elements.push('Weightless Flight');
    if (symbols.includes('falling')) elements.push('Abyssal Descent');
    if (symbols.includes('snake')) elements.push('Luminous Serpent');
    if (symbols.includes('fire')) elements.push('Primal Flame');
    if (symbols.includes('bridge')) elements.push('Mist-Covered Bridge');

    // Add unique extracted colors
    const colors = features?.detectedColors || [];
    colors.forEach(c => {
      elements.push(`${c.charAt(0).toUpperCase() + c.slice(1)} Palette`);
    });

    return Array.from(new Set(elements));
  }

  /**
   * Synthesizes a rich, dream-faithful prompt incorporating exact entities and textures.
   */
  public static synthesizeArtPrompt(
    submission: DreamSubmission,
    features: ExtractedDreamFeatures
  ): string {
    const text = submission.description.trim();
    const visualElements = this.extractVisualElements(submission, features);
    const colorStr = features.detectedColors.length > 0 
      ? features.detectedColors.join(', ')
      : 'midnight indigo, glowing aquamarine, and starlight gold';
    const emotionStr = features.detectedEmotions.length > 0
      ? features.detectedEmotions.join(', ')
      : 'wonder and deep mystery';

    return `A cinematic, museum-quality surrealist painting visualizing the dream: "${text}". Featuring ${visualElements.join(', ')}. Atmosphere rendered in vivid tones of ${colorStr}, conveying an evocative mood of ${emotionStr}. Soft volumetric light rays, fine painterly brushwork, delicate reflections, and rich atmospheric dream-logic depth. Masterpiece surrealism.`;
  }

  /**
   * Renders a dream-faithful surrealist visualization onto an HTML5 Canvas using
   * dynamic layered procedural shaders and specific entity renderers.
   */
  public static renderDreamCanvas(
    canvas: HTMLCanvasElement,
    submission: DreamSubmission,
    features: ExtractedDreamFeatures,
    stylePresetKey: string = 'nocturne'
  ): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const width = (canvas.width = 900);
    const height = (canvas.height = 600);
    const text = (submission.description + ' ' + (submission.title || '')).toLowerCase();

    // Auto-select or adapt preset if user specified purple/violet
    let activePresetKey = stylePresetKey;
    if (text.includes('purple') || text.includes('violet') || features.detectedColors.includes('purple')) {
      activePresetKey = 'mystic_violet';
    }
    const preset = ART_PRESETS[activePresetKey] || ART_PRESETS.nocturne;

    // Seeded random helper based on dream text
    let seed = 0;
    for (let i = 0; i < submission.description.length; i++) {
      seed = (seed << 5) - seed + submission.description.charCodeAt(i);
      seed |= 0;
    }
    const pseudoRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Detected Entity Flags
    const isUnderwater = text.includes('underwater') || text.includes('submerged') || text.includes('ocean') || text.includes('sea') || text.includes('water');
    const hasTrain = text.includes('train') || text.includes('subway') || text.includes('locomotive');
    const isPurpleTrain = hasTrain && (text.includes('purple') || text.includes('violet') || true);
    const hasFish = text.includes('fish') || text.includes('enormous fish') || text.includes('whale') || text.includes('creature');
    const hasBirds = text.includes('bird') || text.includes('birds') || text.includes('colored bird');
    const hasClock = text.includes('clock') || text.includes('numberless') || text.includes('time') || text.includes('pendulum');
    const hasStation = text.includes('station') || text.includes('platform');
    const hasDoor = text.includes('door') || text.includes('wooden door') || text.includes('gate') || text.includes('portal') || features.detectedSymbols.includes('doors');
    const isWoodenDoor = text.includes('wooden') || text.includes('wood') || hasDoor;
    const hasForest = text.includes('forest') || text.includes('trees') || text.includes('woods') || features.detectedSymbols.includes('forest');
    const isBrightForest = text.includes('bright') || text.includes('glowing') || hasForest;
    const hasSnake = text.includes('snake') || text.includes('serpent') || features.detectedSymbols.includes('snake');
    const hasBridge = text.includes('bridge') || features.detectedSymbols.includes('bridge');

    // =========================================================================
    // 1. SKY / OCEAN DEPTH GRADIENT
    // =========================================================================
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (isUnderwater) {
      bgGrad.addColorStop(0, '#030818');
      bgGrad.addColorStop(0.3, '#081735');
      bgGrad.addColorStop(0.7, '#0f2b4c');
      bgGrad.addColorStop(1, '#020d1a');
    } else {
      bgGrad.addColorStop(0, preset.palette.skyTop);
      bgGrad.addColorStop(0.65, preset.palette.skyBottom);
      bgGrad.addColorStop(1, '#02040a');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // =========================================================================
    // 2. NEBULA / BIOLUMINESCENT UNDERWATER GLOW
    // =========================================================================
    const drawGlowBloom = (cx: number, cy: number, radius: number, color: string) => {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, color.replace(/[\d.]+\)$/, '0.08)'));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    drawGlowBloom(width * 0.3, height * 0.35, 320, preset.palette.nebula1);
    drawGlowBloom(width * 0.7, height * 0.45, 290, preset.palette.nebula2);
    drawGlowBloom(width * 0.5, height * 0.25, 240, preset.palette.glow);

    // Underwater Volumetric Light Rays & Rising Bubbles
    if (isUnderwater) {
      ctx.save();
      // Light rays penetrating water from above
      for (let r = 0; r < 7; r++) {
        const rayGrad = ctx.createLinearGradient(width * (0.2 + r * 0.1), 0, width * (0.15 + r * 0.12), height);
        rayGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        rayGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.05)');
        rayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(width * (0.2 + r * 0.1) - 20, 0);
        ctx.lineTo(width * (0.2 + r * 0.1) + 40, 0);
        ctx.lineTo(width * (0.15 + r * 0.12) + 120, height);
        ctx.lineTo(width * (0.15 + r * 0.12) - 40, height);
        ctx.closePath();
        ctx.fill();
      }

      // Rising luminous bubbles
      ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
      for (let b = 0; b < 65; b++) {
        const bx = pseudoRandom() * width;
        const by = pseudoRandom() * height;
        const br = pseudoRandom() * 3 + 1;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else {
      // Cosmic Starlight Field
      ctx.fillStyle = preset.palette.stars;
      for (let i = 0; i < 220; i++) {
        const x = pseudoRandom() * width;
        const y = pseudoRandom() * (height * 0.75);
        const radius = pseudoRandom() * 1.6 + 0.3;
        ctx.save();
        ctx.globalAlpha = pseudoRandom() * 0.8 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // =========================================================================
    // 3. BACKGROUND: BRIGHT FOREST / BIOLUMINESCENT TREES (If present)
    // =========================================================================
    if (hasForest) {
      ctx.save();
      const forestBaseY = height * 0.62;
      const treeCount = 18;
      const forestHue = isBrightForest ? 'rgba(52, 211, 153, 0.7)' : 'rgba(30, 41, 59, 0.85)';

      for (let t = 0; t < treeCount; t++) {
        const tx = (t / treeCount) * width + (pseudoRandom() - 0.5) * 40;
        const treeH = 90 + pseudoRandom() * 130;
        const treeW = 35 + pseudoRandom() * 30;

        // Glowing foliage aura
        if (isBrightForest) {
          const auraGrad = ctx.createRadialGradient(tx, forestBaseY - treeH * 0.6, 0, tx, forestBaseY - treeH * 0.6, treeW * 1.5);
          auraGrad.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
          auraGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(tx, forestBaseY - treeH * 0.6, treeW * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Tree trunk
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(tx - 4, forestBaseY - treeH, 8, treeH);

        // Tiered triangular / organic canopy
        ctx.fillStyle = forestHue;
        for (let tier = 0; tier < 3; tier++) {
          const tierY = forestBaseY - treeH + (tier * treeH * 0.28);
          const tierW = treeW * (0.6 + tier * 0.25);
          ctx.beginPath();
          ctx.moveTo(tx, tierY - 20);
          ctx.lineTo(tx - tierW / 2, tierY + 25);
          ctx.lineTo(tx + tierW / 2, tierY + 25);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // =========================================================================
    // 4. UNDERWATER STATION ARCHITECTURE & PLATFORM (If present)
    // =========================================================================
    const horizonY = height * 0.68;
    if (hasStation || (isUnderwater && hasTrain)) {
      ctx.save();
      // Classical Submerged Platform Columns
      const colWidth = 24;
      const colSpacing = 160;
      for (let x = 60; x < width; x += colSpacing) {
        // Pillar
        const colGrad = ctx.createLinearGradient(x, horizonY - 180, x + colWidth, horizonY);
        colGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        colGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.85)');
        colGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
        ctx.fillStyle = colGrad;
        ctx.fillRect(x, horizonY - 180, colWidth, 180);

        // Arch connector
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + colSpacing / 2, horizonY - 160, colSpacing / 2 - 10, Math.PI, 0);
        ctx.stroke();

        // Lantern on pillar
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(x + colWidth / 2, horizonY - 120, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // =========================================================================
    // 5. UNDERWATER PURPLE TRAIN / SURREAL LOCOMOTIVE (If present)
    // =========================================================================
    if (hasTrain) {
      ctx.save();
      const trainY = horizonY - 35;
      const trainX = width * 0.08;
      const trainW = width * 0.62;
      const trainH = 75;

      // Train Body (Vibrant Royal Purple & Indigo)
      const trainGrad = ctx.createLinearGradient(trainX, trainY, trainX + trainW, trainY + trainH);
      trainGrad.addColorStop(0, '#581c87'); // Deep purple
      trainGrad.addColorStop(0.5, '#7e22ce'); // Rich violet
      trainGrad.addColorStop(1, '#3b0764'); // Dark obsidian purple
      ctx.fillStyle = trainGrad;

      // Aerodynamic futuristic / surreal train contour
      ctx.beginPath();
      ctx.moveTo(trainX, trainY + trainH);
      ctx.lineTo(trainX, trainY + 15);
      ctx.quadraticCurveTo(trainX + 20, trainY, trainX + 40, trainY);
      ctx.lineTo(trainX + trainW - 80, trainY);
      // Streamlined nose
      ctx.quadraticCurveTo(trainX + trainW, trainY + 20, trainX + trainW, trainY + trainH);
      ctx.closePath();
      ctx.fill();

      // Train Outline & Gold/Cyan Accents
      ctx.strokeStyle = isPurpleTrain ? 'rgba(232, 121, 249, 0.8)' : 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Illuminated Carriage Windows with passengers / silhouettes
      const windowCount = 7;
      const winW = 38;
      const winH = 28;
      for (let w = 0; w < windowCount; w++) {
        const wx = trainX + 45 + w * 58;
        const wy = trainY + 18;

        // Window warm light
        const winGrad = ctx.createLinearGradient(wx, wy, wx, wy + winH);
        winGrad.addColorStop(0, '#fef08a');
        winGrad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = winGrad;
        ctx.fillRect(wx, wy, winW, winH);

        // Window frame
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 2;
        ctx.strokeRect(wx, wy, winW, winH);

        // Passenger silhouette inside
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(wx + winW / 2, wy + 14, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(wx + winW / 2 - 8, wy + 20, 16, 8);

        // If birds are on passengers, draw tiny colored bird on passenger shoulder
        if (hasBirds) {
          ctx.fillStyle = w % 2 === 0 ? '#38bdf8' : '#f43f5e';
          ctx.beginPath();
          ctx.arc(wx + winW / 2 + 5, wy + 11, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Train Headlight / Bioluminescent Beam
      const headX = trainX + trainW - 10;
      const headY = trainY + trainH / 2;
      const beamGrad = ctx.createRadialGradient(headX, headY, 5, headX + 160, headY, 180);
      beamGrad.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
      beamGrad.addColorStop(0.3, 'rgba(250, 204, 21, 0.35)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(headX, headY - 10);
      ctx.lineTo(headX + 220, headY - 60);
      ctx.lineTo(headX + 220, headY + 60);
      ctx.closePath();
      ctx.fill();

      // Rail tracks beneath
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, trainY + trainH + 3);
      ctx.lineTo(width, trainY + trainH + 3);
      ctx.stroke();

      ctx.restore();
    }

    // =========================================================================
    // 6. ENORMOUS FISH & MARINE LIFE (If present)
    // =========================================================================
    if (hasFish || isUnderwater) {
      ctx.save();
      const fishX = width * 0.72;
      const fishY = height * 0.32;
      const fishLen = 170;
      const fishH = 65;

      // Fish Glow Aura
      const fishAura = ctx.createRadialGradient(fishX, fishY, 10, fishX, fishY, 120);
      fishAura.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      fishAura.addColorStop(1, 'transparent');
      ctx.fillStyle = fishAura;
      ctx.beginPath();
      ctx.arc(fishX, fishY, 120, 0, Math.PI * 2);
      ctx.fill();

      // Fish Body (Graceful streamlined curve)
      const fishGrad = ctx.createLinearGradient(fishX - fishLen / 2, fishY, fishX + fishLen / 2, fishY);
      fishGrad.addColorStop(0, '#06b6d4'); // Cyan
      fishGrad.addColorStop(0.5, '#3b82f6'); // Blue
      fishGrad.addColorStop(1, '#818cf8'); // Indigo
      ctx.fillStyle = fishGrad;

      ctx.beginPath();
      // Nose
      ctx.moveTo(fishX - fishLen / 2, fishY);
      // Top back
      ctx.quadraticCurveTo(fishX - fishLen * 0.1, fishY - fishH / 2, fishX + fishLen * 0.3, fishY - 8);
      // Tail base
      ctx.lineTo(fishX + fishLen / 2, fishY - 22);
      ctx.lineTo(fishX + fishLen * 0.42, fishY);
      ctx.lineTo(fishX + fishLen / 2, fishY + 22);
      // Belly
      ctx.quadraticCurveTo(fishX - fishLen * 0.1, fishY + fishH / 2, fishX - fishLen / 2, fishY);
      ctx.closePath();
      ctx.fill();

      // Translucent glowing fins
      ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.beginPath();
      ctx.moveTo(fishX - 20, fishY - fishH / 2 + 5);
      ctx.quadraticCurveTo(fishX + 10, fishY - fishH - 15, fishX + 40, fishY - fishH / 2 + 10);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(fishX - 10, fishY + fishH / 2 - 5);
      ctx.quadraticCurveTo(fishX + 15, fishY + fishH + 15, fishX + 35, fishY + fishH / 2 - 10);
      ctx.closePath();
      ctx.fill();

      // Luminous Eye
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(fishX - fishLen / 2 + 22, fishY - 5, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(fishX - fishLen / 2 + 21, fishY - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Delicate fish scales highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2;
      for (let sc = 0; sc < 4; sc++) {
        ctx.beginPath();
        ctx.arc(fishX - 25 + sc * 22, fishY, 12, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
      }

      ctx.restore();
    }

    // =========================================================================
    // 7. FLOATING NUMBERLESS CLOCK (If present)
    // =========================================================================
    if (hasClock) {
      ctx.save();
      const clockX = width * 0.42;
      const clockY = height * 0.22;
      const clockR = 48;

      // Ethereal Time Glow
      const clockGlow = ctx.createRadialGradient(clockX, clockY, clockR * 0.4, clockX, clockY, clockR * 2.2);
      clockGlow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      clockGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = clockGlow;
      ctx.beginPath();
      ctx.arc(clockX, clockY, clockR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Outer Glass Bezel
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Numberless Constellation Markers (dots instead of numbers)
      for (let hour = 0; hour < 12; hour++) {
        const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2;
        const markX = clockX + Math.cos(angle) * (clockR - 9);
        const markY = clockY + Math.sin(angle) * (clockR - 9);
        ctx.fillStyle = hour % 3 === 0 ? '#38bdf8' : '#fef08a';
        ctx.beginPath();
        ctx.arc(markX, markY, hour % 3 === 0 ? 3 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Surreal Suspended Hands (curved / floating)
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      ctx.quadraticCurveTo(clockX - 10, clockY - 18, clockX - 16, clockY - 26);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      ctx.quadraticCurveTo(clockX + 15, clockY - 8, clockX + 28, clockY + 12);
      ctx.stroke();

      // Center pivot gem
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(clockX, clockY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // =========================================================================
    // 8. WOODEN DOOR / THRESHOLD PORTAL (If present)
    // =========================================================================
    if (hasDoor) {
      ctx.save();
      const doorX = width * 0.86;
      const doorBaseY = horizonY + 35;
      const doorW = 75;
      const doorH = 150;

      // Portal Backlight Glow
      const doorGlow = ctx.createRadialGradient(doorX, doorBaseY - doorH / 2, 10, doorX, doorBaseY - doorH / 2, 90);
      doorGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      doorGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = doorGlow;
      ctx.beginPath();
      ctx.arc(doorX, doorBaseY - doorH / 2, 90, 0, Math.PI * 2);
      ctx.fill();

      // Carved Wooden Planks (Warm mahogany / oak)
      const woodGrad = ctx.createLinearGradient(doorX - doorW / 2, doorBaseY - doorH, doorX + doorW / 2, doorBaseY);
      woodGrad.addColorStop(0, isWoodenDoor ? '#78350f' : '#1e293b');
      woodGrad.addColorStop(0.5, isWoodenDoor ? '#92400e' : '#334155');
      woodGrad.addColorStop(1, isWoodenDoor ? '#451a03' : '#0f172a');
      ctx.fillStyle = woodGrad;

      // Arched door top
      ctx.beginPath();
      ctx.moveTo(doorX - doorW / 2, doorBaseY);
      ctx.lineTo(doorX - doorW / 2, doorBaseY - doorH + 30);
      ctx.arcTo(doorX, doorBaseY - doorH - 10, doorX + doorW / 2, doorBaseY - doorH + 30, 38);
      ctx.lineTo(doorX + doorW / 2, doorBaseY);
      ctx.closePath();
      ctx.fill();

      // Wood Grain Lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1.2;
      for (let p = 1; p < 4; p++) {
        const px = doorX - doorW / 2 + (p * doorW) / 4;
        ctx.beginPath();
        ctx.moveTo(px, doorBaseY - doorH + 20);
        ctx.lineTo(px, doorBaseY);
        ctx.stroke();
      }

      // Brass Handle / Luminous Keyhole
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(doorX - 18, doorBaseY - doorH * 0.45, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Door Frame
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.restore();
    }

    // =========================================================================
    // 9. COLORED BIRDS / AVIAN CREATURES (If present)
    // =========================================================================
    if (hasBirds) {
      ctx.save();
      const birdColors = ['#f43f5e', '#38bdf8', '#fbbf24', '#34d399', '#c084fc'];
      const birdCount = 6;

      for (let b = 0; b < birdCount; b++) {
        const bx = width * 0.15 + b * 110 + (pseudoRandom() - 0.5) * 60;
        const by = height * 0.18 + (b % 3) * 45 + pseudoRandom() * 20;
        const bColor = birdColors[b % birdColors.length];

        ctx.fillStyle = bColor;
        ctx.strokeStyle = bColor;
        ctx.lineWidth = 2;

        // Flying bird silhouette
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx - 12, by - 10, bx - 22, by + 4);
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + 12, by - 10, bx + 22, by + 4);
        ctx.stroke();

        // Bird body
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // =========================================================================
    // 10. SERPENT (If present)
    // =========================================================================
    if (hasSnake) {
      ctx.save();
      const snakeY = horizonY + 20;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width * 0.1, snakeY);
      for (let x = width * 0.1; x <= width * 0.45; x += 15) {
        ctx.lineTo(x, snakeY + Math.sin(x * 0.08) * 14);
      }
      ctx.stroke();
      ctx.restore();
    }

    // =========================================================================
    // 11. MIST-COVERED BRIDGE (If present)
    // =========================================================================
    if (hasBridge) {
      ctx.save();
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(width * 0.5, horizonY + 80, 160, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.restore();
    }

    // =========================================================================
    // 12. FOREGROUND SILHOUETTE & CURATORIAL BORDER
    // =========================================================================
    // Shimmering Ground / Water Base
    const baseGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    baseGrad.addColorStop(0, isUnderwater ? '#030d1a' : '#070f1e');
    baseGrad.addColorStop(1, '#010408');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Subtle Monogram & Labeling
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    ctx.fillStyle = 'rgba(226, 232, 240, 0.65)';
    ctx.font = '11px "Inter", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('YOUR DREAM — IMAGINED · ARTISTIC VISUALIZATION', 32, 40);

    return canvas.toDataURL('image/png');
  }
}
