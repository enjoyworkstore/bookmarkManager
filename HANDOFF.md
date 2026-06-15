# Bookmark Shelf for Brave 引き継ぎメモ

最終更新: 2026-06-13  
作業場所: `C:\Users\kerog\OneDrive\ドキュメント\New project`

## 概要

Brave向けのブックマーク選択・整理用Chrome拡張機能。  
大量のブックマークをマウス中心で探し、ジャンル変更、整理、削除、リンク確認、よく使うもの表示を行うためのUIを作っている。

現在はManifest V3拡張として構成されている。

主な入口:

- `sidepanel.html`: サイドバー表示用
- `launcher.html?surface=overlay`: サイト上に重ねるオーバーレイ表示用
- `popup.html`: 通常表示用
- `src/background.js`: 起動方法、右クリックメニュー、サイドパネル/オーバーレイ制御
- `src/app.js`: ブックマーク一覧UIと整理機能のメイン処理
- `src/overlay-host.js`: Webページ上のフローティング起動バーとオーバーレイホスト
- `src/styles.css`: 全体デザイン

## 現在の重要仕様

- 左クリックでブックマークを開く場合は、設定済みの開き方に従う。
- 右クリックでブックマークを開く場合は、設定に関係なく新規タブで開く。
- ブックマークカード上の右クリックは新規タブで開くが、ジャンル選択、編集、削除、固定などの操作ボタン上では通常操作を優先する。
- 開き方設定は以下の3種類。
  - 新しいタブで開いて画面を閉じる
  - 現在のタブで開く、画面維持
  - 現在のタブで開いて画面を閉じる
- 自動ジャンル割り振り機能は完全削除済み。今後はドメイン別まとめ移動や一括ジャンル変更を中心にする。
- 未分類ブックマークはデフォルトで `未分類` に入る。
- カード背景色をユーザーが個別変更する設定は削除済み。デザイン側で固定する方針。
- 現在のデザイン方針はVS Code風。フラット、細い境界線、暗色ワークベンチ、選択状態のみアクセント。

## 実装済み機能

- ジャンル別表示と登録順一覧表示の切り替え
- アイコン一覧表示と名前だけの簡易表示の切り替え
- よく使うもの表示
- よく使うもののフル画面表示切り替え
- ジャンル折りたたみ
- よく使うもの折りたたみ
- ジャンル編集
- ジャンル削除時、該当ブックマークを未分類へ移動
- ジャンルの手動並び替え
- ブックマークのジャンル変更
- 一括選択モード
- 未整理トレイ
- 整理セッション
- ドメイン別まとめ移動
- 操作取り消し
- 削除モード
- リンク切れチェック
- リンク切れチェック結果とメタ情報のキャッシュ
- 表示カードの段階描画
- favicon遅延読み込み
- render debounce
- 検索
- 並び順変更
- カード幅設定
- ダークモード
- 表示面の背景・カード透明度設定
- サイドバー表示/オーバーレイ表示の切り替え
- オーバーレイ/サイドバー内の閉じるボタン
- フローティング起動バー
- フローティング起動バーのオン/オフ、位置、サイズ、縮小表示設定
- 拡張機能アイコン変更済み

## 直近の変更

### デザイン

`src/styles.css` の末尾に `VS Code inspired workbench skin` を追加済み。  
前回の装飾的なグラデーションや強い影を抑え、VS Code風のフラットなUIに寄せた。

主な色:

- ダーク背景: `#1e1e1e`
- ダークパネル: `#252526`
- ダーク境界線: `#3c3c3c`
- ライト背景: `#f3f3f3`
- ライトパネル: `#f8f8f8`
- アクセント: VS Code系の青

### カード色設定の削除

以下を削除済み。

- HTML内の `cardColorEnabled`
- HTML内の `cardColorInput`
- JS内のカード色変更イベント
- JS内の `hexToRgba`
- UI文言 `useCardColor` / `cardColor`

古い保存データに `cardColorEnabled` / `cardColor` が残っていても、`normalizeState()` 内で削除される。

