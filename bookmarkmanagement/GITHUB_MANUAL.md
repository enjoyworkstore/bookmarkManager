# GitHub 運用マニュアル

このドキュメントは、`Bookmark Shelf for Brave` を GitHub で管理し、別PCでも同じ状態で使えるようにするための手順書です。

GitHubに慣れていない前提で、最初の考え方から、別PCでのダウンロード、変更、保存、アップロード、取り込みまでを一通りまとめています。

## まず結論

このプロジェクトでは、基本的に次の流れだけ覚えれば大丈夫です。

```text
GitHubから取得する
  ↓
自分のPCで編集する
  ↓
commit する
  ↓
push する
  ↓
Pull Request を作る
  ↓
main に merge する
  ↓
別PCで pull する
```

ざっくり言うと、

- `commit` は「自分のPC内にセーブポイントを作る」
- `push` は「そのセーブポイントをGitHubにアップロードする」
- `Pull Request` は「この変更を正式版に入れていいか確認する場所」
- `merge` は「正式版に採用する」
- `pull` は「GitHub上の最新版を自分のPCへ持ってくる」

です。

## このプロジェクトのGitHub情報

リポジトリ:

```text
https://github.com/enjoyworkstore/bookmarkManager.git
```

主に使うフォルダ:

```text
bookmarkmanagement/
```

Brave / Chrome で読み込むときは、この `bookmarkmanagement` フォルダを「パッケージ化されていない拡張機能」として読み込みます。

## GitHub / Git の用語

最初は全部を覚えなくて大丈夫です。

まずは、次の8個だけわかれば実用上かなり進められます。

| 用語 | 読み方 | ざっくり意味 | いつ使うか |
| --- | --- | --- | --- |
| repository / repo | リポジトリ / レポ | プロジェクト全体の入れ物 | GitHub上のプロジェクトを指すとき |
| clone | クローン | GitHubから初めてPCにダウンロードする | 別PCで初めて使うとき |
| branch | ブランチ | 作業用の分岐・作業場所 | 正式版を壊さず変更したいとき |
| commit | コミット | 変更のセーブポイント | 編集内容を履歴として保存するとき |
| push | プッシュ | PCのcommitをGitHubへアップロードする | 変更をGitHubに置きたいとき |
| pull | プル | GitHubの最新版をPCへ取り込む | 別PCや別作業者の変更を取り込みたいとき |
| Pull Request / PR | プルリクエスト / ピーアール | 変更を正式版に入れるための確認ページ | 作業ブランチを `main` に入れたいとき |
| merge | マージ | PRの変更を正式版へ取り込む | 変更を `main` に採用するとき |

重要なのは、`pull` と `Pull Request` は別物ということです。

名前が似ていますが、やっていることは違います。

```text
pull
  GitHub → 自分のPC
  最新版を取り込む操作

Pull Request / PR
  作業ブランチ → main
  変更を正式版に入れてよいか確認する場所
```

### GitHub

コードを置いておくクラウド上の保管場所です。

Google Drive のコード版に近いですが、変更履歴、差分確認、共同作業に強いです。

### Git

PC上で変更履歴を管理する道具です。

GitHubが「クラウドの保管庫」なら、Gitは「自分のPCで履歴を作る仕組み」です。

### repository / repo

プロジェクトの入れ物です。

このプロジェクトでは `bookmarkManager` がリポジトリです。

### clone

GitHub上のリポジトリを、初めて自分のPCにダウンロードすることです。

`clone` は最初の1回だけ使うことが多いです。

たとえば別PCで初めてこのプロジェクトを使うなら、次のようにします。

```powershell
git clone https://github.com/enjoyworkstore/bookmarkManager.git
```

一度 `clone` したあとは、最新版にする操作は基本的に `pull` を使います。

### branch

作業用の分岐です。

たとえば `main` が正式版だとすると、`codex/theme-opacity-surfaces` のようなブランチは作業場です。

```text
main
  └─ codex/theme-opacity-surfaces
```

作業ブランチで変更して、問題なければ `main` に取り込みます。

ブランチは「正式版を直接触らないための作業机」と考えるとわかりやすいです。

```text
main
  正式版。安定していてほしい場所。

codex/add-github-manual
  作業用ブランチ。ここで編集・実験する。
```

ブランチを作るコマンド例:

```powershell
git switch -c codex/add-github-manual
```

今いるブランチを確認するコマンド:

```powershell
git branch --show-current
```

