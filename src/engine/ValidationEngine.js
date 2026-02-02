/**
 * ValidationEngine - Validates form data against schema
 */
import Constants from '../utils/Constants.js';

export class ValidationEngine {
  constructor(schema, stateManager) {
    this.schema = schema;
    this.stateManager = stateManager;
    this.validators = this._buildValidators();
  }

  /**
   * Validate entire form
   */
  validateForm(formData) {
    const errors = {};
    let isValid = true;

    this.schema.fields.forEach((field) => {
      const fieldErrors = this.validateField(field.id, formData[field.model]);
      if (fieldErrors.length > 0) {
        errors[field.id] = fieldErrors;
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  /**
   * Validate a single field
   */
  validateField(fieldId, value) {
    const field = this.stateManager.getField(fieldId);
    if (!field) return [];

    const errors = [];

    // Get applicable validation rules
    const rules = field.validation || [];

    for (const rule of rules) {
      const error = this._validateRule(field, rule, value);
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  /**
   * Validate a single rule
   */
  _validateRule(field, rule, value) {
    const ruleName = rule.rule || rule;

    switch (ruleName) {
      case Constants.VALIDATION_RULES.REQUIRED:
        return this._validateRequired(value, rule.message);

      case Constants.VALIDATION_RULES.EMAIL:
        return this._validateEmail(value, rule.message);

      case Constants.VALIDATION_RULES.MIN_LENGTH:
        return this._validateMinLength(value, rule.value || rule.min, rule.message);

      case Constants.VALIDATION_RULES.MAX_LENGTH:
        return this._validateMaxLength(value, rule.value || rule.max, rule.message);

      case Constants.VALIDATION_RULES.MIN:
        return this._validateMin(value, rule.value || rule.min, rule.message);

      case Constants.VALIDATION_RULES.MAX:
        return this._validateMax(value, rule.value || rule.max, rule.message);

      case Constants.VALIDATION_RULES.PATTERN:
        return this._validatePattern(value, rule.value || rule.pattern, rule.message);

      case Constants.VALIDATION_RULES.CUSTOM:
        return this._validateCustom(value, rule.validator, rule.message);

      default:
        return null;
    }
  }

  /**
   * Built-in validators
   */

  _validateRequired(value, customMessage) {
    if (value === null || value === undefined || value === '') {
      return customMessage || 'This field is required';
    }
    if (Array.isArray(value) && value.length === 0) {
      return customMessage || 'This field is required';
    }
    return null;
  }

  _validateEmail(value, customMessage) {
    if (!value) return null; // Let required validator handle this
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return customMessage || 'Invalid email address';
    }
    return null;
  }

  _validateMinLength(value, min, customMessage) {
    if (!value) return null;
    if (String(value).length < min) {
      return customMessage || `Minimum length is ${min}`;
    }
    return null;
  }

  _validateMaxLength(value, max, customMessage) {
    if (!value) return null;
    if (String(value).length > max) {
      return customMessage || `Maximum length is ${max}`;
    }
    return null;
  }

  _validateMin(value, min, customMessage) {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) < min) {
      return customMessage || `Minimum value is ${min}`;
    }
    return null;
  }

  _validateMax(value, max, customMessage) {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) > max) {
      return customMessage || `Maximum value is ${max}`;
    }
    return null;
  }

  _validatePattern(value, pattern, customMessage) {
    if (!value) return null;
    const regex = new RegExp(pattern);
    if (!regex.test(String(value))) {
      return customMessage || `Invalid format`;
    }
    return null;
  }

  _validateCustom(value, validator, customMessage) {
    if (typeof validator !== 'function') return null;
    try {
      const result = validator(value);
      if (result !== true) {
        return customMessage || result || 'Invalid value';
      }
    } catch (error) {
      return customMessage || error.message;
    }
    return null;
  }

  /**
   * Build custom validator map
   */
  _buildValidators() {
    return new Map();
  }

  /**
   * Register custom validator
   */
  registerValidator(name, validatorFunction) {
    this.validators.set(name, validatorFunction);
  }

  /**
   * Get custom validator
   */
  getValidator(name) {
    return this.validators.get(name);
  }
}

export default ValidationEngine;
