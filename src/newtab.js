const STORAGE_KEY = "bookmarkShelfState";
const THEME_CACHE_KEY = "bookmarkShelfTheme";
const BACKGROUND_DB_NAME = "bookmarkShelfNewtab";
const BACKGROUND_DB_VERSION = 1;
const BACKGROUND_STORE_NAME = "backgroundImages";
const MAX_BACKGROUND_IMAGES = 12;
const FREQUENT_LIMIT = 36;
const RECENT_LIMIT = 6;
const RECENT_FALLBACK_LIMIT = 24;
const SEARCH_LIMIT = 48;
const DEFAULT_OVERLAY_OPACITY = 86;
const CALENDAR_WEEKDAYS = {
  ja: ["日", "月", "火", "水", "木", "金", "土"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
};

const UI_TEXT = {
  ja: {
    searchLabel: "検索",
    searchPlaceholder: "ブックマークを検索",
    openShelf: "全体表示",
    calendar: "カレンダー",
    background: "背景",
    imageUrl: "画像URL",
    addImage: "画像を追加",
    savedImages: "保存画像",
    dimBackground: "暗くする",
    apply: "適用",
    clear: "解除",
    remove: "削除",
    selected: "選択中",
    today: "今日",
    frequent: "よく使うもの",
    searchResults: "検索結果",
    recent: "最近追加",
    empty: "まだ表示できるブックマークがありません。",
    noFrequent: "よく使うものがまだありません。最近追加されたブックマークを表示しています。"
  },
  en: {
    searchLabel: "Search",
    searchPlaceholder: "Search bookmarks",
    openShelf: "Full view",
    calendar: "Calendar",
    background: "Background",
    imageUrl: "Image URL",
    addImage: "Add image",
    savedImages: "Saved images",
    dimBackground: "Dim",
    apply: "Apply",
    clear: "Clear",
    remove: "Remove",
    selected: "Selected",
    today: "Today",
    frequent: "Frequently used",
    searchResults: "Search results",
    recent: "Recently added",
    empty: "No bookmarks to show yet.",
    noFrequent: "No frequent bookmarks yet. Showing recently added bookmarks."
  }
};

const elements = {
  time: document.querySelector("#newtabTime"),
  date: document.querySelector("#newtabDate"),
  search: document.querySelector("#newtabSearch"),
  searchLabel: document.querySelector(".newtab-search span"),
  openShelfButton: document.querySelector("#openShelfPageButton"),
  calendarToggleButton: document.querySelector("#calendarToggleButton"),
  backgroundToggleButton: document.querySelector("#backgroundToggleButton"),
  calendarPanel: document.querySelector("#calendarPanel"),
  calendarPrevButton: document.querySelector("#calendarPrevButton"),
  calendarNextButton: document.querySelector("#calendarNextButton"),
  calendarTodayButton: document.querySelector("#calendarTodayButton"),
  calendarMonth: document.querySelector("#calendarMonth"),
  calendarWeekdays: document.querySelector("#calendarWeekdays"),
  calendarGrid: document.querySelector("#calendarGrid"),
  backgroundPanel: document.querySelector("#backgroundPanel"),
  backgroundImageInput: document.querySelector("#backgroundImageInput"),
  backgroundFileInput: document.querySelector("#backgroundFileInput"),
  backgroundFileLabel: document.querySelector(".newtab-file-button span"),
  backgroundDimButton: document.querySelector("#backgroundDimButton"),
  backgroundGallery: document.querySelector("#backgroundGallery"),
  backgroundSavedHeading: document.querySelector("#backgroundSavedHeading"),
  saveBackgroundButton: document.querySelector("#saveBackgroundButton"),
  clearBackgroundButton: document.querySelector("#clearBackgroundButton"),
  backgroundInputLabel: document.querySelector(".newtab-background-input span"),
  primaryHeading: document.querySelector("#primaryHeading"),
  primaryCount: document.querySelector("#primaryCount"),
  primaryGrid: document.querySelector("#primaryGrid"),
  primaryEmpty: document.querySelector("#primaryEmpty"),
  recentSection: document.querySelector("#recentSection"),
  recentHeading: document.querySelector("#recentHeading"),
  recentCount: document.querySelector("#recentCount"),
  recentGrid: document.querySelector("#recentGrid")
};

let state = {};
let bookmarks = [];
let backgroundImages = [];
let backgroundObjectUrls = new Map();
let renderTimer = 0;
let clockTimer = 0;
let calendarCursor = new Date();

setBootTheme(getCachedTheme() || getSystemTheme());
init().catch(() => {
  elements.primaryEmpty.classList.remove("hidden");
});

async function init() {
  updateClock();
  elements.search.addEventListener("input", scheduleRender);
  elements.openShelfButton.addEventListener("click", openFullShelf);
  elements.calendarToggleButton.addEventListener("click", toggleCalendar);
  elements.backgroundToggleButton.addEventListener("click", toggleBackgroundPanel);
  elements.calendarPrevButton.addEventListener("click", () => shiftCalendarMonth(-1));
  elements.calendarNextButton.addEventListener("click", () => shiftCalendarMonth(1));
  elements.calendarTodayButton.addEventListener("click", showCurrentCalendarMonth);
  elements.saveBackgroundButton.addEventListener("click", saveBackgroundImage);
  elements.clearBackgroundButton.addEventListener("click", clearBackgroundImage);
  elements.backgroundDimButton.addEventListener("click", toggleBackgroundDim);
  elements.backgroundFileInput.addEventListener("change", handleBackgroundFileSelect);
  elements.backgroundImageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveBackgroundImage();
    }
  });
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    state = normalizeState(changes[STORAGE_KEY].newValue || {});
    applyTheme();
    applyLanguage();
    applyBackgroundImage();
    renderBackgroundGallery();
    applyCalendarVisibility();
    render();
  });

  const [stateResult, tree] = await Promise.all([
    chrome.storage.local.get(STORAGE_KEY).catch(() => ({})),
    chrome.bookmarks.getTree()
  ]);
  state = normalizeState(stateResult[STORAGE_KEY] || {});
  bookmarks = flattenBookmarkNodes(tree);
  backgroundImages = await getSavedBackgroundImages();
  applyTheme();
  applyLanguage();
  applyBackgroundImage();
  renderBackgroundGallery();
  applyCalendarVisibility();
  render();
  scheduleClockTick();
}

