# FormBuilder - Professionelles Visual Form Builder System

Ein vollwertiger, Framework-unabhängiger Formbuilder in reinem JavaScript (ES6+) mit Drag-&-Drop-Editor, Schema-Engine, Rule Engine, Live-Preview und **Internationalisierung** (Deutsch, Englisch, Spanisch, Französisch).

## 🎯 Überblick

Dieser Formbuilder ist ein **produktionsreifer, modularer System** bestehend aus:

- **Builder UI** - Visueller Editor mit Drag-&-Drop
- **Renderer** - Laufzeitrenderer für Formulare
- **Rule Engine** - Bedingte Logik und Abhängigkeiten
- **Validation Engine** - Feldvalidierung
- **State Manager** - Zentraler State
- **Schema Engine** - JSON-Schema als Single Source of Truth
- **i18n System** - Mehrsprachige Benutzeroberfläche (DE/EN/ES/FR)
- **Section Editing** - Bearbeitbare Abschnitte mit Eigenschaften und Logik

## 📁 Projektstruktur

```
formbuilder-cms/
├── src/
│   ├── core/                    # Kernmodule
│   │   ├── EventBus.js         # Dezentralisiertes Event-System
│   │   ├── StateManager.js     # Zentraler State Management
│   │   └── History.js          # Undo/Redo Stack
│   │
│   ├── schema/                 # Schema-Verwaltung
│   │   └── SchemaEngine.js     # Schema-Operationen
│   │
│   ├── engine/                 # Business Logic
│   │   ├── RuleEngine.js       # Bedingte Logik & Abhängigkeiten
│   │   └── ValidationEngine.js # Feldvalidierung
│   │
│   ├── builder/                # Editor-Interface
│   │   ├── FormBuilder.js      # Hauptkomponente
│   │   ├── FieldPalette.js     # Feldtypauswahl
│   │   ├── Canvas.js           # Drag-&-Drop Fläche
│   │   └── PropertyEditor.js   # Eigenschafteneditor
│   │
│   ├── renderer/               # Laufzeit-Renderer
│   │   ├── FormRenderer.js     # Form-Renderer
│   │   └── FieldRenderer.js    # Feld-Renderer
│   │
│   ├── utils/                  # Hilfsfunktionen
│   │   ├── UUID.js            # ID-Generator
│   │   ├── Constants.js        # Konstanten & Enums
│   │   └── i18n.js            # Internationalisierung (Übersetzungen)
│   │
│   └── index.js               # Export aller Module
│
├── index.html                  # Demo-Seite
├── styles.css                  # Vollständige CSS-Styles
├── README.md                   # Dokumentation
├── CHANGELOG_i18n.md          # i18n & Section Editing Dokumentation
└── examples/
    └── sample-schema.json      # Beispiel-Schema
```

## 🚀 Quick Start

### 1. Dateien auf Webserver hochladen

Einfach alle Dateien auf deinen Webserver (Apache, Nginx, etc.) hochladen und `index.html` öffnen.

Oder öffne `index.html` direkt im Browser für eine lokale Demo.

### 2. Im Code verwenden

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="app-container">
    <div class="palette-section"><div id="palette"></div></div>
    <div class="canvas-section"><div id="builder"><div id="canvas"></div></div></div>
    <div class="properties-section"><div id="properties"></div></div>
    <div class="preview-section"><div id="preview"></div></div>
  </div>

  <script type="module">
    import { FormBuilder } from './src/builder/FormBuilder.js';

    // Sprache kann auf 'de', 'en', 'es', 'fr' gesetzt werden
    const builder = new FormBuilder({
      builderContainerId: 'builder',
      previewContainerId: 'preview',
      paletteContainerId: 'palette',
      canvasContainerId: 'canvas',
      propertiesContainerId: 'properties',
      language: 'de', // Deutsch, Englisch, Spanisch, Französisch
    });

    builder.init();
  </script>
