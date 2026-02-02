/**
 * FieldRenderer - Renders individual form fields based on schema
 * Handles binding, events, and accessibility
 */
import Constants from '../utils/Constants.js';

export class FieldRenderer {
  constructor(field, formData, ruleEngine, validationEngine, stateManager, eventBus) {
    this.field = field;
    this.formData = formData;
    this.ruleEngine = ruleEngine;
    this.validationEngine = validationEngine;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
  }

  /**
   * Render the field element
   */
  render() {
    const wrapper = document.createElement('div');
    wrapper.className = `form-field form-field-${this.field.type}`;
    wrapper.setAttribute('data-field-id', this.field.id);

    if (this.field.className) {
      wrapper.classList.add(this.field.className);
    }

    // Create label if not checkbox/radio/switch
    if (!this._isCheckableType()) {
      const label = this._renderLabel();
      wrapper.appendChild(label);
    }

    // Render the input element
    const input = this._renderInput();
    wrapper.appendChild(input);

    // Render help text
    if (this.field.helpText) {
      const helpText = document.createElement('small');
      helpText.className = 'form-help-text';
      helpText.textContent = this.field.helpText;
      wrapper.appendChild(helpText);
    }

    // Render error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'form-errors';
    wrapper.appendChild(errorContainer);

    // Update field state based on rules
    this._applyRuleState(wrapper);

    // Setup event listeners
    this._setupEventListeners(input, wrapper);

    return wrapper;
  }

  /**
   * Render label
   */
  _renderLabel() {
    const label = document.createElement('label');
    label.className = 'form-label';
    label.setAttribute('for', this.field.id);

    const labelText = document.createElement('span');
    labelText.textContent = this.field.label || '';
    label.appendChild(labelText);

    if (this.field.required) {
      const requiredSpan = document.createElement('span');
      requiredSpan.className = 'form-required';
      requiredSpan.textContent = ' *';
      label.appendChild(requiredSpan);
    }

    return label;
  }

  /**
   * Render input based on field type
   */
  _renderInput() {
    switch (this.field.type) {
      case Constants.FIELD_TYPES.TEXT:
      case Constants.FIELD_TYPES.EMAIL:
      case Constants.FIELD_TYPES.NUMBER:
        return this._renderTextInput();

      case Constants.FIELD_TYPES.TEXTAREA:
        return this._renderTextarea();

      case Constants.FIELD_TYPES.SELECT:
        return this._renderSelect();

      case Constants.FIELD_TYPES.MULTISELECT:
        return this._renderMultiSelect();

      case Constants.FIELD_TYPES.CHECKBOX:
        return this._renderCheckbox();

      case Constants.FIELD_TYPES.RADIO:
        return this._renderRadio();

      case Constants.FIELD_TYPES.SWITCH:
        return this._renderSwitch();

      case Constants.FIELD_TYPES.DATE:
        return this._renderDateInput();

      case Constants.FIELD_TYPES.FILE:
        return this._renderFileInput();

      default:
        return this._renderTextInput();
    }
  }

  /**
   * Render text/email/number input
   */
  _renderTextInput() {
    const input = document.createElement('input');
    input.id = this.field.id;
    input.type = this.field.type === Constants.FIELD_TYPES.EMAIL ? 'email' : this.field.type;
    input.className = 'form-input';
    input.placeholder = this.field.placeholder || '';
    input.value = this.formData[this.field.model] || this.field.default || '';

    if (this.field.disabled) {
      input.disabled = true;
    }
    if (this.field.required) {
      input.required = true;
    }

    return input;
  }

  /**
   * Render textarea
   */
  _renderTextarea() {
    const textarea = document.createElement('textarea');
    textarea.id = this.field.id;
    textarea.className = 'form-textarea';
    textarea.placeholder = this.field.placeholder || '';
    textarea.textContent = this.formData[this.field.model] || this.field.default || '';

    if (this.field.disabled) {
      textarea.disabled = true;
    }
    if (this.field.required) {
      textarea.required = true;
    }

    return textarea;
  }

