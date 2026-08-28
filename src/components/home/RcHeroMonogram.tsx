import React from 'react';

interface RcHeroMonogramProps {
  className?: string;
  isAnimated?: boolean;
}

export const RcHeroMonogram: React.FC<RcHeroMonogramProps> = ({ className = '' }) => {
  return (
    <div className={`rc-monogram-container ${className}`} aria-hidden="true">
      <svg
        className="rc-monogram-svg"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Noise / Stippled Metal Texture Pattern */}
          <filter id="rc-metal-texture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.18 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in2="SourceGraphic" result="textured" />
            <feBlend mode="overlay" in="textured" in2="SourceGraphic" />
          </filter>

          {/* Steel-Silver R Main Gradients */}
          <linearGradient id="r-stem-face" x1="260" y1="160" x2="680" y2="760" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="15%" stopColor="#94a3b8" />
            <stop offset="35%" stopColor="#475569" />
            <stop offset="55%" stopColor="#cbd5e1" />
            <stop offset="75%" stopColor="#334155" />
            <stop offset="90%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="r-bevel-light" x1="280" y1="180" x2="640" y2="720" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#e2e8f0" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#94a3b8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="r-bevel-dark" x1="320" y1="200" x2="600" y2="760" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#1e293b" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#090d16" stopOpacity="0.98" />
          </linearGradient>

          {/* Deep Red / Crimson C Gradients */}
          <linearGradient id="c-crimson-body" x1="440" y1="260" x2="820" y2="720" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="20%" stopColor="#dc2626" />
            <stop offset="45%" stopColor="#991b1b" />
            <stop offset="70%" stopColor="#b91c1c" />
            <stop offset="88%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          <linearGradient id="c-crimson-bevel" x1="480" y1="280" x2="780" y2="680" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff8585" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#dc2626" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#450a0a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1a0202" stopOpacity="0.95" />
          </linearGradient>

          {/* Atmosphere Radial Glows */}
          <radialGradient id="rc-core-glow" cx="500" cy="480" r="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.5" />
            <stop offset="35%" stopColor="#0e172a" stopOpacity="0.3" />
            <stop offset="65%" stopColor="#070b18" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="c-ruby-aura" cx="640" cy="490" r="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="40%" stopColor="#b91c1c" stopOpacity="0.15" />
            <stop offset="75%" stopColor="#7f1d1d" stopOpacity="0.03" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Gold Filigree Gradient */}
          <linearGradient id="gold-filigree" x1="200" y1="200" x2="800" y2="800" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="35%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#996515" />
            <stop offset="100%" stopColor="#e6ca85" />
          </linearGradient>

          {/* Subtle Glow Filter */}
          <filter id="rc-ambient-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Core Aura */}
        <circle cx="500" cy="480" r="460" fill="url(#rc-core-glow)" />
        <circle cx="640" cy="490" r="300" fill="url(#c-ruby-aura)" />

        {/* 1. FAINT CELESTIAL & OBSERVATORY RINGS */}
        <g className="rc-observatory-rings" opacity="0.55">
          {/* Main Outer Concentric Circles */}
          <circle cx="500" cy="480" r="450" stroke="rgba(212, 175, 55, 0.22)" strokeWidth="1" strokeDasharray="3 7" />
          <circle cx="500" cy="480" r="430" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          <circle cx="500" cy="480" r="330" stroke="rgba(212, 175, 55, 0.16)" strokeWidth="1" />
          <circle cx="500" cy="480" r="230" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="2 4" />

          {/* Inclined Celestial Coordinate Ellipses */}
          <ellipse cx="500" cy="480" rx="460" ry="190" stroke="rgba(56, 189, 248, 0.14)" strokeWidth="1" transform="rotate(-26 500 480)" strokeDasharray="5 7" />
          <ellipse cx="500" cy="480" rx="440" ry="160" stroke="rgba(212, 175, 55, 0.12)" strokeWidth="1" transform="rotate(34 500 480)" strokeDasharray="4 6" />

          {/* Cardinal Meridian Crosshairs */}
          <line x1="500" y1="20" x2="500" y2="940" stroke="rgba(212, 175, 55, 0.1)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="40" y1="480" x2="960" y2="480" stroke="rgba(212, 175, 55, 0.1)" strokeWidth="1" strokeDasharray="4 8" />

          {/* Cardinal Diamond Star Markers */}
          {/* Top Star */}
          <polygon points="500,20 505,32 517,37 505,42 500,54 495,42 483,37 495,32" fill="#d4af37" opacity="0.85" />
          {/* Bottom Star */}
          <polygon points="500,906 505,918 517,923 505,928 500,940 495,928 483,923 495,918" fill="#d4af37" opacity="0.85" />
          {/* Left Star */}
          <polygon points="40,480 52,475 57,463 62,475 74,480 62,485 57,497 52,485" fill="#d4af37" opacity="0.85" />
          {/* Right Star */}
          <polygon points="926,480 938,475 943,463 948,475 960,480 948,485 943,497 938,485" fill="#d4af37" opacity="0.85" />

          {/* Coordinate Dial Ticks */}
          {[15, 30, 45, 60, 75, 105, 120, 135, 150, 165, 195, 210, 225, 240, 255, 285, 300, 315, 330, 345].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 500 + Math.cos(rad) * 430;
            const y1 = 480 + Math.sin(rad) * 430;
            const x2 = 500 + Math.cos(rad) * 444;
            const y2 = 480 + Math.sin(rad) * 444;
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(212, 175, 55, 0.3)"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* 2. THE INTERLOCKING "C" (Deep Red / Crimson) */}
        <g className="rc-glyph-c" filter="url(#rc-ambient-glow)">
          {/* C Body Base */}
          <path
            d="M 720 310 C 620 220, 470 230, 380 320 C 300 400, 300 580, 380 660 C 470 750, 620 760, 720 680 C 748 658, 770 632, 786 602 L 712 550 C 690 586, 616 632, 538 616 C 454 598, 416 524, 416 480 C 416 436, 454 362, 538 344 C 616 328, 690 374, 712 410 Z"
            fill="url(#c-crimson-body)"
            opacity="0.95"
          />

          {/* C Bevel Ridge & Sculpted Facets */}
          <path
            d="M 720 310 C 620 220, 470 230, 380 320 C 300 400, 300 580, 380 660 L 416 620 C 348 556, 348 424, 416 360 L 380 320 Z"
            fill="url(#c-crimson-bevel)"
          />

          {/* C Inner Highlight Line */}
          <path
            d="M 708 322 C 614 238, 480 248, 396 332 C 322 406, 322 574, 396 648 C 480 732, 614 742, 708 668"
            fill="none"
            stroke="rgba(255, 140, 140, 0.4)"
            strokeWidth="2.5"
          />

          {/* C Outer Rim Shadow */}
          <path
            d="M 786 602 C 770 632, 748 658, 720 680 C 620 760, 470 750, 380 660 C 300 580, 300 400, 380 320 C 470 230, 620 220, 720 310"
            fill="none"
            stroke="#1a0303"
            strokeWidth="3.5"
            opacity="0.85"
          />
        </g>

        {/* 3. THE MAJESTIC "R" (Textured Steel-Gray & Beveled Metal) */}
        <g className="rc-glyph-r">
          {/* Main Solid R Shape */}
          <path
            d="M 270 200 L 530 200 C 632 200, 704 254, 704 350 C 704 430, 648 478, 566 498 L 730 750 L 598 750 L 460 514 L 386 514 L 386 750 L 270 750 Z"
            fill="url(#r-stem-face)"
          />

          {/* Inner Counter Opening of R */}
          <path
            d="M 386 294 L 518 294 C 568 294, 602 316, 602 360 C 602 404, 568 426, 518 426 L 386 426 Z"
            fill="#050814"
          />

          {/* 3D Chiseled Top/Left Bevel Light Facets */}
          <path
            d="M 270 200 L 530 200 C 632 200, 704 254, 704 350 C 704 378, 692 404, 674 426 L 656 410 C 670 390, 678 370, 678 350 C 678 270, 618 222, 530 222 L 292 222 L 292 750 L 270 750 Z"
            fill="url(#r-bevel-light)"
          />

          {/* 3D Chiseled Diagonal Leg Light Highlight */}
          <path
            d="M 566 498 L 730 750 L 702 750 L 548 514 Z"
            fill="url(#r-bevel-light)"
            opacity="0.8"
          />

          {/* 3D Dark Under-Shadow Facets */}
          <path
            d="M 386 426 L 518 426 C 568 426, 602 404, 602 360 L 614 360 C 614 416, 574 438, 518 438 L 386 438 Z"
            fill="url(#r-bevel-dark)"
          />

          {/* Serif Triangular Chiseled Cuts */}
          {/* Top-Left Serif Wing */}
          <polygon points="250,200 270,180 290,200" fill="#cbd5e1" opacity="0.6" />
          {/* Bottom-Left Serif Foot */}
          <polygon points="250,750 270,766 290,750" fill="#64748b" opacity="0.7" />
          {/* Bottom-Right Leg Serif Foot */}
          <polygon points="578,750 598,766 730,766 750,750" fill="#64748b" opacity="0.5" />

          {/* Fine Brushed Steel Texture Lines */}
          <g opacity="0.22" stroke="#ffffff" strokeWidth="0.8">
            <line x1="298" y1="230" x2="298" y2="730" />
            <line x1="320" y1="230" x2="320" y2="730" />
            <line x1="342" y1="230" x2="342" y2="730" />
            <line x1="364" y1="230" x2="364" y2="730" />
            <line x1="400" y1="210" x2="520" y2="210" />
            <line x1="400" y1="504" x2="456" y2="504" />
            <line x1="578" y1="540" x2="704" y2="734" />
          </g>

          {/* Subtle Gold Filigree Accents along Serifs & Key Joints */}
          <path
            d="M 266 198 L 532 198 C 636 198, 708 252, 708 350"
            fill="none"
            stroke="url(#gold-filigree)"
            strokeWidth="1.6"
            opacity="0.8"
          />
          <path
            d="M 266 752 L 390 752"
            fill="none"
            stroke="url(#gold-filigree)"
            strokeWidth="1.6"
            opacity="0.8"
          />
          <path
            d="M 594 752 L 734 752"
            fill="none"
            stroke="url(#gold-filigree)"
            strokeWidth="1.6"
            opacity="0.8"
          />
        </g>

        {/* 4. FINE CELESTIAL STARDUST NODES */}
        <g className="rc-stardust" opacity="0.75">
          <circle cx="270" cy="200" r="3" fill="#ffffff" />
          <circle cx="704" cy="350" r="3" fill="#ffffff" />
          <circle cx="730" cy="750" r="3.5" fill="#d4af37" />
          <circle cx="270" cy="750" r="3" fill="#d4af37" />
          <circle cx="720" cy="310" r="2.5" fill="#f87171" />
          <circle cx="720" cy="680" r="2.5" fill="#f87171" />
          <circle cx="380" cy="320" r="2" fill="#ffffff" />
          <circle cx="380" cy="660" r="2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};
