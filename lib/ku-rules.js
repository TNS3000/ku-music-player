/**
 * ku-rules.js
 * KU-PROJECT-MASTER.md 第3章「SUNOプロンプト生成ルール」を機械可読化したもの。
 * prompt-generator.js / import-tracks.js が共有する唯一の真実(single source of truth)。
 *
 * 原則:
 *  - 毎回 instrumental, no vocals, [BPM]bpm, background work music を含む
 *  - ミュージシャン名は絶対に入れない（言葉での代替表現のみ使用）
 *  - ファイル名: KU-Z[Zone]-[連番3桁]_[BPM]bpm-[A/B].mp3
 */

'use strict';

// 必須要素（毎回含める）
const REQUIRED_TOKENS = ['instrumental', 'no vocals', 'background work music'];

// Zone別設定（BPM範囲・コアスタイル・ドロップ禁止フラグ）
const ZONES = {
  1: {
    label: 'Deep Work',
    bpmMin: 70,
    bpmMax: 90,
    noDrops: true, // Zone1/4はドロップ・急展開禁止
    coreStyles: [
      'ambient lofi', 'lo-fi beats', 'organic lofi', 'chill hop', 'jazz fusion lofi',
      'bossa nova lofi', 'modal jazz lofi', 'ambient jazz instrumental', 'soul jazz lofi', 'downtempo soul',
    ],
  },
  2: {
    label: 'Active Flow',
    bpmMin: 100,
    bpmMax: 112,
    noDrops: false,
    coreStyles: [
      'lofi hip hop', 'chill hop', 'lo-fi beats', 'jazz hop', 'neo soul instrumental',
      'afrobeat lofi', 'latin jazz lofi', 'soul jazz fusion', 'downtempo groove', 'organic hip hop',
    ],
  },
  3: {
    label: 'Night Drive',
    bpmMin: 112,
    bpmMax: 118,
    noDrops: false,
    coreStyles: [
      'lofi hip hop', 'chill hop', 'lofi electronic fusion', 'neo soul lofi', 'afro lofi',
      'jazz funk lofi', 'broken beat soul', 'latin lofi', 'soul groove instrumental',
    ],
  },
  4: {
    label: 'Deep Night',
    bpmMin: 90,
    bpmMax: 100,
    noDrops: true,
    coreStyles: [
      'lofi hip hop', 'ambient lofi', 'chill hop', 'midnight jazz lofi', 'soul jazz instrumental',
      'bossa nova lofi', 'modal jazz lofi', 'downtempo soul', 'organic jazz lofi', 'late night soul instrumental',
    ],
  },
};

// ドラムパターン（同一セッション内で被りを避ける）
const DRUM_PATTERNS = [
  'jazz brush snare', 'wire brushes on snare', 'half-time feel',
  'bossa nova rhythm', 'one drop rhythm', 'hand percussion only',
  'neo soul groove', 'shuffled hi-hats', 'boom bap drums',
  'broken beat', 'loose swing drums', 'drunk drum feel',
  'off-beat pocket groove', 'jazzy rim shot pattern',
  'raw boom bap feel', 'soul shuffle beat', 'syncopated jazz groove',
  'lazy hip hop drums',
];

// コードカラー（50%の確率で追加）
const CHORD_COLORS = [
  'minor 7th chords', 'jazz chord extensions', 'sus2 chord voicing',
  'lydian chord color', 'diminished passing chords',
  'tritone substitution feel', 'modal chord progression',
  'pentatonic melody over jazz chords',
];

// テクスチャー（同一セッション内で被りを避ける）
// LoFi/Jazz Soulの質感。ミュージシャン名は含めない。
const TEXTURES = [
  'vinyl crackle', 'warm tape saturation', 'dusty sample texture',
  'analog tape hiss', 'soft room ambience', 'mellow background haze',
  'lo-fi cassette warmth', 'subtle field recording texture', 'gentle vinyl noise',
];

// メロディ楽器（同一セッション内で被りを避ける）
const MELODY_INSTRUMENTS = [
  'rhodes piano', 'electric piano', 'muted trumpet', 'warm saxophone',
  'vibraphone', 'nylon string guitar', 'mellow flute', 'upright bass lead',
  'soft synth pad', 'jazzy electric guitar',
];

// ムード / Soulful Jazz表現（master 第2章の言葉での代替表現）
const MOODS = [
  'introspective mood', 'melancholic chord progressions', 'warm jazzy atmosphere',
  'laid-back timing', 'nostalgic late-night calm', 'dusty jazz sensibility',
];
const SOULFUL_EXPRESSIONS = [
  'soulful jazz samples', 'loose swing feel', 'off-grid rhythm feel',
  'soul sample texture', 'raw soulful warmth', 'soul jazz warmth',
];

// 禁止: ミュージシャン名（検証用ブラックリスト）
const FORBIDDEN_NAMES = [
  'nujabes', 'j dilla', 'jdilla', 'dilla', 'madlib', 'pete rock',
  'dj premier', 'kenny dorham', 'miles davis', 'john coltrane', 'flying lotus',
];

// ---- helpers ----

/** 連番3桁ゼロ埋め */
function pad3(n) {
  return String(n).padStart(3, '0');
}

/** ベースファイル名（拡張子・A/Bなし）: KU-Z3-011_114bpm */
function baseName(zone, seq, bpm) {
  return `KU-Z${zone}-${pad3(seq)}_${bpm}bpm`;
}

/** 最終ファイル名: KU-Z3-011_114bpm-A.mp3 */
function trackFileName(zone, seq, bpm, take) {
  return `${baseName(zone, seq, bpm)}-${take}.mp3`;
}

/** プロンプト文字列がルールを満たすか検証。違反理由の配列を返す（空=OK） */
function validatePrompt(prompt, bpm) {
  const p = prompt.toLowerCase();
  const errors = [];
  for (const tok of REQUIRED_TOKENS) {
    if (!p.includes(tok)) errors.push(`missing required token: "${tok}"`);
  }
  if (!new RegExp(`\\b${bpm}\\s*bpm\\b`).test(p)) {
    errors.push(`missing BPM number "${bpm}bpm"`);
  }
  for (const name of FORBIDDEN_NAMES) {
    if (p.includes(name)) errors.push(`forbidden musician name: "${name}"`);
  }
  return errors;
}

module.exports = {
  REQUIRED_TOKENS, ZONES, DRUM_PATTERNS, CHORD_COLORS, TEXTURES,
  MELODY_INSTRUMENTS, MOODS, SOULFUL_EXPRESSIONS, FORBIDDEN_NAMES,
  pad3, baseName, trackFileName, validatePrompt,
};