  /**
   * Render select
   */
  _renderSelect() {
    const select = document.createElement('select');
    select.id = this.field.id;
    select.className = 'form-select';

    // Default empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- Select --';
    select.appendChild(emptyOption);

    // Add options
    if (this.field.options) {
      this.field.options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt.value || opt;
        option.textContent = opt.label || opt;
        select.appendChild(option);
      });
    }

    select.value = this.formData[this.field.model] || this.field.default || '';

    if (this.field.disabled) {
      select.disabled = true;
    }
    if (this.field.required) {
      select.required = true;
    }

    return select;
  }

  /**
   * Render multi-select
   */
  _renderMultiSelect() {
    const select = document.createElement('select');
    select.id = this.field.id;
    select.className = 'form-multiselect';
    select.multiple = true;

    if (this.field.options) {
      this.field.options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt.value || opt;
        option.textContent = opt.label || opt;
        select.appendChild(option);
      });
    }

    const values = this.formData[this.field.model] || this.field.default || [];
    Array.from(select.options).forEach((option) => {
      option.selected = values.includes(option.value);
    });

    if (this.field.disabled) {
      select.disabled = true;
    }
    if (this.field.required) {
      select.required = true;
    }

    return select;
  }

  /**
   * Render checkbox
   */
  _renderCheckbox() {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-checkbox-wrapper';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = this.field.id;
    input.className = 'form-checkbox';
    input.checked = this.formData[this.field.model] || this.field.default || false;

    if (this.field.disabled) {
      input.disabled = true;
    }

    const label = document.createElement('label');
    label.htmlFor = this.field.id;
    label.className = 'form-checkbox-label';
    label.textContent = this.field.label || '';

    wrapper.appendChild(input);
    wrapper.appendChild(label);

    return wrapper;
  }

  /**
   * Render radio buttons
   */
  _renderRadio() {
    const wrapper = document.createElement('fieldset');
    wrapper.className = 'form-radio-wrapper';

    const legend = document.createElement('legend');
    legend.textContent = this.field.label || '';
    wrapper.appendChild(legend);

    if (this.field.options) {
      this.field.options.forEach((opt, index) => {
        const radioWrapper = document.createElement('div');
        radioWrapper.className = 'form-radio-item';

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `${this.field.id}_${index}`;
        input.name = this.field.id;
        input.value = opt.value || opt;
        input.className = 'form-radio';
        input.checked = (this.formData[this.field.model] || this.field.default) === input.value;

        if (this.field.disabled) {
          input.disabled = true;
        }

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.className = 'form-radio-label';
        label.textContent = opt.label || opt;

        radioWrapper.appendChild(input);
        radioWrapper.appendChild(label);
        wrapper.appendChild(radioWrapper);
      });
    }

    return wrapper;
  }

  /**
   * Render switch/toggle
   */
  _renderSwitch() {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-switch-wrapper';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = this.field.id;
    input.className = 'form-switch';
    input.checked = this.formData[this.field.model] || this.field.default || false;

    if (this.field.disabled) {
      input.disabled = true;
    }

    const label = document.createElement('label');
    label.htmlFor = this.field.id;
    label.className = 'form-switch-label';
    label.textContent = this.field.label || '';

    const slider = document.createElement('span');
    slider.className = 'form-switch-slider';

    wrapper.appendChild(input);
    wrapper.appendChild(slider);
    wrapper.appendChild(label);

    return wrapper;
  }

  /**
   * Render date input
   */
  _renderDateInput() {
    const input = document.createElement('input');
    input.id = this.field.id;
    input.type = 'date';
    input.className = 'form-input';
    input.value = this.formData[this.field.model] || this.field.default || '';

    if (this.field.disabled) {
      input.disabled = true;
    }
    if (this.field.required) {
      input.required = true;
    }

    return input;
  }

  /**
   * Render file input
   */
  _renderFileInput() {
    const input = document.createElement('input');
    input.id = this.field.id;
    input.type = 'file';
    input.className = 'form-file';

    if (this.field.disabled) {
      input.disabled = true;
    }
    if (this.field.required) {
      input.required = true;
    }

    return input;
  }

  /**
   * Check if field type is checkable (checkbox/radio)
   */
  _isCheckableType() {
    return (
      this.field.type === Constants.FIELD_TYPES.CHECKBOX ||
      this.field.type === Constants.FIELD_TYPES.RADIO ||
      this.field.type === Constants.FIELD_TYPES.SWITCH
    );
  }

  /**
   * Apply rule-based state to field
   */
  _applyRuleState(wrapper) {
    if (!this.ruleEngine) return;

    const fieldState = this.ruleEngine.getFieldState(
      this.field.id,
      this.formData
    );

    if (fieldState) {
      // Apply visibility
      if (!fieldState.visible) {
        wrapper.style.display = 'none';
      }

      // Apply enabled/disabled
      const input = wrapper.querySelector('input, textarea, select, fieldset');
      if (input) {
        input.disabled = !fieldState.enabled;
      }
    }
  }

  /**
   * Setup event listeners for input
   */
  _setupEventListeners(input, wrapper) {
    let inputElement = input;

    // Handle different input types
    if (input instanceof HTMLFieldSetElement) {
      const radioInputs = input.querySelectorAll('input[type="radio"]');
      radioInputs.forEach((radio) => {
        radio.addEventListener('change', () => {
          this._handleValueChange(radio.value);
        });
      });
      return;
    }

    if (input.classList.contains('form-checkbox-wrapper')) {
      inputElement = input.querySelector('input[type="checkbox"]');
    }

    if (!inputElement) return;

    // Value change event
    const eventType = inputElement.type === 'checkbox' ? 'change' : 'input';
    inputElement.addEventListener(eventType, () => {
      let value = inputElement.value;

      if (inputElement.type === 'checkbox') {
        value = inputElement.checked;
      } else if (inputElement.type === 'file') {
        value = inputElement.files;
      } else if (inputElement.classList.contains('form-multiselect')) {
        value = Array.from(inputElement.selectedOptions).map((opt) => opt.value);
      }

      this._handleValueChange(value);
    });

    // Blur event (mark as touched)
    inputElement.addEventListener('blur', () => {
      this.stateManager.setFieldTouched(this.field.id);
      this._validateField();
    });

    // Focus event
    inputElement.addEventListener('focus', () => {
      wrapper.classList.add('form-field-focused');
    });

    inputElement.addEventListener('blur', () => {
      wrapper.classList.remove('form-field-focused');
    });
  }

  /**
   * Handle value change
   */
  _handleValueChange(value) {
    this.formData[this.field.model] = value;
    this.stateManager.setFieldValue(this.field.id, value);
    this.eventBus.emit(Constants.EVENTS.FIELD_VALUE_CHANGED, {
      fieldId: this.field.id,
      value,
    });

    // Validate field
    this._validateField();

    // Evaluate rules
    if (this.ruleEngine) {
      this.ruleEngine.evaluateField(this.field.id, this.formData);
    }
  }

  /**
   * Validate field
   */
  _validateField() {
    if (!this.validationEngine) return;

    const errors = this.validationEngine.validateField(
      this.field.id,
      this.formData[this.field.model]
    );

    this.stateManager.setFieldErrors(this.field.id, errors);

    // Update UI
    const wrapper = document.querySelector(`[data-field-id="${this.field.id}"]`);
    if (wrapper) {
      const errorContainer = wrapper.querySelector('.form-errors');
      if (errorContainer) {
        errorContainer.innerHTML = '';
        errors.forEach((error) => {
          const errorEl = document.createElement('span');
          errorEl.className = 'form-error';
          errorEl.textContent = error;
          errorContainer.appendChild(errorEl);
        });

        if (errors.length > 0) {
          wrapper.classList.add('has-errors');
        } else {
          wrapper.classList.remove('has-errors');
        }
      }
    }

    const isValid = errors.length === 0;
    this.eventBus.emit(isValid ? Constants.EVENTS.VALIDATION_SUCCESS : Constants.EVENTS.VALIDATION_ERROR, {
      fieldId: this.field.id,
      errors,
    });
  }

  /**
   * Update field display based on rule state
   */
  updateFieldDisplay(fieldState) {
    const wrapper = document.querySelector(`[data-field-id="${this.field.id}"]`);
    if (!wrapper) return;

    // Update visibility
    wrapper.style.display = fieldState.visible ? '' : 'none';

    // Update enabled/disabled
    const inputs = wrapper.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.disabled = !fieldState.enabled;
    });

    // Update required
    if (fieldState.required !== undefined) {
      const inputs = wrapper.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        if (fieldState.required) {
          input.required = true;
        } else {
          input.removeAttribute('required');
        }
      });
    }
  }
}

export default FieldRenderer;
