import type { ArtworkProvider } from '../../domain/artwork/ArtworkProvider';
import type { ArtworkSpecification } from '../../domain/artwork/ArtworkSpecification';
import type { ArtworkResult } from '../../domain/artwork/ArtworkResult';

/**
 * Mock Artwork Provider.
 * Deterministically generates high-resolution SVG/data URL artwork reflecting the exact dream specification.
 */

export class MockArtworkProvider implements ArtworkProvider {
  public id = 'mock_ai';
  public name = 'Somnithos Dream Synthesis Mock Engine';

  public async generateArtwork(
    spec: ArtworkSpecification,
    _stylePresetKey: string = 'nocturne'
  ): Promise<ArtworkResult> {
    return this.renderArtwork(spec, 0);
  }

  public async regenerateArtwork(
    spec: ArtworkSpecification,
    _stylePresetKey: string = 'nocturne',
    variationSeed: number = 1
  ): Promise<ArtworkResult> {
    return this.renderArtwork(spec, variationSeed);
  }

  public async getArtworkStatus(_id: string): Promise<ArtworkResult | undefined> {
    return undefined;
  }

  private renderArtwork(spec: ArtworkSpecification, seed: number): ArtworkResult {
    const artworkId = 'art-' + spec.originalDreamId + '-' + seed + '-' + Math.random().toString(36).substr(2, 6);

    // Render an SVG representation honoring the dream specification
    const isPurpleTrain = spec.mustInclude.some(i => i.includes('purple train')) || spec.dominantSubjects.some(s => s.includes('purple'));
    const isOcean = spec.environment.toLowerCase().includes('ocean') || spec.environment.toLowerCase().includes('underwater');
    const isClock = spec.mustInclude.some(i => i.includes('clock'));
    const isDoor = spec.mustInclude.some(i => i.includes('door'));
    const isBirds = spec.mustInclude.some(i => i.includes('bird'));
    const isFish = spec.mustInclude.some(i => i.includes('fish'));
    const isSchool = spec.mustInclude.some(i => i.includes('school') || i.includes('classroom') || i.includes('friend')) || spec.environment.toLowerCase().includes('school');
    const isForest = spec.mustInclude.some(i => i.includes('forest') || i.includes('woods')) || spec.environment.toLowerCase().includes('forest');
    const isWarmLight = spec.mustInclude.some(i => i.includes('warm light') || i.includes('light') || i.includes('lantern'));

    // Visual Palette
    const bgGradStart = isOcean ? '#050c1a' : isSchool ? '#0a0d18' : isForest ? '#040711' : '#0c071e';
    const bgGradMid = isOcean ? '#0c2444' : isSchool ? '#1e1b4b' : isForest ? '#0f1f38' : '#1e113a';
    const bgGradEnd = isOcean ? '#031428' : isSchool ? '#05070e' : isForest ? '#020409' : '#070314';

    const trainColor = isPurpleTrain ? '#7e22ce' : '#3b82f6';
    const trainGlow = isPurpleTrain ? '#a855f7' : '#60a5fa';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${bgGradStart}" />
            <stop offset="50%" stop-color="${bgGradMid}" />
            <stop offset="100%" stop-color="${bgGradEnd}" />
          </linearGradient>
          <radialGradient id="oceanGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="warmLightGlow" cx="72%" cy="42%" r="45%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9" />
            <stop offset="30%" stop-color="#f59e0b" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="trainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${trainColor}" />
            <stop offset="100%" stop-color="${trainGlow}" />
          </linearGradient>
          <linearGradient id="doorLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#22c55e" />
            <stop offset="100%" stop-color="#86efac" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Background -->
        <rect width="900" height="600" fill="url(#bgGrad)" />
        ${isOcean ? '<rect width="900" height="600" fill="url(#oceanGlow)" />' : ''}
        ${isForest && isWarmLight ? '<rect width="900" height="600" fill="url(#warmLightGlow)" />' : ''}

        <!-- Deep Atmosphere Rays -->
        <path d="M100 0 L250 600 L180 600 Z" fill="#38bdf8" opacity="0.08" />
        <path d="M400 0 L550 600 L480 600 Z" fill="#38bdf8" opacity="0.06" />
        <path d="M700 0 L820 600 L760 600 Z" fill="#38bdf8" opacity="0.07" />

        ${isOcean && isFish ? `
          <!-- Enormous Fish swimming outside -->
          <g filter="url(#glow)" opacity="0.85">
            <path d="M150 180 C260 120 380 140 460 190 C380 230 250 240 150 180 Z" fill="#0284c7" opacity="0.6" />
            <polygon points="150,180 90,140 110,180 90,220" fill="#0284c7" opacity="0.6" />
            <!-- Eye -->
            <circle cx="420" cy="180" r="5" fill="#facc15" />
          </g>
        ` : ''}

        ${isForest ? `
          <!-- Dark Night Forest Trees & Lone Traveler -->
          <g opacity="0.9">
            <!-- Tree Trunks -->
            <rect x="60" y="140" width="16" height="340" fill="#050711" />
            <polygon points="68,90 20,240 116,240" fill="#061226" />
            <rect x="180" y="180" width="22" height="300" fill="#050711" />
            <polygon points="191,120 130,280 252,280" fill="#071833" />
            <rect x="320" y="160" width="18" height="320" fill="#050711" />
            <polygon points="329,100 270,260 388,260" fill="#061226" />
            <rect x="800" y="120" width="26" height="360" fill="#050711" />
            <polygon points="813,60 740,240 886,240" fill="#061226" />

            <!-- Distant warm light beacon and pathway -->
            <circle cx="650" cy="280" r="14" fill="#fef08a" filter="url(#glow)" />
            <polygon points="650,280 400,500 550,500" fill="#f59e0b" opacity="0.25" />

            <!-- Person Walking in Forest -->
            <circle cx="460" cy="380" r="8" fill="#030509" />
            <rect x="454" y="388" width="12" height="24" fill="#030509" />
            <line x1="456" y1="412" x2="452" y2="430" stroke="#030509" stroke-width="4" />
            <line x1="464" y1="412" x2="468" y2="430" stroke="#030509" stroke-width="4" />
          </g>
        ` : ''}

        ${isSchool ? `
          <!-- School Corridor & Friend Waiting Outside -->
          <g transform="translate(60, 160)" opacity="0.95">
            <!-- School building brick facade -->
            <rect x="0" y="0" width="460" height="260" rx="8" fill="#1e1b4b" stroke="#312e81" stroke-width="3" />
            
            <!-- Classroom Windows -->
            <rect x="30" y="40" width="70" height="70" rx="4" fill="#fef08a" opacity="0.4" stroke="#0f172a" stroke-width="2" />
            <rect x="130" y="40" width="70" height="70" rx="4" fill="#38bdf8" opacity="0.7" stroke="#0f172a" stroke-width="2" />
            <rect x="230" y="40" width="70" height="70" rx="4" fill="#fef08a" opacity="0.4" stroke="#0f172a" stroke-width="2" />
            <rect x="330" y="40" width="70" height="70" rx="4" fill="#fef08a" opacity="0.4" stroke="#0f172a" stroke-width="2" />

            <!-- Doorway outside to Courtyard -->
            <rect x="520" y="40" width="140" height="220" rx="6" fill="#090d16" stroke="#b45309" stroke-width="2" />
            <!-- Warm outside lamp -->
            <circle cx="590" cy="20" r="16" fill="#fef08a" filter="url(#glow)" />
            
            <!-- Best Friend Waiting with Waving Silhouette -->
            <g transform="translate(590, 120)">
              <circle cx="0" cy="0" r="12" fill="#38bdf8" />
              <rect x="-8" y="12" width="16" height="36" rx="4" fill="#38bdf8" />
              <line x1="8" y1="20" x2="24" y2="4" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
              <line x1="-4" y1="48" x2="-6" y2="76" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
              <line x1="4" y1="48" x2="6" y2="76" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
            </g>
          </g>
        ` : ''}

        ${isClock ? `
          <!-- Floating Clock with NO Numbers -->
          <g transform="translate(450, 110)" filter="url(#glow)">
            <circle cx="0" cy="0" r="45" fill="#0f172a" stroke="#f59e0b" stroke-width="4" opacity="0.9" />
            <circle cx="0" cy="0" r="38" fill="none" stroke="#fef08a" stroke-width="1" opacity="0.5" stroke-dasharray="2 6" />
            <!-- Center pivot and clock hands but NO numbers -->
            <circle cx="0" cy="0" r="4" fill="#f59e0b" />
            <line x1="0" y1="0" x2="16" y2="-22" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
            <line x1="0" y1="0" x2="-22" y2="8" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" />
          </g>
        ` : ''}

        ${isPurpleTrain ? `
          <!-- Purple Underwater Train Carriage & Windows -->
          <g transform="translate(80, 240)">
            <rect x="0" y="40" width="560" height="220" rx="16" fill="url(#trainGrad)" stroke="#c084fc" stroke-width="3" filter="url(#glow)" opacity="0.95" />
            <rect x="0" y="240" width="560" height="20" fill="#4c1d95" />

            <!-- Train Windows -->
            <rect x="30" y="70" width="100" height="110" rx="8" fill="#0284c7" opacity="0.8" stroke="#e9d5ff" stroke-width="2" />
            <rect x="160" y="70" width="100" height="110" rx="8" fill="#0284c7" opacity="0.8" stroke="#e9d5ff" stroke-width="2" />
            <rect x="290" y="70" width="100" height="110" rx="8" fill="#0284c7" opacity="0.8" stroke="#e9d5ff" stroke-width="2" />
            <rect x="420" y="70" width="100" height="110" rx="8" fill="#0284c7" opacity="0.8" stroke="#e9d5ff" stroke-width="2" />

            ${isBirds ? `
              <!-- Passengers with Colored Birds on shoulders -->
              <g transform="translate(50, 110)">
                <!-- Passenger 1 silhouette -->
                <circle cx="30" cy="30" r="14" fill="#312e81" />
                <path d="M10 60 C10 45 50 45 50 60 Z" fill="#312e81" />
                <!-- Ruby Bird on shoulder -->
                <ellipse cx="48" cy="38" rx="6" ry="8" fill="#ef4444" />
                <polygon points="54,36 60,38 54,40" fill="#facc15" />
              </g>

              <g transform="translate(180, 110)">
                <!-- Passenger 2 silhouette -->
                <circle cx="30" cy="30" r="14" fill="#312e81" />
                <path d="M10 60 C10 45 50 45 50 60 Z" fill="#312e81" />
                <!-- Emerald Bird on shoulder -->
                <ellipse cx="48" cy="38" rx="6" ry="8" fill="#10b981" />
                <polygon points="54,36 60,38 54,40" fill="#facc15" />
              </g>

              <g transform="translate(310, 110)">
                <!-- Passenger 3 silhouette -->
                <circle cx="30" cy="30" r="14" fill="#312e81" />
                <path d="M10 60 C10 45 50 45 50 60 Z" fill="#312e81" />
                <!-- Gold Bird on shoulder -->
                <ellipse cx="48" cy="38" rx="6" ry="8" fill="#eab308" />
                <polygon points="54,36 60,38 54,40" fill="#f97316" />
              </g>
            ` : ''}
          </g>
        ` : ''}

        ${isDoor ? `
          <!-- Freestanding Wooden Door with Bright Sunlit Forest inside -->
          <g transform="translate(680, 220)" filter="url(#glow)">
            <!-- Outer door frame -->
            <rect x="-8" y="-8" width="136" height="266" rx="4" fill="#78350f" stroke="#b45309" stroke-width="3" />
            <!-- Inside door: bright glowing forest -->
            <rect x="0" y="0" width="120" height="250" rx="2" fill="url(#doorLight)" opacity="0.95" />
            
            <!-- Sunlit Forest trees inside the doorway -->
            <path d="M15 250 L35 150 L55 250 Z" fill="#15803d" />
            <path d="M45 250 L65 130 L85 250 Z" fill="#166534" />
            <path d="M70 250 L95 140 L115 250 Z" fill="#14532d" />
            <!-- Sun glow -->
            <circle cx="60" cy="80" r="25" fill="#fef08a" opacity="0.75" />

            <!-- Wooden door ajar -->
            <polygon points="120,0 160,-20 160,230 120,250" fill="#92400e" stroke="#d97706" stroke-width="2" />
            <!-- Brass handle -->
            <circle cx="132" cy="120" r="4" fill="#fde047" />
          </g>
        ` : ''}

        <!-- Water / Ground Mist Floor Overlay -->
        <rect x="0" y="520" width="900" height="80" fill="#082f49" opacity="0.6" />
      </svg>
    `;

    const base64Svg = Buffer.from(svg).toString('base64');
    const imageUrl = `data:image/svg+xml;base64,${base64Svg}`;

    return {
      id: artworkId,
      dreamId: spec.originalDreamId,
      provider: 'mock_ai',
      model: 'Somnithos-Artwork-Engine-v2',
      createdAt: new Date().toISOString(),
      imageUrl,
      specification: spec,
      generationStatus: 'completed',
      fallbackUsed: false,
      label: 'Your Dream — Imagined',
      subLabel: 'An artistic visualization inspired by your description.'
    };
  }
}
