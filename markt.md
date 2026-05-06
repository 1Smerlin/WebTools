# Plan: TTS-Stimmen in Chromium (speech-dispatcher)

## Problem
`speechSynthesis.getVoices()` gibt `[]` zurück.

Ursachenkette:
1. `speech-dispatcher` läuft, hat aber **keine Output-Module** (TTS-Engine fehlt)
2. Chromium fragt speech-dispatcher nach Stimmen → bekommt nichts
3. Web Speech API meldet leere Stimmliste

---

## Schritt 1 — TTS-Engine installieren

```bash
sudo pacman -S espeak-ng
```

Alternativ (bessere Qualität, größere Pakete):
- `festival` + `festival-us` / `festival-de`
- `rhvoice` (AUR)

---

## Schritt 2 — speech-dispatcher konfigurieren

Config-Datei anlegen:
```bash
mkdir -p ~/.config/speech-dispatcher
cp /etc/speech-dispatcher/speechd.conf ~/.config/speech-dispatcher/speechd.conf
```

In `~/.config/speech-dispatcher/speechd.conf` setzen:
```
DefaultModule espeak-ng
DefaultLanguage de
DefaultVoiceType MALE1
```

speech-dispatcher neu starten:
```bash
systemctl --user restart speech-dispatcher
```

---

## Schritt 3 — testen

```bash
spd-say --list-output-modules   # muss jetzt espeak-ng zeigen
spd-say "Hallo Welt"            # muss sprechen
```

---

## Schritt 4 — Chromium starten

```bash
chromium --enable-speech-dispatcher
```

Dann in der Konsole:
```js
speechSynthesis.onvoiceschanged = () => console.log(speechSynthesis.getVoices())
```

→ Sollte jetzt Stimmen listen.

---

## Schritt 5 — PKGBUILD prüfen (nächster Build)

Aktuelle Custom-Flags:
```
'enable_tts=true'            # kein gültiger GN-Flag → prüfen/entfernen
'enable_speech_dispatcher=true'  # korrekt
'use_speech_dispatcher=true'     # kein gültiger GN-Flag → prüfen/entfernen
'enable_accessibility=true'  # korrekt
```

Gültige Flags laut Chromium-Source:
- `enable_speech_dispatcher=true` — reicht
- `enable_tts` und `use_speech_dispatcher` existieren nicht als GN-Flags → können weg

---

## Status

- [ ] espeak-ng installiert
- [ ] speech-dispatcher konfiguriert
- [ ] spd-say --list-output-modules zeigt Module
- [ ] Chromium getVoices() gibt Stimmen zurück
- [ ] PKGBUILD bereinigt
