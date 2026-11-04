import { useState, useEffect, useMemo } from 'react';
import { Material, OperationType, ToolType, LatheGearConfig, SavedJob, MachineEnvironment, WorkshopTool } from './types/machining';
import { MATERIALS } from './data/materials';
import { DEFAULT_LATHE_CONFIGS } from './data/lathes';
import { DEFAULT_WORKSHOP_TOOLS } from './data/defaultTools';
import { calculateCuttingParams } from './utils/calculator';
import { rankToolsForJob, getDualToolRecommendation } from './utils/toolRecommender';
import { haptics } from './utils/haptics';
import { getStoredItem, setStoredItem, removeStoredItem } from './utils/storage';

// Components
import { IosHeader } from './components/IosHeader';
import { PrimaryResultHero } from './components/PrimaryResultHero';
import { DiameterInputSection } from './components/DiameterInputSection';
import { MaterialBarAndModal } from './components/MaterialBarAndModal';
import { OperationToggle } from './components/OperationToggle';
import { RecommendedToolCard } from './components/RecommendedToolCard';
import { ToolDatabaseModal } from './components/ToolDatabaseModal';
import { MachineSettingsModal } from './components/MachineSettingsModal';
import { DrillingCalculator } from './components/DrillingCalculator';
import { FormulasCheatSheet } from './components/FormulasCheatSheet';
import { SavedJobsModal } from './components/SavedJobsModal';
import { BottomTabBar, AppTab } from './components/BottomTabBar';
import { AuthModal } from './components/AuthModal';
import { BackupModal } from './components/BackupModal';
import {
  auth,
  onAuthStateChanged,
  signOutUser,
  fetchUserToolsFromFirestore,
  syncUserToolsToFirestore,
  fetchUserJobsFromFirestore,
  syncUserJobsToFirestore,
  fetchUserMaterialsFromFirestore,
  syncUserMaterialsToFirestore,
  deleteUserMaterialFromFirestore,
  User,
} from './lib/firebase';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = getStoredItem('theme');
      if (savedTheme) return savedTheme === 'dark';
    }
    return true; // Default dark workshop mode
  });

  // Sound haptics state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('sound_enabled');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  // Machine configuration state
  const [activeLathe, setActiveLathe] = useState<LatheGearConfig>(() => {
    try {
      const saved = getStoredItem('active_lathe');
      if (saved) {
        const parsed = JSON.parse(saved);
        const preset = DEFAULT_LATHE_CONFIGS.find((l) => l.id === parsed.id);
        if (preset) return preset;
      }
    } catch {}
    return DEFAULT_LATHE_CONFIGS[0];
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('active_tab') as AppTab;
      if (saved && ['turning', 'drilling', 'formulas', 'jobs'].includes(saved)) {
        return saved;
      }
    }
    return 'turning';
  });

  // Machining Environment (Default: manual workshop lathe)
  const [environment, setEnvironment] = useState<MachineEnvironment>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('environment') as MachineEnvironment;
      if (saved && (saved === 'manual' || saved === 'cnc')) {
        return saved;
      }
    }
    return 'manual';
  });

  // Custom Materials State
  const [customMaterials, setCustomMaterials] = useState<Material[]>(() => {
    try {
      const saved = getStoredItem('custom_materials_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Machining Core Inputs
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(() => {
    if (typeof window !== 'undefined') {
      const savedId = getStoredItem('selected_material_id');
      if (savedId) {
        try {
          const savedCustom = getStoredItem('custom_materials_v1');
          if (savedCustom) {
            const parsed: Material[] = JSON.parse(savedCustom);
            const foundCustom = parsed.find((m) => m.id === savedId);
            if (foundCustom) return foundCustom;
          }
        } catch {}
        const found = MATERIALS.find((m) => m.id === savedId);
        if (found) return found;
      }
    }
    return MATERIALS[0]; // POM-C (Kunststoff)
  });
  const [diameter, setDiameter] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('diameter');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    return 25;
  });
  const [operation, setOperation] = useState<OperationType>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('operation') as OperationType;
      if (saved && ['roughing', 'finishing', 'parting'].includes(saved)) {
        return saved;
      }
    }
    return 'roughing';
  });
  const [toolType, setToolType] = useState<ToolType>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('tool_type') as ToolType;
      if (saved && ['carbide', 'hss'].includes(saved)) {
        return saved;
      }
    }
    return 'carbide';
  });

  // Workshop Tools Database State
  const [tools, setTools] = useState<WorkshopTool[]>(() => {
    try {
      const saved = getStoredItem('user_tools');
      if (saved) {
        const parsed: WorkshopTool[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((t) => t.id));
        const missingNewTools = DEFAULT_WORKSHOP_TOOLS.filter((t) => !existingIds.has(t.id));
        if (missingNewTools.length > 0) {
          const merged = [...missingNewTools, ...parsed];
          setStoredItem('user_tools', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_WORKSHOP_TOOLS;
  });
  const [selectedToolId, setSelectedToolId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('selected_tool_id');
      if (saved) return saved;
    }
    return undefined;
  });
  const [isToolModalOpen, setIsToolModalOpen] = useState<boolean>(false);

  // Compute Tool Recommendations for current job (separating owned vs unowned)
  const dualToolResult = useMemo(() => {
    return getDualToolRecommendation(selectedMaterial, diameter, operation, toolType, tools);
  }, [selectedMaterial, diameter, operation, toolType, tools]);

  const activeTool = selectedToolId
    ? tools.find((t) => t.id === selectedToolId) || dualToolResult.bestOwned?.tool || dualToolResult.bestOverall?.tool
    : dualToolResult.bestOwned?.tool || dualToolResult.bestOverall?.tool;

  const handleToggleToolOwnership = (toolId: string) => {
    const updated = tools.map((t) => (t.id === toolId ? { ...t, isOwned: !t.isOwned } : t));
    setTools(updated);
    try {
      setStoredItem('user_tools', JSON.stringify(updated));
    } catch {}
    const changed = updated.find((t) => t.id === toolId);
    showToast(
      changed?.isOwned
        ? `In Werkstatt übernommen: ${changed.name}`
        : `Aus Bestand entfernt: ${changed?.name}`
    );
  };

  // Fine-tuning overrides (optional)
  const [customVcOverride, setCustomVcOverride] = useState<number | undefined>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('custom_vc');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val)) return val;
      }
    }
    return undefined;
  });
  const [customFeedOverride, setCustomFeedOverride] = useState<number | undefined>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('custom_feed');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val)) return val;
      }
    }
    return undefined;
  });
  const [customApOverride, setCustomApOverride] = useState<number | undefined>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('custom_ap');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val)) return val;
      }
    }
    return undefined;
  });

  // Saved Jobs state
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(() => {
    try {
      const saved = getStoredItem('saved_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast notification for user action
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Firebase Auth state & Auth Modal
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  // Auth state listener and initial Firestore data fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user tools from Firestore
        try {
          const remoteTools = await fetchUserToolsFromFirestore(user.uid);
          if (remoteTools && remoteTools.length > 0) {
            setTools(remoteTools);
            setStoredItem('user_tools', JSON.stringify(remoteTools));
          } else if (tools.length > 0) {
            await syncUserToolsToFirestore(user.uid, tools);
          }
        } catch (e) {
          console.error('Error fetching remote tools:', e);
        }

        // Fetch user jobs from Firestore
        try {
          const remoteJobs = await fetchUserJobsFromFirestore(user.uid);
          if (remoteJobs && remoteJobs.length > 0) {
            setSavedJobs(remoteJobs);
            setStoredItem('saved_jobs', JSON.stringify(remoteJobs));
          } else if (savedJobs.length > 0) {
            await syncUserJobsToFirestore(user.uid, savedJobs);
          }
        } catch (e) {
          console.error('Error fetching remote jobs:', e);
        }

        // Fetch user custom materials from Firestore
        try {
          const remoteMats = await fetchUserMaterialsFromFirestore(user.uid);
          if (remoteMats && remoteMats.length > 0) {
            setCustomMaterials(remoteMats);
            setStoredItem('custom_materials_v1', JSON.stringify(remoteMats));
          } else if (customMaterials.length > 0) {
            await syncUserMaterialsToFirestore(user.uid, customMaterials);
          }
        } catch (e) {
          console.error('Error fetching remote custom materials:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync tools to Firestore when updated and user is logged in
  useEffect(() => {
    if (currentUser) {
      syncUserToolsToFirestore(currentUser.uid, tools);
    }
  }, [tools, currentUser]);

  // Sync saved jobs to Firestore when updated and user is logged in
  useEffect(() => {
    if (currentUser) {
      syncUserJobsToFirestore(currentUser.uid, savedJobs);
    }
  }, [savedJobs, currentUser]);

  // Sync custom materials to Firestore when updated and user is logged in
  useEffect(() => {
    if (currentUser) {
      syncUserMaterialsToFirestore(currentUser.uid, customMaterials);
    }
  }, [customMaterials, currentUser]);

  const handleSaveCustomMaterial = (mat: Material) => {
    const exists = customMaterials.some((m) => m.id === mat.id);
    const updated = exists
      ? customMaterials.map((m) => (m.id === mat.id ? mat : m))
      : [mat, ...customMaterials];
    setCustomMaterials(updated);
    try {
      setStoredItem('custom_materials_v1', JSON.stringify(updated));
    } catch {}
    if (currentUser) {
      syncUserMaterialsToFirestore(currentUser.uid, updated);
    }
    showToast(`Werkstoff "${mat.name}" gespeichert.`);
  };

  const handleDeleteCustomMaterial = (id: string) => {
    const updated = customMaterials.filter((m) => m.id !== id);
    setCustomMaterials(updated);
    try {
      setStoredItem('custom_materials_v1', JSON.stringify(updated));
    } catch {}
    if (currentUser) {
      deleteUserMaterialFromFirestore(currentUser.uid, id);
    }
    if (selectedMaterial.id === id) {
      setSelectedMaterial(MATERIALS[0]);
    }
    showToast('Werkstoff gelöscht.');
  };

  const handleImportData = (
    data: {
      tools?: WorkshopTool[];
      customMaterials?: Material[];
      lathes?: LatheGearConfig[];
      savedJobs?: SavedJob[];
    },
    mode: 'merge' | 'replace'
  ) => {
    if (mode === 'replace') {
      if (data.tools && Array.isArray(data.tools)) {
        setTools(data.tools);
        setStoredItem('user_tools', JSON.stringify(data.tools));
        if (currentUser) syncUserToolsToFirestore(currentUser.uid, data.tools);
      }
      if (data.customMaterials && Array.isArray(data.customMaterials)) {
        setCustomMaterials(data.customMaterials);
        setStoredItem('custom_materials_v1', JSON.stringify(data.customMaterials));
        if (currentUser) syncUserMaterialsToFirestore(currentUser.uid, data.customMaterials);
      }
      if (data.savedJobs && Array.isArray(data.savedJobs)) {
        setSavedJobs(data.savedJobs);
        setStoredItem('saved_jobs', JSON.stringify(data.savedJobs));
        if (currentUser) syncUserJobsToFirestore(currentUser.uid, data.savedJobs);
      }
    } else {
      // Merge mode
      if (data.tools && Array.isArray(data.tools) && data.tools.length > 0) {
        const existingIds = new Set(tools.map((t) => t.id));
        const newTools = data.tools.filter((t) => !existingIds.has(t.id));
        const mergedTools = [...newTools, ...tools];
        setTools(mergedTools);
        setStoredItem('user_tools', JSON.stringify(mergedTools));
        if (currentUser) syncUserToolsToFirestore(currentUser.uid, mergedTools);
      }
      if (data.customMaterials && Array.isArray(data.customMaterials) && data.customMaterials.length > 0) {
        const existingMatIds = new Set(customMaterials.map((m) => m.id));
        const newMats = data.customMaterials.filter((m) => !existingMatIds.has(m.id));
        const mergedMats = [...newMats, ...customMaterials];
        setCustomMaterials(mergedMats);
        setStoredItem('custom_materials_v1', JSON.stringify(mergedMats));
        if (currentUser) syncUserMaterialsToFirestore(currentUser.uid, mergedMats);
      }
      if (data.savedJobs && Array.isArray(data.savedJobs) && data.savedJobs.length > 0) {
        const existingJobIds = new Set(savedJobs.map((j) => j.id));
        const newJobs = data.savedJobs.filter((j) => !existingJobIds.has(j.id));
        const mergedJobs = [...newJobs, ...savedJobs];
        setSavedJobs(mergedJobs);
        setStoredItem('saved_jobs', JSON.stringify(mergedJobs));
        if (currentUser) syncUserJobsToFirestore(currentUser.uid, mergedJobs);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast('Erfolgreich abgemeldet.');
    } catch (e) {
      console.error(e);
    }
  };

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setStoredItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Sync sound setting
  useEffect(() => {
    haptics.enabled = soundEnabled;
    setStoredItem('sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  // Persist user choices across restarts
  useEffect(() => {
    setStoredItem('active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    setStoredItem('environment', environment);
  }, [environment]);

  useEffect(() => {
    setStoredItem('selected_material_id', selectedMaterial.id);
  }, [selectedMaterial]);

  useEffect(() => {
    setStoredItem('diameter', String(diameter));
  }, [diameter]);

  useEffect(() => {
    setStoredItem('operation', operation);
  }, [operation]);

  useEffect(() => {
    setStoredItem('tool_type', toolType);
  }, [toolType]);

  useEffect(() => {
    if (selectedToolId) {
      setStoredItem('selected_tool_id', selectedToolId);
    } else {
      removeStoredItem('selected_tool_id');
    }
  }, [selectedToolId]);

  useEffect(() => {
    if (customVcOverride !== undefined) {
      setStoredItem('custom_vc', String(customVcOverride));
    } else {
      removeStoredItem('custom_vc');
    }
  }, [customVcOverride]);

  useEffect(() => {
    if (customFeedOverride !== undefined) {
      setStoredItem('custom_feed', String(customFeedOverride));
    } else {
      removeStoredItem('custom_feed');
    }
  }, [customFeedOverride]);

  useEffect(() => {
    if (customApOverride !== undefined) {
      setStoredItem('custom_ap', String(customApOverride));
    } else {
      removeStoredItem('custom_ap');
    }
  }, [customApOverride]);

  // Calculate Result whenever inputs change
  const calculationResult = useMemo(() => {
    return calculateCuttingParams(
      selectedMaterial,
      diameter,
      operation,
      toolType,
      activeLathe,
      environment,
      customVcOverride,
      customFeedOverride,
      customApOverride,
      activeTool?.cornerRadiusMm ?? 0.8
    );
  }, [
    selectedMaterial,
    diameter,
    operation,
    toolType,
    activeLathe,
    environment,
    customVcOverride,
    customFeedOverride,
    customApOverride,
    activeTool,
  ]);

  // Handlers
  const handleToggleTheme = () => {
    haptics.tick();
    setDarkMode(!darkMode);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    haptics.enabled = next;
    if (next) haptics.select();
  };

  const handleSelectLathe = (lathe: LatheGearConfig) => {
    setActiveLathe(lathe);
    try {
      setStoredItem('active_lathe', JSON.stringify(lathe));
    } catch {}
    showToast(`Drehbank gewählt: ${lathe.name}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur: string | null) => (cur === msg ? null : cur));
    }, 2400);
  };

  const handleSaveCurrentJob = () => {
    const titlePrompt = `${diameter}mm ${selectedMaterial.name.split(' ')[0]}`;
    const newJob: SavedJob = {
      id: `job_${Date.now()}`,
      title: titlePrompt,
      date: new Date().toLocaleDateString('de-DE'),
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      diameter,
      operation,
      toolType,
      rpm: calculationResult.suggestedRpm,
      feedRate: calculationResult.feedRate,
      depthOfCut: calculationResult.depthOfCut,
      cuttingSpeed: calculationResult.cuttingSpeed,
    };

    const updated = [newJob, ...savedJobs];
    setSavedJobs(updated);
    try {
      setStoredItem('saved_jobs', JSON.stringify(updated));
    } catch {}
    showToast(`"${titlePrompt}" auf Merkzettel gespeichert!`);
  };

  const handleLoadJob = (job: SavedJob) => {
    const allKnown = [...customMaterials, ...MATERIALS];
    const matchedMaterial = allKnown.find((m) => m.id === job.materialId);
    if (matchedMaterial) {
      setSelectedMaterial(matchedMaterial);
    }
    setDiameter(job.diameter);
    setOperation(job.operation);
    setToolType(job.toolType);
    setCustomVcOverride(undefined);
    setCustomFeedOverride(undefined);
    setCustomApOverride(undefined);
    setActiveTab('turning');
    showToast(`Geladen: ${job.title}`);
  };

  const handleDeleteJob = (id: string) => {
    const updated = savedJobs.filter((j: SavedJob) => j.id !== id);
    setSavedJobs(updated);
    try {
      setStoredItem('saved_jobs', JSON.stringify(updated));
    } catch {}
  };

  const handleClearAllJobs = () => {
    setSavedJobs([]);
    try {
      removeStoredItem('saved_jobs');
    } catch {}
    showToast('Merkzettel geleert');
  };

  const defaultToolParams = selectedMaterial.params[toolType][operation];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-x-hidden w-full max-w-[100vw]">
      {/* Top App Header */}
      <IosHeader
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeLathe={activeLathe}
        hasWarning={Boolean(calculationResult.warning)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area: Responsive container (full desktop multi-column or sleek mobile frame) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-28 overflow-x-hidden">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-blue-600 dark:text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-slate-700 dark:border-blue-400 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-150">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Drehen (Main Lathe Turning Experience) */}
        {activeTab === 'turning' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (Inputs on Desktop / Flow on Mobile) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Werkstoff-Auswahl */}
              <MaterialBarAndModal
                selectedMaterial={selectedMaterial}
                onSelectMaterial={(m) => {
                  setSelectedMaterial(m);
                  setCustomVcOverride(undefined);
                  setCustomFeedOverride(undefined);
                  setCustomApOverride(undefined);
                  try {
                    setStoredItem('selected_material_id', m.id);
                  } catch {}
                }}
                customMaterials={customMaterials}
                onSaveCustomMaterial={handleSaveCustomMaterial}
                onDeleteCustomMaterial={handleDeleteCustomMaterial}
              />

              {/* Werkstück-Durchmesser */}
              <DiameterInputSection
                diameter={diameter}
                onChangeDiameter={(d) => setDiameter(d)}
              />

              {/* Bearbeitungsart (Schruppen/Schlichten/Abstechen & HM/HSS) */}
              <OperationToggle
                operation={operation}
                onChangeOperation={(op) => setOperation(op)}
                toolType={toolType}
                onChangeToolType={(tt) => setToolType(tt)}
                customVcOverride={customVcOverride}
                onUpdateVcOverride={setCustomVcOverride}
                customFeedOverride={customFeedOverride}
                onUpdateFeedOverride={setCustomFeedOverride}
                customApOverride={customApOverride}
                onUpdateApOverride={setCustomApOverride}
                defaultVc={defaultToolParams.vc.rec}
                defaultFeed={defaultToolParams.f.rec}
                defaultAp={defaultToolParams.ap.rec}
              />
            </div>

            {/* Right Column (Hero Result & Live Telemetry) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
              <PrimaryResultHero
                result={calculationResult}
                material={selectedMaterial}
                diameter={diameter}
                latheConfig={activeLathe}
                environment={environment}
                onChangeEnvironment={setEnvironment}
                onSaveJob={handleSaveCurrentJob}
              />

              {/* Werkzeug-Empfehlung aus der Datenbank */}
              <RecommendedToolCard
                dualResult={dualToolResult}
                selectedToolId={selectedToolId}
                onSelectTool={(t) => {
                  setSelectedToolId(t.id);
                  showToast(`Werkzeug gewählt: ${t.name}`);
                }}
                onOpenToolDatabase={() => setIsToolModalOpen(true)}
                onToggleToolOwnership={handleToggleToolOwnership}
              />

              {/* Quick Info Chip Strip */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>
                  Modus:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {environment === 'manual' ? 'Werkstatt (Manuelle Drehbank)' : 'CNC / Industrie'}
                  </strong>
                </span>
                <button
                  onClick={() => setActiveTab('formulas')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  Formeln ansehen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Werkzeuge (Tool Manager) */}
        {activeTab === 'tools' && (
          <div className="max-w-xl mx-auto space-y-4">
            <RecommendedToolCard
              dualResult={dualToolResult}
              selectedToolId={selectedToolId}
              onSelectTool={(t) => {
                setSelectedToolId(t.id);
                showToast(`Werkzeug gewählt: ${t.name}`);
              }}
              onOpenToolDatabase={() => setIsToolModalOpen(true)}
              onToggleToolOwnership={handleToggleToolOwnership}
            />

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 text-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Werkzeuge verwalten &amp; anlegen
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-3">
                Erfasse alle Drehmeißel, Bohrstangen und Abstecher aus deiner Werkstatt. ToolSpeed wählt automatisch das passende Werkzeug aus.
              </p>
              <button
                onClick={() => setIsToolModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Werkzeugdatenbank öffnen ({tools.length} Werkzeuge)
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Bohren (Tailstock Drilling) */}
        {activeTab === 'drilling' && (
          <div className="max-w-xl mx-auto">
            <DrillingCalculator
              material={selectedMaterial}
              latheConfig={activeLathe}
              onOpenMaterialPicker={() => setActiveTab('turning')}
            />
          </div>
        )}

        {/* Tab 4: Spickzettel / Formeln */}
        {activeTab === 'formulas' && (
          <div className="max-w-2xl mx-auto">
            <FormulasCheatSheet />
          </div>
        )}

        {/* Tab 5: Merkzettel */}
        {activeTab === 'saved' && (
          <div className="max-w-xl mx-auto">
            <SavedJobsModal
              savedJobs={savedJobs}
              onLoadJob={handleLoadJob}
              onDeleteJob={handleDeleteJob}
              onClearAll={handleClearAllJobs}
            />
          </div>
        )}
      </main>

      {/* Lathe Gear Configuration Modal */}
      <MachineSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeLathe={activeLathe}
        onSelectLathe={handleSelectLathe}
      />

      {/* Tool Database Modal */}
      <ToolDatabaseModal
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
        tools={tools}
        onSaveTools={(updated) => setTools(updated)}
        onSelectActiveTool={(t) => {
          setSelectedToolId(t.id);
          showToast(`Werkzeug gewählt: ${t.name}`);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onSuccessToast={showToast}
      />

      {/* Backup / Export / Import Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        tools={tools}
        customMaterials={customMaterials}
        lathes={DEFAULT_LATHE_CONFIGS}
        savedJobs={savedJobs}
        activeLathe={activeLathe}
        onImportData={handleImportData}
        showToast={showToast}
      />

      {/* Fixed iOS Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        savedCount={savedJobs.length}
        toolCount={tools.length}
      />
    </div>
  );
}
