# FormBuilder Quick Start Guide

Starte in 5 Minuten!

## 🚀 Installation & Start

### Option 1: Direkt im Browser (Lokal)

```bash
# 1. Python HTTP-Server starten
cd formbuilder-cms
python -m http.server 8000

# 2. Browser öffnen
# http://localhost:8000
```

### Option 2: In Dein Projekt integrieren

```bash
# Kopiere den src/ Ordner in Dein Projekt
cp -r formbuilder-cms/src ./src
cp formbuilder-cms/styles.css ./styles.css
```

---

## 📝 Minimales Beispiel

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
  <style>
    .app-container {
      display: grid;
      grid-template-columns: 250px 1fr 350px 400px;
      height: 100vh;
      gap: 1px;
    }
  </style>
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

    // Initialisiere den Builder
    const builder = new FormBuilder({
      builderContainerId: 'builder',
      previewContainerId: 'preview',
      paletteContainerId: 'palette',
      canvasContainerId: 'canvas',
      propertiesContainerId: 'properties',
    });

    builder.init();

    // Exponiere zur Debugging in Console
    window.formBuilder = builder;
  </script>
</body>
</html>
```

---

## 🎮 Erste Schritte im Builder

### 1️⃣ Feld hinzufügen

```
Linke Seite (Palette) → Wähle "Text"
                     → Ziehe auf Canvas (Mitte)
```

### 2️⃣ Feld konfigurieren

```
Klicke auf das Feld im Canvas → "✎" (Edit)
Rechts (Properties) → Bearbeite:
  - Label: "First Name"
  - Placeholder: "Enter your name"
  - Required: ☑️
  - Validation: + Add Rule → "required"
```

### 3️⃣ Vorschau (Live)

```
Rechte Seite → Das Formular wird LIVE aktualisiert
Fang an zu tippen → Validation funktioniert sofort!
```

### 4️⃣ Schema exportieren

```
Toolbar → "📥 Export Schema"
→ Datei wird heruntergeladen als JSON
```

### 5️⃣ Schema später laden

```
Toolbar → "📤 Import Schema"
→ Wähle die JSON-Datei
→ Formular wird geladen!
```

---

## 💻 Programmatisches Verwenden

### Schema aus Code erstellen

```javascript
import { FormBuilder } from './src/builder/FormBuilder.js';

const builder = new FormBuilder();
builder.init();

const schema = {
  meta: { name: 'My Form', version: '1.0.0' },
  fields: [
    {
      id: 'field_email',
      type: 'email',
      model: 'email',
      label: 'Email',
      required: true,
      validation: [
        { rule: 'required', message: 'Required' },
        { rule: 'email', message: 'Invalid email' }
      ]
    },
    {
      id: 'field_message',
      type: 'textarea',
      model: 'message',
      label: 'Message',
      placeholder: 'Your message...'
    }
  ]
};

// Setze das Schema
builder.setSchema(schema);
```

### Formulardaten auslesen

```javascript
// Nach Form Submission
const data = builder.getFormData();
console.log(data);  // { email: 'user@example.com', message: 'Hello' }

// Oder mit Validation
const validation = builder.validateForm();
if (validation.isValid) {
  // Formular ist gültig
  console.log('OK!', builder.getFormData());
} else {
  // Errors anzeigen
  console.log('Errors:', validation.errors);
}
```

### Events abonnieren

```javascript
const { eventBus } = builder;

// Wenn Formulardaten sich ändern
eventBus.on('field:valueChanged', (data) => {
  console.log(`Field ${data.fieldId} changed to:`, data.value);
});

// Wenn Regeln neu evaluiert werden
eventBus.on('rules:evaluated', (results) => {
  results.forEach((fieldState, fieldId) => {
    console.log(`${fieldId}:`, fieldState);
  });
});

// Wenn Form validiert wird
eventBus.on('validation:error', (error) => {
  console.log('Validation error:', error);
});

