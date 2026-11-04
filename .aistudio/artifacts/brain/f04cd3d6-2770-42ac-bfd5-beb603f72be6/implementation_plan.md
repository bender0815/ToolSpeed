# Implementierungsplan: KI-Assistent für Werkzeug- & Materialdatenbank

In **DrehSpeed** wird ein intelligenter KI-Assistent integriert, der anhand von Werkzeug-Codes, Wendeplatten-ISO-Bezeichnungen (z. B. `CNMG 120408`, `SCLCR 1616`, `DCMT 070204`) oder Werkstoff-Bezeichnungen / DIN-Nummern (z. B. `1.4301`, `42CrMo4`, `POM-C`, `PEEK`) automatisch alle relevanten Kenndaten aus Datenblättern und Herstellerkatalogen per Live-Websuche ermittelt. Gefundene Werkzeuge und Werkstoffe werden direkt gespeichert und können sofort angepasst werden.

---

## 1. Architektur & Gemini API Integration

### A. Server-Side Gemini API (`server.ts` & Express + Vite Middleware)
- Umsetzung gemäß AI Studio Richtlinien als Full-Stack Node/Express-Server (`"dev": "tsx server.ts"`, `"start": "node server.ts"`).
- Clientseitig werden keine API-Keys exponiert; Anfragen laufen über dedizierte Endpunkte:
  - `POST /api/assist/tool`: Ermittelt aus einem Werkzeug- oder Wendeplattencode alle Spezifikationen:
    - Halterbezeichnung, Wendeplattenform (`C`, `D`, `V`, `W`, `S`, `T`, etc.), Eckenradius ($r_\epsilon$), Schaftquerschnitt, Schneidstoff (`carbide` / `hss`), ISO-Eignungsklassen (`P`, `M`, `K`, `N`, `S`, `H`), Einsatzkategorie (Schruppen, Schlichten, Abstechen, Bohrstange, Gewinde).
  - `POST /api/assist/material`: Ermittelt aus Werkstoffnummer oder Name alle Zerspanungsdaten:
    - Werkstoffgruppe (`steel`, `stainless`, `aluminum`, `plastics`, `brass_bronze`, `cast_iron`, `special`), ISO-Gruppe (`P`, `M`, `K`, `N`, `S`, `H`), Spezifische Schnittkraft $k_{c1.1}$, Härte, Kühlmittelempfehlung, sowie Schnittdaten ($v_c, f, a_p$) für Hartmetall und HSS (Schruppen, Schlichten, Abstechen).
- **Modell & Grounding**: Einsatz von `gemini-3.8-flash` mit Google Search Grounding (`tools: [{ googleSearch: {} }]`), um aktuelle Katalogdaten (Sandvik, Iscar, Walter, Seco, Hoffmann, etc.) abzugleifen und als valides JSON bereitzustellen.

---

## 2. Benutzererlebnis & Workflows (UI / UX)

### A. Werkzeugdatenbank (`ToolDatabaseModal.tsx`)
- **Assistenten-Eingabebereich**:
  - Auffälliges, modernes Eingabefeld am Anfang der Werkzeugdatenbank: *"KI-Assistent: Wendeplatten- oder Werkzeugcode eingeben"* (z. B. `CNMG120408`, `SCLCR 1616 H09`, `DCMT 070204-SM`).
  - Ein-Klick-Button **„Mit KI erfassen & anlegen“** mit Ladezustand und Fortschrittsanzeige ("Durchsuche Herstellerkataloge & Normen...").
- **Direktes Speichern mit Sofort-Bearbeitung**:
  - Das erkannte Werkzeug wird unmittelbar in die Werkzeugliste aufgenommen und als eigenes Werkzeug markiert (`isOwned: true`).
  - Das Bearbeitungsformular öffnet sich direkt mit den vorausgefüllten Daten, sodass der Anwender Maße (z. B. Schaftgröße für seine Drehbank) oder Plattenradien sofort überprüfen und bei Bedarf feinjustieren kann.

### B. Materialdatenbank (`MaterialBarAndModal.tsx`)
- **Neuer Bereich „Eigenen Werkstoff anlegen (KI-Assistent)“**:
  - Schnellerfassung für jeden beliebigen Werkstoff (z. B. `1.4404`, `Titan Grade 5`, `16MnCr5`, `Messing Ms58`, `PEEK`, `PTFE`).
  - KI analysiert Zugfestigkeit, Härte und errechnet werkstatttaugliche Richtwerte für Schnittgeschwindigkeit $v_c$, Vorschub $f$ und Schnitttiefe $a_p$ sowohl für HSS als auch für Hartmetall.
  - Das Material wird direkt in die Liste der benutzerdefinierten Werkstoffe übernommen und steht sofort in der Schnittdaten- und Drehzahlberechnung zur Verfügung.
  - Möglichkeit zur nachträglichen Anpassung der Schnittdaten im Modal.

---

## 3. Datenhaltung & Synchronisation

- **Gastmodus**:
  - Eigene Werkzeuge und erfasste Werkstoffe werden im Browser-`localStorage` gespeichert (`drehspeed_custom_materials_v1`, `drehspeed_workshop_tools_v3`).
- **Benutzerkonto (Firebase Auth & Firestore)**:
  - Bei angemeldeten Benutzern werden eigene Werkzeuge und benutzerdefinierte Werkstoffe automatisch in Firestore unter `users/{userId}/custom_materials` und `users/{userId}/tools` synchronisiert.
  - Offline-Fähigkeit bleibt durch lokalen Cache vollständig erhalten.

---

## 4. Test- & Validierungsplan

1. **KI-Tool-Assistent**:
   - Test mit gängigen ISO-Codes (`CNMG 120408`, `CCMT 060204`, `MGMN 200-G`, `SER 1616 H16`).
   - Prüfung von Form, Eckenradius, Schaft und ISO-Gruppen.
2. **KI-Material-Assistent**:
   - Test mit Norm-Werkstoffen (`1.4301`, `42CrMo4`, `AlCuMgPb`) und Spezialkunststoffen (`PEEK`).
   - Prüfung der Schnittdatenbereiche ($v_c, f, a_p$) und der Einbindung in die Drehzahlberechnung.
3. **Direkt-Speichern & Editieren**:
   - Bestätigung, dass neu erfasste Einträge sofort in den Auswahllisten auftauchen und editierbar sind.
4. **Build & Lint**:
   - Ausführung von `lint_applet` und `compile_applet`.
