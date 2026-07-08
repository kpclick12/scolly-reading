<script>
  // "Varför ska jag kunna läsa — jag ska ju bli …?"
  // Samma mönster som matte-systerns yrkesväljare, men i stället för
  // räkneexempel visar panelen ett verklighetsliknande textutdrag ur ett
  // dokument som yrket kräver att man läser. Poängen: det finns inget
  // läsfritt yrke — bara yrken där man ännu inte sett pappren.
  const YRKEN = [
    {
      id: "underskoterska",
      namn: "Undersköterska",
      vag: "Vård- och omsorgsprogrammet",
      dok: "Läkemedelslista, särskilt boende",
      utdrag: [
        "Alvedon 500 mg, 2 tabl. vid behov, max 4 ggr/dygn.",
        "OBS! Ges EJ tillsammans med Citodon — samma substans.",
        "Waran enligt separat ordinationslista — dubbelkontroll krävs.",
      ],
      punch:
        "En felläst rad här är inte ett läsfel — det är en feldosering till en människa. Delegeringen kräver att du läser, förstår och signerar.",
    },
    {
      id: "snickare",
      namn: "Snickare",
      vag: "Bygg- och anläggningsprogrammet",
      dok: "Arbetsmiljöverkets föreskrift, ställningar",
      utdrag: [
        "Ställningen får inte beträdas förrän ansvarig person",
        "kontrollerat förankringar och spiror samt upprättat",
        "plan för uppförande. Vid ändring krävs ny kontroll.",
      ],
      punch:
        "Säkerhetsföreskrifter är tät sakprosa med juridisk verkan. Den som läser fel bygger fel — eller faller.",
    },
    {
      id: "elektriker",
      namn: "Elektriker",
      vag: "El- och energiprogrammet",
      dok: "Installationsanvisning, våtutrymme",
      utdrag: [
        "I zon 1 får endast utrustning med lägst kapslingsklass",
        "IPX4 installeras. Jordfelsbrytare 30 mA krävs för samtliga",
        "gruppledningar som betjänar utrymmet.",
      ],
      punch:
        "Anvisningen avgör vad som är lagligt att koppla. Att fråga chefen om varje stycke funkar inte — behörigheten förutsätter att du läser själv.",
    },
    {
      id: "lastbilschauffor",
      namn: "Lastbilschaufför",
      vag: "Fordons- och transportprogrammet",
      dok: "Körkortsteori + YKB-prov",
      utdrag: [
        "Du närmar dig en cirkulationsplats med två körfält och",
        "avser att lämna vid tredje utfarten. Vilket körfält väljer",
        "du, och när blinkar du? 65 frågor. 50 minuter.",
      ],
      punch:
        "Teoriprovet är i praktiken ett lästest på tid — många kuggas på språket, inte på trafikkunskapen. Och sen: fraktsedlar, farligt gods-regler, kör- och vilotider.",
    },
    {
      id: "kock",
      namn: "Kock",
      vag: "Restaurang- och livsmedelsprogrammet",
      dok: "Egenkontroll & allergener",
      utdrag: [
        "Rätt 7 innehåller: vetemjöl (GLUTEN), grädde (MJÖLK),",
        "cashewnötter (NÖTTER). Vid beställning märkt allergi:",
        "separat beredningsyta, nya handskar, ny stekspade.",
      ],
      punch:
        "Allergimatrisen läses under tidspress — och ett hoppat led kan skicka en gäst till akuten. Egenkontrollen är dessutom lagkrav.",
    },
    {
      id: "frisor",
      namn: "Frisör med egen salong",
      vag: "Hantverksprogrammet + F-skatt",
      dok: "Säkerhetsdatablad, blekmedel",
      utdrag: [
        "Orsakar allvarlig ögonirritation. Använd skyddshandskar.",
        "Vid kontakt med ögonen: skölj försiktigt med vatten i flera",
        "minuter. Blanda ej med produkter innehållande ammoniak.",
      ],
      punch:
        "Kemikalieblad, bokningssystem, moms och F-skatt — egenföretagarens vardag är en pappershög. Den som inte läser den betalar för det.",
    },
    {
      id: "spelutvecklare",
      namn: "Spelutvecklare",
      vag: "Teknikprogrammet → högskola",
      dok: "API-dokumentation (på engelska)",
      utdrag: [
        "Returns a paginated list of matches. Note that rate",
        "limits apply per API key; exceeding them returns HTTP 429.",
        "Deprecated since v2 — use /v3/matches instead.",
      ],
      punch:
        "Programmering ÄR läsning: dokumentation, felmeddelanden, andras kod — oftast på engelska. Den som läser långsamt felsöker långsamt.",
    },
    {
      id: "influencer",
      namn: "Influencer",
      vag: "Eget företag från dag ett",
      dok: "Annonsavtal med nätverk",
      utdrag: [
        "Ersättning utgår per påbörjat tusental visningar (CPM)",
        "efter avdrag för ogiltig trafik. Exklusivitet enligt §4",
        "gäller i 90 dagar efter publicering. Vite vid brott: 25 000 kr.",
      ],
      punch:
        "Avtalet är skrivet av motpartens jurist. Den som inte kan läsa §4 upptäcker exklusivitetsklausulen när vitet kommer.",
    },
    {
      id: "polis",
      namn: "Polis",
      vag: "Gymnasieexamen → polisutbildning",
      dok: "Förundersökningsprotokoll",
      utdrag: [
        "Målsäganden uppger att gärningspersonen avvikit i nordlig",
        "riktning. Vittnesuppgift B motsäger detta (se bilaga 3).",
        "Beslut i åtalsfrågan förutsätter komplettering enligt ovan.",
      ],
      punch:
        "Polisyrket är rapportskrivning och protokolläsning varje pass — och varje otydlighet kan fälla ett åtal i rätten.",
    },
    {
      id: "sjukskoterska",
      namn: "Sjuksköterska",
      vag: "Högskola — kräver Svenska 2/3",
      dok: "FASS-text",
      utdrag: [
        "Vid nedsatt njurfunktion (GFR < 30 ml/min) halveras dosen.",
        "Samtidig behandling med NSAID ökar blödningsrisken.",
        "Se avsnitt 4.5 för fullständig interaktionslista.",
      ],
      punch:
        "Här räcker inte nians läsning — högskolan kräver gymnasiets svenska, och FASS-texten är bland det tätaste språk som finns. Dörren bakom dörren.",
    },
    {
      id: "malare",
      namn: "Målare",
      vag: "Bygg- och anläggningsprogrammet, måleri",
      dok: "Produktdatablad, fasadfärg",
      utdrag: [
        "Appliceras vid +5 till +25 °C, relativ luftfuktighet < 80 %.",
        "Torktid vid 23 °C: dammtorr 1 h, övermålningsbar 4 h.",
        "Underlag av kalkputs kräver grundning med produkt 204.",
      ],
      punch:
        "Fel läst datablad = färg som släpper från fasaden nästa vinter. Garantin gäller bara den som följt bladet — alltså läst det.",
    },
    {
      id: "vadsomhelst",
      namn: "… vad som helst",
      vag: "Vuxenlivet, oavsett yrke",
      dok: "Papper som väntar på alla",
      utdrag: [
        "Anställningsavtalet: provanställning, konkurrensklausul.",
        "Hyreskontraktet: uppsägningstid, normalt slitage.",
        "CSN-beslutet: återkrav om studietakten understiger 75 %.",
      ],
      punch:
        "Fyll i vilket yrke som helst — pappren kommer ändå. Vuxenlivets viktigaste dokument är skrivna för den som kan läsa dem, och dyra för den som inte kan.",
    },
  ];

  let valtId = $state("underskoterska");
  const valt = $derived(YRKEN.find((y) => y.id === valtId));