このプロジェクトでは、作業ブランチ名は `codex/内容` の形にすることが多いです。

### main

正式版として扱うブランチです。

別PCで普通に取得するときは、基本的にこの `main` を使います。

「ほかのPCで同じように使える状態か？」を考えるときは、変更が `main` に入っているかを見るのが一番わかりやすいです。

作業ブランチに `push` されていても、`main` に `merge` されていない場合、別PCで普通に `git pull` しただけでは入らないことがあります。

### commit

変更のセーブポイントです。

ゲームでいうセーブデータに近いです。

`commit` は自分のPC内の履歴に保存する操作です。

まだGitHubへアップロードされるわけではありません。

```text
ファイル編集
  ↓
git add
  ↓
git commit
  ↓
自分のPC内にセーブポイント作成
```

commit例:

```powershell
git add .
git commit -m "Add GitHub manual"
```

`git add` は「この変更を次のcommitに含める」という準備です。

### push

自分のPCにあるcommitをGitHubへアップロードすることです。

pushしただけでは、作業ブランチに上がっただけの場合があります。正式版である `main` に入ったとは限りません。

```text
自分のPC
  ↓ push
GitHub
```

初めてそのブランチをpushするとき:

```powershell
git push -u origin codex/add-github-manual
```

2回目以降:

```powershell
git push
```

注意点:

- `push` は「GitHubにアップロードする」操作
- `push` しただけでは `main` に入ったとは限らない
- 別PCで普通に使いやすい状態にするには、最終的に `main` へ `merge` されているかが大事

### Pull Request / PR

作業ブランチの変更を `main` に入れるための確認ページです。

「この変更を正式版に入れていい？」という申請場所です。

PRは、コードの差分を見たり、説明を書いたり、問題がないか確認したりする場所です。

```text
codex/add-github-manual
  ↓ Pull Request
main
```

PRで見ること:

- どのファイルが変わったか
- 何行追加・削除されたか
- 変更内容の説明
- 必要ならレビューやコメント
- 問題なければ `merge`

PRは「Pull」と名前に入っていますが、`git pull` とは別物です。

```text
git pull
  GitHubの内容をPCに取り込むコマンド

Pull Request / PR
  ブランチの変更をmainに入れるためのGitHub上の確認ページ
```

### merge

Pull Request の変更を `main` に取り込むことです。

merge されると、他のPCから `main` を取得したときにその変更が入ります。

つまり、`merge` は「正式採用」です。

この状態になると、別PCで `git pull` したときに変更が入りやすくなります。

```text
作業ブランチで変更
  ↓
push
  ↓
PR作成
  ↓
merge
  ↓
mainに入る
```

### pull

GitHub上の最新版を自分のPCに取り込むことです。

すでに clone 済みのPCで最新版にしたいときに使います。

```text
GitHub
  ↓ pull
自分のPC
```

実行例:

```powershell
git pull
```

別PCで最新状態にしたいときは、まず `git pull` を使います。

ただし、自分のPCに未保存の変更があると、`pull` でぶつかることがあります。

その場合は先に `git status` を見ます。

```powershell
git status --short --branch
```

## 用語の関係図

全体の関係はこうです。

```text
GitHub上のmain
  ↑                         ↓
  │ merge                   │ pull
  │                         │
Pull Request / PR           自分のPC
  ↑                         │
  │ push                    │ commit
  │                         ↓
作業ブランチ          ファイル編集
```

もう少し作業順にすると、こうです。

```text
git pull
  GitHubの最新版をPCに入れる

git switch -c codex/example
  作業ブランチを作る

ファイル編集
  実際に変更する

git add .
  commitに含める変更を選ぶ

git commit -m "説明"
  PC内にセーブポイントを作る

git push
  GitHubへアップロードする

Pull Request
  mainへ入れるための確認ページを作る

merge
  mainへ正式採用する
```

## よく混同する言葉

### pull と push

向きが逆です。

```text
pull = GitHubからPCへ持ってくる
push = PCからGitHubへ送る
```

### push と merge

`push` はアップロードです。

`merge` は正式版への採用です。

```text
push
  GitHub上の作業ブランチに置く

merge
  mainに取り込む
```

### branch と PR

`branch` は作業場所です。

`PR` は、その作業場所の変更を `main` に入れるための確認ページです。

```text
branch
  コードがある場所

PR
  変更を確認して取り込むためのページ
```

### clone と pull

