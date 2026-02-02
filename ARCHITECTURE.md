# FormBuilder Architektur

## 🏗️ Systemdesign

Das FormBuilder-System folgt einer **modularen, layered Architektur** mit strikter Separation of Concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                              │
│  FormBuilder (Builder) │ FormRenderer (Preview)                   │
└──────────────┬─────────────────────┬──────────────────────────────┘
               │                     │
┌──────────────┴──────┐  ┌──────────┴─────────────────────────────┐
│   BUILDER COMPONENTS │  │  RUNTIME COMPONENTS                   │
├─────────────────────┤  ├──────────────────────────────────────┤
│ · FieldPalette      │  │ · FormRenderer                       │
│ · Canvas            │  │ · FieldRenderer                      │
│ · PropertyEditor    │  │                                      │
└──────────┬──────────┘  └──────────┬──────────────────────────┘
           │                       │
           └───────────┬───────────┘
                       │
          ┌────────────┴────────────┐
          │   EVENT BUS (Pub/Sub)   │
          └────────────┬────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌───▼────┐   ┌────▼────┐
   │ STATE   │    │ SCHEMA │   │  ENGINES │
   │ MANAGER │    │ ENGINE │   │          │
   └────┬────┘    └───┬────┘   └────┬────┘
        │             │            │
   ┌────▼──────────┐  │  ┌────────────┴────────┐
   │ FormData      │  │  │ · RuleEngine       │
   │ UIState       │  │  │ · ValidationEngine │
   │ Subscriptions │  │  │ · Dependency Mgmt  │
   └───────────────┘  │  └────────────────────┘
                      │
            ┌─────────▼──────────┐
            │   SCHEMA (JSON)    │
            │  Single Source of  │
            │     Truth          │
            └────────────────────┘
```

## 🔄 Datenfluss

### 1. **Builder → Schema**

```
User Action (Drag/Edit)
         ↓
  FieldPalette / Canvas / PropertyEditor
         ↓
  FormBuilder (Handler)
         ↓
  StateManager.updateField() / addField()
         ↓
  State Subscribers notified
         ↓
  Canvas.render() (UI Update)
  History.push() (Undo Stack)
         ↓
  EventBus.emit('schema:changed')
         ↓
  RuleEngine.updateSchema()
  ValidationEngine updated
  FormRenderer.updateSchema() (Preview Update)
```

### 2. **Form Input → Validation → Rules**

```
User Input (Text/Select/etc.)
         ↓
  FieldRenderer Event Handler
         ↓
  formData[model] = value
         ↓
  StateManager.setFieldValue()
  StateManager.setFieldTouched()
         ↓
  EventBus.emit('field:valueChanged')
         ↓
  ValidationEngine.validateField()
         ↓
  RuleEngine.evaluateField()  ← Cascading evaluation
         ↓
  DOM Updates (show/hide/disable/errors)
```

### 3. **Schema Persistence**

```
Build Form in UI
         ↓
  builder.exportSchema()
         ↓
  SchemaEngine.exportSchema() (JSON)
         ↓
  Download / Save to Storage
         
         ↓ (Later)
         
  Load from Storage
         ↓
  builder.importSchema()
         ↓
  SchemaEngine.importSchema() (Parse + Validate)
         ↓
  StateManager.setSchema()
         ↓
  Builder UI & Preview Updated
```

## 📦 Module-Übersicht

### **Core Layer** (`src/core/`)

#### EventBus
- **Zweck**: Entkoppelte Event-Kommunikation
- **Methoden**: 
  - `on(eventName, callback)` - Abonnieren
  - `once(eventName, callback)` - Einmalig
  - `emit(eventName, data)` - Event auslösen
  - `off(eventName)` - Abmelden
- **Pattern**: Observer / Pub-Sub
- **Warum**: Ermöglicht Module, ohne sich zu kennen, miteinander zu kommunizieren

```javascript
// Beispiel:
eventBus.on('field:valueChanged', (data) => {
  ruleEngine.evaluateField(data.fieldId, formData);
});

