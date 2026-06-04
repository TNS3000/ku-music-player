# CLAUDE.md — ku-music-player

**Repository:** TNS3000/ku-music-player
**Scope:** ベジクル株式会社（青果卸業・24時間倉庫）向け機能性音楽プレイヤー専用 / Functional music player for Vegekul warehouse staff
**Player URL:** https://TNS3000.github.io/ku-music-player/

> このファイルはこのリポジトリ専用の作業憲法です。KU全体のビジョン・他サブブランド（HYPNIQ等）・記事/コンテンツ戦略はここには書きません。それらは `~/KU/` 側の Brand Bible を参照してください。
> This file is the working constitution for THIS repository only. KU-wide vision, other sub-brands (HYPNIQ, etc.), and article/content strategy do NOT belong here — see the Brand Bible under `~/KU/`.

---

## 1. ミッション / Mission

**JP:** 倉庫作業員が楽しく・ミスなく・効率的に働ける音環境をデザインする。歌詞なしインスト音楽を時間帯（4ゾーン）に合わせて配信し、長時間聴いても疲れず背景化しやすい音楽を提供する。

**EN:** Design a sound environment that helps warehouse staff work enjoyably, accurately, and efficiently. Deliver instrumental, lyric-free music across four time-based zones — music that fades into the background and never fatigues over long shifts.

---

## 2. 音楽設計憲法 / Music Design Constitution

### コアアイデンティティ / Core Identity
**「LoFi meets Jazz Soul — Organic, Soulful, Functional」**

- テイスト / Taste: LoFi Hip Hop × Jazz Soul × Organic
- 歌詞 / Lyrics: **常にインストのみ。ボーカル・歌詞は一切禁止 / Instrumental only. No vocals, no lyrics — ever.**
- 目的 / Purpose: 作業員が長時間聴いても疲れない、背景化しやすい音楽 / Music that stays in the background and never tires the listener over long shifts.
- **ミュージシャン名（Nujabes・J Dilla等）はプロンプトに使わない / Never use musician names in prompts.**

### Nujabes / J Dilla を言葉で表現する / Expressing the reference in words
ミュージシャン名の代わりに以下の表現を使う / Use these phrases instead of names:

```
soulful jazz samples
melancholic chord progressions
warm jazzy atmosphere
introspective mood
dusty jazz sensibility
loose swing feel
laid-back timing
off-grid rhythm feel
soul sample texture
raw soulful warmth
```

### 4ゾーン設計 / Four-Zone Design

| Zone | 時間帯 / Time | BPM | コンセプト / Concept | 用途 / Use |
|------|--------------|-----|---------------------|-----------|
| Zone 1「Deep Work」 | 08:00-13:00 | 70-90 | アンビエント寄り Lo-Fi + 軽いジャズ | オフィス集中・午前準備 |
| Zone 2「Active Flow」 | 13:00-19:00 | 100-112 | 午後の作業ピーク | 倉庫稼働・ピッキング |
| Zone 3「Night Drive」 | 19:00-01:00 | 112-118 | 夜間集中の持続 | 夜間倉庫・搬送 |
| Zone 4「Deep Night」 | 01:00-08:00 | 90-100 | 覚醒維持・疲労軽減 | 深夜〜早朝・単調作業 |

### 機能性設計原則 / Functional Design Principles

| パラメータ / Parameter | 設計値 / Value | 根拠 / Rationale |
|-----------------------|---------------|------------------|
| BPM | Zone別 70-118 | 歩行同期研究（Styns et al. 2007：最適106-130BPM） |
| ダイナミクス / Dynamics | 抑制的 / Restrained | 集中の断絶を避ける |
| 音域 / Register | 中低域中心 / Mid-low | 長時間作業での聴覚疲労防止 |
| ドロップ・急展開 / Drops | 禁止 / Forbidden | 作業中断を誘発する |
| 歌詞 / Lyrics | 禁止 / Forbidden | 言語処理の妨害防止（Shih et al. 2012） |

---

## 3. SUNOプロンプト生成ルール / SUNO Prompt Rules

### 必須要素（毎回含める） / Required elements (every time)
```
instrumental, no vocals, [BPM]bpm, background work music
```

