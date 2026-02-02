/**
 * StateManager - Centralized state management
 * Manages Schema State, Form Data, and UI State
 */
export class StateManager {
  constructor() {
    this.schema = {
      meta: {
        name: 'Neues Formular',
        version: '1.0.0',
        description: '',
      },
      fields: [],
    };
    // Form data and UI state
    this.formData = {};
    this.uiState = {
      selectedFieldId: null,
      isDirty: false,
      errors: {},
      touched: {},
      currentPage: 'page-1',
    };

    // Page counter
    this._pageCounter = 1;

    this.subscribers = new Map();
  }

  /**
   * Get entire schema
   */
  getSchema() {
    return JSON.parse(JSON.stringify(this.schema));
  }

  /**
   * Set entire schema
   */
  setSchema(schema) {
    this.schema = JSON.parse(JSON.stringify(schema));
    this.notifySubscribers('schema');
  }

  /**
   * Update schema meta
   */
  updateSchemaMeta(meta) {
    this.schema.meta = { ...this.schema.meta, ...meta };
    this.notifySubscribers('schema');
  }

  /**
   * Add field to schema
   */
  addField(field, parentSectionId = null) {
    // If adding a section, push to root
    if (field.type === 'section' || String(field.type) === 'section') {
      if (!field.fields) field.fields = [];
      this.schema.fields.push(field);
      this.notifySubscribers('schema');
      return;
    }

    // If a parent section id is provided, add into that section
    if (parentSectionId) {
      const sec = this.schema.fields.find((f) => f.id === parentSectionId && f.type === 'section');
      if (sec) {
        if (!Array.isArray(sec.fields)) sec.fields = [];
        sec.fields.push(field);
        this.notifySubscribers('schema');
        return;
      }
    }

    // Otherwise, add into the last section for current page (or any section)
    let lastSection = null;
    for (let i = this.schema.fields.length - 1; i >= 0; i--) {
      const f = this.schema.fields[i];
      if (f.type === 'section') {
        lastSection = f;
        break;
      }
    }

    // if no section exists, create a default one
    if (!lastSection) {
      const defaultSection = {
        id: `section_${Date.now()}`,
        type: 'section',
        label: 'Section 1',
        fields: [],
        page: this.uiState.currentPage,
      };
      this.schema.fields.push(defaultSection);
      lastSection = defaultSection;
    }

    if (!Array.isArray(lastSection.fields)) lastSection.fields = [];
    lastSection.fields.push(field);
    this.notifySubscribers('schema');
  }

  /**
   * Find parent section id for a given field id
   */
  getParentSectionId(fieldId) {
    for (const sec of this.schema.fields) {
      if (sec.type === 'section' && Array.isArray(sec.fields)) {
        if (sec.fields.find((f) => f.id === fieldId)) return sec.id;
      }
    }
    return null;
  }

  /**
   * Create a new page and set as current
   */
  addPage(label) {
    this._pageCounter++;
    const id = `page-${this._pageCounter}`;
    this.uiState.currentPage = id;
    this.notifySubscribers('uiState');
    return id;
  }

  setCurrentPage(pageId) {
    this.uiState.currentPage = pageId;
    this.notifySubscribers('uiState');
  }

  getPages() {
    const pages = new Set();
    for (const f of this.schema.fields) {
      if (f.type === 'section' && f.page) pages.add(f.page);
    }
    return Array.from(pages);
  }

  /**
   * Remove field from schema
   */
  removeField(fieldId) {
    // search root fields and section fields
    const index = this.schema.fields.findIndex((f) => f.id === fieldId);
    if (index > -1) {
      this.schema.fields.splice(index, 1);
      this.notifySubscribers('schema');
      return;
    }
    // search inside sections
    for (const sec of this.schema.fields) {
      if (sec.type === 'section' && Array.isArray(sec.fields)) {
        const idx = sec.fields.findIndex((f) => f.id === fieldId);
        if (idx > -1) {
          sec.fields.splice(idx, 1);
          this.notifySubscribers('schema');
          return;
        }
      }
    }
  }

  /**
   * Update field in schema
   */
  updateField(fieldId, updates) {
    // find at root
    let field = this.schema.fields.find((f) => f.id === fieldId);
    if (field) {
      Object.assign(field, updates);
      this.notifySubscribers('schema');
      return;
    }
    // find inside sections
    for (const sec of this.schema.fields) {
      if (sec.type === 'section' && Array.isArray(sec.fields)) {
        const ff = sec.fields.find((f) => f.id === fieldId);
        if (ff) {
          Object.assign(ff, updates);
          this.notifySubscribers('schema');
          return;
        }
      }
    }
  }

  /**
   * Get field by id
   */
  getField(fieldId) {
    let field = this.schema.fields.find((f) => f.id === fieldId);
    if (field) return field;
    for (const sec of this.schema.fields) {
      if (sec.type === 'section' && Array.isArray(sec.fields)) {
        const ff = sec.fields.find((f) => f.id === fieldId);
        if (ff) return ff;
      }
    }
    return undefined;
  }

  /**
   * Reorder fields
   */
  reorderFields(fromIndex, toIndex) {
    // reordering at root only (sections)
    const [field] = this.schema.fields.splice(fromIndex, 1);
    this.schema.fields.splice(toIndex, 0, field);
    this.notifySubscribers('schema');
  }

  /**
   * Get form data
   */
  getFormData() {
    return JSON.parse(JSON.stringify(this.formData));
  }

  /**
   * Set form data
   */
  setFormData(data) {
    this.formData = JSON.parse(JSON.stringify(data));
    this.notifySubscribers('formData');
  }

  /**
   * Update single form field value
   */
  setFieldValue(fieldId, value) {
    const field = this.getField(fieldId);
    if (field) {
      this.formData[field.model] = value;
      this.notifySubscribers('formData');
    }
  }

  /**
   * Get field value
   */
  getFieldValue(fieldId) {
    const field = this.getField(fieldId);
    return field ? this.formData[field.model] : undefined;
  }

  /**
   * Update UI state
   */
  updateUIState(updates) {
    this.uiState = { ...this.uiState, ...updates };
    this.notifySubscribers('uiState');
  }

  /**
   * Get UI state
   */
  getUIState() {
    return JSON.parse(JSON.stringify(this.uiState));
  }

  /**
   * Set field errors
   */
  setFieldErrors(fieldId, errors) {
    this.uiState.errors[fieldId] = errors;
    this.notifySubscribers('uiState');
  }

  /**
   * Set field as touched
   */
  setFieldTouched(fieldId) {
    this.uiState.touched[fieldId] = true;
    this.notifySubscribers('uiState');
  }

  /**
   * Subscribe to state changes
   */
  subscribe(stateKey, callback) {
    if (!this.subscribers.has(stateKey)) {
      this.subscribers.set(stateKey, []);
    }
    this.subscribers.get(stateKey).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(stateKey);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of a state change
   */
  notifySubscribers(stateKey) {
    if (this.subscribers.has(stateKey)) {
      this.subscribers.get(stateKey).forEach((callback) => {
        try {
          callback(this[stateKey]);
        } catch (error) {
          console.error(`Error in state subscriber for ${stateKey}:`, error);
        }
      });
    }
  }
}

export default StateManager;