function normalizeState(value = {}) {
  return {
    ...value,
    usage: value.usage && typeof value.usage === "object" ? value.usage : {},
    pinned: value.pinned && typeof value.pinned === "object" ? value.pinned : {},
    frequentOrder: normalizeIdList(value.frequentOrder),
    theme: value.theme === "dark" ? "dark" : "light",
    language: value.language === "en" ? "en" : "ja",
    overlayOpacity: clampNumber(value.overlayOpacity, 45, 98, DEFAULT_OVERLAY_OPACITY),
    newtabBackgroundImage: normalizeImageUrl(value.newtabBackgroundImage),
    newtabBackgroundImageId: String(value.newtabBackgroundImageId || "").trim(),
    newtabBackgroundDimmed: !!value.newtabBackgroundDimmed,
    newtabCalendarVisible: !!value.newtabCalendarVisible
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function normalizeIdList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((id) => String(id || "").trim()).filter(Boolean))];
}

function applyLanguage() {
  document.documentElement.lang = getLanguage();
  elements.searchLabel.textContent = t("searchLabel");
  elements.search.placeholder = t("searchPlaceholder");
  elements.openShelfButton.textContent = t("openShelf");
  elements.calendarToggleButton.textContent = t("calendar");
  elements.backgroundToggleButton.textContent = t("background");
  elements.backgroundInputLabel.textContent = t("imageUrl");
  elements.backgroundFileLabel.textContent = t("addImage");
  elements.backgroundDimButton.textContent = t("dimBackground");
  elements.backgroundSavedHeading.textContent = t("savedImages");
  elements.saveBackgroundButton.textContent = t("apply");
  elements.clearBackgroundButton.textContent = t("clear");
  elements.calendarTodayButton.textContent = t("today");
  elements.recentHeading.textContent = t("recent");
  renderCalendar();
  updateClock();
}

