/**
 * Constants - Field types and validation rules
 */
export const FIELD_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  EMAIL: 'email',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SWITCH: 'switch',
  DATE: 'date',
  FILE: 'file',
  SECTION: 'section',
};

export const VALIDATION_RULES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  MIN: 'min',
  MAX: 'max',
  PATTERN: 'pattern',
  CUSTOM: 'custom',
};

export const OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'notEquals',
  LESS_THAN: '<',
  GREATER_THAN: '>',
  LESS_THAN_EQUAL: '<=',
  GREATER_THAN_EQUAL: '>=',
  INCLUDES: 'includes',
  EXISTS: 'exists',
  EMPTY: 'empty',
  IN: 'in',
  NOT_IN: 'notIn',
};

export const ACTIONS = {
  SHOW: 'show',
  HIDE: 'hide',
  ENABLE: 'enable',
  DISABLE: 'disable',
  SET_VALUE: 'setValue',
  SET_OPTIONS: 'setOptions',
  SET_REQUIRED: 'setRequired',
  SET_DISABLED: 'setDisabled',
};

export const EVENTS = {
  // Schema events
  SCHEMA_CHANGED: 'schema:changed',
  FIELD_ADDED: 'field:added',
  FIELD_REMOVED: 'field:removed',
  FIELD_UPDATED: 'field:updated',

  // Form events
  FORM_DATA_CHANGED: 'form:dataChanged',
  FIELD_VALUE_CHANGED: 'field:valueChanged',
  FIELD_TOUCHED: 'field:touched',
  VALIDATION_ERROR: 'validation:error',
  VALIDATION_SUCCESS: 'validation:success',

  // UI events
  FIELD_SELECTED: 'ui:fieldSelected',
  FIELD_UNSELECTED: 'ui:fieldUnselected',
  PREVIEW_TOGGLED: 'ui:previewToggled',

  // Rule events
  RULES_EVALUATED: 'rules:evaluated',
};

export default {
  FIELD_TYPES,
  VALIDATION_RULES,
  OPERATORS,
  ACTIONS,
  EVENTS,
};
