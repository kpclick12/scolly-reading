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

// Två kursplaner: svenska och svenska som andraspråk. Nationella provet är
// gemensamt — det är därför gapet går att mäta rent. Sva-elevernas
// SVENSK-läsning ligger lägre i snitt (förståelsetrådarna — ordförråd,
// bakgrundskunskap — är tunnare på svenska), modellerat som ett skift i den
// latenta förmågan. Skiftet är kalibrerat så att gruppandelarna dekomponerar
// totalerna: ~9–10 % F på läsdelen i svenska mot ~35–40 % i sva.
const SVA_ANDEL = 0.14;
const SVA_SKIFT = 1.05;

const students = Array.from({ length: N }, () => {
  const sva = rand() < SVA_ANDEL;
  const theta3 = randn() - (sva ? SVA_SKIFT : 0); // "läsförmåga på svenska" i åk 3
  // Matteus-effekt (Stanovich 1986 — termen kommer från läsforskningen):
  // gapet växer — den som ligger lågt driver nedåt.
  const theta6 = 1.18 * theta3 + 0.55 * randn();
  const theta9 = 1.18 * theta6 + 0.55 * randn();
  return { sva, theta3, theta6, theta9 };
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
// Enbart läsförståelsedelprovet i åk 3 (kohortkurvans jämförbara mått): 11,8 %.
assignByQuantile(
  students,
  (s) => s.theta3 + 0.5 * randn(),
  [0.118],
  "ak3las",
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

// Provbetyg × ämnesbetyg-matrisen (andel av gruppens elever per cell).
// Alla resultatvyer finns i tre varianter: båda kursplanerna, svenska, sva —
// väljbara i sidans kursplan-knappar. "alla" är alltid den viktade helheten.
const matrisFor = (grupp) => {
  const ut = [];
  for (const p of BETYG) {
    for (const a of BETYG) {
      ut.push({
        provbetyg: p,
        amnesbetyg: a,
        andel: pct((grupp.filter((s) => s.np9 === p && s.amne9 === a).length / grupp.length) * 100),
      });
    }
  }
  return ut;
};
const npFHojda = share(students.filter((s) => s.np9 === "F"), (s) => s.amne9 !== "F");

// F i åk 9 efter betyg i åk 6 — "få tar sig tillbaka"
const fEfterAk6 = BETYG.map((b) => {
  const grupp = students.filter((s) => s.amne6 === b);
  return { betygAk6: b, andelFAk9: grupp.length ? share(grupp, (s) => s.amne9 === "F") : 0, antal: grupp.length };
});

// -------------------------------------------- två kursplaner, ett gap ----
const svGrupp = students.filter((s) => !s.sva);
const svaGrupp = students.filter((s) => s.sva);
const perKursplan = (pred) => ({
  sv: share(svGrupp, pred),
  sva: share(svaGrupp, pred),
});

const kursplaner = {
  antal: { sv: svGrupp.length, sva: svaGrupp.length },
  andelSva: pct((svaGrupp.length / N) * 100),
  np9F: perKursplan((s) => s.np9 === "F"),
  amne9F: perKursplan((s) => s.amne9 === "F"),
  antalF: {
    sv: svGrupp.filter((s) => s.amne9 === "F").length,
    sva: svaGrupp.filter((s) => s.amne9 === "F").length,
  },
  // Kohortens villkorade utfall inom respektive kursplan — mönstret
  // "missade trean → F i nian" ska hålla i BÅDA grupperna.
  villkorat: {
    sv: {
      fAndelUnder: share(svGrupp.filter((s) => s.ak3 === "under"), (s) => s.amne9 === "F"),
      fAndelNadde: share(svGrupp.filter((s) => s.ak3 === "nadde"), (s) => s.amne9 === "F"),
      antalUnder: svGrupp.filter((s) => s.ak3 === "under").length,
      antalNadde: svGrupp.filter((s) => s.ak3 === "nadde").length,
      ak9Under: fordelning(svGrupp.filter((s) => s.ak3 === "under"), "amne9"),
      ak9Nadde: fordelning(svGrupp.filter((s) => s.ak3 === "nadde"), "amne9"),
    },
    sva: {
      fAndelUnder: share(svaGrupp.filter((s) => s.ak3 === "under"), (s) => s.amne9 === "F"),
      fAndelNadde: share(svaGrupp.filter((s) => s.ak3 === "nadde"), (s) => s.amne9 === "F"),
      antalUnder: svaGrupp.filter((s) => s.ak3 === "under").length,
      antalNadde: svaGrupp.filter((s) => s.ak3 === "nadde").length,
      ak9Under: fordelning(svaGrupp.filter((s) => s.ak3 === "under"), "amne9"),
      ak9Nadde: fordelning(svaGrupp.filter((s) => s.ak3 === "nadde"), "amne9"),
    },
  },
  // "Efter sexan är det brant uppför" — inom respektive kursplan (F och E i åk 6).
  fEfterAk6: ["F", "E"].map((b) => ({
    betygAk6: b,
    sv: share(svGrupp.filter((s) => s.amne6 === b), (s) => s.amne9 === "F"),
    sva: share(svaGrupp.filter((s) => s.amne6 === b), (s) => s.amne9 === "F"),
  })),
  // Behörighetsbilden (dotwaffle) per kursplan — absoluta elever.
  behorighet: Object.fromEntries(
    [["alla", students], ["sv", svGrupp], ["sva", svaGrupp]].map(([k, g]) => {
      const medF = g.filter((s) => s.amne9 === "F").length;
      const endast = g.filter((s) => s.amne9 === "F" && s.endastSvenska).length;
      const annat = g.filter((s) => s.obehorigAnnat).length;
      return [k, { obehoriga: medF + annat, medF, endast }];
    })
  ),
};

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

// Jämförbart mått i alla tre kontrollstationer: läsförståelsedelprovet.
// (Villkorandet nedan använder det bredare "missade minst ett läsdelprov".)
const checkpointsFor = (grupp) => [
  { label: "Åk 3", ar: 2019, matt: "NP: under kravnivån, läsförståelse", andel: share(grupp, (s) => s.ak3las === "under") },
  { label: "Åk 6", ar: 2022, matt: "NP läsförståelse: provbetyg F", andel: share(grupp, (s) => s.np6 === "F") },
  { label: "Åk 9", ar: 2025, matt: "NP läsförståelse: provbetyg F", andel: share(grupp, (s) => s.np9 === "F") },
];

const kohort = {
  beskrivning: "Årskullen som gick ut åk 9 våren 2025",
  checkpoints: {
    alla: checkpointsFor(students),
    sv: checkpointsFor(svGrupp),
    sva: checkpointsFor(svaGrupp),
  },
  villkorade: {
    underAk3: { grupp: "Missade läsdelprov på NP i åk 3", antal: under3.length, ak9: fordelning(under3, "amne9") },
    naddeAk3: { grupp: "Klarade läsdelproven i åk 3", antal: nadde3.length, ak9: fordelning(nadde3, "amne9") },
    fAndelUnder: share(under3, (s) => s.amne9 === "F"),
    fAndelNadde: share(nadde3, (s) => s.amne9 === "F"),
  },
  fEfterAk6,
};

// F-trend åk 9, 2015–2025. NP ställdes in 2020 och 2021 (pandemin).
// Genereras per kursplan; "alla" är den viktade helheten, så att de tre
// vyerna i kursplan-knapparna alltid är inbördes konsistenta.
const trendFor = (amneStart, amneEnd, npStart, npEnd, wobbleAmp) => {
  const ut = [];
  for (let ar = 2015; ar <= 2025; ar++) {
    const t = (ar - 2015) / 10;
    const wobble = () => (rand() - 0.5) * wobbleAmp;
    const amne = ar === 2025 ? amneEnd : pct(amneStart + (amneEnd - amneStart) * t ** 1.35 + wobble());
    const np = ar === 2020 || ar === 2021 ? null : ar === 2025 ? npEnd : pct(npStart + (npEnd - npStart) * t ** 1.2 + wobble());
    ut.push({ ar, amnesbetygF: amne, provbetygF: np });
  }
  return ut;
};
const svShare = svGrupp.length / N;
const trendSv = trendFor(2.6, kursplaner.amne9F.sv, 7.6, kursplaner.np9F.sv, 0.3);
const trendSva = trendFor(11.5, kursplaner.amne9F.sva, 25.5, kursplaner.np9F.sva, 0.9);
const fTrend = {
  sv: trendSv,
  sva: trendSva,
  alla: trendSv.map((d, i) => ({
    ar: d.ar,
    amnesbetygF: pct(svShare * d.amnesbetygF + (1 - svShare) * trendSva[i].amnesbetygF),
    provbetygF:
      d.provbetygF == null
        ? null
        : pct(svShare * d.provbetygF + (1 - svShare) * trendSva[i].provbetygF),
  })),
};

// Tidiga signaler. Handsatta nivåer per kursplan; "alla" viktas ihop
// (sva-andelen antas vara ~14 % även i de yngre årskullarna).
const SVA_UNG = 0.14;
const vikta = (sv, sva) => pct((1 - SVA_UNG) * sv + SVA_UNG * sva);

// Skolverkets obligatoriska bedömningsstöd i läs- och skrivutveckling,
// hösten åk 1 (tre höstar).
const bedomningsstodSv = [
  { termin: "HT 2023", lagre: 11.2, mellan: 25.7, hogre: 63.1 },
  { termin: "HT 2024", lagre: 12.4, mellan: 26.0, hogre: 61.6 },
  { termin: "HT 2025", lagre: 13.5, mellan: 26.4, hogre: 60.1 },
];
const bedomningsstodSva = [
  { termin: "HT 2023", lagre: 23.5, mellan: 30.0, hogre: 46.5 },
  { termin: "HT 2024", lagre: 25.5, mellan: 30.3, hogre: 44.2 },
  { termin: "HT 2025", lagre: 27.3, mellan: 31.4, hogre: 41.3 },
];
const bedomningsstod = {
  sv: bedomningsstodSv,
  sva: bedomningsstodSva,
  alla: bedomningsstodSv.map((d, i) => ({
    termin: d.termin,
    lagre: vikta(d.lagre, bedomningsstodSva[i].lagre),
    mellan: vikta(d.mellan, bedomningsstodSva[i].mellan),
    hogre: vikta(d.hogre, bedomningsstodSva[i].hogre),
  })),
};

// NP svenska åk 3 vt 2025 — läsdelproven B–E, andel som EJ nådde kravnivån.
const npAk3DelprovSv = [
  { delprov: "Läsa sakprosa (C)", andel: 11.0 },
  { delprov: "Läsa berättande text (B)", andel: 9.6 },
  { delprov: "Enskild högläsning (D)", andel: 8.0 },
  { delprov: "Textsamtal (E)", andel: 6.2 },
];
const npAk3DelprovSva = [
  { delprov: "Läsa sakprosa (C)", andel: 29.5 },
  { delprov: "Läsa berättande text (B)", andel: 25.3 },
  { delprov: "Enskild högläsning (D)", andel: 16.5 },
  { delprov: "Textsamtal (E)", andel: 14.8 },
];
const npAk3Delprov = {
  sv: npAk3DelprovSv,
  sva: npAk3DelprovSva,
  alla: npAk3DelprovSv.map((d, i) => ({
    delprov: d.delprov,
    andel: vikta(d.andel, npAk3DelprovSva[i].andel),
  })),
};

const tidigaSignaler = {
  bedomningsstod,
  npAk3Delprov,
  npAk3MinstEtt: pct(UNDER_AK3 * 100),
  npAk3Ar: 2025,
};

const npFordelning = {
  alla: { prov: fordelning(students, "np9"), amne: fordelning(students, "amne9") },
  sv: { prov: fordelning(svGrupp, "np9"), amne: fordelning(svGrupp, "amne9") },
  sva: { prov: fordelning(svaGrupp, "np9"), amne: fordelning(svaGrupp, "amne9") },
};

const betygMatris = {
  alla: matrisFor(students),
  sv: matrisFor(svGrupp),
  sva: matrisFor(svaGrupp),
};

// ----------------------------------------------------------------- skriv ----
const files = {
  "overview.json": overview,
  "fTrend.json": fTrend,
  "npFordelning.json": npFordelning,
  "betygMatris.json": betygMatris,
  "kohort.json": kohort,
  "tidigaSignaler.json": tidigaSignaler,
  "kursplaner.json": kursplaner,
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
console.log("--- två kursplaner ---");
console.log("Sva-andel:", kursplaner.andelSva + "%", `(${kursplaner.antal.sva} elever)`);
console.log("NP-läsdelen F — sv:", kursplaner.np9F.sv + "%", "| sva:", kursplaner.np9F.sva + "%");
console.log("Ämnesbetyg F — sv:", kursplaner.amne9F.sv + "%", "| sva:", kursplaner.amne9F.sva + "%");
console.log("Missade trean → F i nian — sv:", kursplaner.villkorat.sv.fAndelUnder + "%",
  "(klarade:", kursplaner.villkorat.sv.fAndelNadde + "%) | sva:", kursplaner.villkorat.sva.fAndelUnder + "%",
  "(klarade:", kursplaner.villkorat.sva.fAndelNadde + "%)");
console.log("F/E i sexan → F i nian:", kursplaner.fEfterAk6.map((d) => `${d.betygAk6}: sv ${d.sv}% sva ${d.sva}%`).join(" | "));