eventBus.on('form:submitted', (data) => {
  console.log('Form submitted:', data);
});
```

---

## 🔗 Abhängigkeiten & Bedingte Logik

### Einfache Sichtbarkeit

```javascript
// Ein Feld nur zeigen wenn ein anderes den Wert "DE" hat
{
  id: 'field_taxid',
  type: 'text',
  model: 'taxId',
  label: 'Tax ID',
  visibility: {
    dependsOn: 'country',  // ID des abhängigen Feldes
    operator: 'equals',
    value: 'DE'
  }
}
```

### Komplexe Logik

```javascript
{
  id: 'field_newsletter',
  type: 'switch',
  model: 'newsletter',
  label: 'Subscribe to newsletter',
  logic: [
    {
      // Wenn Alter < 18
      if: { field: 'age', operator: '<', value: 18 },
      then: [
        { action: 'disable' },  // Deaktivieren
        { action: 'setValue', value: false }  // Auf false setzen
      ]
    }
  ]
}
```

### Verfügbare Operatoren

```javascript
equals          // Gleich
notEquals       // Ungleich
<, >, <=, >=   // Numerische Vergleiche
includes        // String enthält
in              // In Array
notIn           // Nicht in Array
exists          // Wert existiert
empty           // Wert ist leer
```

### Verfügbare Aktionen

```javascript
show            // Feld anzeigen
hide            // Feld verbergen
enable          // Feld aktivieren
disable         // Feld deaktivieren
setValue        // Wert setzen { action: 'setValue', value: 'default' }
setRequired     // Pflichtfeld { action: 'setRequired', value: true }
setOptions      // Optionen ändern { action: 'setOptions', options: [...] }
```

---

## ✅ Validierung

### Built-in Validierungsregeln

```javascript
validation: [
  { rule: 'required', message: 'Pflichtfeld' },
  { rule: 'email', message: 'Ungültige Email' },
  { rule: 'minLength', value: 3, message: 'Min. 3 Zeichen' },
  { rule: 'maxLength', value: 50, message: 'Max. 50 Zeichen' },
  { rule: 'min', value: 18, message: 'Min. 18' },
  { rule: 'max', value: 100, message: 'Max. 100' },
  { rule: 'pattern', value: '^[a-z]+$', message: 'Nur Kleinbuchstaben' }
]
```

### Custom Validator

```javascript
const { validationEngine } = builder;

// Registriere custom Validator
validationEngine.registerValidator('username', (value) => {
  if (!/^[a-z0-9_]{3,}$/.test(value)) {
    return 'Mindestens 3 Zeichen, nur a-z, 0-9, _';
  }
  return true;  // ← true = valid
});

// Im Schema:
{
  id: 'field_username',
  type: 'text',
  model: 'username',
  label: 'Username',
  validation: [
    { rule: 'custom', validator: 'username' }
  ]
}
```

---

## 🎨 Design Anpassen

Alle CSS-Variablen ändern (in `styles.css`):

```css
:root {
  --primary-color: #2563eb;      /* Button, Links */
  --error-color: #ef4444;         /* Fehler, Delete */
  --success-color: #10b981;       /* Success */
  --border-color: #e5e7eb;        /* Borders, Dividers */
  --bg-light: #f9fafb;            /* Light backgrounds */
  --bg-white: #ffffff;            /* White */
  --text-dark: #1f2937;           /* Dark text */
  --text-light: #6b7280;          /* Light text */
}
```

Oder CSS überschreiben:

```html
<style>
  :root {
    --primary-color: #ff0000;  /* Rot statt Blau */
  }
  
  .form-submit-btn {
    border-radius: 20px;  /* Rundere Buttons */
  }
</style>
```

---

## 💾 Daten speichern & laden

### LocalStorage

```javascript
// Speichern
const schema = builder.getSchema();
localStorage.setItem('myForm', JSON.stringify(schema));

// Laden
const json = localStorage.getItem('myForm');
if (json) {
  const schema = JSON.parse(json);
  builder.setSchema(schema);
}
```

### Datei-System

```javascript
// Export (Button im UI)
builder.exportSchema();  // Download JSON

// Import (Button im UI)
builder.importSchema();  // File picker
```

### Server (Beispiel)

```javascript
// Speichern
const schema = builder.getSchema();
fetch('/api/forms/my-form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(schema)
});

// Laden
const response = await fetch('/api/forms/my-form');
const schema = await response.json();
builder.setSchema(schema);
```

---

## 🧪 Fehlerbehandlung

### Schema validieren

```javascript
import { SchemaEngine } from './src/schema/SchemaEngine.js';

