const STORAGE_KEY = "bookmarkShelfState";
let cachedState = {};

chrome.commands.onCommand.addListener((command) => {
  if (command !== "open-bookmark-shelf") {
    return;
  }

  openShelfFromCommand().catch(() => {});
});

chrome.action.onClicked.addListener((tab) => {
  openShelf({ tab, preferSidePanel: true }).catch(() => {});
});

chrome.runtime.onInstalled.addListener(setupExtensionControls);
chrome.runtime.onStartup.addListener(setupExtensionControls);
refreshCachedState();
setupExtensionControls();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[STORAGE_KEY]) return;
  cachedState = changes[STORAGE_KEY].newValue || {};
  updateActionSidePanelBehavior(changes[STORAGE_KEY].newValue || {}).catch(() => {});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-bookmark-shelf") {
    openShelf({ tab, preferSidePanel: true }).catch(() => {});
  }
});

async function setupExtensionControls() {
  await removeAllContextMenus();
  try {
    chrome.contextMenus.create({
      id: "open-bookmark-shelf",
      title: "Bookmark Shelf を開く",
      contexts: ["all"]
    }, () => void chrome.runtime.lastError);
  } catch {
    // Menu creation can throw while Brave is refreshing extension state.
  }
  await updateActionSidePanelBehavior(await getShelfState());
}

function removeAllContextMenus() {
  return new Promise((resolve) => {
    try {
      chrome.contextMenus.removeAll(() => resolve());
    } catch {
      resolve();
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "close-bookmark-shelf") {
    closeShelf(message, sender).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "open-bookmark-keep-overlay") {
    openBookmarkKeepingOverlay(message).then((ok) => sendResponse({ ok })).catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "patch-bookmark-shelf-state") {
    patchShelfState(message.patch).then((state) => sendResponse({ ok: true, state })).catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "open-bookmark-shelf") {
    openShelf({ tab: sender?.tab, preferSidePanel: true }).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }

  return false;
});

async function patchShelfState(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new Error("Invalid state patch");
  }
  const result = await chrome.storage.local.get(STORAGE_KEY).catch(() => ({}));
  const currentState = result[STORAGE_KEY] || {};
  const nextState = { ...currentState, ...patch };
  await chrome.storage.local.set({ [STORAGE_KEY]: nextState });
  cachedState = nextState;
  await updateActionSidePanelBehavior(nextState).catch(() => {});
  return nextState;
}

async function openShelf(options = {}) {
  const state = Object.keys(cachedState).length ? cachedState : await getShelfState();
  const tab = options.tab || await getActiveTab();
  const windowId = tab?.windowId || (await getTargetWindowId());
  const launchMode = state.launchMode || "overlay";
  const canUseOverlay = launchMode === "overlay" && tab?.id && isInjectableUrl(tab.url);

  if (launchMode === "sidepanel") {
    if (windowId && (await tryOpenSidePanel(windowId))) {
      return;
    }
    await openShelfTab(windowId);
    return;
  }

  if (canUseOverlay && (await tryOpenOverlay(tab))) {
    return;
  }

  const shouldPreferSidePanel = launchMode === "sidepanel" || options.preferSidePanel || !canUseOverlay;
  if (shouldPreferSidePanel && windowId && (await tryOpenSidePanel(windowId))) {
    return;
  }

  if (!shouldPreferSidePanel && windowId && (await tryOpenSidePanel(windowId))) {
    return;
  }

  await chrome.windows.create({
    url: chrome.runtime.getURL("launcher.html"),
    type: "popup",
    width: 1420,
    height: 920,
    focused: true
  });
}

async function openShelfFromCommand() {
  await openShelf({ preferSidePanel: false });
}

function openSidePanelFromUserGesture(windowId) {
  if (!chrome.sidePanel?.open || !windowId) {
    openShelfTab(windowId).catch(() => {});
    return;
  }
  chrome.sidePanel.open({ windowId }).catch(() => openShelfTab(windowId)).catch(() => {});
}

