import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  StudioTemplate, 
  StudioElement, 
  DocumentSide, 
  DocumentBackground, 
  ElementType 
} from '../../types/studio';
import { Student } from '../../types';
import { StudioToolbar } from './StudioToolbar';
import { StudioLeftSidebar } from './StudioLeftSidebar';
import { StudioCanvas } from './StudioCanvas';
import { StudioInspector } from './StudioInspector';
import { StudioLayersPanel } from './StudioLayersPanel';
import { StudioTemplateGallery } from './StudioTemplateGallery';
import { StudioVersionHistoryModal } from './StudioVersionHistoryModal';
import { NewTemplateModal } from './NewTemplateModal';

export const DocumentStudioView: React.FC = () => {
  const {
    activeInstitution,
    studioTemplates,
    saveStudioTemplate,
    createStudioTemplate,
    duplicateStudioTemplate,
    toggleActiveStudioTemplate,
    deleteStudioTemplate,
    restoreStudioTemplateVersion,
    createStudioTemplateVersion,
    students,
    courses,
    classes
  } = useApp();

  // Navigation state within Studio:
  // 'gallery' -> list and manage templates
  // 'editor'  -> professional graphic design mode
  const [viewMode, setViewMode] = useState<'gallery' | 'editor'>('gallery');

  // Currently opened template in editor
  const [activeTemplate, setActiveTemplate] = useState<StudioTemplate | null>(null);

  // Editor interaction state
  const [currentSide, setCurrentSide] = useState<DocumentSide>('frente');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [previewStudent, setPreviewStudent] = useState<Student | null>(students[0] || null);

  // Modals state
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [historyTargetTemplate, setHistoryTargetTemplate] = useState<StudioTemplate | null>(null);

  // Open a template in the graphic editor
  const handleOpenEditor = (template: StudioTemplate) => {
    setActiveTemplate(template);
    setCurrentSide('frente');
    setSelectedElementId(null);
    setViewMode('editor');
  };

  // Close editor and return to catalog
  const handleBackToGallery = () => {
    // If activeTemplate was modified, we ask or automatically persist
    if (activeTemplate) {
      saveStudioTemplate(activeTemplate);
    }
    setViewMode('gallery');
    setActiveTemplate(null);
  };

  // Switch between Frente and Verso
  const handleSwitchSide = (side: DocumentSide) => {
    setCurrentSide(side);
    setSelectedElementId(null);
  };

  // Get active elements according to side
  const currentElements = activeTemplate
    ? currentSide === 'frente'
      ? activeTemplate.frenteElements
      : activeTemplate.versoElements
    : [];

  const currentBackground = activeTemplate
    ? currentSide === 'frente'
      ? activeTemplate.backgroundFrente
      : activeTemplate.backgroundVerso
    : {
        color: '#FFFFFF',
        pattern: 'guilloche' as const,
        borderColor: '#B45309',
        borderWidth: 6,
        borderStyle: 'ornamental_cantos' as const
      };

  // Update elements list in activeTemplate
  const setElementsForCurrentSide = (
    updater: (prev: StudioElement[]) => StudioElement[]
  ) => {
    if (!activeTemplate) return;

    setActiveTemplate(prev => {
      if (!prev) return null;
      if (currentSide === 'frente') {
        return {
          ...prev,
          frenteElements: updater(prev.frenteElements)
        };
      } else {
        return {
          ...prev,
          versoElements: updater(prev.versoElements)
        };
      }
    });
  };

  // Add element from sidebar
  const handleAddElement = (newElement: StudioElement | Omit<StudioElement, 'id'>) => {
    const elementId = (newElement as any).id || `el-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const elementWithSide: StudioElement = {
      ...newElement,
      id: elementId,
      side: currentSide
    };

    setElementsForCurrentSide(prev => [...prev, elementWithSide]);
    setSelectedElementId(elementId);
  };

  // Update specific element
  const handleUpdateElement = (id: string, updates: Partial<StudioElement>) => {
    setElementsForCurrentSide(prev =>
      prev.map(el => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    setElementsForCurrentSide(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Duplicate element
  const handleDuplicateElement = (id: string) => {
    const el = currentElements.find(e => e.id === id);
    if (!el) return;

    const duplicated: StudioElement = {
      ...el,
      id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${el.name} (Cópia)`,
      x: Math.min(el.x + 4, 80),
      y: Math.min(el.y + 4, 80),
      zIndex: (el.zIndex || 10) + 1
    };

    setElementsForCurrentSide(prev => [...prev, duplicated]);
    setSelectedElementId(duplicated.id);
  };

  // Update document background
  const handleUpdateBackground = (updates: Partial<DocumentBackground>) => {
    if (!activeTemplate) return;

    setActiveTemplate(prev => {
      if (!prev) return null;
      if (currentSide === 'frente') {
        return {
          ...prev,
          backgroundFrente: { ...prev.backgroundFrente, ...updates }
        };
      } else {
        return {
          ...prev,
          backgroundVerso: { ...prev.backgroundVerso, ...updates }
        };
      }
    });
  };

  // Save current template state
  const handleSaveActiveTemplate = () => {
    if (!activeTemplate) return;
    saveStudioTemplate(activeTemplate);
  };

  // Restore previous version
  const handleRestoreVersion = (versionNumber: string) => {
    const targetId = historyTargetTemplate?.id || activeTemplate?.id;
    if (!targetId) return;

    restoreStudioTemplateVersion(targetId, versionNumber);

    // Refresh active template if it's the one opened
    const updated = studioTemplates.find(t => t.id === targetId);
    if (updated) {
      setActiveTemplate(updated);
    }
    setIsVersionModalOpen(false);
  };

  // Create new version milestone
  const handleCreateNewVersion = (versionNumber: string, notes: string) => {
    const targetId = historyTargetTemplate?.id || activeTemplate?.id;
    if (!targetId) return;

    // First save current edits
    if (activeTemplate && activeTemplate.id === targetId) {
      saveStudioTemplate(activeTemplate);
    }

    createStudioTemplateVersion(targetId, versionNumber, notes);

    const updated = studioTemplates.find(t => t.id === targetId);
    if (updated) {
      setActiveTemplate(updated);
    }
  };

  // Print document
  const handlePrint = () => {
    window.print();
  };

  // Selected element reference
  const selectedElement = currentElements.find(el => el.id === selectedElementId) || null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-100 overflow-hidden select-none">
      {viewMode === 'gallery' ? (
        /* ======================================================== */
        /* GALLERY / REPOSITÓRIO DE MODELOS OFICIAIS                */
        /* ======================================================== */
        <StudioTemplateGallery
          templates={studioTemplates}
          activeInstitution={activeInstitution}
          onSelectTemplate={handleOpenEditor}
          onNewTemplate={() => setIsNewTemplateModalOpen(true)}
          onDuplicateTemplate={(id) => duplicateStudioTemplate(id)}
          onToggleActiveTemplate={(id) => toggleActiveStudioTemplate(id)}
          onOpenVersionHistory={(tpl) => {
            setHistoryTargetTemplate(tpl);
            setIsVersionModalOpen(true);
          }}
          onDeleteTemplate={(id) => deleteStudioTemplate(id)}
        />
      ) : activeTemplate ? (
        /* ======================================================== */
        /* PROFESSIONAL GRAPHIC STUDIO EDITOR                       */
        /* ======================================================== */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Studio Toolbar */}
          <StudioToolbar
            template={activeTemplate}
            onBackToGallery={handleBackToGallery}
            currentSide={currentSide}
            onSwitchSide={handleSwitchSide}
            zoom={zoom}
            onZoomChange={setZoom}
            isPreviewMode={isPreviewMode}
            onTogglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
            students={students}
            selectedStudent={previewStudent}
            onSelectStudent={setPreviewStudent}
            onSaveTemplate={handleSaveActiveTemplate}
            onOpenVersionHistory={() => {
              setHistoryTargetTemplate(activeTemplate);
              setIsVersionModalOpen(true);
            }}
            onDuplicateTemplate={() => {
              const clone = duplicateStudioTemplate(activeTemplate.id);
              setActiveTemplate(clone);
            }}
            onToggleActive={() => toggleActiveStudioTemplate(activeTemplate.id)}
            onPrint={handlePrint}
          />

          {/* Main 3-Column Studio Workspace */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Column: Component Palette */}
            {!isPreviewMode && (
              <StudioLeftSidebar
                onAddElement={handleAddElement}
                currentSide={currentSide}
              />
            )}

            {/* Center Column: Graphic Canvas Area */}
            <div className="flex-1 flex flex-col bg-slate-200/90 overflow-hidden relative">
              {/* Canvas Viewport */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-6 sm:p-10">
                <StudioCanvas
                  format={activeTemplate.format}
                  side={currentSide}
                  elements={currentElements}
                  background={currentBackground}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onUpdateElement={handleUpdateElement}
                  zoom={zoom}
                  isPreviewMode={isPreviewMode}
                  selectedStudent={previewStudent}
                  institution={activeInstitution}
                  course={courses.find(c => c.id === previewStudent?.courseId)}
                  classGroup={classes.find(cl => cl.id === previewStudent?.classGroupId)}
                  onDeleteElement={handleDeleteElement}
                  onDuplicateElement={handleDuplicateElement}
                />
              </div>

              {/* Bottom Strip: Layers Panel */}
              {!isPreviewMode && (
                <StudioLayersPanel
                  elements={currentElements}
                  currentSide={currentSide}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onUpdateElement={handleUpdateElement}
                  onDeleteElement={handleDeleteElement}
                  onReorderElements={(reordered) => {
                    setElementsForCurrentSide(() => reordered);
                  }}
                />
              )}
            </div>

            {/* Right Column: Inspector & Properties Panel */}
            {!isPreviewMode && (
              <StudioInspector
                selectedElement={selectedElement}
                onUpdateElement={(id, updates) => {
                  handleUpdateElement(id, updates);
                }}
                onDeleteElement={(id) => {
                  handleDeleteElement(id);
                }}
                onDuplicateElement={(id) => {
                  handleDuplicateElement(id);
                }}
                currentSide={currentSide}
                background={currentBackground}
                onUpdateBackground={handleUpdateBackground}
                format={activeTemplate.format}
                onChangeFormat={(fmt) => {
                  setActiveTemplate(prev => prev ? ({ ...prev, format: fmt }) : null);
                }}
              />
            )}
          </div>
        </div>
      ) : null}

      {/* Version History Modal */}
      {isVersionModalOpen && (
        <StudioVersionHistoryModal
          isOpen={isVersionModalOpen}
          onClose={() => {
            setIsVersionModalOpen(false);
            setHistoryTargetTemplate(null);
          }}
          template={historyTargetTemplate || activeTemplate!}
          onRestoreVersion={handleRestoreVersion}
          onCreateNewVersion={handleCreateNewVersion}
        />
      )}

      {/* New Template Modal */}
      {isNewTemplateModalOpen && (
        <NewTemplateModal
          isOpen={isNewTemplateModalOpen}
          onClose={() => setIsNewTemplateModalOpen(false)}
          activeInstitutionId={activeInstitution.id}
          onCreate={(templateData) => {
            const created = createStudioTemplate(templateData);
            handleOpenEditor(created);
          }}
        />
      )}
    </div>
  );
};