function applyTheme() {
  setBootTheme(state.theme);
  applyNewtabVisualSettings();
}

function applyNewtabVisualSettings() {
  const isDark = state.theme === "dark";
  document.body.style.setProperty("--newtab-shell-bg", isDark ? "#10141d" : "#f7f7f5");
  document.body.style.setProperty("--newtab-panel-bg", isDark ? "rgba(16, 20, 29, 0.78)" : "rgba(247, 247, 245, 0.82)");
  document.body.style.setProperty("--newtab-card-bg", isDark ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.05)");
  document.body.style.setProperty("--newtab-card-bg-hover", isDark ? "rgba(30, 41, 59, 0.18)" : "rgba(255, 255, 255, 0.14)");
  document.body.style.setProperty("--newtab-count-bg", isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(234, 234, 234, 0.9)");
  document.body.style.setProperty("--newtab-favicon-bg", isDark ? "rgba(226, 232, 240, 0.04)" : "rgba(17, 24, 39, 0.02)");
}

function getLanguage() {
  return state.language === "en" ? "en" : "ja";
}

function t(key, vars = {}) {
  const entry = UI_TEXT[getLanguage()]?.[key] ?? UI_TEXT.ja[key] ?? key;
  return typeof entry === "function" ? entry(vars) : entry;
}

function updateClock() {
  const now = new Date();
  const language = getLanguage();
  elements.time.textContent = new Intl.DateTimeFormat(language === "ja" ? "ja-JP" : "en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(now);
  elements.time.dateTime = now.toISOString();
  elements.date.textContent = new Intl.DateTimeFormat(language === "ja" ? "ja-JP" : "en-US", {
    month: "short",
    day: "numeric",
    weekday: "short"
  }).format(now);
}

function scheduleClockTick() {
  clearTimeout(clockTimer);
  const now = new Date();
  const nextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
  clockTimer = setTimeout(() => {
    updateClock();
    scheduleClockTick();
  }, Math.max(1000, nextMinute));
}

function flattenBookmarkNodes(nodes, folderTrail = []) {
  const items = [];
  nodes.forEach((node) => {
    if (node.url) {
      items.push({
        id: node.id,
        title: node.title || node.url,
        url: node.url,
        dateAdded: Number(node.dateAdded) || 0,
        folderPath: folderTrail.join(" / ")
      });
      return;
    }
    const nextTrail = node.title ? [...folderTrail, node.title] : folderTrail;
    if (node.children?.length) {
      items.push(...flattenBookmarkNodes(node.children, nextTrail));
    }
  });
  return items;
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    renderTimer = 0;
    render();
  }, 80);
}

function render() {
  const query = elements.search.value.trim().toLowerCase();
  const recent = getRecentBookmarks();
  const fallbackRecent = getRecentBookmarks(RECENT_FALLBACK_LIMIT);
  const frequent = getFrequentBookmarks();
  const primaryItems = query
    ? searchBookmarks(query)
    : (frequent.length ? frequent.slice(0, FREQUENT_LIMIT) : fallbackRecent);
  const showingFallback = !query && !frequent.length && fallbackRecent.length;

  elements.primaryHeading.textContent = query ? t("searchResults") : t("frequent");
  elements.primaryCount.textContent = String(primaryItems.length);
  elements.primaryEmpty.textContent = showingFallback ? t("noFrequent") : t("empty");
  elements.primaryEmpty.classList.toggle("hidden", primaryItems.length > 0 && !showingFallback);
  renderGrid(elements.primaryGrid, primaryItems);

  const showRecent = !query && frequent.length > 0 && recent.length > 0;
  elements.recentSection.classList.toggle("hidden", !showRecent);
  elements.recentCount.textContent = String(recent.length);
  renderGrid(elements.recentGrid, showRecent ? recent : []);
}

