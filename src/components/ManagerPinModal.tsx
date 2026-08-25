import React, { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle } from 'lucide-react';

interface ManagerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
}

export const ManagerPinModal: React.FC<ManagerPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin === correctPin) {
        setTimeout(() => {
          onSuccess();
          setPin('');
        }, 150);
      } else if (newPin.length >= correctPin.length) {
        setError(true);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-end">
          <button
            id="btn-close-pin"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-slate-100 mb-1">Acesso do Gestor</h2>
        <p className="text-xs text-slate-400 text-center mb-6 max-w-xs">
          Apenas o gestor pode cadastrar, editar tarefas e configurar setores.
        </p>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                pin.length > index
                  ? error
                    ? 'bg-rose-500 scale-110'
                    : 'bg-amber-400 scale-110 shadow-sm shadow-amber-400/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-4 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 animate-shake">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>PIN incorreto. Tente novamente.</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`btn-pin-${digit}`}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xl font-bold text-slate-100 flex items-center justify-center active:scale-95 transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            id="btn-pin-clear"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-xs font-semibold text-slate-400 flex items-center justify-center active:scale-95 transition-all"
          >
            Limpar
          </button>
          <button
            id="btn-pin-0"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xl font-bold text-slate-100 flex items-center justify-center active:scale-95 transition-all shadow-sm"
          >
            0
          </button>
          <button
            id="btn-pin-backspace"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-sm font-semibold text-slate-300 flex items-center justify-center active:scale-95 transition-all"
          >
            ⌫
          </button>
        </div>

        <div className="mt-2 text-center">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <KeyRound className="w-3 h-3 text-amber-400" />
            PIN padrão inicial: <strong className="text-amber-300 font-mono">1234</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
