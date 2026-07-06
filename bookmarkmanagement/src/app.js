const STORAGE_KEY = "bookmarkShelfState";
const THEME_CACHE_KEY = "bookmarkShelfTheme";
const DEFAULT_CATEGORIES = ["未分類", "開発", "AI", "仕事", "資料", "動画", "買い物", "ニュース", "SNS", "あとで読む"];
const DEFAULT_CONCRETE_CATEGORY = "未分類";

const DEFAULT_STATE = {
  categories: {},
  pinned: {},
  pinnedOrder: [],
  usage: {},
  frequentOrder: [],
  customCategories: [],
  hiddenCategories: [],
  categoryOrder: [],
  selectedCategory: "all",
  requireCategorySelection: true,
  layout: "grouped",
  panelRatio: "bookmarks",
  density: "cards",
  cardWidth: 205,
  quickCollapsed: false,
  quickFull: false,
  recentCollapsed: false,
  genreCollapsed: false,
  theme: "light",
  language: "ja",
  sortMode: "registered",
  launchMode: "overlay",
  floatingButtonEnabled: true,
  floatingButtonPosition: "right-center",
  floatingButtonShape: "rail",
  floatingButtonColor: "dark",
  floatingButtonSize: 46,
  floatingButtonCollapsed: false,
  floatingButtonCustomPosition: null,
  floatingStateRevision: 0,
  savedViews: [],
  overlayOpacity: 86,
  openBehavior: "new-tab-close",
  preserveSelectedCategoryOnce: false
};

const BOOKMARK_STAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmark-star-fill bookmark-star-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5M8.16 4.1a.178.178 0 0 0-.32 0l-.634 1.285a.18.18 0 0 1-.134.098l-1.42.206a.178.178 0 0 0-.098.303L6.58 6.993c.042.041.061.1.051.158L6.39 8.565a.178.178 0 0 0 .258.187l1.27-.668a.18.18 0 0 1 .165 0l1.27.668a.178.178 0 0 0 .257-.187L9.368 7.15a.18.18 0 0 1 .05-.158l1.028-1.001a.178.178 0 0 0-.098-.303l-1.42-.206a.18.18 0 0 1-.134-.098z"/></svg>`;
const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3 trash-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/></svg>`;
const PIN_OUTLINE_ICON = `<svg class="pin-state-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5.25 3.25h9.5v13.1L10 13.45l-4.75 2.9V3.25Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
const PIN_FILLED_ICON = `<svg class="pin-state-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5.25 3.25h9.5v13.1L10 13.45l-4.75 2.9V3.25Z" fill="currentColor"/></svg>`;
const OPEN_BEHAVIOR_ORDER = ["new-tab-close", "same-tab-keep", "same-tab-close"];
const OPEN_BEHAVIOR_META = {
  "new-tab-close": { icon: "↗", labelKey: "behaviorNewTabClose" },
  "same-tab-keep": { icon: "→", labelKey: "behaviorSameTabKeep" },
  "same-tab-close": { icon: "⇥", labelKey: "behaviorSameTabClose" }
};
const TRAY_LABEL = "未整理トレイ";
const SORT_LABELS = {
  ja: {
    registered: "登録順",
    newest: "新しい順",
    name: "名前順",
    used: "よく使う順",
    site: "サイト順"
  },
  en: {
    registered: "Added order",
    newest: "Newest",
    name: "Name",
    used: "Most used",
    site: "Site"
  }
};
const SORT_MODES = new Set(Object.keys(SORT_LABELS.ja));
const LAUNCH_MODES = new Set(["sidepanel", "overlay"]);
const PANEL_RATIO_MODES = new Set(["bookmarks", "frequent"]);
const FLOATING_BUTTON_POSITIONS = new Set(["right-center", "right-top", "right-bottom", "left-center", "left-top", "left-bottom"]);
const FLOATING_BUTTON_SHAPES = new Set(["rail", "tab", "button", "diamond"]);
const FLOATING_BUTTON_COLORS = new Set(["dark", "light"]);
const FLOATING_BUTTON_SIZE_MIN = 34;
const FLOATING_BUTTON_SIZE_MAX = 120;
const FLOATING_BUTTON_POSITION_LABELS = {
  ja: {
    "right-center": "右中央",
    "right-top": "右上",
    "right-bottom": "右下",
    "left-center": "左中央",
    "left-top": "左上",
    "left-bottom": "左下"
  },
  en: {
    "right-center": "Right center",
    "right-top": "Right top",
    "right-bottom": "Right bottom",
    "left-center": "Left center",
    "left-top": "Left top",
    "left-bottom": "Left bottom"
  }
};
const FLOATING_BUTTON_SHAPE_LABELS = {
  ja: {
    rail: "縦バー",
    tab: "サイドタブ",
    button: "丸ボタン",
    diamond: "ひし形ボタン"
  },
  en: {
    rail: "Rail",
    tab: "Side tab",
    button: "Round button",
    diamond: "Diamond button"
  }
};
const FLOATING_BUTTON_COLOR_LABELS = {
  ja: {
    dark: "標準（現在の色）",
    light: "白透明"
  },
  en: {
    dark: "Default dark",
    light: "Translucent white"
  }
};
const LINK_CHECK_CONCURRENCY = 5;
const LINK_CHECK_TIMEOUT_MS = 9000;
const RECENT_BOOKMARK_LIMIT = 12;
const SAVED_VIEW_LIMIT = 12;
const DEFERRED_PINNED_LIMIT = 16;
const SECTION_PAGE_SIZE = 50;
const INITIAL_SECTION_PAGE_SIZE = 12;
const CARD_RENDER_CHUNK_SIZE = 8;
const LIGHTWEIGHT_SECTION_PAGE_SIZE = 100;
const LIGHTWEIGHT_INITIAL_SECTION_PAGE_SIZE = 48;
const LIGHTWEIGHT_CARD_RENDER_CHUNK_SIZE = 28;
const RENDER_DEBOUNCE_MS = 120;
const SAVE_DEBOUNCE_MS = 220;
const RENDER_CACHE_LIMIT = 48;
const REQUESTED_SURFACE = new URLSearchParams(location.search).get("surface");
const PAGE_NAME = location.pathname.split("/").pop();
const SURFACE = REQUESTED_SURFACE === "overlay" ? "overlay" : PAGE_NAME === "sidepanel.html" ? "sidepanel" : "normal";
const CATEGORY_DISPLAY_LABELS = {
  "未分類": { en: "Uncategorized" },
  "開発": { en: "Development" },
  "AI": { en: "AI" },
  "仕事": { en: "Work" },
  "資料": { en: "Reference" },
  "動画": { en: "Video" },
  "買い物": { en: "Shopping" },
  "ニュース": { en: "News" },
  "SNS": { en: "Social" },
  "あとで読む": { en: "Read later" }
};
const UI_TEXT = {
  ja: {
    loading: "ブックマークを読み込み中",
    openFull: "大きな画面で開く",
    batchMode: "一括選択モード",
    trayMode: "未整理トレイ",
    trayLabel: "未整理トレイ",
    organizeSession: "整理セッション",
    domainMove: "ドメイン別まとめ移動",
    undoDefault: "操作取り消し",
    deleteMode: "削除モード",
    checkLinks: "表示中のリンク切れを確認",
    checkingLinks: "リンク確認中",
    openBehavior: "開き方",
    behaviorNewTabClose: "新しいタブで開いて画面を閉じる",
    behaviorSameTabKeep: "現在のタブで開く（画面維持）",
    behaviorSameTabClose: "現在のタブで開いて画面を閉じる",
    settings: "設定",
    switchToLight: "ライトモードに切り替え",
    switchToDark: "ダークモードに切り替え",
    switchLanguage: "Englishに切り替え",
    refresh: "再読み込み",
    displaySettings: "表示設定",
    searchPlaceholder: "名前、URL、ジャンルで絞り込み",
    sort: "並び順",
    grouped: "ジャンル別",
    list: "一覧表示",
    panelRatio: "表示比率",
    bookmarkPriority: "ブックマーク一覧を広く表示",
    frequentPriority: "よく使うものを広く表示",
    cards: "アイコン一覧表示",
    compact: "名前だけの簡易表示",
    savedViews: "保存済みビュー",
    saveCurrentView: "現在のビューを保存",
    deleteSavedView: "保存済みビューを削除",
    savedViewPrompt: "保存するビュー名",
    savedViewDefault: "マイビュー",
    batchActions: "一括操作",
    selectedCount: ({ count }) => `${count}件選択中`,
    batchDestination: "移動先ジャンル",
    selectVisible: "表示中をすべて選択",
    clearSelection: "選択解除",
    moveSelected: "選択分をジャンル移動",
    pinSelected: "選択分を固定",
    unpinSelected: "選択分の固定解除",
    deleteSelected: "選択分を削除",
    frequentHeading: "よく使うもの",
    quickFull: "よく使うものをフル表示",
    collapseFrequent: "よく使うものを折りたたむ",
    expandFrequent: "よく使うものを表示",
    clearUsage: "履歴リセット",
    recentHeading: "最近追加",
    collapseRecent: "最近追加を折りたたむ",
    expandRecent: "最近追加を表示",
    genresHeading: "ジャンル",
    collapseGenres: "ジャンルを折りたたむ",
    expandGenres: "ジャンルを表示",
    manageGenres: "ジャンル編集",
    showUnsorted: "未分類を表示",
    editBookmark: "ブックマーク編集",
    close: "閉じる",
    name: "名前",
    category: "ジャンル",
    pinFrequent: "よく使うものに固定",
    delete: "削除",
    cancel: "キャンセル",
    save: "保存",
    editGenres: "ジャンル編集",
    newGenrePlaceholder: "新しいジャンル",
    add: "追加",
    settingsHeading: "設定",
    settingsNote: "設定は基本的にすぐ反映されます。フローティング起動ボタンは左クリックで開き、右クリックで縮小表示を切り替え、ドラッグで位置を動かせます。フローティングボタンが出ない既存タブはページを再読み込みしてください。brave:// などの内部ページには表示できません。",
    cardWidth: "カード幅",
    requireCategorySelection: "ジャンル選択まで一覧を表示しない",
    launchMode: "起動方法",
    launchSidepanel: "サイドバー",
    launchOverlay: "サイト上に重ねる",
    floatingButton: "フローティング起動ボタンを表示",
    floatingButtonCollapsed: "フローティング起動ボタンを縮小表示",
    floatingButtonPosition: "フローティングボタン位置",
    floatingButtonShape: "フローティングボタン形状",
    floatingButtonColor: "起動バー色",
    floatingButtonSize: "フローティングボタンサイズ",
    overlayOpacity: "パネル・カード・入力欄の不透明度",
    organizeHeading: "整理セッション",
    open: "開く",
    next: "次へ",
    domainMoveHeading: "ドメイン別まとめ移動",
    all: "すべて",
    root: "ルート",
    uncategorized: "未分類",
    unknown: "不明",
    count: ({ count }) => `${count}件`,
    bookmarksStats: ({ total, visible }) => `${total}件のブックマーク / 表示中 ${visible}件`,
    trayStats: ({ visible, total }) => `未整理トレイ ${visible}件 / 全${total}件`,
    linkCheckingSummary: ({ checked, total }) => `リンク確認中 ${checked}/${total}件`,
    linkBrokenSummary: ({ broken }) => `リンク切れ候補 ${broken}件`,
    linkBrokenUnknownSummary: ({ broken, unknown }) => `リンク切れ候補 ${broken}件 / 要確認 ${unknown}件`,
    linkCheckingTag: "確認中",
    linkCheckingDetail: "リンク先を確認しています",
    linkUnknownTag: "要確認",
    linkUnknownProtocol: "http/https 以外のリンクです",
    linkBrokenTag: "リンク切れ候補",
    linkOkTag: "リンク正常",
    linkOpaque: "ブラウザの制限で応答内容を読めませんでした",
    linkNoStatus: "応答状態を取得できませんでした",
    linkTimeout: "確認がタイムアウトしました",
    linkConnectError: "リンク先に接続できませんでした",
    noHistory: "まだ履歴がありません。よく開くブックマークはここに表示されます。",
    noRecent: "最近追加されたブックマークがありません。",
    noBookmarks: "条件に合うブックマークがありません。",
    selectGenrePrompt: "ジャンルを選ぶと、ブックマーク一覧を表示します。",
    listTitle: ({ sort }) => `${sort}一覧`,
    searchResultsTitle: "検索結果",
    partialCount: ({ shown, total }) => `${shown}/${total}件`,
    showMore: ({ count, remaining }) => `さらに${count}件表示（残り${remaining}件）`,
    select: "選択",
    pin: "固定",
    unpin: "固定解除",
    edit: "編集",
    categoryMoveUndo: "ジャンル移動を取り消す",
    deleteUndo: "削除を取り消す",
    pinUndo: "固定を取り消す",
    unpinUndo: "固定解除を取り消す",
    deleteSelectedConfirm: ({ count }) => `${count}件のブックマークを削除しますか？`,
    deleteBookmarkConfirm: ({ title }) => `このブックマークを削除しますか？\n${title}`,
    deleteTargetsConfirm: ({ count }) => `${count}件のブックマークを削除しますか？`,
    duplicateUrl: "重複URL",
    domainSuggested: ({ category }) => `候補: ${category}`,
    noDomainGroups: "現在の表示内にまとめ移動できるドメインはありません。",
    selectDomain: "このドメインを選択",
    moveDomain: "このドメインをまとめて移動",
    noOrganize: "整理できるブックマークがありません。",
    organizeDone: "整理セッションは完了です。",
    noOrganizeItems: "処理するブックマークがなくなりました。",
    deleteGenreConfirm: ({ name }) => `ジャンル「${name}」を削除して、含まれるブックマークを未分類へ移しますか？`
  },
  en: {
    loading: "Loading bookmarks",
    openFull: "Open in a large window",
    batchMode: "Batch select mode",
    trayMode: "Cleanup tray",
    trayLabel: "Cleanup tray",
    organizeSession: "Organize session",
    domainMove: "Move by domain",
    undoDefault: "Undo last action",
    deleteMode: "Delete mode",
    checkLinks: "Check visible links",
    checkingLinks: "Checking links",
    openBehavior: "Open behavior",
    behaviorNewTabClose: "Open in new tab and close this view",
    behaviorSameTabKeep: "Open in current tab and keep this view",
    behaviorSameTabClose: "Open in current tab and close this view",
    settings: "Settings",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
    switchLanguage: "Switch to Japanese",
    refresh: "Reload",
    displaySettings: "Display settings",
    searchPlaceholder: "Filter by name, URL, or genre",
    sort: "Sort order",
    grouped: "Group by genre",
    list: "List view",
    panelRatio: "Panel ratio",
    bookmarkPriority: "Show bookmark list wider",
    frequentPriority: "Show frequently used wider",
    cards: "Icon card view",
    compact: "Name-only view",
    savedViews: "Saved views",
    saveCurrentView: "Save current view",
    deleteSavedView: "Delete saved view",
    savedViewPrompt: "Saved view name",
    savedViewDefault: "My view",
    batchActions: "Batch actions",
    selectedCount: ({ count }) => `${count} selected`,
    batchDestination: "Destination genre",
    selectVisible: "Select all visible",
    clearSelection: "Clear selection",
    moveSelected: "Move selected to genre",
    pinSelected: "Pin selected",
    unpinSelected: "Unpin selected",
    deleteSelected: "Delete selected",
    frequentHeading: "Frequently used",
    quickFull: "Show frequently used full screen",
    collapseFrequent: "Collapse frequently used",
    expandFrequent: "Show frequently used",
    clearUsage: "Reset history",
    recentHeading: "Recently added",
    collapseRecent: "Collapse recently added",
    expandRecent: "Show recently added",
    genresHeading: "Genres",
    collapseGenres: "Collapse genres",
    expandGenres: "Show genres",
    manageGenres: "Edit genres",
    showUnsorted: "Show uncategorized",
    editBookmark: "Edit bookmark",
    close: "Close",
    name: "Name",
    category: "Genre",
    pinFrequent: "Pin to frequently used",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    editGenres: "Edit genres",
    newGenrePlaceholder: "New genre",
    add: "Add",
    settingsHeading: "Settings",
    settingsNote: "Most settings apply immediately. Left-click the floating launcher to open it, right-click to switch compact display, and drag it to move its position. Reload existing tabs if the floating button does not appear. Browser internal pages such as brave:// cannot show it.",
    cardWidth: "Card width",
    requireCategorySelection: "Hide bookmark list until a genre is selected",
    launchMode: "Launch mode",
    launchSidepanel: "Side panel",
    launchOverlay: "Overlay on site",
    floatingButton: "Show floating launch button",
    floatingButtonCollapsed: "Show floating launcher compact",
    floatingButtonPosition: "Floating button position",
    floatingButtonShape: "Floating button shape",
    floatingButtonColor: "Launcher bar color",
    floatingButtonSize: "Floating button size",
    overlayOpacity: "Panel, card, and control opacity",
    organizeHeading: "Organize session",
    open: "Open",
    next: "Next",
    domainMoveHeading: "Move by domain",
    all: "All",
    root: "Root",
    uncategorized: "Uncategorized",
    unknown: "Unknown",
    count: ({ count }) => `${count}`,
    bookmarksStats: ({ total, visible }) => `${total} bookmarks / ${visible} visible`,
    trayStats: ({ visible, total }) => `Cleanup tray ${visible} / ${total}`,
    linkCheckingSummary: ({ checked, total }) => `Checking links ${checked}/${total}`,
    linkBrokenSummary: ({ broken }) => `${broken} broken candidates`,
    linkBrokenUnknownSummary: ({ broken, unknown }) => `${broken} broken candidates / ${unknown} needs review`,
    linkCheckingTag: "Checking",
    linkCheckingDetail: "Checking this link",
    linkUnknownTag: "Review",
    linkUnknownProtocol: "This is not an http/https link",
    linkBrokenTag: "Broken candidate",
    linkOkTag: "OK",
    linkOpaque: "The browser blocked reading the response",
    linkNoStatus: "Could not read the response status",
    linkTimeout: "The check timed out",
    linkConnectError: "Could not connect to the link",
    noHistory: "No history yet. Frequently opened bookmarks will appear here.",
    noRecent: "No recently added bookmarks yet.",
    noBookmarks: "No bookmarks match the current filters.",
    selectGenrePrompt: "Choose a genre to show the bookmark list.",
    listTitle: ({ sort }) => `${sort} list`,
    searchResultsTitle: "Search results",
    partialCount: ({ shown, total }) => `${shown}/${total}`,
    showMore: ({ count, remaining }) => `Show ${count} more (${remaining} left)`,
    select: "Select",
    pin: "Pin",
    unpin: "Unpin",
    edit: "Edit",
    categoryMoveUndo: "Undo genre move",
    deleteUndo: "Undo delete",
    pinUndo: "Undo pin",
    unpinUndo: "Undo unpin",
    deleteSelectedConfirm: ({ count }) => `Delete ${count} bookmarks?`,
    deleteBookmarkConfirm: ({ title }) => `Delete this bookmark?\n${title}`,
    deleteTargetsConfirm: ({ count }) => `Delete ${count} bookmarks?`,
    duplicateUrl: "Duplicate URL",
    domainSuggested: ({ category }) => `Suggestion: ${category}`,
    noDomainGroups: "There are no domains to move together in the current view.",
    selectDomain: "Select this domain",
    moveDomain: "Move this domain together",
    noOrganize: "There are no bookmarks to organize.",
    organizeDone: "The organize session is complete.",
    noOrganizeItems: "There are no bookmarks left to process.",
    deleteGenreConfirm: ({ name }) => `Delete genre "${name}" and move its bookmarks to Uncategorized?`
  }
};