どちらもGitHubからPCへ持ってくる操作ですが、使うタイミングが違います。

```text
clone
  初めてPCにダウンロードするとき

pull
  すでにあるプロジェクトを最新版にするとき
```

## 状態の見方

作業フォルダで次を実行します。

```powershell
git status
```

よく見る表示は以下です。

### 変更がない状態

```text
nothing to commit, working tree clean
```

これは「今のPC上に未保存の変更はない」という意味です。

### 変更がある状態

```text
modified:   src/styles.css
```

これは「ファイルを編集したが、まだcommitしていない」という意味です。

### 新しいファイルがある状態

```text
untracked files:
  new-file.md
```

これは「Gitがまだ管理していない新しいファイルがある」という意味です。

## 初めて別PCで使う手順

別PCにまだプロジェクトがない場合は、`clone` します。

```powershell
git clone https://github.com/enjoyworkstore/bookmarkManager.git
```

すると、`bookmarkManager` というフォルダが作られます。

移動します。

```powershell
cd bookmarkManager
```

中に `bookmarkmanagement` フォルダがあります。

Braveで使う場合:

1. Braveで `brave://extensions/` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」を押す
4. `bookmarkmanagement` フォルダを選ぶ

Chromeで使う場合:

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」を押す
4. `bookmarkmanagement` フォルダを選ぶ

## すでに別PCにあるプロジェクトを最新版にする

すでに `clone` 済みなら、プロジェクトフォルダで次を実行します。

```powershell
git pull
```

これでGitHub上の `main` の最新版がPCに入ります。

そのあと、ブラウザ拡張機能ページで拡張機能を再読み込みしてください。

Brave:

```text
brave://extensions/
```

Chrome:

```text
chrome://extensions/
```

注意:

- GitHubから最新版を取っただけでは、ブラウザに自動反映されません。
- 拡張機能ページで「再読み込み」が必要です。
- Webページ上に表示するオーバーレイやフローティングボタンは、対象ページ側のリロードも必要なことがあります。

## 自分で変更してGitHubにアップロードする流れ

### 1. 最新版を取得する

作業前に最新版にします。

```powershell
git pull
```

### 2. 作業ブランチを作る

`main` で直接作業せず、作業用ブランチを作るのが安全です。

```powershell
git switch -c codex/my-change
```

名前は内容に合わせます。

例:

```powershell
git switch -c codex/fix-dark-mode
git switch -c codex/add-github-manual
git switch -c codex/update-start-page
```

### 3. ファイルを編集する

普通にコードやMarkdownを編集します。

### 4. 変更内容を確認する

```powershell
git status
```

差分を詳しく見るなら:

```powershell
git diff
```

### 5. 変更をステージする

commitに含めるファイルを指定します。

全部まとめて入れる場合:

```powershell
git add .
```

特定ファイルだけ入れる場合:

```powershell
git add bookmarkmanagement/src/styles.css
```

### 6. commitする

```powershell
git commit -m "Update bookmark UI"
```

commitメッセージは、あとで見て何をしたかわかる名前にします。

良い例:

```text
Fix dark genre chip colors
Add GitHub manual
Improve floating launcher gestures
```

避けたい例:

```text
修正
aaaa
test
```

### 7. pushする

初回push:

```powershell
git push -u origin codex/my-change
```

2回目以降:

```powershell
git push
```

これでGitHub上に作業ブランチができます。

### 8. Pull Requestを作る

GitHub上で `Compare & pull request` のようなボタンが出たら、それを押します。

Pull Request は、

```text
作業ブランチ → main
```

へ変更を入れるための確認場所です。

### 9. mergeする

Pull Request の内容を確認して問題なければ `Merge pull request` を押します。

mergeされると、その変更は `main` に入ります。

### 10. mainを最新版にする

作業PC側の `main` も最新版にしておきます。

```powershell
git switch main
git pull
```

## Codexに頼むときのおすすめ文

Codexに作業を頼む場合は、次のように言うと伝わりやすいです。

### 実装だけ頼みたい

```text
この変更を実装してください。GitHubへのpushはまだしないでください。
```

### 実装してpushまで頼みたい

```text
この変更を実装して、確認後にGitHubへpushしてください。
```

### PRまで作ってほしい

```text
この変更を実装して、GitHubへpushして、Pull Requestも作ってください。
```

### まず状態だけ確認したい

```text
今のGitHubとローカルの状態を確認して説明してください。変更はしないでください。
```

