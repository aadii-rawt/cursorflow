/**
 * High-definition standalone Apple/MacBook wallpaper vector generators
 * Render crisp, zero-latency 4K backgrounds with 100% offline reliability.
 */

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const MACBOOK_WALLPAPERS = {
  sonomaHorizon: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#14061F"/>
          <stop offset="35%" stop-color="#3b1144"/>
          <stop offset="65%" stop-color="#9A3412"/>
          <stop offset="85%" stop-color="#D97706"/>
          <stop offset="100%" stop-color="#FCD34D"/>
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="65%" r="45%">
          <stop offset="0%" stop-color="#FDE047" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#EA580C" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#14061F" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="dune1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#78350F"/>
          <stop offset="100%" stop-color="#B45309"/>
        </linearGradient>
        <linearGradient id="dune2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#451A03"/>
          <stop offset="100%" stop-color="#78350F"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#skyGrad)"/>
      <rect width="1920" height="1080" fill="url(#sunGlow)"/>
      <path d="M0,720 Q480,620 960,700 T1920,680 L1920,1080 L0,1080 Z" fill="url(#dune1)" opacity="0.9"/>
      <path d="M0,820 Q480,740 1020,840 T1920,800 L1920,1080 L0,1080 Z" fill="url(#dune2)"/>
      <path d="M0,910 Q540,860 1140,940 T1920,900 L1920,1080 L0,1080 Z" fill="#290E02"/>
    </svg>
  `),

  venturaBloom: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="50%" stop-color="#0F172A"/>
          <stop offset="100%" stop-color="#1E1B4B"/>
        </linearGradient>
        <radialGradient id="bloom1" cx="35%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#F97316"/>
          <stop offset="40%" stop-color="#EF4444"/>
          <stop offset="75%" stop-color="#A855F7" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="bloom2" cx="65%" cy="60%" r="50%">
          <stop offset="0%" stop-color="#FBBF24"/>
          <stop offset="45%" stop-color="#F97316"/>
          <stop offset="80%" stop-color="#DB2777" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#bg)"/>
      <circle cx="700" cy="450" r="650" fill="url(#bloom1)"/>
      <circle cx="1250" cy="650" r="600" fill="url(#bloom2)"/>
    </svg>
  `),

  montereyWaves: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="mBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090514"/>
          <stop offset="100%" stop-color="#1E1035"/>
        </linearGradient>
        <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B5CF6"/>
          <stop offset="50%" stop-color="#EC4899"/>
          <stop offset="100%" stop-color="#3B82F6"/>
        </linearGradient>
        <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366F1"/>
          <stop offset="50%" stop-color="#A855F7"/>
          <stop offset="100%" stop-color="#06B6D4"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#mBg)"/>
      <path d="M-100,500 C300,200 700,900 1200,400 C1500,100 1800,600 2100,450 L2100,1200 L-100,1200 Z" fill="url(#wave1)" opacity="0.6"/>
      <path d="M-100,650 C400,400 800,1000 1300,550 C1600,300 1800,800 2100,600 L2100,1200 L-100,1200 Z" fill="url(#wave2)" opacity="0.75"/>
      <path d="M-100,850 C500,650 900,1100 1400,750 C1700,550 1900,950 2100,800 L2100,1200 L-100,1200 Z" fill="#170929" opacity="0.9"/>
    </svg>
  `),

  bigSurSpectrum: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="bsSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1E3A8A"/>
          <stop offset="40%" stop-color="#3B82F6"/>
          <stop offset="75%" stop-color="#F43F5E"/>
          <stop offset="100%" stop-color="#FBBF24"/>
        </linearGradient>
        <linearGradient id="peak1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#E11D48"/>
          <stop offset="100%" stop-color="#F97316"/>
        </linearGradient>
        <linearGradient id="peak2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#831843"/>
          <stop offset="100%" stop-color="#BE123C"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#bsSky)"/>
      <path d="M0,680 L350,520 L750,710 L1250,460 L1650,680 L1920,580 L1920,1080 L0,1080 Z" fill="url(#peak1)" opacity="0.75"/>
      <path d="M0,780 L420,640 L880,820 L1380,590 L1780,790 L1920,720 L1920,1080 L0,1080 Z" fill="url(#peak2)" opacity="0.9"/>
      <path d="M0,890 L520,780 L980,920 L1480,720 L1920,860 L1920,1080 L0,1080 Z" fill="#2A081D"/>
    </svg>
  `),

  mojaveNight: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="60%" stop-color="#0B1329"/>
          <stop offset="100%" stop-color="#172554"/>
        </linearGradient>
        <radialGradient id="aurora" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#6366F1" stop-opacity="0.35"/>
          <stop offset="60%" stop-color="#38BDF8" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#nightSky)"/>
      <rect width="1920" height="1080" fill="url(#aurora)"/>
      <path d="M0,740 Q450,660 900,730 T1920,700 L1920,1080 L0,1080 Z" fill="#0F172A" opacity="0.8"/>
      <path d="M0,840 Q500,760 1050,850 T1920,810 L1920,1080 L0,1080 Z" fill="#0A0F1D"/>
      <path d="M0,930 Q550,880 1200,950 T1920,910 L1920,1080 L0,1080 Z" fill="#030712"/>
    </svg>
  `),

  studioGraphite: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <radialGradient id="graphite" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#2D3139"/>
          <stop offset="50%" stop-color="#1A1C22"/>
          <stop offset="100%" stop-color="#0D0E12"/>
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#graphite)"/>
    </svg>
  `),

  cupertinoGlass: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="glassBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="50%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
        <radialGradient id="glassLight" cx="30%" cy="20%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#glassBg)"/>
      <rect width="1920" height="1080" fill="url(#glassLight)"/>
    </svg>
  `)
};
