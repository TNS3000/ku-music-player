// Suno prompt generator for KU zone music

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const maybe = (arr, prob = 0.5) => Math.random() < prob ? pick(arr) : null;

// --- Shared lists ---

const SOULFUL_JAZZ = [
  "soulful jazz samples",
  "melancholic chord progressions",
  "warm jazzy atmosphere",
  "introspective mood",
  "dusty jazz sensibility",
  "loose swing feel",
  "laid-back timing",
  "off-grid rhythm feel",
  "soul sample texture",
  "raw soulful warmth",
];

const CHORD_COLORS = [
  "minor 7th chords",
  "jazz chord extensions",
  "sus2 chord voicing",
  "lydian chord color",
  "diminished passing chords",
  "tritone substitution feel",
  "modal chord progression",
  "pentatonic melody over jazz chords",
];

// --- Zone configs ---

const ZONES = {
  1: {
    label: "Zone 1 (08:00-13:00)",
    bpmRange: "70-90bpm",
    coreStyles: [
      "ambient lofi",
      "lo-fi beats",
      "organic lofi",
      "chill hop",
      "jazz fusion lofi",
      "bossa nova lofi",
      "modal jazz lofi",
      "ambient jazz instrumental",
      "soul jazz lofi",
      "downtempo soul",
    ],
    drums: [
      "soft brush drums",
      "gentle hip hop beat",
      "loose swing drums",
      "drunk drum feel",
      "off-beat pocket groove",
      "jazzy rim shot pattern",
      "raw boom bap feel",
      "soul shuffle beat",
      "syncopated jazz groove",
      "lazy hip hop drums",
    ],
    textures: [
      "vinyl crackle",
      "warm tape hiss",
      "soft room ambience",
      "gentle reverb",
      "dusty sample feel",
    ],
    instruments: [
      "mellow piano",
      "nylon string guitar",
      "upright bass",
      "vibraphone",
      "soft Rhodes",
      "flute melody",
      "muted trumpet",
    ],
  },
  2: {
    label: "Zone 2 (13:00-19:00)",
    bpmRange: "100-112bpm",
    coreStyles: [
      "lofi hip hop",
      "chill hop",
      "lo-fi beats",
      "jazz hop",
      "neo soul instrumental",
      "afrobeat lofi",
      "latin jazz lofi",
      "soul jazz fusion",
      "downtempo groove",
      "organic hip hop",
    ],
    drums: [
      "mid-tempo hip hop beat",
      "punchy lo-fi drums",
      "loose swing drums",
      "drunk drum feel",
      "off-beat pocket groove",
      "jazzy rim shot pattern",
      "raw boom bap feel",
      "soul shuffle beat",
      "syncopated jazz groove",
      "lazy hip hop drums",
    ],
    textures: [
      "vinyl crackle",
      "warm analog warmth",
      "tape saturation",
      "lo-fi compression",
      "room ambience",
    ],
    instruments: [
      "electric piano",
      "clean guitar chords",
      "slap bass",
      "brass stabs",
      "Rhodes melody",
      "clavinet",
      "organ fills",
    ],
  },
  3: {
    label: "Zone 3 (19:00-01:00)",
    bpmRange: "112-118bpm",
    coreStyles: [
      "lofi hip hop",
      "chill hop",
      "lofi electronic fusion",
      "neo soul lofi",
      "afro lofi",
      "jazz funk lofi",
      "broken beat soul",
      "latin lofi",
      "soul groove instrumental",
    ],
    drums: [
      "driving lo-fi groove",
      "broken beat pattern",
      "loose swing drums",
      "drunk drum feel",
      "off-beat pocket groove",
      "jazzy rim shot pattern",
      "raw boom bap feel",
      "soul shuffle beat",
      "syncopated jazz groove",
      "lazy hip hop drums",
    ],
    textures: [
      "vinyl crackle",
      "urban night ambience",
      "analog warmth",
      "lo-fi saturation",
      "cassette tape texture",
    ],
    instruments: [
      "funky Rhodes",
      "wah guitar",
      "walking bass",
      "horns",
      "synth pad",
      "marimba",
      "percussive piano",
    ],
  },
  4: {
    label: "Zone 4 (01:00-08:00)",
    bpmRange: "90-100bpm",
    coreStyles: [
      "lofi hip hop",
      "ambient lofi",
      "chill hop",
      "midnight jazz lofi",
      "soul jazz instrumental",
      "bossa nova lofi",
      "modal jazz lofi",
      "downtempo soul",
      "organic jazz lofi",
      "late night soul instrumental",
    ],
    drums: [
      "sparse late-night beat",
      "soft shuffling drums",
      "loose swing drums",
      "drunk drum feel",
      "off-beat pocket groove",
      "jazzy rim shot pattern",
      "raw boom bap feel",
      "soul shuffle beat",
      "syncopated jazz groove",
      "lazy hip hop drums",
    ],
    textures: [
      "vinyl crackle",
      "late night silence",
      "deep reverb space",
      "nocturnal ambience",
      "warm tape hiss",
    ],
    instruments: [
      "late night piano",
      "muted bass",
      "soft guitar harmonics",
      "ambient synth",
      "bowed vibraphone",
      "sparse Rhodes",
      "breathy flute",
    ],
  },
};

// --- Generator ---

function generatePrompt(zoneNum, bpm) {
  const zone = ZONES[zoneNum];
  const parts = [];

  parts.push(pick(zone.coreStyles));
  parts.push(pick(SOULFUL_JAZZ));
  parts.push(`${bpm || zone.bpmRange}`);
  parts.push(pick(zone.drums));
  parts.push(pick(zone.instruments));
  parts.push(pick(zone.textures));

  const chord = maybe(CHORD_COLORS);
  if (chord) parts.push(chord);

  return parts.join(", ");
}

// --- CLI output ---

const bpmSamples = { 1: [75, 82, 88], 2: [104, 108, 112], 3: [114, 116, 118], 4: [92, 96, 99] };

for (const [zoneNum, zone] of Object.entries(ZONES)) {
  console.log(`\n=== ${zone.label} ===`);
  const bpms = bpmSamples[zoneNum];
  for (let i = 0; i < 3; i++) {
    const prompt = generatePrompt(Number(zoneNum), `${bpms[i]}bpm`);
    console.log(`[${i + 1}] ${prompt}`);
  }
}
