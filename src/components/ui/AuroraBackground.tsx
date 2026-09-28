import React from 'react';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  showRadarGrid?: boolean;
  className?: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  showRadarGrid = true,
  className = '',
}) => {
  return (
    <div className={`relative min-h-screen w-full bg-atmospheric-sky text-slate-900 overflow-hidden ${className}`}>
      {/* 1. Large Warm Sunlight Bloom (Prompt Section 6) - Top-right/upper-center drifting across 75s */}
      <div
        className="absolute top-[-100px] right-[12%] w-[900px] h-[900px] rounded-full pointer-events-none animate-sunlight-drift"
        style={{
          background: 'radial-gradient(circle at 45% 45%, rgba(255, 214, 120, 0.14) 0%, rgba(255, 239, 190, 0.10) 35%, rgba(253, 224, 146, 0.04) 65%, transparent 80%)',
          filter: 'blur(90px)',
        }}
      />

      {/* 2. Real Atmospheric Cloud Layers (Prompt Section 5) - Huge, soft, slow-moving cloud masses */}
      {/* Cloud Layer 1 - Upper troposphere (55s) */}
      <div
        className="absolute -top-16 -left-36 w-[1100px] h-[520px] rounded-full pointer-events-none animate-cloud-layer-1"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.90) 0%, rgba(240, 249, 255, 0.40) 45%, rgba(224, 242, 254, 0.20) 70%, transparent 85%)',
          filter: 'blur(80px)',
          opacity: 0.25,
        }}
      />

      {/* Cloud Layer 2 - Mid-sky soft pale blue cumulus mass (75s) */}
      <div
        className="absolute top-1/4 -right-48 w-[1050px] h-[560px] rounded-full pointer-events-none animate-cloud-layer-2"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.85) 0%, rgba(186, 230, 253, 0.35) 45%, rgba(203, 213, 225, 0.15) 70%, transparent 85%)',
          filter: 'blur(90px)',
          opacity: 0.22,
        }}
      />

      {/* Cloud Layer 3 - Lower atmospheric haze & soft cloud base (95s) */}
      <div
        className="absolute top-2/3 -left-56 w-[1150px] h-[500px] rounded-full pointer-events-none animate-cloud-layer-3"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.80) 0%, rgba(224, 242, 254, 0.30) 50%, rgba(241, 245, 249, 0.12) 75%, transparent 90%)',
          filter: 'blur(95px)',
          opacity: 0.20,
        }}
      />

      {/* Cloud Layer 4 - Soft horizon atmospheric haze (120s) */}
      <div
        className="absolute -bottom-32 right-1/4 w-[1200px] h-[480px] rounded-full pointer-events-none animate-cloud-layer-4"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(224, 242, 254, 0.35) 0%, rgba(255, 255, 255, 0.70) 40%, rgba(14, 165, 233, 0.08) 70%, transparent 85%)',
          filter: 'blur(100px)',
          opacity: 0.18,
        }}
      />

      {/* 3. Soft Vertical Cool Blue Atmospheric Haze (Prompt Section 4 Bottom Gradient) */}
      <div
        className="absolute inset-0 pointer-events-none animate-haze-slow opacity-15"
        style={{
          background: 'radial-gradient(circle at 50% 90%, rgba(14, 165, 233, 0.14) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 75%)',
          filter: 'blur(110px)',
        }}
      />

      {/* 4. Atmospheric isobar contours */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="isobarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <path d="M -100 200 C 300 120, 700 280, 1200 180 S 1800 250, 2400 160" fill="none" stroke="url(#isobarGrad)" strokeWidth="1.5" />
        <path d="M -100 450 C 400 380, 800 520, 1300 420 S 1900 490, 2400 400" fill="none" stroke="url(#isobarGrad)" strokeWidth="1.5" />
        <path d="M -100 720 C 350 640, 850 780, 1350 690 S 1850 750, 2400 660" fill="none" stroke="url(#isobarGrad)" strokeWidth="1.5" />
        <path d="M -100 980 C 450 900, 950 1040, 1450 930 S 1950 1000, 2400 910" fill="none" stroke="url(#isobarGrad)" strokeWidth="1.5" />
      </svg>

      {/* 5. Sparse floating atmospheric micro-particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute top-[18%] left-[12%] w-1.5 h-1.5 rounded-full bg-sky-400 blur-[0.5px] animate-pulse-slow" />
        <div className="absolute top-[28%] right-[20%] w-2 h-2 rounded-full bg-amber-300 blur-[0.5px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[52%] left-[24%] w-1.5 h-1.5 rounded-full bg-teal-400 blur-[0.5px] animate-pulse-slow" style={{ animationDelay: '3.5s' }} />
        <div className="absolute top-[72%] right-[16%] w-2 h-2 rounded-full bg-sky-300 blur-[0.5px] animate-pulse-slow" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[88%] left-[42%] w-1.5 h-1.5 rounded-full bg-cyan-400 blur-[0.5px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* 6. Subtle radar coordinate grid overlay */}
      {showRadarGrid && (
        <div className="absolute inset-0 bg-radar-grid bg-radial-vignette pointer-events-none opacity-40" />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};
