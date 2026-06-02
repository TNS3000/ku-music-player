#!/usr/bin/env node
/**
 * prompt-generator.js  —  KU Project / Part A「投入準備」
 *
 * 指定Zoneのプロンプトを一括生成し、
 *   1) SUNO投入リスト（1曲1行・対応ファイル名併記）を .txt 出力
 *   2) prompts.json 台帳を自動更新（status: "pending"）
 * する再利用可能スクリプト。SUNO生成そのものは手動のまま。
 *
 * 使い方:
 *   node prompt-generator.js --zone 3 --count 25
 *   node prompt-generator.js --zone 2 --count 25 --start 36   # 連番を強制
 *   node prompt-generator.js --zone 3 --count 25 --seed 42     # 再現可能な乱数
 *
 * 出力:
 *   ./suno-input/suno-input-Z3-YYYYMMDD-HHMM.txt
 *   ./prompts.json （追記更新）
 *
 * ルールは lib/ku-rules.js（KU-PROJECT-MASTER.md 第3章）に準拠。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const R = require('./lib/ku-rules');

// ---------- 引数パース ----------
function parseArgs(argv) {
  const args = { zone: null, count: null, start: null, seed: null, outDir: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--zone') args.zone = parseInt(next(), 10);
    else if (a === '--count') args.count = parseInt(next(), 10);
    else if (a === '--start') args.start = parseInt(next(), 10);
    else if (a === '--seed') args.seed = parseInt(next(), 10);
    else if (a === '--out') args.outDir = next();
    else if (a === '-h' || a === '--help') args.help = true;
  }
  return args;
}

function usage() {
  console.log(`KU prompt-generator — Part A 投入準備
使い方: node prompt-generator.js --zone <1-4> --count <N> [--start <seq>] [--seed <n>]
  --zone   対象Zone (1-4) 必須
  --count  生成プロンプト数（=SUNO投入回数。各回でA/Bの2takeが生成される）必須
  --start  連番の開始番号（省略時はprompts.jsonの続きから）
  --seed   乱数シード（再現用）
  --out    出力先ディレクトリ（省略時 ./suno-input）`);
}

// ---------- 乱数（シード対応・再現可能） ----------
function makeRng(seed) {
  if (seed == null) return Math.random;
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ---------- 配列ユーティリティ ----------
// シャッフルした配列から非復元で順に取り出し、尽きたら再シャッフルして継続。
// → 同一セッション内の「被り回避」を最大化しつつ、count>要素数でも動く。
function makeCycler(items, rng) {
  let pool = [];
  function refill() {
    pool = items.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  return function take() {
    if (pool.length === 0) refill();
    return pool.pop();
  };
}

function pickTwoDistinct(items, rng) {
  const a = items[Math.floor(rng() * items.length)];
  let b = a;
  let guard = 0;
  while (b === a && guard++ < 20) b = items[Math.floor(rng() * items.length)];
  return [a, b];
}

// BPMをZone範囲内で均等に散らす（i番目 / 全count）
function bpmForIndex(zoneCfg, i, count) {
  const span = zoneCfg.bpmMax - zoneCfg.bpmMin;
  if (count <= 1 || span <= 0) return zoneCfg.bpmMin;
  const v = zoneCfg.bpmMin + Math.round((span * i) / (count - 1));
  return Math.min(zoneCfg.bpmMax, Math.max(zoneCfg.bpmMin, v));
}

// ---------- プロンプト1件を組み立て ----------
function buildPrompt(zone, bpm, cyclers, rng) {
  const zoneCfg = R.ZONES[zone];
  const [core1, core2] = pickTwoDistinct(zoneCfg.coreStyles, rng);
  const drum = cyclers.drum();
  const texture = cyclers.texture();
  const melody = cyclers.melody();
  const mood = cyclers.mood();
  const soul = cyclers.soul();

  const parts = [
    `${core1}, ${core2}`,
    'instrumental, no vocals',
    `${bpm}bpm`,
    'background work music',
    drum,
    texture,
    melody,
  ];
  // コードカラーは50%の確率で追加
  if (rng() < 0.5) parts.push(cyclers.chord());
  parts.push(mood, soul);
  // Zone1/4はドロップ・急展開禁止を明示
  if (zoneCfg.noDrops) parts.push('no drops, no sudden transitions, steady dynamics');

  return { prompt: parts.join(', '), meta: { core: [core1, core2], drum, texture, melody, mood, soul } };
}

// ---------- 台帳(prompts.json)入出力 ----------
function loadLedger(file) {
  if (!fs.existsSync(file)) return { tracks: [] };
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(data.tracks)) data.tracks = [];
    return data;
  } catch (e) {
    throw new Error(`prompts.json の読み込みに失敗: ${e.message}`);
  }
}

function nextSeqForZone(ledger, zone) {
  let max = 0;
  for (const t of ledger.tracks) {
    if (t.zone === zone && typeof t.seq === 'number' && t.seq > max) max = t.seq;
  }
  return max + 1;
}

function dateStamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return {
    iso: d.toISOString(),
    ymd: `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`,
    hm: `${p(d.getHours())}${p(d.getMinutes())}`,
  };
}

// ---------- メイン ----------
function main() {
  const args = parseArgs(process.argv);
  if (args.help) { usage(); return; }

  if (!args.zone || !R.ZONES[args.zone]) {
    console.error('エラー: --zone は 1〜4 で指定してください。');
    usage(); process.exit(1);
  }
  if (!args.count || args.count < 1) {
    console.error('エラー: --count は1以上で指定してください。');
    usage(); process.exit(1);
  }

  const cwd = process.cwd();
  const ledgerFile = path.join(cwd, 'prompts.json');
  const outDir = args.outDir || path.join(cwd, 'suno-input');
  fs.mkdirSync(outDir, { recursive: true });

  const zone = args.zone;
  const zoneCfg = R.ZONES[zone];
  const rng = makeRng(args.seed);
  const ledger = loadLedger(ledgerFile);
  const startSeq = args.start != null ? args.start : nextSeqForZone(ledger, zone);
  const ds = dateStamp();

  const cyclers = {
    drum: makeCycler(R.DRUM_PATTERNS, rng),
    texture: makeCycler(R.TEXTURES, rng),
    melody: makeCycler(R.MELODY_INSTRUMENTS, rng),
    mood: makeCycler(R.MOODS, rng),
    soul: makeCycler(R.SOULFUL_EXPRESSIONS, rng),
    chord: makeCycler(R.CHORD_COLORS, rng),
  };

  const generated = [];
  const validationErrors = [];

  for (let i = 0; i < args.count; i++) {
    const seq = startSeq + i;
    const bpm = bpmForIndex(zoneCfg, i, args.count);
    const { prompt, meta } = buildPrompt(zone, bpm, cyclers, rng);

    const errs = R.validatePrompt(prompt, bpm);
    if (errs.length) validationErrors.push({ seq, errs });

    const base = R.baseName(zone, seq, bpm);
    generated.push({
      id: base,                 // KU-Z3-011_114bpm
      zone, seq, bpm,
      title: base,              // SUNOのタイトル欄に貼る値（Part Bでの照合に使う）
      prompt,
      files: [
        R.trackFileName(zone, seq, bpm, 'A'),
        R.trackFileName(zone, seq, bpm, 'B'),
      ],
      meta,
      status: 'pending',        // pending → (SUNO生成) → import-tracks.js で published
      batch: `${ds.ymd}-${ds.hm}`,
      createdAt: ds.iso,
    });
  }

  if (validationErrors.length) {
    console.error('検証エラー（ルール違反）:');
    for (const v of validationErrors) console.error(`  seq ${v.seq}: ${v.errs.join('; ')}`);
    process.exit(2);
  }

  // ---- SUNO投入リスト .txt ----
  const txtFile = path.join(outDir, `suno-input-Z${zone}-${ds.ymd}-${ds.hm}.txt`);
  const lines = [];
  lines.push(`# KU SUNO 投入リスト  Zone ${zone}「${zoneCfg.label}」`);
  lines.push(`# 生成: ${ds.iso}  /  ${generated.length}プロンプト  /  BPM ${zoneCfg.bpmMin}-${zoneCfg.bpmMax}`);
  lines.push('# 手順: SUNOのCustom Modeで instrumental をON。');
  lines.push('#       各プロンプトの TITLE をタイトル欄、STYLE をStyle欄に貼り付ける。');
  lines.push('#       TITLEを使うとPart B(import-tracks.js)が自動でファイルを照合できる。');
  lines.push('#       1プロンプト = SUNOで2take生成 → -A / -B の2ファイルになる。');
  lines.push('');
  for (const g of generated) {
    lines.push(`[${R.pad3(g.seq)}] TITLE: ${g.title}`);
    lines.push(`      STYLE: ${g.prompt}`);
    lines.push(`      FILES: ${g.files.join('  ,  ')}`);
    lines.push('');
  }
  fs.writeFileSync(txtFile, lines.join('\n'), 'utf8');

  // 貼り付け専用1: 曲名(TITLE)とSTYLEをペアで（SUNOのタイトル欄→Style欄に順コピペ）
  const pasteFile = path.join(outDir, `suno-paste-Z${zone}-${ds.ymd}-${ds.hm}.txt`);
  const pasteLines = [];
  for (const g of generated) {
    pasteLines.push(g.title);   // ← 曲名（タイトル欄へ）
    pasteLines.push(g.prompt);  // ← STYLE（Style欄へ）
    pasteLines.push('');
  }
  fs.writeFileSync(pasteFile, pasteLines.join('\n'), 'utf8');

  // 貼り付け専用2: TSV（曲名<TAB>STYLE）。スプレッドシートや一括処理用。
  const tsvFile = path.join(outDir, `suno-Z${zone}-${ds.ymd}-${ds.hm}.tsv`);
  fs.writeFileSync(tsvFile, generated.map((g) => `${g.title}\t${g.prompt}`).join('\n') + '\n', 'utf8');

  // ---- prompts.json 台帳更新 ----
  ledger.tracks.push(...generated);
  ledger.updatedAt = ds.iso;
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n', 'utf8');

  // ---- サマリ ----
  console.log(`✅ Zone ${zone}「${zoneCfg.label}」 ${generated.length}プロンプト生成`);
  console.log(`   連番: ${R.pad3(startSeq)} 〜 ${R.pad3(startSeq + args.count - 1)}`);
  console.log(`   BPM : ${generated[0].bpm} 〜 ${generated[generated.length - 1].bpm}`);
  console.log(`   投入リスト   : ${path.relative(cwd, txtFile)}`);
  console.log(`   貼付用(曲名+STYLE): ${path.relative(cwd, pasteFile)}`);
  console.log(`   TSV(曲名\\tSTYLE)  : ${path.relative(cwd, tsvFile)}`);
  console.log(`   台帳         : ${path.relative(cwd, ledgerFile)} （計${ledger.tracks.length}件）`);
  console.log(`   想定ファイル数: ${generated.length * 2}（A/B各${generated.length}）`);
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('Fatal:', e.message); process.exit(1); }
}

module.exports = { buildPrompt, bpmForIndex, makeRng, nextSeqForZone };