### 別PCで使えるか確認したい

```text
この変更はmainに入っていますか？ 別PCでgit pullすれば使える状態か確認してください。
```

## このプロジェクトでよく使う確認コマンド

プロジェクト直下で実行します。

```powershell
git status --short --branch
```

今いるブランチを見る:

```powershell
git branch --show-current
```

最近の履歴を見る:

```powershell
git log --oneline --decorate -5
```

リモートURLを見る:

```powershell
git remote -v
```

GitHub上の情報を取り直す:

```powershell
git fetch --prune origin
```

## push済みとmerge済みの違い

ここが一番混乱しやすいです。

### push済み

```text
自分の作業ブランチがGitHubにアップロードされた状態
```

この時点では、変更はGitHub上にあります。

ただし、`main` に入っているとは限りません。

### merge済み

```text
作業ブランチの変更がmainに正式採用された状態
```

この状態なら、別PCで普通に `git pull` したときに変更が入ります。

### 目安

```text
pushだけ       = GitHubにはあるが、正式版とは限らない
merge済み      = 正式版に入っている
mainに入っている = 別PCで普通に取得しやすい
```

## ブラウザ拡張として使うときの注意

GitHubやGitの更新と、ブラウザ拡張の更新は別です。

コードを最新版にしたあと、必ずブラウザ側で再読み込みします。

### Brave

```text
brave://extensions/
```

対象拡張機能の「再読み込み」ボタンを押します。

### Chrome

```text
chrome://extensions/
```

対象拡張機能の「再読み込み」ボタンを押します。

### ページ側もリロードが必要な場合

この拡張機能には、Webページ上にフローティング起動ボタンやオーバーレイを出す機能があります。

それらはページに注入される仕組みなので、拡張機能を再読み込みしたあと、対象ページもリロードすると確実です。

## よくあるトラブル

### `git pull` したのに画面が変わらない

ブラウザ拡張の再読み込みをしていない可能性があります。

`brave://extensions/` または `chrome://extensions/` で再読み込みしてください。

### フローティングボタンやオーバーレイが古いまま

対象のWebページもリロードしてください。

すでに開いているページには、古いスクリプトが残っていることがあります。

### `git status` で変更が出ている

PC上に未commitの変更があります。

まず内容を確認します。

```powershell
git diff
```

残したい変更ならcommitします。

不要な変更なら、消す前に必ず内容を確認してください。

### pushできない

よくある原因は次のどれかです。

- GitHubにログインしていない
- 権限がない
- 先にGitHub側が更新されている
- 別ブランチにいる

まず確認します。

```powershell
git status --short --branch
git remote -v
```

### どのブランチにいるかわからない

```powershell
git branch --show-current
```

### mainにいるまま作業してしまった

すぐに慌てなくて大丈夫です。

変更を保持したままブランチを作れることがあります。

```powershell
git switch -c codex/my-change
```

そのあとcommitします。

## 安全運用のおすすめ

基本ルールはこの4つです。

1. 作業前に `git pull`
2. `main` で直接作業しない
3. 変更したら `git status` を見る
4. 別PCで使うなら `main` にmerge済みか確認する

慣れるまでは、GitHub操作をする前にCodexへこう聞くのがおすすめです。

```text
今のGit状態を確認して、pushして大丈夫か教えてください。
```

## 最短コマンド集

### 初めてPCに入れる

```powershell
git clone https://github.com/enjoyworkstore/bookmarkManager.git
cd bookmarkManager
```

### 既存PCを最新版にする

```powershell
git pull
```

### 作業ブランチを作る

```powershell
git switch -c codex/my-change
```

### 状態を見る

```powershell
git status --short --branch
```

### 変更をcommitする

```powershell
git add .
git commit -m "Describe your change"
```

### GitHubへpushする

```powershell
git push -u origin codex/my-change
```

### mainへ戻る

```powershell
git switch main
git pull
```

## このプロジェクトの実用フロー

普段はこの流れで十分です。

```text
1. Codexに実装してもらう
2. 動作確認する
3. 問題なければ「GitHubへpush」と頼む
4. 必要ならPull Requestを作る
5. mainへmergeする
6. 別PCでは git pull
7. ブラウザ拡張を再読み込み
```

「別PCで同じように使える状態か？」を判断する目安は、

```text
main に merge されているか
```

です。

pushだけではなく、mainに入っているかを見るのがポイントです。