eventBus.emit('field:valueChanged', { fieldId, value });
```

#### StateManager
- **Zweck**: Zentraler State für Schema, FormData, UIState
- **Struktur**:
  ```
  state = {
    schema: { meta, fields },
    formData: { field1: value1, ... },
    uiState: { selectedFieldId, isDirty, errors, touched }
  }
  ```
- **Subscriptions**: Alle Änderungen triggern Subscriber
- **Pattern**: Centralized State Store (Redux-ähnlich)
- **Immutability**: Alle Rückgaben sind Kopien

```javascript
// Beispiel:
state.updateField(fieldId, { label: 'New Label' });
state.subscribe('schema', (newSchema) => {
  canvas.render();
});
```

#### History
- **Zweck**: Undo/Redo-Funktionalität
- **Struktur**: Drei Stacks (past, present, future)
- **Limit**: 50 Zustände (konfigurierbar)
- **Pattern**: Memento Pattern

```javascript
history.push(state);  // Zustand speichern
history.undo();       // Zurück
history.redo();       // Vorwärts
```

---

### **Schema Layer** (`src/schema/`)

#### SchemaEngine
- **Zweck**: Schema-Operationen und Validierung
- **Funktionen**:
  - Schema-Template-Erstellung
  - Feld-Suche (rekursiv)
  - Feld-Klone
  - Abhängigkeitsgraph
  - Zirkuläre Abhängigkeiten erkennen
  - Import/Export (JSON)

```javascript
// Beispiel:
const newField = SchemaEngine.createField('text');
const allDeps = SchemaEngine.getDependencies(schema);
const cycles = SchemaEngine.detectCircularDependencies(schema);
```

---

### **Engine Layer** (`src/engine/`)

#### RuleEngine
- **Zweck**: Bedingte Logik & Abhängigkeitsverwaltung
- **Evaluation**:
  1. **Visibility**: `field.visibility` → visible/hidden
  2. **Logic**: `field.logic` → actions (disable/enable/setValue/etc)
  3. **Cascading**: Abhängigkeiten werden rekursiv evaluiert
- **Dependency Graph**: Für schnelle Cascade-Updates

```javascript
// Beispiel:
const fieldState = ruleEngine.getFieldState(fieldId, formData);
// → { visible: true, enabled: true, required: true, value: ... }

ruleEngine.evaluateField(fieldId, formData);  // Mit Cascade
```

**Operators**:
- Vergleich: `equals`, `notEquals`, `<`, `>`, `<=`, `>=`
- Array: `includes`, `in`, `notIn`
- Existenz: `exists`, `empty`

**Actions**:
- Visibility: `show`, `hide`
- State: `enable`, `disable`
- Wert: `setValue`, `setRequired`, `setOptions`

#### ValidationEngine
- **Zweck**: Feldvalidierung
- **Built-in Rules**:
  - `required`
  - `email`
  - `minLength`, `maxLength`
  - `min`, `max`
  - `pattern` (RegEx)
  - `custom` (Callback)
- **Custom Validators**: Registerbar
- **Rückgabe**: Array von Fehlermeldungen

```javascript
const errors = validationEngine.validateField(fieldId, value);
// → ['Email is required', 'Invalid email format']

const formValidation = validationEngine.validateForm(formData);
// → { isValid: false, errors: { fieldId: [...], ... } }
```

---

### **Builder Layer** (`src/builder/`)

#### FormBuilder (Hauptkomponente)
- **Zweck**: Orchestrierung aller Builder-Komponenten
- **Responsibilities**:
  - Initialisierung aller Subsysteme
  - Event-Koordination
  - Undo/Redo-Verwaltung
  - Schema-Import/Export
  - Toolbar-Rendering

```javascript
const builder = new FormBuilder(config);
builder.init();

