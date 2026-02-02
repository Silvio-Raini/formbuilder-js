/**
 * SchemaEngine - Manages form schema structure and validation
 */
import { UUID } from '../utils/UUID.js';
import Constants from '../utils/Constants.js';

export class SchemaEngine {
  /**
   * Create a new field template
   */
  static createField(type, overrides = {}) {
    const defaults = {
      id: UUID.generateFieldId(),
      type,
      model: `field_${Date.now()}`,
      label: String(type).charAt(0).toUpperCase() + String(type).slice(1),
      placeholder: '',
      default: this._getDefaultValue(type),
      required: false,
      disabled: false,
      validation: [],
      visibility: null,
      logic: [],
      options: type === Constants.FIELD_TYPES.SELECT || 
               type === Constants.FIELD_TYPES.MULTISELECT ||
               type === Constants.FIELD_TYPES.RADIO
        ? []
        : undefined,
      helpText: '',
      className: '',
      ...overrides,
    };

    // Clean up undefined properties
    Object.keys(defaults).forEach(key => {
      if (defaults[key] === undefined) {
        delete defaults[key];
      }
    });

    return defaults;
  }

  /**
   * Get default value based on field type
   */
  static _getDefaultValue(type) {
    const defaults = {
      [Constants.FIELD_TYPES.TEXT]: '',
      [Constants.FIELD_TYPES.TEXTAREA]: '',
      [Constants.FIELD_TYPES.NUMBER]: 0,
      [Constants.FIELD_TYPES.EMAIL]: '',
      [Constants.FIELD_TYPES.SELECT]: null,
      [Constants.FIELD_TYPES.MULTISELECT]: [],
      [Constants.FIELD_TYPES.CHECKBOX]: false,
      [Constants.FIELD_TYPES.RADIO]: null,
      [Constants.FIELD_TYPES.SWITCH]: false,
      [Constants.FIELD_TYPES.DATE]: '',
      [Constants.FIELD_TYPES.FILE]: null,
      [Constants.FIELD_TYPES.SECTION]: [],
    };

    return defaults[type] ?? '';
  }

  /**
   * Create a new section
   */
  static createSection(overrides = {}) {
    return {
      id: UUID.generateSectionId(),
      type: Constants.FIELD_TYPES.SECTION,
      label: 'New Section',
      fields: [],
      className: '',
      ...overrides,
    };
  }

  /**
   * Clone a field
   */
  static cloneField(field) {
    const cloned = JSON.parse(JSON.stringify(field));
    cloned.id = UUID.generateFieldId();
    cloned.model = `field_${Date.now()}`;
    return cloned;
  }

  /**
   * Validate schema structure
   */
  static validateSchema(schema) {
    const errors = [];

    if (!schema.meta) {
      errors.push('Schema must have meta object');
    }

    if (!schema.fields || !Array.isArray(schema.fields)) {
      errors.push('Schema must have fields array');
    }

    if (schema.fields) {
      schema.fields.forEach((field, index) => {
        if (!field.id) {
          errors.push(`Field at index ${index} missing id`);
        }
        if (!field.type) {
          errors.push(`Field ${field.id} missing type`);
        }
        if (!field.model) {
          errors.push(`Field ${field.id} missing model`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all field models
   */
  static getAllFieldModels(schema) {
    const models = new Set();

    const traverse = (fields) => {
      fields.forEach((field) => {
        if (field.model) {
          models.add(field.model);
        }
        if (field.type === Constants.FIELD_TYPES.SECTION && field.fields) {
          traverse(field.fields);
        }
      });
    };

    traverse(schema.fields);
    return Array.from(models);
  }

  /**
   * Find field by id (recursive)
   */
  static findField(schema, fieldId) {
    const traverse = (fields) => {
      for (const field of fields) {
        if (field.id === fieldId) {
          return field;
        }
        if (field.type === Constants.FIELD_TYPES.SECTION && field.fields) {
          const found = traverse(field.fields);
          if (found) return found;
        }
      }
      return null;
    };

    return traverse(schema.fields);
  }

  /**
   * Find field index (recursive)
   */
  static findFieldIndex(schema, fieldId, parentFields = null) {
    const fields = parentFields || schema.fields;
    
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].id === fieldId) {
        return i;
      }
      if (fields[i].type === Constants.FIELD_TYPES.SECTION && fields[i].fields) {
        const index = this.findFieldIndex(schema, fieldId, fields[i].fields);
        if (index !== -1) return index;
      }
    }
    return -1;
  }

  /**
   * Get all field dependencies
   */
  static getDependencies(schema) {
    const deps = new Map();

    const traverse = (fields) => {
      fields.forEach((field) => {
        const fieldDeps = [];

        // Visibility dependencies
        if (field.visibility && field.visibility.dependsOn) {
          fieldDeps.push(field.visibility.dependsOn);
        }

        // Logic dependencies
        if (field.logic && Array.isArray(field.logic)) {
          field.logic.forEach((rule) => {
            if (rule.if && rule.if.field) {
              fieldDeps.push(rule.if.field);
            }
          });
        }

        if (fieldDeps.length > 0) {
          deps.set(field.id, fieldDeps);
        }

        if (field.type === Constants.FIELD_TYPES.SECTION && field.fields) {
          traverse(field.fields);
        }
      });
    };

    traverse(schema.fields);
    return deps;
  }

  /**
   * Detect circular dependencies
   */
  static detectCircularDependencies(schema) {
    const deps = this.getDependencies(schema);
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (fieldId) => {
      visited.add(fieldId);
      recursionStack.add(fieldId);

      const fieldDeps = deps.get(fieldId) || [];
      for (const dep of fieldDeps) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }

      recursionStack.delete(fieldId);
      return false;
    };

    const cycles = [];
    for (const fieldId of deps.keys()) {
      if (!visited.has(fieldId)) {
        if (hasCycle(fieldId)) {
          cycles.push(fieldId);
        }
      }
    }

    return cycles;
  }

  /**
   * Export schema as JSON
   */
  static exportSchema(schema) {
    return JSON.stringify(schema, null, 2);
  }

  /**
   * Import schema from JSON
   */
  static importSchema(jsonString) {
    try {
      const schema = JSON.parse(jsonString);
      const validation = this.validateSchema(schema);
      return { success: true, schema, errors: [] };
    } catch (error) {
      return { success: false, schema: null, errors: [error.message] };
    }
  }
}

export default SchemaEngine;
