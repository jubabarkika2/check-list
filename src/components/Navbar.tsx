import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Shield,
  UserCheck,
  Clock,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { ManagerSettings } from '../types';

interface NavbarProps {
  settings: ManagerSettings;
  isManagerMode: boolean;
  onOpenPinModal: () => void;
  onExitManagerMode: () => void;
  submissionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isManagerMode,
  onOpenPinModal,
  onExitManagerMode,
  submissionsCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <Utensils className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight font-['Outfit',sans-serif] text-slate-100 line-clamp-1">
                {settings.restaurantName}
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Checklist Operacional
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
              {currentTime && <span>• {currentTime}</span>}
            </p>
          </div>
        </div>

        {/* Mode Switcher Button */}
        <div className="flex items-center gap-2">
          {isManagerMode ? (
            <button
              id="btn-nav-exit-manager"
              onClick={onExitManagerMode}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all active:scale-95 shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Voltar ao</span> Checklist Equipe
            </button>
          ) : (
            <button
              id="btn-nav-enter-manager"
              onClick={onOpenPinModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Shield className="w-4 h-4 text-slate-950" />
              <span>Acesso Gestor</span>
              {submissionsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