// API:
builder.getSchema();
builder.setSchema(schema);
builder.exportSchema();  // Download
builder.undo();
builder.redo();
```

#### FieldPalette
- **Zweck**: Draggable Feldtypen-Liste
- **Features**:
  - Kategorisierte Feldtypen
  - Drag-Start Events
  - Visual Feedback

```javascript
palette.render();  // DOM erstellen
// Benutzer: Zieht Feldtyp → Canvas
// → Canvas empfängt 'fieldType' im Drop-Event
```

#### Canvas
- **Zweck**: Drag-&-Drop Fläche für Feldanordnung
- **Features**:
  - Feld-Rendering mit Previews
  - Reordering (Drag to reorder)
  - Quick-Actions (Edit/Duplicate/Delete)
  - Empty-State Anzeige

```javascript
canvas.render();  // DOM erstellen
// Interaktionen:
// - Drag Palette → Canvas: Neues Feld
// - Drag Canvas-Feld: Reorder
// - Click Edit: PropertyEditor.render(fieldId)
```

#### PropertyEditor
- **Zweck**: Feld-Eigenschaften editieren
- **Editierbare Elemente**:
  - Basic: label, placeholder, helpText, required, disabled
  - Validation: Regeln hinzufügen/bearbeiten/löschen
  - Logic: Abhängigkeiten und Aktionen
  - Options: (für Select/Radio)

```javascript
propertyEditor.render(fieldId);  // Editor für Feld anzeigen
// Benutzer: Bearbeitet Properties
// → StateManager.updateField() → alle Systeme updated
```

---

### **Renderer Layer** (`src/renderer/`)

#### FormRenderer
- **Zweck**: Laufzeit-Renderer für Vorschau & Live-Rendering
- **Lifecycle**:
  1. `render()` - Schema → DOM
  2. Event-Listener Setup
  3. Rule-Evaluation initialisieren
  4. Validation wiring

```javascript
const renderer = new FormRenderer(
  'preview',
  schema,
  stateManager,
  ruleEngine,
  validationEngine,
  eventBus
);

renderer.render();           // Formular anzeigen
renderer.setFormData(data);  // Daten vorausfüllen
renderer.validate();         // Validierung
```

#### FieldRenderer
- **Zweck**: Einzelnes Feld rendern
- **Verantwortung**:
  1. DOM-Element basierend auf Feldtyp erstellen
  2. Event-Listener (input, blur, change)
  3. Validation & Error-Display
  4. Rule-State anwenden (visible/enabled)
  5. Zwei-Weg-Binding mit formData

```javascript
const fieldRenderer = new FieldRenderer(field, formData, ...);
const dom = fieldRenderer.render();

// Updates Listener:
fieldRenderer.addEventListener('change', () => {
  formData[field.model] = value;
  ruleEngine.evaluate();  // Cascade
  validationEngine.validate();
});
```

---

### **Utils** (`src/utils/`)

#### UUID
- **Zweck**: Eindeutige IDs generieren
- **Methoden**:
  - `generate()` - RFC4122-konforme UUID
  - `generateFieldId()` - `field_xxx`
  - `generateSectionId()` - `section_xxx`

#### Constants
- **Zweck**: Enum-like Konstanten
- **Exports**:
  - `FIELD_TYPES` - Alle Feldtypen
  - `VALIDATION_RULES` - Validierungsregeln
  - `OPERATORS` - Logik-Operatoren
  - `ACTIONS` - Logik-Aktionen
  - `EVENTS` - Event-Namen

---

## 🔀 Interaction Patterns

### **Pattern 1: Field Selection & Editing**

```
User clicks "Edit" on Canvas Field
    ↓
eventBus.emit(FIELD_SELECTED, fieldId)
    ↓
FormBuilder handler:
  - stateManager.updateUIState({ selectedFieldId })
  - propertyEditor.render(fieldId)
    ↓
PropertyEditor renders input fields for field properties
    ↓
User changes label
    ↓
propertyEditor onChange:
  - stateManager.updateField(fieldId, { label })
    ↓
StateManager subscribers notified:
  - Canvas.render() → Preview updates
  - History.push(schema) → Can undo
  - EventBus.emit('schema:changed')
    ↓
FormRenderer updates schema → Preview refreshes
```

### **Pattern 2: Form Data Changes (Cascading Evaluation)**

```
User types in Email field
    ↓
FieldRenderer 'input' event
    ↓
1. Update formData[model]
2. Validate field → emit VALIDATION_ERROR/SUCCESS
3. Evaluate rules for THIS field:
    - Check visibility (depends on this field)
    - Check other fields' logic (depend on this field)
    ↓
RuleEngine.evaluateField(fieldId, formData):
  - Evaluate dependencies (Dependency Graph)
  - Recursively evaluate dependent fields
  - Collect all field state changes
    ↓
RuleEngine emits RULES_EVALUATED with results
    ↓
FormRenderer.onRulesEvaluated():
  - Update DOM (show/hide, enable/disable)
  - Apply error states
  - Update field appearances
```

### **Pattern 3: Undo/Redo**

```
User adds field
    ↓
Schema changes → StateManager notified
    ↓
StateManager.notifySubscribers('schema'):
  - History.push(currentSchema) ← Previous state saved
  - Canvas.render()
  - FormRenderer.updateSchema()
  - RuleEngine.updateSchema()
    ↓
