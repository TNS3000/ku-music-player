# CLAUDE.md — KU Project
*Claude Codeがこのプロジェクトで作業する前に必ず読む指示書*
*Last updated: 2026-05-11*

---

## 0. このファイルの使い方

作業前に必ずこのファイルを読む。
判断に迷ったときはここに戻る。
更新はCEOの指示のみ。

---

## 1. KUとは何か

```
KU（空）は "Research-informed Listening Experience Project"

音楽配信サービスではない。
音楽レーベルでもない。

音・聴取・状態・空間・夜・注意・疲れ・休息の関係を探求する
研究・設計プロジェクト。

ビジョン："Designing Mind States Through Sound"
ドメイン：ku-listen.ing
```

### KUが提供するもの
```
「効果」ではなく「体験」。
医療効果は断定しない。
"research-informed"な立場を取る。
科学そのものを売らない。
体験設計を主軸にする。
```

### ブランド構造
```
KU（空）— 上位ブランド
│
├── HYPNIQ — 睡眠・入眠領域（最初の実装）
│
├── [ 将来 ] Focus / Flow / Recovery
│
└── [ 将来 ] Sound Design Studio
```

---

## 2. ターゲット

```
ペルソナ：Justin
年齢：35歳 / 職業：知的労働者
特徴：カルチャー感度高め・音楽好き・寝付きが悪い
     ストレスあり・都市部・20〜40代・英語圏

拡張ターゲット：
・ambient / electronicリスナー
・neurodivergent層・HSP
・クリエイター
・サウナ / 瞑想層
・都市疲労を感じる人
```

---

## 3. ブランドトーン（必ず守る）

### 使う表現
```
・research suggests / we observe
・listening session / protocol / experience
・research-informed
・appears to / may / in some cases
・「研究から示唆される」
・「私たちが観察したのは」
```

### 絶対に使わない表現
```
・proven / guaranteed / clinically proven
・「効果があります」「眠れます」
・「科学的に証明された」
・healing / spiritual / new age系のcliché
・wellness buzzwords
・lo-fi beats / generic sleep music
```

### 声のトーン
```
calm / reflective / research-oriented /
aesthetic / non-hype / non-clickbait /
speculative but careful
```

---

## 4. コンテンツ戦略

### フェーズ設計
```
Phase 1：Reader acquisition（読者獲得）
 └ 信頼を先に作る。売らない。KUの世界観に触れさせる。
 └ Reddit最優先（r/ambientmusic / r/sleep）

Phase 2：Research publishing（研究発信）
 └ KUが「探求プロジェクト」であることを示す。
 └ 仮説と根拠を明確に分けて発信。

Phase 3：Conversion（販売接続）
 └ Protocol・アーティスト作品・Membership（$99/yr）への導線。
```

### カテゴリ構造（大項目）
```
Phase 1：
 A. Urban noise & mind state
 B. Sleep science basics
 C. Listening practices

Phase 2：
 D. State transition science
 E. Protocol observations
 F. Sound design research

Phase 3：
 G. Protocol deep dives
 H. Artist × KU
 I. Membership onboarding
```

### 記事フォーマット構造
```
Title          ： 疑問形 or 逆説形
Lede           ： 情景描写 or 研究の驚きから1文
Body structure ：
  - What we know（科学的根拠）
  - What we think（KUの仮説）
  - What we don't know（誠実な限界の開示）
  - What this means for you（Justinへの接続）
CTA            ： Protocolを試す / Newsletter登録 / 共同研究者になる
Legal check    ： 医療的断言なし・アフィリエイト開示・データ同意リンク
Podcast ready  ： 箇条書き最小 / 読み上げ可能な文体
```

### 3フォーマット設計
```
Newsletter（完全版）  2000〜2500字 / words
  ↓ 圧縮
Blog（中間版）        1200〜1500字 / words
  ↓ 圧縮＋Reddit文体
Reddit（短縮版）      800〜1000字 / words
                      ＋ 末尾に問いかけを必ず入れる
```

### 発信プラットフォーム
```
Beehiiv   ：メインNewsletter（無料＋有料$99/yr）★★★
Reddit    ：r/ambientmusic / r/sleep ★★★
Blog      ：ku-listen.ingに掲載 ★★
X         ：研究ツイート・断片 ★
Podcast   ：将来対応（記事は読み上げ可能な文体で書いておく）
```

---

## 5. 自動化タスク（Claude Codeが実行するもの）

### 5-1. 記事初稿生成

**コマンド例：**
```
「KU記事を生成して。カテゴリ：[A-I] タイトル：[タイトル]」
```