const elements = {
  app: document.querySelector("#app"),
  statsText: document.querySelector("#statsText"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),
  groupedViewButton: document.querySelector("#groupedViewButton"),
  listViewButton: document.querySelector("#listViewButton"),
  cardDensityButton: document.querySelector("#cardDensityButton"),
  compactDensityButton: document.querySelector("#compactDensityButton"),
  savedViewSelect: document.querySelector("#savedViewSelect"),
  saveViewButton: document.querySelector("#saveViewButton"),
  deleteViewButton: document.querySelector("#deleteViewButton"),
  cardSizeInput: document.querySelector("#cardSizeInput"),
  settingsButton: document.querySelector("#settingsButton"),
  batchModeButton: document.querySelector("#batchModeButton"),
  trayModeButton: document.querySelector("#trayModeButton"),
  organizeSessionButton: document.querySelector("#organizeSessionButton"),
  domainMoveButton: document.querySelector("#domainMoveButton"),
  undoButton: document.querySelector("#undoButton"),
  checkLinksButton: document.querySelector("#checkLinksButton"),
  batchBar: document.querySelector("#batchBar"),
  selectedCountText: document.querySelector("#selectedCountText"),
  batchCategorySelect: document.querySelector("#batchCategorySelect"),
  selectVisibleButton: document.querySelector("#selectVisibleButton"),
  clearSelectionButton: document.querySelector("#clearSelectionButton"),
  batchMoveButton: document.querySelector("#batchMoveButton"),
  batchPinButton: document.querySelector("#batchPinButton"),
  batchUnpinButton: document.querySelector("#batchUnpinButton"),
  batchDeleteButton: document.querySelector("#batchDeleteButton"),
  quickFullButton: document.querySelector("#quickFullButton"),
  toggleQuickButton: document.querySelector("#toggleQuickButton"),
  toggleRecentButton: document.querySelector("#toggleRecentButton"),
  toggleGenreButton: document.querySelector("#toggleGenreButton"),
  frequentList: document.querySelector("#frequentList"),
  recentList: document.querySelector("#recentList"),
  genreList: document.querySelector("#genreList"),
  bookmarkSections: document.querySelector("#bookmarkSections"),
  refreshButton: document.querySelector("#refreshButton"),
  openFullButton: document.querySelector("#openFullButton"),
  deleteModeButton: document.querySelector("#deleteModeButton"),
  openBehaviorButton: document.querySelector("#openBehaviorButton"),
  themeToggleButton: document.querySelector("#themeToggleButton"),
  languageToggleButton: document.querySelector("#languageToggleButton"),
  overlayCloseButton: document.querySelector("#overlayCloseButton"),
  clearUsageButton: document.querySelector("#clearUsageButton"),
  showUnsortedButton: document.querySelector("#showUnsortedButton"),
  manageGenresButton: document.querySelector("#manageGenresButton"),
  genreDialog: document.querySelector("#genreDialog"),
  settingsDialog: document.querySelector("#settingsDialog"),
  settingsNote: document.querySelector("#settingsNote"),
  newGenreInput: document.querySelector("#newGenreInput"),
  addGenreButton: document.querySelector("#addGenreButton"),
  genreEditorList: document.querySelector("#genreEditorList"),
  organizeDialog: document.querySelector("#organizeDialog"),
  organizeProgress: document.querySelector("#organizeProgress"),
  organizeCard: document.querySelector("#organizeCard"),
  organizeCategoryList: document.querySelector("#organizeCategoryList"),
  organizeDeleteButton: document.querySelector("#organizeDeleteButton"),
  organizeOpenButton: document.querySelector("#organizeOpenButton"),
  organizeSkipButton: document.querySelector("#organizeSkipButton"),
  domainDialog: document.querySelector("#domainDialog"),
  domainGroupList: document.querySelector("#domainGroupList"),
  editDialog: document.querySelector("#editDialog"),
  editId: document.querySelector("#editId"),
  editTitle: document.querySelector("#editTitle"),
  editUrl: document.querySelector("#editUrl"),
  editCategory: document.querySelector("#editCategory"),
  editPinned: document.querySelector("#editPinned"),
  launchModeSelect: document.querySelector("#launchModeSelect"),
  floatingButtonEnabled: document.querySelector("#floatingButtonEnabled"),
  floatingButtonCollapsed: document.querySelector("#floatingButtonCollapsed"),
  floatingButtonPosition: document.querySelector("#floatingButtonPosition"),
  floatingButtonShape: document.querySelector("#floatingButtonShape"),
  floatingButtonColor: document.querySelector("#floatingButtonColor"),
  floatingButtonSize: document.querySelector("#floatingButtonSize"),
  overlayOpacityInput: document.querySelector("#overlayOpacityInput"),
  overlayOpacityValue: document.querySelector("#overlayOpacityValue"),
  requireCategorySelection: document.querySelector("#requireCategorySelection"),
  categoryOptions: document.querySelector("#categoryOptions"),
  saveButton: document.querySelector("#saveButton"),
  deleteButton: document.querySelector("#deleteButton")
};

let state = structuredClone(DEFAULT_STATE);
let bookmarks = [];
let deleteMode = false;
let dragBookmarkId = null;
let dragCategoryName = null;
let frequentDragTargetId = null;
let batchMode = false;
let batchTargetCategory = "";
let trayMode = false;
let activeSavedViewId = "";
let selectedIds = new Set();
let undoEntry = null;
let organizeQueue = [];
let organizeIndex = 0;
let duplicateUrlSet = new Set();
let linkStatuses = new Map();
let linkCheckRunning = false;
let tooltipNode = null;
let tooltipTarget = null;
let sectionVisibleLimits = new Map();
let stateLoaded = false;
let renderGeneration = 0;
let bookmarksRevision = 0;
let categoryRevision = 0;
let usageRevision = 0;
let appliedLanguage = "";
let initialRenderLimited = true;
let initialExpansionQueued = false;
let renderDebounceTimer = 0;
let saveDebounceTimer = 0;
let stateNeedsPersistAfterLoad = false;
let floatingDirtyFields = new Set();
let categoryDirtyFields = new Set();
let usageStateDirty = false;
let lazyFaviconObserver = null;
let quickStackDeferred = false;
let quickStackHydrationTimer = 0;
let hostCache = new Map();
let normalizedUrlCache = new Map();
let duplicateUrlSetCache = null;
let renderDataCache = new Map();

applySurfaceChrome({ includeTheme: false });

function getLanguage() {
  return state.language === "en" ? "en" : "ja";
}

function t(key, vars = {}) {
  const entry = UI_TEXT[getLanguage()]?.[key] ?? UI_TEXT.ja[key] ?? key;
  return typeof entry === "function" ? entry(vars) : entry;
}

function getSortLabels() {
  return SORT_LABELS[getLanguage()] || SORT_LABELS.ja;
}

function getSortLabel(mode) {
  const labels = getSortLabels();
  return labels[mode] || labels.registered;
}

function displayCategoryName(name) {
  if (getLanguage() === "ja") return name;
  return CATEGORY_DISPLAY_LABELS[name]?.en || name;
}

function setControlLabel(element, text) {
  if (!element) return;
  if (element.dataset.tooltip) {
    element.dataset.tooltip = text;
  } else {
    element.setAttribute("title", text);
  }
  element.setAttribute("aria-label", text);
}

function setBookmarkStarIcon(element) {
  if (!element || element.dataset.icon === "bookmark-star") return;
  element.innerHTML = BOOKMARK_STAR_ICON;
  element.dataset.icon = "bookmark-star";
}

function setPinStateIcon(element, pinned) {
  if (!element) return;
  element.innerHTML = pinned ? PIN_FILLED_ICON : PIN_OUTLINE_ICON;
  element.dataset.icon = pinned ? "pin-filled" : "pin-outline";
}

function setTrashIcon(element) {
  if (!element || element.dataset.icon === "trash") return;
  element.innerHTML = TRASH_ICON;
  element.dataset.icon = "trash";
}

function setDragUi(type = "") {
  if (!elements.app) return;
  if (type) {
    elements.app.dataset.draggingType = type;
  } else {
    delete elements.app.dataset.draggingType;
  }
}

function setDropTarget(element, active) {
  if (!element) return;
  if (active) {
    element.dataset.dropTarget = "true";
  } else {
    delete element.dataset.dropTarget;
  }
}

function clearDropTargets() {
  document.querySelectorAll("[data-drop-target]").forEach((element) => delete element.dataset.dropTarget);
}

function endDragUi() {
  setDragUi("");
  clearDropTargets();
}

function setLabelText(input, text) {
  const label = input?.closest("label");
  const textNode = [...(label?.childNodes || [])].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = text;
}

function applySurfaceChrome({ includeTheme = stateLoaded } = {}) {
  const isOverlay = SURFACE === "overlay";
  document.documentElement.dataset.surface = SURFACE;
  document.body.classList.toggle("overlay-shell", isOverlay);
  if (elements.app) elements.app.dataset.surface = SURFACE;
  if (includeTheme) {
    const theme = state.theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    cacheThemePreference(theme);
  }
}

function cacheThemePreference(theme) {
  try {
    localStorage.setItem(THEME_CACHE_KEY, theme);
  } catch {
    // The extension still works if localStorage is unavailable.
  }
}

function markAppReady() {
  requestAnimationFrame(() => {
    document.documentElement.dataset.ready = "true";
    delete document.documentElement.dataset.booting;
  });
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function runWhenIdle(callback, timeout = 180) {
  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  return setTimeout(callback, Math.min(timeout, 80));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cancelIdleTask(handle) {
  if (!handle) return;
  if ("cancelIdleCallback" in window) {
    window.cancelIdleCallback(handle);
    return;
  }
  clearTimeout(handle);
}

async function animateShelfClose() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
  document.documentElement.dataset.closing = "true";
  await wait(120);
}

function scheduleRender(delay = RENDER_DEBOUNCE_MS) {
  clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(() => {
    renderDebounceTimer = 0;
    render();
  }, delay);
}

function scheduleSaveState(delay = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    saveDebounceTimer = 0;
    saveState().catch(() => {});
  }, delay);
}

function scheduleQuickStackHydration(delay = 420) {
  cancelIdleTask(quickStackHydrationTimer);
  quickStackHydrationTimer = runWhenIdle(() => {
    quickStackHydrationTimer = 0;
    if (!quickStackDeferred || shouldDeferQuickStack()) return;
    render({ preserveScroll: true });
  }, delay);
}

function markFloatingSettingsDirty(...fields) {
  fields.forEach((field) => floatingDirtyFields.add(field));
}

function markCategoryStateDirty(...fields) {
  fields.forEach((field) => categoryDirtyFields.add(field));
  categoryRevision += 1;
  clearRenderDataCache();
}

function markUsageStateDirty() {
  usageStateDirty = true;
  usageRevision += 1;
  clearRenderDataCache();
}

function normalizeIdList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((id) => String(id || "").trim()).filter(Boolean))];
}

function normalizeFloatingButtonShape(value) {
  if (value === "dot") return "diamond";
  return FLOATING_BUTTON_SHAPES.has(value) ? value : DEFAULT_STATE.floatingButtonShape;
}

function normalizeFloatingButtonColor(value) {
  return FLOATING_BUTTON_COLORS.has(value) ? value : DEFAULT_STATE.floatingButtonColor;
}

function clearRenderDataCache() {
  renderDataCache.clear();
  duplicateUrlSetCache = null;
}

function getCachedRenderData(key, factory) {
  if (renderDataCache.has(key)) return renderDataCache.get(key);
  const value = factory();
  renderDataCache.set(key, value);
  if (renderDataCache.size > RENDER_CACHE_LIMIT) {
    renderDataCache.clear();
    renderDataCache.set(key, value);
  }
  return value;
}

function scheduleInitialRenderExpansion() {
  if (shouldDeferQuickStack()) return;
  if (!initialRenderLimited || initialExpansionQueued) return;
  initialExpansionQueued = true;
  runWhenIdle(() => {
    initialRenderLimited = false;
    initialExpansionQueued = false;
    render({ preserveScroll: true });
  }, 900);
}

init();

async function init() {
  await loadState();
  stateLoaded = true;
  applySurfaceChrome();
  bindEvents();
  bindStorageSync();
  await loadBookmarks();
  if (reconcilePinnedOrder()) {
    markUsageStateDirty();
    stateNeedsPersistAfterLoad = true;
  }
  if (normalizeConcreteSelectedCategory({ replaceAll: true, persist: false })) {
    stateNeedsPersistAfterLoad = true;
  }
  if (stateNeedsPersistAfterLoad) {
    stateNeedsPersistAfterLoad = false;
    await saveState();
  }
  render();
  setupTooltips();
  markAppReady();
}

function bindEvents() {
  document.addEventListener("dragend", endDragUi, true);
  document.addEventListener("drop", endDragUi, true);
  elements.refreshButton.addEventListener("click", async () => {
    await loadBookmarks();
    normalizeConcreteSelectedCategory({ replaceAll: true });
    initialRenderLimited = true;
    initialExpansionQueued = false;
    render();
  });
  elements.searchInput.addEventListener("input", () => scheduleRender());
  elements.sortSelect?.addEventListener("change", async () => {
    state.sortMode = elements.sortSelect.value;
    await saveState();
    render();
  });
  elements.openFullButton?.addEventListener("click", () => {
    chrome.windows.create({
      url: chrome.runtime.getURL("launcher.html"),
      type: "popup",
      width: 1420,
      height: 920,
      focused: true
    });
  });
  elements.deleteModeButton.addEventListener("click", () => {
    deleteMode = !deleteMode;
    if (deleteMode) {
      batchMode = false;
      selectedIds.clear();
    }
    render({ preserveScroll: true });
  });
  elements.openBehaviorButton?.addEventListener("click", async () => {
    const currentIndex = OPEN_BEHAVIOR_ORDER.indexOf(state.openBehavior);
    state.openBehavior = OPEN_BEHAVIOR_ORDER[(currentIndex + 1) % OPEN_BEHAVIOR_ORDER.length];
    await saveState();
    updateButtons();
  });
  elements.themeToggleButton?.addEventListener("click", async () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    await saveState();
    render();
  });
  elements.languageToggleButton?.addEventListener("click", async () => {
    state.language = getLanguage() === "ja" ? "en" : "ja";
    await saveState();
    render();
  });
  elements.overlayCloseButton?.addEventListener("click", closeShelfView);
  elements.groupedViewButton.addEventListener("click", () => setPanelRatio("bookmarks"));
  elements.listViewButton.addEventListener("click", () => setPanelRatio("frequent"));
  elements.cardDensityButton.addEventListener("click", () => setDensity("cards"));
  elements.compactDensityButton.addEventListener("click", () => setDensity("compact"));
  elements.savedViewSelect?.addEventListener("change", () => applySavedView(elements.savedViewSelect.value));
  elements.saveViewButton?.addEventListener("click", saveCurrentView);
  elements.deleteViewButton?.addEventListener("click", deleteActiveSavedView);
  elements.settingsButton?.addEventListener("click", openSettingsDialog);
  elements.batchModeButton?.addEventListener("click", toggleBatchMode);
  elements.trayModeButton?.addEventListener("click", toggleTrayMode);
  elements.organizeSessionButton?.addEventListener("click", openOrganizeSession);
  elements.domainMoveButton?.addEventListener("click", openDomainDialog);
  elements.undoButton?.addEventListener("click", undoLastAction);
  elements.checkLinksButton?.addEventListener("click", checkVisibleLinks);
  elements.selectVisibleButton?.addEventListener("click", selectVisibleBookmarks);
  elements.clearSelectionButton?.addEventListener("click", clearSelection);
  elements.batchCategorySelect?.addEventListener("change", () => {
    batchTargetCategory = elements.batchCategorySelect.value || "未分類";
  });
  elements.batchMoveButton?.addEventListener("click", moveSelectedBookmarks);
  elements.batchPinButton?.addEventListener("click", () => pinSelectedBookmarks(true));
  elements.batchUnpinButton?.addEventListener("click", () => pinSelectedBookmarks(false));
  elements.batchDeleteButton?.addEventListener("click", deleteSelectedBookmarks);
  elements.organizeSkipButton?.addEventListener("click", skipOrganizeBookmark);
  elements.organizeOpenButton?.addEventListener("click", openOrganizeBookmark);
  elements.organizeDeleteButton?.addEventListener("click", deleteOrganizeBookmark);
  elements.cardSizeInput?.addEventListener("input", () => {
    state.cardWidth = Number(elements.cardSizeInput.value);
    elements.app.style.setProperty("--card-min", `${state.cardWidth || DEFAULT_STATE.cardWidth}px`);
    scheduleSaveState();
  });
  elements.launchModeSelect?.addEventListener("change", async () => {
    state.launchMode = LAUNCH_MODES.has(elements.launchModeSelect.value)
      ? elements.launchModeSelect.value
      : DEFAULT_STATE.launchMode;
    await saveState();
    render();
  });
  elements.floatingButtonEnabled?.addEventListener("change", async () => {
    state.floatingButtonEnabled = elements.floatingButtonEnabled.checked;
    state.floatingStateRevision = Date.now();
    markFloatingSettingsDirty("floatingButtonEnabled", "floatingStateRevision");
    await saveState();
  });
  elements.floatingButtonCollapsed?.addEventListener("change", async () => {
    state.floatingButtonCollapsed = elements.floatingButtonCollapsed.checked;
    state.floatingStateRevision = Date.now();
    markFloatingSettingsDirty("floatingButtonCollapsed", "floatingStateRevision");
    await saveState();
  });
  elements.floatingButtonPosition?.addEventListener("change", async () => {
    state.floatingButtonPosition = FLOATING_BUTTON_POSITIONS.has(elements.floatingButtonPosition.value)
      ? elements.floatingButtonPosition.value
      : DEFAULT_STATE.floatingButtonPosition;
    state.floatingButtonCustomPosition = null;
    state.floatingStateRevision = Date.now();
    markFloatingSettingsDirty("floatingButtonPosition", "floatingButtonCustomPosition", "floatingStateRevision");
    await saveState();
  });
  elements.floatingButtonShape?.addEventListener("change", async () => {
    state.floatingButtonShape = normalizeFloatingButtonShape(elements.floatingButtonShape.value);
    state.floatingStateRevision = Date.now();
    markFloatingSettingsDirty("floatingButtonShape", "floatingStateRevision");
    await saveState();
  });
  elements.floatingButtonColor?.addEventListener("change", async () => {
    state.floatingButtonColor = normalizeFloatingButtonColor(elements.floatingButtonColor.value);
    state.floatingStateRevision = Date.now();
    markFloatingSettingsDirty("floatingButtonColor", "floatingStateRevision");
    await saveState();
  });
  elements.floatingButtonSize?.addEventListener("input", async () => {
    state.floatingButtonSize = clampNumber(elements.floatingButtonSize.value, FLOATING_BUTTON_SIZE_MIN, FLOATING_BUTTON_SIZE_MAX, DEFAULT_STATE.floatingButtonSize);
    state.floatingStateRevision = Date.now();
    markFloatingSettingsDirty("floatingButtonSize", "floatingStateRevision");
    scheduleSaveState(120);
  });
  elements.overlayOpacityInput?.addEventListener("input", async () => {
    state.overlayOpacity = clampNumber(elements.overlayOpacityInput.value, 30, 100, DEFAULT_STATE.overlayOpacity);
    if (elements.overlayOpacityValue) elements.overlayOpacityValue.textContent = `${Math.round(state.overlayOpacity)}%`;
    applyVisualSettings();
    scheduleSaveState();
  });
  elements.requireCategorySelection?.addEventListener("change", async () => {
    state.requireCategorySelection = elements.requireCategorySelection.checked;
    if (state.requireCategorySelection && !trayMode) {
      state.selectedCategory = "all";
    }
    await saveState();
    render({ preserveScroll: true });
  });
  elements.quickFullButton.addEventListener("click", async () => {
    state.quickFull = !state.quickFull;
    if (state.quickFull) state.quickCollapsed = false;
    await saveState();
    render();
  });
  elements.toggleQuickButton.addEventListener("click", async () => {
    state.quickCollapsed = !state.quickCollapsed;
    if (state.quickCollapsed) state.quickFull = false;
    await saveState();
    render();
  });
  elements.toggleRecentButton?.addEventListener("click", async () => {
    state.recentCollapsed = !state.recentCollapsed;
    await saveState();
    render();
  });
  elements.toggleGenreButton.addEventListener("click", async () => {
    state.genreCollapsed = !state.genreCollapsed;
    await saveState();
    render();
  });
  elements.clearUsageButton.addEventListener("click", async () => {
    state.usage = {};
    markUsageStateDirty();
    await saveState();
    render();
  });
  elements.showUnsortedButton.addEventListener("click", async () => {
    trayMode = false;
    state.selectedCategory = "未分類";
    await saveState();
    render();
  });
  elements.manageGenresButton.addEventListener("click", openGenreDialog);
  elements.addGenreButton.addEventListener("click", addCustomCategory);
  elements.saveButton.addEventListener("click", saveEdit);
  elements.deleteButton.addEventListener("click", deleteCurrentBookmark);
}

