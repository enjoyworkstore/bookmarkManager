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
    return;
  }
  if (info.menuItemId === "bookmark-shelf-pin-current") {
    bookmarkAndPinCurrentPage(tab).catch(() => {});
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
    chrome.contextMenus.create({
      id: "bookmark-shelf-pin-separator",
      type: "separator",
      contexts: ["page"],
      documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"]
    }, () => void chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: "bookmark-shelf-pin-current",
      title: "このページをブックマークして固定",
      contexts: ["page"],
      documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"]
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

  if (message?.type === "record-bookmark-open") {
    recordBookmarkOpen(message.bookmarkId).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "open-bookmark-shelf") {
    openShelf({ tab: sender?.tab, preferSidePanel: true }).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "run-bookmark-shelf-browser-action") {
    runBookmarkShelfBrowserAction(message.action, sender?.tab?.id, sender?.tab?.windowId)
      .then((ok) => sendResponse({ ok }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "get-bookmark-shelf-pinned-bookmarks") {
    getPinnedBookmarkItems()
      .then((bookmarks) => sendResponse({ ok: true, bookmarks }))
      .catch(() => sendResponse({ ok: false, bookmarks: [] }));
    return true;
  }

  if (message?.type === "open-bookmark-shelf-pinned-bookmark") {
    openPinnedBookmarkFromFloating(message, sender)
      .then((ok) => sendResponse({ ok }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  return false;
});

async function runBookmarkShelfBrowserAction(action, tabId, windowId) {
  if (!Number.isInteger(tabId)) return false;
  if (action === "back") {
    await chrome.tabs.goBack(tabId);
    return true;
  }
  if (action === "next-tab") {
    const targetWindowId = Number.isInteger(windowId)
      ? windowId
      : (await chrome.tabs.get(tabId)).windowId;
    const tabs = await chrome.tabs.query({ windowId: targetWindowId });
    if (!tabs.length) return false;
    tabs.sort((a, b) => (Number(a.index) || 0) - (Number(b.index) || 0));
    const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
    const nextTab = tabs[(currentIndex >= 0 ? currentIndex + 1 : 0) % tabs.length];
    if (!Number.isInteger(nextTab?.id)) return false;
    await chrome.tabs.update(nextTab.id, { active: true });
    return true;
  }
  if (action === "minimize-window") {
    const targetWindowId = Number.isInteger(windowId)
      ? windowId
      : (await chrome.tabs.get(tabId)).windowId;
    if (!Number.isInteger(targetWindowId)) return false;
    await chrome.windows.update(targetWindowId, { state: "minimized" });
    return true;
  }
  return false;
}

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

async function recordBookmarkOpen(bookmarkId) {
  const id = String(bookmarkId || "").trim();
  if (!id) return;
  const result = await chrome.storage.local.get(STORAGE_KEY).catch(() => ({}));
  const currentState = result[STORAGE_KEY] || {};
  const usage = currentState.usage && typeof currentState.usage === "object" ? currentState.usage : {};
  const currentUsage = usage[id] || {};
  const nextState = {
    ...currentState,
    usage: {
      ...usage,
      [id]: {
        count: (Number(currentUsage.count) || 0) + 1,
        lastOpenedAt: Date.now()
      }
    }
  };
  await chrome.storage.local.set({ [STORAGE_KEY]: nextState });
  cachedState = nextState;
}

async function getPinnedBookmarkItems() {
  const state = await getShelfState();
  const pinned = state.pinned && typeof state.pinned === "object" ? state.pinned : {};
  const pinnedIds = Object.keys(pinned).filter((id) => pinned[id]);
  if (!pinnedIds.length) return [];

  const savedOrder = Array.isArray(state.pinnedOrder)
    ? [...new Set(state.pinnedOrder.map((id) => String(id || "").trim()).filter((id) => id && pinned[id]))]
    : [];
  const orderedIds = await getPinnedRegistrationOrder(pinned, savedOrder);
  const orderedSet = new Set(orderedIds);
  pinnedIds
    .filter((id) => !orderedSet.has(id))
    .forEach((id) => orderedIds.push(id));

  const tree = await chrome.bookmarks.getTree().catch(() => []);
  const bookmarkMap = new Map();
  const collect = (nodes) => {
    (nodes || []).forEach((node) => {
      if (node.url && pinned[node.id]) {
        bookmarkMap.set(node.id, {
          id: String(node.id),
          title: String(node.title || node.url || "Bookmark"),
          url: String(node.url || ""),
          dateAdded: Number(node.dateAdded) || 0
        });
      }
      if (node.children) collect(node.children);
    });
  };
  collect(tree);

  return orderedIds
    .map((id) => bookmarkMap.get(id))
    .filter((bookmark) => bookmark?.url);
}

async function openPinnedBookmarkFromFloating(message, sender) {
  const bookmarkId = String(message?.bookmarkId || "").trim();
  let url = String(message?.url || "").trim();
  if (bookmarkId) {
    const [bookmark] = await chrome.bookmarks.get(bookmarkId).catch(() => []);
    if (bookmark?.url) url = bookmark.url;
  }
  if (!url) return false;

  if (bookmarkId) {
    await recordBookmarkOpen(bookmarkId).catch(() => {});
  }

  const tabId = sender?.tab?.id;
  const windowId = sender?.tab?.windowId;
  const openInNewTab = !!message?.openInNewTab || !Number.isInteger(tabId);
  if (openInNewTab) {
    const createArgs = { url, active: true };
    if (Number.isInteger(windowId)) createArgs.windowId = windowId;
    await chrome.tabs.create(createArgs);
    return true;
  }

  await chrome.tabs.update(tabId, { url, active: true });
  return true;
}

async function bookmarkAndPinCurrentPage(tab) {
  const url = String(tab?.url || "").trim();
  if (!isInjectableUrl(url)) return false;

  const matches = await chrome.bookmarks.search({ url }).catch(() => []);
  let bookmark = matches.find((item) => item.url === url);
  if (!bookmark) {
    const parentId = await getDefaultBookmarkFolderId();
    const createArgs = {
      title: String(tab?.title || url).trim() || url,
      url
    };
    if (parentId) createArgs.parentId = parentId;
    bookmark = await chrome.bookmarks.create(createArgs);
  }

  const result = await chrome.storage.local.get(STORAGE_KEY).catch(() => ({}));
  const currentState = result[STORAGE_KEY] || {};
  const currentPinned = currentState.pinned && typeof currentState.pinned === "object" ? currentState.pinned : {};
  const savedPinnedOrder = Array.isArray(currentState.pinnedOrder)
    ? [...new Set(currentState.pinnedOrder.map((id) => String(id || "").trim()).filter((id) => id && currentPinned[id]))]
    : [];
  const currentPinnedOrder = await getPinnedRegistrationOrder(currentPinned, savedPinnedOrder);
  if (!currentPinnedOrder.includes(bookmark.id)) currentPinnedOrder.push(bookmark.id);
  const nextState = {
    ...currentState,
    pinned: {
      ...currentPinned,
      [bookmark.id]: true
    },
    pinnedOrder: currentPinnedOrder
  };
  await chrome.storage.local.set({ [STORAGE_KEY]: nextState });
  cachedState = nextState;
  showPinnedFeedback(tab?.id).catch(() => {});
  return true;
}

async function getPinnedRegistrationOrder(pinned, savedOrder = []) {
  const order = [...savedOrder];
  const orderedIds = new Set(order);
  const missingIds = new Set(Object.keys(pinned || {}).filter((id) => pinned[id] && !orderedIds.has(id)));
  if (!missingIds.size) return order;
  const tree = await chrome.bookmarks.getTree().catch(() => []);
  const bookmarks = [];
  const collect = (nodes) => {
    (nodes || []).forEach((node) => {
      if (node.url && missingIds.has(node.id)) {
        bookmarks.push(node);
      } else if (node.children) {
        collect(node.children);
      }
    });
  };
  collect(tree);
  bookmarks
    .sort((a, b) => (Number(a.dateAdded) || 0) - (Number(b.dateAdded) || 0) || String(a.title || "").localeCompare(String(b.title || ""), "ja"))
    .forEach((item) => order.push(item.id));
  return order;
}

async function getDefaultBookmarkFolderId() {
  const tree = await chrome.bookmarks.getTree().catch(() => []);
  const folders = tree[0]?.children?.filter((node) => !node.url) || [];
  const otherFolder = folders.find((node) => node.id === "2")
    || folders.find((node) => /other bookmarks|その他のブックマーク/i.test(node.title || ""));
  return otherFolder?.id || folders[0]?.id || null;
}

async function showPinnedFeedback(tabId) {
  if (!tabId || !chrome.action?.setBadgeText) return;
  await chrome.action.setBadgeBackgroundColor({ tabId, color: "#222222" }).catch(() => {});
  await chrome.action.setBadgeText({ tabId, text: "★" }).catch(() => {});
  setTimeout(() => {
    chrome.action.setBadgeText({ tabId, text: "" }).catch(() => {});
  }, 1800);
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
