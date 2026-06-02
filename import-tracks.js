#!/usr/bin/env node
/**
 * import-tracks.js  —  KU Project / Part B「DL後処理」
 *
 * SUNOからDLしたmp3を、prompts.json台帳の "pending" 曲に照合して
 *   1) ルール通りにリネーム（KU-Z[N]-[連番]_[BPM]bpm-[A/B].mp3）
 *   2) 該当Zoneフォルダへ振り分け（外付けHDD）
 *   3) ~/ku-music-player/zone[N]/ へコピー
 *   4) index.html の曲リストを追記（マーカー方式）
 *   5) git add → commit → push
 * を行う再利用可能スクリプト。
 *
 * 安全設計: 既定は dry-run（何も変更しない）。実行は --commit を付ける。
 *
 * 使い方:
 *   node import-tracks.js --zone 3                 # dry-run（計画を表示するだけ）
 *   node import-tracks.js --zone 3 --commit        # 実行（リネーム・コピー・git push）
 *   node import-tracks.js --zone 3 --count 25 --commit
 *   node import-tracks.js --zone 3 --commit --no-git   # gitはスキップ
 *
 * オプション:
 *   --zone   <1-4>   対象Zone（必須）
 *   --count  <N>     処理する「プロンプト数」上限（省略時はpending全件）
 *   --src    <dir>   DL元mp3フォルダ（既定 /Volumes/HD-NRLD-A/KU-Project/music/zone[N]）
 *   --player <dir>   プレイヤーのルート（既定 ~/ku-music-player）
 *   --commit         実際にファイル変更・git実行（無いとdry-run）
 *   --no-git         gitコミット/プッシュをスキップ
 *   --match  <mode>  ファイル照合方式: title（既定）| order
 *
 * 照合(match):
 *   title : DLファイル名にSUNOタイトル(=KU-Z3-001_112bpm)が含まれる前提で照合（推奨）
 *   order : 更新時刻順に並べ、pending曲へ2件ずつ(A,B)機械的に割り当て
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const R = require('./lib/ku-rules');

function parseArgs(argv) {
  const a = { zone: null, count: null, src: null, player: null, commit: false, git: true, match: 'title' };
  for (let i = 2; i < argv.length; i++) {
    const v = argv[i]; const next = () => argv[++i];
    if (v === '--zone') a.zone = parseInt(next(), 10);
    else if (v === '--count') a.count = parseInt(next(), 10);
    else if (v === '--src') a.src = next();
    else if (v === '--player') a.player = next();
    else if (v === '--commit') a.commit = true;
    else if (v === '--no-git') a.git = false;
    else if (v === '--match') a.match = next();
    else if (v === '-h' || v === '--help') a.help = true;
  }
  return a;
}

function expandHome(p) {
  if (!p) return p;
  return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
}

function loadLedger(file) {
  if (!fs.existsSync(file)) throw new Error(`prompts.json が見つかりません: ${file}（先にprompt-generator.jsを実行）`);
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(d.tracks)) d.tracks = [];
  return d;
}

function listMp3(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.mp3'))
    .map((f) => {
      const full = path.join(dir, f);
      return { name: f, full, mtime: fs.statSync(full).mtimeMs };
    });
}

/** タイトル方式: 台帳ベース名がファイル名に含まれるものを集める */
function matchByTitle(tracks, files) {
  const plan = [];
  const used = new Set();
  for (const t of tracks) {
    const base = t.id; // KU-Z3-001_112bpm
    const hits = files
      .filter((f) => !used.has(f.full) && f.name.includes(base))
      .sort((x, y) => x.name.localeCompare(y.name) || x.mtime - y.mtime);
    const takeFiles = hits.slice(0, 2);
    takeFiles.forEach((f) => used.add(f.full));
    plan.push({ track: t, sources: takeFiles });
  }
  const leftover = files.filter((f) => !used.has(f.full));
  return { plan, leftover };
}

/** 順序方式: mtime順で2件ずつA/Bに割り当て */
function matchByOrder(tracks, files) {
  const sorted = files.slice().sort((a, b) => a.mtime - b.mtime || a.name.localeCompare(b.name));
  const plan = [];
  let idx = 0;
  for (const t of tracks) {
    const sources = sorted.slice(idx, idx + 2);
    idx += 2;
    plan.push({ track: t, sources });
  }
  const leftover = sorted.slice(idx);
  return { plan, leftover };
}

