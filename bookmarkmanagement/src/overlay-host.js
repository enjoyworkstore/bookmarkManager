(() => {
  const OVERLAY_HOST_VERSION = "2026-07-11-launcher-motion-v29";
  const STORAGE_KEY = "bookmarkShelfState";
  const HOST_ID = "bookmark-shelf-overlay-host";
  const BACKDROP_ID = "bookmark-shelf-overlay-backdrop";
  const FLOATING_ID = "bookmark-shelf-floating-launcher";
  const GESTURE_DOCK_ID = "bookmark-shelf-gesture-dock";
  const OVERLAY_URL = chrome.runtime.getURL("launcher.html?surface=overlay");
  const CAPTURE_ACTIVE = { capture: true, passive: false };
  const FLOATING_GESTURE_ACTIONS = [
    { action: "back", icon: "←", label: "戻る" },
    { action: "next-tab", icon: "⇥", label: "次のタブ" },
    { action: "scroll-bottom", icon: "⇊", label: "最下部" },
    { action: "scroll-top", icon: "⇈", label: "最上部" },
    { action: "minimize-window", icon: "—", label: "最小化" }
  ];
  const FLOATING_DISPLAY_MODES = new Set(["collapsed", "pins"]);
  const FLOATING_PIN_LIST_LIMIT = 24;

  if (window.__bookmarkShelfOverlayInstalled === OVERLAY_HOST_VERSION) return;
  window.__bookmarkShelfOverlayInstalled = OVERLAY_HOST_VERSION;
  document.getElementById(FLOATING_ID)?.remove();

  const DEFAULT_FLOATING_SETTINGS = {
    floatingButtonEnabled: true,
    floatingButtonPosition: "right-center",
    floatingButtonShape: "rail",
    floatingButtonColor: "dark",
    floatingButtonSize: 46,
    floatingButtonCollapsed: false,
    floatingButtonMode: "pins",
    floatingButtonCustomPosition: null,
    floatingStateRevision: 0
  };
  const FLOATING_TOGGLE_DEBOUNCE_MS = 420;
  const FLOATING_COLLAPSE_CLICK_ZONE_PX = 58;
  const FLOATING_DRAG_THRESHOLD_PX = 6;
  const FLOATING_HIT_SLOP_PX = 28;
  const FLOATING_SIZE_MIN = 34;
  const FLOATING_SIZE_MAX = 120;
  const FLOATING_POSITIONS = new Set(["right-center", "right-top", "right-bottom", "left-center", "left-top", "left-bottom"]);
  const FLOATING_SHAPES = new Set(["rail", "tab", "button", "diamond"]);
  const FLOATING_COLORS = new Set(["dark", "light"]);
  let lastFloatingContextToggleAt = 0;
  let floatingContextMenuSuppressUntil = 0;
  let floatingContextMenuSuppressPoint = null;
  let floatingPointerState = null;
  let floatingSecondaryFallbackTimer = 0;
  let suppressNextFloatingClick = false;
  let floatingGestureDockState = null;
  let floatingPinnedDockState = null;
  let floatingPinnedLoadRequestId = 0;
  let floatingModeTransitionToken = 0;
  let currentFloatingState = { ...DEFAULT_FLOATING_SETTINGS };

  function getOverlay() {
    return document.getElementById(HOST_ID);
  }

  function getFloatingLauncher() {
    return document.getElementById(FLOATING_ID);
  }

  function removeOverlay() {
    getOverlay()?.remove();
    document.getElementById(BACKDROP_ID)?.remove();
  }

  function removeFloatingLauncher(options = {}) {
    if (!options.preserveTransition) floatingModeTransitionToken += 1;
    removeFloatingGestureDock();
    floatingPinnedDockState = null;
    floatingPinnedLoadRequestId += 1;
    getFloatingLauncher()?.remove();
  }

  function createOverlayBackdrop() {
    document.getElementById(BACKDROP_ID)?.remove();
    const backdrop = document.createElement("div");
    backdrop.id = BACKDROP_ID;
    backdrop.setAttribute("aria-hidden", "true");
    setImportantStyles(backdrop, {
      all: "initial",
      position: "fixed",
      inset: "0",
      "z-index": "2147483645",
      display: "block",
      "box-sizing": "border-box",
      background: "rgba(15, 15, 15, 0.08)",
      "backdrop-filter": "blur(4px) saturate(0.96)",
      "-webkit-backdrop-filter": "blur(4px) saturate(0.96)",
      "pointer-events": "auto"
    });
    document.documentElement.append(backdrop);
  }

  function createFloatingGestureDock(anchorRect) {
    if (floatingGestureDockState) return floatingGestureDockState;

    const host = document.createElement("div");
    host.id = GESTURE_DOCK_ID;
    host.dataset.activeAction = "";
    host.setAttribute("aria-hidden", "true");
    setImportantStyles(host, {
      all: "initial",
      position: "fixed",
      top: "0",
      left: "0",
      right: "auto",
      bottom: "auto",
      transform: "none",
      "z-index": "2147483647",
      display: "block",
      "pointer-events": "none",
      "user-select": "none",
      visibility: "hidden",
      opacity: "1"
    });

    const shadow = host.attachShadow({ mode: "closed" });
    const tray = document.createElement("div");
    setImportantStyles(tray, {
      all: "initial",
      display: "flex",
      gap: "8px",
      padding: "8px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      "border-radius": "14px",
      background: "rgba(28, 28, 28, 0.9)",
      "box-shadow": "0 14px 36px rgba(0, 0, 0, 0.32)",
      "backdrop-filter": "blur(12px)",
      "-webkit-backdrop-filter": "blur(12px)"
    });

    const targets = FLOATING_GESTURE_ACTIONS.map(({ action, icon, label }) => {
      const target = document.createElement("div");
      target.dataset.action = action;
      target.title = label;
      setImportantStyles(target, {
        all: "initial",
        width: "64px",
        height: "54px",
        display: "grid",
        "grid-template-rows": "28px 14px",
        "place-items": "center",
        "box-sizing": "border-box",
        padding: "5px 4px 4px",
        border: "1px solid #494949",
        "border-radius": "9px",
        color: "#d7d7d7",
        background: "#2a2a2a",
        "font-family": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "pointer-events": "none",
        transition: "transform 90ms ease, border-color 90ms ease, background-color 90ms ease"
      });

      const iconNode = document.createElement("span");
      iconNode.textContent = icon;
      setImportantStyles(iconNode, {
        all: "initial",
        color: "inherit",
        "font-family": "system-ui, sans-serif",
        "font-size": "23px",
        "font-weight": "400",
        "line-height": "1"
      });
      const labelNode = document.createElement("span");
      labelNode.textContent = label;
      setImportantStyles(labelNode, {
        all: "initial",
        color: "inherit",
        "font-family": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "font-size": "10px",
        "font-weight": "400",
        "line-height": "1"
      });
      target.append(iconNode, labelNode);
      tray.append(target);
      return { action, target };
    });

    shadow.append(tray);
    document.documentElement.append(host);
    positionFloatingGestureDock(host, anchorRect);
    floatingGestureDockState = { host, targets, activeAction: "" };
    return floatingGestureDockState;
  }

  function positionFloatingGestureDock(host, anchorRect) {
    const fallbackRect = getFloatingLauncher()?.getBoundingClientRect();
    const anchor = anchorRect || fallbackRect;
    if (!anchor) return;

    const dockRect = host.getBoundingClientRect();
    const edge = 10;
    const gap = 12;
    const anchorCenterX = anchor.left + anchor.width / 2;
    const placeOnLeft = anchorCenterX >= window.innerWidth / 2;
    const preferredLeft = placeOnLeft
      ? anchor.left - dockRect.width - gap
      : anchor.right + gap;
    const alternateLeft = placeOnLeft
      ? anchor.right + gap
      : anchor.left - dockRect.width - gap;
    let left = preferredLeft;
    if (left < edge || left + dockRect.width > window.innerWidth - edge) {
      left = alternateLeft;
    }
    left = Math.min(
      Math.max(edge, left),
      Math.max(edge, window.innerWidth - dockRect.width - edge)
    );
    const top = Math.min(
      Math.max(edge, anchor.top + (anchor.height - dockRect.height) / 2),
      Math.max(edge, window.innerHeight - dockRect.height - edge)
    );
    setImportantStyles(host, {
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      visibility: "visible"
    });
  }

  function updateFloatingGestureDock(clientX, clientY) {
    const dock = floatingGestureDockState || createFloatingGestureDock();
    const floatingRect = getFloatingLauncherVisualRect();
    const candidates = dock.targets.map(({ action, target }) => {
      const rect = target.getBoundingClientRect();
      const pointerInside = clientX >= rect.left - 8
        && clientX <= rect.right + 8
        && clientY >= rect.top - 8
        && clientY <= rect.bottom + 8;
      const overlapRatio = floatingRect ? getRectOverlapRatio(floatingRect, rect) : 0;
      return {
        action,
        target,
        score: pointerInside ? 2 : overlapRatio
      };
    });
    const bestCandidate = candidates.reduce(
      (best, candidate) => candidate.score > best.score ? candidate : best,
      { action: "", score: 0 }
    );
    const activeAction = bestCandidate.score >= 0.22 ? bestCandidate.action : "";
    candidates.forEach(({ action, target }) => {
      const active = action === activeAction;
      setImportantStyles(target, active ? {
        border: "1px solid #d7d7d7",
        color: "#ffffff",
        background: "#494949",
        transform: "translateY(-3px) scale(1.04)"
      } : {
        border: "1px solid #494949",
        color: "#d7d7d7",
        background: "#2a2a2a",
        transform: "none"
      });
    });
    dock.activeAction = activeAction;
    dock.host.dataset.activeAction = activeAction;
    return activeAction;
  }

  function getFloatingLauncherVisualRect() {
    const host = getFloatingLauncher();
    if (!host) return null;
    const hostRect = host.getBoundingClientRect();
    const settings = getFloatingSettings(currentFloatingState);
    const visualWidth = Math.min(hostRect.width, getFloatingBoxMetrics(settings).width);
    const alignLeft = getFloatingSide(settings.position) === "left";
    const left = alignLeft ? hostRect.left : hostRect.right - visualWidth;
    return {
      left,
      top: hostRect.top,
      right: left + visualWidth,
      bottom: hostRect.bottom,
      width: visualWidth,
      height: hostRect.height
    };
  }

  function getRectOverlapRatio(source, target) {
    const width = Math.max(0, Math.min(source.right, target.right) - Math.max(source.left, target.left));
    const height = Math.max(0, Math.min(source.bottom, target.bottom) - Math.max(source.top, target.top));
    const targetArea = Math.max(1, target.width * target.height);
    return (width * height) / targetArea;
  }

  function removeFloatingGestureDock() {
    floatingGestureDockState?.host.remove();
    floatingGestureDockState = null;
  }

  async function runFloatingBrowserAction(action) {
    if (!FLOATING_GESTURE_ACTIONS.some((item) => item.action === action)) return false;
    if (action === "scroll-top" || action === "scroll-bottom") {
      const scrollingElement = document.scrollingElement || document.documentElement;
      const top = action === "scroll-top" ? 0 : scrollingElement.scrollHeight;
      window.scrollTo({ top, left: window.scrollX, behavior: "smooth" });
      return true;
    }
    const response = await chrome.runtime.sendMessage({
      type: "run-bookmark-shelf-browser-action",
      action
    }).catch(() => null);
    return !!response?.ok;
  }

  function handleOutsidePointerDown(event) {
    const host = getOverlay();
    const launcher = getFloatingLauncher();
    if (!host || host.contains(event.target) || launcher?.contains(event.target)) return;
    removeOverlay();
  }

  function setImportantStyles(element, styles) {
    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(property, value, "important");
    });
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function getFloatingSettings(state = {}) {
    const positionValue = state.floatingButtonPosition || state.position;
    const position = FLOATING_POSITIONS.has(positionValue)
      ? positionValue
      : DEFAULT_FLOATING_SETTINGS.floatingButtonPosition;
    const rawShapeValue = state.floatingButtonShape || state.shape;
    const shapeValue = rawShapeValue === "dot" ? "diamond" : rawShapeValue;
    const shape = FLOATING_SHAPES.has(shapeValue)
      ? shapeValue
      : DEFAULT_FLOATING_SETTINGS.floatingButtonShape;
    const colorValue = state.floatingButtonColor || state.color;
    const color = FLOATING_COLORS.has(colorValue)
      ? colorValue
      : DEFAULT_FLOATING_SETTINGS.floatingButtonColor;
    const rawCollapsed = !!(state.floatingButtonCollapsed ?? state.collapsed);
    const rawMode = state.floatingButtonMode || state.mode;
    const mode = rawMode === "collapsed" || rawCollapsed
      ? "collapsed"
      : rawMode === "pins" || rawMode === "expanded"
        ? "pins"
        : DEFAULT_FLOATING_SETTINGS.floatingButtonMode;
    return {
      enabled: (state.floatingButtonEnabled ?? state.enabled) !== false,
      position,
      shape,
      color,
      size: clampNumber(state.floatingButtonSize ?? state.size, FLOATING_SIZE_MIN, FLOATING_SIZE_MAX, DEFAULT_FLOATING_SETTINGS.floatingButtonSize),
      collapsed: mode === "collapsed",
      mode,
      customPosition: getFloatingCustomPosition(state.floatingButtonCustomPosition ?? state.customPosition),
      revision: Number(state.floatingStateRevision ?? state.revision) || 0
    };
  }

  function getFloatingCustomPosition(value) {
    if (!value || typeof value !== "object") return null;
    const left = Number(value.left);
    const top = Number(value.top);
    if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
    return { left, top };
  }

  function getFloatingSide(position) {
    return position.startsWith("left") ? "left" : "right";
  }

  function clampFloatingPosition(left, top, width, height) {
    const edge = 8;
    const maxLeft = Math.max(edge, window.innerWidth - width - edge);
    const maxTop = Math.max(edge, window.innerHeight - height - edge);
    return {
      left: Math.round(Math.min(maxLeft, Math.max(edge, left))),
      top: Math.round(Math.min(maxTop, Math.max(edge, top)))
    };
  }

  function getFloatingPositionStyles(position, compactPlacement, customPosition, boxSize) {
    if (customPosition) {
      const next = clampFloatingPosition(customPosition.left, customPosition.top, boxSize.width, boxSize.height);
      return {
        top: `${next.top}px`,
        left: `${next.left}px`,
        right: "auto",
        bottom: "auto",
        transform: "none"
      };
    }

    const edge = "10px";
    const verticalEdge = "84px";
    if (!compactPlacement) {
      return { top: "48px", [getFloatingSide(position)]: edge, transform: "none" };
    }
    if (position === "left-center") {
      return { top: "50%", left: edge, transform: "translateY(-50%)" };
    }
    if (position === "left-top") {
      return { top: verticalEdge, left: edge, transform: "none" };
    }
    if (position === "left-bottom") {
      return { bottom: verticalEdge, left: edge, transform: "none" };
    }
    if (position === "right-top") {
      return { top: verticalEdge, right: edge, transform: "none" };
    }
    if (position === "right-bottom") {
      return { bottom: verticalEdge, right: edge, transform: "none" };
    }
    return { top: "50%", right: edge, transform: "translateY(-50%)" };
  }

  function getFloatingBoxMetrics(settings = {}) {
    const { size, collapsed, shape, mode } = getFloatingSettings(settings);
    if (mode === "pins") {
      const width = clampNumber(Math.round(size * 1.16), 46, 84, 54);
      const heightForClamp = Math.min(
        Math.max(180, window.innerHeight - 96),
        Math.max(180, Math.min(420, window.innerHeight - 24))
      );
      return {
        width,
        hitWidth: Math.max(width, 72),
        compactHeight: heightForClamp,
        height: `min(420px, calc(100vh - 96px))`,
        heightForClamp,
        minHeight: "180px",
        maxHeight: "min(420px, calc(100vh - 24px))"
      };
    }
    if (shape === "button" || shape === "diamond") {
      const diameter = collapsed
        ? clampNumber(Math.round(size * 0.58), 24, 64, 28)
        : clampNumber(Math.round(size * 1.1), 42, 132, 52);
      return {
        width: diameter,
        hitWidth: Math.max(diameter, 72),
        compactHeight: diameter,
        height: `${diameter}px`,
        heightForClamp: diameter,
        minHeight: `${diameter}px`,
        maxHeight: `${diameter}px`
      };
    }
    if (shape === "tab") {
      const width = collapsed
        ? clampNumber(Math.round(size * 0.72), 28, 78, 34)
        : clampNumber(Math.round(size * 1.1), 42, 132, 54);
      const expandedHeight = clampNumber(Math.round(size * 3.1), 104, 340, 142);
      const compactHeight = clampNumber(Math.round(size * 0.9), 34, 108, 42);
      const visualHeight = collapsed ? compactHeight : expandedHeight;
      return {
        width,
        hitWidth: Math.max(width, 72),
        compactHeight,
        height: `${visualHeight}px`,
        heightForClamp: visualHeight,
        minHeight: `${visualHeight}px`,
        maxHeight: `${visualHeight}px`
      };
    }
    const width = collapsed
      ? clampNumber(Math.round(size * 0.56), 24, 68, 26)
      : clampNumber(Math.round(size * 0.86), 32, 104, 40);
    const hitWidth = Math.max(width, 72);
    const compactHeight = clampNumber(Math.round(size * 0.95), 36, 114, 44);
    const height = collapsed ? `${compactHeight}px` : "calc(100vh - 96px)";
    const heightForClamp = collapsed
      ? compactHeight
      : Math.min(Math.max(220, window.innerHeight - 96), Math.max(220, window.innerHeight - 16));
    return {
      width,
      hitWidth,
      compactHeight,
      height,
      heightForClamp,
      minHeight: collapsed ? `${compactHeight}px` : "220px",
      maxHeight: collapsed ? `${compactHeight}px` : "calc(100vh - 32px)"
    };
  }

  function isFloatingCompactPlacement(settings) {
    return settings.mode === "pins" || settings.collapsed || settings.shape !== "rail";
  }

  function getFloatingButtonRadius(settings) {
    if (settings.mode === "pins") return "24px";
    if (settings.shape === "button") return "999px";
    if (settings.shape === "diamond") return "0";
    if (settings.shape === "tab") {
      return getFloatingSide(settings.position) === "left"
        ? "0 999px 999px 0"
        : "999px 0 0 999px";
    }
    return "999px";
  }

  function getFloatingColorScheme(color) {
    if (color === "light") {
      return {
        background: "rgba(255, 255, 255, 0.62)",
        hoverBackground: "rgba(255, 255, 255, 0.78)",
        border: "rgba(15, 23, 42, 0.2)",
        hoverBorder: "rgba(37, 99, 235, 0.4)",
        shadow: "0 8px 18px rgba(15, 23, 42, 0.14)",
        hoverShadow: "0 8px 18px rgba(15, 23, 42, 0.18)",
        opacity: "0.82",
        hoverOpacity: "0.9"
      };
    }
    return {
      background: "rgba(15, 23, 42, 0.94)",
      hoverBackground: "rgba(30, 41, 59, 0.98)",
      border: "rgba(148, 163, 184, 0.28)",
      hoverBorder: "rgba(96, 165, 250, 0.42)",
      shadow: "0 8px 18px rgba(0, 0, 0, 0.18)",
      hoverShadow: "0 8px 18px rgba(0, 0, 0, 0.19)",
      opacity: "0.86",
      hoverOpacity: "0.88"
    };
  }

  function getFloatingPinnedDockScheme(color) {
    if (color === "light") {
      return {
        panelBg: "transparent",
        panelBorder: "rgba(15, 23, 42, 0.28)",
        panelShadow: "none",
        itemBg: "transparent",
        itemHoverBg: "rgba(241, 245, 249, 0.96)",
        itemBorder: "transparent",
        itemHoverBorder: "transparent",
        controlBg: "rgba(255, 255, 255, 0.78)",
        controlBorder: "rgba(15, 23, 42, 0.3)",
        itemColor: "#1f2937",
        mutedColor: "#64748b"
      };
    }
    return {
      panelBg: "transparent",
      panelBorder: "rgba(226, 232, 240, 0.3)",
      panelShadow: "none",
      itemBg: "transparent",
      itemHoverBg: "rgba(51, 65, 85, 0.98)",
      itemBorder: "transparent",
      itemHoverBorder: "transparent",
      controlBg: "rgba(15, 23, 42, 0.82)",
      controlBorder: "rgba(226, 232, 240, 0.34)",
      itemColor: "#e5e7eb",
      mutedColor: "#94a3b8"
    };
  }

  function createFloatingPinnedDock(settings) {
    const scheme = getFloatingPinnedDockScheme(settings.color);
    const metrics = getFloatingBoxMetrics(settings);
    const panel = document.createElement("div");
    setImportantStyles(panel, {
      all: "initial",
      position: "absolute",
      top: "0",
      [getFloatingSide(settings.position)]: "0",
      width: `${metrics.width}px`,
      height: "100%",
      display: "flex",
      "flex-direction": "column",
      gap: "6px",
      "box-sizing": "border-box",
      padding: "4px",
      border: `1px solid ${scheme.panelBorder}`,
      "border-radius": "24px",
      background: scheme.panelBg,
      "box-shadow": scheme.panelShadow,
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none",
      color: scheme.itemColor,
      "pointer-events": "none",
      overflow: "hidden",
      cursor: "default",
      "user-select": "none",
      "-webkit-user-select": "none"
    });

    const openAction = createFloatingPinnedAction({
      kind: "open",
      icon: "☰",
      title: "ドラッグで移動・クリックで Bookmark Shelf を開く",
      scheme,
      size: Math.max(34, metrics.width - 14)
    });
    const list = document.createElement("div");
    setImportantStyles(list, {
      all: "initial",
      display: "flex",
      "flex-direction": "column",
      gap: "6px",
      "align-items": "center",
      "box-sizing": "border-box",
      overflow: "auto",
      "scrollbar-width": "none",
      "min-height": "0",
      "padding-bottom": "1px"
    });
    list.addEventListener("wheel", (event) => {
      event.stopPropagation();
    }, { capture: true, passive: true });

    panel.append(openAction.target, list);
    floatingPinnedDockState = {
      panel,
      list,
      scheme,
      openAction,
      targets: [],
      loading: true
    };
    renderFloatingPinnedStatus("…", "固定ブックマークを読み込み中");
    return panel;
  }

  function createFloatingPinnedAction({ kind, icon, title, bookmark = null, scheme, size }) {
    const framedControl = kind === "open" || kind === "back";
    const target = document.createElement("button");
    target.type = "button";
    target.title = title;
    target.setAttribute("aria-label", title);
    target.dataset.kind = kind;
    setImportantStyles(target, {
      all: "initial",
      width: `${size}px`,
      height: `${size}px`,
      display: "grid",
      "place-items": "center",
      "box-sizing": "border-box",
      border: `1px solid ${framedControl ? scheme.controlBorder : scheme.itemBorder}`,
      "border-radius": "999px",
      background: framedControl ? scheme.controlBg : scheme.itemBg,
      color: scheme.itemColor,
      cursor: "pointer",
      "pointer-events": "auto",
      padding: "0",
      margin: "0",
      overflow: "hidden",
      "font-family": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      "font-size": "15px",
      "font-weight": "400",
      "line-height": "1",
      "user-select": "none",
      "-webkit-user-select": "none",
      transition: "background-color 90ms ease, border-color 90ms ease, transform 90ms ease"
    });
    target.addEventListener("mouseenter", () => {
      setImportantStyles(target, {
        background: scheme.itemHoverBg,
        border: `1px solid ${framedControl ? scheme.controlBorder : scheme.itemHoverBorder}`,
        transform: "translateY(-1px)"
      });
    });
    target.addEventListener("mouseleave", () => {
      setImportantStyles(target, {
        background: framedControl ? scheme.controlBg : scheme.itemBg,
        border: `1px solid ${framedControl ? scheme.controlBorder : scheme.itemBorder}`,
        transform: "none"
      });
    });

    if (bookmark?.url) {
      const fallback = document.createElement("span");
      fallback.textContent = getFloatingPinnedInitial(bookmark);
      setImportantStyles(fallback, {
        all: "initial",
        display: "grid",
        "place-items": "center",
        width: "100%",
        height: "100%",
        color: scheme.itemColor,
        "font-family": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "font-size": "13px",
        "font-weight": "400",
        "line-height": "1"
      });
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.src = getFloatingPinnedFaviconUrl(bookmark.url);
      setImportantStyles(img, {
        all: "initial",
        display: "block",
        width: "22px",
        height: "22px",
        "object-fit": "contain"
      });
      img.addEventListener("error", () => {
        img.remove();
        if (!target.contains(fallback)) target.append(fallback);
      }, { once: true });
      target.append(img);
    } else {
      const label = document.createElement("span");
      label.textContent = icon;
      setImportantStyles(label, {
        all: "initial",
        color: kind === "status" ? scheme.mutedColor : scheme.itemColor,
        "font-family": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "font-size": kind === "open" ? "16px" : "14px",
        "font-weight": "400",
        "line-height": "1"
      });
      target.append(label);
    }
    return { kind, target, bookmark };
  }

  async function hydrateFloatingPinnedDock() {
    if (!floatingPinnedDockState) return;
    const requestId = ++floatingPinnedLoadRequestId;
    const response = await chrome.runtime.sendMessage({
      type: "get-bookmark-shelf-pinned-bookmarks"
    }).catch(() => null);
    if (requestId !== floatingPinnedLoadRequestId || !floatingPinnedDockState) return;
    const bookmarks = Array.isArray(response?.bookmarks) ? response.bookmarks : [];
    renderFloatingPinnedBookmarks(bookmarks);
  }

  function renderFloatingPinnedStatus(icon, title) {
    if (!floatingPinnedDockState) return;
    floatingPinnedDockState.list.replaceChildren();
    const size = Math.max(34, getFloatingBoxMetrics(currentFloatingState).width - 14);
    const status = createFloatingPinnedAction({
      kind: "status",
      icon,
      title,
      scheme: floatingPinnedDockState.scheme,
      size
    });
    status.target.style.setProperty("cursor", "default", "important");
    floatingPinnedDockState.targets = [];
    floatingPinnedDockState.list.append(status.target);
  }

  function renderFloatingPinnedBookmarks(bookmarks) {
    if (!floatingPinnedDockState) return;
    const list = floatingPinnedDockState.list;
    const scheme = floatingPinnedDockState.scheme;
    const size = Math.max(34, getFloatingBoxMetrics(currentFloatingState).width - 14);
    const items = bookmarks.slice(0, FLOATING_PIN_LIST_LIMIT);
    list.replaceChildren();
    floatingPinnedDockState.targets = [];

    if (!items.length) {
      renderFloatingPinnedStatus("☆", "固定ブックマークがありません");
      appendFloatingPinnedBackAction(size, scheme);
      return;
    }

    const targets = items.map((bookmark) => createFloatingPinnedAction({
      kind: "bookmark",
      title: bookmark.title || bookmark.url || "Bookmark",
      bookmark,
      scheme,
      size
    }));
    targets.forEach((target) => list.append(target.target));
    floatingPinnedDockState.targets = targets;

    if (bookmarks.length > items.length) {
      const more = createFloatingPinnedAction({
        kind: "open",
        icon: `+${bookmarks.length - items.length}`,
        title: "残りの固定ブックマークを Bookmark Shelf で開く",
        scheme,
        size
      });
      list.append(more.target);
      floatingPinnedDockState.targets.push(more);
    }
    appendFloatingPinnedBackAction(size, scheme);
  }

  function appendFloatingPinnedBackAction(size, scheme) {
    if (!floatingPinnedDockState) return;
    const back = createFloatingPinnedAction({
      kind: "back",
      icon: "←",
      title: "前のページに戻る",
      scheme,
      size
    });
    back.target.style.setProperty("margin-top", "4px", "important");
    floatingPinnedDockState.list.append(back.target);
    floatingPinnedDockState.targets.push(back);
  }

  function getFloatingPinnedActionAt(clientX, clientY) {
    if (!floatingPinnedDockState || !Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
    const candidates = [floatingPinnedDockState.openAction, ...floatingPinnedDockState.targets];
    return candidates.find((candidate) => {
      const rect = candidate.target.getBoundingClientRect();
      return clientX >= rect.left - 3
        && clientX <= rect.right + 3
        && clientY >= rect.top - 3
        && clientY <= rect.bottom + 3;
    }) || null;
  }

  async function openFloatingPinnedBookmark(bookmark, event) {
    if (!bookmark?.url) return;
    const response = await chrome.runtime.sendMessage({
      type: "open-bookmark-shelf-pinned-bookmark",
      bookmarkId: bookmark.id,
      url: bookmark.url,
      openInNewTab: !!(event?.ctrlKey || event?.metaKey || event?.shiftKey)
    }).catch(() => null);
    if (!response?.ok) {
      window.location.href = bookmark.url;
    }
  }

  function getFloatingPinnedFaviconUrl(url) {
    return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=64`;
  }

  function getFloatingPinnedInitial(bookmark) {
    const title = String(bookmark?.title || "").trim();
    if (title) return title.slice(0, 1).toUpperCase();
    try {
      return new URL(bookmark?.url || "").hostname.slice(0, 1).toUpperCase() || "•";
    } catch {
      return "•";
    }
  }

  function applyFloatingCollapsedInPlace(collapsed) {
    const host = getFloatingLauncher();
    if (!host) return false;
    const nextState = {
      ...currentFloatingState,
      floatingButtonCollapsed: collapsed,
      floatingButtonMode: collapsed ? "collapsed" : "pins"
    };
    const settings = getFloatingSettings(nextState);
    const metrics = getFloatingBoxMetrics(nextState);
    host.dataset.collapsed = collapsed ? "true" : "false";
    host.dataset.mode = settings.mode;
    host.dataset.shape = settings.shape;
    host.dataset.color = settings.color;
    setImportantStyles(host, {
      ...getFloatingPositionStyles(settings.position, isFloatingCompactPlacement(settings), settings.customPosition, {
        width: metrics.hitWidth,
        height: metrics.heightForClamp
      }),
      width: `${metrics.hitWidth}px`,
      height: metrics.height,
      "min-height": metrics.minHeight,
      "max-height": metrics.maxHeight
    });
    currentFloatingState = nextState;
    return true;
  }

  function createFloatingLauncher(settings = {}) {
    if (getFloatingLauncher()) return;

    const floatingSettings = getFloatingSettings(settings);
    const { position, collapsed, customPosition, mode } = floatingSettings;
    const { width, hitWidth, height, heightForClamp, minHeight, maxHeight } = getFloatingBoxMetrics(floatingSettings);
    const host = document.createElement("div");
    host.id = FLOATING_ID;
    host.dataset.collapsed = collapsed ? "true" : "false";
    host.dataset.mode = mode;
    host.dataset.shape = floatingSettings.shape;
    host.dataset.color = floatingSettings.color;
    host.dataset.dragging = "false";
    setImportantStyles(host, {
      all: "initial",
      position: "fixed",
      ...getFloatingPositionStyles(position, isFloatingCompactPlacement(floatingSettings), customPosition, { width: hitWidth, height: heightForClamp }),
      width: `${hitWidth}px`,
      height,
      "min-height": minHeight,
      "max-height": maxHeight,
      "z-index": "2147483646",
      display: "block",
      "box-sizing": "border-box",
      "pointer-events": mode === "pins" ? "none" : "auto",
      "user-select": "none",
      "-webkit-user-select": "none",
      "-webkit-touch-callout": "none",
      "touch-action": "none"
    });
    host.addEventListener("contextmenu", handleFloatingContextMenu, CAPTURE_ACTIVE);
    host.addEventListener("pointerdown", handleFloatingPointerDown, CAPTURE_ACTIVE);
    host.addEventListener("pointermove", handleFloatingPointerMove, CAPTURE_ACTIVE);
    host.addEventListener("pointerup", handleFloatingPointerUp, CAPTURE_ACTIVE);
    host.addEventListener("pointercancel", cancelFloatingPointer, CAPTURE_ACTIVE);
    host.addEventListener("mousedown", handleFloatingMouseDown, CAPTURE_ACTIVE);
    host.addEventListener("auxclick", handleFloatingAuxClick, CAPTURE_ACTIVE);
    host.addEventListener("click", handleFloatingClick, CAPTURE_ACTIVE);

    const shadow = host.attachShadow({ mode: "closed" });
    if (mode === "pins") {
      const panel = createFloatingPinnedDock(floatingSettings);
      shadow.append(panel);
      document.documentElement.append(host);
      hydrateFloatingPinnedDock().catch(() => {
        renderFloatingPinnedStatus("!", "固定ブックマークを読み込めませんでした");
      });
      return;
    }

    const button = document.createElement("div");
    const colorScheme = getFloatingColorScheme(floatingSettings.color);
    const toggleHint = "右クリックで固定一覧に切り替え";
    button.title = `Bookmark Shelf - 左クリックで開く / 右クリックで最小表示・固定一覧を切り替え / ドラッグで移動・ブラウザー操作`;
    button.setAttribute("role", "button");
    button.setAttribute("tabindex", "0");
    button.setAttribute("aria-label", `Bookmark Shelf を開く。${toggleHint}。ドラッグで位置移動、戻る、次のタブ、最下部、最上部、ブラウザ最小化ができます。`);
    setImportantStyles(button, {
      all: "initial",
      position: "absolute",
      top: "0",
      [getFloatingSide(position)]: "0",
      width: `${width}px`,
      height: "100%",
      display: "block",
      "box-sizing": "border-box",
      border: `1px solid ${colorScheme.border}`,
      "border-radius": getFloatingButtonRadius(floatingSettings),
      "clip-path": floatingSettings.shape === "diamond" ? "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" : "none",
      background: colorScheme.background,
      "box-shadow": colorScheme.shadow,
      cursor: "pointer",
      padding: "0",
      margin: "0",
      opacity: colorScheme.opacity,
      "user-select": "none",
      "-webkit-user-select": "none",
      "-webkit-touch-callout": "none",
      "touch-action": "none",
      transition: "opacity 90ms ease, background-color 90ms ease, box-shadow 90ms ease, border-color 90ms ease"
    });

    button.addEventListener("mouseenter", () => {
      button.style.setProperty("opacity", colorScheme.hoverOpacity, "important");
      button.style.setProperty("background", colorScheme.hoverBackground, "important");
      button.style.setProperty("border-color", colorScheme.hoverBorder, "important");
      button.style.setProperty("box-shadow", colorScheme.hoverShadow, "important");
    });
    button.addEventListener("mouseleave", () => {
      button.style.setProperty("opacity", colorScheme.opacity, "important");
      button.style.setProperty("background", colorScheme.background, "important");
      button.style.setProperty("border-color", colorScheme.border, "important");
      button.style.setProperty("box-shadow", colorScheme.shadow, "important");
    });
    button.addEventListener("contextmenu", handleFloatingSecondaryToggle, CAPTURE_ACTIVE);
    button.addEventListener("pointerdown", handleFloatingPointerDown, CAPTURE_ACTIVE);
    button.addEventListener("pointermove", handleFloatingPointerMove, CAPTURE_ACTIVE);
    button.addEventListener("pointerup", handleFloatingPointerUp, CAPTURE_ACTIVE);
    button.addEventListener("pointercancel", cancelFloatingPointer, CAPTURE_ACTIVE);
    button.addEventListener("mousedown", handleFloatingMouseDown, CAPTURE_ACTIVE);
    button.addEventListener("auxclick", handleFloatingAuxClick, CAPTURE_ACTIVE);
    button.addEventListener("click", handleFloatingClick, CAPTURE_ACTIVE);
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      toggleOverlay();
    });

    shadow.append(button);
    document.documentElement.append(host);
  }

  function stopFloatingEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }
  }

  function handleFloatingContextMenu(event) {
    handleFloatingSecondaryToggle(event);
  }

  function handleFloatingPointerDown(event) {
    const host = getFloatingLauncher();
    if (!host) return;
    if (isFloatingSecondaryTrigger(event)) {
      scheduleFloatingSecondaryToggle(event, "pointerdown");
      return;
    }
    if (event.button !== 0) return;

    const rect = host.getBoundingClientRect();
    floatingPointerState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      gestureEnabled: getFloatingSettings(currentFloatingState).mode !== "pins",
      moved: false
    };
    try {
      host.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture can fail on some pages; document-level event routing still covers normal clicks.
    }
    event.stopPropagation();
  }

  function handleFloatingMouseDown(event) {
    if (!isFloatingSecondaryTrigger(event)) return;
    scheduleFloatingSecondaryToggle(event, "mousedown");
  }

  function handleFloatingAuxClick(event) {
    if (!isFloatingSecondaryTrigger(event)) return;
    handleFloatingSecondaryToggle(event);
  }

  function handleFloatingPointerMove(event) {
    const host = getFloatingLauncher();
    if (!host || !floatingPointerState || floatingPointerState.pointerId !== event.pointerId) return;

    const dx = event.clientX - floatingPointerState.startX;
    const dy = event.clientY - floatingPointerState.startY;
    if (!floatingPointerState.moved && Math.hypot(dx, dy) < FLOATING_DRAG_THRESHOLD_PX) return;

    floatingPointerState.moved = true;
    if (floatingPointerState.gestureEnabled) {
      createFloatingGestureDock({
        left: floatingPointerState.left,
        top: floatingPointerState.top,
        right: floatingPointerState.left + floatingPointerState.width,
        bottom: floatingPointerState.top + floatingPointerState.height,
        width: floatingPointerState.width,
        height: floatingPointerState.height
      });
    }
    const next = clampFloatingPosition(
      floatingPointerState.left + dx,
      floatingPointerState.top + dy,
      floatingPointerState.width,
      floatingPointerState.height
    );
    host.dataset.dragging = "true";
    setImportantStyles(host, {
      top: `${next.top}px`,
      left: `${next.left}px`,
      right: "auto",
      bottom: "auto",
      transform: "none"
    });
    const activeAction = floatingPointerState.gestureEnabled
      ? updateFloatingGestureDock(event.clientX, event.clientY)
      : "";
    host.dataset.gestureAction = activeAction;
    stopFloatingEvent(event);
  }

  async function handleFloatingPointerUp(event) {
    const host = getFloatingLauncher();
    if (!host || !floatingPointerState || floatingPointerState.pointerId !== event.pointerId) return;

    const state = floatingPointerState;
    const gestureAction = state.moved && state.gestureEnabled
      ? updateFloatingGestureDock(event.clientX, event.clientY)
      : "";
    floatingPointerState = null;
    try {
      host.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore release failures from pages that interrupt pointer capture.
    }
    host.dataset.dragging = "false";
    host.dataset.gestureAction = "";
    removeFloatingGestureDock();

    if (!state.moved) return;
    suppressNextFloatingClick = true;
    stopFloatingEvent(event);
    if (gestureAction) {
      applyFloatingLauncherState(currentFloatingState);
      await runFloatingBrowserAction(gestureAction);
    } else {
      const rect = host.getBoundingClientRect();
      const next = clampFloatingPosition(rect.left, rect.top, rect.width, rect.height);
      await flushFloatingCustomPositionSave(next);
    }
    setTimeout(() => {
      suppressNextFloatingClick = false;
    }, 180);
  }

  function cancelFloatingPointer(event) {
    if (!floatingPointerState || floatingPointerState.pointerId !== event.pointerId) return;
    const moved = floatingPointerState.moved;
    floatingPointerState = null;
    const host = getFloatingLauncher();
    if (host) {
      host.dataset.dragging = "false";
      host.dataset.gestureAction = "";
    }
    removeFloatingGestureDock();
    if (moved) applyFloatingLauncherState(currentFloatingState);
  }

  function handleFloatingClick(event) {
    stopFloatingEvent(event);
    if (suppressNextFloatingClick) {
      suppressNextFloatingClick = false;
      return;
    }
    const settings = getFloatingSettings(currentFloatingState);
    if (settings.mode === "pins") {
      const action = getFloatingPinnedActionAt(event.clientX, event.clientY);
      if (action?.kind === "bookmark") {
        openFloatingPinnedBookmark(action.bookmark, event).catch(() => {});
        return;
      }
      if (action?.kind === "back") {
        runFloatingBrowserAction("back").catch(() => {});
        return;
      }
      toggleOverlay();
      return;
    }
    const host = getFloatingLauncher();
    if (host && isFloatingCollapseClick(event, host)) {
      toggleFloatingCollapsedFromDom();
      return;
    }
    toggleOverlay();
  }

  function toggleFloatingCollapsedFromDom() {
    const launcher = getFloatingLauncher();
    setFloatingDisplayMode(launcher?.dataset.collapsed === "true" ? "pins" : "collapsed", "dom");
  }

  function handleFloatingSecondaryToggle(event) {
    rememberFloatingContextMenuSuppression(event);
    stopFloatingEvent(event);
    clearFloatingSecondaryFallback();
    cycleFloatingDisplayMode(event.type);
  }

  function scheduleFloatingSecondaryToggle(event, source) {
    rememberFloatingContextMenuSuppression(event);
    stopFloatingEvent(event);
    clearFloatingSecondaryFallback();
    floatingSecondaryFallbackTimer = setTimeout(() => {
      floatingSecondaryFallbackTimer = 0;
      cycleFloatingDisplayMode(`${source}:fallback`);
    }, 120);
  }

  function clearFloatingSecondaryFallback() {
    if (!floatingSecondaryFallbackTimer) return;
    clearTimeout(floatingSecondaryFallbackTimer);
    floatingSecondaryFallbackTimer = 0;
  }

  function isFloatingSecondaryTrigger(event) {
    if (event.type === "contextmenu") return true;
    if (event.button === 2 || event.buttons === 2) return true;
    return event.ctrlKey && event.button === 0;
  }

  function rememberFloatingContextMenuSuppression(event) {
    floatingContextMenuSuppressUntil = Date.now() + 900;
    if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      floatingContextMenuSuppressPoint = { x: event.clientX, y: event.clientY };
    }
  }

  function shouldSuppressFloatingContextMenu(event, launcher) {
    if (event.type !== "contextmenu" || Date.now() > floatingContextMenuSuppressUntil) return false;
    if (isPointNearFloatingLauncher(event, launcher)) return true;
    if (!floatingContextMenuSuppressPoint || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return false;
    return Math.hypot(event.clientX - floatingContextMenuSuppressPoint.x, event.clientY - floatingContextMenuSuppressPoint.y) <= FLOATING_HIT_SLOP_PX * 2;
  }

  function toggleFloatingCollapsed(collapsed, source = "", options = {}) {
    setFloatingDisplayMode(collapsed ? "collapsed" : "pins", source, options);
  }

  function cycleFloatingDisplayMode(source = "", options = {}) {
    const mode = getFloatingSettings(currentFloatingState).mode;
    const nextMode = mode === "collapsed" ? "pins" : "collapsed";
    setFloatingDisplayMode(nextMode, source, options);
  }

  function setFloatingDisplayMode(mode, source = "", options = {}) {
    const now = Date.now();
    if (!options.bypassDebounce && now - lastFloatingContextToggleAt < FLOATING_TOGGLE_DEBOUNCE_MS) {
      return;
    }
    lastFloatingContextToggleAt = now;
    const previousMode = getFloatingSettings(currentFloatingState).mode;
    const nextMode = FLOATING_DISPLAY_MODES.has(mode) ? mode : "pins";
    if (nextMode === previousMode) return;
    const nextCollapsed = nextMode === "collapsed";
    const revision = Date.now();
    currentFloatingState = {
      ...currentFloatingState,
      floatingButtonCollapsed: nextCollapsed,
      floatingButtonMode: nextMode,
      floatingStateRevision: revision
    };
    const transitionToken = ++floatingModeTransitionToken;
    transitionFloatingDisplayMode(previousMode, nextMode, transitionToken).catch(() => {
      if (transitionToken !== floatingModeTransitionToken) return;
      removeFloatingLauncher({ preserveTransition: true });
      createFloatingLauncher(currentFloatingState);
    });
    setFloatingMode(nextMode, revision, { apply: false }).catch(() => {});
  }

  async function transitionFloatingDisplayMode(previousMode, nextMode, transitionToken) {
    const previousHost = getFloatingLauncher();
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (previousHost && !reduceMotion) {
      previousHost.style.setProperty("pointer-events", "none", "important");
      await animateFloatingModeElement(previousHost, {
        fromScale: 1,
        toScale: nextMode === "collapsed" ? 0.62 : 0.88,
        fromOpacity: 1,
        toOpacity: 0,
        duration: 120
      });
    }
    if (transitionToken !== floatingModeTransitionToken) return;

    removeFloatingLauncher({ preserveTransition: true });
    createFloatingLauncher(currentFloatingState);
    const nextHost = getFloatingLauncher();
    if (!nextHost || reduceMotion) return;

    await animateFloatingModeElement(nextHost, {
      fromScale: nextMode === "pins" ? 0.56 : 1.28,
      toScale: 1,
      fromOpacity: 0,
      toOpacity: 1,
      duration: nextMode === "pins" ? 220 : 170
    });
  }

  async function animateFloatingModeElement(element, options) {
    if (!element?.animate) return;
    const computedTransform = getComputedStyle(element).transform;
    const baseTransform = computedTransform && computedTransform !== "none" ? computedTransform : "";
    const transformAt = (scale) => `${baseTransform ? `${baseTransform} ` : ""}scale(${scale})`;
    const settings = getFloatingSettings(currentFloatingState);
    element.style.setProperty(
      "transform-origin",
      `${getFloatingSide(settings.position) === "left" ? "left" : "right"} center`,
      "important"
    );
    const animation = element.animate([
      {
        opacity: String(options.fromOpacity),
        transform: transformAt(options.fromScale),
        filter: options.fromOpacity === 0 ? "blur(3px)" : "blur(0)"
      },
      {
        opacity: String(options.toOpacity),
        transform: transformAt(options.toScale),
        filter: options.toOpacity === 0 ? "blur(3px)" : "blur(0)"
      }
    ], {
      duration: options.duration,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "none"
    });
    await animation.finished.catch(() => {});
  }

  function isFloatingCollapseClick(event, element) {
    const settings = getFloatingSettings(currentFloatingState);
    if (settings.shape !== "rail" || settings.collapsed) return false;
    const rect = element.getBoundingClientRect();
    const collapseZone = Math.min(rect.height, Math.max(FLOATING_COLLAPSE_CLICK_ZONE_PX, rect.height * 0.18));
    return event.clientY >= rect.bottom - collapseZone;
  }

  function handleGlobalFloatingSecondaryEvent(event) {
    const launcher = getFloatingLauncher();
    if (!launcher) return;
    const isLauncherEvent = isFloatingLauncherEvent(event, launcher);
    const shouldSuppressContext = shouldSuppressFloatingContextMenu(event, launcher);
    if ((!isLauncherEvent && !shouldSuppressContext) || !isFloatingSecondaryTrigger(event)) return;
    handleFloatingSecondaryToggle(event);
  }

  function isFloatingLauncherEvent(event, launcher) {
    if (event.target === launcher || launcher.contains(event.target)) return true;
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    if (path.includes(launcher)) return true;
    return isPointNearFloatingLauncher(event, launcher);
  }

  function isPointNearFloatingLauncher(event, launcher) {
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return false;
    const rect = launcher.getBoundingClientRect();
    return event.clientX >= rect.left - FLOATING_HIT_SLOP_PX
      && event.clientX <= rect.right + FLOATING_HIT_SLOP_PX
      && event.clientY >= rect.top - FLOATING_HIT_SLOP_PX
      && event.clientY <= rect.bottom + FLOATING_HIT_SLOP_PX;
  }

  async function setFloatingMode(mode, revision = Date.now(), options = {}) {
    const nextMode = FLOATING_DISPLAY_MODES.has(mode) ? mode : "pins";
    await setFloatingStatePatch({
      floatingButtonMode: nextMode,
      floatingButtonCollapsed: nextMode === "collapsed",
      floatingStateRevision: revision
    }, options);
  }

  async function setFloatingCustomPosition(position, options = {}) {
    const revision = Number(options.revision) || Date.now();
    await setFloatingStatePatch({
      floatingButtonCustomPosition: position,
      floatingStateRevision: revision
    }, options);
  }

  async function flushFloatingCustomPositionSave(position) {
    const revision = Date.now();
    currentFloatingState = {
      ...currentFloatingState,
      floatingButtonCustomPosition: position,
      floatingStateRevision: revision
    };
    await setFloatingCustomPosition(position, { apply: false, revision });
  }

  async function setFloatingStatePatch(patch, options = {}) {
    const response = await chrome.runtime.sendMessage({
      type: "patch-bookmark-shelf-state",
      patch
    }).catch(() => null);
    if (response?.ok && response.state) {
      if (options.apply !== false) {
        applyFloatingLauncherState(response.state);
      }
      return;
    }

    const result = await chrome.storage.local.get(STORAGE_KEY).catch(() => ({}));
    const currentState = result?.[STORAGE_KEY] || {};
    const nextState = { ...currentState, ...patch };
    await chrome.storage.local.set({ [STORAGE_KEY]: nextState }).catch(() => {});
    if (options.apply !== false) {
      applyFloatingLauncherState(nextState);
    }
  }

  async function toggleOverlay() {
    if (getOverlay()) {
      removeOverlay();
    } else if (currentFloatingState.launchMode === "sidepanel" && await openShelfFromBackground()) {
      return;
    } else {
      createOverlay(OVERLAY_URL);
    }
  }

  async function openShelfFromBackground() {
    const response = await chrome.runtime.sendMessage({
      type: "open-bookmark-shelf"
    }).catch(() => null);
    return !!response?.ok;
  }

  function applyFloatingLauncherState(state = {}) {
    currentFloatingState = { ...currentFloatingState, ...state };
    const settings = getFloatingSettings(currentFloatingState);
    if (!settings.enabled) {
      removeFloatingLauncher();
      return;
    }
    removeFloatingLauncher();
    createFloatingLauncher(settings);
  }

  function shouldIgnoreIncomingFloatingState(nextState = {}) {
    const currentRevision = Number(currentFloatingState.floatingStateRevision) || 0;
    const nextRevision = Number(nextState.floatingStateRevision) || 0;
    return currentRevision > 0 && nextRevision <= currentRevision;
  }

  function loadFloatingLauncherPreference() {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      applyFloatingLauncherState(result?.[STORAGE_KEY] || DEFAULT_FLOATING_SETTINGS);
    }).catch(() => {
      applyFloatingLauncherState(DEFAULT_FLOATING_SETTINGS);
    });
  }

  function createOverlay(url) {
    removeOverlay();
    createOverlayBackdrop();

    const host = document.createElement("div");
    host.id = HOST_ID;
    setImportantStyles(host, {
      all: "initial",
      position: "fixed",
      top: "18px",
      right: "18px",
      width: "min(1200px, calc(100vw - 36px))",
      height: "min(740px, calc(100vh - 36px))",
      "min-width": "min(820px, calc(100vw - 36px))",
      "min-height": "min(420px, calc(100vh - 36px))",
      "max-width": "calc(100vw - 36px)",
      "max-height": "calc(100vh - 36px)",
      "z-index": "2147483647",
      display: "block",
      "box-sizing": "border-box",
      border: "1px solid rgba(148, 163, 184, 0.38)",
      "border-radius": "10px",
      overflow: "hidden",
      resize: "both",
      "overscroll-behavior": "contain",
      isolation: "isolate",
      "box-shadow": "0 22px 70px rgba(0, 0, 0, 0.34)",
      background: "transparent",
      "background-color": "transparent",
      opacity: "1",
      visibility: "visible",
      "pointer-events": "auto"
    });
    const shadow = host.attachShadow({ mode: "closed" });

    const resizeHint = document.createElement("div");
    resizeHint.setAttribute("aria-hidden", "true");
    setImportantStyles(resizeHint, {
      all: "initial",
      position: "absolute",
      right: "4px",
      bottom: "4px",
      "z-index": "1",
      width: "16px",
      height: "16px",
      "pointer-events": "none",
      background: "linear-gradient(135deg, transparent 50%, rgba(148, 163, 184, 0.75) 50%)",
      opacity: "0.8"
    });

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.title = "Bookmark Shelf";
    iframe.allowTransparency = "true";
    setImportantStyles(iframe, {
      all: "initial",
      display: "block",
      width: "100%",
      height: "100%",
      border: "0",
      background: "transparent",
      "background-color": "transparent",
      "color-scheme": "normal",
      "overscroll-behavior": "contain"
    });

    host.addEventListener("wheel", (event) => {
      event.stopPropagation();
      if (event.target === host || event.target === resizeHint) {
        event.preventDefault();
      }
    }, { capture: true, passive: false });
    shadow.append(iframe, resizeHint);
    document.documentElement.append(host);
  }

  loadFloatingLauncherPreference();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    if (floatingPointerState?.moved) return;
    const nextState = changes[STORAGE_KEY].newValue || DEFAULT_FLOATING_SETTINGS;
    if (shouldIgnoreIncomingFloatingState(nextState)) {
      return;
    }
    applyFloatingLauncherState(nextState);
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "toggle-bookmark-shelf-overlay") {
      toggleOverlay();
      sendResponse({ ok: true });
      return true;
    }

    if (message?.type === "show-bookmark-shelf-overlay") {
      if (!getOverlay()) {
        createOverlay(message.url);
      }
      sendResponse({ ok: true });
      return true;
    }

    if (message?.type === "close-bookmark-shelf-overlay") {
      removeOverlay();
      sendResponse({ ok: true });
      return true;
    }

    return false;
  });

  window.addEventListener("message", (event) => {
    if (event.data?.type === "bookmark-shelf-close-overlay") {
      removeOverlay();
    }
  });

  window.addEventListener("pointerdown", handleGlobalFloatingSecondaryEvent, CAPTURE_ACTIVE);
  window.addEventListener("pointermove", handleFloatingPointerMove, CAPTURE_ACTIVE);
  window.addEventListener("pointerup", handleFloatingPointerUp, CAPTURE_ACTIVE);
  window.addEventListener("pointercancel", cancelFloatingPointer, CAPTURE_ACTIVE);
  window.addEventListener("contextmenu", handleGlobalFloatingSecondaryEvent, CAPTURE_ACTIVE);
  window.addEventListener("mousedown", handleGlobalFloatingSecondaryEvent, CAPTURE_ACTIVE);
  window.addEventListener("auxclick", handleGlobalFloatingSecondaryEvent, CAPTURE_ACTIVE);
  document.addEventListener("pointerdown", handleGlobalFloatingSecondaryEvent, CAPTURE_ACTIVE);
  document.addEventListener("pointermove", handleFloatingPointerMove, CAPTURE_ACTIVE);
  document.addEventListener("pointerup", handleFloatingPointerUp, CAPTURE_ACTIVE);
  document.addEventListener("pointercancel", cancelFloatingPointer, CAPTURE_ACTIVE);
  document.addEventListener("contextmenu", handleGlobalFloatingSecondaryEvent, CAPTURE_ACTIVE);
  document.addEventListener("mousedown", handleGlobalFloatingSecondaryEvent, CAPTURE_ACTIVE);
  document.addEventListener("auxclick", handleGlobalFloatingSecondaryEvent, CAPTURE_ACTIVE);
  document.addEventListener("pointerdown", handleOutsidePointerDown, CAPTURE_ACTIVE);
})();
