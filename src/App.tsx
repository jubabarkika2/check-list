import React, { useState, useEffect } from 'react';
import { Sector, TaskTemplate, ChecklistSubmission, ManagerSettings } from './types';
import {
  getSectors,
  saveSectors,
  getTasks,
  saveTasks,
  getSubmissions,
  saveSubmissions,
  addSubmission,
  getSettings,
  saveSettings,
} from './utils/storageUtils';
import { Navbar } from './components/Navbar';
import { StaffChecklistView } from './components/StaffChecklistView';
import { ManagerDashboard } from './components/ManagerDashboard';
import { ManagerPinModal } from './components/ManagerPinModal';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';

export default function App() {
  const [sectors, setSectors] = useState<Sector[]>(() => getSectors());
  const [tasks, setTasks] = useState<TaskTemplate[]>(() => getTasks());
  const [submissions, setSubmissions] = useState<ChecklistSubmission[]>(() => getSubmissions());
  const [settings, setSettings] = useState<ManagerSettings>(() => getSettings());

  // App mode: 'staff' (waiters, cooks) or 'manager' (admin dashboard)
  const [isManagerMode, setIsManagerMode] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Success modal after submission
  const [lastSubmission, setLastSubmission] = useState<ChecklistSubmission | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Sync state changes to storage
  const handleUpdateSectors = (newSectors: Sector[]) => {
    setSectors(newSectors);
    saveSectors(newSectors);
  };

  const handleUpdateTasks = (newTasks: TaskTemplate[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const handleUpdateSettings = (newSettings: ManagerSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleUpdateSubmissions = (newSubmissions: ChecklistSubmission[]) => {
    setSubmissions(newSubmissions);
    saveSubmissions(newSubmissions);
  };

  const handleStaffSubmit = (submission: ChecklistSubmission) => {
    const updated = addSubmission(submission);
    setSubmissions(updated);
    setLastSubmission(submission);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Navigation */}
      <Navbar
        settings={settings}
        isManagerMode={isManagerMode}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onExitManagerMode={() => setIsManagerMode(false)}
        submissionsCount={submissions.length}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-6">
        {isManagerMode ? (
          <ManagerDashboard
            sectors={sectors}
            tasks={tasks}
            submissions={submissions}
            settings={settings}
            onUpdateSectors={handleUpdateSectors}
            onUpdateTasks={handleUpdateTasks}
            onUpdateSettings={handleUpdateSettings}
            onUpdateSubmissions={handleUpdateSubmissions}
            onExitManager={() => setIsManagerMode(false)}
          />
        ) : (
          <StaffChecklistView
            sectors={sectors}
            tasks={tasks}
            settings={settings}
            onSubmit={handleStaffSubmit}
          />
        )}
      </main>

      {/* Manager Access PIN Modal */}
      <ManagerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setIsManagerMode(true);
        }}
        correctPin={settings.pinCode || '1234'}
      />

      {/* Checklist Submission Success & WhatsApp Modal */}
      <SubmissionSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        submission={lastSubmission}
        restaurantName={settings.restaurantName}
        managerPhone={settings.managerPhone}
        onStartNew={() => {
          setIsSuccessModalOpen(false);
          // Auto scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