function getFrequentBookmarks() {
  const orderMap = new Map(normalizeIdList(state.frequentOrder).map((id, index) => [id, index]));
  return bookmarks
    .filter((bookmark) => state.pinned[bookmark.id] || state.usage[bookmark.id]?.count)
    .sort((a, b) => compareByFrequentOrder(a, b, orderMap) || compareByUse(a, b))
    .slice(0, FREQUENT_LIMIT);
}

function getRecentBookmarks(limit = RECENT_LIMIT) {
  return [...bookmarks]
    .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0) || compareTitle(a, b))
    .slice(0, limit);
}

function searchBookmarks(query) {
  return bookmarks
    .filter((bookmark) => `${bookmark.title} ${bookmark.url} ${bookmark.folderPath}`.toLowerCase().includes(query))
    .sort(compareByUse)
    .slice(0, SEARCH_LIMIT);
}

function compareByUse(a, b) {
  const pinnedDelta = Number(!!state.pinned[b.id]) - Number(!!state.pinned[a.id]);
  if (pinnedDelta) return pinnedDelta;
  const usageDelta = (state.usage[b.id]?.count || 0) - (state.usage[a.id]?.count || 0);
  if (usageDelta) return usageDelta;
  const lastDelta = (state.usage[b.id]?.lastOpenedAt || 0) - (state.usage[a.id]?.lastOpenedAt || 0);
  if (lastDelta) return lastDelta;
  return compareTitle(a, b);
}

function compareByFrequentOrder(a, b, orderMap) {
  const aRank = orderMap.has(a.id) ? orderMap.get(a.id) : Number.POSITIVE_INFINITY;
  const bRank = orderMap.has(b.id) ? orderMap.get(b.id) : Number.POSITIVE_INFINITY;
  return aRank - bRank;
}

function compareTitle(a, b) {
  return (a.title || a.url || "").localeCompare(b.title || b.url || "", getLanguage() === "ja" ? "ja" : "en", {
    numeric: true,
    sensitivity: "base"
  });
}

function renderGrid(grid, items) {
  grid.replaceChildren(...items.map(createBookmarkLink));
}

function createBookmarkLink(bookmark) {
  const link = document.createElement("a");
  link.className = "newtab-bookmark";
  link.href = bookmark.url;
  link.title = bookmark.url;
  const host = safeHost(bookmark.url);
  link.innerHTML = `
    <span class="newtab-favicon"><img alt="" loading="lazy"></span>
    <span class="newtab-bookmark-text">
      <span class="newtab-bookmark-title"></span>
      <span class="newtab-bookmark-meta"></span>
    </span>
  `;
  link.querySelector("img").src = faviconUrl(bookmark.url);
  link.querySelector(".newtab-bookmark-title").textContent = bookmark.title || host || bookmark.url;
  link.querySelector(".newtab-bookmark-meta").textContent = host || bookmark.folderPath || bookmark.url;
  link.addEventListener("click", async (event) => {
    event.preventDefault();
    await recordBookmarkOpen(bookmark).catch(() => {});
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      await openBookmarkInNewTab(bookmark.url, !event.ctrlKey && !event.metaKey).catch(() => {});
      return;
    }
    await openBookmarkInCurrentTab(bookmark.url).catch(() => openBookmarkInNewTab(bookmark.url, true));
  });
  link.addEventListener("auxclick", (event) => {
    if (event.button !== 1) return;
    event.preventDefault();
    recordBookmarkOpen(bookmark)
      .then(() => openBookmarkInNewTab(bookmark.url, false))
      .catch(() => {});
  });
  return link;
}

