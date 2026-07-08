<script>
  import { fade } from "svelte/transition";
  import Scrolly from "../components/Scrolly.svelte";
  import BarChart from "../components/BarChart.svelte";
  import LineChart from "../components/LineChart.svelte";
  import Heatmap from "../components/Heatmap.svelte";
  import DotWaffle from "../components/DotWaffle.svelte";
  import StackedBars from "../components/StackedBars.svelte";
  import ReadingRope from "../components/ReadingRope.svelte";
  import ResearchCards from "../components/ResearchCards.svelte";
  import SimpleView from "../components/SimpleView.svelte";
  import LasValjare from "../components/LasValjare.svelte";
  import KursplanVal from "../components/KursplanVal.svelte";

  let { data } = $props();

  let currentStep = $state(0);

  // Kursplan-vyn för resultatdiagrammen: "alla" (viktad helhet, default så
  // att brödtextens totalsiffror stämmer med det som visas), "sv" eller
  // "sva". Valet följer med mellan stegen.
  let kursplanVy = $state("alla");
  const SPLIT_STEPS = new Set([0, 1, 3, 4, 13, 16, 17]);
  const vySuffix = $derived(
    kursplanVy === "sv"
      ? " · kursplan svenska"
      : kursplanVy === "sva"
        ? " · kursplan svenska som andraspråk"
        : ""
  );

  const ov = data.overview;

  // Betygsskalan: F = rött (status), E→A = en blå sekventiell ramp (magnitud).
  const BETYG_COLOR = {
    F: "#a7391d",
    E: "#bfd4e7",
    D: "#9cc0dd",
    C: "#649ecf",
    B: "#2d7fbe",
    A: "#0068b2",
  };
  const BETYG_LIGHT = new Set(["E", "D"]); // ljusa segment ⇒ mörk etikett

  const BETYG_ORDNING = ["A", "B", "C", "D", "E", "F"];

  // Steg 0 — läsförståelsedelprovet åk 9
  const npBars = $derived(
    BETYG_ORDNING.map((b) => ({
      label: b === "F" ? "F — inte godkänt" : b,
      value: data.npFordelning[kursplanVy].prov.find((d) => d.betyg === b).andel,
      color: b === "F" ? BETYG_COLOR.F : "var(--series-blue)",
    }))
  );

  // Steg 1 — F-trenden
  const trendSeries = $derived([
    {
      id: "prov",
      label: "F på läsdelen (NP)",
      color: "var(--series-red)",
      serie: data.fTrend[kursplanVy].map((d) => ({ x: d.ar, y: d.provbetygF })),
    },
    {
      id: "amne",
      // Vald kursplan står redan i titeln — bara helhetsvyn behöver förtydligas.
      label: kursplanVy === "alla" ? "F i ämnesbetyg, båda kursplanerna" : "F i ämnesbetyg",
      color: "var(--series-blue)",
      serie: data.fTrend[kursplanVy].map((d) => ({ x: d.ar, y: d.amnesbetygF })),
    },
  ]);

  // Steg 3 — de 1 004 utan behörighet (per vald kursplan-vy)
  const beh = $derived(data.kursplaner.behorighet[kursplanVy]);
  const waffleGroups = $derived([
    {
      count: beh.endast,
      color: "#a7391d",
      label: "saknar godkänt ENBART i svenskämnet",
    },
    {
      count: beh.medF - beh.endast,
      color: "#cc8370",
      label: "saknar svenskämnet + fler ämnen",
    },
    {
      count: beh.obehoriga - beh.medF,
      color: "#9aa7b4",
      label: "obehöriga av andra skäl (godkänt i svenskämnet)",
    },
  ]);

  // Steg 2 — två kursplaner, ett gap. Provet är gemensamt; kursplanen är
  // elevens identitet i diagrammen: blå = svenska, aqua = sva. Rött används
  // aldrig om GRUPPEN — bara om resultat.
  const KURSPLAN_COLOR = { sv: "var(--series-blue)", sva: "var(--series-aqua)" };
  const kp = $derived(data.kursplaner);
  const gapBars = $derived([
    { label: "Svenska — F på läsdelen (NP)", value: kp.np9F.sv, color: KURSPLAN_COLOR.sv },
    { label: "Sva — F på läsdelen (NP)", value: kp.np9F.sva, color: KURSPLAN_COLOR.sva },
    { label: "Svenska — F i ämnesbetyg", value: kp.amne9F.sv, color: KURSPLAN_COLOR.sv },
    { label: "Sva — F i ämnesbetyg", value: kp.amne9F.sva, color: KURSPLAN_COLOR.sva },
  ]);

  // Steg 4 — provbetyg × ämnesbetyg
  const matrisRows = BETYG_ORDNING;
  const matrisCols = ["F", "E", "D", "C", "B", "A"];
  const matrisCells = $derived(
    data.betygMatris[kursplanVy].map((d) => ({ row: d.provbetyg, col: d.amnesbetyg, value: d.andel }))
  );

  // Steg 11 — kohortens tre kontrollstationer
  const kohortSeries = $derived([
    {
      id: "kohort",
      label: "av årskullen",
      color: "var(--series-red)",
      serie: data.kohort.checkpoints[kursplanVy].map((c) => ({
        x: `${c.label} · ${c.ar}`,
        y: c.andel,
      })),
    },
  ]);

  // Steg 14 — åk 9-betyg villkorat på åk 3-resultat, inom respektive kursplan
  const villkorade = $derived(data.kohort.villkorade);
  const villkoradeRows = $derived(
    [
      { label: "Missade i trean · svenska", antal: kp.villkorat.sv.antalUnder, ak9: kp.villkorat.sv.ak9Under },
      { label: "Missade i trean · sva", antal: kp.villkorat.sva.antalUnder, ak9: kp.villkorat.sva.ak9Under },
      { label: "Klarade trean · svenska", antal: kp.villkorat.sv.antalNadde, ak9: kp.villkorat.sv.ak9Nadde },
      { label: "Klarade trean · sva", antal: kp.villkorat.sva.antalNadde, ak9: kp.villkorat.sva.ak9Nadde },
    ].map(({ label, antal, ak9 }) => ({
      label,
      sublabel: `${antal.toLocaleString("sv-SE")} elever`,
      parts: [...ak9]
        .sort((a, b) => BETYG_ORDNING.indexOf(b.betyg) - BETYG_ORDNING.indexOf(a.betyg))
        .map((p) => ({
          key: p.betyg,
          value: p.andel,
          color: BETYG_COLOR[p.betyg],
          light: BETYG_LIGHT.has(p.betyg),
        })),
    }))
  );
  const betygLegend = ["F", "E", "D", "C", "B", "A"].map((b) => ({
    key: b,
    color: BETYG_COLOR[b],
  }));

  // Steg 15 — F i nian efter betyget i sexan, inom respektive kursplan
  const fEfterAk6Bars = $derived(
    kp.fEfterAk6.flatMap((d) => [
      { label: `${d.betygAk6} i åk 6 — svenska`, value: d.sv, color: KURSPLAN_COLOR.sv },
      { label: `${d.betygAk6} i åk 6 — sva`, value: d.sva, color: KURSPLAN_COLOR.sva },
    ])
  );

  // Steg 16 — bedömningsstödet i åk 1
  const NIVA_COLOR = { lagre: "#a7391d", mellan: "#9cc0dd", hogre: "#0068b2" };
  const bedomningsRows = $derived(
    data.tidigaSignaler.bedomningsstod[kursplanVy].map((d) => ({
      label: d.termin,
      parts: [
        { key: "Lägre nivå — behöver stöd", value: d.lagre, color: NIVA_COLOR.lagre },
        { key: "Mellannivå", value: d.mellan, color: NIVA_COLOR.mellan, light: true },
        { key: "Högre nivå", value: d.hogre, color: NIVA_COLOR.hogre },
      ],
    }))
  );
  const bedomningsLegend = [
    { key: "Lägre nivå — behöver stöd", color: NIVA_COLOR.lagre },
    { key: "Mellannivå", color: NIVA_COLOR.mellan },
    { key: "Högre nivå", color: NIVA_COLOR.hogre },
  ];

  // Steg 15 — NP åk 3, läsdelproven B–E
  const delprovBars = $derived(
    data.tidigaSignaler.npAk3Delprov[kursplanVy].map((d, i) => ({
      label: d.delprov,
      value: d.andel,
      color: i < 2 ? "var(--series-red)" : "var(--series-blue)",
    }))
  );

  // Enda verkliga statistiken på sidan: Statens medieråds Ungar & medier,
  // andel 9–12-åringar som läser böcker en vanlig dag (avrundade värden).
  const bokSerie = [
    {
      id: "bok",
      label: "läser böcker en vanlig dag, 9–12 år",
      color: "var(--series-blue)",
      serie: [
        { x: 2012, y: 31 },
        { x: 2014, y: 27 },
        { x: 2016, y: 22 },
        { x: 2018, y: 17 },
        { x: 2020, y: 14 },
        { x: 2023, y: 11 },
      ],
    },
  ];

  const forskningskort = [
    {
      finding:
        "Läsning = avkodning × språkförståelse. En multiplikation, inte en summa: är endera faktorn noll blir produkten noll — och svaga läsare har alltid brister i minst en av dem.",
      source:
        "Gough & Tunmer (1986), \"Decoding, reading, and reading disability\", Remedial and Special Education — The Simple View of Reading.",
    },
    {
      finding:
        "Gapet växer av sig självt: den som läser lätt läser mer och drar ifrån, den som läser trögt undviker text och halkar efter. Själva begreppet Matteuseffekt kommer härifrån — läsforskningen.",
      source:
        "Stanovich (1986), \"Matthew effects in reading\", Reading Research Quarterly.",
    },
    {
      finding:
        "Sannolikheten att en svag läsare i årskurs 1 fortfarande läser svagt i årskurs 4: 88 procent. Utan riktad insats växer inte problemet bort — det växer fast.",
      source:
        "Juel (1988), \"Learning to read and write: A longitudinal study of 54 children\", Journal of Educational Psychology.",
    },
  ];

  // typ: "data" = våra resultat (röd markering + badge), annars bakgrund.
  const steps = [
    // ------------------------------------------------ Akt 1 · Läget ----
    { kicker: "Läget", headline: "Var sjunde tappar tråden redan i provet", typ: "data" },
    { kicker: "Trenden", headline: "Kurvorna pekar åt fel håll", typ: "data" },
    { kicker: "Två kursplaner", headline: "Samma prov — ett gap på tre gånger", typ: "data" },
    { kicker: "Vad det kostar", headline: "1 004 elever utan behörighet", typ: "data" },
    { kicker: "Prov mot betyg", headline: "Provet och betyget berättar olika saker", typ: "data" },
    // ------------------------------------------- Akt 2 · Vetenskapen ----
    { kicker: "Vetenskapen", headline: "Läsning är ett rep av trådar" },
    { kicker: "Multiplikationen", headline: "Två faktorer. Är en noll, är allt noll." },
    { kicker: "Experimentet", headline: "Tappa en enda tråd" },
    { kicker: "Två kursplaner", headline: "Samma rep — en annan bunt" },
    { kicker: "Forskningen", headline: "Beläggen är entydiga" },
    // ------------------------------- Akt 3 · Svårt — och nödvändigt ----
    { kicker: "Fjärde klass", headline: "Skiftet: från att lära sig läsa till att läsa för att lära" },
    { kicker: "Elevernas vardag", headline: "Vardagsträningen försvann till skärmen" },
    { kicker: "Elevernas fråga", headline: "”Varför ska jag kunna läsa — jag ska ju bli …?”" },
    // ---------------------------------------------- Akt 4 · Kohorten ----
    { kicker: "Kohorten 2019–2025", headline: "Vi följde en hel årskull", typ: "data" },
    { kicker: "Kohorten 2019–2025", headline: "Trådarna som tappades i trean blev betygen i nian", typ: "data" },
    { kicker: "Kohorten 2019–2025", headline: "Efter sexan är det brant uppför — i båda kursplanerna", typ: "data" },
    // ---------------------------------------- Akt 5 · Tidiga signaler ----
    { kicker: "Tidiga signaler", headline: "Signalen syns redan första hösten i ettan", typ: "data" },
    { kicker: "Tidiga signaler", headline: "Trean pekar ut vilken tråd som brister", typ: "data" },
    // ------------------------------------------------ Akt 6 · Slutet ----
    { kicker: "Vägen framåt", headline: "En tråd går att tvinna om" },
  ];

  const ropeMode = $derived(
    currentStep === 5
      ? "strands"
      : currentStep === 7
        ? "missing"
        : currentStep === 8
          ? "thin"
          : currentStep === 10
            ? "shift"
            : currentStep === 18
              ? "all"
              : null
  );

  const dec = (x) => String(x).replace(".", ",");
