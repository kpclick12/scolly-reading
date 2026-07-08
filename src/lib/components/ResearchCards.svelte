<script>
  // Forskningskort — de vetenskapliga beläggen för att matematik är kumulativt.
  let { cards = [] } = $props();
</script>

<div class="cards">
  {#each cards as c, i}
    <article class="card" style="animation-delay: {i * 150}ms">
      <p class="finding">{c.finding}</p>
      <p class="source">{c.source}</p>
    </article>
  {/each}
</div>

<style>
  .cards {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: 480px;
  }
  .card {
    background: var(--surface-1);
    border-left: 4px solid var(--series-blue);
    border-radius: 0 6px 6px 0;
    padding: 16px 20px;
    box-shadow: 0 2px 10px rgba(22, 40, 58, 0.07);
    animation: card-in 0.5s ease backwards;
  }
  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .finding {
    font-family: var(--serif);
    font-size: 16.5px;
    line-height: 1.45;
    color: var(--text-primary);
    margin: 0 0 10px;
  }
  .source {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }
  @media (max-width: 860px) {
    .finding {
      font-size: 14.5px;
    }
  }
</style>
