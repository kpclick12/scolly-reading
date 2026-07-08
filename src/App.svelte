<script>
  import { appData as data } from "./lib/data/load.js";
  import Story from "./lib/story/Story.svelte";
  import ExploreRope from "./lib/components/ExploreRope.svelte";

  const ov = data.overview;

  // Bakgrundsmotiv i heron: en väv av trådar på väg åt läsriktningen —
  // och ungefär var sjunde tråd tappad: den brister mitt i och fransar ut
  // i guld, synlig redan innan berättelsen börjat.
  const MOTIF_N = 26;
  const motif = (() => {
    let seed = 271828;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: MOTIF_N }, (_, i) => {
      const y = 30 + (i / (MOTIF_N - 1)) * 580 + (rand() - 0.5) * 14;
      const amp = 6 + rand() * 16;
      const lambda = 260 + rand() * 320;
      const phase = rand() * Math.PI * 2;
      const broken = rand() < 0.14;
      const breakX = 220 + rand() * 560;
      const pathFor = (x0, x1) => {
        const pts = [];
        for (let x = x0; x <= x1; x += 20) {
          const yy = y + amp * Math.sin((x / lambda) * 2 * Math.PI + phase);
          pts.push(`${pts.length ? "L" : "M"} ${x.toFixed(0)} ${yy.toFixed(1)}`);
        }
        return pts.join(" ");
      };
      return broken
        ? { broken, i, d1: pathFor(-20, breakX - 26), d2: pathFor(breakX + 26, 1020), breakX,
            breakY: y + amp * Math.sin((breakX / lambda) * 2 * Math.PI + phase) }
        : { broken, i, d1: pathFor(-20, 1020) };
    });
  })();

  const fmt = (x) => x.toLocaleString("sv-SE");
  const dec = (x) => String(x).replace(".", ",");

  const statRow = [
    {
      value: `${dec(ov.npAndelAE)} %`,
      label: "av niorna klarade läsförståelsedelen av nationella provet i svenska, våren 2025",
    },
    {
      value: fmt(ov.antalF),
      label: "elever lämnade nian med F i svenska",
    },
    {
      value: fmt(ov.obehoriga),
      label: "elever saknade behörighet till gymnasiets yrkesprogram",
    },
    {
      value: fmt(ov.obehorigaEndastSvenska),
      label: "av dem föll på ett enda ämne: svenskan",
      accent: true,
    },
  ];
</script>

