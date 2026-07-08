// Scarboroughs läsrep (2001): läsning är inte EN färdighet utan åtta trådar
// i två buntar — ordavkodning och språkförståelse — som tvinnas ihop till
// god läsning. Avkodningen ska bli alltmer AUTOMATISK, förståelsen alltmer
// STRATEGISK. Handkurerad svensk tolkning för berättelsen och utforskaren.

export const BUNDLES = {
  sf: {
    label: "Språkförståelse",
    sub: "blir alltmer strategisk",
  },
  avk: {
    label: "Ordavkodning",
    sub: "blir alltmer automatisk",
  },
};

export const STRANDS = [
  {
    id: "bakgrund",
    bundle: "sf",
    label: "Bakgrundskunskap",
    color: "var(--rope-sf-1)",
    desc: "Fakta och begrepp om världen som texten tyst förutsätter. Den som vet vad en riksdag är förstår nyhetsartikeln — den som inte vet läser ord.",
    brist: "Förstår varje ord men inte sammanhanget. Faktatexter i SO och NO blir ogenomträngliga, trots felfri avläsning.",
    tranas: "Bred läsning, högläsning hemma, rika samtal och en kunskapstät undervisning i alla ämnen — inte bara i svenskan.",
  },
  {
    id: "ordforrad",
    bundle: "sf",
    label: "Ordförråd",
    color: "var(--rope-sf-2)",
    desc: "Bredd och djup i ordkunskapen. Skriftspråket är fullt av ord som nästan aldrig sägs högt — de måste mötas i text.",
    brist: "Fastnar på lågfrekventa ord, gissar utifrån sammanhanget och tappar tråden — särskilt i sakprosa.",
    tranas: "Mängdläsning (böcker innehåller orden talet saknar), medvetet ordarbete och samtal om texternas ord.",
  },
  {
    id: "sprakstruktur",
    bundle: "sf",
    label: "Språkstruktur",
    color: "var(--rope-sf-3)",
    desc: "Syntax och grammatik — hur meningar hänger ihop. Skriftspråkets meningar är längre och mer packade än talets.",
    brist: "Klarar korta huvudsatser men tappar bort sig i bisatser, inskott och passiv form: \"beslutet, som fattats av nämnden, överklagades\".",
    tranas: "Möta skriftspråksnära språk tidigt: högläsning ur riktiga böcker, eget skrivande, samtal om hur meningar byggs.",
  },
  {
    id: "resonemang",
    bundle: "sf",
    label: "Verbalt resonemang",
    color: "var(--rope-sf-4)",
    desc: "Att läsa mellan raderna: inferenser, metaforer, ironi. Det viktigaste i en text står ofta inte i texten.",
    brist: "Läser bokstavligt. Missar slutsatser som inte skrivs ut, förstår inte varför en romanfigur handlar som den gör.",
    tranas: "Textsamtal med \"hur vet du det?\"- och \"varför då?\"-frågor, gemensam läsning där tankeleden görs synliga.",
  },
  {
    id: "textkunskap",
    bundle: "sf",
    label: "Textkunskap",
    color: "var(--rope-sf-5)",
    desc: "Att veta hur texter fungerar: att en instruktion läses annorlunda än en berättelse, att tabeller och diagram är text de med.",
    brist: "Angriper alla texter likadant. Hittar inte i läroboken, missar poängen med rubriker, faktarutor och punktlistor.",
    tranas: "Möta och prata om många slags texter — recept, nyheter, sagor, scheman — och skriva i olika genrer.",
  },
  {
    id: "fonologi",
    bundle: "avk",
    label: "Fonologisk medvetenhet",
    color: "var(--rope-avk-1)",
    desc: "Att höra språkets byggstenar: rim, stavelser, enskilda ljud. Grunden för att alls kunna koppla ljud till bokstav.",
    brist: "Hör inte att \"sol\" och \"stol\" rimmar eller vad som blir kvar om s:et tas bort. Läsinlärningen får inget fäste.",
    tranas: "Rim, ramsor och ljudlekar i förskoleklass — och strukturerad fonemträning så fort signalen syns.",
  },
  {
    id: "avkodning",
    bundle: "avk",
    label: "Avkodning",
    color: "var(--rope-avk-2)",
    desc: "Den alfabetiska principen: att ljuda ihop bokstäver till ord. Färdigheten som all läsning står på — och som ska automatiseras.",
    brist: "Läser långsamt och hackigt eller gissar på första bokstaven. All energi går åt till orden — inget blir kvar till innehållet.",
    tranas: "Strukturerad ljudmetod (phonics) och intensiv, riktad träning i liten grupp — bland de mest belagda insatserna i läsforskningen.",
  },
  {
    id: "ordbilder",
    bundle: "avk",
    label: "Ordbilder",
    color: "var(--rope-avk-3)",
    desc: "Automatisk igenkänning av kända ord. Den vana läsaren ljudar inte \"och\" — ordet känns igen som en bild, direkt.",
    brist: "Måste ljuda samma vanliga ord om och om igen. Läsningen flyter aldrig, och flytet är förståelsens förutsättning.",
    tranas: "Mängdläsning på rätt nivå — varje gång ett ord avkodas rätt etsas ordbilden in lite djupare.",
  },
];

// Tråden som "tappas" i experimentsteget.
export const MISSING_STRAND = "avkodning";

export const strandById = new Map(STRANDS.map((s) => [s.id, s]));
