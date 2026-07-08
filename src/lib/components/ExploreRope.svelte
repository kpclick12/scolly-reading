<script>
  import ReadingRope from "./ReadingRope.svelte";
  import { BUNDLES, strandById } from "../data/rope.js";

  let selected = $state("avkodning");

  const strand = $derived(strandById.get(selected));
</script>

<section class="explore" aria-label="Utforska repet">
  <div class="explore-inner">
    <p class="explore-kicker">Utforska själv</p>
    <h2>Dra i en tråd</h2>
    <p class="explore-intro">
      Klicka på en tråd i repet. Panelen visar vad tråden bär — och hur det
      ser ut i klassrummet när just den är svag.
    </p>
    <div class="explore-layout">
      <div class="explore-graph">
        <ReadingRope mode="explore" {selected} onSelect={(id) => (selected = id)} />
      </div>
      <aside class="explore-panel">
        <p class="panel-strand" style="color: {strand.color}">
          {BUNDLES[strand.bundle].label} · {BUNDLES[strand.bundle].sub}
        </p>
        <h3>{strand.label}</h3>
        <p class="panel-desc">{strand.desc}</p>
        <div class="panel-row brist">
          <strong>När tråden är svag:</strong>
          <span>{strand.brist}</span>
        </div>
        <div class="panel-row tranas">
          <strong>Så tvinnas den:</strong>
          <span>{strand.tranas}</span>
        </div>
      </aside>
    </div>
  </div>
</section>

<style>
  .explore {
    background: var(--page-plane);
    border-top: 1px solid var(--border);
  }
  .explore-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 72px 32px 84px;
  }
  .explore-kicker {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--series-blue);
    font-weight: 700;
    margin: 0 0 12px;
    text-align: center;
  }
  .explore h2 {
    font-family: var(--serif);
    font-size: clamp(26px, 4vw, 36px);
    text-align: center;
    margin: 0 0 10px;
  }
  .explore-intro {
    text-align: center;
    font-size: 15px;
    color: var(--text-secondary);
    max-width: 460px;
    margin: 0 auto 40px;
  }
  .explore-layout {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 40px;
    align-items: center;
  }
  .explore-graph {
    display: flex;
    justify-content: center;
  }
  .explore-panel {
    background: var(--surface-1);
    border-radius: 10px;
    padding: 26px 28px;
    box-shadow: 0 2px 14px rgba(22, 40, 58, 0.08);
    align-self: start;
    position: sticky;
    top: 24px;
    min-height: 340px;
  }
  .panel-strand {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
    margin: 0 0 8px;
  }
  .explore-panel h3 {
    font-family: var(--serif);
    font-size: 24px;
    margin: 0 0 14px;
    line-height: 1.2;
  }
  .panel-desc {
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-secondary);
    margin: 0 0 18px;
  }
  .panel-row {
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-secondary);
    margin: 0 0 14px;
    padding-left: 12px;
    border-left: 3px solid transparent;
  }
  .panel-row:last-child {
    margin-bottom: 0;
  }
  .panel-row strong {
    display: block;
    color: var(--text-primary);
    margin-bottom: 3px;
  }
  .panel-row.brist {
    border-left-color: var(--series-red);
  }
  .panel-row.tranas {
    border-left-color: var(--series-blue);
  }
  @media (max-width: 860px) {
    .explore-layout {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .explore-panel {
      position: static;
      min-height: 0;
    }
    .explore-inner {
      padding: 52px 20px 60px;
    }
  }
</style>
