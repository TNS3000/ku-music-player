# KU SUNO 楽曲ワークフロー自動化 / KU SUNO Track Workflow Automation

KU-PROJECT-MASTER.md 第3章（プロンプトルール）・第9章（技術スタック）準拠。
SUNOの楽曲生成そのものは手動のまま、その前後を自動化する2フェーズ構成です。

```
┌── Part A 投入準備 ──┐   ┌── 手動 ──┐   ┌── Part B DL後処理 ──────────┐
│ prompt-generator.js │ → │  SUNO   │ → │ import-tracks.js             │
│ 投入リスト + 台帳    │   │ 生成/DL │   │ リネーム→振り分け→コピー     │
└─────────────────────┘   └─────────┘   │ →index.html追記→git push     │
                                          └──────────────────────────────┘
```

---

## セットアップ / Setup

1. このフォルダの中身を `~/ku-music-player/` に置く（または統合する）:
   ```
   ~/ku-music-player/
   ├── prompt-generator.js
   ├── import-tracks.js
   ├── lib/ku-rules.js        ← ルールの単一の真実（master 3章）
   ├── index.html             ← 既存プレイヤー
   └── prompts.json           ← 台帳（自動生成・更新）
   ```
   ※ 既存の `prompt-generator.js` がある場合は別名でバックアップしてから差し替え推奨。
   本スクリプトは master 3章のルールを完全実装しています。

2. **index.htmlに一度だけマーカーを設置**（Part Bの自動追記に必要）。
   曲リストを置きたい箇所に、Zoneごとに以下を埋め込む:
   ```html
   <ul id="zone3-list">
     <!-- KU:Z3:START -->
     <!-- KU:Z3:END -->
   </ul>
   ```
   `KU:Z1` 〜 `KU:Z4` を対応する箇所に。マーカー間は毎回台帳から再生成されます（冪等）。
   マーカーが無い場合、Part Bは index.html 追記だけスキップし他処理は続行します。
   生成される行の例:
   ```html
   <li data-zone="3" data-bpm="114" data-src="zone3/KU-Z3-007_114bpm-A">KU-Z3-007_114bpm-A</li>
   ```
   （`library.json` も併せて出力されるので、プレイヤーをJSON駆動にする場合はそちらを読み込んでもOK）

3. Node.js v18+（v22で動作確認済）。外部依存なし。

---

## Part A — 投入準備 / Input Prep

指定Zoneのプロンプトを一括生成し、SUNO投入リストと台帳を出力。

```bash
node prompt-generator.js --zone 3 --count 25
```

| オプション | 説明 |
|-----------|------|
| `--zone <1-4>` | 対象Zone（必須） |
| `--count <N>` | 生成プロンプト数（必須。各プロンプト=SUNOで2take=A/B 2ファイル） |
| `--start <seq>` | 連番開始番号（省略時は台帳の続きから自動） |
| `--seed <n>` | 乱数シード（再現したいとき） |
| `--out <dir>` | 出力先（既定 `./suno-input`） |

**出力:**
- `suno-input/suno-input-Z3-YYYYMMDD-HHMM.txt` … 投入リスト（1曲1行・TITLE/STYLE/対応ファイル名併記）
- `suno-input/suno-style-only-Z3-….txt` … STYLE欄だけの貼り付け専用版
- `prompts.json` … 台帳に `status: "pending"` で追記

**全プロンプトが自動的に満たす条件**（master 3章）:
`instrumental` / `no vocals` / `[BPM]bpm`（数値）/ `background work music` を必ず含み、
ミュージシャン名は一切含めない（言葉での代替表現のみ）。Zone1/4は `no drops` を明示。

### SUNOでの生成（手動）
1. SUNO Custom Mode で **Instrumental を ON**。
2. 投入リストの各 `TITLE`（=`KU-Z3-001_112bpm`）を**タイトル欄**へ。
3. 同じ行の `STYLE` を**Style欄**へ。
4. 生成→2take（A/B）をDL。**TITLEを使うとPart Bが自動照合できます。**

---

## Part B — DL後処理 / Post-Download

DLしたmp3を台帳の pending 曲に照合し、リネーム→振り分け→コピー→index.html追記→git push。

```bash
# まず必ず dry-run で計画確認（何も変更しない）
node import-tracks.js --zone 3

# 問題なければ実行
node import-tracks.js --zone 3 --commit
```

| オプション | 説明 |
|-----------|------|
| `--zone <1-4>` | 対象Zone（必須） |
| `--count <N>` | 処理するプロンプト数の上限（省略時はpending全件） |
| `--src <dir>` | DL元（既定 `/Volumes/HD-NRLD-A/KU-Project/music/zone<N>`） |
| `--player <dir>` | プレイヤールート（既定 `~/ku-music-player`） |
| `--commit` | **実際に**変更・git実行（無いとdry-run） |
| `--no-git` | gitコミット/プッシュをスキップ |
| `--match title\|order` | ファイル照合方式（既定 `title`） |

**照合方式:**
- `title`（推奨）: DLファイル名にSUNOタイトル（`KU-Z3-001_112bpm`）が含まれる前提で照合。
- `order`: 更新時刻順に並べ、pending曲へ2件ずつ(A,B)を機械的に割当て（タイトル未設定時のフォールバック）。

**処理内容（--commit時）:**
1. `KU-Z3-001_112bpm.mp3` → `KU-Z3-001_112bpm-A.mp3` / `…-B.mp3` にリネーム（HDD内＝Zone振り分け）
2. `~/ku-music-player/zone3/` へコピー
3. `index.html` の `KU:Z3` マーカー間を台帳から再生成して追記（冪等）
4. `library.json` を更新
5. 台帳の該当曲を `published` に
6. `git add . && git commit && git push`

---

## 1サイクルの実行例 / Full cycle

```bash
cd ~/ku-music-player

# 1. Zone3を25プロンプト生成
node prompt-generator.js --zone 3 --count 25

# 2. suno-input/ の投入リストを見ながらSUNOで生成・DL
#    （DL先: /Volumes/HD-NRLD-A/KU-Project/music/zone3/）

# 3. 計画確認 → 実行
node import-tracks.js --zone 3
node import-tracks.js --zone 3 --commit
```

---

## 注意 / Notes
- Part A はどこでも実行可。Part B は外付けHDDとgitリポジトリにアクセスできる**ご自身のMac上（Claude Code/ターミナル）**で実行してください。
- `--commit` 前は必ず dry-run で計画を確認。
- 台帳 `prompts.json` が単一の真実です。手で消さないでください（連番・状態管理に使用）。
- A/Bが揃わない曲は「不完全」として警告表示され、`pending`のままにはしません（揃ったファイルのみpublished）。不足分は手動で対応。
- ミュージシャン名の混入は生成時に自動検証（`lib/ku-rules.js` のブラックリスト）。違反時は終了コード2で停止します。
