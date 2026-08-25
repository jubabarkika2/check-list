import { Sector, TaskTemplate, ChecklistSubmission, ManagerSettings } from '../types';
import { DEFAULT_SECTORS, DEFAULT_TASKS, DEFAULT_SETTINGS } from '../data/defaultData';

const SECTORS_KEY = 'restaurant_checklist_sectors_v1';
const TASKS_KEY = 'restaurant_checklist_tasks_v1';
const SUBMISSIONS_KEY = 'restaurant_checklist_submissions_v1';
const SETTINGS_KEY = 'restaurant_checklist_settings_v1';

export function getSectors(): Sector[] {
  try {
    const raw = localStorage.getItem(SECTORS_KEY);
    if (!raw) {
      localStorage.setItem(SECTORS_KEY, JSON.stringify(DEFAULT_SECTORS));
      return DEFAULT_SECTORS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SECTORS;
  }
}

export function saveSectors(sectors: Sector[]): void {
  try {
    localStorage.setItem(SECTORS_KEY, JSON.stringify(sectors));
  } catch (err) {
    console.error('Error saving sectors:', err);
  }
}

export function getTasks(): TaskTemplate[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks: TaskTemplate[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks:', err);
  }
}

export function getSubmissions(): ChecklistSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSubmissions(submissions: ChecklistSubmission[]): void {
  try {
    // Keep last 100 submissions to prevent local storage overflow
    const trimmed = submissions.slice(0, 100);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Error saving submissions:', err);
  }
}

export function addSubmission(submission: ChecklistSubmission): ChecklistSubmission[] {
  const current = getSubmissions();
  const updated = [submission, ...current];
  saveSubmissions(updated);
  return updated;
}

export function getSettings(): ManagerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ManagerSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(SECTORS_KEY, JSON.stringify(DEFAULT_SECTORS));
  localStorage.setItem(TASKS_KEY, JSON.stringify(DEFAULT_TASKS));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
}