async function recordBookmarkOpen(bookmark) {
  const result = await chrome.storage.local.get(STORAGE_KEY).catch(() => ({}));
  const latestState = result[STORAGE_KEY] || {};
  const latestUsage = latestState.usage && typeof latestState.usage === "object" ? latestState.usage : {};
  const current = latestUsage[bookmark.id] || {};
  const nextUsage = {
    ...latestUsage,
    [bookmark.id]: {
      count: (Number(current.count) || 0) + 1,
      lastOpenedAt: Date.now()
    }
  };
  const nextState = { ...latestState, usage: nextUsage };
  state = normalizeState(nextState);
  await chrome.storage.local.set({ [STORAGE_KEY]: nextState });
}

async function patchNewtabState(patch) {
  const result = await chrome.storage.local.get(STORAGE_KEY).catch(() => ({}));
  const latestState = result[STORAGE_KEY] || {};
  const nextState = { ...latestState, ...patch };
  state = normalizeState(nextState);
  await chrome.storage.local.set({ [STORAGE_KEY]: nextState });
}

function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/[\n\r]/.test(url)) return "";
  return url.slice(0, 2000);
}

function applyBackgroundImage() {
  const selectedImage = getSelectedBackgroundImage();
  const imageUrl = selectedImage ? getBackgroundObjectUrl(selectedImage) : normalizeImageUrl(state.newtabBackgroundImage);
  const inputValue = selectedImage ? "" : imageUrl;
  if (elements.backgroundImageInput.value !== inputValue) {
    elements.backgroundImageInput.value = inputValue;
  }
  applyNewtabVisualSettings();
  document.body.style.setProperty("--newtab-bg-image", imageUrl ? `url("${escapeCssString(imageUrl)}")` : "none");
  document.body.style.setProperty("--newtab-bg-opacity", imageUrl ? "0.48" : "0");
  document.body.style.setProperty("--newtab-bg-scrim-opacity", imageUrl && state.newtabBackgroundDimmed ? "0.28" : "0");
  elements.backgroundDimButton.setAttribute("aria-pressed", String(!!state.newtabBackgroundDimmed));
}

function getSelectedBackgroundImage() {
  if (!state.newtabBackgroundImageId) return null;
  return backgroundImages.find((image) => image.id === state.newtabBackgroundImageId) || null;
}

function getBackgroundObjectUrl(image) {
  const existingUrl = backgroundObjectUrls.get(image.id);
  if (existingUrl) return existingUrl;
  const nextUrl = URL.createObjectURL(image.blob);
  backgroundObjectUrls.set(image.id, nextUrl);
  return nextUrl;
}

function escapeCssString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toggleBackgroundPanel() {
  const isOpen = !elements.backgroundPanel.classList.contains("hidden");
  elements.backgroundPanel.classList.toggle("hidden", isOpen);
  elements.backgroundToggleButton.setAttribute("aria-pressed", String(!isOpen));
  if (!isOpen) {
    elements.backgroundImageInput.focus();
    elements.backgroundImageInput.select();
  }
}

async function saveBackgroundImage() {
  const imageUrl = normalizeImageUrl(elements.backgroundImageInput.value);
  await patchNewtabState({ newtabBackgroundImage: imageUrl, newtabBackgroundImageId: "" });
  applyBackgroundImage();
  renderBackgroundGallery();
}

async function clearBackgroundImage() {
  elements.backgroundImageInput.value = "";
  await patchNewtabState({ newtabBackgroundImage: "", newtabBackgroundImageId: "" });
  applyBackgroundImage();
  renderBackgroundGallery();
}

async function toggleBackgroundDim() {
  await patchNewtabState({ newtabBackgroundDimmed: !state.newtabBackgroundDimmed });
  applyBackgroundImage();
}