</script>

<div class="valjare">
  <p class="fraga">Välj ditt drömyrke:</p>
  <div class="chips" role="tablist" aria-label="Drömyrken">
    {#each YRKEN as y}
      <button
        role="tab"
        aria-selected={valtId === y.id}
        class:active={valtId === y.id}
        onclick={() => (valtId = y.id)}
      >{y.namn}</button>
    {/each}
  </div>

  <div class="panel">
    <p class="vag">{valt.namn} · <span>{valt.vag}</span></p>

    <div class="dokument">
      <p class="dok-titel">{valt.dok}</p>
      <div class="dok-rader">
        {#each valt.utdrag as rad, i}
          <span class:svar={i === valt.utdrag.length - 1}>{rad}</span>
        {/each}
      </div>
    </div>

    <p class="punch">{valt.punch}</p>
  </div>

  <p class="summering">
    <strong class="noll">Alla tolv.</strong> Det finns inget läsfritt yrke —
    och den som väljer bort läsningen i nian har inte valt bort pappren, bara
    förmågan att läsa dem.
  </p>
</div>

<style>
  .valjare {
    width: 100%;
    max-width: 520px;
  }
  .fraga {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin: 0 0 10px;
  }
  .chips {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }
  .chips button {
    padding: 7px 4px;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    color: var(--text-secondary);
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    line-height: 1.25;
  }
  .chips button:hover {
    color: var(--text-primary);
    border-color: var(--text-muted);
  }
  .chips button.active {
    background: var(--hero-navy);
    border-color: var(--hero-navy);
    color: #ffffff;
  }
  .panel {
    background: var(--surface-1);
    border-radius: 10px;
    padding: 18px 20px;
    box-shadow: 0 2px 12px rgba(22, 40, 58, 0.09);
    min-height: 240px;
  }
  .vag {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    color: var(--series-blue);
    margin: 0 0 12px;
  }
  .vag span {
    color: var(--text-muted);
    font-weight: 600;
  }
  .dokument {
    background: var(--page-plane);
    border-left: 3px solid var(--series-blue);
    border-radius: 0 6px 6px 0;
    padding: 12px 16px;
  }
  .dok-titel {
    margin: 0 0 8px;
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
  }
  .dok-rader {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--text-secondary);
  }
  .dok-rader .svar {
    color: var(--text-primary);
    font-weight: 600;
  }
  .punch {
    margin: 12px 0 0;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-secondary);
  }
  .summering {
    margin: 12px 0 0;
    font-size: 13.5px;
    color: var(--text-secondary);
  }
  .noll {
    color: var(--series-red);
  }
  @media (max-width: 860px) {
    .chips {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