### プロンプト構造 / Prompt structure
```
[コアスタイル], instrumental, no vocals, [BPM]bpm,
[ドラムパターン], [テクスチャー], [メロディ楽器],
[ハーモニー要素（50%で追加）], [スケール],
[ムード], [Soulful Jazz表現], [ドロップ禁止（Zone1/4）]
```

### ファイル命名規則 / File naming
```
KU-Z[Zone番号]-[連番]_[BPM]bpm-[A/B].mp3
例 / e.g.: KU-Z2-011_104bpm-A.mp3
```

### Zone別コアスタイル / Core styles by zone

**Zone 1（70-90bpm）**
ambient lofi, lo-fi beats, organic lofi, chill hop, jazz fusion lofi, bossa nova lofi, modal jazz lofi, ambient jazz instrumental, soul jazz lofi, downtempo soul

**Zone 2（100-112bpm）**
lofi hip hop, chill hop, lo-fi beats, jazz hop, neo soul instrumental, afrobeat lofi, latin jazz lofi, soul jazz fusion, downtempo groove, organic hip hop

**Zone 3（112-118bpm）**
lofi hip hop, chill hop, lofi electronic fusion, neo soul lofi, afro lofi, jazz funk lofi, broken beat soul, latin lofi, soul groove instrumental

**Zone 4（90-100bpm）**
lofi hip hop, ambient lofi, chill hop, midnight jazz lofi, soul jazz instrumental, bossa nova lofi, modal jazz lofi, downtempo soul, organic jazz lofi, late night soul instrumental

### ドラムパターン（同一セッション内で被りを避ける） / Drum patterns (no repeats per session)
```
jazz brush snare / wire brushes on snare / half-time feel
bossa nova rhythm / one drop rhythm / hand percussion only
neo soul groove / shuffled hi-hats / boom bap drums
broken beat / loose swing drums / drunk drum feel
off-beat pocket groove / jazzy rim shot pattern
raw boom bap feel / soul shuffle beat / syncopated jazz groove
lazy hip hop drums
```

### コードカラー（50%の確率で追加） / Chord color (add ~50% of the time)
```
minor 7th chords / jazz chord extensions / sus2 chord voicing
lydian chord color / diminished passing chords
tritone substitution feel / modal chord progression
pentatonic melody over jazz chords
```

### バリエーション確保のチェックリスト / Variation checklist
- [ ] 同一セッションでドラムパターンが被っていないか
- [ ] 同一セッションでメロディ楽器が被っていないか
- [ ] 同一セッションでテクスチャーが被っていないか
- [ ] `instrumental` と `no vocals` が含まれているか
- [ ] BPMが数値で明示されているか
- [ ] ミュージシャン名が含まれていないか

---

## 4. 安全制約 / Safety Constraints (OSHA / NIOSH)

倉庫BGMで必ず守る / Hard rules for warehouse BGM:

- スピーカー音量がフォークリフト警告音・走行音をマスクしないこと / BGM must not mask forklift warning sounds.
- 環境騒音 + BGM の合計音圧が85dBを超えないこと（NIOSH基準） / Combined sound pressure must stay under 85dB.
- フォークリフト走行路・搬送機械近くは特に注意 / Extra caution near forklift paths and conveyor machinery.

---

## 5. 技術スタック / Tech Stack

| コンポーネント / Component | ツール / Tool | 場所 / Location |
|---------------------------|---------------|-----------------|
| プロンプト生成 | prompt-generator.js (Node.js) | ~/ku-music-player/ |
| 楽曲生成 | SUNO Pro（手動 / manual） | https://suno.com |
| 楽曲保存 | 外付けHDD | /Volumes/HD-NRLD-A/KU-Project/music/ |
| 配信 | GitHub Pages | https://TNS3000.github.io/ku-music-player/ |
| プレイヤー | index.html (Vanilla JS) | ~/ku-music-player/ |
| バージョン管理 | GitHub | TNS3000/ku-music-player |
| 台帳管理 | prompts.json | ~/ku-music-player/ |
| いいね機能 | ♡ボタン（Vanilla JS + localStorage） | index.html |

