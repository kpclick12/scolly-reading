<script>
  import { onMount } from "svelte";

  // Varje prick = en elev. Grupperna målas i ordning från första pricken:
  // groups: [{ count, color, label }]
  let { groups = [], cols = 34, caption = "" } = $props();

  const total = $derived(groups.reduce((a, g) => a + g.count, 0));
  const rows = $derived(Math.ceil(total / cols));

  const CELL = 13;
  const R = 4.6;

  function groupFor(i) {
    let acc = 0;
    for (let g = 0; g < groups.length; g++) {
      acc += groups[g].count;
      if (i < acc) return g;
    }
    return groups.length - 1;
  }

  let revealed = $state(false);
  onMount(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => (revealed = true)));
  });
</script>

<figure class="dotwaffle">
  <svg
    viewBox="0 0 {cols * CELL} {rows * CELL}"
    role="img"
    aria-label={caption}
    class:revealed
  >
    {#each Array.from({ length: total }) as _, i}
      {@const g = groupFor(i)}
      <circle
        cx={(i % cols) * CELL + CELL / 2}
        cy={Math.floor(i / cols) * CELL + CELL / 2}
        r={R}
        fill={groups[g].color}
        class="dot"
        style="transition-delay: {Math.floor(i / cols) * 22}ms"
      />
    {/each}
  </svg>
  <div class="legend">
    {#each groups as g}
      <span class="legend-item">
        <span class="swatch" style="background:{g.color}"></span>
        <strong>{g.count.toLocaleString("sv-SE")}</strong>&nbsp;{g.label}
      </span>
    {/each}
  </div>
  {#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
  .dotwaffle {
    margin: 0;
    width: 100%;
    max-width: 520px;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .dot {
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  svg.revealed .dot {
    opacity: 1;
  }
  .legend {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 14px;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }
  .legend-item strong {
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }
  .swatch {
    flex: 0 0 auto;
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
  figcaption {
    margin-top: 10px;
    font-size: 12.5px;
    color: var(--text-muted);
  }
</style>
