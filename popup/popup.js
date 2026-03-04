const toggleButton = document.querySelector('#toggleDictation');
const dictationState = document.querySelector('#dictationState');
const readSelectionButton = document.querySelector('#readSelection');
const readPageButton = document.querySelector('#readPage');
const stopButton = document.querySelector('#stopReading');
const rateInput = document.querySelector('#rate');
const rateValue = document.querySelector('#rateValue');
const langSelect = document.querySelector('#lang');

const sendAction = async (action, payload = {}) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;
  return chrome.tabs.sendMessage(tab.id, { action, ...payload });
};

const loadSettings = async () => {
  const settings = await chrome.storage.local.get({ readRate: 1, speechLang: 'de-DE' });
  rateInput.value = settings.readRate;
  rateValue.textContent = `${Number(settings.readRate).toFixed(1)}x`;
  langSelect.value = settings.speechLang;
};

const refreshState = async () => {
  const state = await sendAction('getStatus');
  const dictationEnabled = Boolean(state?.dictationActive);
  dictationState.textContent = `Status: ${dictationEnabled ? 'An' : 'Aus'}`;
  toggleButton.textContent = dictationEnabled ? 'Diktat stoppen' : 'Diktat starten';

  if (typeof state?.readRate === 'number') {
    rateInput.value = state.readRate;
    rateValue.textContent = `${Number(state.readRate).toFixed(1)}x`;
  }

  if (typeof state?.speechLang === 'string') {
    langSelect.value = state.speechLang;
  }
};

rateInput.addEventListener('input', async () => {
  const readRate = Number(rateInput.value);
  rateValue.textContent = `${readRate.toFixed(1)}x`;
  await chrome.storage.local.set({ readRate });
  await sendAction('setRate', { readRate });
});

langSelect.addEventListener('change', async () => {
  const speechLang = langSelect.value;
  await chrome.storage.local.set({ speechLang });
  await sendAction('setLang', { speechLang });
});

toggleButton.addEventListener('click', async () => {
  await sendAction('toggleDictation');
  await refreshState();
});

readSelectionButton.addEventListener('click', async () => {
  await sendAction('readSelection');
});

readPageButton.addEventListener('click', async () => {
  await sendAction('readPage');
});

stopButton.addEventListener('click', async () => {
  await sendAction('stopReading');
});

await loadSettings();
await refreshState();