### いいね機能の仕様 / Like feature spec
- コントロール行末尾に♡ボタンを配置（現在再生中トラックに対して作用）
- タップでon/off切替：アウトライン ↔ 塗りつぶし（赤 `#e05a5a`）
- 永続化キー: `ku_likes`（localStorage、Set形式で title を保存）
- play-logへ記録: `type: "like" / "unlike"` + `track_id` フィールド
- 既存5イベント（play_start / play_stop / skip / zone_switch / track_complete）と同じ `logEvent()` 関数に統合
- CSVエクスポートに `track_id` カラム追加済み

### よく使うコマンド / Common commands
```bash
# 新しい音源をアップ / Add new tracks
cp /Volumes/HD-NRLD-A/KU-Project/music/zone[N]/*.mp3 ~/ku-music-player/zone[N]/
git add . && git commit -m "Add new tracks Zone[N]" && git push

# プロンプト生成 / Generate prompts
node prompt-generator.js --zone 2 --count 25
```

---

## 6. 楽曲ライブラリ状況 / Track Library Status

*最終確認: 2026-06-04*

| Zone | 配信曲数 / Tracks | 目標まで | BPM範囲 | ステータス / Status |
|------|------------------|---------|---------|-------------------|
| Zone 1「Deep Work」 | **110** | +10超過 | 70-90 | 目標達成・運用中 / Target reached |
| Zone 2「Active Flow」 | **100** | 達成 | 100-112 | 目標達成・運用中 / Target reached |
| Zone 3「Night Drive」 | **69** ※ | あと31曲 | 112-118 | 拡張中 / Expanding |
| Zone 4「Deep Night」 | **10** | あと90曲 | 90-100 | 拡張予定 / Planned |

**合計 / Total: 289 / 400曲（72.3%）**

**目標 / Target:** 各Zone 100曲（合計400曲）で24時間シャッフルの繰り返し感を最小化 / 100 tracks per zone (400 total) to minimize repetition over 24h shuffle.

### 既知の問題 / Known Issues
- **Zone3 KU-Z3-032-B 欠損**: `KU-Z3-032_116bpm-B.mp3` がHDD・リポジトリ両方に存在しない（生成漏れ）。SUNOで再生成が必要。
- **Zone3 重複ファイル**: `KU-Z3-032_116bpm-A (1).mp3`（macOS重複artifact）がリポジトリに混入。index.html未登録だが容量を無駄に使用。要 `git rm`。

### HDD ↔ リポジトリ整合性 / Sync status
- Zone 1: HDD=Repo=HTML=110 ✓
- Zone 2: HDD=Repo=HTML=100 ✓
- Zone 3: HDD=Repo=70（重複1含む実効69）、HTML=69 ※上記既知問題参照
- Zone 4: HDD=Repo=HTML=10 ✓

---

## 7. 直近の変更と次のアクション / Recent Changes & Next Steps

### 2026-06-04 の作業
- **Zone1拡張完了**: KU-Z1-011〜060（A/B各50曲 = 100ファイル）を追加。Zone1合計110曲、目標100曲を達成。
- **いいね機能（♡ボタン）実装**: コントロール行に追加。play-log統合（like/unlikeイベント）・localStorage永続化・CSV出力対応。本番反映済み。
- **ライブラリ全数スキャン**: HDD・リポジトリ・index.htmlの整合性確認。Zone3に既知問題を発見（上記「既知の問題」参照）。

### 次回優先アクション / Next priorities
1. **Zone3 KU-Z3-032-B を生成**: SUNOで116bpm / Zone3スタイルで生成 → `zone3/` にコピー → index.htmlに1行追加
2. **Zone3 重複artifact を削除**: `git rm "zone3/KU-Z3-032_116bpm-A (1).mp3" && git commit`
3. **Zone3 拡張**: 現在69曲、目標まであと31曲
4. **Zone4 拡張**: 現在10曲、最優先で拡張（目標まであと90曲）

---

*このファイルは ku-music-player リポジトリ専用の作業憲法です。KU全体戦略は `~/KU/` を参照。*
*This file is the working constitution for the ku-music-player repository only. For KU-wide strategy, see `~/KU/`.*
