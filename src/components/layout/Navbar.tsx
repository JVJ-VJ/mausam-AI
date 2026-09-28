import React, { useState, useEffect } from 'react';
import { 
  CloudSun,
  ShieldAlert, 
  Clock, 
  Eye, 
  Layers, 
  BarChart3, 
  Bell, 
  CheckCircle2,
  Play,
  Pause,
  Activity
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onEmergencyClick?: () => void;
  isLive?: boolean;
  onToggleLive?: () => void;
  activeAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  onEmergencyClick,
  isLive = true,
  onToggleLive,
  activeAlertsCount = 6,
}) => {
  const [timeState, setTimeState] = useState({
    ist: '',
    utc: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeState({
        ist: now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        utc: now.toLocaleTimeString('en-GB', {
          timeZone: 'UTC',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { id: 'overview', label: 'Command Center', icon: Eye },
    { id: 'intelligence', label: 'Live Events', icon: Layers },
    { id: 'verification', label: 'AI Verification', icon: CheckCircle2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alert Center', icon: Bell, badge: activeAlertsCount > 0 ? String(activeAlertsCount) : undefined },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E3A5F]/60 bg-[linear-gradient(90deg,#071C2E,#08243A,#0B304A,#08243A)] bg-[length:200%_100%] animate-gradient-slow text-white shadow-md backdrop-blur-xl">
      {/* Top meteorological telemetry strip */}
      <div className="w-full bg-[#071C2E]/95 border-b border-[#1E3A5F]/50 py-1.5 text-[11px] font-mono text-[#CBD5E1]">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 beacon-dot' : 'bg-amber-400'}`} />
              <span className={`font-bold tracking-wider ${isLive ? 'text-emerald-400' : 'text-amber-300'}`}>
                {isLive ? 'LIVE TELEMETRY' : 'STREAM PAUSED'}
              </span>
            </div>
            <span className="text-[#1E3A5F]">|</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="text-[#BAE6FD] font-semibold">STATUS:</span>
              <span className="text-emerald-300 font-medium">NORMAL MONITORING</span>
            </div>
            <span className="hidden md:inline text-[#1E3A5F]">|</span>
            <span className="hidden md:inline text-slate-400">
              SIH PROBLEM ID: <strong className="text-white font-semibold">SIH26069</strong>
            </span>
            <span className="hidden xl:inline text-[#1E3A5F]">|</span>
            <span className="hidden xl:inline text-[#BAE6FD] font-sans">
              Pan-India Meteorological Stream &bull; Multi-Source Corroboration Engine
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>IST: <strong className="text-white font-mono font-semibold">{timeState.ist || '--:--:--'}</strong></span>
              <span className="text-slate-600 font-sans">/</span>
              <span>UTC: <strong className="text-slate-400 font-mono">{timeState.utc || '--:--:--'}</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-mono text-[10px] font-medium">
              <Activity className="w-3 h-3 text-[#38BDF8]" />
              <span>GRID 99.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main command navigation bar */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-[66px] flex items-center justify-between gap-4">
        {/* Brand identity (~240px) */}
        <div className="w-[240px] shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#14B8A6] p-0.5 shadow-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#08243A] rounded-[10px] flex items-center justify-center">
              <CloudSun className="w-5 h-5 text-[#38BDF8]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                WEATHERWATCH
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0EA5E9] text-white uppercase">
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-[#BAE6FD] -mt-0.5 truncate">
              National Weather Platform
            </p>
          </div>
        </div>

        {/* View navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#071C2E]/85 border border-white/10 p-1.5 rounded-2xl shadow-inner">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-sky-500/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${isActive ? 'bg-white text-sky-800' : 'bg-rose-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onToggleLive && (
            <button
              type="button"
              onClick={onToggleLive}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                isLive
                  ? 'bg-navy-800/90 text-sky-300 border-navy-700 hover:bg-navy-750'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isLive ? 'Pause Stream' : 'Resume'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onEmergencyClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emergency</span> Alert
          </button>
        </div>
      </div>
    </header>
  );
};
