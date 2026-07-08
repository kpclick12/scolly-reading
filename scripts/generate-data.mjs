// Genererar syntetisk testdata för "Tappad tråd".
// Kör:  node scripts/generate-data.mjs
//
// Allt är påhittat men kalibrerat mot nationella storleksordningar för
// LÄSNING/SVENSKA (som ligger lägre än matematikens F-nivåer):
//   · ~86,5 % klarade läsförståelsedelprovet (delprov B) på NP svenska åk 9
//   · ~5,6 % F i ämnesbetyg svenska åk 9 (~325 elever)
//   · ~1 004 elever utan behörighet till yrkesprogram (samma årskull som
//     systersajten "Hål i grunden") — varav ~118 föll på svenskan ensam
// Kohorten simuleras på elevnivå (latent förmåga med Matteus-drift) så att
// villkorade utfall — "av de som missade läsdelproven i trean fick X % F i
// nian" — är internt konsistenta, inte handsatta var för sig.

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- slump ----
let seed = 20250708;
function rand() {
  // mulberry32 — deterministiskt, gott nog för testdata
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function randn() {
  // Box–Muller
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}
const pct = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;

// ------------------------------------------------------------- kohorten ----
// Årskullen som gick ut nian våren 2025: NP åk 3 vt 2019 → NP/betyg åk 6
// vt 2022 → NP + slutbetyg åk 9 vt 2025.
const N = 5804;

const students = Array.from({ length: N }, () => {
  const theta3 = randn(); // "läsförmåga" i åk 3
  // Matteus-effekt (Stanovich 1986 — termen kommer från läsforskningen):
  // gapet växer — den som ligger lågt driver nedåt.
  const theta6 = 1.18 * theta3 + 0.55 * randn();
  const theta9 = 1.18 * theta6 + 0.55 * randn();
  return { theta3, theta6, theta9 };
});

// Rangbaserade trösklar ger exakta marginaler (andelar) med bibehållen
// korrelation från den latenta kedjan.
function assignByQuantile(arr, keyScore, cuts, keyOut, labels) {
  const order = arr.map((s, i) => [keyScore(s), i]).sort((a, b) => a[0] - b[0]);
  order.forEach(([, idx], rank) => {
    const q = (rank + 0.5) / arr.length;
    let k = 0;
    while (k < cuts.length && q > cuts[k]) k++;
    arr[idx][keyOut] = labels[k];
  });
}

const BETYG = ["F", "E", "D", "C", "B", "A"];

// Åk 3, NP svenska vt 2019: 18,3 % missade minst ett av läsdelproven B–E.
const UNDER_AK3 = 0.183;
assignByQuantile(
  students,
  (s) => s.theta3 + 0.45 * randn(),
  [UNDER_AK3],
  "ak3",
  ["under", "nadde"]
);

// Åk 6 vt 2022 — läsförståelsedelprovet (NP delprov B) och ämnesbetyg svenska.
// NP är hårdare; ämnesbetyget lyfter elever nära gränsen ("snällbetyg").
const NP6_F = 0.092;
const AMNE6 = { F: 0.039, E: 0.214, D: 0.248, C: 0.262, B: 0.154, A: 0.083 };
assignByQuantile(students, (s) => s.theta6 + 0.5 * randn(), [NP6_F], "np6", ["F", "EA"]);
{
  const cuts = [];
  let acc = 0;
  for (const b of BETYG.slice(0, -1)) { acc += AMNE6[b]; cuts.push(acc); }
  assignByQuantile(students, (s) => s.theta6 + 0.32 * randn() + (s.np6 === "F" ? 0.18 : 0), cuts, "amne6", BETYG);
}

// Åk 9 vt 2025.
// NP delprov B (läsförståelse): 13,5 % F (=> 86,5 % A–E).
// Ämnesbetyg svenska: 5,6 % F (~325 elever).
const NP9 = { F: 0.135, E: 0.238, D: 0.246, C: 0.212, B: 0.114, A: 0.055 };
const AMNE9 = { F: 0.056, E: 0.224, D: 0.259, C: 0.25, B: 0.142, A: 0.069 };
{
  const cuts = [];
  let acc = 0;
  for (const b of BETYG.slice(0, -1)) { acc += NP9[b]; cuts.push(acc); }
  assignByQuantile(students, (s) => s.theta9 + 0.42 * randn(), cuts, "np9", BETYG);
}
{
  const cuts = [];
  let acc = 0;
  for (const b of BETYG.slice(0, -1)) { acc += AMNE9[b]; cuts.push(acc); }
  // Ämnesbetyget följer förmågan men läraren väger in mer än ett provtillfälle
  // — och lyfter hellre än fäller nära gränsen.
  assignByQuantile(students, (s) => s.theta9 + 0.26 * randn() + 0.12, cuts, "amne9", BETYG);
}

// Behörighet till yrkesprogram: godkänt i sv/en/ma + 5 ämnen till.
// F i svenska ⇒ obehörig. Därutöver är en större grupp obehörig av andra
// skäl (oftast matematiken) — svag läsning är korrelerad med svaga resultat
// även i andra ämnen (lästal, texttunga prov).
const fSvenska = students.filter((s) => s.amne9 === "F");
const ejFSvenska = students.filter((s) => s.amne9 !== "F");
const OBEHORIGA_MAL = 1004;
const ovrigaObehoriga = OBEHORIGA_MAL - fSvenska.length;
ejFSvenska
  .map((s) => [s.theta9 + 0.8 * randn(), s])
  .sort((a, b) => a[0] - b[0])
  .forEach(([, s], i) => (s.obehorigAnnat = i < ovrigaObehoriga));
// Av dem med F i svenska: har de även F i annat behörighetsämne?
const ENDAST_SVENSKA_MAL = 118;
fSvenska
  .map((s) => [s.theta9 + 0.8 * randn(), s])
  .sort((a, b) => b[0] - a[0])
  .forEach(([, s], i) => (s.endastSvenska = i < ENDAST_SVENSKA_MAL));

// ------------------------------------------------------------ aggregat ----
const antalF = fSvenska.length;
const obehoriga = antalF + ovrigaObehoriga;
const endastSvenska = fSvenska.filter((s) => s.endastSvenska).length;

const share = (grupp, pred) => pct((grupp.filter(pred).length / grupp.length) * 100);

const under3 = students.filter((s) => s.ak3 === "under");
const nadde3 = students.filter((s) => s.ak3 === "nadde");

const fordelning = (grupp, key) =>
  BETYG.map((b) => ({ betyg: b, andel: share(grupp, (s) => s[key] === b) }));

// Provbetyg × ämnesbetyg-matrisen (andel av alla elever per cell)
const matris = [];
for (const p of BETYG) {
  for (const a of BETYG) {
    matris.push({
      provbetyg: p,
      amnesbetyg: a,
      andel: pct((students.filter((s) => s.np9 === p && s.amne9 === a).length / N) * 100),
    });
  }
}
const npFHojda = share(students.filter((s) => s.np9 === "F"), (s) => s.amne9 !== "F");

// F i åk 9 efter betyg i åk 6 — "få tar sig tillbaka"
const fEfterAk6 = BETYG.map((b) => {
  const grupp = students.filter((s) => s.amne6 === b);
  return { betygAk6: b, andelFAk9: grupp.length ? share(grupp, (s) => s.amne9 === "F") : 0, antal: grupp.length };
});

const overview = {
  lasar: "2024/25",
  arskull: N,
  npAndelAE: pct(100 - NP9.F * 100),
  npAndelF: pct(NP9.F * 100),
  amnesbetygFProcent: share(students, (s) => s.amne9 === "F"),
  antalF,
  obehoriga,
  obehorigaMedFSvenska: antalF,
  obehorigaEndastSvenska: endastSvenska,
  npFHojdaTillE: npFHojda,
};

const kohort = {
  beskrivning: "Årskullen som gick ut åk 9 våren 2025",
  checkpoints: [
    { label: "Åk 3", ar: 2019, matt: "NP: missade minst ett läsdelprov", andel: pct(UNDER_AK3 * 100) },
    { label: "Åk 6", ar: 2022, matt: "NP läsförståelse: provbetyg F", andel: pct(NP6_F * 100) },
    { label: "Åk 9", ar: 2025, matt: "NP läsförståelse: provbetyg F", andel: pct(NP9.F * 100) },
  ],
  villkorade: {
    underAk3: { grupp: "Missade läsdelprov på NP i åk 3", antal: under3.length, ak9: fordelning(under3, "amne9") },
    naddeAk3: { grupp: "Klarade läsdelproven i åk 3", antal: nadde3.length, ak9: fordelning(nadde3, "amne9") },
    fAndelUnder: share(under3, (s) => s.amne9 === "F"),
    fAndelNadde: share(nadde3, (s) => s.amne9 === "F"),
  },
  fEfterAk6,
};

// F-trend åk 9, 2015–2025. NP ställdes in 2020 och 2021 (pandemin).
const fTrend = [];
const amneStart = 3.4, amneEnd = overview.amnesbetygFProcent;
const npStart = 9.8, npEnd = overview.npAndelF;
for (let ar = 2015; ar <= 2025; ar++) {
  const t = (ar - 2015) / 10;
  const wobble = () => (rand() - 0.5) * 0.4;
  const amne = ar === 2025 ? amneEnd : pct(amneStart + (amneEnd - amneStart) * t ** 1.35 + wobble());
  const np = ar === 2020 || ar === 2021 ? null : ar === 2025 ? npEnd : pct(npStart + (npEnd - npStart) * t ** 1.2 + wobble());
  fTrend.push({ ar, amnesbetygF: amne, provbetygF: np });
}

// Tidiga signaler.
// Skolverkets obligatoriska bedömningsstöd i läs- och skrivutveckling,
// hösten åk 1 (tre höstar).
const bedomningsstod = [
  { termin: "HT 2023", lagre: 12.9, mellan: 26.3, hogre: 60.8 },
  { termin: "HT 2024", lagre: 14.2, mellan: 26.6, hogre: 59.2 },
  { termin: "HT 2025", lagre: 15.4, mellan: 27.1, hogre: 57.5 },
];
// NP svenska åk 3 vt 2025 — läsdelproven B–E, andel som EJ nådde kravnivån.
const npAk3Delprov = [
  { delprov: "Läsa sakprosa (C)", andel: 13.6 },
  { delprov: "Läsa berättande text (B)", andel: 11.8 },
  { delprov: "Enskild högläsning (D)", andel: 9.2 },
  { delprov: "Textsamtal (E)", andel: 7.4 },
];
const tidigaSignaler = {
  bedomningsstod,
  npAk3Delprov,
  npAk3MinstEtt: pct(UNDER_AK3 * 100),
  npAk3Ar: 2025,
};

const npFordelning = {
  prov: fordelning(students, "np9"),
  amne: fordelning(students, "amne9"),
};

// ----------------------------------------------------------------- skriv ----
const files = {
  "overview.json": overview,
  "fTrend.json": fTrend,
  "npFordelning.json": npFordelning,
  "betygMatris.json": matris,
  "kohort.json": kohort,
  "tidigaSignaler.json": tidigaSignaler,
};
for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(OUT, name), JSON.stringify(data, null, 2) + "\n");
}

// ------------------------------------------------------------- kontroll ----
console.log("Elever i årskullen:", N);
console.log("NP läsförståelse åk 9 A–E:", overview.npAndelAE + "%", "| F:", overview.npAndelF + "%");
console.log("Ämnesbetyg svenska F:", overview.amnesbetygFProcent + "%", `(${antalF} elever)`);
console.log("Obehöriga:", obehoriga, "| varav F i svenska:", antalF, "| endast svenska:", endastSvenska);
console.log("F i åk 9 om missade läsdelprov åk 3:", kohort.villkorade.fAndelUnder + "%",
  "| om klarade:", kohort.villkorade.fAndelNadde + "%");
console.log("F åk 9 efter betyg åk 6:", fEfterAk6.map((d) => `${d.betygAk6}:${d.andelFAk9}%`).join(" "));
console.log("Andel av NP-F som fick E+ i ämnesbetyg:", npFHojda + "%");