function bindStorageSync() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]?.newValue) return;
    const nextFloatingState = pickFloatingState(changes[STORAGE_KEY].newValue);
    state = { ...state, ...nextFloatingState };
    updateFloatingSettingControls();
  });
}

function updateFloatingSettingControls() {
  if (elements.floatingButtonEnabled) {
    elements.floatingButtonEnabled.checked = state.floatingButtonEnabled !== false;
  }
  if (elements.floatingButtonCollapsed) {
    elements.floatingButtonCollapsed.checked = !!state.floatingButtonCollapsed;
  }
  if (elements.floatingButtonPosition) {
    elements.floatingButtonPosition.value = state.floatingButtonPosition || DEFAULT_STATE.floatingButtonPosition;
  }
  if (elements.floatingButtonShape) {
    elements.floatingButtonShape.value = state.floatingButtonShape || DEFAULT_STATE.floatingButtonShape;
  }
  if (elements.floatingButtonColor) {
    elements.floatingButtonColor.value = state.floatingButtonColor || DEFAULT_STATE.floatingButtonColor;
  }
  if (elements.floatingButtonSize) {
    elements.floatingButtonSize.value = String(state.floatingButtonSize || DEFAULT_STATE.floatingButtonSize);
  }
}

function setupTooltips() {
  tooltipNode = document.createElement("div");
  tooltipNode.className = "app-tooltip";
  tooltipNode.setAttribute("role", "tooltip");
  document.body.append(tooltipNode);

  document.addEventListener("pointerover", (event) => {
    const target = getTooltipTarget(event.target);
    if (!target || target === tooltipTarget) return;
    showTooltip(target, event.clientX, event.clientY);
  }, true);
  document.addEventListener("pointermove", (event) => {
    if (tooltipTarget) positionTooltip(event.clientX, event.clientY);
  }, true);
  document.addEventListener("pointerout", (event) => {
    if (!tooltipTarget || tooltipTarget.contains(event.relatedTarget)) return;
    hideTooltip();
  }, true);
  document.addEventListener("focusin", (event) => {
    const target = getTooltipTarget(event.target);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    showTooltip(target, rect.left + rect.width / 2, rect.top);
  }, true);
  document.addEventListener("focusout", hideTooltip, true);
}

function getTooltipTarget(node) {
  const target = node?.closest?.("button, select, input[title], [data-tooltip]");
  if (!target) return null;
  const text = target.getAttribute("title") || target.getAttribute("data-tooltip") || target.getAttribute("aria-label");
  return text ? target : null;
}

function showTooltip(target, x, y) {
  const text = target.getAttribute("title") || target.getAttribute("data-tooltip") || target.getAttribute("aria-label");
  if (!text || !tooltipNode) return;
  if (target.hasAttribute("title")) {
    target.dataset.tooltip = text;
    target.removeAttribute("title");
  }
  const host = target.closest("dialog[open]") || document.body;
  if (tooltipNode.parentElement !== host) {
    host.append(tooltipNode);
  }
  tooltipTarget = target;
  tooltipNode.textContent = text;
  tooltipNode.dataset.theme = state.theme === "dark" ? "dark" : "light";
  tooltipNode.dataset.visible = "true";
  positionTooltip(x, y);
}

function positionTooltip(x, y) {
  if (!tooltipNode) return;
  const offset = 12;
  const rect = tooltipNode.getBoundingClientRect();
  const left = Math.min(window.innerWidth - rect.width - 8, Math.max(8, x + offset));
  const top = Math.min(window.innerHeight - rect.height - 8, Math.max(8, y + offset));
  tooltipNode.style.transform = `translate(${left}px, ${top}px)`;
}

function hideTooltip() {
  if (!tooltipNode) return;
  tooltipTarget = null;
  tooltipNode.dataset.visible = "false";
  if (tooltipNode.parentElement !== document.body) {
    document.body.append(tooltipNode);
  }
}

async function loadState() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const storedState = result[STORAGE_KEY] || {};
  state = { ...structuredClone(DEFAULT_STATE), ...storedState };
  state.pinned = state.pinned && typeof state.pinned === "object" ? state.pinned : {};
  state.usage = state.usage && typeof state.usage === "object" ? state.usage : {};
  if (!OPEN_BEHAVIOR_META[state.openBehavior]) {
    state.openBehavior = DEFAULT_STATE.openBehavior;
  }
  if (!UI_TEXT[state.language]) {
    state.language = DEFAULT_STATE.language;
  }
  if (!SORT_MODES.has(state.sortMode)) {
    state.sortMode = DEFAULT_STATE.sortMode;
  }
  if (!LAUNCH_MODES.has(state.launchMode)) {
    state.launchMode = DEFAULT_STATE.launchMode;
  }
  if (!PANEL_RATIO_MODES.has(state.panelRatio)) {
    state.panelRatio = DEFAULT_STATE.panelRatio;
  }
  state.recentCollapsed = !!state.recentCollapsed;
  state.floatingButtonEnabled = state.floatingButtonEnabled !== false;
  if (!FLOATING_BUTTON_POSITIONS.has(state.floatingButtonPosition)) {
    state.floatingButtonPosition = DEFAULT_STATE.floatingButtonPosition;
  }
  state.floatingButtonShape = normalizeFloatingButtonShape(state.floatingButtonShape);
  state.floatingButtonColor = normalizeFloatingButtonColor(state.floatingButtonColor);
  state.floatingButtonSize = clampNumber(state.floatingButtonSize, FLOATING_BUTTON_SIZE_MIN, FLOATING_BUTTON_SIZE_MAX, DEFAULT_STATE.floatingButtonSize);
  state.floatingButtonCollapsed = !!state.floatingButtonCollapsed;
  state.floatingButtonCustomPosition = normalizeFloatingCustomPosition(state.floatingButtonCustomPosition);
  state.floatingStateRevision = Number(state.floatingStateRevision) || 0;
  state.savedViews = normalizeSavedViews(state.savedViews);
  state.frequentOrder = normalizeIdList(state.frequentOrder);
  state.pinnedOrder = normalizeIdList(state.pinnedOrder);
  state.overlayOpacity = clampNumber(state.overlayOpacity, 30, 100, DEFAULT_STATE.overlayOpacity);
  state.requireCategorySelection = state.requireCategorySelection !== false;
  const preserveSelectedCategoryOnce = state.preserveSelectedCategoryOnce === true && state.openBehavior === "same-tab-keep";
  state.preserveSelectedCategoryOnce = false;
  if (preserveSelectedCategoryOnce) {
    stateNeedsPersistAfterLoad = true;
  }
  delete state.cardColorEnabled;
  delete state.cardColor;
  state.hiddenCategories = [...new Set(state.hiddenCategories || [])];
  state.categoryOrder = [...new Set(state.categoryOrder || [])].filter((name) => !isHiddenCategory(name));
  if (state.requireCategorySelection && state.selectedCategory !== "all" && !preserveSelectedCategoryOnce) {
    state.selectedCategory = "all";
    stateNeedsPersistAfterLoad = true;
  } else if (!state.selectedCategory || isHiddenCategory(state.selectedCategory)) {
    state.selectedCategory = getFallbackSelectedCategory();
    stateNeedsPersistAfterLoad = true;
  }
}

function normalizeFloatingCustomPosition(position) {
  if (!position || typeof position !== "object") return null;
  const left = Number(position.left);
  const top = Number(position.top);
  if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
  return {
    left: Math.round(left),
    top: Math.round(top)
  };
}

function normalizeSavedViews(views) {
  if (!Array.isArray(views)) return [];
  return views
    .map((view) => ({
      id: String(view?.id || ""),
      name: String(view?.name || "").trim(),
      selectedCategory: String(view?.selectedCategory || DEFAULT_STATE.selectedCategory),
      layout: view?.layout === "list" ? "list" : "grouped",
      panelRatio: PANEL_RATIO_MODES.has(view?.panelRatio) ? view.panelRatio : DEFAULT_STATE.panelRatio,
      density: view?.density === "compact" ? "compact" : "cards",
      sortMode: SORT_MODES.has(view?.sortMode) ? view.sortMode : DEFAULT_STATE.sortMode,
      trayMode: !!view?.trayMode,
      query: String(view?.query || "")
    }))
    .filter((view) => view.id && view.name)
    .slice(-SAVED_VIEW_LIMIT);
}

async function saveState() {
  cacheThemePreference(state.theme === "dark" ? "dark" : "light");
  const latestResult = await chrome.storage.local.get(STORAGE_KEY).catch(() => ({}));
  const latestState = latestResult?.[STORAGE_KEY] || {};
  const nextState = { ...latestState, ...state };
  const dirtyFloatingFields = new Set(floatingDirtyFields);
  const dirtyCategoryFields = new Set(categoryDirtyFields);
  const dirtyUsageState = usageStateDirty;

  preserveExternalFloatingState(nextState, latestState, dirtyFloatingFields);
  preserveExternalCategoryState(nextState, latestState, dirtyCategoryFields);
  preserveExternalUsageState(nextState, latestState, dirtyUsageState);
  if (!dirtyCategoryFields.size && categoryStateChanged(state, nextState)) {
    categoryRevision += 1;
    clearRenderDataCache();
  }
  if (!dirtyUsageState && usageStateChanged(state, nextState)) {
    usageRevision += 1;
    clearRenderDataCache();
  }

  floatingDirtyFields.clear();
  categoryDirtyFields.clear();
  usageStateDirty = false;
  state = { ...state, ...pickFloatingState(nextState), ...pickCategoryState(nextState), ...pickUsageState(nextState) };
  await chrome.storage.local.set({ [STORAGE_KEY]: nextState });
}

function preserveExternalUsageState(targetState, latestState, dirty) {
  if (dirty || !latestState || typeof latestState !== "object") return;
  if ("usage" in latestState) targetState.usage = latestState.usage;
  if ("pinned" in latestState) targetState.pinned = latestState.pinned;
  if ("pinnedOrder" in latestState) targetState.pinnedOrder = normalizeIdList(latestState.pinnedOrder);
  if ("frequentOrder" in latestState) targetState.frequentOrder = normalizeIdList(latestState.frequentOrder);
}

function categoryStateChanged(previousState, nextState) {
  return previousState.categories !== nextState.categories
    || previousState.customCategories !== nextState.customCategories
    || previousState.hiddenCategories !== nextState.hiddenCategories
    || previousState.categoryOrder !== nextState.categoryOrder;
}

function usageStateChanged(previousState, nextState) {
  return previousState.usage !== nextState.usage
    || previousState.pinned !== nextState.pinned
    || previousState.pinnedOrder !== nextState.pinnedOrder
    || previousState.frequentOrder !== nextState.frequentOrder;
}

function preserveExternalCategoryState(targetState, latestState, dirtyFields = new Set()) {
  if (!latestState || typeof latestState !== "object") return;
  ["categories", "customCategories", "hiddenCategories", "categoryOrder"].forEach((field) => {
    if (!dirtyFields.has(field) && field in latestState) {
      targetState[field] = latestState[field];
    }
  });
}

function preserveExternalFloatingState(targetState, latestState, dirtyFields = new Set()) {
  if (!latestState || typeof latestState !== "object") return;
  if (!dirtyFields.has("floatingButtonEnabled") && "floatingButtonEnabled" in latestState) {
    targetState.floatingButtonEnabled = latestState.floatingButtonEnabled !== false;
  }
  if (!dirtyFields.has("floatingButtonPosition") && "floatingButtonPosition" in latestState) {
    targetState.floatingButtonPosition = FLOATING_BUTTON_POSITIONS.has(latestState.floatingButtonPosition)
      ? latestState.floatingButtonPosition
      : DEFAULT_STATE.floatingButtonPosition;
  }
  if (!dirtyFields.has("floatingButtonShape") && "floatingButtonShape" in latestState) {
    targetState.floatingButtonShape = normalizeFloatingButtonShape(latestState.floatingButtonShape);
  }
  if (!dirtyFields.has("floatingButtonColor") && "floatingButtonColor" in latestState) {
    targetState.floatingButtonColor = normalizeFloatingButtonColor(latestState.floatingButtonColor);
  }
  if (!dirtyFields.has("floatingButtonSize") && "floatingButtonSize" in latestState) {
    targetState.floatingButtonSize = clampNumber(latestState.floatingButtonSize, FLOATING_BUTTON_SIZE_MIN, FLOATING_BUTTON_SIZE_MAX, DEFAULT_STATE.floatingButtonSize);
  }
  if (!dirtyFields.has("floatingButtonCollapsed") && "floatingButtonCollapsed" in latestState) {
    targetState.floatingButtonCollapsed = !!latestState.floatingButtonCollapsed;
  }
  if (!dirtyFields.has("floatingButtonCustomPosition") && "floatingButtonCustomPosition" in latestState) {
    targetState.floatingButtonCustomPosition = normalizeFloatingCustomPosition(latestState.floatingButtonCustomPosition);
  }
  if (!dirtyFields.has("floatingStateRevision") && "floatingStateRevision" in latestState) {
    targetState.floatingStateRevision = Number(latestState.floatingStateRevision) || 0;
  }
}

function pickFloatingState(sourceState) {
  return {
    floatingButtonEnabled: sourceState.floatingButtonEnabled !== false,
    floatingButtonPosition: FLOATING_BUTTON_POSITIONS.has(sourceState.floatingButtonPosition)
      ? sourceState.floatingButtonPosition
      : DEFAULT_STATE.floatingButtonPosition,
    floatingButtonShape: normalizeFloatingButtonShape(sourceState.floatingButtonShape),
    floatingButtonColor: normalizeFloatingButtonColor(sourceState.floatingButtonColor),
    floatingButtonSize: clampNumber(sourceState.floatingButtonSize, FLOATING_BUTTON_SIZE_MIN, FLOATING_BUTTON_SIZE_MAX, DEFAULT_STATE.floatingButtonSize),
    floatingButtonCollapsed: !!sourceState.floatingButtonCollapsed,
    floatingButtonCustomPosition: normalizeFloatingCustomPosition(sourceState.floatingButtonCustomPosition),
    floatingStateRevision: Number(sourceState.floatingStateRevision) || 0
  };
}

function pickCategoryState(sourceState) {
  return {
    categories: sourceState.categories && typeof sourceState.categories === "object" ? sourceState.categories : {},
    customCategories: Array.isArray(sourceState.customCategories) ? sourceState.customCategories : [],
    hiddenCategories: Array.isArray(sourceState.hiddenCategories) ? sourceState.hiddenCategories : [],
    categoryOrder: Array.isArray(sourceState.categoryOrder) ? sourceState.categoryOrder : []
  };
}

function pickUsageState(sourceState) {
  return {
    usage: sourceState.usage && typeof sourceState.usage === "object" ? sourceState.usage : {},
    pinned: sourceState.pinned && typeof sourceState.pinned === "object" ? sourceState.pinned : {},
    pinnedOrder: normalizeIdList(sourceState.pinnedOrder),
    frequentOrder: normalizeIdList(sourceState.frequentOrder)
  };
}

async function loadBookmarks() {
  const tree = await chrome.bookmarks.getTree();
  const flatBookmarks = flattenBookmarkNodes(tree);
  bookmarks = flatBookmarks.map((bookmark) => {
    const savedCategory = getStoredCategory(bookmark.id);
    return {
      ...bookmark,
      category: savedCategory || "未分類"
    };
  });
  resetBookmarkDerivedCaches();
}

function reconcilePinnedOrder() {
  const pinnedIds = new Set(Object.keys(state.pinned || {}).filter((id) => state.pinned[id]));
  const savedIds = normalizeIdList(state.pinnedOrder).filter((id) => pinnedIds.has(id));
  const savedSet = new Set(savedIds);
  const registrationIds = bookmarks
    .filter((bookmark) => pinnedIds.has(bookmark.id) && !savedSet.has(bookmark.id))
    .sort(sortBookmarksByAdded)
    .map((bookmark) => bookmark.id);
  const nextOrder = [...savedIds, ...registrationIds];
  if (nextOrder.length === state.pinnedOrder.length && nextOrder.every((id, index) => id === state.pinnedOrder[index])) {
    return false;
  }
  state.pinnedOrder = nextOrder;
  return true;
}

