chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'webtools-read-selection',
    title: 'WebTools: Auswahl vorlesen',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'webtools-read-selection' || !tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { action: 'readSelection' });
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  if (command === 'toggle-dictation') {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleDictation' });
  }

  if (command === 'read-selection') {
    chrome.tabs.sendMessage(tab.id, { action: 'readSelection' });
  }
});
