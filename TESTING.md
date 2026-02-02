# FormBuilder - Test & Verify Checklist

## ✅ Lokales Testen

### 1. Server starten
```bash
cd formbuilder-cms
python -m http.server 8000
# Oder: python3 -m http.server 8000
```

### 2. Browser öffnen
```
http://localhost:8000
```

---

## 🧪 Test-Szenarien

### Scenario 1: Einfaches Formular erstellen

**Schritt:**
1. Linke Seite: Drag "Text" → Canvas (Mitte)
2. Rechts: Bearbeite Label "First Name"
3. Rechts: Aktiviere "Required" ✓
4. Rechts: Füge Validierung "required" hinzu

**Erwartet:**
- Feld erscheint auf Canvas
- Canvas wird aktualisiert in Echtzeit
- Rechts (Preview) zeigt das Feld sofort
- Preview zeigt Validierungsfehler wenn leer

---

### Scenario 2: Abhängiges Feld erstellen

**Schritt:**
1. Füge "Select" Feld hinzu
   - Label: "Country"
   - Options: "DE", "AT", "CH"
2. Füge "Text" Feld hinzu
   - Label: "Company"
   - Visibility: dependsOn "Country", equals "DE"

**Erwartet:**
- In Preview: Company-Feld nur sichtbar wenn "DE" ausgewählt
- Beim Umschalten sofort ausgeblendet/angezeigt
- Im Canvas: Company-Feld zeigt Visibility-Indikator

---

### Scenario 3: Validierung testen

**Schritt:**
1. Füge Email-Feld hinzu (Required + Email Validation)
2. In Preview: Tippe ungültige Email
3. Blur (click away)

**Erwartet:**
- Rote Fehlermeldung erscheint
- Email-Input zeigt roten Border
- Form kann nicht submitted werden
- Nach gültiger Email: Fehler verschwindet

---

### Scenario 4: Undo/Redo testen

**Schritt:**
1. Erstelle 3 Felder
2. Klicke "↶ Undo" mehrmals
3. Klicke "↷ Redo" mehrmals

**Erwartet:**
- Undo: Felder werden nacheinander gelöscht (in Reihenfolge)
- Redo: Felder werden wieder hinzugefügt
- Canvas aktualisiert sich sofort
- Preview aktualisiert sich sofort

---

### Scenario 5: Schema Export/Import

**Schritt:**
1. Erstelle Formular mit 3 Feldern
2. Klicke "📥 Export Schema"
3. JSON-Datei wird heruntergeladen
4. Klicke "Clear" → Formular wird gelöscht
5. Klicke "📤 Import Schema"
6. Wähle die heruntergeladene Datei

**Erwartet:**
- JSON wird korrekt heruntergeladen
- Import lädt das Schema zurück
- Alle Felder und Properties sind identisch
- Canvas und Preview sind wiederhergestellt

---

### Scenario 6: Complex Logic testen

**Schritt:**
1. Füge "Number" Feld "age" hinzu
2. Füge "Switch" Feld "newsletter" hinzu
3. Bearbeite newsletter → Logic:
   ```
   if: age < 18
   then: disable + setValue false
   ```
4. In Preview: Tippe Alter < 18

**Erwartet:**
- Newsletter-Switch wird deaktiviert
- Newsletter wird auf false gesetzt
- User kann nicht aktivieren wenn < 18
- Newsletter aktivierbar wenn >= 18

---

## 🔍 Debuggen in der Console

### Test-Kommandos

```javascript
// Im Browser Console:

// 1. Builder-Instanz sehen
window.formBuilder

// 2. Aktuelles Schema abrufen
window.formBuilder.getSchema()

// 3. Formulardata abrufen
window.formBuilder.getFormData()

// 4. Formular validieren
window.formBuilder.validateForm()

// 5. Alle Events sehen
window.formBuilder.eventBus.on('field:valueChanged', 
  (data) => console.log('Changed:', data))

// 6. Rule-Evaluationen sehen
window.formBuilder.eventBus.on('rules:evaluated', 
  (results) => console.log('Rules:', results))

// 7. Zirkuläre Abhängigkeiten prüfen
const { SchemaEngine } = window.formBuilder;
SchemaEngine.detectCircularDependencies(
  window.formBuilder.getSchema()
)

// 8. Schema validieren
SchemaEngine.validateSchema(window.formBuilder.getSchema())
```

---

## 📋 Feature-Checkliste

### Builder UI
- [ ] Field Palette mit Kategorien sichtbar
- [ ] Fields können dragged werden
- [ ] Canvas zeigt alle Felder
- [ ] Felder können auf Canvas reordered werden
- [ ] Edit-Button zeigt Property Editor
- [ ] Duplicate-Button arbeitet
- [ ] Delete-Button funktioniert
- [ ] Undo/Redo funktionieren
- [ ] Export/Import funktionieren
- [ ] Clear funktioniert

### Property Editor
- [ ] Label bearbeitbar
- [ ] Placeholder bearbeitbar
- [ ] Help Text bearbeitbar
- [ ] Required-Checkbox funktioniert
- [ ] Disabled-Checkbox funktioniert
- [ ] Validierungsregeln hinzufügbar
- [ ] Validierungsregeln bearbeitbar
- [ ] Validierungsregeln löschbar
- [ ] Logic Rules hinzufügbar
- [ ] Logic Rules bearbeitbar
- [ ] Logic Rules löschbar
- [ ] Options (für Select) bearbeitbar

