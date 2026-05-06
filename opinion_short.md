# Kurzfassung — Browser-Automation & KI-Agenten

## Extension testen → Puppeteer
- Chromium mit `--load-extension` starten, DOM testen, deterministisch, kein KI nötig
- `headless: false` wegen speechSynthesis

## Lokale KI für Browser-Control
- **Qwen2.5-VL-7B** (multimodal, Screenshot-basiert) ist die beste Option in der 4–16B Klasse
- Framework: **Browser-Use** (Python) — verbindet lokale Modelle mit Playwright
- Zuverlässigkeit bei einfachen Tasks ~70% — für automatisierte Tests zu unsicher

## Desktop-Agent
- Sinnvoll wenn der Scope über Extension-Testing hinausgeht
- Für reines Extension-Testing ist es Overhead — Puppeteer-Skripte sind besser

## Empfehlung
1. **Jetzt**: Puppeteer-Tests für WebTools einrichten
2. **Optional später**: Browser-Use + Qwen2.5-VL-7B für explorative Tests
3. **Desktop-Agent**: nur wenn allgemeine Automatisierung gewünscht