async function handleBackgroundFileSelect() {
  const file = elements.backgroundFileInput.files?.[0];
  elements.backgroundFileInput.value = "";
  if (!file || !file.type.startsWith("image/")) return;

  const image = await saveBackgroundImageFile(file);
  await trimSavedBackgroundImages(image.id);
  backgroundImages = await getSavedBackgroundImages();
  await patchNewtabState({ newtabBackgroundImage: "", newtabBackgroundImageId: image.id });
  applyBackgroundImage();
  renderBackgroundGallery();
}

async function selectSavedBackgroundImage(id) {
  if (!backgroundImages.some((image) => image.id === id)) return;
  await patchNewtabState({ newtabBackgroundImage: "", newtabBackgroundImageId: id });
  applyBackgroundImage();
  renderBackgroundGallery();
}

async function removeSavedBackgroundImage(id) {
  await deleteBackgroundImageRecord(id);
  revokeBackgroundObjectUrl(id);
  backgroundImages = await getSavedBackgroundImages();
  const patch = state.newtabBackgroundImageId === id
    ? { newtabBackgroundImageId: "", newtabBackgroundImage: "" }
    : {};
  if (Object.keys(patch).length) {
    await patchNewtabState(patch);
  }
  applyBackgroundImage();
  renderBackgroundGallery();
}

function renderBackgroundGallery() {
  if (!elements.backgroundGallery) return;
  const nodes = backgroundImages.map((image) => {
    const item = document.createElement("div");
    item.className = "newtab-background-choice-wrap";
    item.dataset.selected = image.id === state.newtabBackgroundImageId ? "true" : "false";

    const selectButton = document.createElement("button");
    selectButton.className = "newtab-background-choice";
    selectButton.type = "button";
    selectButton.title = image.name || t("savedImages");
    selectButton.setAttribute("aria-label", image.id === state.newtabBackgroundImageId ? t("selected") : t("savedImages"));
    selectButton.innerHTML = `<img alt=""><span></span>`;
    selectButton.querySelector("img").src = getBackgroundObjectUrl(image);
    selectButton.querySelector("span").textContent = image.id === state.newtabBackgroundImageId ? t("selected") : image.name || t("savedImages");
    selectButton.addEventListener("click", () => selectSavedBackgroundImage(image.id));

    const removeButton = document.createElement("button");
    removeButton.className = "newtab-background-remove";
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.title = t("remove");
    removeButton.setAttribute("aria-label", t("remove"));
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removeSavedBackgroundImage(image.id);
    });

    item.append(selectButton, removeButton);
    return item;
  });
  elements.backgroundGallery.replaceChildren(...nodes);
  elements.backgroundGallery.dataset.empty = nodes.length ? "false" : "true";
}

async function getSavedBackgroundImages() {
  const db = await openBackgroundDb().catch(() => null);
  if (!db) return [];
  try {
    const transaction = db.transaction(BACKGROUND_STORE_NAME, "readonly");
    const records = await requestToPromise(transaction.objectStore(BACKGROUND_STORE_NAME).getAll()).catch(() => []);
    return records
      .filter((record) => record?.id && record.blob instanceof Blob)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } finally {
    db.close();
  }
}

