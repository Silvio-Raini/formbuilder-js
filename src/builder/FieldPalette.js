/**
 * FieldPalette - Draggable field types for the builder
 */
import Constants from '../utils/Constants.js';

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
    title.textContent = 'Felder';
    this.container.appendChild(title);

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'palette-fields';

    // Define field types with categories
    const fieldCategories = [
      {
        name: 'Basic',
        fields: [
          { type: Constants.FIELD_TYPES.TEXT, label: 'Text', icon: '📝' },
          { type: Constants.FIELD_TYPES.EMAIL, label: 'Email', icon: '📧' },
          { type: Constants.FIELD_TYPES.NUMBER, label: 'Number', icon: '🔢' },
          { type: Constants.FIELD_TYPES.TEXTAREA, label: 'Textarea', icon: '📄' },
        ],
      },
      {
        name: 'Selection',
        fields: [
          { type: Constants.FIELD_TYPES.SELECT, label: 'Select', icon: '📋' },
          { type: Constants.FIELD_TYPES.MULTISELECT, label: 'Multi-Select', icon: '☑️' },
          { type: Constants.FIELD_TYPES.RADIO, label: 'Radio', icon: '◯' },
          { type: Constants.FIELD_TYPES.CHECKBOX, label: 'Checkbox', icon: '✓' },
        ],
      },
      {
        name: 'Specialized',
        fields: [
          { type: Constants.FIELD_TYPES.DATE, label: 'Date', icon: '📅' },
          { type: Constants.FIELD_TYPES.FILE, label: 'File', icon: '📎' },
          { type: Constants.FIELD_TYPES.SWITCH, label: 'Switch', icon: '⚙️' },
          { type: Constants.FIELD_TYPES.SECTION, label: 'Section', icon: '📑' },
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