</body>
</html>
```

## 📋 Schema-Format

Das Schema ist die **Single Source of Truth**:

```javascript
{
  meta: {
    name: "My Form",
    version: "1.0.0",
    description: "Form description"
  },
  fields: [
    {
      id: "field_uuid",              // Eindeutige ID
      type: "text",                  // Feldtyp (siehe Feldtypen)
      model: "firstName",            // Datenmodell-Key
      label: "First Name",           // Anzeigename
      placeholder: "Enter name",     // Placeholder
      default: "",                   // Default-Wert
      required: true,                // Pflichtfeld
      disabled: false,               // Deaktiviert
      helpText: "Optional help",     // Hilfetext
      className: "custom-class",     // CSS-Klasse
      
      // Validierung
      validation: [
        { rule: "required", message: "Required" },
        { rule: "minLength", value: 2, message: "Min 2 chars" },
        { rule: "email" }
      ],
      
      // Sichtbarkeit (optional)
      visibility: {
        dependsOn: "country",
        operator: "equals",
        value: "DE"
      },
      
      // Logik/Regeln (optional)
      logic: [
        {
          if: { field: "age", operator: "<", value: 18 },
          then: [
            { action: "disable" },
            { action: "setValue", value: "" }
          ]
        }
      ],
      
      // Optionen (nur für Select/Radio/MultiSelect)
      options: [
        { value: "de", label: "Deutsch" },
        { value: "en", label: "English" }
      ]
    }
  ]
}
```

## 🧩 Feldtypen

| Typ | Beschreibung | Eigenschaften |
|-----|-------------|--------------|
| `text` | Textfeld | placeholder, maxLength |
| `email` | Email-Feld | placeholder |
| `number` | Numerisches Feld | min, max |
| `textarea` | Mehrzeiliger Text | placeholder, rows |
| `select` | Dropdown-Auswahl | options |
| `multiselect` | Multi-Auswahl | options |
| `checkbox` | Kontrollkästchen | - |
| `radio` | Radiobutton-Gruppe | options |
| `switch` | Toggle-Schalter | - |
| `date` | Datumsfeld | - |
| `file` | Datei-Upload | - |
| `section` | Feldgruppe | fields (nested) |

## ✅ Validierungsregeln

```javascript
validation: [
  { rule: "required", message: "Erforderlich" },
  { rule: "email", message: "Ungültige Email" },
  { rule: "minLength", value: 3, message: "Min. 3 Zeichen" },
  { rule: "maxLength", value: 50, message: "Max. 50 Zeichen" },
  { rule: "min", value: 18, message: "Min. 18" },
  { rule: "max", value: 100, message: "Max. 100" },
  { rule: "pattern", value: "^[A-Z].*", message: "Mit Großbuchstabe" },
  { rule: "custom", validator: fn, message: "Ungültig" }
]
```

## 🔁 Bedingte Logik (Rule Engine)

### Visibility (Sichtbarkeit)

```javascript
field: {
  ...
  visibility: {
    dependsOn: "country",      // Abhängig von Feld-ID
    operator: "equals",        // equals, notEquals, <, >, <=, >=, includes, exists, empty, in, notIn
    value: "DE"               // Vergleichswert
  }
}
```

### Logic Rules (Komplexe Logik)

```javascript
field: {
  ...
  logic: [
    {
      if: { 
        field: "age", 
        operator: "<", 
        value: 18 
      },
      then: [
        { action: "disable" },                    // Feld deaktivieren
        { action: "hide" },                       // Feld verbergen
        { action: "show" },                       // Feld anzeigen
        { action: "enable" },                     // Feld aktivieren
        { action: "setValue", value: "" },        // Wert setzen
        { action: "setRequired", value: true },   // Erforderlich machen
        { action: "setOptions", options: [...] }  // Optionen setzen
      ]
    }
  ]
}
```

### Operatoren

```
equals        // Gleich
notEquals     // Ungleich
<             // Kleiner als
>             // Größer als
<=            // Kleiner oder gleich
>=            // Größer oder gleich
includes      // Enthält (Array oder String)
in            // In Array enthalten
notIn         // Nicht in Array enthalten
exists        // Wert existiert
empty         // Wert ist leer
```

## 🎮 API-Referenz

### FormBuilder

```javascript
const builder = new FormBuilder(config);

