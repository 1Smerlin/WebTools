# Ausführliche Meinung — Browser-Automation & lokale KI-Agenten

---

## 1. Browser per Script steuern (Extension testen)

### Optionen

**Puppeteer** (Node.js, Google)
- Kann Chromium mit `--load-extension=<pfad>` starten
- Gibt direkten Zugriff auf content scripts, background service worker, popup
- Läuft headless oder sichtbar
- Gut dokumentiert, große Community
- Nachteil: nur Chromium/Chrome, keine anderen Browser

**Playwright** (Microsoft)
- Moderner, cross-browser (Chromium, Firefox, WebKit)
- Extension-Support nur für Chromium (persistent context nötig)
- Besser für komplexe Szenarien, hat eingebaute Assertions
- Etwas aufwändiger für Extension-Testing als Puppeteer

**Für diesen Use Case (WebTools Extension):**
Puppeteer ist die bessere Wahl. Der Workflow wäre:
1. Chromium mit entpackter Extension starten
2. Testseite öffnen (z.B. lokales HTML mit TEXTAREA)
3. Alt+B simulieren oder Message an content script senden
4. Ergebnis im DOM prüfen

Speech-Synthesis (speechSynthesis.getVoices) ist in headless Chromium problematisch —
dafür braucht man `headless: false` oder einen virtual display (Xvfb).

### Einrichtung (grob)
```bash
cd ~/Schreibtisch/WebTools
npm init -y
npm install puppeteer
```

Test-Script:
```js
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--load-extension=${path.resolve(__dirname)}`,
      '--disable-extensions-except=' + path.resolve(__dirname),
    ]
  });
  const page = await browser.newPage();
  await page.goto('about:blank');
  // textarea in DOM injizieren, text eingeben, shortcut testen
})();
```

---

## 2. Lokale KI-Modelle die Browser steuern (4–16B Parameter)

### Was es gibt

**Reine Sprachmodelle (kein Vision)**
- Llama-3.1-8B, Qwen2.5-7B, Mistral-7B — können HTML/DOM verstehen wenn man es als Text gibt
- Können Tool-Use (Funktionsaufrufe) für Browser-Actions generieren
- Brauchen ein Framework das den DOM serialisiert und Actions ausführt

**Multimodale Modelle (Vision + Text)**
- Qwen2.5-VL-7B — kann Screenshots lesen und daraus Actions ableiten
- LLaVA-Mistral-7B — ähnlich, etwas schwächer
- InternVL2-8B — gut für UI-Verständnis
- Diese sind interessanter für echtes Browser-Controlling (kein DOM-Serialisierung nötig)

**Spezialisierte Browser-Agent Frameworks**
- **Browser-Use** (Python) — verbindet lokale Modelle mit Playwright, serialisiert DOM
- **WebVoyager** — research project, screenshot-basiert
- **Open Interpreter** — Desktop-Agent, kann Browser öffnen und steuern
- **AgentBench** — evaluation framework

### Realistische Einschätzung für 4–16B Modelle

Modelle in dieser Größenordnung können einfache, klar beschriebene Browser-Tasks
zuverlässig ausführen (Formular ausfüllen, Button klicken, Text lesen). Komplexe
mehrstufige Workflows scheitern häufiger. Die Zuverlässigkeit liegt bei etwa 60–80%
für gut definierte Tasks — für automatisierte Tests zu unsicher ohne Fallback-Logik.

### Lokaler Desktop-Agent vs. Skript-basierte Automation

**Skript (Puppeteer/Playwright):**
- 100% deterministisch
- Schnell (Millisekunden)
- Kein Modell nötig, kein GPU-Verbrauch
- Muss bei Änderungen am Extension-Code manuell angepasst werden

**Lokaler KI-Agent:**
- Kann natürlichsprachlich beschriebene Tests ausführen ("teste ob nach dem Diktieren ein Leerzeichen vor dem nächsten Wort kommt")
- Passt sich automatisch an UI-Änderungen an (wenn visuell gesteuert)
- Langsam, GPU-intensiv, fehleranfälliger
- Interessant für explorative Tests, nicht für CI/CD

### Empfehlung

Für Extension-Testing: **Puppeteer-Skripte** als Basis. Schnell, zuverlässig, wartbar.

Für explorative/manuelle Unterstützung: **Browser-Use + Qwen2.5-VL-7B lokal** als
optionales Tool — nicht als primäre Test-Infrastruktur. Browser-Use hat gute
Integration mit Ollama und lokalen Modellen.

Einen vollständigen Desktop-Agent einzurichten (Open Interpreter o.ä.) lohnt sich
wenn der Scope über Extension-Testing hinausgeht — z.B. wenn du allgemein
Automatisierungs-Tasks auf dem Desktop erledigen willst. Für den aktuellen Use Case
ist es Overhead.

---

## Fazit

| Ziel | Werkzeug |
|------|----------|
| Extension testen (deterministisch) | Puppeteer + lokales HTML |
| Extension testen (explorativ) | Browser-Use + Qwen2.5-VL-7B |
| Allgemeiner Desktop-Agent | Open Interpreter + lokales Modell |
| Speech in Chromium | speech-dispatcher + espeak-ng |
