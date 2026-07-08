<script module>
  import { STRANDS, BUNDLES, MISSING_STRAND } from "../data/rope.js";

  export const W = 640;
  export const H = 440;

  // Geometrin är gemensam för alla lägen: trådarna startar i två buntar till
  // vänster och tvinnas ihop till ett rep åt höger. Lägena ändrar bara
  // parametrar (bredd, avvikelse, färg) — aldrig grundformen, så att
  // övergångarna kan tweenas mjukt i stället för att ritas om.
  const X0 = 10;
  const X1 = 620;
  const YC = 225; // repets mittlinje
  const CX = 150; // här börjar trådarna söka sig mot repet
  const CSPAN = 280;
  const LAMBDA = 110; // tvinningens våglängd
  const AMP = 13; // tvinningens amplitud i det färdiga repet
  const XB = 400; // här tappas tråden i missing-läget
  const N = 56; // sampel per tråd

  const START_Y = { sf: [52, 92, 132, 172, 212], avk: [305, 348, 391] };
  const BASE_W = 6.5;

  const ss = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const lerp = (a, b, t) => a + (b - a) * t;

  // Startpunkt + tvinningsfas per tråd.
  const strandMeta = (() => {
    const counters = { sf: 0, avk: 0 };
    return STRANDS.map((s, i) => ({
      ...s,
      startY: START_Y[s.bundle][counters[s.bundle]++],
      phase: (i * Math.PI) / 4,
    }));
  })();

  // mT = missing-läget (0→1), sT = shift-läget (0→1).
  function samples(meta, mT, sT) {
    const missing = meta.id === MISSING_STRAND;
    const pts = [];
    for (let k = 0; k <= N; k++) {
      const x = X0 + ((X1 - X0) * k) / N;
      const conv = ss((x - CX) / CSPAN);
      const post = ss((x - XB) / 80);
      // Repet tunnas när en tråd tappats — de kvarvarande tvinnas tätare.
      const amp = AMP - 3.5 * mT * post;
      const twist = amp * Math.sin(((x - CX) * 2 * Math.PI) / LAMBDA + meta.phase);
      let y = lerp(meta.startY, YC + twist, conv);

      // Fjärdeklass-skiftet: avkodningen bär mest i början, förståelsen sen.
      const u = ss((x - 60) / 500);
      const wShift = meta.bundle === "avk" ? lerp(9.5, 3, u) : lerp(3.5, 9, u);
      let w = BASE_W + sT * (wShift - BASE_W);

      if (missing && mT > 0) {
        const drop = x <= XB ? 0 : ((x - XB) / (X1 - XB)) ** 2;
        y += mT * drop * 175; // tråden faller ur repet
        w *= 1 - 0.88 * mT * drop; // och fransar ut mot ingenting
      } else {
        w *= 1 - 0.18 * mT * post;
      }
      pts.push([x, y, Math.max(0.6, w)]);
    }
    return pts;
  }

  // Band med varierande bredd: överkant dit, underkant hem, stäng.
  function ribbonPath(pts) {
    const top = pts.map(([x, y, w], k) => `${k ? "L" : "M"} ${x.toFixed(1)} ${(y - w / 2).toFixed(1)}`);
    const bot = [...pts].reverse().map(([x, y, w]) => `L ${x.toFixed(1)} ${(y + w / 2).toFixed(1)}`);
    return `${top.join(" ")} ${bot.join(" ")} Z`;
  }

  function centerPath(pts) {
    return pts.map(([x, y], k) => `${k ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  }

  const AK_TICKS = [1, 3, 5, 7, 9];
  const akX = (ak) => X0 + 30 + ((ak - 1) / 8) * (X1 - X0 - 60);
</script>

<script>
  import { tweened } from "svelte/motion";
  import { cubicInOut } from "svelte/easing";

  // mode: "all" | "strands" | "missing" | "shift" | "explore"
  // I explore-läget är trådarna klickbara; vald tråd lyser, resten tonas.
  let { mode = "all", title = "", selected = null, onSelect = null } = $props();

  const mT = tweened(0, { duration: 800, easing: cubicInOut });
  const sT = tweened(0, { duration: 800, easing: cubicInOut });
  $effect(() => {
    mT.set(mode === "missing" ? 1 : 0);
    sT.set(mode === "shift" ? 1 : 0);
  });

  const geom = $derived(
    strandMeta.map((meta) => {
      const pts = samples(meta, $mT, $sT);
      return { meta, d: ribbonPath(pts), hit: centerPath(pts) };
    })
  );

  const isMissing = (id) => mode === "missing" && id === MISSING_STRAND;
  const isDimmed = (id) =>
    mode === "explore" && selected != null && id !== selected;

  const showStrandLabels = $derived(mode === "strands" || mode === "explore");
</script>

<figure class="rope">
  {#if title}<figcaption class="title">{title}</figcaption>{/if}
  <svg
    viewBox="0 0 {W} {H}"
    role="img"
    aria-label={title || "Scarboroughs läsrep: åtta trådar tvinnas till god läsning"}
  >
    <!-- Buntrubrikerna hör till modellen och står alltid kvar. -->
    <text x={X0 + 2} y="22" class="bundle-label">{BUNDLES.sf.label}</text>
    <text x={X0 + 2} y="36" class="bundle-sub">— {BUNDLES.sf.sub}</text>
    <text x={X0 + 2} y="275" class="bundle-label">{BUNDLES.avk.label}</text>
    <text x={X0 + 2} y="289" class="bundle-sub">— {BUNDLES.avk.sub}</text>

    <text x={X1} y={YC - 34} class="rope-end" text-anchor="end">God läsning</text>

    {#each geom as { meta, d, hit } (meta.id)}
      <path
        {d}
        class="strand"
        class:fallen={isMissing(meta.id)}
        class:dimmed={isDimmed(meta.id)}
        class:selected={mode === "explore" && meta.id === selected}
        style="fill: {isMissing(meta.id) ? 'var(--series-red)' : meta.color}"
      />
      {#if mode === "explore"}
        <path
          d={hit}
          class="hit"
          role="button"
          tabindex="0"
          aria-label={meta.label}
          aria-pressed={meta.id === selected}
          onclick={() => onSelect?.(meta.id)}
          onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect?.(meta.id))}
        ><title>{meta.label}</title></path>
      {/if}
    {/each}

    <!-- Trådetiketter — bara när de bär berättelsen. -->
    <g class="strand-labels" class:visible={showStrandLabels}>
      {#each strandMeta as meta}
        <text
          x={X0 + 2}
          y={meta.startY - 8}
          class="strand-label"
          class:dimmed={isDimmed(meta.id)}
        ><tspan class="dot" style="fill: {meta.color}">●</tspan> {meta.label}</text>
      {/each}
    </g>

    <!-- Den tappade tråden pekas ut. -->
    <text x="530" y={H - 12} class="fallen-label" style="opacity: {$mT}" text-anchor="middle">
      Avkodningen — tappad tråd
    </text>

    <!-- Årskursaxeln finns bara i skift-läget: repet läses som tid. -->
    <g class="ak-axis" style="opacity: {$sT}">
      {#each AK_TICKS as ak}
        <text x={akX(ak)} y={H - 8} class="ak-tick" text-anchor="middle">åk {ak}</text>
      {/each}
    </g>
  </svg>

  {#if mode === "missing"}
    <div class="legend">
      <span class="swatch" style="background: var(--series-red)"></span>
      <span class="legend-note">En enda tappad tråd — och hela repet bär sämre.</span>
    </div>
  {:else if mode === "shift"}
    <div class="legend">
      <span class="legend-note">Trådens tjocklek = hur mycket den bär i läsningen just den årskursen.</span>
    </div>
  {:else}
    <div class="legend">
      <span class="legend-item">
        {#each ["var(--rope-sf-1)", "var(--rope-sf-2)", "var(--rope-sf-3)", "var(--rope-sf-4)", "var(--rope-sf-5)"] as c}
          <span class="swatch" style="background:{c}"></span>
        {/each}
        {BUNDLES.sf.label}
      </span>
      <span class="legend-item">
        {#each ["var(--rope-avk-1)", "var(--rope-avk-2)", "var(--rope-avk-3)"] as c}
          <span class="swatch" style="background:{c}"></span>
        {/each}
        {BUNDLES.avk.label}
      </span>
      <span class="legend-note">Scarborough (2001)</span>
    </div>
  {/if}
</figure>

<style>
  .rope {
    margin: 0;
    width: 100%;
    max-width: 600px;
  }
  .title {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  svg {
    width: 100%;
    height: auto;
    max-height: 74svh;
    display: block;
  }
  .strand {
    stroke: var(--surface-1);
    stroke-width: 1.4;
    transition: fill 0.5s ease, opacity 0.4s ease;
  }
  .strand.dimmed {
    opacity: 0.22;
  }
  .strand.selected {
    stroke: var(--text-primary);
  }
  .hit {
    fill: none;
    stroke: transparent;
    stroke-width: 26;
    pointer-events: stroke;
    cursor: pointer;
    outline: none;
  }
  .hit:focus-visible {
    stroke: color-mix(in srgb, var(--series-blue) 25%, transparent);
  }
  .bundle-label {
    font-size: 13px;
    font-weight: 700;
    fill: var(--text-primary);
  }
  .bundle-sub {
    font-size: 10.5px;
    font-style: italic;
    fill: var(--text-muted);
  }
  .rope-end {
    font-size: 13px;
    font-weight: 700;
    fill: var(--text-secondary);
  }
  .strand-labels {
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .strand-labels.visible {
    opacity: 1;
  }
  .strand-label {
    font-size: 11.5px;
    font-weight: 600;
    fill: var(--text-primary);
    paint-order: stroke;
    stroke: var(--page-plane);
    stroke-width: 3;
    stroke-linejoin: round;
    transition: opacity 0.4s ease;
  }
  .strand-label .dot {
    stroke: none;
    font-size: 9px;
  }
  .strand-label.dimmed {
    opacity: 0.35;
  }
  .fallen-label {
    font-size: 12px;
    font-weight: 700;
    fill: var(--series-red);
    paint-order: stroke;
    stroke: var(--page-plane);
    stroke-width: 3;
    stroke-linejoin: round;
  }
  .ak-tick {
    font-size: 11px;
    fill: var(--text-muted);
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 16px;
    margin-top: 10px;
    min-height: 18px;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    color: var(--text-secondary);
  }
  .legend-item .swatch:last-of-type {
    margin-right: 4px;
  }
  .swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .legend-note {
    font-size: 12px;
    color: var(--text-secondary);
  }
  @media (max-width: 860px) {
    .legend-item, .legend-note {
      font-size: 11px;
    }
  }
</style>
