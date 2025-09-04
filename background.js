// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-selection",
    title: "Save selection to CS50 Saver",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-selection" && info.selectionText) {
    const text = info.selectionText.trim();
    if (!text) return;
    chrome.storage.local.get({ savedSelections: [] }, (data) => {
      const items = data.savedSelections;
      items.unshift({
        text,
        url: tab && tab.url ? tab.url : "",
        timestamp: Date.now()
      });
      chrome.storage.local.set({ savedSelections: items });
    });
  }
});