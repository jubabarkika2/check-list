import React, { useState } from 'react';
import {
  ClipboardCheck,
  PlusCircle,
  FolderPlus,
  Settings,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Camera,
  Calendar,
  User,
  Clock,
  Trash2,
  Edit2,
  Eye,
  Share2,
  Printer,
  ChevronRight,
  Shield,
  Layers,
  Save,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  Sector,
  TaskTemplate,
  ChecklistSubmission,
  ManagerSettings,
  ShiftType,
  PriorityType,
} from '../types';
import { SectorIcon } from './SectorIcon';
import { PhotoViewerModal } from './PhotoViewerModal';
import { generateWhatsAppLink } from '../utils/whatsappUtils';

interface ManagerDashboardProps {
  sectors: Sector[];
  tasks: TaskTemplate[];
  submissions: ChecklistSubmission[];
  settings: ManagerSettings;
  onUpdateSectors: (sectors: Sector[]) => void;
  onUpdateTasks: (tasks: TaskTemplate[]) => void;
  onUpdateSettings: (settings: ManagerSettings) => void;
  onUpdateSubmissions: (submissions: ChecklistSubmission[]) => void;
  onExitManager: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  sectors,
  tasks,
  submissions,
  settings,
  onUpdateSectors,
  onUpdateTasks,
  onUpdateSettings,
  onUpdateSubmissions,
  onExitManager,
}) => {
  const [activeTab, setActiveTab] = useState<'relatorios' | 'tarefas' | 'setores' | 'config'>('relatorios');

  // Relatórios filters & state
  const [selectedSubmission, setSelectedSubmission] = useState<ChecklistSubmission | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('todos');
  const [searchStaff, setSearchStaff] = useState<string>('');

  // Task creation/editing state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<{
    sectorId: string;
    title: string;
    description: string;
    shift: 'abertura' | 'turno' | 'fechamento';
    requiresPhoto: boolean;
    priority: PriorityType;
    isMandatory: boolean;
  }>({
    sectorId: sectors[0]?.id || 'salao-garcons',
    title: '',
    description: '',
    shift: 'abertura',
    requiresPhoto: true,
    priority: 'alta',
    isMandatory: true,
  });

  // Sector creation/editing state
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [sectorForm, setSectorForm] = useState<{
    name: string;
    icon: string;
    description: string;
  }>({
    name: '',
    icon: 'UtensilsCrossed',
    description: '',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<ManagerSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Photo viewer modal state
  const [viewerPhoto, setViewerPhoto] = useState<{
    url: string;
    title: string;
    notes?: string;
    completedAt?: string;
    staffName?: string;
  } | null>(null);

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (sectorFilter !== 'todos' && sub.sectorId !== sectorFilter) return false;
    if (
      searchStaff.trim() &&
      !sub.staffName.toLowerCase().includes(searchStaff.toLowerCase()) &&
      !sub.sectorName.toLowerCase().includes(searchStaff.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Task handlers
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    if (editingTaskId) {
      const updated = tasks.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              ...taskForm,
            }
          : t
      );
      onUpdateTasks(updated);
      setEditingTaskId(null);
    } else {
      const newTask: TaskTemplate = {
        id: 'task_' + Date.now(),
        ...taskForm,
        order: tasks.filter((t) => t.sectorId === taskForm.sectorId).length + 1,
      };
      onUpdateTasks([...tasks, newTask]);
      setIsAddingTask(false);
    }

    setTaskForm({
      sectorId: sectors[0]?.id || 'salao-garcons',
      title: '',
      description: '',
      shift: 'abertura',
      requiresPhoto: true,
      priority: 'alta',
      isMandatory: true,
    });
  };

  const handleEditTask = (task: TaskTemplate) => {
    setEditingTaskId(task.id);
    setTaskForm({
      sectorId: task.sectorId,
      title: task.title,
      description: task.description,
      shift: task.shift,
      requiresPhoto: task.requiresPhoto,
      priority: task.priority,
      isMandatory: task.isMandatory,
    });
    setIsAddingTask(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa do checklist?')) {
      onUpdateTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  // Sector handlers
  const handleSaveSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorForm.name.trim()) return;

    const newSector: Sector = {
      id: 'sector_' + Date.now(),
      name: sectorForm.name.trim(),
      icon: sectorForm.icon,
      color: 'amber',
      description: sectorForm.description.trim() || 'Tarefas do setor',
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateSectors([...sectors, newSector]);
    setIsAddingSector(false);
    setSectorForm({
      name: '',
      icon: 'UtensilsCrossed',
      description: '',
    });
  };

  const handleDeleteSector = (sectorId: string) => {
    if (confirm('Excluir este setor e todas as suas tarefas vinculadas?')) {
      onUpdateSectors(sectors.filter((s) => s.id !== sectorId));
      onUpdateTasks(tasks.filter((t) => t.sectorId !== sectorId));
    }
  };

  // Settings save handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleDeleteSubmission = (subId: string) => {
    if (confirm('Excluir este relatório do histórico?')) {
      const updated = submissions.filter((s) => s.id !== subId);
      onUpdateSubmissions(updated);
      if (selectedSubmission?.id === subId) {
        setSelectedSubmission(null);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Manager Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Painel de Gestão e Controle Operacional
            </div>
            <h1 className="text-2xl font-extrabold font-['Outfit',sans-serif] tracking-tight">
              {settings.restaurantName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Controle de tarefas, aprovação de relatórios e fotos dos garçons e cozinheiras.
            </p>
          </div>

          <button
            id="btn-back-to-checklist"
            onClick={onExitManager}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-2"
          >
            ← Voltar ao Modo Equipe
          </button>
        </div>

        {/* Manager Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-800/80">
          {[
            {
              id: 'relatorios',
              label: 'Relatórios & Auditorias',
              icon: ClipboardCheck,
              badge: submissions.length,
            },
            {
              id: 'tarefas',
              label: 'Gerenciar Tarefas',
              icon: PlusCircle,
              badge: tasks.length,
            },
            {
              id: 'setores',
              label: 'Setores do Restaurante',
              icon: FolderPlus,
              badge: sectors.length,
            },
            {
              id: 'config',
              label: 'Configurações & WhatsApp',
              icon: Settings,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-manager-${tab.id}`}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: RELATÓRIOS RECEBIDOS COM FOTOS */}
      {activeTab === 'relatorios' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full sm:w-auto relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-reports"
                type="text"
                placeholder="Buscar por funcionário ou setor..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                id="select-sector-filter"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="todos">Todos os Setores</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
              <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Nenhum relatório recebido ainda</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Quando os garçons ou cozinheiras finalizarem os checklists, os relatórios com as
                fotos aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubmissions.map((sub) => {
                const isApproved = sub.status === 'aprovado';
                const dateStr = new Date(sub.completedAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const percentage = Math.round(
                  (sub.completedTasks / Math.max(1, sub.totalTasks)) * 100
                );

                return (
                  <div
                    key={sub.id}
                    id={`report-card-${sub.id}`}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm p-4 sm:p-5 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 uppercase">
                            {sub.sectorName}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base mt-1 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-slate-400" />
                            {sub.staffName || 'Equipe'}
                          </h3>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Completo (100%)
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> {percentage}% Concluído
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-amber-500" /> {sub.withPhotoCount} Fotos
                        </span>
                      </div>

                      {/* Photo Thumbnails Preview */}
                      {sub.withPhotoCount > 0 && (
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                          {sub.items
                            .filter((item) => item.photoUrl)
                            .slice(0, 4)
                            .map((item, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  setViewerPhoto({
                                    url: item.photoUrl!,
                                    title: item.title,
                                    notes: item.notes,
                                    completedAt: item.completedAt,
                                    staffName: sub.staffName,
                                  })
                                }
                                className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-slate-200 group shadow-xs"
                              >
                                <img
                                  src={item.photoUrl}
                                  alt="comprovante"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                              </button>
                            ))}
                          {sub.withPhotoCount > 4 && (
                            <span className="text-[11px] text-slate-400 font-medium self-center">
                              +{sub.withPhotoCount - 4} mais
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Report Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`btn-view-report-${sub.id}`}
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                        </button>
                        <a
                          id={`btn-wa-resend-${sub.id}`}
                          href={generateWhatsAppLink(sub, settings.restaurantName, settings.managerPhone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="Enviar no WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <button
                        id={`btn-delete-report-${sub.id}`}
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Excluir Relatório"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GERENCIAR TAREFAS DOS SETORES */}
      {activeTab === 'tarefas' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Tarefas do Checklist
              </h2>
              <p className="text-xs text-slate-500">
                Apenas você (gestor) pode criar, editar ou desativar itens do checklist dos garçons e
                cozinheiras.
              </p>
            </div>

            <button
              id="btn-add-new-task"
              onClick={() => {
                setEditingTaskId(null);
                setIsAddingTask(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Nova Tarefa de Checklist
            </button>
          </div>

          {/* Form Modal / Inline for Add/Edit Task */}
          {isAddingTask && (
            <div className="bg-slate-900 border border-slate-800 text-white p-5 sm:p-6 rounded-3xl shadow-xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {editingTaskId ? 'Editar Tarefa' : 'Cadastrar Nova Tarefa no Checklist'}
                </h3>
                <button
                  id="btn-cancel-task-form"
                  onClick={() => setIsAddingTask(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                      Setor Responsável
                    </label>
                    <select
                      id="input-task-sector"
                      value={taskForm.sectorId}
                      onChange={(e) => setTaskForm({ ...taskForm, sectorId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    >
                      {sectors.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                      Turno de Execução
                    </label>
                    <select
                      id="input-task-shift"
                      value={taskForm.shift}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          shift: e.target.value as 'abertura' | 'turno' | 'fechamento',
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    >
                      <option value="abertura">🌅 Abertura do Restaurante</option>
                      <option value="turno">☀️ Durante o Turno</option>
                      <option value="fechamento">🌙 Fechamento & Limpeza</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Título da Tarefa *
                  </label>
                  <input
                    id="input-task-title"
                    type="text"
                    required
                    placeholder="Ex: Verificar e repor recipientes de molhos nas mesas"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Instruções / Como Fazer
                  </label>
                  <textarea
                    id="input-task-desc"
                    rows={2}
                    placeholder="Ex: Limpar os bicos das bisnagas com pano limpo e repor maionese e ketchup."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="input-task-requires-photo"
                      type="checkbox"
                      checked={taskForm.requiresPhoto}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, requiresPhoto: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-700 border-slate-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        Exigir Foto Comprobatória 📸
                      </span>
                      <span className="text-[11px] text-slate-400">
                        O funcionário terá que fotografar a tarefa pronta
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="input-task-mandatory"
                      type="checkbox"
                      checked={taskForm.isMandatory}
                      onChange={(e) => setTaskForm({ ...taskForm, isMandatory: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-700 border-slate-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        Tarefa Obrigatória ⚠️
                      </span>
                      <span className="text-[11px] text-slate-400">
                        O checklist só pode ser enviado se estiver marcada
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-save-task"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {editingTaskId ? 'Salvar Alterações' : 'Adicionar Tarefa'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Group Tasks by Sector */}
          <div className="space-y-6">
            {sectors.map((sec) => {
              const sectorTasks = tasks.filter((t) => t.sectorId === sec.id);

              return (
                <div key={sec.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <SectorIcon name={sec.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{sec.name}</h3>
                        <p className="text-xs text-slate-500">{sectorTasks.length} tarefas configuradas</p>
                      </div>
                    </div>
                  </div>

                  {sectorTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      Nenhuma tarefa cadastrada neste setor ainda.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {sectorTasks.map((t, index) => (
                        <div
                          key={t.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-xs font-bold text-slate-400 mt-0.5">
                              #{index + 1}
                            </span>
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                {t.requiresPhoto && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full flex items-center gap-1">
                                    <Camera className="w-2.5 h-2.5" /> Foto
                                  </span>
                                )}
                                {t.isMandatory && (
                                  <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.2 rounded-full">
                                    Obrigatória
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.2 rounded-full capitalize">
                                  {t.shift}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-800">{t.title}</h4>
                              {t.description && (
                                <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 self-end sm:self-center">
                            <button
                              id={`btn-edit-task-${t.id}`}
                              onClick={() => handleEditTask(t)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Editar Tarefa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-task-${t.id}`}
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Excluir Tarefa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GERENCIAR SETORES (SALÃO, COZINHA, BAR, ETC) */}
      {activeTab === 'setores' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Setores Operacionais
              </h2>
              <p className="text-xs text-slate-500">
                Você pode adicionar novos setores como Bar, Caixa, Fechamento ou Estoque.
              </p>
            </div>

            <button
              id="btn-add-new-sector"
              onClick={() => setIsAddingSector(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar Novo Setor
            </button>
          </div>

          {/* Add Sector Form Modal */}
          {isAddingSector && (
            <div className="bg-slate-900 border border-slate-800 text-white p-5 sm:p-6 rounded-3xl shadow-xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-amber-400" />
                  Cadastrar Novo Setor
                </h3>
                <button
                  id="btn-cancel-sector-form"
                  onClick={() => setIsAddingSector(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSector} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Nome do Setor *
                  </label>
                  <input
                    id="input-sector-name"
                    type="text"
                    required
                    placeholder="Ex: Bar & Bartenders, Caixa & Delivery, Estoque..."
                    value={sectorForm.name}
                    onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                      Ícone Visual
                    </label>
                    <select
                      id="input-sector-icon"
                      value={sectorForm.icon}
                      onChange={(e) => setSectorForm({ ...sectorForm, icon: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    >
                      <option value="UtensilsCrossed">🍽️ Salão / Garçons</option>
                      <option value="ChefHat">🍳 Cozinha / Cozinheiras</option>
                      <option value="Wine">🍸 Bar & Bebidas</option>
                      <option value="Sparkles">✨ Limpeza & Fechamento</option>
                      <option value="Boxes">📦 Estoque & Compras</option>
                      <option value="Store">💵 Caixa & Recepção</option>
                      <option value="Coffee">☕ Cafeteria & Sobremesas</option>
                      <option value="ShieldCheck">🛡️ Segurança & Auditoria</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                      Breve Descrição
                    </label>
                    <input
                      id="input-sector-desc"
                      type="text"
                      placeholder="Ex: Rotina de abertura e montagem de bebidas"
                      value={sectorForm.description}
                      onChange={(e) => setSectorForm({ ...sectorForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingSector(false)}
                    className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-save-sector"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Criar Setor
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sectors.map((sec) => {
              const count = tasks.filter((t) => t.sectorId === sec.id).length;
              return (
                <div
                  key={sec.id}
                  id={`sector-card-${sec.id}`}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                      <SectorIcon name={sec.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{sec.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{sec.description}</p>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        {count} tarefa(s)
                      </span>
                    </div>
                  </div>

                  {!sec.isDefault && (
                    <button
                      id={`btn-delete-sector-${sec.id}`}
                      onClick={() => handleDeleteSector(sec.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Excluir Setor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURAÇÕES & WHATSAPP */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif] mb-1">
              Configurações do Restaurante
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Defina o número de WhatsApp para recebimento automático dos relatórios e altere a senha
              de gerente.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Nome do Estabelecimento
                </label>
                <input
                  id="input-setting-restaurant-name"
                  type="text"
                  required
                  value={settingsForm.restaurantName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  WhatsApp do Gestor / Gerente (DDD + Número)
                </label>
                <input
                  id="input-setting-phone"
                  type="text"
                  placeholder="Ex: 5511999998888"
                  value={settingsForm.managerPhone}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, managerPhone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Quando a equipe clicar em "Enviar via WhatsApp", abrirá uma conversa direta para este número.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Senha / PIN de Acesso do Gestor
                </label>
                <input
                  id="input-setting-pin"
                  type="text"
                  maxLength={6}
                  value={settingsForm.pinCode}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, pinCode: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <input
                    id="input-setting-strict-photos"
                    type="checkbox"
                    checked={settingsForm.requirePhotosStrict}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        requirePhotosStrict: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Bloquear envio se faltar foto obrigatória
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Garante que o garçom ou cozinheira não consiga enviar sem anexar a foto da tarefa
                    </span>
                  </div>
                </label>
              </div>

              {settingsSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Configurações salvas com sucesso!
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="submit"
                  id="btn-save-settings"
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Full Detailed Submission View */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400">
                  Relatório de Execução #{selectedSubmission.id.slice(-5)}
                </span>
                <h2 className="text-lg font-bold text-slate-100">
                  {selectedSubmission.sectorName} — {selectedSubmission.staffName}
                </h2>
              </div>
              <button
                id="btn-close-sub-detail"
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Tasks List with Photos */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Meta stats banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">Horário de Envio</span>
                  <span className="text-xs font-bold text-slate-800">
                    {new Date(selectedSubmission.completedAt).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Turno</span>
                  <span className="text-xs font-bold text-slate-800 capitalize">
                    {selectedSubmission.shift}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Tarefas</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {selectedSubmission.completedTasks}/{selectedSubmission.totalTasks}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Fotos Comprovantes</span>
                  <span className="text-xs font-bold text-amber-600">
                    {selectedSubmission.withPhotoCount} fotos
                  </span>
                </div>
              </div>

              {/* Items List */}
              <h3 className="font-bold text-sm text-slate-900 pt-2">Detalhamento dos Itens:</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {selectedSubmission.items.map((item, idx) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          item.completed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {item.completed ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                        )}
                        {item.notes && (
                          <div className="mt-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                            <strong>Obs:</strong> {item.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Photo thumbnail */}
                    {item.photoUrl ? (
                      <button
                        onClick={() =>
                          setViewerPhoto({
                            url: item.photoUrl!,
                            title: item.title,
                            notes: item.notes,
                            completedAt: item.completedAt,
                            staffName: selectedSubmission.staffName,
                          })
                        }
                        className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1.5 rounded-xl transition-all self-end sm:self-center"
                      >
                        <img
                          src={item.photoUrl}
                          alt="Foto"
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <span className="text-xs font-bold text-slate-700 pr-1 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-amber-600" /> Ver Foto
                        </span>
                      </button>
                    ) : item.requiresPhoto ? (
                      <span className="text-[11px] text-slate-400 italic">Sem foto</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <a
                href={generateWhatsAppLink(
                  selectedSubmission,
                  settings.restaurantName,
                  settings.managerPhone
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Enviar no WhatsApp
              </a>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Size Photo Inspection Modal */}
      <PhotoViewerModal
        isOpen={Boolean(viewerPhoto)}
        onClose={() => setViewerPhoto(null)}
        photoUrl={viewerPhoto?.url || null}
        taskTitle={viewerPhoto?.title || ''}
        notes={viewerPhoto?.notes}
        completedAt={viewerPhoto?.completedAt}
        staffName={viewerPhoto?.staffName}
      />
    </div>
  );
};
