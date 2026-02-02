/**
 * i18n - Internationalization / Translation System
 */

const translations = {
  de: {
    // UI Labels
    'fieldTypes': 'Feldtypen',
    'formBuilder': 'Formulargestalter',
    'livePreview': 'Echtzeitvorschau',
    'properties': 'Eigenschaften',
    
    // Buttons
    'undo': '↶ Rückgängig',
    'redo': '↷ Wiederherstellen',
    'export': '📥 Schema exportieren',
    'import': '📤 Schema importieren',
    'addPage': '+ Seite',
    'prevPage': '◀',
    'nextPage': '▶',
    'clear': '🗑 Löschen',
    'submit': 'Absenden',
    'addField': '+ Feld hinzufügen',
    'addSection': '+ Abschnitt',
    'addLogic': '+ Logik-Regel',
    'addValidation': '+ Validierungsregel',
    'addOption': '+ Option',
    'edit': '✎',
    'delete': '🗑',
    'duplicate': '⎘',
    
    // Forms & Fields
    'basicProperties': 'Grundlegende Eigenschaften',
    'label': 'Bezeichnung',
    'placeholder': 'Platzhalter',
    'helpText': 'Hilftext',
    'required': 'Erforderlich',
    'disabled': 'Deaktiviert',
    'modelName': 'Modell/Feldname',
    'validationRules': 'Validierungsregeln',
    'conditionalLogic': 'Bedingte Logik',
    'options': 'Optionen',
    'sectionLabel': 'Abschnittsbezeichnung',
    
    // Messages
    'formName': 'Formularname',
    'deleteField': 'Feld löschen?',
    'deleteAllFields': 'Alle Felder löschen? Dies kann nicht rückgängig gemacht werden.',
    'clearAllConfirm': 'Alle Felder löschen? Dies kann nicht rückgängig gemacht werden.',
    'page': 'Seite',
    'section': 'Abschnitt',
    'newSection': 'Neuer Abschnitt',
    'newPage': 'Neue Seite',
  },
  en: {
    'fieldTypes': 'Field Types',
    'formBuilder': 'Form Builder',
    'livePreview': 'Live Preview',
    'properties': 'Properties',
    
    'undo': '↶ Undo',
    'redo': '↷ Redo',
    'export': '📥 Export Schema',
    'import': '📤 Import Schema',
    'addPage': '+ Page',
    'prevPage': '◀',
    'nextPage': '▶',
    'clear': '🗑 Clear',
    'submit': 'Submit',
    'addField': '+ Add Field',
    'addSection': '+ Section',
    'addLogic': '+ Add Logic',
    'addValidation': '+ Add Validation Rule',
    'addOption': '+ Add Option',
    'edit': '✎',
    'delete': '🗑',
    'duplicate': '⎘',
    
    'basicProperties': 'Basic Properties',
    'label': 'Label',
    'placeholder': 'Placeholder',
    'helpText': 'Help Text',
    'required': 'Required',
    'disabled': 'Disabled',
    'modelName': 'Model/Field Name',
    'validationRules': 'Validation Rules',
    'conditionalLogic': 'Conditional Logic',
    'options': 'Options',
    'sectionLabel': 'Section Label',
    
    'formName': 'Form Name',
    'deleteField': 'Delete field?',
    'deleteAllFields': 'Delete all fields? This cannot be undone.',
    'clearAllConfirm': 'Clear all fields? This cannot be undone.',
    'page': 'Page',
    'section': 'Section',
    'newSection': 'New Section',
    'newPage': 'New Page',
  },
  es: {
    'fieldTypes': 'Tipos de Campo',
    'formBuilder': 'Constructor de Formularios',
    'livePreview': 'Vista Previa en Vivo',
    'properties': 'Propiedades',
    
    'undo': '↶ Deshacer',
    'redo': '↷ Rehacer',
    'export': '📥 Exportar Esquema',
    'import': '📤 Importar Esquema',
    'addPage': '+ Página',
    'prevPage': '◀',
    'nextPage': '▶',
    'clear': '🗑 Limpiar',
    'submit': 'Enviar',
    'addField': '+ Añadir Campo',
    'addSection': '+ Sección',
    'addLogic': '+ Añadir Lógica',
    'addValidation': '+ Añadir Validación',
    'addOption': '+ Añadir Opción',
    'edit': '✎',
    'delete': '🗑',
    'duplicate': '⎘',
    
    'basicProperties': 'Propiedades Básicas',
    'label': 'Etiqueta',
    'placeholder': 'Marcador de Posición',
    'helpText': 'Texto de Ayuda',
    'required': 'Requerido',
    'disabled': 'Deshabilitado',
    'modelName': 'Nombre del Modelo/Campo',
    'validationRules': 'Reglas de Validación',
    'conditionalLogic': 'Lógica Condicional',
    'options': 'Opciones',
    'sectionLabel': 'Etiqueta de Sección',
    
    'formName': 'Nombre del Formulario',
    'deleteField': '¿Eliminar campo?',
    'deleteAllFields': '¿Eliminar todos los campos? Esto no se puede deshacer.',
    'clearAllConfirm': '¿Limpiar todos los campos? Esto no se puede deshacer.',
    'page': 'Página',
    'section': 'Sección',
    'newSection': 'Nueva Sección',
    'newPage': 'Nueva Página',
  },
  fr: {
    'fieldTypes': 'Types de Champ',
    'formBuilder': 'Générateur de Formulaires',
    'livePreview': 'Aperçu en Temps Réel',
    'properties': 'Propriétés',
    
    'undo': '↶ Annuler',
    'redo': '↷ Refaire',
    'export': '📥 Exporter le Schéma',
    'import': '📤 Importer le Schéma',
    'addPage': '+ Page',
    'prevPage': '◀',
    'nextPage': '▶',
    'clear': '🗑 Effacer',
    'submit': 'Soumettre',
    'addField': '+ Ajouter un Champ',
    'addSection': '+ Section',
    'addLogic': '+ Ajouter une Logique',
    'addValidation': '+ Ajouter une Validation',
    'addOption': '+ Ajouter une Option',
    'edit': '✎',
    'delete': '🗑',
    'duplicate': '⎘',
    
    'basicProperties': 'Propriétés Basiques',
    'label': 'Étiquette',
    'placeholder': 'Texte d\'Espace Réservé',
    'helpText': 'Texte d\'Aide',
    'required': 'Obligatoire',
    'disabled': 'Désactivé',
    'modelName': 'Nom du Modèle/Champ',
    'validationRules': 'Règles de Validation',
    'conditionalLogic': 'Logique Conditionnelle',
    'options': 'Options',
    'sectionLabel': 'Étiquette de Section',
    
    'formName': 'Nom du Formulaire',
    'deleteField': 'Supprimer le champ?',
    'deleteAllFields': 'Supprimer tous les champs? Cela ne peut pas être annulé.',
    'clearAllConfirm': 'Effacer tous les champs? Cela ne peut pas être annulé.',
    'page': 'Page',
    'section': 'Section',
    'newSection': 'Nouvelle Section',
    'newPage': 'Nouvelle Page',
  },
};

export class i18n {
  static language = 'en';

  static setLanguage(lang) {
    if (translations[lang]) {
      this.language = lang;
    }
  }

  static getLanguage() {
    return this.language;
  }

  static t(key) {
    return translations[this.language]?.[key] || translations.en?.[key] || key;
  }

  static has(key) {
    return !!translations[this.language]?.[key];
  }

  static getAvailableLanguages() {
    return Object.keys(translations);
  }
}

export default i18n;
