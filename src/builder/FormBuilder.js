/**
 * FormBuilder - Main builder interface integrating all components
 */
import StateManager from '../core/StateManager.js';
import EventBus from '../core/EventBus.js';
import History from '../core/History.js';
import { SchemaEngine } from '../schema/SchemaEngine.js';
import { RuleEngine } from '../engine/RuleEngine.js';
import { ValidationEngine } from '../engine/ValidationEngine.js';
import { FormRenderer } from '../renderer/FormRenderer.js';
import FieldPalette from './FieldPalette.js';
import Canvas from './Canvas.js';
import PropertyEditor from './PropertyEditor.js';
import Constants from '../utils/Constants.js';
import { i18n } from '../utils/i18n.js';

export class FormBuilder {
  constructor(config = {}) {
    this.config = {
      builderContainerId: 'builder',
      previewContainerId: 'preview',
      paletteContainerId: 'palette',
      canvasContainerId: 'canvas',
      propertiesContainerId: 'properties',
      language: 'de', // Default to German
      ...config,
    };

    // Set language
    i18n.setLanguage(this.config.language);

    // Initialize core systems
    this.stateManager = new StateManager();
    this.eventBus = new EventBus();
    this.history = new History();

    // Initialize schema and engines
    this.schema = this.stateManager.getSchema();
    this.ruleEngine = new RuleEngine(this.schema, this.stateManager, this.eventBus);
    this.validationEngine = new ValidationEngine(this.schema, this.stateManager);

    // Initialize UI components
    this.fieldPalette = null;
    this.canvas = null;
    this.propertyEditor = null;
    this.formRenderer = null;

    this._setupEventListeners();
  }

  /**
   * Initialize the builder
   */
  init() {
    this.fieldPalette = new FieldPalette(this.config.paletteContainerId, this.eventBus);
    this.fieldPalette.render();

    this.canvas = new Canvas(this.config.canvasContainerId, this.stateManager, this.eventBus);
    this.canvas.render();

    this.propertyEditor = new PropertyEditor(
      this.config.propertiesContainerId,
      this.stateManager,
      this.eventBus
    );

    // Render live form into the preview container
    this.formRenderer = new FormRenderer(
      this.config.previewContainerId,
      this.schema,
      this.stateManager,
      this.ruleEngine,
      this.validationEngine,
      this.eventBus
    );
    this.formRenderer.render();

    this._setupStateListeners();
    this._renderToolbar();

    console.log(
      '%c' + i18n.t('consoleInitialized'),
      'font-size: 16px; color: #2563eb; font-weight: bold;'
    );
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Schema changes
    this.stateManager.subscribe('schema', (schema) => {
      this.schema = schema;
      this.ruleEngine.updateSchema(schema);
      this.validationEngine = new ValidationEngine(schema, this.stateManager);
      this.formRenderer?.updateSchema(schema);
      this.canvas?.update();
      this.history.push(schema);
    });

    // Field selection
    this.eventBus.on(Constants.EVENTS.FIELD_SELECTED, (fieldId) => {
      this.stateManager.updateUIState({ selectedFieldId: fieldId });
      this.propertyEditor?.render(fieldId);
    });

    // Form data changes
    this.eventBus.on(Constants.EVENTS.FIELD_VALUE_CHANGED, (data) => {
      const field = this.stateManager.getField(data.fieldId);
      if (this.formRenderer && field) {
        this.formRenderer.formData[field.model] = data.value;
        this.ruleEngine.evaluateField(data.fieldId, this.formRenderer.formData);
      }
    });
  }

  /**
   * Setup state listeners for UI updates
   */
  _setupStateListeners() {
    this.stateManager.subscribe('schema', () => {
      // Canvas will update automatically via event listener
      this.canvas.update();
      this.formRenderer.updateSchema(this.stateManager.getSchema());
    });

    this.stateManager.subscribe('formData', () => {
      // Form data updated
    });

    // React to UI state changes (e.g., current page)
    this.stateManager.subscribe('uiState', () => {
      this.canvas.update();
      this.formRenderer.updateSchema(this.stateManager.getSchema());
    });
  }