User clicks Undo
    ↓
FormBuilder.undo():
  - previous = History.undo()
  - StateManager.setSchema(previous)
    ↓
All subscribers triggered with old schema
    ↓
UI reverts to previous state
```

---

## 🎯 Design Principles

### 1. **Single Responsibility**
- Jedes Modul hat EINE klare Verantwortung
- FieldRenderer: Nur Feld-DOM rendern
- RuleEngine: Nur Logik evaluieren
- StateManager: Nur State verwalten

### 2. **Separation of Concerns**
- Builder (UI zum Editieren) ≠ Renderer (UI zum Verwenden)
- Schema (Struktur) ≠ State (Laufzeit-Daten)
- Events (Kommunikation) ≠ State (Zustand)

### 3. **Dependency Injection**
Statt globale Variable/Singleton:
```javascript
new FormBuilder(config);  // Alle Services injiziert
new FieldRenderer(field, formData, ruleEngine, ...);  // Dependencies explicit
```

### 4. **Immutability**
StateManager gibt immer Kopien zurück:
```javascript
const schema = stateManager.getSchema();  // Ist eine Kopie!
schema.fields[0].label = 'Changed';  // Ändert nicht den echten State
```

### 5. **Event-Driven**
Modules kommunizieren via EventBus:
```javascript
// Statt: builder.canvas.render()  ← Tight coupling
eventBus.emit('schema:changed');  // Canvas listened selbst
```

### 6. **Lazy Evaluation**
Regeln werden nur evaluiert wenn nötig:
- Bei Field-Änderung: Nur abhängige Felder
- Nicht bei jedem Keystroke: Optimiert

---

## 🔍 Dependency Graph Beispiel

Schema:
```
name (Feld 1)
email (Feld 2)
  ↓ (rules depend on email)
newsletter (Feld 3) - hide wenn email leer
country (Feld 4)
  ↓ (rules depend on country)
taxId (Feld 5) - show nur wenn DE
  ↓ (rules depend on taxId)
taxUpload (Feld 6) - required wenn taxId gesetzt
```

**Dependency Graph**:
```
email → [newsletter]
country → [taxId]
taxId → [taxUpload]
```

**Evaluation bei email-Änderung**:
```
1. Evaluate email (no parent rules)
2. Find dependents: [newsletter]
3. Evaluate newsletter
4. Find dependents: [none]
5. Done

Cascade nur die 2 betroffenen Felder!
```

---

## 🧪 Testing Architecture

```javascript
// Unit Tests
SchemaEngine.validateSchema(schema);
ValidationEngine.validateField(fieldId, value);
RuleEngine.evaluateAll(formData);

// Integration Tests
builder.setSchema(schema);
builder.getFormData();
builder.validateForm();

// E2E Tests
// Manuell: Drag field → Edit → Preview updates
```

---

## 🚀 Performance Optimizations

1. **Memoization**: RuleEngine cached Evaluation-Ergebnisse
2. **Cascading**: Nur betroffene Felder neuberechnen
3. **Lazy DOM**: Nur sichtbare Felder rendern (zukünftig: Virtual List)
4. **Event Delegation**: FormRenderer nutzt Event Bubbling
5. **Schema Validation**: Nur beim Import, nicht bei jedem Update

---

## 📊 Summary: Component Relationships

| Komponente | Depends On | Emits | Subscribes |
|-----------|----------|-------|-----------|
| FormBuilder | StateManager, EventBus, History, all others | schema:changed | schema, uiState |
| FieldPalette | EventBus | field:dragstart | - |
| Canvas | StateManager, EventBus | field:selected, schema updates | schema |
| PropertyEditor | StateManager | field:updated | schema |
| FormRenderer | Schema, RuleEngine, ValidationEngine | field:valueChanged, validation:* | rules:evaluated, schema |
| FieldRenderer | FormData, RuleEngine, ValidationEngine | field:valueChanged | rules:evaluated |
| StateManager | - | (Subs notified) | - |
| RuleEngine | Schema | rules:evaluated | field:valueChanged |
| ValidationEngine | Schema | validation:* | field:valueChanged |
| EventBus | - | All events | All events |

---

**Ergebnis**: Ein modulares, wartbares, erweiterbares System mit klaren Verantwortlichkeiten!