### 右クリックで新規タブ

`src/app.js` のブックマークカードに `contextmenu` ハンドラを追加済み。

関連関数:

- `handleBookmarkContextOpen`
- `openBookmarkInNewTabOnly`
- `recordBookmarkOpen`

左クリックは既存の `openBookmark()` を使い、設定どおりに開く。  
右クリックは `openBookmarkInNewTabOnly()` を使い、新規タブで開く。

## 注意点・既知の仕様

- `brave://` などブラウザ内部ページではコンテンツスクリプトを注入できないため、オーバーレイやフローティング起動バーは表示できない。
- フローティング起動バーの右クリック/長押し/ホイールによる縮小切り替えはブラウザ側やページ側の制限で安定しなかった。現在は設定画面の縮小表示チェックと、バー下部クリックによる切り替えを使う方針。
- Git上は現時点で全ファイルが未追跡扱いになっている。`git status --short` は `??` が並ぶ状態。
- Braveで確認する場合、変更後は拡張機能ページから再読み込みが必要。
- `chrome.storage.local` に保存済みの設定があるため、別PCでは設定値が初期状態になる可能性がある。

## 主要ファイル

### `manifest.json`

MV3拡張の定義。  
サイドパネル、コンテンツスクリプト、バックグラウンド、アイコンなどを設定している。

### `src/app.js`

アプリ本体。  
ブックマーク取得、表示、検索、ジャンル、整理、削除、リンクチェック、設定、テーマ、開き方の制御を担当。

重要な箇所:

- `DEFAULT_STATE`: 初期設定
- `UI_TEXT`: 日本語/英語文言
- `setupEvents()`: イベント登録
- `normalizeState()`: 保存設定の正規化
- `applyVisualSettings()`: 透明度とテーマ変数反映
- `render()`: メイン描画
- `createBookmarkCard()`: ブックマークカード生成
- `openBookmark()`: 設定どおりに開く
- `openBookmarkInNewTabOnly()`: 右クリック用の新規タブ開き

### `src/background.js`

拡張機能の起動制御。  
アクションボタン、コンテキストメニュー、サイドパネル、オーバーレイ注入、閉じる処理などを担当。

### `src/overlay-host.js`

Webページ上にフローティング起動バーを出し、オーバーレイiframeを表示する。  
内部ページや注入できないページでは動作不可。

### `src/styles.css`

全体のデザイン。  
末尾の `VS Code inspired workbench skin` が現在の見た目の最終上書きレイヤー。

### `icons/`

拡張機能アイコン。  
ユーザー指定の `bookmarkIcon.png` デザインから生成したPNGが入っている。

## 確認済みコマンド

以下は直近で成功確認済み。

```powershell
node --check src/app.js
node --check src/background.js
node --check src/overlay-host.js
node --check src/surface.js
node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8')); console.log('manifest ok')"
node -e "const fs=require('fs'); const css=fs.readFileSync('src/styles.css','utf8'); let n=0; for (const c of css) { if (c==='{') n++; if (c==='}') n--; if (n<0) throw new Error('extra close brace'); } if (n) throw new Error('unclosed brace '+n); console.log('css braces ok')"
```

## 別PCで再開するとき

1. Braveの拡張機能ページを開く。
2. デベロッパーモードを有効にする。
3. このプロジェクトフォルダを「パッケージ化されていない拡張機能を読み込む」で読み込む。
4. 変更後は拡張機能ページで再読み込みする。
5. サイドバー/オーバーレイ/右クリック起動/フローティング起動バーを確認する。

## 次に見直すとよさそうなこと

- VS Code風デザインの実画面確認と微調整
- ダークモードでのカード、件数バッジ、タグ、削除モードの視認性確認
- サイドパネルモードが対象ページで安定して開くか確認
- フローティング起動バーの縮小操作が実用上わかりやすいか確認
- Git管理を開始するなら、現状ファイルを一度まとめてコミットする
- Web Store公開を目指すなら、権限説明、プライバシーポリシー、スクリーンショット、ストア説明文を準備する
