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
    
    // Console messages
    'consoleInitialized': 'FormBuilder initialisiert',
    'consoleUseBuilder': 'Verwende window.formBuilder um den Builder zu interagieren',
    'consoleGetSchema': 'getSchema() - Aktuelles Formular-Schema abrufen',
    'consoleSetSchema': 'setSchema(schema) - Formular-Schema setzen',
    'consoleGetFormData': 'getFormData() - Formulardaten abrufen',
    'consoleValidateForm': 'validateForm() - Formular validieren',
    'consoleSupportedLanguages': 'Unterstützte Sprachen: de, en, es, fr',
    'consoleSwitchLanguage': 'Sprache mit dem Dropdown in der Toolbar wechseln',
    
    // UI Section Headers
    'fieldTypesHeader': 'Feldtypen',
    'formBuilderHeader': 'Formulargestalter',
    'livePreviewHeader': 'Echtzeitvorschau',
    'propertiesHeader': 'Eigenschaften',
    
    // Additional UI
    'rule': 'Regel',
    'rules': 'Regeln',
    
    // Field types for palette
    'fieldType_text': 'Text',
    'fieldType_email': 'Email',
    'fieldType_number': 'Zahl',
    'fieldType_textarea': 'Textbereich',
    'fieldType_select': 'Auswahl',
    'fieldType_multiselect': 'Mehrfachauswahl',
    'fieldType_radio': 'Radio',
    'fieldType_checkbox': 'Kontrollkästchen',
    'fieldType_date': 'Datum',
    'fieldType_file': 'Datei',
    'fieldType_switch': 'Umschalter',
    'fieldType_section': 'Abschnitt',
    
    // Categories
    'categoryBasic': 'Grundlegend',
    'categorySelection': 'Auswahl',
    'categorySpecialized': 'Spezialisiert',
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
    
    // Console messages
    'consoleInitialized': 'FormBuilder Initialized',
    'consoleUseBuilder': 'Use window.formBuilder to interact with the builder',
    'consoleGetSchema': 'getSchema() - Get current form schema',
    'consoleSetSchema': 'setSchema(schema) - Set form schema',
    'consoleGetFormData': 'getFormData() - Get form data',
    'consoleValidateForm': 'validateForm() - Validate form',
    'consoleSupportedLanguages': 'Supported languages: de, en, es, fr',
    'consoleSwitchLanguage': 'Switch languages using the dropdown in the toolbar',
    
    // UI Section Headers
    'fieldTypesHeader': 'Field Types',
    'formBuilderHeader': 'Form Builder',
    'livePreviewHeader': 'Live Preview',
    'propertiesHeader': 'Properties',
    
    // Additional UI
    'rule': 'Rule',
    'rules': 'Rules',
    
    // Field types for palette
    'fieldType_text': 'Text',
    'fieldType_email': 'Email',
    'fieldType_number': 'Number',
    'fieldType_textarea': 'Textarea',
    'fieldType_select': 'Select',
    'fieldType_multiselect': 'Multi-Select',
    'fieldType_radio': 'Radio',
    'fieldType_checkbox': 'Checkbox',
    'fieldType_date': 'Date',
    'fieldType_file': 'File',
    'fieldType_switch': 'Switch',
    'fieldType_section': 'Section',
    
    // Categories
    'categoryBasic': 'Basic',
    'categorySelection': 'Selection',
    'categorySpecialized': 'Specialized',
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
    
    // Console messages
    'consoleInitialized': 'FormBuilder Inicializado',
    'consoleUseBuilder': 'Usa window.formBuilder para interactuar con el constructor',
    'consoleGetSchema': 'getSchema() - Obtener esquema de formulario actual',
    'consoleSetSchema': 'setSchema(schema) - Establecer esquema de formulario',
    'consoleGetFormData': 'getFormData() - Obtener datos del formulario',
    'consoleValidateForm': 'validateForm() - Validar formulario',
    'consoleSupportedLanguages': 'Idiomas soportados: de, en, es, fr',
    'consoleSwitchLanguage': 'Cambiar idiomas usando el menú desplegable en la barra de herramientas',
    
    // UI Section Headers
    'fieldTypesHeader': 'Tipos de Campo',
    'formBuilderHeader': 'Constructor de Formularios',
    'livePreviewHeader': 'Vista Previa en Vivo',
    'propertiesHeader': 'Propiedades',
    
    // Additional UI
    'rule': 'Regla',
    'rules': 'Reglas',
    
    // Field types for palette
    'fieldType_text': 'Texto',
    'fieldType_email': 'Correo Electrónico',
    'fieldType_number': 'Número',
    'fieldType_textarea': 'Área de Texto',
    'fieldType_select': 'Seleccionar',
    'fieldType_multiselect': 'Multi-Seleccionar',
    'fieldType_radio': 'Radio',
    'fieldType_checkbox': 'Casilla de Verificación',
    'fieldType_date': 'Fecha',
    'fieldType_file': 'Archivo',
    'fieldType_switch': 'Interruptor',
    'fieldType_section': 'Sección',
    
    // Categories
    'categoryBasic': 'Básico',
    'categorySelection': 'Selección',
    'categorySpecialized': 'Especializado',
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
    
    // Console messages
    'consoleInitialized': 'FormBuilder Initialisé',
    'consoleUseBuilder': 'Utilisez window.formBuilder pour interagir avec le générateur',
    'consoleGetSchema': 'getSchema() - Obtenir le schéma de formulaire actuel',
    'consoleSetSchema': 'setSchema(schema) - Définir le schéma de formulaire',
    'consoleGetFormData': 'getFormData() - Obtenir les données du formulaire',
    'consoleValidateForm': 'validateForm() - Valider le formulaire',
    'consoleSupportedLanguages': 'Langues supportées: de, en, es, fr',
    'consoleSwitchLanguage': 'Changer de langue en utilisant le menu déroulant dans la barre d\'outils',
    
    // UI Section Headers
    'fieldTypesHeader': 'Types de Champ',
    'formBuilderHeader': 'Générateur de Formulaires',
    'livePreviewHeader': 'Aperçu en Temps Réel',
    'propertiesHeader': 'Propriétés',
    
    // Additional UI
    'rule': 'Règle',
    'rules': 'Règles',
    
    // Field types for palette
    'fieldType_text': 'Texte',
    'fieldType_email': 'Email',
    'fieldType_number': 'Nombre',
    'fieldType_textarea': 'Zone de Texte',
    'fieldType_select': 'Sélection',
    'fieldType_multiselect': 'Multi-Sélection',
    'fieldType_radio': 'Bouton Radio',
    'fieldType_checkbox': 'Case à Cocher',
    'fieldType_date': 'Date',
    'fieldType_file': 'Fichier',
    'fieldType_switch': 'Commutateur',
    'fieldType_section': 'Section',
    
    // Categories
    'categoryBasic': 'Basique',
    'categorySelection': 'Sélection',
    'categorySpecialized': 'Spécialisé',
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