  /**
   * Render toolbar with actions
   */
  _renderToolbar() {
    let builderContainer = document.getElementById(this.config.builderContainerId);
    if (!builderContainer) {
      return;
    }

    builderContainer.innerHTML = '';
    const toolbar = document.createElement('div');
    toolbar.className = 'builder-toolbar';

    // Form name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = i18n.t('formName');
    nameInput.value = this.stateManager.getSchema().meta.name;
    nameInput.className = 'toolbar-input';
    nameInput.addEventListener('change', (e) => {
      this.stateManager.updateSchemaMeta({ name: e.target.value });
    });
    toolbar.appendChild(nameInput);

    // Undo button
    const undoBtn = document.createElement('button');
    undoBtn.className = 'toolbar-btn';
    undoBtn.innerHTML = i18n.t('undo');
    undoBtn.addEventListener('click', () => this.undo());
    toolbar.appendChild(undoBtn);

    // Redo button
    const redoBtn = document.createElement('button');
    redoBtn.className = 'toolbar-btn';
    redoBtn.innerHTML = i18n.t('redo');
    redoBtn.addEventListener('click', () => this.redo());
    toolbar.appendChild(redoBtn);

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'toolbar-btn';
    exportBtn.innerHTML = i18n.t('export');
    exportBtn.addEventListener('click', () => this.exportSchema());
    toolbar.appendChild(exportBtn);

    // Import button
    const importBtn = document.createElement('button');
    importBtn.className = 'toolbar-btn';
    importBtn.innerHTML = i18n.t('import');
    importBtn.addEventListener('click', () => this.importSchema());
    toolbar.appendChild(importBtn);

    // Page controls
    const pagePrev = document.createElement('button');
    pagePrev.className = 'toolbar-btn';
    pagePrev.textContent = i18n.t('prevPage');
    pagePrev.title = 'Previous page';
    pagePrev.addEventListener('click', () => {
      const pages = this.stateManager.getPages();
      const current = this.stateManager.getUIState().currentPage;
      const idx = pages.indexOf(current);
      if (idx > 0) this.stateManager.setCurrentPage(pages[idx - 1]);
    });
    toolbar.appendChild(pagePrev);

    const pageLabel = document.createElement('span');
    pageLabel.className = 'toolbar-page-label';
    pageLabel.style.margin = '0 8px';
    const _updatePageLabel = () => {
      const pages = this.stateManager.getPages();
      const current = this.stateManager.getUIState().currentPage;
      const idx = pages.indexOf(current);
      const pageKey = 'page';
      pageLabel.textContent = pages.length === 0 
        ? `${i18n.t(pageKey)} 1` 
        : `${i18n.t(pageKey)} ${idx + 1} / ${pages.length}`;
    };
    _updatePageLabel();
    toolbar.appendChild(pageLabel);

    const pageNext = document.createElement('button');
    pageNext.className = 'toolbar-btn';
    pageNext.textContent = i18n.t('nextPage');
    pageNext.title = 'Next page';
    pageNext.addEventListener('click', () => {
      const pages = this.stateManager.getPages();
      const current = this.stateManager.getUIState().currentPage;
      const idx = pages.indexOf(current);
      if (idx < pages.length - 1) this.stateManager.setCurrentPage(pages[idx + 1]);
    });
    toolbar.appendChild(pageNext);

    const addPageBtn = document.createElement('button');
    addPageBtn.className = 'toolbar-btn';
    addPageBtn.textContent = i18n.t('addPage');
    addPageBtn.addEventListener('click', () => {
      const id = this.stateManager.addPage();
      // Create a new section for this page
      const newSection = {
        id: `section_${Date.now()}`,
        type: 'section',
        label: `Page ${this._getPageNumber(id)}`,
        fields: [],
        page: id,
      };
      this.stateManager.schema.fields.push(newSection);
      this.stateManager.notifySubscribers('schema');
      _updatePageLabel();
      this.canvas.update();
      this.formRenderer.updateSchema(this.stateManager.getSchema());
    });
    toolbar.appendChild(addPageBtn);

    // Language selector
    const langSelect = document.createElement('select');
    langSelect.className = 'toolbar-select';
    langSelect.value = i18n.getLanguage();
    
    const languages = { de: 'Deutsch', en: 'English', es: 'Español', fr: 'Français' };
    Object.entries(languages).forEach(([code, name]) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = name;
      langSelect.appendChild(opt);
    });
    
    langSelect.addEventListener('change', (e) => {
      i18n.setLanguage(e.target.value);
      this.stateManager.updateUIState({ currentLanguage: e.target.value });
      // Re-render toolbar
      this._renderToolbar();
      // Update all component labels
      this.canvas?.render();
      this.propertyEditor?.render(this.stateManager.getUIState().selectedFieldId);
      this.formRenderer?.render();
    });
    toolbar.appendChild(langSelect);

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'toolbar-btn danger';
    clearBtn.innerHTML = i18n.t('clear');
    clearBtn.addEventListener('click', () => {
      if (confirm(i18n.t('clearAllConfirm'))) {
        this.stateManager.setSchema({
          meta: { name: i18n.t('formName'), version: '1.0.0', description: '' },
          fields: [],
        });
      }
    });
    toolbar.appendChild(clearBtn);

    builderContainer.insertBefore(toolbar, builderContainer.firstChild);
    // Re-render page label on schema/ui changes
    this.stateManager.subscribe('schema', _updatePageLabel);
    this.stateManager.subscribe('uiState', _updatePageLabel);
  }

  /**
   * Undo
   */
  undo() {
    const previous = this.history.undo();
    if (previous) {
      this.stateManager.setSchema(previous);
    }
  }

  /**
   * Redo
   */
  redo() {
    const next = this.history.redo();
    if (next) {
      this.stateManager.setSchema(next);
    }
  }

  /**
   * Get page number from page id
   */
  _getPageNumber(pageId) {
    const num = parseInt(pageId.split('-')[1]);
    return isNaN(num) ? 1 : num;
  }

  /**
   * Export schema as JSON
   */
  exportSchema() {
    const schema = this.stateManager.getSchema();
    const json = SchemaEngine.exportSchema(schema);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.meta.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import schema from JSON
   */
  importSchema() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.addEventListener('load', (event) => {
        const json = event.target?.result;
        if (typeof json === 'string') {
          const result = SchemaEngine.importSchema(json);
          if (result.success) {
            this.stateManager.setSchema(result.schema);
            console.log('Schema imported successfully');
          } else {
            alert('Failed to import schema: ' + result.errors.join(', '));
          }
        }
      });
      reader.readAsText(file);
    });
    input.click();
  }

  /**
   * Get current schema
   */
  getSchema() {
    return this.stateManager.getSchema();
  }

  /**
   * Set schema programmatically
   */
  setSchema(schema) {
    this.stateManager.setSchema(schema);
  }

  /**
   * Get form data
   */
  getFormData() {
    return this.formRenderer?.getFormData() || {};
  }

  /**
   * Validate form
   */
  validateForm() {
    return this.formRenderer?.validate();
  }
}

export default FormBuilder;
