import React from 'react';
import { X, CheckCircle, Calendar, User } from 'lucide-react';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  taskTitle: string;
  notes?: string;
  completedAt?: string;
  staffName?: string;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  taskTitle,
  notes,
  completedAt,
  staffName,
}) => {
  if (!isOpen || !photoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base line-clamp-1">{taskTitle}</h3>
              <p className="text-xs text-slate-400">Comprovante Fotográfico de Execução</p>
            </div>
          </div>
          <button
            id="btn-close-photo-viewer"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo Container */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center p-2 overflow-hidden">
          <img
            src={photoUrl}
            alt={taskTitle}
            className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Meta Info & Notes Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            {staffName && (
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md">
                <User className="w-3.5 h-3.5 text-amber-400" /> {staffName}
              </span>
            )}
            {completedAt && (
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />{' '}
                {new Date(completedAt).toLocaleString('pt-BR')}
              </span>
            )}
          </div>

          {notes && notes.trim() && (
            <div className="bg-slate-800/50 border border-slate-700/60 p-3 rounded-xl text-xs sm:text-sm text-slate-200">
              <span className="font-semibold text-amber-400 block mb-1">Observação da equipe:</span>
              <p className="italic text-slate-300">"{notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