// Initialisierung
builder.init();

// Schema-Verwaltung
builder.getSchema();           // Aktuelles Schema abrufen
builder.setSchema(schema);     // Schema setzen
builder.exportSchema();        // Als JSON exportieren
builder.importSchema();        // Von JSON importieren

// Undo/Redo
builder.undo();
builder.redo();

// Formular-Daten
builder.getFormData();         // Formulardaten abrufen
builder.validateForm();        // Validieren
```

### StateManager

```javascript
const state = new StateManager();

// Schema
state.getSchema();
state.setSchema(schema);
state.updateField(fieldId, updates);
state.addField(field);
state.removeField(fieldId);
state.getField(fieldId);

// Formulardaten
state.getFormData();
state.setFormData(data);
state.setFieldValue(fieldId, value);
state.getFieldValue(fieldId);

// UI-State
state.updateUIState(updates);
state.getUIState();

// Subscriptions
state.subscribe('schema', callback);   // Bei Schema-Änderung
state.subscribe('formData', callback); // Bei Daten-Änderung
state.subscribe('uiState', callback);  // Bei UI-Änderung
```

### RuleEngine

```javascript
const ruleEngine = new RuleEngine(schema, stateManager, eventBus);

// Regel-Evaluation
ruleEngine.evaluateAll(formData);       // Alle Regeln evaluieren
ruleEngine.evaluateField(fieldId, formData); // Einzelnes Feld + Abhängigkeiten
ruleEngine.getFieldState(fieldId, formData);  // Feld-State abrufen
```

### ValidationEngine

```javascript
const validation = new ValidationEngine(schema, stateManager);

// Validierung
validation.validateForm(formData);      // Gesamtes Formular
validation.validateField(fieldId, value); // Einzelnes Feld
validation.registerValidator(name, fn); // Custom Validator registrieren
```

### FormRenderer

```javascript
const renderer = new FormRenderer(
  containerId, 
  schema, 
  stateManager, 
  ruleEngine, 
  validationEngine, 
  eventBus
);

renderer.render();              // Formular rendern
renderer.setFormData(data);     // Daten setzen
renderer.getFormData();         // Daten abrufen
renderer.validate();            // Validieren
renderer.reset();               // Zurücksetzen
renderer.updateSchema(schema);  // Schema aktualisieren
```

## 📡 Events

Das EventBus-System ermöglicht dezentralisierte Kommunikation:

```javascript
// Events emittieren
eventBus.emit('field:valueChanged', { fieldId, value });

// Events abonnieren
eventBus.on('field:valueChanged', (data) => {
  console.log('Field changed:', data);
});

// Einmalig abonnieren
eventBus.once('form:submitted', (data) => {
  console.log('Form submitted:', data);
});

// Abmelden
const unsubscribe = eventBus.on('event', callback);
unsubscribe();

// Alle Listeners entfernen
eventBus.off('eventName');
eventBus.clear(); // Alle
```

### Verfügbare Events

```
// Schema-Events
schema:changed
field:added
field:removed
field:updated

// Form-Events
form:dataChanged
field:valueChanged
field:touched
validation:error
validation:success

// UI-Events
ui:fieldSelected
ui:fieldUnselected
ui:previewToggled

// Rule-Events
rules:evaluated

// Custom Events
form:submitted
```

## 🔐 Sicherheit & Best Practices

### 1. Keine globalen Variablen
Alle Module sind gekapselt mit ES6 Module System.

### 2. State ist immutable
StateManager verwendet Kopien, keine direkten Mutationen.

### 3. Dependency Cycle Detection
RuleEngine erkennt zirkuläre Abhängigkeiten:

```javascript
SchemaEngine.detectCircularDependencies(schema);
// Gibt Array der problematischen Field-IDs zurück
```

### 4. Schema Validation
```javascript
const validation = SchemaEngine.validateSchema(schema);
console.log(validation.valid);   // true/false
console.log(validation.errors);  // Array von Errors
```

## 🎨 Styling Anpassen

Alle CSS-Variablen sind anpassbar:

```css
:root {
  --primary-color: #2563eb;
  --error-color: #ef4444;
  --success-color: #10b981;
  --bg-white: #ffffff;
  --text-dark: #1f2937;
  /* etc. */
}
```

## 💾 Persistierung

Schema & Daten speichern:

```javascript
// JSON exportieren
const json = JSON.stringify(builder.getSchema());
localStorage.setItem('myForm', json);

