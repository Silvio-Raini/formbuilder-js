/**
 * Canvas - Drag and drop area for building forms
 */
import Constants from '../utils/Constants.js';
import { SchemaEngine } from '../schema/SchemaEngine.js';

export class Canvas {
  constructor(containerId, stateManager, eventBus) {
    this.container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.draggedElement = null;
  }

  /**
   * Render canvas
   */
  render() {
    if (!this.container) {
      console.error('Canvas container not found');
      return;
    }
    this.container.className = 'canvas';

    const schema = this.stateManager.getSchema();
    const currentPage = this.stateManager.getUIState().currentPage;

    // Clear and render builder view: sections and their field previews
    this.container.innerHTML = '';

    // Render sections (only those for the current page)
    schema.fields.forEach((section) => {
      if (section.type !== 'section') return;
      if (section.page && section.page !== currentPage) return;

      const secEl = document.createElement('div');
      secEl.className = 'canvas-section-preview';
      secEl.setAttribute('data-section-id', section.id);

      const secHeader = document.createElement('div');
      secHeader.className = 'canvas-section-header';
      secHeader.textContent = section.label || 'Section';

      const secActions = document.createElement('div');
      secActions.className = 'canvas-section-actions';
      const editSecBtn = document.createElement('button');
      editSecBtn.className = 'canvas-action-btn';
      editSecBtn.textContent = '✎';
      editSecBtn.title = 'Edit section';
      editSecBtn.addEventListener('click', () => {
        this.eventBus.emit(Constants.EVENTS.FIELD_SELECTED, section.id);
      });
      secActions.appendChild(editSecBtn);
      secHeader.appendChild(secActions);

      secEl.appendChild(secHeader);

      const fieldsWrap = document.createElement('div');
      fieldsWrap.className = 'canvas-section-fields';

      if (Array.isArray(section.fields)) {
        section.fields.forEach((field, idx) => {
          const fieldEl = this._renderFieldPreview(field, idx);
          fieldsWrap.appendChild(fieldEl);
        });
      }

      // allow dropping into this section
      secEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        secEl.classList.add('drag-over');
      });
      secEl.addEventListener('dragleave', () => secEl.classList.remove('drag-over'));
      secEl.addEventListener('drop', (e) => {
        e.preventDefault();
        secEl.classList.remove('drag-over');
        const fieldType = e.dataTransfer.getData('fieldType');
        const fieldId = e.dataTransfer.getData('fieldId');
        if (fieldType) {
          const newField = SchemaEngine.createField(fieldType);
          this.stateManager.addField(newField, section.id);
        } else if (fieldId) {
          // moving existing field into this section
          const srcSection = this.stateManager.getParentSectionId(fieldId);
          if (srcSection && srcSection !== section.id) {
            // remove from source and add to target
            this.stateManager.removeField(fieldId);
            const movedField = SchemaEngine.cloneField(this.stateManager.getField(fieldId) || {});
            // cloned will have new id; instead attempt to move original data
            // better: get original field before removal
          }
        }
      });

      secEl.appendChild(fieldsWrap);
      this.container.appendChild(secEl);
    });

    // If there are no sections, show empty state
    const hasSections = schema.fields.some((f) => f.type === 'section');
    if (!hasSections) {
      this._renderEmptyState();
    }

    // Ensure drag/drop handlers exist
    if (!this._dragDropSetup) {
      this._setupDragAndDrop();
      this._dragDropSetup = true;
    }
  }

  /**
   * Render field preview on canvas
   */
  _renderFieldPreview(field, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'canvas-field';
    wrapper.setAttribute('data-field-id', field.id);
    wrapper.draggable = true;

    // Drag handle
    const handle = document.createElement('span');
    handle.className = 'canvas-field-handle';
    handle.innerHTML = '⋮⋮';
    wrapper.appendChild(handle);

    // Field preview
    const preview = document.createElement('div');
    preview.className = 'canvas-field-preview';

    const label = document.createElement('label');
    label.className = 'canvas-field-label';
    const labelText = field.label || (String(field.type).charAt(0).toUpperCase() + String(field.type).slice(1));
    label.textContent = labelText;
    if (field.required) {
      label.innerHTML += '<span class="required-mark"> *</span>';
    }
    preview.appendChild(label);

    // Type badge
    const typeBadge = document.createElement('span');
    typeBadge.className = 'canvas-field-type';
    typeBadge.textContent = field.type;
    preview.appendChild(typeBadge);

    // Logic indicator
    if (field.logic && field.logic.length > 0) {
      const logicIndicator = document.createElement('span');
      logicIndicator.className = 'canvas-field-logic';
      logicIndicator.textContent = `⚡ ${field.logic.length} rule(s)`;
      preview.appendChild(logicIndicator);
    }

    wrapper.appendChild(preview);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'canvas-field-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'canvas-action-btn canvas-edit-btn';
    editBtn.innerHTML = '✎';
    editBtn.title = 'Edit field';
    editBtn.addEventListener('click', () => {
      this.eventBus.emit(Constants.EVENTS.FIELD_SELECTED, field.id);
    });

    const duplicateBtn = document.createElement('button');
    duplicateBtn.className = 'canvas-action-btn canvas-duplicate-btn';
    duplicateBtn.innerHTML = '⎘';
    duplicateBtn.title = 'Duplicate field';
    duplicateBtn.addEventListener('click', () => {
      const cloned = SchemaEngine.cloneField(field);
      // find parent section and add clone into same section
      const parentSectionId = this.stateManager.getParentSectionId
        ? this.stateManager.getParentSectionId(field.id)
        : null;
      this.stateManager.addField(cloned, parentSectionId);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'canvas-action-btn canvas-delete-btn';
    deleteBtn.innerHTML = '🗑';
    deleteBtn.title = 'Delete field';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete field "${field.label || field.type}"?`)) {
        this.stateManager.removeField(field.id);
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(duplicateBtn);
    actions.appendChild(deleteBtn);
    wrapper.appendChild(actions);

    // Drag events
    wrapper.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('fieldId', field.id);
      e.dataTransfer.setData('fromIndex', index);
      this.draggedElement = wrapper;
      wrapper.classList.add('dragging');
    });

    wrapper.addEventListener('dragend', () => {
      this.draggedElement = null;
      wrapper.classList.remove('dragging');
    });

    return wrapper;
  }

  /**
   * Render empty state
   */
  _renderEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'canvas-empty-state';
    emptyState.innerHTML = `
      <div class="empty-state-content">
        <p>📋 Drag fields here to start building your form</p>
        <p style="font-size: 0.9em; color: #666;">Choose from the field types on the left</p>
      </div>
    `;
    this.container.appendChild(emptyState);
  }

  /**
   * Setup drag and drop (only setup once)
   */
  _setupDragAndDrop() {
    // Clean up any existing listeners first
    if (this._dragoverHandler) {
      this.container.removeEventListener('dragover', this._dragoverHandler);
    }
    if (this._dragleaveHandler) {
      this.container.removeEventListener('dragleave', this._dragleaveHandler);
    }
    if (this._dropHandler) {
      this.container.removeEventListener('drop', this._dropHandler);
    }

    const dragoverHandler = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.container.classList.add('drag-over');
    };

    const dragleaveHandler = () => {
      this.container.classList.remove('drag-over');
    };

    const dropHandler = (e) => {
      e.preventDefault();
      this.container.classList.remove('drag-over');

      const fieldType = e.dataTransfer.getData('fieldType');
      const fieldId = e.dataTransfer.getData('fieldId');
      const fromIndex = e.dataTransfer.getData('fromIndex');

      // find section target if any
      const sectionEl = e.target && e.target.closest ? e.target.closest('[data-section-id]') : null;
      const targetSectionId = sectionEl ? sectionEl.getAttribute('data-section-id') : null;

      if (fieldType) {
        // New field from palette
        const newField = SchemaEngine.createField(fieldType);
        if (targetSectionId) {
          this.stateManager.addField(newField, targetSectionId);
        } else {
          this.stateManager.addField(newField);
        }
      } else if (fieldId) {
        // Reorder existing field (fallback to root reorder)
        const schema = this.stateManager.getSchema();
        const toIndex = schema.fields.length - 1;
        if (fromIndex !== toIndex) {
          this.stateManager.reorderFields(parseInt(fromIndex), toIndex);
        }
      }
    };

    this.container.addEventListener('dragover', dragoverHandler);
    this.container.addEventListener('dragleave', dragleaveHandler);
    this.container.addEventListener('drop', dropHandler);

    // Store handlers for cleanup
    this._dragoverHandler = dragoverHandler;
    this._dragleaveHandler = dragleaveHandler;
    this._dropHandler = dropHandler;
  }

  /**
   * Update canvas when schema changes
   */
  update() {
    this.render();
  }
}

export default Canvas;
