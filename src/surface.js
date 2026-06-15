(() => {
  const STORAGE_KEY = "bookmarkShelfState";
  const THEME_CACHE_KEY = "bookmarkShelfTheme";
  const root = document.documentElement;
  const requestedSurface = new URLSearchParams(location.search).get("surface");
  const pageName = location.pathname.split("/").pop();
  const surface = requestedSurface === "overlay" ? "overlay" : pageName === "sidepanel.html" ? "sidepanel" : "normal";

  root.dataset.booting = "true";
  root.dataset.surface = surface;
  setBootTheme(getCachedTheme() || getSystemTheme());

  try {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      const theme = result?.[STORAGE_KEY]?.theme;
      if (theme === "dark" || theme === "light") {
        setBootTheme(theme);
      }
    }).catch(() => {});
  } catch {
    // The cached value above is enough for the first paint when storage is not available yet.
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
    root.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_CACHE_KEY, theme);
    } catch {
      // Ignore private/storage-restricted contexts.
    }
  }
})();
