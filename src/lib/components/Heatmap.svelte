<script>
  import { scaleQuantize } from "d3-scale";
  import ColorLegend from "./ColorLegend.svelte";

  // Sekventiell blå ramp (andel elever = magnitud, en färgton ljus → mörk).
  // I mörkt läge egen ramp åt andra hållet — låga värden ska vara recessiva
  // mot den mörka ytan, inte lysa ljusast på sidan.
  const BLUE_RAMP = [
    "#eee9db", "#c8d9ea", "#9cc0dd", "#649ecf",
    "#2d7fbe", "#0068b2", "#00456f",
  ];
  const BLUE_RAMP_DARK = [
    "#26261f", "#1a3853", "#1d4a70", "#2a6293",
    "#3b7cb5", "#5b9bd0", "#8fc1e9",
  ];
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  let {
    rows = [],
    cols = [],
    data = [],
    title = "",
    unit = "%",
    rowTitle = "",
    colTitle = "",
    lowLabel = "Låg",
    highLabel = "Hög",
    colors = prefersDark ? BLUE_RAMP_DARK : BLUE_RAMP,
    showValues = false,
    // celler (row__col) som ska få en markeringsring
    highlight = [],
  } = $props();

  const byKey = $derived(
    new Map(data.map((d) => [`${d.row}__${d.col}`, d.value]))
  );
  const values = $derived(data.map((d) => d.value));
  const color = $derived(
    scaleQuantize()
      .domain([Math.min(...values), Math.max(...values)])
      .range(colors)
  );
  const highlightSet = $derived(new Set(highlight));
  // mörk cell ⇒ ljus text (i mörkt läge är det istället de LJUSA cellerna
  // som behöver mörk text — samma index-logik, spegelvänd)
  const isDark = (v) => {
    const idx = colors.indexOf(color(v));
    return prefersDark ? idx <= 2 : idx >= colors.length - 3;
  };
</script>

<figure class="heatmap">
  {#if title}<figcaption class="title">{title}</figcaption>{/if}
  {#if colTitle}<div class="col-title">{colTitle} →</div>{/if}
  <div class="wrap">
    {#if rowTitle}<div class="row-title">{rowTitle} ↓</div>{/if}
    <div class="grid" style="grid-template-columns: auto repeat({cols.length}, 1fr);">
      <div class="corner"></div>
      {#each cols as col}
        <div class="col-label">{col}</div>
      {/each}
      {#each rows as row, ri}
        <div class="row-label">{row}</div>
        {#each cols as col, ci}
          {@const v = byKey.get(`${row}__${col}`)}
          <div
            class="cell"
            class:hl={highlightSet.has(`${row}__${col}`)}
            style="background:{v != null
              ? color(v)
              : 'var(--gridline)'}; animation-delay: {ri * 90 + ci * 22}ms"
            title="{row} → {col}: {v}{unit}"
          >
            {#if showValues && v != null && v >= 0.05}
              <span class="cell-value" class:light={isDark(v)}>{String(v).replace(".", ",")}</span>
            {/if}
          </div>
        {/each}
      {/each}
    </div>
  </div>
  <ColorLegend {colors} low={lowLabel} high={highLabel} />
</figure>

<style>
  .heatmap {
    margin: 0;
    width: 100%;
    max-width: 540px;
  }
  .title {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 10px;
  }
  .col-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 4px;
  }
  .wrap {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .row-title {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
  }
  .grid {
    display: grid;
    gap: 2px;
    flex: 1;
  }
  .corner {
    width: 24px;
  }
  .col-label,
  .row-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .row-label {
    justify-content: flex-end;
    padding-right: 6px;
    white-space: nowrap;
  }
  .cell {
    aspect-ratio: 1;
    border-radius: 2px;
    min-width: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: cell-in 0.45s ease backwards;
  }
  .cell.hl {
    outline: 2.5px solid var(--series-red);
    outline-offset: -2.5px;
  }
  .cell-value {
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
  }
  .cell-value.light {
    color: rgba(255, 255, 255, 0.92);
  }
  /* Mörkt läge: rampen går mörk → ljus, så textfärgerna byter roll —
     mörk text på de ljusa (höga) cellerna, vit på de mörka (låga). */
  @media (prefers-color-scheme: dark) {
    .cell-value {
      color: #16283a;
    }
    .cell-value.light {
      color: rgba(255, 255, 255, 0.92);
    }
  }
  @keyframes cell-in {
    from {
      opacity: 0;
      transform: scale(0.6);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @media (max-width: 860px) {
    .cell-value {
      font-size: 9px;
    }
  }
</style>