**生成ルール：**
- 必ずセクション4の記事フォーマット構造に従う
- ブランドトーンのルール（セクション3）を遵守
- 仮説と科学的根拠を明示的に区別する
- 医療的断言を含まないか最後に必ずチェック
- 出力はMarkdown形式

**ファイル命名規則：**
```
KU_[カテゴリ]_[連番]_[slug]_draft.md
例：KU_A1_urban-noise-mind-state_draft.md
```

### 5-2. 3フォーマット変換

**コマンド例：**
```
「このNewsletter記事をBlogとReddit用に変換して」
```

**変換ルール：**

Newsletter → Blog：
- 2000〜2500字を1200〜1500字に圧縮
- 個人的体験の描写とプロジェクト接続部分を残す
- 研究の詳細は圧縮してよい

Newsletter → Reddit：
- 800〜1000字に圧縮
- 売り込みゼロ。KUへの言及は最小限
- 末尾に読者への問いかけを必ず入れる
- 問いかけは「体験ベース」の問い（概念的すぎない）

**ファイル命名規則：**
```
KU_[カテゴリ]_[連番]_[slug]_newsletter.md
KU_[カテゴリ]_[連番]_[slug]_blog.md
KU_[カテゴリ]_[連番]_[slug]_reddit.md
```

### 5-3. 英語 ↔ 日本語 変換

**コマンド例：**
```
「この記事を日本語にして」
「この記事を英語にして」
```

**翻訳ルール：**
- 直訳ではなく、その言語のリズムで書き直す
- ブランドトーンを言語ごとに最適化する
- 日本語版はより体験ベースの問いかけにする
- ファイル名末尾に _JP / _EN を付ける

### 5-4. KPIレポート生成（将来対応）
```
・週次：開封率・Reddit upvote・登録者数
・月次：フォーマット別パフォーマンス比較
・異常値アラート
```

### 5-5. SNS投稿スケジューリング（将来対応）
```
・記事からX投稿用の断片を生成
・Redditへの投稿テキスト最終確認
```

---

## 6. 手動を維持するもの（Claude Codeがやらないこと）

```
・Reddit投稿・返信（信頼の問題）
・購入者への個別返信
・アーティストとの関係構築
・コンテンツの品質判断
・施策の最終決定
・Brand Bibleの更新（CEOのみ）
```

---

## 7. 法的チェックリスト（全コンテンツ共通）

生成した全コンテンツに対して以下を確認する：

```
□ 医療効果の断言がないか
□ 「証明された」「保証する」等の表現がないか
□ アフィリエイトリンクを含む場合、開示文があるか
  EN："This content contains affiliate links."
  JP：「本記事にはアフィリエイトリンクが含まれています。」
□ データ収集への同意リンクが含まれているか（該当記事）
□ Suno生成音源の商業利用規約に違反していないか
```

---

## 8. ファイル構造（正式）

```
KU/
  CLAUDE.md                ← このファイル（指示書。必ず最初に読む）
  /content
    /drafts                ← 全記事の初稿・作業中ファイル
    /published             ← 公開済みファイル（編集しない）
  /strategy                ← Brand Bible・コンテンツ戦略書
  /assets
    /audio                 ← Protocol音源
    /images                ← ビジュアル素材
  /data
    /listener-reports      ← リスナーデータ（匿名化済み）
```

### 廃止フォルダ（使わない）
```
/notes   → /content/drafts に統合
/posts   → /content/drafts に統合
```

### ファイル命名規則
```
記事初稿：
  YYYY-MM-DD_[slug]_[format].md
  例：2026-05-11_involuntary-listening_newsletter.md
      2026-05-11_involuntary-listening_blog.md
      2026-05-11_involuntary-listening_reddit.md
      2026-05-11_involuntary-listening_newsletter_JP.md

戦略・設計書：
  KU_[内容]_v[バージョン].md
  例：KU_brand-bible_v1.2.md
      KU_content-strategy_v1.0.md
```

### 作業ルール（Claude Code・このチャット共通）
```
1. 作業前に必ずCLAUDE.mdを読む
2. ファイルは必ず /content/drafts に保存する
3. 命名規則に従う（フォルダを新規作成しない）
4. 公開済みファイルは /published に移動し編集しない
5. 戦略書の更新はCEOの指示のみ
```

---

## 9. Version History

| Version | Date | 変更内容 |
|---|---|---|
| 1.0 | 2026-05-11 | 初版作成。Brand Bible + コンテンツ戦略 + 自動化タスクを統合 |
| 1.1 | 2026-05-11 | フォルダ構成を正式化。notes・posts廃止。命名規則・作業ルールを追加 |

---

*KU / 空 — "Designing Human States Through Sound"*
*ku-listen.ing*