async function saveBackgroundImageFile(file) {
  const db = await openBackgroundDb();
  const now = Date.now();
  const record = {
    id: crypto.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`,
    name: file.name || "background",
    type: file.type || "image/*",
    createdAt: now,
    blob: file
  };
  try {
    const transaction = db.transaction(BACKGROUND_STORE_NAME, "readwrite");
    await requestToPromise(transaction.objectStore(BACKGROUND_STORE_NAME).put(record));
    return record;
  } finally {
    db.close();
  }
}

async function deleteBackgroundImageRecord(id) {
  const db = await openBackgroundDb().catch(() => null);
  if (!db) return;
  try {
    const transaction = db.transaction(BACKGROUND_STORE_NAME, "readwrite");
    await requestToPromise(transaction.objectStore(BACKGROUND_STORE_NAME).delete(id)).catch(() => {});
  } finally {
    db.close();
  }
}

async function trimSavedBackgroundImages(preferredId) {
  const images = await getSavedBackgroundImages();
  const excessImages = images.slice(MAX_BACKGROUND_IMAGES).filter((image) => image.id !== preferredId);
  await Promise.all(excessImages.map((image) => deleteBackgroundImageRecord(image.id)));
  excessImages.forEach((image) => revokeBackgroundObjectUrl(image.id));
}

function openBackgroundDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BACKGROUND_DB_NAME, BACKGROUND_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BACKGROUND_STORE_NAME)) {
        db.createObjectStore(BACKGROUND_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function revokeBackgroundObjectUrl(id) {
  const url = backgroundObjectUrls.get(id);
  if (!url) return;
  URL.revokeObjectURL(url);
  backgroundObjectUrls.delete(id);
}

async function toggleCalendar() {
  const nextVisible = !state.newtabCalendarVisible;
  await patchNewtabState({ newtabCalendarVisible: nextVisible });
  applyCalendarVisibility();
}

function applyCalendarVisibility() {
  elements.calendarPanel.classList.toggle("hidden", !state.newtabCalendarVisible);
  elements.calendarToggleButton.setAttribute("aria-pressed", String(state.newtabCalendarVisible));
  if (state.newtabCalendarVisible) {
    renderCalendar();
  }
}

function shiftCalendarMonth(delta) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + delta, 1);
  renderCalendar();
}

function showCurrentCalendarMonth() {
  calendarCursor = new Date();
  renderCalendar();
}

function renderCalendar() {
  if (!elements.calendarGrid || !elements.calendarWeekdays) return;
  const language = getLanguage();
  const today = new Date();
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const monthStart = new Date(year, month, 1);
  const firstDay = monthStart.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const monthLabel = new Intl.DateTimeFormat(language === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long"
  }).format(monthStart);

  elements.calendarMonth.textContent = monthLabel;
  elements.calendarWeekdays.replaceChildren(...CALENDAR_WEEKDAYS[language].map((label) => {
    const node = document.createElement("span");
    node.textContent = label;
    return node;
  }));

  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - firstDay + 1;
    const cell = document.createElement("time");
    cell.className = "newtab-calendar-day";
    let cellDate;
    if (dayOffset < 1) {
      cellDate = new Date(year, month - 1, previousMonthDays + dayOffset);
      cell.dataset.outside = "true";
    } else if (dayOffset > daysInMonth) {
      cellDate = new Date(year, month + 1, dayOffset - daysInMonth);
      cell.dataset.outside = "true";
    } else {
      cellDate = new Date(year, month, dayOffset);
    }
    cell.dateTime = formatDateInput(cellDate);
    cell.textContent = String(cellDate.getDate());
    if (isSameDate(cellDate, today)) {
      cell.dataset.today = "true";
    }
    cells.push(cell);
  }
  elements.calendarGrid.replaceChildren(...cells);
}

function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function openFullShelf() {
  location.assign(chrome.runtime.getURL("sidepanel.html"));
}

async function openBookmarkInCurrentTab(url) {
  const tab = await chrome.tabs.getCurrent().catch(() => null);
  if (!tab?.id) {
    await openBookmarkInNewTab(url, true);
    return;
  }
  await chrome.tabs.update(tab.id, { url, active: true });
}

async function openBookmarkInNewTab(url, active) {
  await chrome.tabs.create({ url, active });
}

function faviconUrl(url) {
  return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=64`;
}

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function getCachedTheme() {
  try {
    const theme = localStorage.getItem(THEME_CACHE_KEY);
    return theme === "dark" || theme === "light" ? theme : "";
  } catch {
    return "";
  }
}

function getSystemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function setBootTheme(theme) {
  document.documentElement.dataset.theme = theme === "dark" ? "dark" : "light";
  try {
    localStorage.setItem(THEME_CACHE_KEY, theme === "dark" ? "dark" : "light");
  } catch {
    // Storage can be unavailable in restricted contexts.
  }
}
