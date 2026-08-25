import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Camera,
  MessageSquare,
  AlertTriangle,
  Send,
  Sparkles,
  Info,
  Clock,
  User,
  Filter,
  Check,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Sector, TaskTemplate, TaskSubmissionItem, ShiftType, ChecklistSubmission, ManagerSettings } from '../types';
import { SectorIcon } from './SectorIcon';
import { CameraCaptureModal } from './CameraCaptureModal';
import { PhotoViewerModal } from './PhotoViewerModal';
import { playCheckSound } from '../utils/soundUtils';

interface StaffChecklistViewProps {
  sectors: Sector[];
  tasks: TaskTemplate[];
  settings: ManagerSettings;
  onSubmit: (submission: ChecklistSubmission) => void;
}

export const StaffChecklistView: React.FC<StaffChecklistViewProps> = ({
  sectors,
  tasks,
  settings,
  onSubmit,
}) => {
  // Active sector & shift
  const [selectedSectorId, setSelectedSectorId] = useState<string>(
    sectors[0]?.id || 'salao-garcons'
  );
  const [selectedShift, setSelectedShift] = useState<ShiftType>('abertura');
  const [staffName, setStaffName] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');

  // State of task answers for current session
  const [taskStates, setTaskStates] = useState<Record<string, {
    completed: boolean;
    photoUrl?: string;
    notes?: string;
    completedAt?: string;
  }>>({});

  // Active modals
  const [cameraModalTask, setCameraModalTask] = useState<{ id: string; title: string } | null>(null);
  const [viewerPhoto, setViewerPhoto] = useState<{
    url: string;
    title: string;
    notes?: string;
    completedAt?: string;
  } | null>(null);
  const [activeNoteTaskId, setActiveNoteTaskId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Active sector object
  const currentSector = useMemo(() => {
    return sectors.find((s) => s.id === selectedSectorId) || sectors[0];
  }, [sectors, selectedSectorId]);

  // Tasks for this sector and shift
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => t.sectorId === selectedSectorId)
      .filter((t) => {
        if (selectedShift === 'todos') return true;
        return t.shift === selectedShift;
      })
      .sort((a, b) => a.order - b.order);
  }, [tasks, selectedSectorId, selectedShift]);

  // Displayed tasks according to completion filter
  const displayedTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      const isCompleted = taskStates[t.id]?.completed;
      if (filterMode === 'pendentes') return !isCompleted;
      if (filterMode === 'concluidas') return isCompleted;
      return true;
    });
  }, [filteredTasks, taskStates, filterMode]);

  // Stats
  const totalTasksCount = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter((t) => taskStates[t.id]?.completed).length;
  const photosAttachedCount = filteredTasks.filter((t) => taskStates[t.id]?.photoUrl).length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const handleToggleTask = (taskId: string) => {
    const currentState = taskStates[taskId]?.completed || false;
    const nextState = !currentState;

    if (nextState) {
      playCheckSound();
    }

    setTaskStates((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        completed: nextState,
        completedAt: nextState ? new Date().toISOString() : undefined,
      },
    }));

    setValidationError(null);
  };

  const handlePhotoCaptured = (photoDataUrl: string) => {
    if (!cameraModalTask) return;
    const taskId = cameraModalTask.id;

    setTaskStates((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        completed: true, // Automatically check task when photo is taken!
        photoUrl: photoDataUrl,
        completedAt: prev[taskId]?.completedAt || new Date().toISOString(),
      },
    }));
  };

  const handleRemovePhoto = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskStates((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        photoUrl: undefined,
      },
    }));
  };

  const handleNoteChange = (taskId: string, notes: string) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        notes,
      },
    }));
  };

  const handleSubmitChecklist = () => {
    // Validation
    const uncompletedMandatory = filteredTasks.filter(
      (t) => t.isMandatory && !taskStates[t.id]?.completed
    );

    const missingRequiredPhotos = filteredTasks.filter(
      (t) => t.requiresPhoto && taskStates[t.id]?.completed && !taskStates[t.id]?.photoUrl
    );

    if (uncompletedMandatory.length > 0) {
      setValidationError(
        `Atenção: Existem ${uncompletedMandatory.length} tarefa(s) obrigatória(s) pendente(s). Complete todas para enviar.`
      );
      return;
    }

    if (missingRequiredPhotos.length > 0 && settings.requirePhotosStrict) {
      setValidationError(
        `Atenção: ${missingRequiredPhotos.length} tarefa(s) exigem foto comprobatória da execução. Tire a foto para comprovar.`
      );
      return;
    }

    const items: TaskSubmissionItem[] = filteredTasks.map((t) => {
      const state = taskStates[t.id];
      return {
        taskId: t.id,
        title: t.title,
        description: t.description,
        shift: t.shift,
        completed: Boolean(state?.completed),
        completedAt: state?.completedAt,
        photoUrl: state?.photoUrl,
        notes: state?.notes,
        requiresPhoto: t.requiresPhoto,
        isMandatory: t.isMandatory,
      };
    });

    const submission: ChecklistSubmission = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      sectorId: currentSector.id,
      sectorName: currentSector.name,
      staffName: staffName.trim() || 'Equipe do Setor',
      shift: selectedShift,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalTasks: totalTasksCount,
      completedTasks: completedTasksCount,
      withPhotoCount: photosAttachedCount,
      items,
      status: completedTasksCount === totalTasksCount ? 'aprovado' : 'pendente_revisao',
    };

    onSubmit(submission);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* 1. SECTOR SELECTOR CARDS */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Selecione o Setor do Restaurante
          </label>
          <span className="text-[11px] text-amber-700 bg-amber-50 font-medium px-2 py-0.5 rounded-full border border-amber-200">
            {sectors.length} setores ativos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {sectors.map((sec) => {
            const isSelected = sec.id === selectedSectorId;
            return (
              <button
                key={sec.id}
                id={`sector-tab-${sec.id}`}
                onClick={() => {
                  setSelectedSectorId(sec.id);
                  setValidationError(null);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 active:scale-[0.98] ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <SectorIcon name={sec.icon} className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-slate-900">{sec.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{sec.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. STAFF IDENTIFICATION & SHIFT SELECTOR */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Staff Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              Responsável pelo Checklist
            </label>
            <input
              id="input-staff-name"
              type="text"
              placeholder="Ex: Carlos (Garçom) ou Maria (Cozinheira)"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
            {/* Quick Staff Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Garçom 1', 'Garçom 2', 'Cozinheira Chefe', 'Aux. Cozinha', 'Turno Noite'].map(
                (quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setStaffName(quick)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    + {quick}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Shift Filter Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Etapa / Turno do Dia
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'abertura', label: '🌅 Abertura' },
                { id: 'turno', label: '☀️ Turno' },
                { id: 'fechamento', label: '🌙 Fechamento' },
              ].map((shift) => {
                const isActive = selectedShift === shift.id;
                return (
                  <button
                    key={shift.id}
                    type="button"
                    id={`shift-tab-${shift.id}`}
                    onClick={() => {
                      setSelectedShift(shift.id as ShiftType);
                      setValidationError(null);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {shift.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-time Progress Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Progresso do Checklist ({currentSector.name})
            </span>
            <span className="text-slate-900 font-bold">
              {completedTasksCount}/{totalTasksCount} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 rounded-full transition-all duration-300 shadow-inner"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              {photosAttachedCount} foto(s) comprovatórias anexadas
            </span>
            {totalTasksCount - completedTasksCount > 0 ? (
              <span className="text-amber-700 font-medium">
                Faltam {totalTasksCount - completedTasksCount} tarefas
              </span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Todas concluídas!
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 3. TASK LIST WITH FILTERS */}
      <section className="space-y-3">
        {/* Filter bar */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Outfit',sans-serif]">
            <span>Tarefas a Cumprir</span>
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-sans font-semibold">
              {displayedTasks.length}
            </span>
          </h2>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterMode('todas')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterMode === 'todas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterMode('pendentes')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterMode === 'pendentes' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pendentes ({totalTasksCount - completedTasksCount})
            </button>
            <button
              onClick={() => setFilterMode('concluidas')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterMode === 'concluidas' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Prontas ({completedTasksCount})
            </button>
          </div>
        </div>

        {/* Task Cards */}
        {displayedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-800 text-sm">Nenhuma tarefa encontrada neste filtro.</p>
            <p className="text-xs text-slate-500 mt-1">
              {filterMode === 'pendentes'
                ? 'Parabéns! Todas as tarefas deste turno foram concluídas.'
                : 'Não há tarefas cadastradas para este setor/turno.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedTasks.map((task, index) => {
              const state = taskStates[task.id];
              const isCompleted = Boolean(state?.completed);
              const hasPhoto = Boolean(state?.photoUrl);
              const hasNotes = Boolean(state?.notes && state.notes.trim());
              const isNoteActive = activeNoteTaskId === task.id;

              return (
                <div
                  key={task.id}
                  id={`task-card-${task.id}`}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-300/80 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3.5">
                      {/* Interactive Checkbox */}
                      <button
                        type="button"
                        id={`btn-check-${task.id}`}
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 ring-2 ring-emerald-500/20'
                            : 'border-2 border-slate-300 bg-slate-50 hover:border-amber-500 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-bold text-slate-400">
                            #{index + 1}
                          </span>

                          {task.requiresPhoto && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              hasPhoto
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              <Camera className="w-3 h-3" />
                              {hasPhoto ? 'Foto Anexada' : 'Foto Obrigatória'}
                            </span>
                          )}

                          {task.isMandatory && (
                            <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                              Obrigatória
                            </span>
                          )}

                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                            {task.shift}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => handleToggleTask(task.id)}
                          className={`text-sm sm:text-base font-bold cursor-pointer transition-colors leading-snug ${
                            isCompleted ? 'text-slate-800 line-through decoration-emerald-500/60 decoration-2' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {/* Description / Instructions */}
                        {task.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Actions & Proof Buttons */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                          {/* Take / View Photo Button */}
                          {hasPhoto ? (
                            <div className="flex items-center gap-1.5 bg-emerald-100/70 border border-emerald-200 p-1.5 rounded-xl">
                              <button
                                type="button"
                                id={`btn-view-photo-${task.id}`}
                                onClick={() =>
                                  setViewerPhoto({
                                    url: state!.photoUrl!,
                                    title: task.title,
                                    notes: state?.notes,
                                    completedAt: state?.completedAt,
                                  })
                                }
                                className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-950 px-2 py-1 bg-white rounded-lg shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                Ver Foto
                              </button>
                              <button
                                type="button"
                                id={`btn-retake-${task.id}`}
                                onClick={() =>
                                  setCameraModalTask({ id: task.id, title: task.title })
                                }
                                className="text-[11px] font-medium text-emerald-800 hover:bg-emerald-200/50 px-2 py-1 rounded-lg"
                              >
                                Trocar
                              </button>
                              <button
                                type="button"
                                id={`btn-delete-photo-${task.id}`}
                                onClick={(e) => handleRemovePhoto(task.id, e)}
                                className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg"
                                title="Remover Foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              id={`btn-open-camera-${task.id}`}
                              onClick={() =>
                                setCameraModalTask({ id: task.id, title: task.title })
                              }
                              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 ${
                                task.requiresPhoto
                                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs shadow-amber-500/20'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              <Camera className="w-3.5 h-3.5" />
                              {task.requiresPhoto ? 'Bater Foto Comprobatória' : 'Anexar Foto (Opcional)'}
                            </button>
                          )}

                          {/* Notes toggle */}
                          <button
                            type="button"
                            id={`btn-note-toggle-${task.id}`}
                            onClick={() =>
                              setActiveNoteTaskId(isNoteActive ? null : task.id)
                            }
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-2 rounded-xl transition-colors ${
                              hasNotes
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                            {hasNotes ? 'Obs. Anotada' : 'Adicionar Obs'}
                            {isNoteActive ? (
                              <ChevronUp className="w-3 h-3 ml-0.5" />
                            ) : (
                              <ChevronDown className="w-3 h-3 ml-0.5" />
                            )}
                          </button>
                        </div>

                        {/* Collapsible Note Input */}
                        {isNoteActive && (
                          <div className="mt-2.5 animate-in slide-in-from-top-1 duration-150">
                            <textarea
                              id={`input-note-${task.id}`}
                              rows={2}
                              placeholder="Alguma observação? Ex: 'Reposto do estoque geral', 'Falta desinfetante'..."
                              value={state?.notes || ''}
                              onChange={(e) => handleNoteChange(task.id, e.target.value)}
                              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder:text-slate-400 shadow-inner"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Validation Message Box */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{validationError}</p>
          </div>
        </div>
      )}

      {/* 4. STICKY BOTTOM SUBMISSION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-900">
              {currentSector.name} • {completedTasksCount} de {totalTasksCount} concluídas
            </div>
            <div className="text-[11px] text-slate-500">
              {photosAttachedCount} foto(s) de comprovação incluídas
            </div>
          </div>

          <button
            id="btn-submit-checklist"
            onClick={handleSubmitChecklist}
            className={`w-full sm:w-auto sm:min-w-[260px] py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
              completedTasksCount === totalTasksCount && totalTasksCount > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Enviar Checklist ao Gestor</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <CameraCaptureModal
        isOpen={Boolean(cameraModalTask)}
        onClose={() => setCameraModalTask(null)}
        onPhotoCaptured={handlePhotoCaptured}
        taskTitle={cameraModalTask?.title || ''}
      />

      <PhotoViewerModal
        isOpen={Boolean(viewerPhoto)}
        onClose={() => setViewerPhoto(null)}
        photoUrl={viewerPhoto?.url || null}
        taskTitle={viewerPhoto?.title || ''}
        notes={viewerPhoto?.notes}
        completedAt={viewerPhoto?.completedAt}
        staffName={staffName}
      />
    </div>
  );
};
