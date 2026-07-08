<script>
  // The Simple View of Reading (Gough & Tunmer 1986):
  // Läsning = Avkodning × Språkförståelse. En MULTIPLIKATION — inte en
  // summa. Är endera faktorn noll är läsningen noll, hur stark den andra
  // än är. Reglagen gör poängen upplevbar.
  let avkodning = $state(85);
  let forstaelse = $state(85);

  const lasning = $derived(Math.round((avkodning * forstaelse) / 100));

  const PROFILER = [
    { namn: "Tränad i båda", a: 90, f: 90 },
    { namn: "Ljudar än — åk 2", a: 25, f: 85 },
    { namn: "Nyanländ — läser flytande", a: 90, f: 30 },
  ];

  const dec = (x) => String(x).replace(".", ",");
</script>

<div class="simpleview">
  <p class="formel">
    <span class="term avk">Avkodning</span>
    <span class="op">×</span>
    <span class="term sf">Språkförståelse</span>
    <span class="op">=</span>
    <span class="term las">Läsning</span>
  </p>

  <div class="slider-row">
    <label>
      <span class="slider-label">
        <span>Avkodning</span>
        <strong>{avkodning} %</strong>
      </span>
      <input type="range" min="0" max="100" bind:value={avkodning} class="avk-range" />
    </label>
    <label>
      <span class="slider-label">
        <span>Språkförståelse</span>
        <strong>{forstaelse} %</strong>
      </span>
      <input type="range" min="0" max="100" bind:value={forstaelse} class="sf-range" />
    </label>
  </div>

  <div class="produkt" class:kritisk={lasning < 25}>
    <span class="produkt-num">{lasning}&nbsp;%</span>
    <div class="produkt-bar" role="img" aria-label="Läsförmåga {lasning} procent">
      <div class="produkt-fill" style="width: {lasning}%"></div>
    </div>
    <p class="produkt-not">
      {#if avkodning === 0 || forstaelse === 0}
        <strong>0 × allt = 0.</strong> Är en faktor noll spelar den andra ingen roll.
      {:else if lasning < 25}
        {dec(avkodning)} % × {dec(forstaelse)} % — den svaga faktorn drar ner allt.
      {:else}
        Produkten är aldrig starkare än den svagaste faktorn tillåter.
      {/if}
    </p>
  </div>

  <div class="profiler" role="group" aria-label="Exempelprofiler">
    <span class="profiler-label">Prova en elev:</span>
    {#each PROFILER as p}
      <button
        class:active={avkodning === p.a && forstaelse === p.f}
        onclick={() => { avkodning = p.a; forstaelse = p.f; }}
      >{p.namn}</button>
    {/each}
  </div>
</div>

<style>
  .simpleview {
    width: 100%;
    max-width: 480px;
    background: var(--surface-1);
    border-radius: 10px;
    padding: 22px 24px;
    box-shadow: 0 2px 12px rgba(22, 40, 58, 0.09);
  }
  .formel {
    display: flex;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    font-family: var(--serif);
    font-size: 17px;
    font-weight: 700;
    margin: 0 0 20px;
  }
  .term.avk { color: var(--rope-avk-2); }
  .term.sf { color: var(--series-blue); }
  .term.las { color: var(--text-primary); }
  .op {
    color: var(--text-muted);
    font-family: var(--sans);
    font-weight: 400;
  }
  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
  }
  label {
    display: block;
  }
  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }
  .slider-label strong {
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
  }
  input[type="range"] {
    width: 100%;
    margin: 0;
  }
  .avk-range { accent-color: var(--rope-avk-2); }
  .sf-range { accent-color: var(--series-blue); }
  .produkt {
    border-top: 1px solid var(--border);
    padding-top: 16px;
  }
  .produkt-num {
    display: block;
    font-family: var(--serif);
    font-size: 44px;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
    transition: color 0.25s ease;
    margin-bottom: 10px;
  }
  .produkt.kritisk .produkt-num {
    color: var(--series-red);
  }
  .produkt-bar {
    height: 10px;
    border-radius: 5px;
    background: var(--page-plane);
    overflow: hidden;
    margin-bottom: 10px;
  }
  .produkt-fill {
    height: 100%;
    border-radius: 5px;
    background: var(--series-blue);
    transition: width 0.25s ease, background 0.25s ease;
  }
  .produkt.kritisk .produkt-fill {
    background: var(--series-red);
  }
  .produkt-not {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 0;
    min-height: 38px;
  }
  .profiler {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 14px;
  }
  .profiler-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-right: 2px;
  }
  .profiler button {
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    color: var(--text-secondary);
    background: var(--page-plane);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .profiler button:hover {
    color: var(--text-primary);
    border-color: var(--text-muted);
  }
  .profiler button.active {
    background: var(--hero-navy);
    border-color: var(--hero-navy);
    color: #ffffff;
  }
</style>