const validation = SchemaEngine.validateSchema(schema);
if (!validation.valid) {
  console.error('Schema-Fehler:', validation.errors);
  // → ['Field abc missing id', 'Field def missing type', ...]
}
```

### Zirkuläre Abhängigkeiten erkennen

```javascript
const cycles = SchemaEngine.detectCircularDependencies(schema);
if (cycles.length > 0) {
  console.warn('Zirkuläre Abhängigkeiten:', cycles);
}
```

### Formular validieren

```javascript
const result = builder.validateForm();
if (!result.isValid) {
  result.errors.forEach((fieldId, errors) => {
    console.log(`Field ${fieldId} has errors:`, errors);
  });
}
```

---

## 🔥 Häufig benötigte Snippets

### Form mit 3 Feldern erstellen

```javascript
const schema = {
  meta: { name: 'Contact Form', version: '1.0.0' },
  fields: [
    {
      id: 'name',
      type: 'text',
      model: 'name',
      label: 'Name',
      required: true,
      validation: [{ rule: 'required' }]
    },
    {
      id: 'email',
      type: 'email',
      model: 'email',
      label: 'Email',
      required: true,
      validation: [
        { rule: 'required' },
        { rule: 'email' }
      ]
    },
    {
      id: 'message',
      type: 'textarea',
      model: 'message',
      label: 'Message',
      placeholder: 'Your message...',
      required: true
    }
  ]
};

builder.setSchema(schema);
```

### Conditional Field (Select → TextInput)

```javascript
{
  id: 'userType',
  type: 'select',
  model: 'userType',
  label: 'User Type',
  options: [
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' }
  ]
},
{
  id: 'company',
  type: 'text',
  model: 'companyName',
  label: 'Company Name',
  // Nur zeigen wenn "company" ausgewählt
  visibility: {
    dependsOn: 'userType',
    operator: 'equals',
    value: 'company'
  }
}
```

### Email mit Custom Message

```javascript
{
  id: 'email',
  type: 'email',
  model: 'email',
  label: 'Email Address',
  required: true,
  validation: [
    { rule: 'required', message: '📧 Email erforderlich!' },
    { rule: 'email', message: '❌ Ungültige Email-Adresse' }
  ]
}
```

### Dropdown mit Abhängigkeit

```javascript
{
  id: 'country',
  type: 'select',
  model: 'country',
  label: 'Country',
  options: [
    { value: 'DE', label: 'Germany' },
    { value: 'AT', label: 'Austria' },
    { value: 'CH', label: 'Switzerland' }
  ]
},
{
  id: 'city',
  type: 'text',
  model: 'city',
  label: 'City',
  // Sichtbar wenn Land ausgewählt
  visibility: {
    dependsOn: 'country',
    operator: 'notEquals',
    value: ''
  }
}
```

---

## 🐛 Debugging

### Console-Logging aktivieren

```javascript
// Alle Schema-Änderungen loggen
builder.eventBus.on('schema:changed', (schema) => {
  console.log('Schema aktualisiert:', schema);
});

// Alle Feldwert-Änderungen
builder.eventBus.on('field:valueChanged', (data) => {
  console.log(`${data.fieldId} = ${data.value}`);
});

// Alle Rule-Evaluationen
builder.eventBus.on('rules:evaluated', (results) => {
  console.table(Array.from(results));
});
```

### State inspizieren

```javascript
// Aktuelles Schema
console.log('Schema:', builder.getSchema());

// Aktuelles FormData
console.log('Data:', builder.getFormData());

// UI State
console.log('UI State:', builder.stateManager.getUIState());
```

### Alle Module testen

```javascript
import { FormBuilder, SchemaEngine, RuleEngine } from './src/index.js';

// Test Schema
const schema = SchemaEngine.createField('text');
console.log('Created field:', schema);

// Test Validation
const validation = SchemaEngine.validateSchema(mySchema);
console.log('Valid?', validation.valid);

// Test Dependencies
const deps = SchemaEngine.getDependencies(mySchema);
console.log('Field dependencies:', deps);
```

---

## 📚 Weitere Ressourcen

- [README.md](README.md) - Vollständige Dokumentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technische Architektur
- [examples/sample-schema.json](examples/sample-schema.json) - Komplexes Beispiel
- [src/index.js](src/index.js) - Alle exportierten Module

---

**Du bist bereit! Viel Spaß mit dem Formbuilder! 🚀**
