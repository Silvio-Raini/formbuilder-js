/**
 * RuleEngine - Evaluates conditional logic and manages field dependencies
 * Handles visibility, enabling/disabling, and dynamic value changes
 */
import Constants from '../utils/Constants.js';

export class RuleEngine {
  constructor(schema, stateManager, eventBus) {
    this.schema = schema;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.evaluationCache = new Map();
    this.dependencyGraph = new Map();
    this._buildDependencyGraph();
  }

  /**
   * Update schema reference
   */
  updateSchema(schema) {
    this.schema = schema;
    this.evaluationCache.clear();
    this._buildDependencyGraph();
  }

  /**
   * Build dependency graph for reactive updates
   */
  _buildDependencyGraph() {
    this.dependencyGraph.clear();

    const traverse = (fields) => {
      fields.forEach((field) => {
        // Initialize dependency list for each field
        if (!this.dependencyGraph.has(field.id)) {
          this.dependencyGraph.set(field.id, new Set());
        }

        // Visibility dependencies
        if (field.visibility && field.visibility.dependsOn) {
          this.dependencyGraph.get(field.visibility.dependsOn).add(field.id);
        }

        // Logic rule dependencies
        if (field.logic && Array.isArray(field.logic)) {
          field.logic.forEach((rule) => {
            if (rule.if && rule.if.field) {
              const depField = rule.if.field;
              if (!this.dependencyGraph.has(depField)) {
                this.dependencyGraph.set(depField, new Set());
              }
              this.dependencyGraph.get(depField).add(field.id);
            }
          });
        }

        if (field.type === Constants.FIELD_TYPES.SECTION && field.fields) {
          traverse(field.fields);
        }
      });
    };

    traverse(this.schema.fields);
  }

  /**
   * Evaluate all rules for the entire form
   */
  evaluateAll(formData) {
    const results = new Map();
    const formDataCopy = { ...formData };

    // Evaluate each field's rules
    this.schema.fields.forEach((field) => {
      this._evaluateField(field, formDataCopy, results);
    });

    this.eventBus.emit(Constants.EVENTS.RULES_EVALUATED, results);
    return results;
  }

  /**
   * Evaluate rules for a specific field and its dependents
   */
  evaluateField(fieldId, formData) {
    const field = this._findField(this.schema.fields, fieldId);
    if (!field) return new Map();

    const formDataCopy = { ...formData };
    const results = new Map();

    // Evaluate this field
    this._evaluateField(field, formDataCopy, results);

    // Evaluate all dependent fields
    this._evaluateDependents(fieldId, formDataCopy, results);

    this.eventBus.emit(Constants.EVENTS.RULES_EVALUATED, results);
    return results;
  }

  /**
   * Evaluate all dependents of a field (cascade)
   */
  _evaluateDependents(fieldId, formData, results) {
    const dependents = this.dependencyGraph.get(fieldId);
    if (!dependents) return;

    dependents.forEach((dependentId) => {
      const field = this._findField(this.schema.fields, dependentId);
      if (field) {
        this._evaluateField(field, formData, results);
        this._evaluateDependents(dependentId, formData, results);
      }
    });
  }

  /**
   * Evaluate field's visibility and logic rules
   */
  _evaluateField(field, formData, results) {
    const fieldState = {
      visible: true,
      enabled: true,
      required: field.required,
      value: formData[field.model],
      actions: [],
    };

    // Evaluate visibility rule
    if (field.visibility) {
      fieldState.visible = this._evaluateCondition(
        field.visibility,
        formData
      );
    }

    // Evaluate logic rules
    if (field.logic && Array.isArray(field.logic)) {
      field.logic.forEach((logicRule) => {
        if (this._evaluateCondition(logicRule.if, formData)) {
          if (logicRule.then && Array.isArray(logicRule.then)) {
            logicRule.then.forEach((action) => {
              fieldState.actions.push(action);
              this._applyAction(field, action, fieldState, formData);
            });
          }
        }
      });
    }

    results.set(field.id, fieldState);
  }

  /**
   * Evaluate a single condition
   */
  _evaluateCondition(condition, formData) {
    if (!condition) return true;

    const { field, operator, value } = condition;
    const fieldValue = formData[field];

    switch (operator) {
      case Constants.OPERATORS.EQUALS:
      case '=':
      case '==':
        return this._equals(fieldValue, value);

      case Constants.OPERATORS.NOT_EQUALS:
      case '!=':
      case '!==':
        return !this._equals(fieldValue, value);

      case Constants.OPERATORS.LESS_THAN:
      case '<':
        return Number(fieldValue) < Number(value);

      case Constants.OPERATORS.GREATER_THAN:
      case '>':
        return Number(fieldValue) > Number(value);

      case Constants.OPERATORS.LESS_THAN_EQUAL:
      case '<=':
        return Number(fieldValue) <= Number(value);

      case Constants.OPERATORS.GREATER_THAN_EQUAL:
      case '>=':
        return Number(fieldValue) >= Number(value);

      case Constants.OPERATORS.INCLUDES:
        return this._includes(fieldValue, value);

      case Constants.OPERATORS.IN:
        return Array.isArray(value) && value.includes(fieldValue);

      case Constants.OPERATORS.NOT_IN:
        return Array.isArray(value) && !value.includes(fieldValue);

      case Constants.OPERATORS.EXISTS:
        return fieldValue !== null && fieldValue !== undefined;

      case Constants.OPERATORS.EMPTY:
        return fieldValue === null || fieldValue === undefined || fieldValue === '';

      default:
        return true;
    }
  }

  /**
   * Apply action to field state
   */
  _applyAction(field, action, fieldState, formData) {
    switch (action.action) {
      case Constants.ACTIONS.SHOW:
        fieldState.visible = true;
        break;

      case Constants.ACTIONS.HIDE:
        fieldState.visible = false;
        break;

      case Constants.ACTIONS.ENABLE:
        fieldState.enabled = true;
        break;

      case Constants.ACTIONS.DISABLE:
        fieldState.enabled = false;
        break;

      case Constants.ACTIONS.SET_VALUE:
        if (action.value !== undefined) {
          fieldState.value = action.value;
          formData[field.model] = action.value;
        }
        break;

      case Constants.ACTIONS.SET_REQUIRED:
        fieldState.required = action.value !== false;
        break;

      case Constants.ACTIONS.SET_OPTIONS:
        if (action.options) {
          fieldState.options = action.options;
        }
        break;

      default:
        break;
    }
  }

  /**
   * Helper: Evaluate equality
   */
  _equals(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((val, idx) => val === b[idx]);
    }
    return a === b;
  }

  /**
   * Helper: Evaluate includes
   */
  _includes(fieldValue, searchValue) {
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(searchValue);
    }
    if (typeof fieldValue === 'string') {
      return fieldValue.includes(String(searchValue));
    }
    return false;
  }

  /**
   * Helper: Find field recursively
   */
  _findField(fields, fieldId) {
    for (const field of fields) {
      if (field.id === fieldId) {
        return field;
      }
      if (field.type === Constants.FIELD_TYPES.SECTION && field.fields) {
        const found = this._findField(field.fields, fieldId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Clear evaluation cache
   */
  clearCache() {
    this.evaluationCache.clear();
  }

  /**
   * Get field state after rule evaluation
   */
  getFieldState(fieldId, formData) {
    const results = this.evaluateAll(formData);
    return results.get(fieldId);
  }
}

export default RuleEngine;
