<script>
  // Kursplan-väljaren för resultatdiagrammen: båda kursplanerna (viktad
  // helhet), svenska eller svenska som andraspråk. Ligger i sticky-panelen —
  // Scrollys pointer-events-fix gör knapparna klickbara även på mobil.
  let { value = "alla", onChange = null } = $props();

  const VAL = [
    { id: "alla", label: "Båda kursplanerna" },
    { id: "sv", label: "Svenska" },
    { id: "sva", label: "Svenska som andraspråk" },
  ];
</script>

<div class="kursplanval" role="group" aria-label="Välj kursplan för diagrammet">
  {#each VAL as v}
    <button
      class:active={value === v.id}
      aria-pressed={value === v.id}
      onclick={() => onChange?.(v.id)}
    >{v.label}</button>
  {/each}
</div>

<style>
  .kursplanval {
    display: inline-flex;
    gap: 0;
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 3px;
  }
  button {
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    line-height: 1.3;
    color: var(--text-secondary);
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }
  button:hover {
    color: var(--text-primary);
  }
  button.active {
    background: var(--hero-navy);
    color: #ffffff;
  }
  @media (max-width: 860px) {
    button {
      padding: 5px 8px;
      font-size: 11px;
      white-space: normal;
    }
  }
</style>
