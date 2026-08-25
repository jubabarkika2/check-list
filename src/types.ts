export type ShiftType = 'todos' | 'abertura' | 'turno' | 'fechamento';

export type PriorityType = 'alta' | 'media' | 'baixa';

export interface Sector {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface TaskTemplate {
  id: string;
  sectorId: string;
  title: string;
  description: string;
  shift: 'abertura' | 'turno' | 'fechamento';
  requiresPhoto: boolean;
  priority: PriorityType;
  isMandatory: boolean;
  order: number;
}

export interface TaskSubmissionItem {
  taskId: string;
  title: string;
  description: string;
  shift: 'abertura' | 'turno' | 'fechamento';
  completed: boolean;
  completedAt?: string;
  photoUrl?: string;
  notes?: string;
  requiresPhoto: boolean;
  isMandatory: boolean;
}

export interface ChecklistSubmission {
  id: string;
  sectorId: string;
  sectorName: string;
  staffName: string;
  shift: ShiftType;
  startedAt: string;
  completedAt: string;
  totalTasks: number;
  completedTasks: number;
  withPhotoCount: number;
  items: TaskSubmissionItem[];
  status: 'aprovado' | 'pendente_revisao' | 'com_ressalvas';
  managerFeedback?: string;
  managerReviewedAt?: string;
  sentViaWhatsApp?: boolean;
}

export interface ManagerSettings {
  restaurantName: string;
  managerName: string;
  managerPhone: string;
  pinCode: string;
  requirePhotosStrict: boolean;
  soundEnabled: boolean;
}
