/**
 * FormRenderer - Renders complete form from schema
 * Manages form lifecycle, validation, and submission
 */
import FieldRenderer from './FieldRenderer.js';
import Constants from '../utils/Constants.js';

export class FormRenderer {
  constructor(containerId, schema, stateManager, ruleEngine, validationEngine, eventBus) {
    this.container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;
    this.schema = schema;
    this.stateManager = stateManager;
    this.ruleEngine = ruleEngine;
    this.validationEngine = validationEngine;
    this.eventBus = eventBus;
    this.fieldRenderers = new Map();
    this.formData = {};
  }

  /**
   * Render the entire form
   */
  render() {
    if (!this.container) {
      console.error('Container not found');
      return;
    }

    this.container.innerHTML = '';
    this.fieldRenderers.clear();

    // Create form element
    const form = document.createElement('form');
    form.className = 'form-container';
    form.setAttribute('novalidate', 'true');

    // Render form title if present
    if (this.schema.meta?.name) {
      const title = document.createElement('h2');
      title.className = 'form-title';
      title.textContent = this.schema.meta.name;
      form.appendChild(title);
    }

    // Render form description if present
    if (this.schema.meta?.description) {
      const description = document.createElement('p');
      description.className = 'form-description';
      description.textContent = this.schema.meta.description;
      form.appendChild(description);
    }

    // Render fields (only sections that belong to current page)
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'form-fields';
    const currentPage = this.stateManager.getUIState().currentPage;
    this.schema.fields.forEach((field) => {
      if (field.type === Constants.FIELD_TYPES.SECTION) {
        // respect page assignment
        if (!field.page || field.page === currentPage) {
          this._renderField(field, fieldsContainer);
        }
      }
    });
    form.appendChild(fieldsContainer);

    // Render submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'form-submit-btn';
    submitBtn.textContent = 'Submit';
    form.appendChild(submitBtn);

    // Setup form event listeners
    form.addEventListener('submit', (e) => this._handleSubmit(e));

    this.container.appendChild(form);

    // Make preview visible (container may be hidden)
    try { this.container.style.display = ''; } catch (e) { /* ignore */ }

    // Disable all inputs in preview mode so form is not editable inside builder
    Array.from(form.querySelectorAll('input, textarea, select')).forEach((el) => {
      try { el.disabled = true; } catch (e) { /* ignore */ }
    });

    // Hide preview if there are no sections/fields rendered
    try {
      const hasContent = fieldsContainer && fieldsContainer.childNodes && fieldsContainer.childNodes.length > 0;
      if (!hasContent) this.container.style.display = 'none';
    } catch (e) { /* ignore */ }

    // Setup rule evaluation listener (only once)
    if (!this._rulesEvaluatedListener) {
      this._rulesEvaluatedListener = (results) => {
        this._applyRuleResults(results);
      };
      this.eventBus.on(Constants.EVENTS.RULES_EVALUATED, this._rulesEvaluatedListener);
    }
  }

  /**
   * Render a single field
   */
  _renderField(field, container) {
    if (field.type === Constants.FIELD_TYPES.SECTION) {
      this._renderSection(field, container);
    } else {
      const fieldRenderer = new FieldRenderer(
        field,
        this.formData,
        this.ruleEngine,
        this.validationEngine,
        this.stateManager,
        this.eventBus
      );

      const fieldEl = fieldRenderer.render();
      container.appendChild(fieldEl);

      this.fieldRenderers.set(field.id, fieldRenderer);
    }
  }

  /**
   * Render a section/group of fields
   */
  _renderSection(section, container) {
    const sectionEl = document.createElement('fieldset');
    sectionEl.className = 'form-section';
    sectionEl.setAttribute('data-section-id', section.id);

    if (section.label) {
      const legend = document.createElement('legend');
      legend.className = 'form-section-title';
      legend.textContent = section.label;
      sectionEl.appendChild(legend);
    }

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'form-section-fields';

    if (section.fields && Array.isArray(section.fields)) {
      section.fields.forEach((field) => {
        this._renderField(field, fieldsContainer);
      });
    }

    sectionEl.appendChild(fieldsContainer);
    container.appendChild(sectionEl);
  }

  /**
   * Apply rule evaluation results to DOM
   */
  _applyRuleResults(results) {
    results.forEach((fieldState, fieldId) => {
      const fieldRenderer = this.fieldRenderers.get(fieldId);
      if (fieldRenderer) {
        fieldRenderer.updateFieldDisplay(fieldState);
      }
    });
  }

  /**
   * Collect form data
   */
  collectFormData() {
    const data = {};
    const traverse = (fields) => {
      fields.forEach((field) => {
        if (field.type === Constants.FIELD_TYPES.SECTION && field.fields) {
          traverse(field.fields);
        } else {
          data[field.model] = this.formData[field.model];
        }
      });
    };
    traverse(this.schema.fields);
    return data;
  }

  /**
   * Handle form submission
   */
  _handleSubmit(event) {
    event.preventDefault();

    // Validate form
    const validation = this.validationEngine.validateForm(this.formData);

    if (!validation.isValid) {
      this.eventBus.emit(Constants.EVENTS.VALIDATION_ERROR, validation.errors);
      console.log('Form has errors:', validation.errors);
      return;
    }

    // Collect and emit form data
    const formData = this.collectFormData();
    this.stateManager.setFormData(formData);
    this.eventBus.emit('form:submitted', formData);

    console.log('Form submitted:', formData);
  }

  /**
   * Update schema and re-render
   */
  updateSchema(schema) {
    this.schema = schema;
    this.ruleEngine.updateSchema(schema);
    this.fieldRenderers.clear();
    this.render();
  }

  /**
   * Set form data programmatically
   */
  setFormData(data) {
    this.formData = { ...data };
    this._updateInputsFromData();
  }

  /**
   * Update input elements from form data
   */
  _updateInputsFromData() {
    const schema = this.schema;
    const traverse = (fields) => {
      fields.forEach((field) => {
        if (field.type === Constants.FIELD_TYPES.SECTION && field.fields) {
          traverse(field.fields);
        } else {
          const input = document.querySelector(
            `[data-field-id="${field.id}"] input, [data-field-id="${field.id}"] select, [data-field-id="${field.id}"] textarea`
          );
          if (input) {
            const value = this.formData[field.model];
            if (input.type === 'checkbox') {
              input.checked = value || false;
            } else if (input.type === 'radio') {
              const radio = document.querySelector(
                `input[name="${field.id}"][value="${value}"]`
              );
              if (radio) radio.checked = true;
            } else {
              input.value = value || '';
            }
          }
        }
      });
    };

    traverse(schema.fields);
  }

  /**
   * Get form data
   */
  getFormData() {
    return { ...this.formData };
  }

  /**
   * Reset form to defaults
   */
  reset() {
    this.formData = {};
    this.render();
  }

  /**
   * Validate and return errors
   */
  validate() {
    return this.validationEngine.validateForm(this.formData);
  }
}

export default FormRenderer;
