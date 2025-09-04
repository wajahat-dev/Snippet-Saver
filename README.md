# Snippet Saver (Selection Saver — Chrome Extension)

#### Video Demo:  

#### Description:

**Snippet Saver** (originally created as *Selection Saver*) is a lightweight Chrome extension that lets you quickly capture selected text from any webpage, store snippets with timestamps and source URLs, manage those snippets in a compact popup UI, and export/import your collection as JSON. The extension is designed to be simple, reliable, and useful for students, researchers, and anyone who needs to gather quotes, references, or short notes from the web without leaving the browser.

This README explains what the project does, how to install and test it, the files included in the repository, design decisions and tradeoffs, and ideas for future improvements.

---

## Features (short summary)

- Save highlighted text from the active tab into persistent storage.  
- Right-click context-menu option to save selections without opening the popup.  
- Popup UI to view saved snippets, copy/delete individual items, and clear all.  
- Export saved snippets to a JSON file and import them back (useful for backup or transferring data between machines).  
- Stores metadata for each snippet: original page URL and timestamp.

---

## Files in this project

- `manifest.json` — Extension manifest (Manifest V3). Declares permissions (`storage`, `contextMenus`, `scripting`, `activeTab`) and registers the background service worker (`background.js`) and popup (`popup.html`).  
- `background.js` — Service worker that creates the "Save selection" context menu and handles clicks on that menu. When you use the right-click menu to save a selection, this worker stores the snippet in `chrome.storage.local`.  
- `popup.html` — The HTML for the popup shown when clicking the extension icon. Contains the UI skeleton: list of saved items and controls (Save Selection, Export, Import, Clear All).  
- `popup.js` — Popup logic: loads stored snippets, renders the list, handles button actions (Save Selection via `chrome.scripting.executeScript`, Copy, Delete, Clear, Export, and Import). When you press **Save Selection** in the popup, the extension injects a small script into the active tab to read `window.getSelection()` and saves that text with the tab URL and timestamp.  
- `styles.css` — Styling for the popup to keep the UI compact and clean.  
- `icons/` — Placeholder icon files (`icon16.png`, `icon48.png`, `icon128.png`). Replace these with designed PNGs for publication.  
- `cs50_extension_presentation.pptx` — A simple slide deck (intro + closing) you can use when recording your project video.  
- `cs50_extension.zip` — Zip of the project (contains the files above).

---

## How to install and test (developer / evaluator)

1. Download or clone this repository, or unzip `cs50_extension.zip`.  
2. Open Chrome (or Chromium) and go to `chrome://extensions`.  
3. Enable **Developer mode** (top-right).  
4. Click **Load unpacked** and select the project folder (the folder that contains `manifest.json`).  
5. The extension icon will appear in the toolbar. Click it to open the popup.  
6. To save text: navigate to any webpage, highlight some text, then either:  
   - Open the extension popup and click **Save Selection**, or  
   - Right-click the highlighted text and choose **Save selection to CS50 Saver**.  
7. Use **Export** to download `cs50_selections.json` (a standard JSON array of saved snippet objects). Use **Import** to restore from such a file.

**Example JSON format (export):**

```
[
  { "text": "Example snippet", "url": "https://example.com", "timestamp": 1620000000000 },
  { "text": "Another quote", "url": "https://site.org", "timestamp": 1620001000000 }
]
```

---

## Design choices and tradeoffs

- **Manifest V3 & service worker**: Manifest V3 requires using a background service worker instead of a persistent background page. This helps resource usage but imposes some lifecycle constraints (worker may be stopped when idle). For this project the simplicity of handling context menus in the worker outweighs those constraints.  
- **Storage**: I used `chrome.storage.local` for persistence to keep things simple and avoid server-side components. It's sufficient for modest collections of text snippets. For very large datasets, migrating to IndexedDB or syncing to a cloud backend would be better.  
- **Injection vs. content script**: The popup uses `chrome.scripting.executeScript` to read `window.getSelection()` on demand. This avoids always-running content scripts and reduces overhead, but it won't work on pages that block script injection (e.g., Chrome Web Store pages). That's a known limitation.  
- **Export/import JSON**: A simple and transparent backup format that is human-readable and portable. No encryption or compression is performed; users should treat exported files like regular text files.

---

## Known limitations & security notes

- Script injection is not allowed on some special pages (chrome:// pages, the Web Store, certain extension pages), so saving selections there will fail. This is a browser restriction, not a bug in the extension.  
- The extension stores data locally only. There is no authentication or remote sync. Do not store sensitive personal data in the extension if you are concerned about local access.  
- Icons in `icons/` are placeholders (empty files). Please replace them with properly sized PNGs for better UX.

---

## Future improvements

- Add search, tagging, and filtering for saved snippets.  
- Sync with cloud storage (Google Drive, Dropbox, or a small backend) to access snippets across devices.  
- Add keyboard shortcuts for faster saving.  
- Add the ability to associate notes or tags with each snippet.  
- Improve UI/UX and add a React-based popup for richer interactions.

---

## License & Credits

This project was created for the CS50 final project assignment. You are free to reuse the code for learning and personal projects. Suggested license: **MIT** (add `LICENSE` file to the repo if you want to publish).

---

*If you’d like, I can also commit this README into the project zip and regenerate the zip file for download. Replace `<VIDEO_URL_HERE>` above with your final YouTube (or other hosting) URL once your screencast is uploaded.*
