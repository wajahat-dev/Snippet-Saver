const saveBtn = document.getElementById("saveSelectionBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const itemsList = document.getElementById("itemsList");
const emptyState = document.getElementById("emptyState");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

exportBtn.addEventListener("click", () => {
  chrome.storage.local.get({ savedSelections: [] }, (data) => {
    const blob = new Blob([JSON.stringify(data.savedSelections, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Snippet_Saver.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
});

// --- IMPORT ---
importBtn.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", () => {
  const file = importFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert("Invalid file format.");
        return;
      }
      chrome.storage.local.set({ savedSelections: imported }, () => {
        loadAndRender();
        alert("Import successful!");
      });
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
});

function renderItems(items) {
  itemsList.innerHTML = "";
  if (!items || items.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";
  items.forEach((it, index) => {
    const li = document.createElement("li");
    li.className = "item";
    const textDiv = document.createElement("div");
    textDiv.className = "text";
    textDiv.textContent = it.text;
    const metaDiv = document.createElement("div");
    metaDiv.className = "meta";
    const leftMeta = document.createElement("div");
    leftMeta.textContent = new Date(it.timestamp).toLocaleString();
    const rightMeta = document.createElement("div");
    rightMeta.style.display = "flex";
    rightMeta.style.gap = "6px";
    const urlLink = document.createElement("a");
    urlLink.href = it.url || "#";
    urlLink.textContent = it.url ? (new URL(it.url).hostname) : "";
    urlLink.target = "_blank";
    urlLink.rel = "noopener noreferrer";
    if (!it.url) urlLink.style.display = "none";
    rightMeta.appendChild(urlLink);
    metaDiv.appendChild(leftMeta);
    metaDiv.appendChild(rightMeta);
    const actions = document.createElement("div");
    actions.className = "actions";
    const copyBtn = document.createElement("button");
    copyBtn.className = "action-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(it.text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1000);
    });
    const delBtn = document.createElement("button");
    delBtn.className = "action-btn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      removeItem(index);
    });
    actions.appendChild(copyBtn);
    actions.appendChild(delBtn);
    li.appendChild(textDiv);
    li.appendChild(metaDiv);
    li.appendChild(actions);
    itemsList.appendChild(li);
  });
}
function loadAndRender() {
  chrome.storage.local.get({ savedSelections: [] }, (data) => {
    renderItems(data.savedSelections || []);
  });
}
function removeItem(index) {
  chrome.storage.local.get({ savedSelections: [] }, (data) => {
    const items = data.savedSelections || [];
    items.splice(index, 1);
    chrome.storage.local.set({ savedSelections: items }, loadAndRender);
  });
}
saveBtn.addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) { alert("No active tab found."); return; }
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => {
          const sel = window.getSelection();
          return sel ? sel.toString() : "";
        }
      },
      (results) => {
        if (!results || !results[0] || !results[0].result) {
          alert("No selection found on the page. Select some text first.");
          return;
        }
        const selectedText = results[0].result.trim();
        if (!selectedText) {
          alert("No selection found on the page. Select some non-empty text first.");
          return;
        }
        chrome.storage.local.get({ savedSelections: [] }, (data) => {
          const items = data.savedSelections || [];
          items.unshift({ text: selectedText, url: tab.url || "", timestamp: Date.now() });
          chrome.storage.local.set({ savedSelections: items }, () => { loadAndRender(); });
        });
      }
    );
  });
});
clearAllBtn.addEventListener("click", () => {
  if (!confirm("Clear all saved items?")) return;
  chrome.storage.local.set({ savedSelections: [] }, loadAndRender);
});
document.addEventListener("DOMContentLoaded", loadAndRender);