### Preview/Renderer
- [ ] Formular wird angezeigt
- [ ] Form Title wird angezeigt
- [ ] Alle Feldtypen werden richtig gerendert
- [ ] Labels werden angezeigt
- [ ] Placeholder funktionieren
- [ ] Required-Indicator (*) sichtbar
- [ ] Validierungsmeldungen erscheinen
- [ ] Abhängige Felder zeigen/verstecken sich
- [ ] Submit-Button funktioniert
- [ ] Form Data wird korrekt erfasst

### Rule Engine
- [ ] Visibility Rules funktionieren
- [ ] Logic Rules funktionieren
- [ ] Cascading Evaluation funktioniert
- [ ] Disable/Enable funktioniert
- [ ] setValue funktioniert
- [ ] setRequired funktioniert

### Validation
- [ ] Required Validierung
- [ ] Email Validierung
- [ ] MinLength Validierung
- [ ] MaxLength Validierung
- [ ] Min Validierung
- [ ] Max Validierung
- [ ] Pattern Validierung
- [ ] Fehlermeldungen zeigen
- [ ] Submit blockiert bei Errors

---

## 🎯 Erweiterte Tests

### Test 1: Komplexes Schema

```javascript
// In Console:
const complexSchema = {
  meta: { name: 'Advanced', version: '1.0.0' },
  fields: [
    {
      id: 'f1', type: 'text', model: 'name', label: 'Name',
      required: true,
      validation: [{ rule: 'required' }]
    },
    {
      id: 'f2', type: 'select', model: 'country', label: 'Country',
      options: [{ value: 'DE', label: 'Germany' }, 
                { value: 'US', label: 'USA' }]
    },
    {
      id: 'f3', type: 'text', model: 'taxId', label: 'Tax ID',
      visibility: { dependsOn: 'f2', operator: 'equals', value: 'DE' }
    }
  ]
};

window.formBuilder.setSchema(complexSchema);
```

**Prüfe:**
- Schema wird geladen
- Canvas zeigt alle 3 Felder
- taxId ist sichtbar wenn DE ausgewählt
- taxId ist versteckt wenn US ausgewählt

### Test 2: Validation Errors

```javascript
// In Console:
const result = window.formBuilder.validateForm();
console.log('Valid?', result.isValid);
console.log('Errors:', result.errors);
```

### Test 3: Mehrsprachigkeit (Custom Messages)

```javascript
const schema = {
  meta: { name: 'DE Form', version: '1.0.0' },
  fields: [
    {
      id: 'email',
      type: 'email',
      model: 'email',
      label: 'E-Mail',
      validation: [
        { rule: 'required', message: 'E-Mail ist erforderlich' },
        { rule: 'email', message: 'Ungültige E-Mail-Adresse' }
      ]
    }
  ]
};

window.formBuilder.setSchema(schema);
```

---

## 🚨 Fehlerbehandlung Test

### Ungültiges Schema

```javascript
// In Console:
const badSchema = {
  meta: { name: 'Bad' },
  fields: [
    { id: 'f1' }  // Missing type & model
  ]
};

const { SchemaEngine } = window.formBuilder;
const validation = SchemaEngine.validateSchema(badSchema);
console.log(validation.errors);  // Should show errors
```

### Zirkuläre Abhängigkeiten

```javascript
// Erstelle Feld A abhängig von B
// Erstelle Feld B abhängig von A
// In Console:
const cycles = SchemaEngine.detectCircularDependencies(
  window.formBuilder.getSchema()
);
console.log('Cycles found:', cycles);  // Should find the cycle
```

---

## ✨ Performance Test

```javascript
// Erstelle Form mit vielen Feldern:
const schema = {
  meta: { name: 'Big Form', version: '1.0.0' },
  fields: []
};

// Füge 50 Felder hinzu
for (let i = 0; i < 50; i++) {
  schema.fields.push({
    id: `f${i}`,
    type: 'text',
    model: `field${i}`,
    label: `Field ${i}`,
  });
}

console.time('Load');
window.formBuilder.setSchema(schema);
console.timeEnd('Load');

// Sollte schnell sein (< 1000ms)
```

---

## 📊 Expected Results

**Wenn alle Tests bestanden sind:**

✅ Builder UI funktioniert vollständig
✅ Renderer zeigt Formulare korrekt
✅ Validierung funktioniert
✅ Rules werden evaluiert
✅ Abhängigkeiten funktionieren
✅ Undo/Redo funktioniert
✅ Import/Export funktioniert
✅ Keine JavaScript Fehler in Console
✅ Performance ist gut
✅ Code läuft ohne externe Abhängigkeiten

---

## 📞 Support & Debugging

Wenn etwas nicht funktioniert:

1. **Console öffnen:** F12 → Console Tab
2. **Errors prüfen:** Sollten keine rot angezeigten Fehler sein
3. **Schema prüfen:** `window.formBuilder.getSchema()`
4. **Data prüfen:** `window.formBuilder.getFormData()`
5. **Events prüfen:** Siehe Debugging-Kommandos oben

---

**FormBuilder sollte alle Tests bestehen! ✅**