</script>

<Scrolly onStepChange={(i) => (currentStep = i)}>
  {#snippet visual()}
    <div class="visual-stack">
      {#if SPLIT_STEPS.has(currentStep)}
        <div class="kursplanval-wrap" transition:fade={{ duration: 200 }}>
          <KursplanVal value={kursplanVy} onChange={(v) => (kursplanVy = v)} />
        </div>
      {/if}
      <!-- Repet ligger kvar monterat över repstegen (utanför {#key}) så att
           lägena tweenas mjukt i stället för att ritas om. -->
      {#if ropeMode}
        <div class="rope-wrap" transition:fade={{ duration: 250 }}>
          <ReadingRope mode={ropeMode} />
        </div>
      {/if}
      {#key currentStep}
        <div class="visual-frame" in:fade={{ duration: 250 }}>
          {#if currentStep === 0}
            <BarChart
              data={npBars}
              title={"Provbetyg på läsförståelsedelen (delprov B), nationella provet åk 9, våren 2025" + vySuffix}
              maxValue={30}
            />
          {:else if currentStep === 1}
            <LineChart
              series={trendSeries}
              title={"Andel elever med F i läsning åk 9, 2015–2025" + vySuffix}
              note="Nationella proven ställdes in 2020–2021 (pandemin)."
            />
          {:else if currentStep === 2}
            <BarChart
              data={gapBars}
              title="Andel F på det gemensamma nationella provets läsdel respektive i ämnesbetyget, per kursplan, åk 9 våren 2025"
              maxValue={40}
            />
          {:else if currentStep === 3}
            <DotWaffle
              groups={waffleGroups}
              caption="Varje prick är en elev som våren 2025 lämnade åk 9 utan behörighet till gymnasiets yrkesprogram."
            />
          {:else if currentStep === 4}
            <Heatmap
              rows={matrisRows}
              cols={matrisCols}
              data={matrisCells}
              title={"Andel av eleverna per kombination av provbetyg (läsförståelse) och ämnesbetyg, åk 9 våren 2025" + vySuffix}
              rowTitle="Provbetyg (NP)"
              colTitle="Ämnesbetyg"
              lowLabel="Få elever"
              highLabel="Många"
              showValues={true}
              highlight={["F__E", "F__D"]}
            />
          {:else if currentStep === 6}
            <SimpleView />
          {:else if currentStep === 9}
            <ResearchCards cards={forskningskort} />
          {:else if currentStep === 11}
            <LineChart
              series={bokSerie}
              unit="%"
              labelAll={true}
              title="Andel 9–12-åringar som läser böcker en vanlig dag (Statens medieråd)"
              note="Verklig statistik: Ungar & medier 2012–2023, avrundade värden."
            />
          {:else if currentStep === 12}
            <LasValjare />
          {:else if currentStep === 13}
            <LineChart
              series={kohortSeries}
              unit="%"
              labelAll={true}
              title={"Samma årskull vid tre kontrollstationer: andel under kravnivån/med F på nationella provets läsdel" + vySuffix}
            />
          {:else if currentStep === 14}
            <StackedBars
              rows={villkoradeRows}
              legend={betygLegend}
              title="Ämnesbetyg åk 9 (våren 2025) efter resultat på nationella provets läsdelprov i åk 3 (2019), inom respektive kursplan"
            />
          {:else if currentStep === 15}
            <BarChart
              data={fEfterAk6Bars}
              title="Andel som fick F i åk 9, efter ämnesbetyg i åk 6 — samma årskull, per kursplan"
              maxValue={100}
            />
          {:else if currentStep === 16}
            <StackedBars
              rows={bedomningsRows}
              legend={bedomningsLegend}
              title={"Bedömningsstödet i läs- och skrivutveckling, hösten åk 1 — andel elever per nivå" + vySuffix}
            />
          {:else if currentStep === 17}
            <BarChart
              data={delprovBars}
              title={"Nationella provet åk 3 (våren 2025): andel som inte nådde kravnivån, per läsdelprov" + vySuffix}
              maxValue={20}
            />
          {/if}
        </div>
      {/key}
    </div>
  {/snippet}

  {#each steps as step, i}
    <section class="scrolly-step" class:is-data={step.typ === "data"} data-index={i}>
      <p class="kicker">
        {#if step.typ === "data"}<span class="typ-badge">Våra resultat</span>{/if}
        {step.kicker}
      </p>
      <h2>{step.headline}</h2>
      {#if i === 0}
        <p>
          I våras skrev {ov.arskull.toLocaleString("sv-SE")} niondeklassare
          det gemensamma nationella provet i svenska och svenska som
          andraspråk. På läsförståelsedelen fick
          <strong>{dec(ov.npAndelAE)}&nbsp;%</strong> godkänt. Resten —
          <strong>var sjunde elev</strong> — klarade inte att läsa och förstå
          de texter provet ställer mot dem, efter nio år i skolan.
        </p>
        <p>
          Matematiken brukar kallas grundskolans resultatkris. Men läsningen
          är krisens tysta tvilling: den syns mindre i debatten, och den bär
          alla andra ämnen på sina axlar.
        </p>
      {:else if i === 1}
        <p>
          Och det är inte ett enskilt dåligt år. Andelen som lämnar nian med
          <strong>F i ämnesbetyget i svenska</strong> har stigit i tio år, och
          andelen som fälls på <strong>nationella provets läsdel</strong>
          ligger hela tiden klart högre — gapet mellan kurvorna har dessutom
          växt.
        </p>
        <p>
          Håll kvar blicken på det gapet. Vi kommer tillbaka till det om ett
          ögonblick.
        </p>
      {:else if i === 2}
        <p>
          Innan vi går vidare måste bilden delas i två. Svenskämnet finns i
          <strong>två kursplaner</strong> — svenska och svenska som
          andraspråk — men <strong>nationella provet är gemensamt</strong>:
          samma texter, samma frågor, samma dag. Det gör gapet mätbart rent.
        </p>
        <p>
          På läsdelen fick <strong>{dec(kp.np9F.sv)}&nbsp;%</strong> av
          eleverna som läser svenska ett F — mot
          <strong>{dec(kp.np9F.sva)}&nbsp;%</strong> av dem som läser svenska
          som andraspråk. Var {kp.andelSva >= 12.5 ? "sjunde" : "åttonde"}
          elev i årskullen läser sva.
        </p>
        <div class="callout">
          <span class="callout-num">{dec(Math.round((kp.np9F.sva / kp.np9F.sv) * 10) / 10)}&nbsp;×</span>
          <span class="callout-label">högre andel F på samma prov. Håll kvar
            frågan <em>varför</em> — vetenskapsakten pekar ut exakt vilka
            trådar gapet sitter i, och varför de går att tvinna.</span>
        </div>
      {:else if i === 3}
        <p>
          Vad kostar kurvorna i människor? Behörighet till gymnasiets
          yrkesprogram kräver godkänt i svenska, engelska, matematik och fem
          ämnen till. I våras saknade
          <strong>{ov.obehoriga.toLocaleString("sv-SE")} elever</strong> den
          behörigheten.
        </p>
        <p>
          <strong>{ov.obehorigaMedFSvenska}</strong> av dem saknar godkänt i
          sitt svenskämne — svenska eller sva — och för en grupp var svenskan det enda som fattades:
          godkänt i allt annat, men dörren till gymnasiet stängd av ett enda
          ämne. Av alla ämnen är det just läsningen som stänger flest andra
          dörrar på vägen: den som inte kan läsa läroboken förlorar även SO:n,
          NO:n och mattens lästal.
        </p>
        <div class="callout">
          <span class="callout-num">{ov.obehorigaEndastSvenska}</span>
          <span class="callout-label">elever föll på svenskan ensam</span>
        </div>
      {:else if i === 4}
        <p>
          Minns gapet mellan kurvorna? Här är det, elev för elev. Rutnätet visar
          varje kombination av provbetyg på läsdelen och slutbetyg i respektive
          kursplan.
          De flesta ligger på diagonalen — provet och betyget säger samma sak.
        </p>
        <p>
          Men titta på de markerade rutorna: av eleverna som fick
          <strong>F på läsförståelsedelen</strong> fick
          <strong>{dec(ov.npFHojdaTillE)}&nbsp;%</strong> ändå godkänt i
          ämnesbetyget. Läraren väger in mer än ett provtillfälle — ofta helt
          rätt: svenskan är också att tala, lyssna och skriva. Men det betyder
          att slutbetyget kan dölja just läsluckor som provet hittade. E:t på
          pappret tvinnar inte om tråden.
        </p>
      {:else if i === 5}
        <p>
          För att förstå varför luckorna biter sig fast måste man se läsningen
          som forskningen ser den. Det här är <strong>Scarboroughs
          läsrep</strong>: läsning är inte en färdighet utan
          <strong>åtta trådar</strong> som tvinnas ihop — och repet är aldrig
          starkare än sin svagaste tråd.
        </p>
        <p>
          Den undre bunten är <strong>ordavkodningen</strong>: att höra
          språkets ljud, ljuda ihop bokstäver, känna igen ord som bilder. Den
          ska bli <em>automatisk</em> — sluta kosta tankekraft. Den övre är
          <strong>språkförståelsen</strong>: ordförråd, bakgrundskunskap,
          grammatik, att läsa mellan raderna. Den ska bli alltmer
          <em>strategisk</em>. God läsning är båda buntarna, tvinnade — hela
          vägen fram.
        </p>
      {:else if i === 6}
        <p>
          Redan innan repet ritades fanns insikten som en formel.
          <em>The Simple View of Reading</em>: Läsning = Avkodning ×
          Språkförståelse. Lägg märke till tecknet — det är en
          <strong>multiplikation, inte en summa</strong>.
        </p>
        <p>
          Dra i reglagen här intill. En elev som ljudar perfekt men inte
          förstår orden läser inte. En elev som skulle förstå allt — om någon
          läste högt — men inte knäckt koden läser inte heller.
          <strong class="rod">0 × allt = 0.</strong> Det är därför "träna mer
          på det eleven är bra på" aldrig fungerar i läsning: det är den svaga
          faktorn som sätter produkten.
        </p>
      {:else if i === 7}
        <p>
          Så vad händer när en enda tråd aldrig blir tvinnad? Här är eleven
          där <strong>avkodningen</strong> inte automatiserades i ettan och
          tvåan — och ingen upptäckte det, för hen lärde sig texterna utantill
          och gissade smart på första bokstaven.
        </p>
        <p>
          Tråden faller ur, och <strong class="rod">hela repet bär
          sämre</strong>. All tankekraft går åt till att stava sig igenom
          orden — inget blir kvar till innehållet. Utåt ser det ut som
          ointresse: eleven undviker text, bläddrar, stör. Det som egentligen
          brister är en träningsbar färdighet från lågstadiet.
        </p>
      {:else if i === 8}
        <p>
          Minns gapet mellan kursplanerna? Här är dess anatomi. För många
          sva-elever är <strong>avkodningsbunten intakt</strong> — de läser
          flytande, ibland på två språk. Det som är tunt är
          <strong>förståelsebunten på svenska</strong>: orden, uttrycken,
          bakgrundskunskaperna som svenska texter tyst förutsätter.
        </p>
        <p>
          Men multiplikationen är obeveklig: flytande avkodning × tunt
          ordförråd = läsning som inte bär i SO-boken. Skillnaden mot den
          tappade tråden är avgörande — <strong>tunna trådar är hela
          trådar</strong>. De tvinnas tjockare av det som alltid bygger
          språk: mängder av text, samtal och kunskapsundervisning på svenska.
          Det är samma rep. Bara en annan tråd att tvinna.
        </p>
      {:else if i === 9}
        <p>
          Det här är inte en metafor vi valt för att den är vacker — repet och
          multiplikationen är bland de mest belagda modellerna i
          läsforskningen, och Matteuseffekten — <em>"den som har ska få"</em> —
          myntades som forskningsbegrepp just här.
        </p>
        <p>
          Tre resultat, fyra decennier, samma slutsats: läsningen avgörs
          tidigt, den svagaste tråden sätter taket, och gap som lämnas ifred
          växer av sig själva.
        </p>
      {:else if i === 10}
        <p>
          Repet förklarar också varför problemen ofta blir synliga först i
          <strong>fjärde klass</strong>. Till och med trean handlar skolan om
          att <em>lära sig läsa</em> — texterna är korta, orden vanliga,
          avkodningen bär det mesta. Från fyran vänder det: nu ska eleven
          <em>läsa för att lära</em>, och det är förståelsetrådarna som måste
          bära — ordförråd, bakgrundskunskap, resonemang.
        </p>
        <p>
          Skiftet är läsningens gångjärn, som bråken är matematikens. Och
          efter det står <strong>varje ämne på läsningen</strong>: SO-boken,
          NO-labbens instruktion, mattens lästal. Den som tappar tråden i
          fyran tappar den överallt samtidigt.
        </p>
      {:else if i === 11}
        <p>
          Samtidigt har läsningens <strong>vardagsträning</strong> tunnats ut.
          Att bli läsare kräver mängd — tusentals möten med ord — och en
          generation fick den mängden gratis: bokhyllan, kvällstidningen,
          text-tv:n, pappersbruksanvisningen.
        </p>
        <p>
          Kurvan här intill är <strong>verklig statistik</strong>, sidans
          enda: andelen 9–12-åringar som läser böcker en vanlig dag har
          <strong>fallit från 31 till 11 procent</strong> på ett drygt
          decennium. Skärmen tog minuterna — och skärmens text är kort,
          bildstödd och algoritmiskt vald för att aldrig göra motstånd.
          Ordförrådet och uthålligheten som långtexter bygger måste numera
          klassrummet stå för nästan ensamt.
        </p>
      {:else if i === 12}
        <p>
          Fyll i vad som helst — svaret blir detsamma. En femtonåring som
          väljer bort läsningen fattar ett beslut om en framtid hen ännu inte
          kan se. <strong>Man vet inte vilka dörrar man stänger, för man har
          inte hunnit upptäcka att de finns.</strong> Undersköterskan visste
          inte att jobbet är läkemedelslistor. Snickaren visste inte att
          bygget är föreskrifter. Förrän de stod där.
        </p>
        <p>
          Prova själv i panelen: välj ett drömyrke och läs texten som väntar
          där. Poängen är inte något enskilt exempel — det är att
          <strong>det inte finns något läsfritt yrke</strong>, och att
          vuxenlivets viktigaste papper är skrivna för den som kan läsa dem.
        </p>
      {:else if i === 13}
        <p>
          Om repet stämmer borde trådarna synas i vår egen data — långt innan
          betygen sätts. Så vi följde <strong>årskullen som gick ut nian i
          våras</strong> bakåt: nationella provet i åk 3 våren 2019, åk 6
          våren 2022, åk 9 våren 2025.
        </p>
        <p>
          Kurvan gör något lömskt: {dec(data.kohort.checkpoints.alla[0].andel)}&nbsp;% →
          {dec(data.kohort.checkpoints.alla[1].andel)}&nbsp;% →
          <strong>{dec(data.kohort.checkpoints.alla[2].andel)}&nbsp;%</strong>.
          Den <em>sjunker</em> mot sexan — och stiger igen mot nian. Det är
          fjärdeklass-skiftet i data: lågstadiets korta texter klarar även den
          med tunna trådar. Sedan tätnar texterna, och gapet öppnar sig igen.
          Svackan i kurvan är ingen svacka i verkligheten.
        </p>
      {:else if i === 14}
        <p>
          Det starkaste beviset är att följa <strong>samma barn</strong>. Dela
          årskullen i två grupper efter ett enda mått: klarade de läsdelproven
          på nationella provet i trean — som nioåringar?
        </p>
        <div class="callout">
          <span class="callout-num">{Math.round(villkorade.fAndelUnder)}&nbsp;%</span>
          <span class="callout-label">av dem som missade läsdelproven i trean
            fick F i nian — mot
            <strong>{Math.round(villkorade.fAndelNadde)}&nbsp;%</strong> av dem som klarade dem</span>
        </div>
        <p>
          Och lägg märke till att <strong>mönstret håller inom båda
          kursplanerna</strong> — {dec(kp.villkorat.sv.fAndelUnder)}&nbsp;%
          inom svenska, {dec(kp.villkorat.sva.fAndelUnder)}&nbsp;% inom sva,
          mot runt en–två procent för alla som klarade trean. Det här är
          alltså inte ett annat sätt att stava "nyanländ".
          <strong>Ett läsprov i årskurs tre förutsäger slutbetyget nästan ett
          decennium i förväg</strong> — oavsett kursplan. Trådarna tvinnade
          inte om sig själva. De växte in i betygskatalogen.
        </p>
      {:else if i === 15}
        <p>
          Och ju senare en tråd ska tvinnas om, desto tyngre blir jobbet — i
          <strong>båda kursplanerna</strong>. Av dem som precis klarade sexan
          med ett E föll var tionde inom svenska och var sjätte inom sva till
          F i nian.
        </p>
        <div class="callout">
          <span class="callout-num">3&nbsp;av&nbsp;4</span>
          <span class="callout-label">med F i sexan fick F även i nian —
            {dec(kp.fEfterAk6[0].sv)}&nbsp;% inom svenska,
            {dec(kp.fEfterAk6[0].sva)}&nbsp;% inom sva</span>
        </div>
        <p>
          Högstadiet reparerar alltså sällan mellanstadiets läsning — det
          kräver den, i högre tempo och med tätare texter, oavsett vilken
          kursplan eleven läser. Ska tråden tvinnas om behöver det ske
          tidigare, medan texterna ännu är korta och repet bär lite.
        </p>
      {:else if i === 16}
        <p>
          Hur tidigt kan skolan se det? Redan <strong>första höstterminen i
          årskurs 1</strong>. Skolverkets obligatoriska bedömningsstöd i läs-
          och skrivutveckling prövar just repets undre trådar — bokstavsljud,
          fonologisk medvetenhet, den första avkodningen — och flaggar var
          sjunde elev för stöd, flera år innan något betyg sätts.
        </p>
        <p>
          Två saker i bilden förtjänar oro: gruppen på lägre nivå
          <strong>växer för varje år</strong> — och det som mäts är exakt de
          trådar som resten av repet ska tvinnas runt. Bedömningsstödet finns
          för båda kursplanerna, och det är här skolan kan skilja signalen
          <em>"kan inte avkoda"</em> från <em>"kan inte svenska än"</em> —
          två olika trådar, två olika insatser.
        </p>
      {:else if i === 17}
        <p>
          Nationella provet i trean visar inte bara <em>vilka</em> elever som
          behöver hjälp — det visar <em>vilken tråd</em> det gäller. I våras
          föll flest på <strong>sakprosan</strong> och den
          <strong>berättande texten</strong>: förståelsetrådarna. Den som
          faller på <strong>högläsningen</strong> har i stället en
          avkodningstråd att tvinna.
        </p>
        <p>
          Var femte elev ({dec(data.tidigaSignaler.npAk3MinstEtt)}&nbsp;%)
          missade minst ett av läsdelproven. Rätt läst är det inte bara ett
          provresultat — det är en karta över vilken tråd som ska tvinnas, för
          vilket barn. Sex år innan betyget sätts.
        </p>
      {:else if i === 18}
        <p>
          Det här är den ljusa punkten: <strong>Matteuseffekten går att
          vända</strong>, och ingen del av skolan har starkare verktyg än
          läsningen. Strukturerad avkodningsträning — intensivt, i liten
          grupp, tidigt — är bland de mest belagda insatserna i hela
          utbildningsforskningen. En omtvinnad tråd i tvåan bär sedan varje
          ämne, varje årskurs, varje papper vuxenlivet skickar.
        </p>
        <p>
          Signalerna finns — i ettans bedömningsstöd, i treans delprov.
          Frågan är inte var trådarna tappas. Frågan är vem som tvinnar om
          dem, och när.
        </p>
      {/if}
    </section>
  {/each}
</Scrolly>

<style>
  .visual-stack {
    position: relative;
    width: 100%;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .visual-frame {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rope-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .kursplanval-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 14px;
  }
  :global(.scrolly-step) {
    background: var(--surface-1);
    border-left: 6px solid var(--hero-navy);
    padding: 28px 32px;
    box-shadow: 0 2px 10px rgba(22, 40, 58, 0.08);
  }
  /* Stegen som visar våra egna resultat — berättelsens ryggrad — markeras
     rött; bakgrunds- och forskningssteg behåller marinblått. */
  :global(.scrolly-step.is-data) {
    border-left-color: var(--series-red);
  }
  .typ-badge {
    display: inline-block;
    background: var(--series-red);
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 2px 8px;
    border-radius: 3px;
    margin-right: 8px;
    transform: translateY(-1px);
  }
  :global(.scrolly-step > *) {
    opacity: 0.35;
    transition: opacity 0.3s ease;
  }
  :global(.scrolly-step.is-active > *) {
    opacity: 1;
  }
  :global(.scrolly-step) .kicker {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--series-blue);
    margin: 0 0 8px;
    font-weight: 700;
  }
  :global(.scrolly-step) h2 {
    font-family: var(--serif);
    margin: 0 0 14px;
    font-size: 24px;
    line-height: 1.2;
  }
  :global(.scrolly-step) p {
    margin: 0 0 12px;
    font-size: 15px;
    line-height: 1.6;
  }
  :global(.scrolly-step) p:last-child {
    margin-bottom: 0;
  }
  .rod {
    color: var(--series-red);
  }
  /* Utropssiffran — nyckeltalen ska inte kunna gömma sig i brödtexten. */
  .callout {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin: 14px 0 12px;
    padding: 12px 16px;
    background: var(--page-plane);
    border-radius: 6px;
  }
  .callout-num {
    font-family: var(--serif);
    font-size: 34px;
    font-weight: 700;
    color: var(--series-red);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    line-height: 1;
  }
  .callout-label {
    font-size: 13px;
    line-height: 1.45;
    color: var(--text-secondary);
  }
</style>