function setBookmarkPinnedState(id, pinned) {
  const bookmarkId = String(id || "").trim();
  if (!bookmarkId) return;
  const nextOrder = normalizeIdList(state.pinnedOrder);
  if (pinned) {
    state.pinned[bookmarkId] = true;
    if (!nextOrder.includes(bookmarkId)) nextOrder.push(bookmarkId);
  } else {
    delete state.pinned[bookmarkId];
    const orderIndex = nextOrder.indexOf(bookmarkId);
    if (orderIndex >= 0) nextOrder.splice(orderIndex, 1);
  }
  state.pinnedOrder = nextOrder;
}

function resetBookmarkDerivedCaches() {
  bookmarksRevision += 1;
  hostCache = new Map();
  normalizedUrlCache = new Map();
  clearRenderDataCache();
}

function flattenBookmarkNodes(nodes, folders = []) {
  return nodes.flatMap((node) => {
    if (node.url) {
      const folderPath = folders.join(" / ") || "ルート";
      return [{
        id: node.id,
        title: node.title || node.url,
        url: node.url,
        folderPath,
        parentId: node.parentId,
        index: node.index,
        dateAdded: node.dateAdded
      }];
    }
    return flattenBookmarkNodes(node.children || [], [...folders, node.title].filter(Boolean));
  });
}

function getStoredCategory(id) {
  const category = state.categories?.[id];
  return category && !isHiddenCategory(category) ? category : "";
}

function getBookmarkMap() {
  const cacheKey = ["bookmarkMap", bookmarksRevision].join("::");
  return getCachedRenderData(cacheKey, () => new Map(bookmarks.map((bookmark) => [bookmark.id, bookmark])));
}

function getBookmarkIdSet() {
  const cacheKey = ["bookmarkIds", bookmarksRevision].join("::");
  return getCachedRenderData(cacheKey, () => new Set(bookmarks.map((bookmark) => bookmark.id)));
}

function requiresCategorySelection() {
  return state.requireCategorySelection !== false;
}

function getFallbackSelectedCategory(categoryNames = getCategoryNames()) {
  return requiresCategorySelection() ? "all" : getPreferredConcreteCategory(categoryNames);
}

function shouldShowCategorySelectionPrompt() {
  const query = elements.searchInput?.value.trim();
  return !trayMode && requiresCategorySelection() && state.selectedCategory === "all" && !query;
}

function shouldDeferQuickStack() {
  return shouldShowCategorySelectionPrompt() && !state.quickFull;
}

function applyLanguage() {
  document.documentElement.lang = getLanguage();
  applySurfaceChrome();
  if (elements.searchInput) elements.searchInput.placeholder = t("searchPlaceholder");
  if (elements.sortSelect) {
    setControlLabel(elements.sortSelect, t("sort"));
    [...elements.sortSelect.options].forEach((option) => {
      option.textContent = getSortLabel(option.value);
    });
  }
  setControlLabel(elements.savedViewSelect, t("savedViews"));
  setControlLabel(elements.saveViewButton, t("saveCurrentView"));
  setControlLabel(elements.deleteViewButton, t("deleteSavedView"));
  if (elements.launchModeSelect) {
    setControlLabel(elements.launchModeSelect, t("launchMode"));
    elements.launchModeSelect.querySelector('option[value="sidepanel"]')?.replaceChildren(t("launchSidepanel"));
    elements.launchModeSelect.querySelector('option[value="overlay"]')?.replaceChildren(t("launchOverlay"));
  }
  if (elements.floatingButtonPosition) {
    setControlLabel(elements.floatingButtonPosition, t("floatingButtonPosition"));
    const labels = FLOATING_BUTTON_POSITION_LABELS[getLanguage()] || FLOATING_BUTTON_POSITION_LABELS.ja;
    [...elements.floatingButtonPosition.options].forEach((option) => {
      option.textContent = labels[option.value] || option.value;
    });
  }
  if (elements.floatingButtonShape) {
    setControlLabel(elements.floatingButtonShape, t("floatingButtonShape"));
    const labels = FLOATING_BUTTON_SHAPE_LABELS[getLanguage()] || FLOATING_BUTTON_SHAPE_LABELS.ja;
    [...elements.floatingButtonShape.options].forEach((option) => {
      option.textContent = labels[option.value] || option.value;
    });
  }
  if (elements.floatingButtonColor) {
    setControlLabel(elements.floatingButtonColor, t("floatingButtonColor"));
    const labels = FLOATING_BUTTON_COLOR_LABELS[getLanguage()] || FLOATING_BUTTON_COLOR_LABELS.ja;
    [...elements.floatingButtonColor.options].forEach((option) => {
      option.textContent = labels[option.value] || option.value;
    });
  }

  document.querySelector(".control-strip")?.setAttribute("aria-label", t("displaySettings"));
  document.querySelector("#batchBar")?.setAttribute("aria-label", t("batchActions"));
  document.querySelector(".control-strip .segmented:nth-of-type(1)")?.setAttribute("aria-label", t("panelRatio"));
  document.querySelector(".control-strip .segmented:nth-of-type(2)")?.setAttribute("aria-label", t("compact"));

  document.querySelector(".quick-section h2").textContent = t("frequentHeading");
  document.querySelector(".recent-section h2")?.replaceChildren(t("recentHeading"));
  document.querySelector(".genre-panel h2").textContent = t("genresHeading");
  document.querySelector("#editDialog h2").textContent = t("editBookmark");
  document.querySelector("#genreDialog h2").textContent = t("editGenres");
  document.querySelector("#settingsDialog h2").textContent = t("settingsHeading");
  document.querySelector("#organizeDialog h2").textContent = t("organizeHeading");
  document.querySelector("#domainDialog h2").textContent = t("domainMoveHeading");
  if (elements.settingsNote) elements.settingsNote.textContent = t("settingsNote");

  setLabelText(elements.editTitle, t("name"));
  setLabelText(elements.editUrl, "URL");
  setLabelText(elements.editCategory, t("category"));
  setLabelText(elements.cardSizeInput, t("cardWidth"));
  setLabelText(elements.launchModeSelect, t("launchMode"));
  setLabelText(elements.floatingButtonPosition, t("floatingButtonPosition"));
  setLabelText(elements.floatingButtonShape, t("floatingButtonShape"));
  setLabelText(elements.floatingButtonColor, t("floatingButtonColor"));
  setLabelText(elements.floatingButtonSize, t("floatingButtonSize"));
  setLabelText(elements.overlayOpacityInput, t("overlayOpacity"));
  setLabelText(elements.requireCategorySelection, t("requireCategorySelection"));
  const pinnedLabel = elements.editPinned?.closest("label");
  const pinnedText = [...(pinnedLabel?.childNodes || [])].find((node) => node.nodeType === Node.TEXT_NODE);
  if (pinnedText) pinnedText.textContent = t("pinFrequent");
  const floatingLabel = elements.floatingButtonEnabled?.closest("label");
  const floatingText = [...(floatingLabel?.childNodes || [])].find((node) => node.nodeType === Node.TEXT_NODE);
  if (floatingText) floatingText.textContent = t("floatingButton");
  const floatingCollapsedLabel = elements.floatingButtonCollapsed?.closest("label");
  const floatingCollapsedText = [...(floatingCollapsedLabel?.childNodes || [])].find((node) => node.nodeType === Node.TEXT_NODE);
  if (floatingCollapsedText) floatingCollapsedText.textContent = t("floatingButtonCollapsed");
  if (elements.newGenreInput) elements.newGenreInput.placeholder = t("newGenrePlaceholder");

  document.querySelectorAll('button[value="cancel"]').forEach((button) => setControlLabel(button, t("close")));
  setControlLabel(elements.deleteButton, t("delete"));
  setControlLabel(elements.saveButton, t("save"));
  setControlLabel(elements.addGenreButton, t("add"));
  setControlLabel(elements.organizeDeleteButton, t("delete"));
  setControlLabel(elements.organizeOpenButton, t("open"));
  setControlLabel(elements.organizeSkipButton, t("next"));
}

function render(options = {}) {
  const scrollSnapshot = options.preserveScroll ? captureScrollSnapshot() : null;
  const skipQuickStack = !!options.skipQuickStack;
  applySurfaceChrome();
  if (!skipQuickStack) {
    renderGeneration += 1;
    resetLazyFavicons();
  }
  pruneSelection();
  pruneLinkStatuses();
  duplicateUrlSet = trayMode ? getDuplicateUrlSet(bookmarks) : new Set();
  normalizeConcreteSelectedCategory({ replaceAll: false });
  const visible = getVisibleBookmarksForRender();
  const categoryNames = getCategoryNames();
  const categories = collectCategories(categoryNames);
  const deferQuickStack = shouldDeferQuickStack();
  const frequent = skipQuickStack || deferQuickStack ? null : getFrequentBookmarks();
  const recent = skipQuickStack || deferQuickStack ? null : getRecentBookmarks();
  const baseStats = trayMode
    ? t("trayStats", { visible: visible.length, total: bookmarks.length })
    : t("bookmarksStats", { total: bookmarks.length, visible: visible.length });
  const linkSummary = getLinkCheckSummary(visible);
  elements.statsText.textContent = linkSummary ? `${baseStats} / ${linkSummary}` : baseStats;
  elements.app.dataset.deleteMode = deleteMode ? "true" : "false";
  elements.app.dataset.batchMode = batchMode ? "true" : "false";
  elements.app.dataset.managementMode = isManagementMode() ? "true" : "false";
  elements.app.dataset.trayMode = trayMode ? "true" : "false";
  elements.app.dataset.linkChecking = linkCheckRunning ? "true" : "false";
  elements.app.dataset.quickCollapsed = state.quickCollapsed ? "true" : "false";
  elements.app.dataset.quickFull = state.quickFull ? "true" : "false";
  elements.app.dataset.recentCollapsed = state.recentCollapsed ? "true" : "false";
  elements.app.dataset.genreCollapsed = state.genreCollapsed ? "true" : "false";
  elements.app.dataset.theme = state.theme === "dark" ? "dark" : "light";
  elements.app.dataset.language = getLanguage();
  elements.app.dataset.surface = SURFACE;
  elements.app.dataset.layout = state.layout;
  elements.app.dataset.panelRatio = state.panelRatio;
  elements.app.dataset.density = state.density;
  elements.app.style.setProperty("--card-min", `${state.cardWidth || DEFAULT_STATE.cardWidth}px`);
  applyVisualSettings();
  if (elements.cardSizeInput) {
    elements.cardSizeInput.value = String(state.cardWidth || DEFAULT_STATE.cardWidth);
  }
  if (elements.launchModeSelect) {
    elements.launchModeSelect.value = state.launchMode;
  }
  if (elements.floatingButtonEnabled) {
    elements.floatingButtonEnabled.checked = state.floatingButtonEnabled !== false;
  }
  if (elements.floatingButtonCollapsed) {
    elements.floatingButtonCollapsed.checked = !!state.floatingButtonCollapsed;
  }
  if (elements.floatingButtonPosition) {
    elements.floatingButtonPosition.value = state.floatingButtonPosition || DEFAULT_STATE.floatingButtonPosition;
  }
  if (elements.floatingButtonShape) {
    elements.floatingButtonShape.value = state.floatingButtonShape || DEFAULT_STATE.floatingButtonShape;
  }
  if (elements.floatingButtonColor) {
    elements.floatingButtonColor.value = state.floatingButtonColor || DEFAULT_STATE.floatingButtonColor;
  }
  if (elements.floatingButtonSize) {
    elements.floatingButtonSize.value = String(state.floatingButtonSize || DEFAULT_STATE.floatingButtonSize);
  }
  if (elements.overlayOpacityInput) {
    elements.overlayOpacityInput.value = String(state.overlayOpacity);
  }
  if (elements.overlayOpacityValue) {
    elements.overlayOpacityValue.textContent = `${Math.round(state.overlayOpacity)}%`;
  }
  if (elements.requireCategorySelection) {
    elements.requireCategorySelection.checked = requiresCategorySelection();
  }
  const language = getLanguage();
  if (appliedLanguage !== language) {
    applyLanguage();
    appliedLanguage = language;
  }
  renderSavedViewControls();
  updateButtons();
  if (!skipQuickStack && deferQuickStack) {
    renderDeferredQuickStack(categoryNames);
  } else if (!skipQuickStack) {
    quickStackDeferred = false;
    renderFrequent(frequent, categoryNames);
    if (state.quickFull || state.recentCollapsed) {
      elements.recentList?.replaceChildren();
    } else {
      renderRecent(recent, categoryNames);
    }
  }
  if (state.quickFull) {
    elements.genreList?.replaceChildren();
    elements.bookmarkSections?.replaceChildren();
  } else {
    if (state.genreCollapsed) {
      elements.genreList?.replaceChildren();
    } else {
      renderGenres(categories);
    }
    renderSections(visible, categories, categoryNames);
  }
  renderBatchBar(visible, categoryNames);
  if (scrollSnapshot) {
    restoreScrollSnapshot(scrollSnapshot);
  }
  scheduleInitialRenderExpansion();
}

function applyVisualSettings() {
  const isDark = state.theme === "dark";
  const overlayAlpha = clampNumber(state.overlayOpacity, 30, 100, DEFAULT_STATE.overlayOpacity) / 100;
  const baseLayerAlpha = Math.max(0.14, Math.min(0.62, overlayAlpha * 0.58));
  const panelAlpha = overlayAlpha;
  const strongAlpha = Math.min(1, overlayAlpha + 0.07);
  const softAlpha = Math.min(1, overlayAlpha + 0.02);
  const cardAlpha = overlayAlpha;
  const cardHoverAlpha = Math.min(1, overlayAlpha + 0.09);
  const controlAlpha = Math.min(1, overlayAlpha + 0.05);
  const controlHoverAlpha = Math.min(1, overlayAlpha + 0.12);

  document.documentElement.style.setProperty("--html-bg", isDark ? `rgba(30, 30, 30, ${baseLayerAlpha})` : `rgba(243, 243, 243, ${baseLayerAlpha})`);
  document.documentElement.style.setProperty(
    "--body-bg",
    isDark
      ? `rgba(30, 30, 30, ${baseLayerAlpha})`
      : `rgba(243, 243, 243, ${baseLayerAlpha})`
  );
  elements.app.style.setProperty(
    "--app-bg",
    isDark
      ? `rgba(30, 30, 30, ${baseLayerAlpha})`
      : `rgba(243, 243, 243, ${baseLayerAlpha})`
  );
  elements.app.style.setProperty("--panel", isDark ? `rgba(37, 37, 38, ${panelAlpha})` : `rgba(248, 248, 248, ${panelAlpha})`);
  elements.app.style.setProperty("--panel-strong", isDark ? `rgba(30, 30, 30, ${strongAlpha})` : `rgba(255, 255, 255, ${strongAlpha})`);
  elements.app.style.setProperty("--control-surface", isDark ? `rgba(42, 42, 42, ${controlAlpha})` : `rgba(255, 255, 255, ${controlAlpha})`);
  elements.app.style.setProperty("--control-surface-hover", isDark ? `rgba(55, 55, 55, ${controlHoverAlpha})` : `rgba(239, 239, 239, ${controlHoverAlpha})`);
  elements.app.style.setProperty("--control-surface-solid", isDark ? "#2a2a2a" : "#ffffff");
  elements.app.style.setProperty("--topbar-bg", isDark ? `rgba(24, 24, 24, ${Math.min(0.99, overlayAlpha + 0.04)})` : `rgba(45, 45, 48, ${Math.min(0.99, overlayAlpha + 0.04)})`);
  elements.app.style.setProperty("--count-bg", isDark ? `rgba(51, 51, 51, ${softAlpha})` : `rgba(234, 234, 234, ${softAlpha})`);
  elements.app.style.setProperty("--tag-bg", isDark ? `rgba(45, 45, 48, ${softAlpha})` : `rgba(243, 243, 243, ${softAlpha})`);
  elements.app.style.setProperty("--category-control-bg", isDark ? `rgba(14, 99, 156, ${softAlpha})` : `rgba(229, 241, 251, ${softAlpha})`);
  elements.app.style.setProperty("--accent-soft", isDark ? `rgba(9, 71, 113, ${softAlpha})` : `rgba(229, 241, 251, ${softAlpha})`);
  elements.app.style.setProperty("--card-bg", isDark ? `rgba(37, 37, 38, ${cardAlpha})` : `rgba(255, 255, 255, ${cardAlpha})`);
  elements.app.style.setProperty("--card-bg-hover", isDark ? `rgba(43, 43, 43, ${cardHoverAlpha})` : `rgba(245, 249, 255, ${cardHoverAlpha})`);
  elements.app.style.setProperty("--vscode-workbench", isDark ? `rgba(30, 30, 30, ${baseLayerAlpha})` : `rgba(243, 243, 243, ${baseLayerAlpha})`);
  elements.app.style.setProperty("--vscode-sidebar", isDark ? `rgba(37, 37, 38, ${panelAlpha})` : `rgba(248, 248, 248, ${panelAlpha})`);
  elements.app.style.setProperty("--vscode-editor", isDark ? `rgba(30, 30, 30, ${strongAlpha})` : `rgba(255, 255, 255, ${strongAlpha})`);
  elements.app.style.setProperty("--vscode-control", isDark ? `rgba(45, 45, 48, ${strongAlpha})` : `rgba(255, 255, 255, ${strongAlpha})`);
  elements.app.style.setProperty("--vscode-control-hover", isDark ? `rgba(58, 61, 65, ${cardHoverAlpha})` : `rgba(238, 246, 252, ${cardHoverAlpha})`);
  elements.app.style.setProperty("--vscode-selection", isDark ? `rgba(9, 71, 113, ${softAlpha})` : `rgba(229, 241, 251, ${softAlpha})`);
  elements.app.style.setProperty("--status-ok-bg", isDark ? `rgba(28, 64, 42, ${softAlpha})` : `rgba(232, 248, 238, ${softAlpha})`);
  elements.app.style.setProperty("--status-broken-bg", isDark ? `rgba(77, 36, 39, ${softAlpha})` : `rgba(255, 241, 239, ${softAlpha})`);
  elements.app.style.setProperty("--status-warn-bg", isDark ? `rgba(77, 61, 25, ${softAlpha})` : `rgba(255, 244, 204, ${softAlpha})`);
}

function filteredBookmarks() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const cacheKey = [
    "filtered",
    bookmarksRevision,
    categoryRevision,
    usageRevision,
    trayMode ? "tray" : "normal",
    state.selectedCategory,
    state.sortMode,
    query
  ].join("::");
  return getCachedRenderData(cacheKey, () => {
    const sorter = getBookmarkSorter();
    const duplicateSet = trayMode ? getDuplicateUrlSet(bookmarks) : duplicateUrlSet;
    return bookmarks
      .filter((bookmark) => {
        const categoryMatch = trayMode || state.selectedCategory === "all" || bookmark.category === state.selectedCategory;
        const trayMatch = !trayMode || getTrayReasons(bookmark, duplicateSet).length > 0;
        const queryMatch = !query || `${bookmark.title} ${bookmark.url} ${bookmark.folderPath} ${bookmark.category}`.toLowerCase().includes(query);
        return categoryMatch && trayMatch && queryMatch;
      })
      .sort(sorter);
  });
}

