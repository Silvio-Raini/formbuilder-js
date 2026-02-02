/**
 * PropertyEditor - Edit field properties and rules
 */
import Constants from '../utils/Constants.js';
import { i18n } from '../utils/i18n.js';

export class PropertyEditor {
  constructor(containerId, stateManager, eventBus) {
    this.container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.currentField = null;
  }

  /**
   * Render property editor
   */
  render(fieldId) {
    if (!this.container) {
      console.error('PropertyEditor container not found');
      return;
    }

    const field = this.stateManager.getField(fieldId);
    if (!field) {
      this.container.innerHTML = '';
      return;
    }

    this.currentField = field;
    this.container.innerHTML = '';
    this.container.className = 'property-editor';

    // Check if this is a section (type === 'section')
    if (field.type === Constants.FIELD_TYPES.SECTION || field.type === 'section') {
      this._renderSectionProperties(field);
      return;
    }

    // Field properties
    this._renderBasicProperties(field);

    // Validation rules
    this._renderValidationRules(field);

    // Logic rules
    this._renderLogicRules(field);

    // Options for select/radio fields
    if (
      field.type === Constants.FIELD_TYPES.SELECT ||
      field.type === Constants.FIELD_TYPES.MULTISELECT ||
      field.type === Constants.FIELD_TYPES.RADIO
    ) {
      this._renderOptions(field);
    }
  }

  /**
   * Render section properties (for section type fields)
   */
  _renderSectionProperties(section) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'editor-section';

    const title = document.createElement('h4');
    title.textContent = i18n.t('sectionLabel');
    sectionDiv.appendChild(title);

    // Section label
    sectionDiv.appendChild(
      this._createInputField('label', i18n.t('label'), section.label || '', (value) => {
        this.stateManager.updateField(section.id, { label: value });
      })
    );

    // Section description
    sectionDiv.appendChild(
      this._createInputField('description', 'Description', section.description || '', (value) => {
        this.stateManager.updateField(section.id, { description: value });
      })
    );

    // Disabled checkbox for entire section
    sectionDiv.appendChild(
      this._createCheckboxField('disabled', i18n.t('disabled'), section.disabled, (value) => {
        this.stateManager.updateField(section.id, { disabled: value });
      })
    );

    this.container.appendChild(sectionDiv);