function ensureDir(dir, commit) {
  if (commit && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---- index.html マーカー方式の追記 ----
// プレイヤー側に下記マーカーを一度だけ設置しておく:
//   <!-- KU:Z3:START --> ... <!-- KU:Z3:END -->
// その間を、台帳のpublished曲から再生成して置換する（冪等）。
function buildTrackListHtml(zone, allTracksForZone) {
  const items = [];
  for (const t of allTracksForZone) {
    for (const file of t.files) {
      items.push(`        <li data-zone="${zone}" data-bpm="${t.bpm}" data-src="zone${zone}/${file}">${file.replace(/\.mp3$/, '')}</li>`);
    }
  }
  return items.join('\n');
}

function updateIndexHtml(playerDir, zone, allTracksForZone, commit, log) {
  const indexFile = path.join(playerDir, 'index.html');
  if (!fs.existsSync(indexFile)) { log(`  ⚠ index.html が見つかりません: ${indexFile}（スキップ）`); return false; }
  const startMark = `<!-- KU:Z${zone}:START -->`;
  const endMark = `<!-- KU:Z${zone}:END -->`;
  let html = fs.readFileSync(indexFile, 'utf8');
  const s = html.indexOf(startMark);
  const e = html.indexOf(endMark);
  if (s === -1 || e === -1 || e < s) {
    log(`  ⚠ index.html にマーカー ${startMark} … ${endMark} が無いため追記をスキップ。`);
    log(`    （プレイヤーの曲リスト箇所に1度だけ設置してください。READMEのindex.html設定参照）`);
    return false;
  }
  const inner = '\n' + buildTrackListHtml(zone, allTracksForZone) + '\n      ';
  const updated = html.slice(0, s + startMark.length) + inner + html.slice(e);
  if (commit) fs.writeFileSync(indexFile, updated, 'utf8');
  log(`  ${commit ? '✓' : '[dry-run]'} index.html の Zone${zone} リストを ${allTracksForZone.reduce((n, t) => n + t.files.length, 0)} ファイルで更新`);
  return true;
}

// ---- library.json（プレイヤー用の単一マニフェスト・任意） ----
function updateLibraryJson(playerDir, ledger, commit, log) {
  const libFile = path.join(playerDir, 'library.json');
  const published = ledger.tracks.filter((t) => t.status === 'published');
  const lib = { updatedAt: new Date().toISOString(), zones: {} };
  for (const t of published) {
    const z = String(t.zone);
    (lib.zones[z] = lib.zones[z] || []).push(...t.files.map((f) => ({ file: `zone${t.zone}/${f}`, bpm: t.bpm, id: t.id })));
  }
  if (commit) fs.writeFileSync(libFile, JSON.stringify(lib, null, 2) + '\n', 'utf8');
  log(`  ${commit ? '✓' : '[dry-run]'} library.json 更新（published計${published.length}プロンプト）`);
}

function runGit(playerDir, message, log) {
  const opts = { cwd: playerDir, stdio: 'pipe' };
  const git = (...a) => execFileSync('git', a, opts).toString().trim();
  try {
    git('add', '.');
    const status = git('status', '--porcelain');
    if (!status) { log('  ⚠ 変更なし。gitコミットをスキップ。'); return; }
    git('commit', '-m', message);
    git('push');
    log(`  ✓ git push 完了: "${message}"`);
  } catch (e) {
    const out = (e.stdout && e.stdout.toString()) || '';
    const err = (e.stderr && e.stderr.toString()) || e.message;
    log(`  ⚠ git実行でエラー:\n${out}${err}`);
  }
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('使い方: node import-tracks.js --zone <1-4> [--count N] [--src dir] [--player dir] [--commit] [--no-git] [--match title|order]');
    return;
  }
  if (!args.zone || !R.ZONES[args.zone]) { console.error('エラー: --zone を 1〜4 で指定。'); process.exit(1); }

  const zone = args.zone;
  const commit = args.commit;
  const cwd = process.cwd();
  const ledgerFile = path.join(cwd, 'prompts.json');
  const playerDir = expandHome(args.player) || path.join(os.homedir(), 'ku-music-player');
  const srcDir = expandHome(args.src) || `/Volumes/HD-NRLD-A/KU-Project/music/zone${zone}`;
  const destZoneDir = path.join(playerDir, `zone${zone}`);

  const log = (m) => console.log(m);
  log(`=== KU import-tracks  Zone ${zone}「${R.ZONES[zone].label}」 ${commit ? '【実行モード】' : '【DRY-RUN（変更なし）】'} ===`);
  log(`  src    : ${srcDir}`);
  log(`  player : ${playerDir}`);
  log(`  match  : ${args.match}`);
  log('');

  const ledger = loadLedger(ledgerFile);
  let pending = ledger.tracks
    .filter((t) => t.zone === zone && t.status === 'pending')
    .sort((a, b) => a.seq - b.seq);
  if (args.count != null) pending = pending.slice(0, args.count);

  if (pending.length === 0) { log('処理対象(pending)がありません。'); return; }

  const files = listMp3(srcDir);
  log(`  pending曲: ${pending.length}  /  src内mp3: ${files.length}`);
  log('');

  const { plan, leftover } = args.match === 'order'
    ? matchByOrder(pending, files)
    : matchByTitle(pending, files);

  // 計画表示 & 実行
  ensureDir(srcDir, commit);
  ensureDir(destZoneDir, commit);

  const publishedNow = [];
  let renamed = 0, copied = 0, incomplete = 0;

  for (const { track, sources } of plan) {
    const takes = ['A', 'B'];
    const finalFiles = [];
    if (sources.length === 0) {
      log(`  ✗ ${track.id} : 対応mp3が見つからない（スキップ）`);
      incomplete++;
      continue;
    }
    sources.forEach((src, i) => {
      const take = takes[i] || `X${i}`;
      const finalName = R.trackFileName(zone, track.seq, track.bpm, take);
      const finalSrcPath = path.join(srcDir, finalName);
      const destPath = path.join(destZoneDir, finalName);
      log(`  ${commit ? '✓' : '·'} ${src.name}  →  zone${zone}/${finalName}`);
      if (commit) {
        if (src.full !== finalSrcPath) fs.renameSync(src.full, finalSrcPath); // HDD内でリネーム＝Zone振り分け
        fs.copyFileSync(finalSrcPath, destPath);                              // playerへコピー
      }
      renamed++; copied++;
      finalFiles.push(finalName);
    });
    if (sources.length < 2) { log(`     ⚠ ${track.id}: takeが${sources.length}件のみ（A/B揃わず）`); incomplete++; }
    track.files = finalFiles.length ? finalFiles : track.files;
    track.status = 'published';
    track.publishedAt = new Date().toISOString();
    publishedNow.push(track);
  }

  if (leftover.length) {
    log('');
    log(`  ⚠ 未割り当てのmp3が${leftover.length}件: ${leftover.slice(0, 6).map((f) => f.name).join(', ')}${leftover.length > 6 ? ' …' : ''}`);
  }

  log('');
  // index.html / library.json
  const allZoneTracks = ledger.tracks
    .filter((t) => t.zone === zone && (t.status === 'published'))
    .sort((a, b) => a.seq - b.seq);
  updateIndexHtml(playerDir, zone, allZoneTracks, commit, log);
  updateLibraryJson(playerDir, ledger, commit, log);

  // 台帳保存
  if (commit) {
    ledger.updatedAt = new Date().toISOString();
    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n', 'utf8');
    log(`  ✓ prompts.json 更新（${publishedNow.length}曲を published に）`);
  } else {
    log(`  [dry-run] prompts.json は変更しません（${publishedNow.length}曲が published になる予定）`);
  }

  // git
  log('');
  if (args.git) {
    const msg = `Add ${publishedNow.length} tracks Zone${zone} (${publishedNow.length * 2} files)`;
    if (commit) runGit(playerDir, msg, log);
    else log(`  [dry-run] git add . && git commit -m "${msg}" && git push`);
  } else {
    log('  git: スキップ（--no-git）');
  }

  log('');
  log(`完了サマリ: 処理${plan.length}プロンプト / リネーム${renamed} / コピー${copied} / 不完全${incomplete}`);
  if (!commit) log('※ これはDRY-RUNです。実行するには --commit を付けてください。');
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('Fatal:', e.message); process.exit(1); }
}

module.exports = { matchByTitle, matchByOrder, buildTrackListHtml };