function getVisibleBookmarksForRender() {
  return shouldShowCategorySelectionPrompt() ? [] : filteredBookmarks();
}

function getBookmarkSorter() {
  if (state.sortMode === "newest") return sortBookmarksByNewest;
  if (state.sortMode === "name") return sortBookmarksByName;
  if (state.sortMode === "used") return sortBookmarksByUsage;
  if (state.sortMode === "site") return sortBookmarksBySite;
  return sortBookmarksByAdded;
}

function sortBookmarks(a, b) {
  return sortBookmarksByUsage(a, b);
}

function getFrequentOrderMap() {
  return new Map(normalizeIdList(state.frequentOrder).map((id, index) => [id, index]));
}

function getPinnedOrderMap() {
  return new Map(normalizeIdList(state.pinnedOrder).map((id, index) => [id, index]));
}

function compareFrequentManualOrder(a, b, orderMap) {
  const aRank = orderMap.has(a.id) ? orderMap.get(a.id) : Number.POSITIVE_INFINITY;
  const bRank = orderMap.has(b.id) ? orderMap.get(b.id) : Number.POSITIVE_INFINITY;
  return aRank - bRank;
}

function sortFrequentBookmarks(a, b, orderMap = getFrequentOrderMap(), pinnedOrderMap = getPinnedOrderMap()) {
  const aPinned = !!state.pinned[a.id];
  const bPinned = !!state.pinned[b.id];
  const pinnedDelta = Number(bPinned) - Number(aPinned);
  if (pinnedDelta) return pinnedDelta;
  if (aPinned && bPinned) {
    const pinnedOrderDelta = compareFrequentManualOrder(a, b, pinnedOrderMap);
    return pinnedOrderDelta || sortBookmarksByAdded(a, b);
  }
  const manualDelta = compareFrequentManualOrder(a, b, orderMap);
  if (manualDelta) return manualDelta;
  if (!state.quickFull) return sortBookmarksByUsage(a, b);
  return compareFolderAndIndex(a, b) || compareBookmarkTitle(a, b);
}

function sortBookmarksByUsage(a, b) {
  const pinnedDelta = Number(!!state.pinned[b.id]) - Number(!!state.pinned[a.id]);
  if (pinnedDelta) return pinnedDelta;
  const usageDelta = (state.usage[b.id]?.count || 0) - (state.usage[a.id]?.count || 0);
  if (usageDelta) return usageDelta;
  const lastOpenedDelta = (state.usage[b.id]?.lastOpenedAt || 0) - (state.usage[a.id]?.lastOpenedAt || 0);
  if (lastOpenedDelta) return lastOpenedDelta;
  return compareBookmarkTitle(a, b);
}

function sortBookmarksByAdded(a, b) {
  const dateDelta = (a.dateAdded || 0) - (b.dateAdded || 0);
  if (dateDelta) return dateDelta;
  return compareFolderAndIndex(a, b) || compareBookmarkTitle(a, b);
}

function sortBookmarksByNewest(a, b) {
  const dateDelta = (b.dateAdded || 0) - (a.dateAdded || 0);
  if (dateDelta) return dateDelta;
  return compareFolderAndIndex(a, b) || compareBookmarkTitle(a, b);
}

function sortBookmarksByName(a, b) {
  return compareBookmarkTitle(a, b) || compareFolderAndIndex(a, b);
}

function sortBookmarksBySite(a, b) {
  const hostDelta = safeHost(a.url).localeCompare(safeHost(b.url), "ja", { numeric: true, sensitivity: "base" });
  if (hostDelta) return hostDelta;
  return compareBookmarkTitle(a, b) || compareFolderAndIndex(a, b);
}

function compareBookmarkTitle(a, b) {
  return (a.title || a.url || "").localeCompare(b.title || b.url || "", "ja", { numeric: true, sensitivity: "base" });
}

function compareFolderAndIndex(a, b) {
  const folderDelta = a.folderPath.localeCompare(b.folderPath, "ja");
  if (folderDelta) return folderDelta;
  return (a.index || 0) - (b.index || 0);
}

function collectCategories(categoryNames = getCategoryNames()) {
  const cacheKey = ["categories", bookmarksRevision, categoryRevision, categoryNames.join("\u0001")].join("::");
  return getCachedRenderData(cacheKey, () => {
    const counts = new Map(categoryNames.map((name) => [name, 0]));
    bookmarks.forEach((bookmark) => counts.set(bookmark.category, (counts.get(bookmark.category) || 0) + 1));
    return categoryNames.map((name) => ({ name, count: counts.get(name) || 0 }));
  });
}

function getFrequentBookmarks() {
  const limit = state.quickFull ? 48 : state.recentCollapsed || state.panelRatio === "frequent" ? 24 : 16;
  const orderSignature = `${normalizeIdList(state.pinnedOrder).join("\u0001")}::${normalizeIdList(state.frequentOrder).join("\u0001")}`;
  const cacheKey = ["frequent", bookmarksRevision, usageRevision, state.quickFull, state.recentCollapsed, state.panelRatio, limit, orderSignature].join("::");
  return getCachedRenderData(cacheKey, () => {
    const orderMap = getFrequentOrderMap();
    const pinnedOrderMap = getPinnedOrderMap();
    const bookmarkMap = getBookmarkMap();
    const candidateIds = new Set([
      ...Object.keys(state.pinned || {}).filter((id) => state.pinned[id]),
      ...Object.keys(state.usage || {}).filter((id) => state.usage[id]?.count)
    ]);
    return [...candidateIds]
      .map((id) => bookmarkMap.get(id))
      .filter(Boolean)
      .sort((a, b) => sortFrequentBookmarks(a, b, orderMap, pinnedOrderMap))
      .slice(0, limit);
  });
}

function getPinnedBookmarks(limit = DEFERRED_PINNED_LIMIT) {
  const orderSignature = normalizeIdList(state.pinnedOrder).join("\u0001");
  const cacheKey = ["pinned", bookmarksRevision, usageRevision, limit, orderSignature].join("::");
  return getCachedRenderData(cacheKey, () => {
    const orderMap = getPinnedOrderMap();
    const bookmarkMap = getBookmarkMap();
    return Object.keys(state.pinned || {})
      .filter((id) => state.pinned[id])
      .map((id) => bookmarkMap.get(id))
      .filter(Boolean)
      .sort((a, b) => {
        const manualDelta = compareFrequentManualOrder(a, b, orderMap);
        return manualDelta || sortBookmarksByAdded(a, b);
      })
      .slice(0, limit);
  });
}

function getRecentBookmarks() {
  const cacheKey = ["recent", bookmarksRevision].join("::");
  return getCachedRenderData(cacheKey, () => {
    const recent = [];
    bookmarks.forEach((bookmark) => {
      if (!Number.isFinite(bookmark.dateAdded)) return;
      const insertIndex = recent.findIndex((item) => (bookmark.dateAdded || 0) > (item.dateAdded || 0));
      if (insertIndex === -1) {
        if (recent.length < RECENT_BOOKMARK_LIMIT) recent.push(bookmark);
      } else {
        recent.splice(insertIndex, 0, bookmark);
        if (recent.length > RECENT_BOOKMARK_LIMIT) recent.pop();
      }
    });
    return recent;
  });
}

function renderFrequent(items, categoryNames) {
  elements.frequentList.innerHTML = "";
  if (state.quickCollapsed) return;
  if (!items.length) {
    elements.frequentList.append(emptyMessage(t("noHistory")));
    return;
  }
  const visibleItems = state.quickFull ? items : initialRenderLimited ? items.slice(0, 8) : items;
  appendBookmarkCardsInChunks(elements.frequentList, visibleItems, {
    frequent: true,
    firstChunk: state.quickFull ? 12 : 6,
    categoryNames
  });
}

function getFrequentDropPosition(event, card) {
  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  if (Math.abs(event.clientY - centerY) < rect.height * 0.35) {
    return event.clientX > centerX ? "after" : "before";
  }
  return event.clientY > centerY ? "after" : "before";
}

function clearFrequentDragIndicators() {
  frequentDragTargetId = null;
  document.querySelectorAll(".bookmark-card[data-drop-position]").forEach((card) => {
    delete card.dataset.dropPosition;
  });
}

async function reorderFrequentBookmarks(sourceId, targetId, position = "before") {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const sourcePinned = !!state.pinned[sourceId];
  const targetPinned = !!state.pinned[targetId];
  if (sourcePinned !== targetPinned) return;
  const frequentIds = getFrequentBookmarks().map((bookmark) => bookmark.id);
  if (!frequentIds.includes(sourceId) || !frequentIds.includes(targetId)) return;

  if (sourcePinned) {
    const pinnedIds = frequentIds.filter((id) => state.pinned[id]);
    const nextPinnedIds = pinnedIds.filter((id) => id !== sourceId);
    const pinnedTargetIndex = nextPinnedIds.indexOf(targetId);
    if (pinnedTargetIndex < 0) return;
    nextPinnedIds.splice(pinnedTargetIndex + (position === "after" ? 1 : 0), 0, sourceId);
    const carryOverPinnedIds = normalizeIdList(state.pinnedOrder)
      .filter((id) => state.pinned[id] && !nextPinnedIds.includes(id));
    state.pinnedOrder = [...nextPinnedIds, ...carryOverPinnedIds];
    markUsageStateDirty();
    await saveState();
    render({ preserveScroll: true });
    return;
  }

  const nextIds = frequentIds.filter((id) => id !== sourceId);
  const targetIndex = nextIds.indexOf(targetId);
  if (targetIndex < 0) return;
  nextIds.splice(targetIndex + (position === "after" ? 1 : 0), 0, sourceId);

  const validIds = getBookmarkIdSet();
  const carryOverIds = normalizeIdList(state.frequentOrder)
    .filter((id) => validIds.has(id) && !nextIds.includes(id));
  state.frequentOrder = [...nextIds, ...carryOverIds];
  markUsageStateDirty();
  await saveState();
  render({ preserveScroll: true });
}

function renderRecent(items, categoryNames) {
  if (!elements.recentList) return;
  elements.recentList.innerHTML = "";
  if (!items.length) {
    elements.recentList.append(emptyMessage(t("noRecent")));
    return;
  }
  const visibleItems = initialRenderLimited ? items.slice(0, 6) : items;
  appendBookmarkCardsInChunks(elements.recentList, visibleItems, { firstChunk: 6, categoryNames });
}

function renderDeferredQuickStack(categoryNames) {
  quickStackDeferred = true;
  elements.frequentList?.replaceChildren();
  elements.recentList?.replaceChildren();
  if (state.quickCollapsed || !elements.frequentList) return;
  const pinned = getPinnedBookmarks();
  if (!pinned.length) return;
  appendBookmarkCardsInChunks(elements.frequentList, pinned, {
    frequent: true,
    firstChunk: Math.min(6, pinned.length),
    categoryNames
  });
}

function renderSavedViewControls() {
  if (!elements.savedViewSelect) return;
  const views = state.savedViews || [];
  const selectedId = views.some((view) => view.id === activeSavedViewId) ? activeSavedViewId : "";
  elements.savedViewSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("savedViews");
  elements.savedViewSelect.append(placeholder);

  views.forEach((view) => {
    const option = document.createElement("option");
    option.value = view.id;
    option.textContent = view.name;
    elements.savedViewSelect.append(option);
  });

  elements.savedViewSelect.value = selectedId;
  if (elements.deleteViewButton) {
    elements.deleteViewButton.disabled = !selectedId;
  }
}

async function saveCurrentView() {
  const defaultName = createSavedViewDefaultName();
  const name = prompt(t("savedViewPrompt"), defaultName)?.trim();
  if (!name) return;

  const view = {
    id: `view-${Date.now().toString(36)}`,
    name,
    selectedCategory: state.selectedCategory || DEFAULT_STATE.selectedCategory,
    layout: state.layout,
    panelRatio: state.panelRatio,
    density: state.density,
    sortMode: state.sortMode,
    trayMode,
    query: elements.searchInput.value.trim()
  };
  state.savedViews = normalizeSavedViews([...(state.savedViews || []), view]).slice(-SAVED_VIEW_LIMIT);
  activeSavedViewId = view.id;
  await saveState();
  renderSavedViewControls();
}

function createSavedViewDefaultName() {
  const parts = [];
  if (trayMode) {
    parts.push(t("trayLabel"));
  } else if (state.selectedCategory && state.selectedCategory !== "all") {
    parts.push(displayCategoryName(state.selectedCategory));
  } else {
    parts.push(t("savedViewDefault"));
  }
  const query = elements.searchInput.value.trim();
  if (query) parts.push(`"${query}"`);
  parts.push(getSortLabel(state.sortMode));
  return parts.join(" / ");
}

async function applySavedView(id) {
  const view = (state.savedViews || []).find((item) => item.id === id);
  if (!view) {
    activeSavedViewId = "";
    renderSavedViewControls();
    return;
  }

  activeSavedViewId = view.id;
  trayMode = !!view.trayMode;
  state.selectedCategory = isHiddenCategory(view.selectedCategory) ? getFallbackSelectedCategory() : view.selectedCategory || getFallbackSelectedCategory();
  state.layout = view.layout === "list" ? "list" : "grouped";
  state.panelRatio = PANEL_RATIO_MODES.has(view.panelRatio) ? view.panelRatio : DEFAULT_STATE.panelRatio;
  state.density = view.density === "compact" ? "compact" : "cards";
  state.sortMode = SORT_MODES.has(view.sortMode) ? view.sortMode : DEFAULT_STATE.sortMode;
  normalizeConcreteSelectedCategory({ replaceAll: true, persist: false });
  if (elements.searchInput) elements.searchInput.value = view.query || "";
  await saveState();
  render();
}

async function deleteActiveSavedView() {
  const id = elements.savedViewSelect?.value || activeSavedViewId;
  if (!id) return;
  state.savedViews = (state.savedViews || []).filter((view) => view.id !== id);
  if (activeSavedViewId === id) activeSavedViewId = "";
  await saveState();
  renderSavedViewControls();
}

function renderGenres(categories) {
  const scrollTop = elements.genreList.scrollTop;
  elements.genreList.innerHTML = "";
  elements.genreList.append(createGenreButton("all", t("all"), bookmarks.length));
  categories.forEach((category) => elements.genreList.append(createGenreButton(category.name, displayCategoryName(category.name), category.count)));
  restoreScrollTop(elements.genreList, scrollTop);
}

function createGenreButton(value, label, count) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "genre-chip";
  button.draggable = value !== "all";
  const isActive = !trayMode && state.selectedCategory === value && !(requiresCategorySelection() && value === "all");
  button.dataset.active = isActive ? "true" : "false";
  button.innerHTML = `<span class="genre-label"></span><span class="genre-count"></span>`;
  button.querySelector(".genre-label").textContent = label;
  button.querySelector(".genre-count").textContent = count;
  button.addEventListener("click", async () => {
    if (!trayMode && state.selectedCategory === value) return;
    const hydrateQuickStack = quickStackDeferred && value !== "all";
    trayMode = false;
    state.selectedCategory = value;
    await saveState();
    render({ preserveScroll: true, skipQuickStack: true });
    if (hydrateQuickStack) scheduleQuickStackHydration();
  });
  button.addEventListener("dragstart", () => {
    if (value === "all") return;
    dragCategoryName = value;
    setDragUi("genre");
    button.classList.add("dragging");
  });
  button.addEventListener("dragend", () => {
    dragCategoryName = null;
    endDragUi();
    button.classList.remove("dragging");
  });
  button.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    setDropTarget(button, true);
  });
  button.addEventListener("dragleave", (event) => {
    if (!button.contains(event.relatedTarget)) setDropTarget(button, false);
  });
  button.addEventListener("drop", async (event) => {
    event.preventDefault();
    setDropTarget(button, false);
    if (dragCategoryName && value !== "all") {
      await reorderCategory(dragCategoryName, value);
      return;
    }
    if (dragBookmarkId) await moveBookmarkToCategory(dragBookmarkId, value === "all" ? "未分類" : value);
  });
  return button;
}

function restoreScrollTop(element, scrollTop) {
  const applyScrollTop = () => {
    const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
    element.scrollTop = Math.min(scrollTop, maxScrollTop);
  };
  applyScrollTop();
  requestAnimationFrame(applyScrollTop);
  requestAnimationFrame(() => requestAnimationFrame(applyScrollTop));
  [80, 180, 360, 720].forEach((delay) => setTimeout(applyScrollTop, delay));
}

function captureScrollSnapshot() {
  return [
    elements.bookmarkSections,
    elements.frequentList,
    elements.recentList,
    elements.genreList,
    document.querySelector(".content")
  ]
    .filter(Boolean)
    .map((element) => ({
      element,
      top: element.scrollTop,
      left: element.scrollLeft
    }));
}

function restoreScrollSnapshot(snapshot = []) {
  snapshot.forEach(({ element, top, left }) => {
    if (!element?.isConnected) return;
    restoreScrollTop(element, top);
    const applyScrollLeft = () => {
      const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
      element.scrollLeft = Math.min(left, maxScrollLeft);
    };
    applyScrollLeft();
    requestAnimationFrame(applyScrollLeft);
  });
}

function refreshSelectionUi(changedIds = null) {
  pruneSelection();
  elements.app.dataset.deleteMode = deleteMode ? "true" : "false";
  elements.app.dataset.batchMode = batchMode ? "true" : "false";
  elements.app.dataset.managementMode = isManagementMode() ? "true" : "false";
  const targetCards = changedIds
    ? [...document.querySelectorAll(".bookmark-card")].filter((card) => changedIds.includes(card.dataset.bookmarkId))
    : [...document.querySelectorAll(".bookmark-card")];
  targetCards.forEach(updateBookmarkCardSelectionState);
  renderBatchBar(getVisibleBookmarksForRender(), getCategoryNames());
  updateButtons();
}

function updateBookmarkCardSelectionState(card) {
  const id = card.dataset.bookmarkId;
  const selected = selectedIds.has(id);
  card.dataset.selected = selected ? "true" : "false";
  const selectButton = card.querySelector(".select-card-button");
  if (selectButton) selectButton.textContent = selected ? "☑" : "□";
}

function toggleBatchMode() {
  batchMode = !batchMode;
  if (batchMode) {
    deleteMode = false;
    selectedIds = new Set(getVisibleBookmarksForRender().map((bookmark) => bookmark.id));
  } else {
    selectedIds.clear();
  }
  render({ preserveScroll: true });
}

async function toggleTrayMode() {
  trayMode = !trayMode;
  if (trayMode) {
    state.selectedCategory = "all";
    await saveState();
  } else {
    normalizeConcreteSelectedCategory({ replaceAll: true });
  }
  render();
}

function toggleBookmarkSelection(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }
  refreshSelectionUi([id]);
}

function pruneSelection() {
  const validIds = getBookmarkIdSet();
  selectedIds = new Set([...selectedIds].filter((id) => validIds.has(id)));
}