    // Conditional Logic Rules for the entire section
    this._renderSectionLogicRules(section);
  }

  /**
   * Render logic rules for sections
   */
  _renderSectionLogicRules(section) {
    const rulesSection = document.createElement('div');
    rulesSection.className = 'editor-section';

    const title = document.createElement('h4');
    title.textContent = i18n.t('conditionalLogic');
    rulesSection.appendChild(title);

    const logicContainer = document.createElement('div');
    logicContainer.className = 'logic-rules';

    // Display existing logic
    if (section.logic && section.logic.length > 0) {
      section.logic.forEach((rule, index) => {
        const ruleEl = this._createLogicRuleElement(section, rule, index);
        logicContainer.appendChild(ruleEl);
      });
    }

    // Add logic rule button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-rule-btn';
    addBtn.textContent = i18n.t('addLogic');
    addBtn.addEventListener('click', () => {
      const newLogic = {
        if: { field: '', operator: 'equals', value: '' },
        then: [{ action: 'show' }],
      };
      const logic = [...(section.logic || []), newLogic];
      this.stateManager.updateField(section.id, { logic });
    });

    rulesSection.appendChild(logicContainer);
    rulesSection.appendChild(addBtn);
    this.container.appendChild(rulesSection);
  }

  /**
   * Render basic field properties
   */
  _renderBasicProperties(field) {
    const section = document.createElement('div');
    section.className = 'editor-section';

    const title = document.createElement('h4');
    title.textContent = i18n.t('basicProperties');
    section.appendChild(title);

    // Label
    section.appendChild(
      this._createInputField('label', i18n.t('label'), field.label, (value) => {
        this.stateManager.updateField(field.id, { label: value });
      })
    );

    // Placeholder
    if (
      field.type === Constants.FIELD_TYPES.TEXT ||
      field.type === Constants.FIELD_TYPES.EMAIL ||
      field.type === Constants.FIELD_TYPES.NUMBER ||
      field.type === Constants.FIELD_TYPES.TEXTAREA
    ) {
      section.appendChild(
        this._createInputField('placeholder', i18n.t('placeholder'), field.placeholder || '', (value) => {
          this.stateManager.updateField(field.id, { placeholder: value });
        })
      );
    }

    // Help text
    section.appendChild(
      this._createInputField('helpText', i18n.t('helpText'), field.helpText || '', (value) => {
        this.stateManager.updateField(field.id, { helpText: value });
      })
    );

    // Required checkbox
    section.appendChild(
      this._createCheckboxField('required', i18n.t('required'), field.required, (value) => {
        this.stateManager.updateField(field.id, { required: value });
      })
    );

    // Disabled checkbox
    section.appendChild(
      this._createCheckboxField('disabled', i18n.t('disabled'), field.disabled, (value) => {
        this.stateManager.updateField(field.id, { disabled: value });
      })
    );

    // Model name
    const modelGroup = document.createElement('div');
    modelGroup.className = 'form-group';

    const modelLabel = document.createElement('label');
    modelLabel.textContent = i18n.t('modelName');
    modelGroup.appendChild(modelLabel);

    const modelInput = document.createElement('input');
    modelInput.type = 'text';
    modelInput.value = field.model;
    modelInput.readOnly = true;
    modelInput.className = 'form-input';
    modelGroup.appendChild(modelInput);

    section.appendChild(modelGroup);

    this.container.appendChild(section);
  }

  /**
   * Render validation rules section
   */
  _renderValidationRules(field) {
    const section = document.createElement('div');
    section.className = 'editor-section';

    const title = document.createElement('h4');
    title.textContent = i18n.t('validationRules');
    section.appendChild(title);

    const rulesContainer = document.createElement('div');
    rulesContainer.className = 'validation-rules';

    // Display existing rules
    if (field.validation && field.validation.length > 0) {
      field.validation.forEach((rule, index) => {
        const ruleEl = this._createRuleElement(field, rule, index, 'validation');
        rulesContainer.appendChild(ruleEl);
      });
    }

    // Add rule button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-rule-btn';
    addBtn.textContent = i18n.t('addValidation');
    addBtn.addEventListener('click', () => {
      const newRule = { rule: Constants.VALIDATION_RULES.REQUIRED, message: '' };
      const validation = [...(field.validation || []), newRule];
      this.stateManager.updateField(field.id, { validation });
    });

    section.appendChild(rulesContainer);
    section.appendChild(addBtn);

    this.container.appendChild(section);
  }

  /**
   * Render logic rules section
   */
  _renderLogicRules(field) {
    const section = document.createElement('div');
    section.className = 'editor-section';

    const title = document.createElement('h4');
    title.textContent = i18n.t('conditionalLogic');
    section.appendChild(title);

    const logicContainer = document.createElement('div');
    logicContainer.className = 'logic-rules';

    // Display existing logic
    if (field.logic && field.logic.length > 0) {
      field.logic.forEach((rule, index) => {
        const ruleEl = this._createLogicRuleElement(field, rule, index);
        logicContainer.appendChild(ruleEl);
      });
    }

    // Add logic rule button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-rule-btn';
    addBtn.textContent = i18n.t('addLogic');
    addBtn.addEventListener('click', () => {
      const newLogic = {
        if: { field: '', operator: 'equals', value: '' },
        then: [{ action: 'show' }],
      };
      const logic = [...(field.logic || []), newLogic];
      this.stateManager.updateField(field.id, { logic });
    });

    section.appendChild(logicContainer);
    section.appendChild(addBtn);

    this.container.appendChild(section);
  }

  /**
   * Render options for select/radio fields
   */
  _renderOptions(field) {
    const section = document.createElement('div');
    section.className = 'editor-section';

    const title = document.createElement('h4');
    title.textContent = i18n.t('options');
    section.appendChild(title);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';

    if (field.options && field.options.length > 0) {
      field.options.forEach((option, index) => {
        const optionEl = this._createOptionElement(field, option, index);
        optionsContainer.appendChild(optionEl);
      });
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'add-option-btn';
    addBtn.textContent = '+ Add Option';
    addBtn.addEventListener('click', () => {
      const newOption = { value: '', label: '' };
      const options = [...(field.options || []), newOption];
      this.stateManager.updateField(field.id, { options });
    });

    section.appendChild(optionsContainer);
    section.appendChild(addBtn);

    this.container.appendChild(section);
  }

  /**
   * Create validation/logic rule element
   */
  _createRuleElement(field, rule, index, type) {
    const ruleEl = document.createElement('div');
    ruleEl.className = 'rule-item';

    const ruleType = document.createElement('select');
    ruleType.className = 'rule-type-select';
    ruleType.value = rule.rule || Constants.VALIDATION_RULES.REQUIRED;

    Object.values(Constants.VALIDATION_RULES).forEach((ruleType_) => {
      const option = document.createElement('option');
      option.value = ruleType_;
      option.textContent = ruleType_;
      ruleType.appendChild(option);
    });

    ruleType.addEventListener('change', (e) => {
      const validation = [...field.validation];
      validation[index].rule = e.target.value;
      this.stateManager.updateField(field.id, { validation });
    });

    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.placeholder = 'Error message';
    messageInput.value = rule.message || '';
    messageInput.addEventListener('change', (e) => {
      const validation = [...field.validation];
      validation[index].message = e.target.value;
      this.stateManager.updateField(field.id, { validation });
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-rule-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => {
      const validation = field.validation.filter((_, i) => i !== index);
      this.stateManager.updateField(field.id, { validation });
    });

    ruleEl.appendChild(ruleType);
    ruleEl.appendChild(messageInput);
    ruleEl.appendChild(removeBtn);

    return ruleEl;
  }

  /**
   * Create logic rule element
   */
  _createLogicRuleElement(field, logicRule, index) {
    const ruleEl = document.createElement('div');
    ruleEl.className = 'logic-rule-item';

    const condSection = document.createElement('div');
    condSection.className = 'logic-condition';
    condSection.innerHTML = '<strong>If:</strong>';

    // Condition field select
    const fieldSelect = document.createElement('select');
    fieldSelect.value = logicRule.if?.field || '';
    const schema = this.stateManager.getSchema();
    schema.fields.forEach((f) => {
      if (f.id !== field.id) {
        const option = document.createElement('option');
        option.value = f.id;
        option.textContent = f.label || f.id;
        fieldSelect.appendChild(option);
      }
    });

    fieldSelect.addEventListener('change', (e) => {
      const logic = [...field.logic];
      logic[index].if.field = e.target.value;
      this.stateManager.updateField(field.id, { logic });
    });

    // Operator select
    const operatorSelect = document.createElement('select');
    operatorSelect.value = logicRule.if?.operator || 'equals';
    Object.entries(Constants.OPERATORS).forEach(([key, value]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = key;
      operatorSelect.appendChild(option);
    });

    operatorSelect.addEventListener('change', (e) => {
      const logic = [...field.logic];
      logic[index].if.operator = e.target.value;
      this.stateManager.updateField(field.id, { logic });
    });

    // Value input
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.value = logicRule.if?.value || '';
    valueInput.addEventListener('change', (e) => {
      const logic = [...field.logic];
      logic[index].if.value = e.target.value;
      this.stateManager.updateField(field.id, { logic });
    });

    condSection.appendChild(fieldSelect);
    condSection.appendChild(operatorSelect);
    condSection.appendChild(valueInput);

    // Action section
    const actionSection = document.createElement('div');
    actionSection.className = 'logic-action';
    actionSection.innerHTML = '<strong>Then:</strong>';

    const actionSelect = document.createElement('select');
    if (logicRule.then && logicRule.then.length > 0) {
      actionSelect.value = logicRule.then[0].action || 'show';
    }
    Object.values(Constants.ACTIONS).forEach((action) => {
      const option = document.createElement('option');
      option.value = action;
      option.textContent = action;
      actionSelect.appendChild(option);
    });

    actionSelect.addEventListener('change', (e) => {
      const logic = [...field.logic];
      if (logic[index].then && logic[index].then.length > 0) {
        logic[index].then[0].action = e.target.value;
      }
      this.stateManager.updateField(field.id, { logic });
    });

    actionSection.appendChild(actionSelect);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-rule-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => {
      const logic = field.logic.filter((_, i) => i !== index);
      this.stateManager.updateField(field.id, { logic });
    });

    ruleEl.appendChild(condSection);
    ruleEl.appendChild(actionSection);
    ruleEl.appendChild(removeBtn);

    return ruleEl;
  }

  /**
   * Create option element
   */
  _createOptionElement(field, option, index) {
    const optionEl = document.createElement('div');
    optionEl.className = 'option-item';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.placeholder = 'Value';
    valueInput.value = option.value || '';
    valueInput.addEventListener('change', (e) => {
      const options = [...field.options];
      options[index].value = e.target.value;
      this.stateManager.updateField(field.id, { options });
    });

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'Label';
    labelInput.value = option.label || '';
    labelInput.addEventListener('change', (e) => {
      const options = [...field.options];
      options[index].label = e.target.value;
      this.stateManager.updateField(field.id, { options });
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-option-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => {
      const options = field.options.filter((_, i) => i !== index);
      this.stateManager.updateField(field.id, { options });
    });

    optionEl.appendChild(valueInput);
    optionEl.appendChild(labelInput);
    optionEl.appendChild(removeBtn);

    return optionEl;
  }

  /**
   * Create input field helper
   */
  _createInputField(name, label, value, onChange) {
    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    group.appendChild(labelEl);

    const input = document.createElement('input');
    input.type = name === 'helpText' ? 'text' : 'text';
    input.value = value;
    input.className = 'form-input';
    input.addEventListener('change', (e) => onChange(e.target.value));
    input.addEventListener('input', (e) => onChange(e.target.value));

    group.appendChild(input);
    return group;
  }

  /**
   * Create checkbox field helper
   */
  _createCheckboxField(name, label, checked, onChange) {
    const group = document.createElement('div');
    group.className = 'form-group form-checkbox-group';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `prop_${name}`;
    input.checked = checked;
    input.addEventListener('change', (e) => onChange(e.target.checked));

    const labelEl = document.createElement('label');
    labelEl.htmlFor = input.id;
    labelEl.textContent = label;

    group.appendChild(input);
    group.appendChild(labelEl);

    return group;
  }
}

export default PropertyEditor;
