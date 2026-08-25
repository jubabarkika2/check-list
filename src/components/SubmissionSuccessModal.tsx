import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Share2,
  Camera,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ChecklistSubmission } from '../types';
import { generateWhatsAppLink } from '../utils/whatsappUtils';
import { playCelebrationFanfare } from '../utils/soundUtils';

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: ChecklistSubmission | null;
  restaurantName: string;
  managerPhone: string;
  onStartNew: () => void;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  isOpen,
  onClose,
  submission,
  restaurantName,
  managerPhone,
  onStartNew,
}) => {
  useEffect(() => {
    if (isOpen && submission) {
      playCelebrationFanfare();

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      } catch {
        // Ignore if blocked
      }
    }
  }, [isOpen, submission]);

  if (!isOpen || !submission) return null;

  const whatsAppUrl = generateWhatsAppLink(submission, restaurantName, managerPhone);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white text-center relative">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-1 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Checklist Finalizado
          </div>
          <h2 className="text-2xl font-bold font-['Outfit',sans-serif]">
            Relatório Enviado!
          </h2>
          <p className="text-emerald-100 text-xs mt-1">
            As tarefas foram registradas e salvas com sucesso.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-medium">Setor & Turno</span>
              <span className="text-xs font-bold text-slate-800 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {submission.sectorName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{submission.staffName || 'Equipe'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(submission.completedAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-xl font-bold text-emerald-600 block">
                  {submission.completedTasks}/{submission.totalTasks}
                </span>
                <span className="text-[11px] text-slate-500">Tarefas Feitas</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-xl font-bold text-amber-600 flex items-center justify-center gap-1">
                  <Camera className="w-4 h-4 text-amber-500" />
                  {submission.withPhotoCount}
                </span>
                <span className="text-[11px] text-slate-500">Fotos Anexadas</span>
              </div>
            </div>
          </div>

          {/* Action: WhatsApp */}
          <a
            id="btn-whatsapp-share"
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98]"
          >
            <Share2 className="w-5 h-5" />
            Enviar via WhatsApp para o Gestor
          </a>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              id="btn-new-checklist"
              onClick={() => {
                onClose();
                onStartNew();
              }}
              className="py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Novo Checklist
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