function pruneLinkStatuses() {
  const validIds = getBookmarkIdSet();
  linkStatuses = new Map([...linkStatuses.entries()].filter(([id]) => validIds.has(id)));
}

function getLinkCheckSummary(visible) {
  const checked = visible.map((bookmark) => linkStatuses.get(bookmark.id)).filter(Boolean);
  if (!checked.length && !linkCheckRunning) return "";
  const checkingCount = checked.filter((status) => status.status === "checking").length;
  const brokenCount = checked.filter((status) => status.status === "broken").length;
  const unknownCount = checked.filter((status) => status.status === "unknown").length;
  if (linkCheckRunning) return t("linkCheckingSummary", { checked: checked.length - checkingCount, total: visible.length });
  if (unknownCount) return t("linkBrokenUnknownSummary", { broken: brokenCount, unknown: unknownCount });
  return t("linkBrokenSummary", { broken: brokenCount });
}

async function checkVisibleLinks() {
  if (linkCheckRunning) return;
  const visible = getVisibleBookmarksForRender();
  if (!visible.length) return;
  linkCheckRunning = true;
  visible.forEach((bookmark) => {
    linkStatuses.set(bookmark.id, { status: "checking", detail: t("linkCheckingDetail") });
  });
  render();

  await runWithConcurrency(visible, LINK_CHECK_CONCURRENCY, async (bookmark) => {
    const result = await checkBookmarkLink(bookmark.url);
    linkStatuses.set(bookmark.id, result);
  });

  linkCheckRunning = false;
  render();
}

async function runWithConcurrency(items, limit, worker) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(workers);
}

async function checkBookmarkLink(url) {
  if (!/^https?:\/\//i.test(url)) {
    return { status: "unknown", detail: t("linkUnknownProtocol") };
  }

  try {
    const response = await fetchLink(url, "HEAD");
    if ([401, 403, 405].includes(response.status)) {
      return await checkBookmarkLinkWithGet(url);
    }
    return linkResponseToStatus(response);
  } catch (error) {
    return await checkBookmarkLinkWithGet(url, error);
  }
}

async function checkBookmarkLinkWithGet(url, previousError) {
  try {
    return linkResponseToStatus(await fetchLink(url, "GET"));
  } catch (error) {
    return {
      status: "broken",
      detail: humanizeLinkError(error || previousError)
    };
  }
}

async function fetchLink(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function linkResponseToStatus(response) {
  if (response.type === "opaque") {
    return { status: "unknown", detail: t("linkOpaque") };
  }
  if (response.status >= 200 && response.status < 400) {
    return { status: "ok", detail: `HTTP ${response.status}` };
  }
  if (response.status === 0) {
    return { status: "unknown", detail: t("linkNoStatus") };
  }
  return { status: "broken", detail: `HTTP ${response.status}` };
}

function humanizeLinkError(error) {
  if (error?.name === "AbortError") return t("linkTimeout");
  return t("linkConnectError");
}

function getLinkStatusLabel(status) {
  if (status === "ok") return t("linkOkTag");
  if (status === "broken") return t("linkBrokenTag");
  if (status === "checking") return t("linkCheckingTag");
  return t("linkUnknownTag");
}

function renderBatchBar(visible, categoryNames) {
  if (!elements.batchBar) return;
  elements.batchBar.classList.toggle("hidden", !batchMode);
  if (!batchMode) return;

  const selectedCount = selectedIds.size;
  elements.selectedCountText.textContent = t("selectedCount", { count: selectedCount });
  const fallbackCategory = state.selectedCategory === "all" ? "未分類" : state.selectedCategory;
  if (!batchTargetCategory || !categoryNames.includes(batchTargetCategory)) {
    batchTargetCategory = categoryNames.includes(fallbackCategory) ? fallbackCategory : "未分類";
  }
  populateCategorySelect(elements.batchCategorySelect, batchTargetCategory, categoryNames);
  const hasSelection = selectedCount > 0;
  [elements.clearSelectionButton, elements.batchMoveButton, elements.batchPinButton, elements.batchUnpinButton, elements.batchDeleteButton]
    .forEach((button) => {
      if (button) button.disabled = !hasSelection;
    });
  if (elements.selectVisibleButton) {
    elements.selectVisibleButton.disabled = visible.length === 0;
  }
}

function selectVisibleBookmarks() {
  getVisibleBookmarksForRender().forEach((bookmark) => selectedIds.add(bookmark.id));
  batchMode = true;
  refreshSelectionUi();
}

function clearSelection() {
  selectedIds.clear();
  refreshSelectionUi();
}

function isManagementMode() {
  return batchMode || deleteMode || trayMode || linkCheckRunning || linkStatuses.size > 0;
}

function shouldUseLightweightBookmarkCards(options = {}) {
  return !options.frequent && !isManagementMode();
}

async function moveSelectedBookmarks() {
  const category = elements.batchCategorySelect?.value || batchTargetCategory || "未分類";
  batchTargetCategory = category;
  const ids = [...selectedIds];
  if (!ids.length) return;
  selectedIds.clear();
  const movedCount = await moveBookmarksToCategory(ids, category);
  if (!movedCount) render();
}

async function pinSelectedBookmarks(pinned) {
  const ids = [...selectedIds];
  if (!ids.length) return;
  setUndo({
    type: "pin",
    label: pinned ? t("pinUndo") : t("unpinUndo"),
    pinnedOrder: normalizeIdList(state.pinnedOrder),
    previous: ids.map((id) => ({ id, pinned: !!state.pinned[id] }))
  });
  ids.forEach((id) => {
    setBookmarkPinnedState(id, pinned);
  });
  markUsageStateDirty();
  await saveState();
  render();
}

async function deleteSelectedBookmarks() {
  const ids = [...selectedIds];
  if (!ids.length) return;
  if (!confirm(t("deleteSelectedConfirm", { count: ids.length }))) return;
  selectedIds.clear();
  await deleteBookmarksByIds(ids, { skipConfirm: true });
}

function getDuplicateUrlSet(items) {
  if (items === bookmarks && duplicateUrlSetCache) return duplicateUrlSetCache;
  const counts = new Map();
  items.forEach((bookmark) => {
    const key = normalizeUrl(bookmark.url);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const duplicateUrls = new Set([...counts.entries()].filter(([, count]) => count > 1).map(([url]) => url));
  if (items === bookmarks) duplicateUrlSetCache = duplicateUrls;
  return duplicateUrls;
}

function getTrayReasons(bookmark, duplicateUrls) {
  const reasons = [];
  if (bookmark.category === "未分類") reasons.push(t("uncategorized"));
  if (duplicateUrls.has(normalizeUrl(bookmark.url))) reasons.push(t("duplicateUrl"));
  return reasons;
}

function getTrayBookmarks() {
  duplicateUrlSet = getDuplicateUrlSet(bookmarks);
  return bookmarks.filter((bookmark) => getTrayReasons(bookmark, duplicateUrlSet).length > 0).sort(sortBookmarks);
}

async function reorderCategory(sourceName, targetName) {
  if (!sourceName || !targetName || sourceName === targetName) return;
  const names = getCategoryNames();
  const nextOrder = names.filter((name) => name !== sourceName);
  const targetIndex = nextOrder.indexOf(targetName);
  nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, sourceName);
  state.categoryOrder = nextOrder;
  markCategoryStateDirty("categoryOrder");
  await saveState();
  render();
}

function normalizeUrl(url) {
  if (normalizedUrlCache.has(url)) return normalizedUrlCache.get(url);
  let normalized = url;
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.searchParams.sort();
    normalized = parsed.toString().replace(/\/$/, "");
  } catch {
    normalized = url;
  }
  normalizedUrlCache.set(url, normalized);
  return normalized;
}

function renderSections(items, categories, categoryNames) {
  elements.bookmarkSections.innerHTML = "";
  if (shouldShowCategorySelectionPrompt()) {
    elements.bookmarkSections.append(emptyMessage(t("selectGenrePrompt")));
    return;
  }

  if (!items.length) {
    elements.bookmarkSections.append(emptyMessage(t("noBookmarks")));
    return;
  }

  const searchQuery = elements.searchInput.value.trim();
  if (state.layout === "list" || searchQuery) {
    const title = searchQuery ? t("searchResultsTitle") : t("listTitle", { sort: getSortLabel(state.sortMode) });
    const section = createSection(title, items.length, getVisibleLimit(getSectionKey("list", title), items.length));
    elements.bookmarkSections.append(section);
    renderSectionBookmarks(section, items, getSectionKey("list", title), categoryNames);
    return;
  }

  if (!trayMode && state.selectedCategory !== "all") {
    const sectionKey = getSectionKey("category", state.selectedCategory);
    const section = createSection(state.selectedCategory, items.length, getVisibleLimit(sectionKey, items.length));
    section.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      if (dragBookmarkId) setDropTarget(section, true);
    });
    section.addEventListener("dragleave", (event) => {
      if (!section.contains(event.relatedTarget)) setDropTarget(section, false);
    });
    section.addEventListener("drop", async (event) => {
      event.preventDefault();
      setDropTarget(section, false);
      if (dragBookmarkId) await moveBookmarkToCategory(dragBookmarkId, state.selectedCategory);
    });
    elements.bookmarkSections.append(section);
    renderSectionBookmarks(section, items, sectionKey, categoryNames);
    return;
  }

  const itemsByCategory = groupBookmarksByCategory(items);
  categories.forEach((category) => {
    const categoryItems = itemsByCategory.get(category.name) || [];
    if (!categoryItems.length) return;
    const sectionKey = getSectionKey("category", category.name);
    const section = createSection(category.name, categoryItems.length, getVisibleLimit(sectionKey, categoryItems.length));
    section.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      if (dragBookmarkId) setDropTarget(section, true);
    });
    section.addEventListener("dragleave", (event) => {
      if (!section.contains(event.relatedTarget)) setDropTarget(section, false);
    });
    section.addEventListener("drop", async (event) => {
      event.preventDefault();
      setDropTarget(section, false);
      if (dragBookmarkId) await moveBookmarkToCategory(dragBookmarkId, category.name);
    });
    elements.bookmarkSections.append(section);
    renderSectionBookmarks(section, categoryItems, sectionKey, categoryNames);
  });
}

function groupBookmarksByCategory(items) {
  const groups = new Map();
  items.forEach((bookmark) => {
    if (!groups.has(bookmark.category)) groups.set(bookmark.category, []);
    groups.get(bookmark.category).push(bookmark);
  });
  return groups;
}

function createSection(title, count, shown = count) {
  const section = document.createElement("section");
  section.className = "bookmark-section";
  section.innerHTML = `<div class="section-heading"><h2></h2><span class="count"></span></div><div class="bookmark-grid"></div>`;
  section.querySelector("h2").textContent = title;
  section.querySelector(".count").textContent = shown < count ? t("partialCount", { shown, total: count }) : t("count", { count });
  return section;
}

function renderSectionBookmarks(section, items, sectionKey, categoryNames) {
  const grid = section.querySelector(".bookmark-grid");
  const lightweight = shouldUseLightweightBookmarkCards();
  const limit = getVisibleLimit(sectionKey, items.length);
  const shownItems = items.slice(0, limit);
  const renderOptions = {
    categoryNames,
    lightweight,
    firstChunk: lightweight ? LIGHTWEIGHT_CARD_RENDER_CHUNK_SIZE : undefined,
    chunkSize: lightweight ? LIGHTWEIGHT_CARD_RENDER_CHUNK_SIZE : undefined
  };
  appendBookmarkCardsInChunks(grid, shownItems, renderOptions);
  if (shownItems.length < items.length) {
    section.append(createShowMoreButton(section, sectionKey, shownItems.length, items.length, items, categoryNames, renderOptions));
  }
}

function getSectionKey(kind, name) {
  const query = elements.searchInput.value.trim().toLowerCase();
  return [kind, name, state.selectedCategory, state.layout, state.sortMode, trayMode ? "tray" : "normal", query].join("::");
}

function getVisibleLimit(sectionKey, total) {
  const defaultLimit = shouldUseLightweightBookmarkCards()
    ? (initialRenderLimited ? LIGHTWEIGHT_INITIAL_SECTION_PAGE_SIZE : LIGHTWEIGHT_SECTION_PAGE_SIZE)
    : (initialRenderLimited ? INITIAL_SECTION_PAGE_SIZE : SECTION_PAGE_SIZE);
  return Math.min(total, sectionVisibleLimits.get(sectionKey) || defaultLimit);
}

function appendBookmarkCardsInChunks(container, items, options = {}) {
  const generation = renderGeneration;
  const firstChunk = Math.min(items.length, options.firstChunk || CARD_RENDER_CHUNK_SIZE);
  appendBookmarkCardRange(container, items, 0, firstChunk, options);
  let index = firstChunk;
  const chunkSize = options.chunkSize || CARD_RENDER_CHUNK_SIZE;

  const appendNextChunk = () => {
    if (generation !== renderGeneration || !container.isConnected) return;
    const nextIndex = Math.min(items.length, index + chunkSize);
    appendBookmarkCardRange(container, items, index, nextIndex, options);
    index = nextIndex;
    if (index < items.length) {
      runWhenIdle(appendNextChunk, 180);
    }
  };

  if (index < items.length) {
    runWhenIdle(appendNextChunk, 180);
  }
}

function appendBookmarkCardRange(container, items, start, end, options) {
  if (start >= end) return;
  const fragment = document.createDocumentFragment();
  for (let index = start; index < end; index += 1) {
    fragment.append(createBookmarkCard(items[index], options));
  }
  container.append(fragment);
}

function createShowMoreButton(section, sectionKey, shown, total, items, categoryNames, renderOptions = { categoryNames }) {
  const button = document.createElement("button");
  let currentShown = shown;
  button.type = "button";
  button.className = "show-more-button";
  const updateButton = () => {
    const pageSize = renderOptions.lightweight ? LIGHTWEIGHT_SECTION_PAGE_SIZE : SECTION_PAGE_SIZE;
    const nextCount = Math.min(pageSize, total - currentShown);
    button.textContent = t("showMore", { count: nextCount, remaining: total - currentShown });
  };
  updateButton();
  button.addEventListener("click", () => {
    const grid = section.querySelector(".bookmark-grid");
    const pageSize = renderOptions.lightweight ? LIGHTWEIGHT_SECTION_PAGE_SIZE : SECTION_PAGE_SIZE;
    const nextShown = Math.min(total, currentShown + pageSize);
    sectionVisibleLimits.set(sectionKey, nextShown);
    appendBookmarkCardsInChunks(grid, items.slice(currentShown, nextShown), renderOptions);
    currentShown = nextShown;
    const countNode = section.querySelector(".count");
    if (countNode) {
      countNode.textContent = currentShown < total ? t("partialCount", { shown: currentShown, total }) : t("count", { count: total });
    }
    if (currentShown >= total) {
      button.remove();
      return;
    }
    updateButton();
  });
  return button;
}

function createLightweightBookmarkCard(bookmark) {
  const card = document.createElement("article");
  card.className = "bookmark-card";
  card.dataset.lite = "true";
  card.dataset.bookmarkId = bookmark.id;
  card.dataset.pinned = state.pinned[bookmark.id] ? "true" : "false";
  card.dataset.selected = selectedIds.has(bookmark.id) ? "true" : "false";
  card.draggable = true;
  const linkStatus = linkStatuses.get(bookmark.id);
  if (linkStatus) card.dataset.linkStatus = linkStatus.status;
  const host = safeHost(bookmark.url);
  const pinned = !!state.pinned[bookmark.id];
  card.innerHTML = `
    <button class="preview" type="button" title="開く" aria-label="開く"><img class="favicon" alt="" loading="lazy"></button>
    <div class="bookmark-body">
      <button class="bookmark-title" type="button"></button>
      <div class="bookmark-meta"></div>
    </div>
    <button class="icon-button pin-button quick-pin-button" type="button"></button>
    <span class="tag category-tag"></span>`;
  queueLazyFavicon(card.querySelector(".favicon"), bookmark.url);
  card.querySelector(".bookmark-title").textContent = bookmark.title;
  card.querySelector(".bookmark-title").title = bookmark.title;
  card.querySelector(".bookmark-meta").textContent = host || bookmark.url;
  card.querySelector(".category-tag").textContent = displayCategoryName(bookmark.category);
  const pinButton = card.querySelector(".pin-button");
  setPinStateIcon(pinButton, pinned);
  pinButton.dataset.active = pinned ? "true" : "false";
  pinButton.setAttribute("aria-pressed", pinned ? "true" : "false");
  setControlLabel(pinButton, pinned ? t("unpin") : t("pin"));
  setControlLabel(card.querySelector(".preview"), t("open"));
  card.addEventListener("dragstart", (event) => {
    dragBookmarkId = bookmark.id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", bookmark.id);
    }
    setDragUi("bookmark");
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    dragBookmarkId = null;
    endDragUi();
    card.classList.remove("dragging");
  });
  card.addEventListener("click", (event) => {
    if (isInteractiveCardTarget(event.target)) return;
    handlePrimaryBookmarkAction(bookmark);
  });
  card.addEventListener("contextmenu", (event) => handleBookmarkContextOpen(event, bookmark));
  card.querySelector(".preview").addEventListener("click", () => handlePrimaryBookmarkAction(bookmark));
  card.querySelector(".bookmark-title").addEventListener("click", () => handlePrimaryBookmarkAction(bookmark));
  pinButton.addEventListener("click", () => toggleBookmarkPinned(bookmark));
  return card;
}

