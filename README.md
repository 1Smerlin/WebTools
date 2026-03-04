# WebTools Fusion (Chromium Extension)

Dieses Repository enthält eine **fusionierte Chromium-Extension** mit Fokus auf:

- **SpeechDictation**-ähnliche Funktion: Spracheingabe in aktive Textfelder.
- **WebReader**-ähnliche Funktion: Auswahl oder Seiteninhalt per Text-to-Speech vorlesen.

## Neu in dieser Revision

- Icons werden separat bereitgestellt (bereits extern gepusht).
- Persistente Einstellungen (`chrome.storage.local`) für Lesegeschwindigkeit und Sprache.
- Sprachauswahl im Popup (de/en/fr/es).
- Kontextmenü-Eintrag: **"WebTools: Auswahl vorlesen"** per Rechtsklick auf markierten Text.

## Funktionen

- Diktat starten/stoppen (Popup oder Hotkey `Ctrl+Shift+Y`)
- Markierten Text vorlesen (`Ctrl+Shift+U` oder Kontextmenü)
- Gesamte Seite vorlesen (über Popup)
- Vorlesen stoppen
- Sprechgeschwindigkeit im Popup einstellen (persistent)
- Sprache im Popup einstellen (persistent)

## Installation in Chromium

1. `chrome://extensions` öffnen.
2. **Developer mode** aktivieren.
3. **Load unpacked** klicken.
4. Diesen Ordner auswählen (`/workspace/WebTools`).
5. Bei Update in der Extension-Karte auf **Reload** klicken.

## Projektstruktur

- `manifest.json` – MV3-Konfiguration
- `popup/` – Popup UI
- `src/content.js` – Diktat + Vorlesen auf Webseiten
- `src/background.js` – Hotkeys + Kontextmenü

## Hinweis

In dieser Laufzeitumgebung war kein direkter Zugriff auf die externen GitHub-Repositories möglich. Daher wurde die Fusion als neue, lauffähige Chromium-MV3-Implementierung mit den gewünschten Kernfunktionen umgesetzt.
