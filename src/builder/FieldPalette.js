/**
 * FieldPalette - Draggable field types for the builder
 */
import Constants from '../utils/Constants.js';
import { i18n } from '../utils/i18n.js';

export class FieldPalette {
  constructor(containerId, eventBus) {
    this.container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;
    this.eventBus = eventBus;
  }

  /**
   * Render field palette
   */
  render() {
    if (!this.container) {
      console.error('Palette container not found');
      return;
    }

    this.container.innerHTML = '';
    this.container.className = 'field-palette';

    const title = document.createElement('h3');
    title.textContent = i18n.t('fieldTypesHeader');
    this.container.appendChild(title);

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'palette-fields';

    // Define field types with categories
    const fieldCategories = [
      {
        name: i18n.t('categoryBasic'),
        fields: [
          { type: Constants.FIELD_TYPES.TEXT, label: i18n.t('fieldType_text'), icon: '📝' },
          { type: Constants.FIELD_TYPES.EMAIL, label: i18n.t('fieldType_email'), icon: '📧' },
          { type: Constants.FIELD_TYPES.NUMBER, label: i18n.t('fieldType_number'), icon: '🔢' },
          { type: Constants.FIELD_TYPES.TEXTAREA, label: i18n.t('fieldType_textarea'), icon: '📄' },
        ],
      },
      {
        name: i18n.t('categorySelection'),
        fields: [
          { type: Constants.FIELD_TYPES.SELECT, label: i18n.t('fieldType_select'), icon: '📋' },
          { type: Constants.FIELD_TYPES.MULTISELECT, label: i18n.t('fieldType_multiselect'), icon: '☑️' },
          { type: Constants.FIELD_TYPES.RADIO, label: i18n.t('fieldType_radio'), icon: '◯' },
          { type: Constants.FIELD_TYPES.CHECKBOX, label: i18n.t('fieldType_checkbox'), icon: '✓' },
        ],
      },
      {
        name: i18n.t('categorySpecialized'),
        fields: [
          { type: Constants.FIELD_TYPES.DATE, label: i18n.t('fieldType_date'), icon: '📅' },
          { type: Constants.FIELD_TYPES.FILE, label: i18n.t('fieldType_file'), icon: '📎' },
          { type: Constants.FIELD_TYPES.SWITCH, label: i18n.t('fieldType_switch'), icon: '⚙️' },
          { type: Constants.FIELD_TYPES.SECTION, label: i18n.t('fieldType_section'), icon: '📑' },
        ],
      },
    ];

    fieldCategories.forEach((category) => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'palette-category';

      const categoryTitle = document.createElement('h4');
      categoryTitle.textContent = category.name;
      categoryEl.appendChild(categoryTitle);

      const categoryFields = document.createElement('div');
      categoryFields.className = 'category-fields';

      category.fields.forEach((fieldInfo) => {
        const fieldBtn = document.createElement('div');
        fieldBtn.className = 'palette-field';
        fieldBtn.draggable = true;
        fieldBtn.innerHTML = `${fieldInfo.icon} ${fieldInfo.label}`;
        fieldBtn.setAttribute('data-field-type', fieldInfo.type);

        fieldBtn.addEventListener('dragstart', (e) => {
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('fieldType', fieldInfo.type);
        });

        fieldBtn.addEventListener('dragend', (e) => {
          e.dataTransfer.effectAllowed = 'none';
        });

        categoryFields.appendChild(fieldBtn);
      });

      categoryEl.appendChild(categoryFields);
      fieldsContainer.appendChild(categoryEl);
    });

    this.container.appendChild(fieldsContainer);
  }
}

export default FieldPalette;