function createBookmarkCard(bookmark, options = {}) {
  if (options.lightweight) return createLightweightBookmarkCard(bookmark);
  const card = document.createElement("article");
  card.className = "bookmark-card";
  card.dataset.bookmarkId = bookmark.id;
  if (options.frequent) card.dataset.frequent = "true";
  const pinned = !!state.pinned[bookmark.id];
  card.dataset.pinned = pinned ? "true" : "false";
  card.draggable = true;
  card.dataset.selected = selectedIds.has(bookmark.id) ? "true" : "false";
  const linkStatus = linkStatuses.get(bookmark.id);
  if (linkStatus) card.dataset.linkStatus = linkStatus.status;
  const host = safeHost(bookmark.url);
  card.innerHTML = `
    <button class="preview" type="button" title="開く" aria-label="開く"><img class="favicon" alt="" loading="lazy"><span class="preview-domain"></span></button>
    <div class="bookmark-body">
      <button class="bookmark-title" type="button"></button>
      <div class="bookmark-meta"></div>
      <div class="bookmark-tags"><span class="tag category-tag"></span><select class="category-select"></select><span class="tag folder-tag"></span><span class="tag link-status-tag"></span></div>
    </div>
    <div class="card-actions">
      <button class="icon-button select-card-button" type="button" title="選択" aria-label="選択">□</button>
      <button class="icon-button pin-button" type="button"></button>
      <button class="icon-button edit-card-button" type="button" title="編集" aria-label="編集">✎</button>
      <button class="icon-button open-card-button" type="button" title="開く" aria-label="開く">↗</button>
      <button class="icon-button delete-card-button" type="button" title="削除" aria-label="削除">${TRASH_ICON}</button>
    </div>`;
  queueLazyFavicon(card.querySelector(".favicon"), bookmark.url);
  card.querySelector(".preview-domain").textContent = host;
  card.querySelector(".bookmark-title").textContent = bookmark.title;
  card.querySelector(".bookmark-meta").textContent = bookmark.url;
  card.querySelector(".category-tag").textContent = displayCategoryName(bookmark.category);
  card.querySelector(".folder-tag").textContent = bookmark.folderPath;
  const statusTag = card.querySelector(".link-status-tag");
  if (linkStatus) {
    statusTag.textContent = getLinkStatusLabel(linkStatus.status);
    statusTag.dataset.status = linkStatus.status;
    statusTag.title = linkStatus.detail || getLinkStatusLabel(linkStatus.status);
  } else {
    statusTag.remove();
  }
  card.querySelector(".select-card-button").textContent = selectedIds.has(bookmark.id) ? "☑" : "□";
  const pinButton = card.querySelector(".pin-button");
  setPinStateIcon(pinButton, pinned);
  pinButton.dataset.active = pinned ? "true" : "false";
  pinButton.setAttribute("aria-pressed", pinned ? "true" : "false");
  setControlLabel(card.querySelector(".preview"), t("open"));
  setControlLabel(card.querySelector(".select-card-button"), t("select"));
  setControlLabel(pinButton, pinned ? t("unpin") : t("pin"));
  setControlLabel(card.querySelector(".edit-card-button"), t("edit"));
  setControlLabel(card.querySelector(".open-card-button"), t("open"));
  setControlLabel(card.querySelector(".delete-card-button"), t("delete"));
  populateCategorySelect(card.querySelector(".category-select"), bookmark.category, options.categoryNames);
  if (trayMode) {
    getTrayReasons(bookmark, duplicateUrlSet).forEach((reason) => {
      const tag = document.createElement("span");
      tag.className = "tag tray-reason-tag";
      tag.textContent = reason;
      card.querySelector(".bookmark-tags").append(tag);
    });
  }
  card.addEventListener("dragstart", (event) => {
    dragBookmarkId = bookmark.id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", bookmark.id);
    }
    setDragUi("bookmark");
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    dragBookmarkId = null;
    endDragUi();
    clearFrequentDragIndicators();
    card.classList.remove("dragging");
  });
  if (options.frequent) {
    card.addEventListener("dragover", (event) => {
      if (!dragBookmarkId || dragBookmarkId === bookmark.id) return;
      if (!!state.pinned[dragBookmarkId] !== pinned) return;
      event.preventDefault();
      event.stopPropagation();
      const position = getFrequentDropPosition(event, card);
      if (frequentDragTargetId && frequentDragTargetId !== bookmark.id) {
        clearFrequentDragIndicators();
      }
      frequentDragTargetId = bookmark.id;
      card.dataset.dropPosition = position;
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    card.addEventListener("dragleave", (event) => {
      if (event.relatedTarget && card.contains(event.relatedTarget)) return;
      delete card.dataset.dropPosition;
      if (frequentDragTargetId === bookmark.id) frequentDragTargetId = null;
    });
    card.addEventListener("drop", async (event) => {
      if (!dragBookmarkId || dragBookmarkId === bookmark.id) return;
      event.preventDefault();
      event.stopPropagation();
      const sourceId = dragBookmarkId;
      const position = getFrequentDropPosition(event, card);
      clearFrequentDragIndicators();
      await reorderFrequentBookmarks(sourceId, bookmark.id, position);
    });
    card.addEventListener("click", (event) => {
      if (deleteMode || isInteractiveCardTarget(event.target)) return;
      handlePrimaryBookmarkAction(bookmark);
    });
  }
  card.addEventListener("contextmenu", (event) => handleBookmarkContextOpen(event, bookmark));
  card.querySelector(".preview").addEventListener("click", () => handlePrimaryBookmarkAction(bookmark));
  card.querySelector(".bookmark-title").addEventListener("click", () => handlePrimaryBookmarkAction(bookmark));
  card.querySelector(".select-card-button").addEventListener("click", () => toggleBookmarkSelection(bookmark.id));
  card.querySelector(".open-card-button").addEventListener("click", () => openBookmark(bookmark));
  card.querySelector(".delete-card-button").addEventListener("click", () => deleteBookmark(bookmark.id, bookmark.title, { skipConfirm: true }));
  card.querySelector(".edit-card-button").addEventListener("click", () => openEditDialog(bookmark));
  pinButton.addEventListener("click", () => toggleBookmarkPinned(bookmark));
  card.querySelector(".category-select").addEventListener("change", (event) => moveBookmarkToCategory(bookmark.id, event.target.value));
  return card;
}

async function toggleBookmarkPinned(bookmark) {
  const id = String(bookmark?.id || "");
  if (!id) return;
  const wasPinned = !!state.pinned[id];
  setUndo({
    type: "pin",
    label: wasPinned ? t("unpinUndo") : t("pinUndo"),
    pinnedOrder: normalizeIdList(state.pinnedOrder),
    previous: [{ id, pinned: wasPinned }]
  });
  setBookmarkPinnedState(id, !wasPinned);
  markUsageStateDirty();
  await saveState();
  render();
}

function isInteractiveCardTarget(target) {
  return !!target?.closest?.("button, select, input, textarea, a, label");
}

function isContextMenuControlTarget(target) {
  return !!target?.closest?.(
    "select, input, textarea, label, .select-card-button, .pin-button, .edit-card-button, .open-card-button, .delete-card-button"
  );
}

function handleBookmarkContextOpen(event, bookmark) {
  if (isContextMenuControlTarget(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
  openBookmarkInNewTabOnly(bookmark).catch(() => {});
}

async function handlePrimaryBookmarkAction(bookmark) {
  if (batchMode) {
    toggleBookmarkSelection(bookmark.id);
    return;
  }
  await openBookmark(bookmark);
}

async function openBookmark(bookmark) {
  const currentWindow = await chrome.windows.getCurrent();
  const targetWindow = await getBookmarkTargetWindow(currentWindow);

  if (SURFACE === "overlay" && state.openBehavior === "same-tab-keep") {
    state.preserveSelectedCategoryOnce = true;
    await recordBookmarkOpen(bookmark);
    const openedNewTab = await openBookmarkInCurrentTabKeepingOverlay(bookmark.url, targetWindow);
    if (openedNewTab) {
      state.preserveSelectedCategoryOnce = false;
      await saveState();
      await closeBookmarkShelf(currentWindow, targetWindow);
    }
    return;
  }

  await recordBookmarkOpen(bookmark);

  if (state.openBehavior === "new-tab-close") {
    await openBookmarkInNewTab(bookmark.url, targetWindow);
    await closeBookmarkShelf(currentWindow, targetWindow);
    return;
  }

  await openBookmarkInCurrentTab(bookmark.url, targetWindow);
  if (state.openBehavior === "same-tab-close" || currentWindow?.type === "popup") {
    await closeBookmarkShelf(currentWindow, targetWindow);
  }
}

async function openBookmarkInNewTabOnly(bookmark) {
  await recordBookmarkOpen(bookmark);
  const currentWindow = await chrome.windows.getCurrent();
  const targetWindow = await getBookmarkTargetWindow(currentWindow);
  await openBookmarkInNewTab(bookmark.url, targetWindow);
  await closeBookmarkShelf(currentWindow, targetWindow);
}

async function recordBookmarkOpen(bookmark) {
  state.usage[bookmark.id] = { count: (state.usage[bookmark.id]?.count || 0) + 1, lastOpenedAt: Date.now() };
  markUsageStateDirty();
  await saveState();
}

async function getBookmarkTargetWindow(currentWindow) {
  if (currentWindow?.id && currentWindow.type === "normal") {
    return currentWindow;
  }

  const focusedWindow = await chrome.windows.getLastFocused({ windowTypes: ["normal"] }).catch(() => null);
  if (focusedWindow?.id) return focusedWindow;
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] }).catch(() => []);
  return windows[0] || currentWindow;
}

async function openBookmarkInNewTab(url, targetWindow) {
  if (targetWindow?.id && targetWindow.type !== "popup") {
    await chrome.tabs.create({ windowId: targetWindow.id, url, active: true });
    await chrome.windows.update(targetWindow.id, { focused: true }).catch(() => {});
    return;
  }

  await chrome.tabs.create({ url, active: true });
}

async function openBookmarkInCurrentTab(url, targetWindow) {
  if (!targetWindow?.id || targetWindow.type === "popup") {
    await chrome.tabs.create({ url, active: true });
    return;
  }

  const [activeTab] = await chrome.tabs.query({ active: true, windowId: targetWindow.id });
  if (activeTab?.id) {
    await chrome.tabs.update(activeTab.id, { url, active: true });
    await chrome.windows.update(targetWindow.id, { focused: true }).catch(() => {});
    return;
  }

  await chrome.tabs.create({ windowId: targetWindow.id, url, active: true });
  await chrome.windows.update(targetWindow.id, { focused: true }).catch(() => {});
}

async function openBookmarkInCurrentTabKeepingOverlay(url, targetWindow) {
  if (!targetWindow?.id || targetWindow.type === "popup") {
    await openBookmarkInNewTab(url, targetWindow);
    return true;
  }

  const [activeTab] = await chrome.tabs.query({ active: true, windowId: targetWindow.id });
  if (!activeTab?.id) {
    await openBookmarkInNewTab(url, targetWindow);
    return true;
  }

  const response = await chrome.runtime.sendMessage({
    type: "open-bookmark-keep-overlay",
    tabId: activeTab.id,
    windowId: targetWindow.id,
    url
  }).catch(() => null);

  if (!response?.ok) {
    await openBookmarkInCurrentTab(url, targetWindow);
  }
  return false;
}

async function closeBookmarkShelf(currentWindow, targetWindow) {
  await animateShelfClose();
  if (SURFACE === "overlay") {
    window.parent.postMessage({ type: "bookmark-shelf-close-overlay" }, "*");
    return;
  }

  if (currentWindow?.type === "popup") {
    await chrome.windows.remove(currentWindow.id);
  } else {
    await chrome.runtime.sendMessage({ type: "close-bookmark-shelf", windowId: currentWindow?.id || targetWindow?.id }).catch(() => {});
    window.close();
  }
}

function openEditDialog(bookmark) {
  renderCategoryOptions();
  elements.editId.value = bookmark.id;
  elements.editTitle.value = bookmark.title;
  elements.editUrl.value = bookmark.url;
  elements.editCategory.value = bookmark.category;
  elements.editPinned.checked = !!state.pinned[bookmark.id];
  elements.editDialog.showModal();
}

async function saveEdit() {
  const id = elements.editId.value;
  const title = elements.editTitle.value.trim();
  const url = elements.editUrl.value.trim();
  const category = elements.editCategory.value.trim() || "未分類";
  await chrome.bookmarks.update(id, { title, url });
  ensureCustomCategory(category);
  state.categories[id] = category;
  markCategoryStateDirty("categories");
  setBookmarkPinnedState(id, elements.editPinned.checked);
  markUsageStateDirty();
  await saveState();
  elements.editDialog.close();
  await loadBookmarks();
  render();
}

async function deleteCurrentBookmark() {
  await deleteBookmark(elements.editId.value, elements.editTitle.value, { skipConfirm: deleteMode });
}

async function deleteBookmark(id, title = "", options = {}) {
  if (!options.skipConfirm && !confirm(t("deleteBookmarkConfirm", { title }))) return;
  await deleteBookmarksByIds([id], { skipConfirm: true });
  if (elements.editDialog.open) elements.editDialog.close();
}

async function moveBookmarkToCategory(id, category) {
  await moveBookmarksToCategory([id], category);
}

async function moveBookmarksToCategory(ids, category, options = {}) {
  const targets = ids.map((id) => bookmarks.find((bookmark) => bookmark.id === id)).filter(Boolean);
  if (!targets.length) return 0;
  const destination = category || "未分類";
  ensureCustomCategory(destination);
  if (!options.skipUndo) {
    setUndo({
      type: "category",
      label: t("categoryMoveUndo"),
      previous: targets.map((bookmark) => ({ id: bookmark.id, category: bookmark.category }))
    });
  }
  targets.forEach((bookmark) => {
    state.categories[bookmark.id] = destination;
  });
  markCategoryStateDirty("categories");
  await saveState();
  await loadBookmarks();
  render({ preserveScroll: true });
  return targets.length;
}

async function deleteBookmarksByIds(ids, options = {}) {
  const targets = ids.map((id) => bookmarks.find((bookmark) => bookmark.id === id)).filter(Boolean);
  if (!targets.length) return 0;
  if (!options.skipConfirm && !confirm(t("deleteTargetsConfirm", { count: targets.length }))) return 0;
  if (!options.skipUndo) {
    setUndo({
      type: "delete",
      label: t("deleteUndo"),
      bookmarks: targets.map(snapshotBookmark)
    });
  }
  for (const bookmark of targets) {
    await chrome.bookmarks.remove(bookmark.id).catch(() => {});
    delete state.categories[bookmark.id];
    setBookmarkPinnedState(bookmark.id, false);
    delete state.usage[bookmark.id];
    selectedIds.delete(bookmark.id);
  }
  const deletedIds = new Set(targets.map((bookmark) => bookmark.id));
  state.frequentOrder = normalizeIdList(state.frequentOrder).filter((id) => !deletedIds.has(id));
  markCategoryStateDirty("categories");
  markUsageStateDirty();
  await saveState();
  await loadBookmarks();
  render({ preserveScroll: true });
  return targets.length;
}

function snapshotBookmark(bookmark) {
  return {
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    parentId: bookmark.parentId,
    index: bookmark.index,
    category: bookmark.category,
    pinned: !!state.pinned[bookmark.id],
    pinnedOrderIndex: normalizeIdList(state.pinnedOrder).indexOf(bookmark.id),
    usage: state.usage[bookmark.id] || null
  };
}

function setUndo(entry) {
  undoEntry = entry;
  updateButtons();
}

async function undoLastAction() {
  if (!undoEntry) return;
  const entry = undoEntry;
  undoEntry = null;

  if (entry.type === "category") {
    entry.previous.forEach((item) => {
      ensureCustomCategory(item.category);
      state.categories[item.id] = item.category;
    });
    markCategoryStateDirty("categories");
  }

  if (entry.type === "pin") {
    entry.previous.forEach((item) => {
      if (item.pinned) {
        state.pinned[item.id] = true;
      } else {
        delete state.pinned[item.id];
      }
    });
    state.pinnedOrder = entry.pinnedOrder
      ? normalizeIdList(entry.pinnedOrder)
      : normalizeIdList(state.pinnedOrder).filter((id) => state.pinned[id]);
    markUsageStateDirty();
  }

  if (entry.type === "delete") {
    for (const snapshot of entry.bookmarks) {
      const created = await restoreDeletedBookmark(snapshot);
      if (!created?.id) continue;
      if (snapshot.category) state.categories[created.id] = snapshot.category;
      if (snapshot.pinned) {
        setBookmarkPinnedState(created.id, true);
        if (snapshot.pinnedOrderIndex >= 0) {
          const nextOrder = normalizeIdList(state.pinnedOrder).filter((id) => id !== created.id);
          nextOrder.splice(Math.min(snapshot.pinnedOrderIndex, nextOrder.length), 0, created.id);
          state.pinnedOrder = nextOrder;
        }
      }
      if (snapshot.usage) state.usage[created.id] = snapshot.usage;
    }
    markCategoryStateDirty("categories");
    markUsageStateDirty();
  }

  await saveState();
  await loadBookmarks();
  render();
}

async function restoreDeletedBookmark(snapshot) {
  const createArgs = {
    parentId: snapshot.parentId,
    title: snapshot.title,
    url: snapshot.url
  };
  if (Number.isInteger(snapshot.index)) {
    createArgs.index = snapshot.index;
  }
  try {
    return await chrome.bookmarks.create(createArgs);
  } catch {
    delete createArgs.index;
    try {
      return await chrome.bookmarks.create(createArgs);
    } catch {
      delete createArgs.parentId;
      return chrome.bookmarks.create(createArgs);
    }
  }
}

function openDomainDialog() {
  renderDomainDialog();
  elements.domainDialog.showModal();
}

function renderDomainDialog() {
  const source = getVisibleBookmarksForRender();
  const categoryNames = getCategoryNames();
  const groups = new Map();
  source.forEach((bookmark) => {
    const host = safeHost(bookmark.url) || t("unknown");
    if (!groups.has(host)) groups.set(host, []);
    groups.get(host).push(bookmark);
  });
  const rows = [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "ja"));

  elements.domainGroupList.innerHTML = "";
  if (!rows.length) {
    elements.domainGroupList.append(emptyMessage(t("noDomainGroups")));
    return;
  }

  rows.forEach(([host, items]) => {
    const suggestedCategory = getDomainCategorySuggestion(host, items, categoryNames);
    const row = document.createElement("div");
    row.className = "domain-row";
    if (suggestedCategory) row.dataset.suggested = "true";
    row.innerHTML = `
      <div class="domain-main"><strong></strong><span></span></div>
      <select></select>
      <button class="icon-button select-domain" type="button">☑</button>
      <button class="icon-button move-domain" type="button">⇄</button>`;
    row.querySelector("strong").textContent = host;
    row.querySelector("span").textContent = suggestedCategory
      ? `${t("count", { count: items.length })} / ${t("domainSuggested", { category: displayCategoryName(suggestedCategory) })}`
      : t("count", { count: items.length });
    setControlLabel(row.querySelector("select"), t("batchDestination"));
    setControlLabel(row.querySelector(".select-domain"), t("selectDomain"));
    setControlLabel(row.querySelector(".move-domain"), t("moveDomain"));
    populateCategorySelect(row.querySelector("select"), suggestedCategory || mostCommonCategory(items), categoryNames);
    row.querySelector(".select-domain").addEventListener("click", () => {
      batchMode = true;
      items.forEach((bookmark) => selectedIds.add(bookmark.id));
      elements.domainDialog.close();
      render();
    });
    row.querySelector(".move-domain").addEventListener("click", async () => {
      await moveBookmarksToCategory(items.map((bookmark) => bookmark.id), row.querySelector("select").value);
      renderDomainDialog();
    });
    elements.domainGroupList.append(row);
  });
}