async function updateActionSidePanelBehavior(state = {}) {
  if (!chrome.sidePanel?.setPanelBehavior) return;
  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: (state.launchMode || "overlay") === "sidepanel"
  }).catch(() => {});
}

async function getShelfState() {
  const result = await chrome.storage.local.get(STORAGE_KEY).catch(() => ({}));
  cachedState = result[STORAGE_KEY] || {};
  return cachedState;
}

async function refreshCachedState() {
  await getShelfState().catch(() => {});
}

function getLaunchMode() {
  return cachedState.launchMode || "overlay";
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }).catch(() => []);
  return tab;
}

async function tryOpenOverlay(tab) {
  if (!tab?.id || !isInjectableUrl(tab.url)) return false;
  try {
    await ensureOverlayHost(tab.id);
    await chrome.tabs.sendMessage(tab.id, getOverlayMessage("toggle-bookmark-shelf-overlay"));
    return true;
  } catch {
    return false;
  }
}

async function showOverlay(tab) {
  if (!tab?.id || !isInjectableUrl(tab.url)) return false;
  try {
    await ensureOverlayHost(tab.id);
    await chrome.tabs.sendMessage(tab.id, getOverlayMessage("show-bookmark-shelf-overlay"));
    return true;
  } catch {
    return false;
  }
}

async function ensureOverlayHost(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["src/overlay-host.js"]
  });
}

function getOverlayMessage(type) {
  return {
    type,
    url: chrome.runtime.getURL("launcher.html?surface=overlay")
  };
}

function isInjectableUrl(url = "") {
  return /^(https?|file):\/\//i.test(url);
}

async function tryOpenSidePanel(windowId) {
  if (!chrome.sidePanel?.open) return false;
  try {
    await chrome.sidePanel.open({ windowId });
    return true;
  } catch {
    return false;
  }
}

async function openShelfTab(windowId) {
  const url = chrome.runtime.getURL("sidepanel.html");
  if (windowId) {
    await chrome.tabs.create({ windowId, url, active: true }).catch(() => chrome.tabs.create({ url, active: true }));
    return;
  }
  await chrome.tabs.create({ url, active: true });
}

async function getTargetWindowId() {
  const focusedWindow = await chrome.windows.getLastFocused({ windowTypes: ["normal"] }).catch(() => null);
  if (focusedWindow?.id) return focusedWindow.id;
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] }).catch(() => []);
  return windows[0]?.id;
}

async function closeShelf(message, sender) {
  const windowId = message.windowId || sender?.tab?.windowId;
  if (windowId && chrome.sidePanel?.close) {
    await chrome.sidePanel.close({ windowId });
  }
  if (sender?.tab?.id && sender.tab.url === chrome.runtime.getURL("sidepanel.html")) {
    await chrome.tabs.remove(sender.tab.id).catch(() => {});
  }
}

async function openBookmarkKeepingOverlay(message) {
  if (!message?.tabId || !message?.url) return false;
  const beforeTab = await chrome.tabs.get(message.tabId).catch(() => null);
  const windowId = beforeTab?.windowId || message.windowId;

  await chrome.tabs.update(message.tabId, { url: message.url, active: true });
  if (windowId) {
    await chrome.windows.update(windowId, { focused: true }).catch(() => {});
  }

  const afterTab = await waitForTabComplete(message.tabId, 9000);
  if (afterTab && isInjectableUrl(afterTab.url)) {
    await showOverlay(afterTab);
  }

  return true;
}

function waitForTabComplete(tabId, timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    let timeoutId;

    const cleanup = (tab) => {
      if (done) return;
      done = true;
      clearTimeout(timeoutId);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      resolve(tab || null);
    };

    const handleUpdated = (updatedTabId, changeInfo, tab) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        cleanup(tab);
      }
    };

    chrome.tabs.onUpdated.addListener(handleUpdated);
    chrome.tabs.get(tabId).then((tab) => {
      if (tab?.status === "complete") cleanup(tab);
    }).catch(() => {});
    timeoutId = setTimeout(async () => {
      cleanup(await chrome.tabs.get(tabId).catch(() => null));
    }, timeoutMs);
  });
}