// JSON laden
const json = localStorage.getItem('myForm');
const schema = JSON.parse(json);
builder.setSchema(schema);

// oder Export-Button im UI nutzen
builder.exportSchema();
builder.importSchema();
```

## 🔧 Erweiterung

### Custom Validator

```javascript
validationEngine.registerValidator('username', (value) => {
  if (!/^[a-z0-9_]{3,}$/.test(value)) {
    return 'Username must be 3+ chars, lowercase/numbers/_';
  }
  return true;
});

// Im Schema:
validation: [
  { rule: 'custom', validator: 'username' }
]
```

### Custom Field Type (Zukünftig)

```javascript
// Im FieldRenderer._renderInput():
case 'customType':
  return this._renderCustomField();

_renderCustomField() {
  // Custom rendering
}
```

## 📊 Beispiel: Abhängiges Formular

```javascript
const schema = {
  meta: { name: "Conditional Form", version: "1.0.0" },
  fields: [
    {
      id: "country",
      type: "select",
      model: "country",
      label: "Country",
      options: [
        { value: "DE", label: "Germany" },
        { value: "AT", label: "Austria" }
      ]
    },
    {
      id: "taxId",
      type: "text",
      model: "taxId",
      label: "Tax ID",
      // Nur sichtbar wenn DE ausgewählt
      visibility: {
        dependsOn: "country",
        operator: "equals",
        value: "DE"
      }
    },
    {
      id: "company",
      type: "text",
      model: "company",
      label: "Company",
      // Logic: Erforderlich machen wenn DE + Tax ID nicht leer
      logic: [
        {
          if: { field: "country", operator: "equals", value: "DE" },
          then: [{ action: "setRequired", value: true }]
        }
      ]
    }
  ]
};

builder.setSchema(schema);
```

## 🧪 Testing

```javascript
// Validation testen
const validation = builder.validateForm();
console.log(validation.isValid);  // true/false
console.log(validation.errors);   // { fieldId: [...] }

// Rule Engine testen
const ruleResults = builder.ruleEngine.evaluateAll(formData);
ruleResults.forEach((state, fieldId) => {
  console.log(fieldId, {
    visible: state.visible,
    enabled: state.enabled,
    required: state.required
  });
});

// Schema testen
const validation = SchemaEngine.validateSchema(schema);
const deps = SchemaEngine.getDependencies(schema);
const cycles = SchemaEngine.detectCircularDependencies(schema);
```

## 📈 Performance-Tipps

1. **Validierung cachen** - Nur bei Änderungen evaluieren
2. **Große Formularе** - Virtuelle Listen für 100+ Felder
3. **Rule Evaluation** - Nur abhängige Felder re-evaluieren (bereits implementiert)
4. **Rendering** - FormRenderer batched DOM-Updates

## 🐛 Debugging

```javascript
// Console-Access
window.formBuilder

// Logging aktivieren
builder.eventBus.on('schema:changed', (schema) => {
  console.log('Schema updated:', schema);
});

// State überwachen
builder.stateManager.subscribe('formData', (data) => {
  console.log('Form data changed:', data);
});

// Rule Evaluation debuggen
builder.eventBus.on('rules:evaluated', (results) => {
  results.forEach((state, fieldId) => {
    console.log(`${fieldId}:`, state);
  });
});
```

## 📝 Lizenz & Support

Vollständig eigenentwickelt als produktionsreifen Code.

## 🎓 Weitere Ressourcen

- [examples/sample-schema.json](examples/sample-schema.json) - Komplexes Beispiel-Schema
- Alle Module sind vollständig dokumentiert mit JSDoc-Kommentaren
- Keine Abhängigkeiten, kein Framework - reines JavaScript

---

**FormBuilder ist produktionsreif und kann direkt in bestehenden Projekten eingebunden werden!**