function mostCommonCategory(items) {
  const counts = new Map();
  items.forEach((bookmark) => counts.set(bookmark.category, (counts.get(bookmark.category) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "未分類";
}

function getDomainCategorySuggestion(host, items, categoryNames) {
  const commonCategory = mostCommonCategory(items);
  if (commonCategory && commonCategory !== "未分類") return commonCategory;

  const normalizedHost = String(host || "").toLowerCase();
  const rules = [
    { category: "開発", patterns: ["github", "gitlab", "stackoverflow", "stackexchange", "npmjs", "developer.", "docs.github", "vercel", "cloudflare", "mdn"] },
    { category: "AI", patterns: ["openai", "chatgpt", "anthropic", "claude", "gemini", "perplexity", "huggingface", "replicate"] },
    { category: "仕事", patterns: ["slack", "notion", "atlassian", "jira", "trello", "asana", "teams.microsoft", "office", "sharepoint"] },
    { category: "資料", patterns: ["wikipedia", "docs.", "learn.microsoft", "support.", "help.", "manual", "reference"] },
    { category: "動画", patterns: ["youtube", "youtu.be", "vimeo", "nicovideo", "twitch"] },
    { category: "買い物", patterns: ["amazon", "rakuten", "shopping", "yahoo.co.jp", "mercari", "stores.jp"] },
    { category: "ニュース", patterns: ["news", "nikkei", "bbc", "cnn", "reuters", "asahi", "yomiuri", "mainichi"] },
    { category: "SNS", patterns: ["twitter", "x.com", "facebook", "instagram", "linkedin", "bsky", "threads"] }
  ];
  const matched = rules.find((rule) => rule.patterns.some((pattern) => normalizedHost.includes(pattern)));
  if (matched && categoryNames.includes(matched.category)) return matched.category;
  return "";
}

function openOrganizeSession() {
  const selected = [...selectedIds].map(getBookmarkById).filter(Boolean);
  let source = selected.length ? selected : getTrayBookmarks();
  if (!source.length) source = getVisibleBookmarksForRender();
  if (!source.length) {
    alert(t("noOrganize"));
    return;
  }
  organizeQueue = source.map((bookmark) => bookmark.id);
  organizeIndex = 0;
  renderOrganizeSession();
  elements.organizeDialog.showModal();
}

function renderOrganizeSession() {
  const bookmark = getCurrentOrganizeBookmark();
  elements.organizeCard.innerHTML = "";
  elements.organizeCategoryList.innerHTML = "";
  const done = !bookmark;
  elements.organizeOpenButton.disabled = done;
  elements.organizeSkipButton.disabled = done;
  elements.organizeDeleteButton.disabled = done;

  if (done) {
    elements.organizeProgress.textContent = t("organizeDone");
    elements.organizeCard.append(emptyMessage(t("noOrganizeItems")));
    return;
  }

  elements.organizeProgress.textContent = `${organizeIndex + 1} / ${organizeQueue.length}`;
  elements.organizeCard.append(createOrganizeSummary(bookmark));

  getCategoryNames().forEach((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-choice";
    button.textContent = displayCategoryName(name);
    button.title = name;
    button.addEventListener("click", () => moveOrganizeBookmark(name));
    elements.organizeCategoryList.append(button);
  });
}

function createOrganizeSummary(bookmark) {
  const node = document.createElement("div");
  node.className = "organize-summary";
  node.innerHTML = `
    <img class="favicon" alt="" loading="lazy">
    <div>
      <strong></strong>
      <span class="organize-url"></span>
      <div class="bookmark-tags">
        <span class="tag category-tag"></span>
        <span class="tag folder-tag"></span>
      </div>
    </div>`;
  node.querySelector(".favicon").src = faviconUrl(bookmark.url);
  node.querySelector("strong").textContent = bookmark.title;
  node.querySelector(".organize-url").textContent = bookmark.url;
  node.querySelector(".category-tag").textContent = displayCategoryName(bookmark.category);
  node.querySelector(".folder-tag").textContent = bookmark.folderPath;
  return node;
}

function getCurrentOrganizeBookmark() {
  while (organizeIndex < organizeQueue.length) {
    const bookmark = getBookmarkById(organizeQueue[organizeIndex]);
    if (bookmark) return bookmark;
    organizeIndex += 1;
  }
  return null;
}

async function moveOrganizeBookmark(category) {
  const bookmark = getCurrentOrganizeBookmark();
  if (!bookmark) return;
  await moveBookmarksToCategory([bookmark.id], category);
  organizeIndex += 1;
  renderOrganizeSession();
}

function skipOrganizeBookmark() {
  organizeIndex += 1;
  renderOrganizeSession();
}

async function openOrganizeBookmark() {
  const bookmark = getCurrentOrganizeBookmark();
  if (!bookmark) return;
  state.usage[bookmark.id] = { count: (state.usage[bookmark.id]?.count || 0) + 1, lastOpenedAt: Date.now() };
  markUsageStateDirty();
  await saveState();
  await chrome.tabs.create({ url: bookmark.url, active: true });
}

async function deleteOrganizeBookmark() {
  const bookmark = getCurrentOrganizeBookmark();
  if (!bookmark) return;
  await deleteBookmarksByIds([bookmark.id], { skipConfirm: true });
  organizeQueue = organizeQueue.filter((id) => id !== bookmark.id);
  renderOrganizeSession();
}

function getBookmarkById(id) {
  return getBookmarkMap().get(String(id));
}

function openGenreDialog() {
  renderGenreEditorList();
  elements.genreDialog.showModal();
}

function openSettingsDialog() {
  if (elements.cardSizeInput) {
    elements.cardSizeInput.value = String(state.cardWidth || DEFAULT_STATE.cardWidth);
  }
  elements.settingsDialog?.showModal();
}

async function closeShelfView() {
  await animateShelfClose();
  if (SURFACE === "overlay") {
    window.parent.postMessage({ type: "bookmark-shelf-close-overlay" }, "*");
    return;
  }

  if (SURFACE === "sidepanel") {
    const currentWindow = await chrome.windows.getCurrent().catch(() => null);
    await chrome.runtime.sendMessage({ type: "close-bookmark-shelf", windowId: currentWindow?.id }).catch(() => {});
    window.close();
  }
}

async function addCustomCategory() {
  const name = elements.newGenreInput.value.trim();
  if (!name) return;
  ensureCustomCategory(name);
  elements.newGenreInput.value = "";
  await saveState();
  renderGenreEditorList();
  render();
}

function renderGenreEditorList() {
  const counts = new Map();
  bookmarks.forEach((bookmark) => counts.set(bookmark.category, (counts.get(bookmark.category) || 0) + 1));
  elements.genreEditorList.innerHTML = "";
  getCategoryNames().forEach((name) => {
    const row = document.createElement("div");
    row.className = "genre-editor-row";
    row.innerHTML = `<input type="text"><span class="genre-count"></span><button class="icon-button rename-genre" type="button">✓</button><button class="icon-button delete-genre" type="button">${TRASH_ICON}</button>`;
    row.querySelector("input").value = name;
    row.querySelector(".genre-count").textContent = counts.get(name) || 0;
    setControlLabel(row.querySelector(".rename-genre"), t("save"));
    setControlLabel(row.querySelector(".delete-genre"), t("delete"));
    row.querySelector(".rename-genre").addEventListener("click", () => renameCategory(name, row.querySelector("input").value));
    row.querySelector(".delete-genre").disabled = name === "未分類";
    row.querySelector(".delete-genre").addEventListener("click", () => deleteCategory(name));
    elements.genreEditorList.append(row);
  });
}

async function renameCategory(oldName, newName) {
  const nextName = newName.trim();
  if (!nextName || nextName === oldName) return;
  ensureCustomCategory(nextName);
  bookmarks.forEach((bookmark) => {
    if (bookmark.category === oldName) state.categories[bookmark.id] = nextName;
  });
  state.customCategories = [...new Set((state.customCategories || []).filter((name) => name !== oldName).concat(nextName))];
  const hiddenBase = (state.hiddenCategories || []).filter((name) => name !== nextName);
  state.hiddenCategories = oldName === "未分類" ? hiddenBase : [...new Set(hiddenBase.concat(oldName))];
  state.categoryOrder = replaceInCategoryOrder(oldName, nextName);
  if (state.selectedCategory === oldName) state.selectedCategory = nextName;
  markCategoryStateDirty("categories", "customCategories", "hiddenCategories", "categoryOrder");
  await saveState();
  await loadBookmarks();
  renderGenreEditorList();
  render();
}

async function deleteCategory(name) {
  if (name === "未分類") return;
  if (!confirm(t("deleteGenreConfirm", { name }))) return;
  state.customCategories = (state.customCategories || []).filter((category) => category !== name);
  state.hiddenCategories = [...new Set([...(state.hiddenCategories || []), name])];
  state.categoryOrder = (state.categoryOrder || []).filter((category) => category !== name);
  bookmarks.forEach((bookmark) => {
    if (bookmark.category === name) state.categories[bookmark.id] = "未分類";
  });
  if (state.selectedCategory === name) state.selectedCategory = getFallbackSelectedCategory();
  markCategoryStateDirty("categories", "customCategories", "hiddenCategories", "categoryOrder");
  await saveState();
  await loadBookmarks();
  normalizeConcreteSelectedCategory({ replaceAll: true });
  renderGenreEditorList();
  render();
}

function setLayout(layout) {
  state.layout = layout;
  saveState();
  render();
}

function setPanelRatio(panelRatio) {
  state.panelRatio = PANEL_RATIO_MODES.has(panelRatio) ? panelRatio : DEFAULT_STATE.panelRatio;
  saveState();
  render();
}

function setDensity(density) {
  state.density = density;
  saveState();
  render();
}

function updateButtons() {
  if (elements.sortSelect) {
    elements.sortSelect.value = state.sortMode;
  }
  elements.groupedViewButton.classList.toggle("active", state.panelRatio !== "frequent");
  elements.listViewButton.classList.toggle("active", state.panelRatio === "frequent");
  elements.groupedViewButton.setAttribute("aria-pressed", String(state.panelRatio !== "frequent"));
  elements.listViewButton.setAttribute("aria-pressed", String(state.panelRatio === "frequent"));
  elements.groupedViewButton.textContent = "▤";
  setBookmarkStarIcon(elements.listViewButton);
  setBookmarkStarIcon(elements.batchPinButton);
  [
    elements.deleteModeButton,
    elements.deleteViewButton,
    elements.batchDeleteButton,
    elements.deleteButton,
    elements.organizeDeleteButton
  ].forEach(setTrashIcon);
  setControlLabel(elements.openFullButton, t("openFull"));
  setControlLabel(elements.batchModeButton, t("batchMode"));
  setControlLabel(elements.trayModeButton, t("trayMode"));
  setControlLabel(elements.organizeSessionButton, t("organizeSession"));
  setControlLabel(elements.domainMoveButton, t("domainMove"));
  setControlLabel(elements.deleteModeButton, t("deleteMode"));
  setControlLabel(elements.settingsButton, t("settings"));
  setControlLabel(elements.refreshButton, t("refresh"));
  setControlLabel(elements.groupedViewButton, t("bookmarkPriority"));
  setControlLabel(elements.listViewButton, t("frequentPriority"));
  elements.cardDensityButton.classList.toggle("active", state.density === "cards");
  elements.compactDensityButton.classList.toggle("active", state.density === "compact");
  setControlLabel(elements.cardDensityButton, t("cards"));
  setControlLabel(elements.compactDensityButton, t("compact"));
  setControlLabel(elements.savedViewSelect, t("savedViews"));
  setControlLabel(elements.saveViewButton, t("saveCurrentView"));
  setControlLabel(elements.deleteViewButton, t("deleteSavedView"));
  setControlLabel(elements.selectVisibleButton, t("selectVisible"));
  setControlLabel(elements.clearSelectionButton, t("clearSelection"));
  setControlLabel(elements.batchMoveButton, t("moveSelected"));
  setControlLabel(elements.batchPinButton, t("pinSelected"));
  setControlLabel(elements.batchUnpinButton, t("unpinSelected"));
  setControlLabel(elements.batchDeleteButton, t("deleteSelected"));
  setControlLabel(elements.batchCategorySelect, t("batchDestination"));
  elements.deleteModeButton.classList.toggle("active", deleteMode);
  elements.deleteModeButton.setAttribute("aria-pressed", String(deleteMode));
  if (elements.checkLinksButton) {
    elements.checkLinksButton.disabled = linkCheckRunning;
    elements.checkLinksButton.textContent = linkCheckRunning ? "…" : "⛓";
    setControlLabel(elements.checkLinksButton, linkCheckRunning ? t("checkingLinks") : t("checkLinks"));
  }
  elements.batchModeButton?.classList.toggle("active", batchMode);
  elements.trayModeButton?.classList.toggle("active", trayMode);
  if (elements.undoButton) {
    elements.undoButton.disabled = !undoEntry;
    setControlLabel(elements.undoButton, undoEntry?.label || t("undoDefault"));
  }
  const behaviorMeta = OPEN_BEHAVIOR_META[state.openBehavior] || OPEN_BEHAVIOR_META[DEFAULT_STATE.openBehavior];
  if (elements.openBehaviorButton) {
    elements.openBehaviorButton.textContent = behaviorMeta.icon;
    setControlLabel(elements.openBehaviorButton, `${t("openBehavior")}: ${t(behaviorMeta.labelKey)}`);
  }
  elements.themeToggleButton?.classList.toggle("active", state.theme === "dark");
  if (elements.themeToggleButton) {
    elements.themeToggleButton.textContent = state.theme === "dark" ? "☀" : "◐";
    setControlLabel(elements.themeToggleButton, state.theme === "dark" ? t("switchToLight") : t("switchToDark"));
  }
  if (elements.languageToggleButton) {
    elements.languageToggleButton.textContent = getLanguage() === "ja" ? "EN" : "JA";
    setControlLabel(elements.languageToggleButton, t("switchLanguage"));
  }
  setControlLabel(elements.overlayCloseButton, t("close"));
  elements.quickFullButton.classList.toggle("active", state.quickFull);
  elements.toggleQuickButton.textContent = state.quickCollapsed ? "▾" : "▴";
  elements.quickFullButton.textContent = state.quickFull ? "▣" : "⛶";
  if (elements.toggleRecentButton) {
    elements.toggleRecentButton.textContent = state.recentCollapsed ? "▾" : "▴";
    setControlLabel(elements.toggleRecentButton, state.recentCollapsed ? t("expandRecent") : t("collapseRecent"));
  }
  elements.toggleGenreButton.textContent = state.genreCollapsed ? "▸" : "◂";
  setControlLabel(elements.quickFullButton, t("quickFull"));
  setControlLabel(elements.toggleQuickButton, state.quickCollapsed ? t("expandFrequent") : t("collapseFrequent"));
  setControlLabel(elements.clearUsageButton, t("clearUsage"));
  setControlLabel(elements.toggleGenreButton, state.genreCollapsed ? t("expandGenres") : t("collapseGenres"));
  setControlLabel(elements.manageGenresButton, t("manageGenres"));
  setControlLabel(elements.showUnsortedButton, t("showUnsorted"));
}

function renderCategoryOptions(categoryNames = getCategoryNames()) {
  elements.categoryOptions.innerHTML = "";
  categoryNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    elements.categoryOptions.append(option);
  });
}

function populateCategorySelect(select, selectedCategory, categoryNames = getCategoryNames()) {
  select.innerHTML = "";
  categoryNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = displayCategoryName(name);
    option.selected = name === selectedCategory;
    select.append(option);
  });
}

function normalizeConcreteSelectedCategory(options = {}) {
  if (trayMode) return false;
  const { persist = true } = options;
  const categoryNames = getCategoryNames();
  const current = state.selectedCategory;
  const isConcrete = current && current !== "all" && categoryNames.includes(current) && !isHiddenCategory(current);
  if (isConcrete || current === "all") return false;

  const nextCategory = getFallbackSelectedCategory(categoryNames);
  if (!nextCategory || nextCategory === current) return false;
  state.selectedCategory = nextCategory;
  if (persist && stateLoaded) {
    scheduleSaveState();
  }
  return true;
}

function getPreferredConcreteCategory(categoryNames = getCategoryNames()) {
  const visibleNames = categoryNames.filter((name) => name && name !== "all" && !isHiddenCategory(name));
  if (!visibleNames.length) return DEFAULT_CONCRETE_CATEGORY;
  const bookmarkCounts = new Map();
  bookmarks.forEach((bookmark) => {
    bookmarkCounts.set(bookmark.category, (bookmarkCounts.get(bookmark.category) || 0) + 1);
  });
  return visibleNames.find((name) => (bookmarkCounts.get(name) || 0) > 0)
    || (visibleNames.includes(DEFAULT_CONCRETE_CATEGORY) ? DEFAULT_CONCRETE_CATEGORY : visibleNames[0]);
}

function getCategoryNames() {
  const cacheKey = ["categoryNames", bookmarksRevision, categoryRevision].join("::");
  return getCachedRenderData(cacheKey, () => {
    const names = new Set([...DEFAULT_CATEGORIES, ...(state.customCategories || [])]);
    bookmarks.forEach((bookmark) => names.add(bookmark.category));
    Object.values(state.categories || {}).forEach((category) => names.add(category));
    const visibleNames = [...names].filter((name) => name && !isHiddenCategory(name));
    const ordered = (state.categoryOrder || []).filter((name) => visibleNames.includes(name));
    const missing = visibleNames.filter((name) => !ordered.includes(name)).sort((a, b) => {
      if (a === "未分類") return -1;
      if (b === "未分類") return 1;
      return a.localeCompare(b, "ja");
    });
    return [...ordered, ...missing];
  });
}

function ensureCustomCategory(category) {
  if (!category || category === "all") return;
  const hiddenCategories = state.hiddenCategories || [];
  const nextHiddenCategories = hiddenCategories.filter((name) => name !== category);
  if (nextHiddenCategories.length !== hiddenCategories.length) {
    state.hiddenCategories = nextHiddenCategories;
    markCategoryStateDirty("hiddenCategories");
  }
  if (!getCategoryNames().includes(category)) {
    state.customCategories = [...new Set([...(state.customCategories || []), category])];
    markCategoryStateDirty("customCategories");
  }
  if (!(state.categoryOrder || []).includes(category)) {
    state.categoryOrder = [...(state.categoryOrder || []), category];
    markCategoryStateDirty("categoryOrder");
  }
}

function isHiddenCategory(category) {
  return !!category && (state.hiddenCategories || []).includes(category);
}

function replaceInCategoryOrder(oldName, newName) {
  const order = state.categoryOrder || [];
  const replaced = order.map((name) => (name === oldName ? newName : name));
  return [...new Set(replaced)];
}

function resetLazyFavicons() {
  if (!lazyFaviconObserver) return;
  lazyFaviconObserver.disconnect();
  lazyFaviconObserver = null;
}

function queueLazyFavicon(image, url) {
  if (!image) return;
  const src = faviconUrl(url);
  image.dataset.src = src;

  if (!("IntersectionObserver" in window)) {
    runWhenIdle(() => {
      image.src = src;
      delete image.dataset.src;
    }, 350);
    return;
  }

  if (!lazyFaviconObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        observer.unobserve(target);
        if (target.dataset.src) {
          target.src = target.dataset.src;
          delete target.dataset.src;
        }
      });
    }, { rootMargin: "180px" });
    lazyFaviconObserver = observer;
  }

  lazyFaviconObserver.observe(image);
}

function faviconUrl(url) {
  return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=64`;
}

function safeHost(url) {
  if (hostCache.has(url)) return hostCache.get(url);
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    host = url;
  }
  hostCache.set(url, host);
  return host;
}

function emptyMessage(text) {
  const node = document.createElement("p");
  node.className = "empty-message";
  node.textContent = text;
  return node;
}