<header class="hero">
  <svg
    class="hero-motif"
    viewBox="0 0 1000 640"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {#each motif as t}
      <path d={t.d1} class="motif-thread" class:frayed={t.broken} />
      {#if t.broken}
        <path d={t.d2} class="motif-thread frayed" />
        <circle
          cx={t.breakX}
          cy={t.breakY}
          r="6"
          class="motif-break"
          style="animation-delay: {(t.i * 137) % 3000}ms"
        />
      {/if}
    {/each}
  </svg>
  <div class="hero-inner">
    <p class="eyebrow">Göteborgs Stad · Grundskoleförvaltningen</p>
    <h1>
      <span class="hero-line1">Tappad</span>
      <span class="hero-line2">tråd</span>
    </h1>
    <p class="subtitle">
      Var sjunde elev i nian klarade inte läsdelen av nationella provet i
      svenska i våras, och {fmt(ov.obehoriga)} lämnade grundskolan utan
      behörighet till gymnasiet. Läsning är ett rep av trådar — avkodning och
      språkförståelse tvinnade om varandra — och det brister där tråden är
      tunnast. Det här är berättelsen om var trådarna tappas, hur tidigt det
      syns och varför de går att tvinna om. I data, läsåret {ov.lasar}.
    </p>
    <p class="data-note">Data: syntetisk testdata (ej verkliga elevuppgifter).</p>
    <p class="scroll-hint">Scrolla<span class="scroll-tick">|</span></p>
  </div>
</header>

<section class="statrow" aria-label="Läget i korthet">
  <div class="statrow-inner">
    {#each statRow as s}
      <div class="stat" class:accent={s.accent}>
        <span class="stat-value">{s.value}</span>
        <span class="stat-label">{s.label}</span>
      </div>
    {/each}
  </div>
</section>

<main>
  <Story {data} />
</main>

<ExploreRope />

<section class="atgarder" aria-label="Vad kan var och en göra">
  <div class="atgarder-inner">
    <p class="atgarder-kicker">Samma data, tre uppdrag</p>
    <h2>Vem tvinnar om tråden?</h2>
    <div class="atgarder-grid">
      <article>
        <h3>Politiker &amp; förvaltning</h3>
        <p>
          Flytta resurserna dit hävstången är störst: F–åk 3. Följ andelen på
          lägre nivå i ettans bedömningsstöd och treans läsdelprov som
          styrsignaler — inte bara nians betyg, när det är åtta år för sent.
          Och räkna skolbiblioteket som infrastruktur, inte som utsmyckning.
        </p>
      </article>
      <article>
        <h3>Rektorer &amp; lärare</h3>
        <p>
          Behandla varje rött läsdelprov som en remiss, inte en notering.
          Strukturerad avkodningsträning — intensivt, i liten grupp, tidigt —
          har bland de största uppmätta effekterna i utbildningsforskningen.
          Och skilj på trådarna: den som gissar orden och den som inte
          förstår dem behöver olika träning.
        </p>
      </article>
      <article>
        <h3>Vårdnadshavare</h3>
        <p>
          Läs högt — varje dag, och långt efter att barnet knäckt koden:
          högläsningen bygger orden och världarna som texterna sedan
          förutsätter. Fråga inte "hur går det i svenska?" — be skolan visa
          var ditt barn står i ettans och treans avstämningar. En tråd som
          tvinnas om i fyran är billig. Samma tråd i nian kostar
          gymnasieplatsen.
        </p>
      </article>
    </div>
  </div>
</section>

<section class="epilog">
  <div class="epilog-inner">
    <p class="epilog-kicker">Ett enda ämne</p>
    <h2>
      {fmt(ov.obehorigaEndastSvenska)} elever var godkända i allt — utom
      svenska.
    </h2>
    <p class="epilog-text">
      För dem stängdes gymnasiedörren av ett enda ämne. Tråden syntes redan i
      ettans bedömningsstöd och i treans läsdelprov — sex år innan betygen
      sattes. En tappad tråd tvinnar inte om sig själv, och för varje årskurs
      hänger mer i den: varje ämne, varje prov, varje papper vuxenlivet
      skickar. Men den går att tvinna om. Ingenstans är det enklare och
      billigare än i början.
    </p>
  </div>
</section>

<section class="sources" aria-label="Om datat och källorna">
  <div class="sources-inner">
    <h2>Om datat och källorna</h2>
    <ul>
      <li>
        Alla resultatsiffror på den här sidan är <strong>syntetisk
        testdata</strong> (en simulerad årskull om {fmt(ov.arskull)} elever),
        framtagen för att utveckla berättelsen — inte verklig betygsstatistik.
        Nivåerna är kalibrerade mot storleksordningar i nationell statistik.
      </li>
      <li>
        Måtten speglar de verkliga: ämnesbetyg och provbetyg i svenska åk 6
        och åk 9 (nationella provets delprov B, läsförståelse), nationella
        provets läsdelprov i åk 3 samt Skolverkets obligatoriska
        bedömningsstöd i läs- och skrivutveckling i åk 1.
      </li>
      <li>
        Läsrepet är en svensk tolkning av Scarborough (2001), "Connecting
        early language and literacy to later reading (dis)abilities", i
        <em>Handbook of Early Literacy Research</em>, vol. 1.
      </li>
      <li>
        Gough &amp; Tunmer (1986), Decoding, reading, and reading disability,
        <em>Remedial and Special Education</em>, 7(1) —
        <a href="https://doi.org/10.1177/074193258600700104" target="_blank" rel="noopener noreferrer">doi:10.1177/074193258600700104</a>.
      </li>
      <li>
        Stanovich (1986), Matthew effects in reading,
        <em>Reading Research Quarterly</em>, 21(4) —
        <a href="https://doi.org/10.1598/RRQ.21.4.1" target="_blank" rel="noopener noreferrer">doi:10.1598/RRQ.21.4.1</a>.
      </li>
      <li>
        Juel (1988), Learning to read and write: A longitudinal study of 54
        children, <em>Journal of Educational Psychology</em>, 80(4) —
        <a href="https://doi.org/10.1037/0022-0663.80.4.437" target="_blank" rel="noopener noreferrer">doi:10.1037/0022-0663.80.4.437</a>.
        Fjärdeklass-skiftet: Chall &amp; Jacobs (2003), "The classic study on
        poor children's fourth-grade slump", <em>American Educator</em>.
      </li>
      <li>
        Sambanden i kohortavsnittet är korrelationer i testdata och säger inte
        vad som orsakar vad — men de är konstruerade för att likna de mönster
        forskningen ovan beskriver.
      </li>
      <li>
        Bokläsningsstatistiken är sidans enda verkliga dataserie:
        <a href="https://www.mediemyndigheten.se/" target="_blank" rel="noopener noreferrer">Statens
        medieråds undersökningar Ungar &amp; medier</a> (numera
        Mediemyndigheten) — andel 9–12-åringar som läser böcker en vanlig
        dag, 2012–2023 (avrundade värden).
      </li>
      <li>
        Avsnittet om skärmar och vardagsläsning är resonemang, inte mätdata.
      </li>
    </ul>
  </div>
</section>

<footer>
  <p>
    Resultatdatan på den här sidan är syntetisk testdata, genererad för att
    illustrera koncept och layout — inte verkliga elevuppgifter. Undantaget
    är Statens medieråds bokläsningsstatistik, som är verklig (avrundad).
  </p>
</footer>

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
  }
  .hero {
    position: relative;
    min-height: 100svh;
    display: flex;
    align-items: center;
    background:
      radial-gradient(120% 90% at 80% 10%, var(--hero-navy) 0%, var(--hero-navy-deep) 100%);
    color: #ffffff;
    overflow: hidden;
  }
  .hero-motif {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    /* håll motivet ur vägen för rubriken — synligt mest i kanterna */
    -webkit-mask-image: radial-gradient(ellipse 75% 65% at 44% 46%, transparent 0%, transparent 36%, #000 78%);
    mask-image: radial-gradient(ellipse 75% 65% at 44% 46%, transparent 0%, transparent 36%, #000 78%);
  }
  .motif-thread {
    fill: none;
    stroke: rgba(255, 255, 255, 0.08);
    stroke-width: 1.4;
  }
  .motif-thread.frayed {
    stroke: rgba(255, 205, 55, 0.16);
    stroke-dasharray: 5 4;
  }
  .motif-break {
    fill: transparent;
    stroke: rgba(255, 205, 55, 0.45);
    stroke-width: 1.5;
    stroke-dasharray: 3 3;
    animation: break-pulse 3.2s ease-in-out infinite;
  }
  @keyframes break-pulse {
    0%, 100% { stroke-opacity: 0.55; }
    50% { stroke-opacity: 1; }
  }
  .hero-inner {
    position: relative;
    max-width: 700px;
    margin: 0 auto;
    padding: 48px 32px;
    width: 100%;
  }
  .eyebrow {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--hero-gold);
    font-weight: 600;
    margin: 0 0 28px;
  }
  h1 {
    font-family: var(--serif);
    font-weight: 700;
    font-size: clamp(56px, 11vw, 110px);
    line-height: 1.02;
    margin: 0 0 32px;
    letter-spacing: -0.01em;
    color: #ffffff;
  }
  .hero-line1 {
    display: block;
  }
  .hero-line2 {
    display: block;
    font-style: italic;
    color: var(--hero-lightblue);
  }
  .subtitle {
    font-size: 19px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.92);
    max-width: 560px;
    margin: 0 0 20px;
  }
  .data-note {
    font-size: 14px;
    color: var(--hero-gold);
    margin: 0 0 64px;
  }
  .scroll-hint {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.55);
    text-align: center;
    margin: 0;
  }
  .scroll-tick {
    display: block;
    margin-top: 6px;
    animation: bob 2s ease-in-out infinite;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50% { transform: translateY(6px); opacity: 1; }
  }

  /* Läget i korthet — för den som skummar: chefer, politiker, press. */
  .statrow {
    background: var(--surface-1);
    border-bottom: 1px solid var(--border);
  }
  .statrow-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 34px 32px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .stat-value {
    font-family: var(--serif);
    font-size: clamp(28px, 3.4vw, 40px);
    font-weight: 700;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .stat.accent .stat-value {
    color: var(--series-red);
  }
  .stat-label {
    font-size: 13px;
    line-height: 1.45;
    color: var(--text-muted);
  }
  @media (max-width: 860px) {
    .statrow-inner {
      grid-template-columns: repeat(2, 1fr);
      gap: 22px;
      padding: 26px 20px;
    }
  }

  /* Vem tvinnar om tråden — tre uppdrag, samma data. */
  .atgarder {
    background: var(--surface-1);
    border-top: 1px solid var(--border);
  }
  .atgarder-inner {
    max-width: 1000px;
    margin: 0 auto;
    padding: 72px 32px;
  }
  .atgarder-kicker {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--series-blue);
    font-weight: 700;
    margin: 0 0 12px;
    text-align: center;
  }
  .atgarder h2 {
    font-family: var(--serif);
    font-size: clamp(26px, 4vw, 36px);
    text-align: center;
    margin: 0 0 40px;
  }
  .atgarder-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .atgarder-grid article {
    background: var(--page-plane);
    border-radius: 8px;
    padding: 24px 26px;
    border-top: 4px solid var(--hero-navy);
  }
  .atgarder-grid h3 {
    font-size: 16px;
    margin: 0 0 10px;
  }
  .atgarder-grid p {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }
  @media (max-width: 860px) {
    .atgarder-grid {
      grid-template-columns: 1fr;
    }
    .atgarder-inner {
      padding: 52px 20px;
    }
  }

  .epilog {
    background: radial-gradient(120% 90% at 20% 10%, var(--hero-navy) 0%, var(--hero-navy-deep) 100%);
    color: #ffffff;
    padding: 110px 32px;
    text-align: center;
  }
  .epilog-inner {
    max-width: 640px;
    margin: 0 auto;
  }
  .epilog-kicker {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--hero-gold);
    font-weight: 600;
    margin: 0 0 20px;
  }
  .epilog h2 {
    font-family: var(--serif);
    font-size: clamp(30px, 5vw, 46px);
    line-height: 1.15;
    color: #ffffff;
    margin: 0 0 24px;
  }
  .epilog-text {
    font-size: 16px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }
  .sources {
    background: var(--surface-1);
    border-top: 1px solid var(--border);
  }
  .sources-inner {
    max-width: 640px;
    margin: 0 auto;
    padding: 48px 24px;
  }
  .sources h2 {
    font-family: var(--serif);
    font-size: 18px;
    margin: 0 0 16px;
    color: var(--text-primary);
  }
  .sources ul {
    margin: 0;
    padding-left: 20px;
  }
  .sources li {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--text-muted);
    margin-bottom: 10px;
  }
  .sources li:last-child {
    margin-bottom: 0;
  }
  .sources a {
    color: var(--series-blue);
  }
  footer {
    padding: 40px 24px 80px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    border-top: 1px solid var(--border);
    margin-top: 0;
  }
</style>
