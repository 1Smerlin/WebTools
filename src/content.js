let recognition = null;
let dictationActive = false;
let readRate = 1;
let speechLang = 'de-DE';

const getSpeechRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition;

const applyStoredSettings = async () => {
  const stored = await chrome.storage.local.get({ readRate: 1, speechLang: 'de-DE' });
  readRate = Number(stored.readRate) || 1;
  speechLang = stored.speechLang || 'de-DE';
};

const getFocusedEditableElement = () => {
  const el = document.activeElement;
  if (!el) return null;

  const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
  const isEditable = el.isContentEditable;
  return isInput || isEditable ? el : null;
};

const insertTextAtCursor = (text) => {
  const el = getFocusedEditableElement();
  if (!el) return false;

  if (el.isContentEditable) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      el.textContent += ` ${text}`;
      return true;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const before = el.value.slice(0, start);
  const after = el.value.slice(end);
  const prefix = before && !before.endsWith(' ') ? ' ' : '';
  el.value = `${before}${prefix}${text}${after}`;
  el.selectionStart = el.selectionEnd = start + prefix.length + text.length;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
};

const startDictation = () => {
  const SpeechRecognition = getSpeechRecognition();
  if (!SpeechRecognition) {
    alert('SpeechRecognition wird in diesem Chromium-Build nicht unterstützt.');
    return false;
  }

  if (dictationActive) return true;

  recognition = new SpeechRecognition();
  recognition.lang = speechLang || document.documentElement.lang || 'de-DE';
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.trim();
    insertTextAtCursor(transcript);
  };

  recognition.onend = () => {
    if (dictationActive && recognition) {
      recognition.start();
    }
  };

  recognition.onerror = (event) => {
    console.warn('[WebTools Fusion] Dictation error:', event.error);
  };

  recognition.start();
  dictationActive = true;
  return true;
};

const stopDictation = () => {
  dictationActive = false;
  if (recognition) {
    recognition.onend = null;
    recognition.stop();
    recognition = null;
  }
};

const readText = (text) => {
  const cleaned = text?.trim();
  if (!cleaned) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = speechLang || document.documentElement.lang || 'de-DE';
  utterance.rate = readRate;
  window.speechSynthesis.speak(utterance);
};

const readSelection = () => {
  const selected = window.getSelection()?.toString();
  readText(selected || 'Bitte markiere zuerst Text auf der Seite.');
};

const readPage = () => {
  const article = document.querySelector('article, main, [role="main"]');
  const source = article?.innerText || document.body?.innerText || '';
  readText(source.slice(0, 5000));
};

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.readRate) {
    readRate = Number(changes.readRate.newValue) || 1;
  }
  if (changes.speechLang) {
    speechLang = changes.speechLang.newValue || 'de-DE';
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'toggleDictation':
      if (dictationActive) {
        stopDictation();
      } else {
        startDictation();
      }
      sendResponse({ dictationActive, readRate, speechLang });
      break;
    case 'readSelection':
      readSelection();
      sendResponse({ ok: true });
      break;
    case 'readPage':
      readPage();
      sendResponse({ ok: true });
      break;
    case 'stopReading':
      window.speechSynthesis.cancel();
      sendResponse({ ok: true });
      break;
    case 'setRate':
      readRate = Number(message.readRate) || 1;
      sendResponse({ dictationActive, readRate, speechLang });
      break;
    case 'setLang':
      speechLang = message.speechLang || 'de-DE';
      if (recognition && dictationActive) {
        stopDictation();
        startDictation();
      }
      sendResponse({ dictationActive, readRate, speechLang });
      break;
    case 'getStatus':
      sendResponse({ dictationActive, readRate, speechLang });
      break;
    default:
      sendResponse({ ok: false });
      break;
  }
  return true;
});

applyStoredSettings();
