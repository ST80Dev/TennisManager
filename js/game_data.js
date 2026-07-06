// ═══════════════════════════════════════════════════════════════════
// ATP CAREER MANAGER — DATI DI GIOCO
// Costanti e tabelle: ATP400, tornei (TT/CAL), punti, premi, sponsor,
// staff, investimenti, nazioni, zone geografiche e costi di viaggio.
// Script classico (no JSX, no moduli): le dichiarazioni top-level sono
// globali per js/engine.js e per il blocco Babel di index.html.
// Richiede: js/npc_system.js caricato prima. Eseguibile anche in Node.
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// ATP TOP 400 — Fine 2025
// ═══════════════════════════════════════════════════
const ATP400 = [
  // ── TOP 10 ──────────────────────────────────────────────────────────────
  [1,"J. Sinner",23,"🇮🇹"],[2,"C. Alcaraz",22,"🇪🇸"],[3,"N. Djokovic",38,"🇷🇸"],
  [4,"A. Zverev",28,"🇩🇪"],[5,"D. Medvedev",29,"🇷🇺"],[6,"C. Ruud",26,"🇳🇴"],
  [7,"H. Rune",22,"🇩🇰"],[8,"A. Rublev",27,"🇷🇺"],[9,"T. Fritz",27,"🇺🇸"],
  [10,"U. Humbert",27,"🇫🇷"],
  // ── 11-20 ───────────────────────────────────────────────────────────────
  [11,"S. Tsitsipas",27,"🇬🇷"],[12,"F. Tiafoe",27,"🇺🇸"],[13,"G. Dimitrov",34,"🇧🇬"],
  [14,"L. Musetti",23,"🇮🇹"],[15,"A. de Minaur",26,"🇦🇺"],[16,"T. Paul",27,"🇺🇸"],
  [17,"S. Wawrinka",40,"🇨🇭"],[18,"K. Khachanov",28,"🇷🇺"],[19,"B. Shelton",23,"🇺🇸"],
  [20,"L. Sonego",29,"🇮🇹"],
  // ── 21-30 ───────────────────────────────────────────────────────────────
  [21,"F. Cerundolo",26,"🇦🇷"],[22,"J. Mensik",19,"🇨🇿"],[23,"M. Arnaldi",24,"🇮🇹"],
  [24,"A. Bublik",28,"🇰🇿"],[25,"F. Cobolli",23,"🇮🇹"],[26,"S. Baez",24,"🇦🇷"],
  [27,"N. Borges",28,"🇵🇹"],[28,"R. Hijikata",24,"🇦🇺"],[29,"M. Giron",31,"🇺🇸"],
  [30,"J. Draper",24,"🇬🇧"],
  // ── 31-40 ───────────────────────────────────────────────────────────────
  [31,"J. Lehecka",24,"🇨🇿"],[32,"A. Vukic",29,"🇦🇺"],[33,"B. van de Zandschulp",29,"🇳🇱"],
  [34,"Q. Halys",28,"🇫🇷"],[35,"D. Galan",28,"🇨🇴"],[36,"M. Kecmanovic",25,"🇷🇸"],
  [37,"M. Berrettini",29,"🇮🇹"],[38,"L. Pouille",31,"🇫🇷"],[39,"J. Kubler",32,"🇦🇺"],
  [40,"A. Mannarino",37,"🇫🇷"],
  // ── 41-50 ───────────────────────────────────────────────────────────────
  [41,"C. Taberner",28,"🇪🇸"],[42,"Y. Nishioka",29,"🇯🇵"],[43,"L. Djere",29,"🇷🇸"],
  [44,"C. Norrie",29,"🇬🇧"],[45,"R. Safiullin",28,"🇷🇺"],[46,"S. Kwon",29,"🇰🇷"],
  [47,"J. Sousa",36,"🇵🇹"],[48,"B. Bonzi",29,"🇫🇷"],[49,"F. Auger-Aliassime",24,"🇨🇦"],
  [50,"J. Struff",35,"🇩🇪"],
  // ── 51-60 ───────────────────────────────────────────────────────────────
  [51,"T. Machac",24,"🇨🇿"],[52,"A. Davidovich Fokina",26,"🇪🇸"],[53,"J. Fearnley",23,"🇬🇧"],
  [54,"N. Jarry",29,"🇨🇱"],[55,"D. Thiem",31,"🇦🇹"],[56,"Z. Zhang",28,"🇨🇳"],
  [57,"C. Moutet",26,"🇫🇷"],[58,"M. Fucsovics",33,"🇭🇺"],[59,"O. Virtanen",24,"🇫🇮"],
  [60,"A. Michelsen",21,"🇺🇸"],
  // ── 61-70 ───────────────────────────────────────────────────────────────
  [61,"M. Mmoh",28,"🇺🇸"],[62,"F. Comesana",25,"🇦🇷"],[63,"E. Navarro",23,"🇺🇸"],
  [64,"T. Griekspoor",29,"🇳🇱"],[65,"C. Garin",29,"🇨🇱"],[66,"L. Darderi",23,"🇮🇹"],
  [67,"N. Kyrgios",30,"🇦🇺"],[68,"D. Lajovic",34,"🇷🇸"],[69,"M. Purcell",29,"🇦🇺"],
  [70,"A. Popyrin",25,"🇦🇺"],
  // ── 71-80 ───────────────────────────────────────────────────────────────
  [71,"J. Munar",28,"🇪🇸"],[72,"R. Peniston",28,"🇬🇧"],[73,"T. Barrios Vera",25,"🇨🇱"],
  [74,"O. Otte",32,"🇩🇪"],[75,"L. Klein",27,"🇸🇰"],[76,"A. Fils",21,"🇫🇷"],
  [77,"H. Gaston",24,"🇫🇷"],[78,"A. Shevchenko",25,"🇰🇿"],[79,"P. Kotov",25,"🇷🇺"],
  [80,"T. Etcheverry",25,"🇦🇷"],
  // ── 81-90 ───────────────────────────────────────────────────────────────
  [81,"M. Ymer",26,"🇸🇪"],[82,"J. Rodionov",26,"🇦🇹"],[83,"F. Bagnis",35,"🇦🇷"],
  [84,"T. Seyboth Wild",24,"🇧🇷"],[85,"A. Rinderknech",30,"🇫🇷"],[86,"M. Trungelliti",34,"🇦🇷"],
  [87,"P. Cachin",30,"🇦🇷"],[88,"I. Gakhov",26,"🇷🇺"],[89,"M. Bellucci",26,"🇧🇷"],
  [90,"H. Dart",28,"🇬🇧"],
  // ── 91-100 ──────────────────────────────────────────────────────────────
  [91,"N. Basilashvili",33,"🇬🇪"],[92,"F. Lopez",43,"🇪🇸"],[93,"R. Berankis",35,"🇱🇹"],
  [94,"T. Monteiro",30,"🇧🇷"],[95,"J. Vesely",31,"🇨🇿"],[96,"A. Zuber",28,"🇨🇭"],
  [97,"M. Klizan",36,"🇸🇰"],[98,"R. Bemelmans",36,"🇧🇪"],[99,"C. Eubanks",28,"🇺🇸"],
  [100,"P. Martinez",28,"🇪🇸"],
  // ── 101-110 ─────────────────────────────────────────────────────────────
  [101,"A. Cazaux",23,"🇫🇷"],[102,"B. Zapata Miralles",28,"🇪🇸"],[103,"D. Altmaier",26,"🇩🇪"],
  [104,"J. Zeppieri",23,"🇮🇹"],[105,"M. Skatov",22,"🇰🇿"],[106,"V. Kopriva",29,"🇨🇿"],
  [108,"E. Ymer",28,"🇸🇪"],[109,"F. Passaro",23,"🇮🇹"],
  [110,"G. Barrere",30,"🇫🇷"],
  // ── 111-120 ─────────────────────────────────────────────────────────────
  [111,"N. Okala",22,"🇫🇷"],[112,"A. Ramos-Vinolas",37,"🇪🇸"],[113,"T. Atmane",22,"🇫🇷"],
  [114,"H. Grenier",29,"🇫🇷"],[115,"Y. Hanfmann",33,"🇩🇪"],[116,"G. Arnaldi",22,"🇮🇹"],
  [117,"J. Chardy",37,"🇫🇷"],[118,"O. Ciuca",25,"🇷🇴"],[119,"F. Reboul",27,"🇫🇷"],
  [120,"N. Gombos",35,"🇸🇰"],
  // ── 121-130 ─────────────────────────────────────────────────────────────
  [121,"D. Kudla",33,"🇺🇸"],[122,"G. Blancaneaux",26,"🇫🇷"],[123,"L. Broady",31,"🇬🇧"],
  [125,"J. Haerteis",26,"🇩🇪"],[126,"M. Guinard",26,"🇫🇷"],
  [127,"E. Ruusuvuori",26,"🇫🇮"],[128,"T. Purcell",30,"🇦🇺"],[129,"Z. Bergs",26,"🇧🇪"],
    // ── 131-140 ─────────────────────────────────────────────────────────────
  [131,"A. Pellegrino",32,"🇮🇹"],[132,"M. Cressy",28,"🇺🇸"],[133,"G. Mager",30,"🇮🇹"],
  [134,"C. Broom",26,"🇬🇧"],[136,"L. Nardi",21,"🇮🇹"],
  [137,"A. Tabilo",27,"🇨🇱"],[138,"D. Masur",32,"🇩🇪"],[139,"N. Kuhn",27,"🇩🇪"],
  [140,"B. Coric",28,"🇭🇷"],
  // ── 141-150 ─────────────────────────────────────────────────────────────
  [141,"O. Crawford",27,"🇦🇺"],[142,"P. Jubb",27,"🇬🇧"],[143,"T. Choinski",26,"🇬🇧"],
  [144,"L. Harris",33,"🇿🇦"],[145,"M. Janvier",26,"🇫🇷"],[146,"J. Fognini",37,"🇮🇹"],
  [147,"S. Napolitano",30,"🇮🇹"],[148,"D. Novak",37,"🇦🇹"],[149,"M. Pucinelli de Almeida",22,"🇧🇷"],
  [150,"T. Daniell",31,"🇳🇿"],
  // ── 151-160 ─────────────────────────────────────────────────────────────
  [151,"A. Seppi",40,"🇮🇹"],[152,"M. Jaziri",40,"🇹🇳"],  [154,"I. Marchenko",35,"🇺🇦"],[155,"H. Laaksonen",33,"🇨🇭"],  [157,"A. Karatsev",31,"🇷🇺"],[158,"S. Ofner",28,"🇦🇹"],[159,"L. Vanni",35,"🇮🇹"],
  [160,"J. Simón",40,"🇦🇷"],
  // ── 161-170 ─────────────────────────────────────────────────────────────
  [161,"M. Bolelli",34,"🇮🇹"],[162,"P. Carreño Busta",34,"🇪🇸"],[163,"A. Molcan",25,"🇸🇰"],
  [164,"R. Quiroz",28,"🇪🇨"],[166,"G. Lopez",42,"🇪🇸"],
  [167,"C. Hemery",30,"🇫🇷"],[168,"A. Hoang",30,"🇫🇷"],[169,"J. Sock",32,"🇺🇸"],
  [170,"P. Polansky",36,"🇨🇦"],
  // ── 171-180 ─────────────────────────────────────────────────────────────
  [171,"M. Giustino",32,"🇮🇹"],[172,"H. Mayot",22,"🇫🇷"],[173,"T. Kokkinakis",29,"🇦🇺"],
  [174,"B. Holt",33,"🇬🇧"],[175,"A. Bedene",35,"🇸🇮"],[176,"L. Rosol",39,"🇨🇿"],
  [177,"Y. Watanuki",28,"🇯🇵"],[178,"S. Galovic",27,"🇭🇷"],[179,"T. Fabbiano",35,"🇮🇹"],
  [180,"R. Haase",38,"🇳🇱"],
  // ── 181-190 ─────────────────────────────────────────────────────────────
  [182,"J. Tsurenko",25,"🇺🇦"],  [184,"S. Caruso",32,"🇮🇹"],[185,"G. Pella",35,"🇦🇷"],[186,"N. Lorenzi",37,"🇮🇹"],
  [187,"A. Kuznetsov",32,"🇷🇺"],[188,"T. Robred",29,"🇩🇰"],[189,"A. Vasilevski",27,"🇱🇻"],
  [190,"J. Duckworth",33,"🇦🇺"],
  // ── 191-200 ─────────────────────────────────────────────────────────────
  [191,"J. Brooksby",25,"🇺🇸"],[192,"G. Simon",40,"🇫🇷"],[193,"S. Stakhovsky",39,"🇺🇦"],
  [194,"T. Kamke",38,"🇩🇪"],[195,"M. Zverev",28,"🇩🇪"],[196,"A. Bolt",30,"🇦🇺"],
  [197,"Y. Lu",31,"🇹🇼"],[199,"J. Ward",39,"🇬🇧"],
  [200,"T. Smyczek",35,"🇺🇸"],
];

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const STAT_KEYS = ["servizio","dritto","rovescio","volee","velocita","resistenza","mentale"];
const STAT_LABELS = {servizio:"Servizio",dritto:"Dritto",rovescio:"Rovescio",volee:"Volee",velocita:"Velocità",resistenza:"Resistenza",mentale:"Mentale"};
const STAT_ICONS = {servizio:"🎾",dritto:"💥",rovescio:"🔄",volee:"🥅",velocita:"⚡",resistenza:"💪",mentale:"🧠"};
const SURF_COL = {Cemento:"#3b8fd4","Terra Rossa":"#c1440e",Erba:"#1a7a3c"};
const SURF_COURT = {
  Cemento:      {court:"#2a6099", line:"#e8f4fd", service:"#1d4f7a", baseline:"#1a3f65"},
  "Terra Rossa":{court:"#b03a0c", line:"#f5e6d8", service:"#8a2d09", baseline:"#6e2307"},
  Erba:         {court:"#1a6b30", line:"#f0faf2", service:"#145525", baseline:"#0f4020"},
};
const NATS=[
  {c:"ITA",f:"🇮🇹",n:"Italia",       z:"Europa"},
  {c:"ESP",f:"🇪🇸",n:"Spagna",        z:"Europa"},
  {c:"FRA",f:"🇫🇷",n:"Francia",       z:"Europa"},
  {c:"GER",f:"🇩🇪",n:"Germania",      z:"Europa"},
  {c:"GBR",f:"🇬🇧",n:"Gran Bretagna", z:"Europa"},
  {c:"SRB",f:"🇷🇸",n:"Serbia",        z:"Europa"},
  {c:"AUT",f:"🇦🇹",n:"Austria",       z:"Europa"},
  {c:"CZE",f:"🇨🇿",n:"Rep. Ceca",     z:"Europa"},
  {c:"POL",f:"🇵🇱",n:"Polonia",       z:"Europa"},
  {c:"SVK",f:"🇸🇰",n:"Slovacchia",    z:"Europa"},
  {c:"HUN",f:"🇭🇺",n:"Ungheria",      z:"Europa"},
  {c:"ROU",f:"🇷🇴",n:"Romania",       z:"Europa"},
  {c:"BUL",f:"🇧🇬",n:"Bulgaria",      z:"Europa"},
  {c:"CRO",f:"🇭🇷",n:"Croazia",       z:"Europa"},
  {c:"BEL",f:"🇧🇪",n:"Belgio",        z:"Europa"},
  {c:"NED",f:"🇳🇱",n:"Olanda",        z:"Europa"},
  {c:"SWE",f:"🇸🇪",n:"Svezia",        z:"Europa"},
  {c:"DEN",f:"🇩🇰",n:"Danimarca",     z:"Europa"},
  {c:"SUI",f:"🇨🇭",n:"Svizzera",      z:"Europa"},
  {c:"POR",f:"🇵🇹",n:"Portogallo",    z:"Europa"},
  {c:"GRE",f:"🇬🇷",n:"Grecia",        z:"Europa"},
  {c:"RUS",f:"🇷🇺",n:"Russia",        z:"Europa"},
  {c:"USA",f:"🇺🇸",n:"USA",           z:"Americas"},
  {c:"ARG",f:"🇦🇷",n:"Argentina",     z:"Americas"},
  {c:"BRA",f:"🇧🇷",n:"Brasile",       z:"Americas"},
  {c:"CHI",f:"🇨🇱",n:"Cile",          z:"Americas"},
  {c:"COL",f:"🇨🇴",n:"Colombia",      z:"Americas"},
  {c:"CAN",f:"🇨🇦",n:"Canada",        z:"Americas"},
  {c:"AUS",f:"🇦🇺",n:"Australia",     z:"Asia-Pacifico"},
  {c:"JPN",f:"🇯🇵",n:"Giappone",      z:"Asia-Pacifico"},
  {c:"KOR",f:"🇰🇷",n:"Corea del Sud", z:"Asia-Pacifico"},
  {c:"CHN",f:"🇨🇳",n:"Cina",          z:"Asia-Pacifico"},
  {c:"KAZ",f:"🇰🇿",n:"Kazakhstan",    z:"Asia-Pacifico"},
  {c:"RSA",f:"🇿🇦",n:"Sud Africa",    z:"Africa-MO"},
  {c:"MAR",f:"🇲🇦",n:"Marocco",        z:"Africa-MO"},
  {c:"EGY",f:"🇪🇬",n:"Egitto",         z:"Africa-MO"},
  {c:"TUN",f:"🇹🇳",n:"Tunisia",        z:"Africa-MO"},
  {c:"ISR",f:"🇮🇱",n:"Israele",        z:"Africa-MO"},
  {c:"UAE",f:"🇦🇪",n:"Emirati Arabi",  z:"Africa-MO"},
  {c:"MEX",f:"🇲🇽",n:"Messico",        z:"Americas"},
  {c:"URU",f:"🇺🇾",n:"Uruguay",        z:"Americas"},
  {c:"PER",f:"🇵🇪",n:"Perù",           z:"Americas"},
  {c:"ECU",f:"🇪🇨",n:"Ecuador",        z:"Americas"},
  {c:"IND",f:"🇮🇳",n:"India",          z:"Asia-Pacifico"},
  {c:"THA",f:"🇹🇭",n:"Thailandia",     z:"Asia-Pacifico"},
  {c:"TPE",f:"🇹🇼",n:"Taiwan",         z:"Asia-Pacifico"},
  {c:"NZL",f:"🇳🇿",n:"Nuova Zelanda",  z:"Asia-Pacifico"},
  {c:"UZB",f:"🇺🇿",n:"Uzbekistan",     z:"Asia-Pacifico"},
];
function getZoneMult(fz,tz){
  if(!fz||fz===tz)return 0.30;
  const vl=[["Americas","Asia-Pacifico"],["Asia-Pacifico","Americas"],["Americas","Africa-MO"],["Africa-MO","Americas"]];
  if(vl.some(([a,b])=>a===fz&&b===tz))return 2.00;
  return 1.00; // zona adiacente: costo base pieno, senza sovrapprezzo
}
function calcTravelCost(base,fz,tz){return Math.round(base*getZoneMult(fz,tz));}
// Fatica jet lag: dipende dalla distanza e dal budget del giocatore
// Zona vicina: +12%, Intercontinentale: +22% base, ridotto dal comfort (ogni €5k = -1%, max -5%)
function calcJetLag(fz,tz,budget){
  if(!fz||fz===tz)return 0;
  const vl=[["Americas","Asia-Pacifico"],["Asia-Pacifico","Americas"],["Americas","Africa-MO"],["Africa-MO","Americas"]];
  const isInter=vl.some(([a,b])=>a===fz&&b===tz);
  if(isInter){const comfort=Math.min(5,Math.floor((budget||0)/5000));return 18-comfort;}
  return 10;
}

// ── NPC SYSTEM — vedi npc_system.js ──────────────────────────────────
// Archetipi, lifecycle, talento, fasi di carriera e ritiro anticipato
// sono esternalizzati in npc_system.js (caricato prima del blocco Babel).
// Qui destrutturiamo i simboli esportati sotto i vecchi nomi.
if(!window.NPC_SYSTEM){throw new Error("NPC_SYSTEM non caricato: verificare <script src=\"npc_system.js\">");}
const NPC_ARCHETYPES       = window.NPC_SYSTEM.ARCHETYPES;
const NPC_FIXED_ARCHETYPE  = window.NPC_SYSTEM.FIXED_ARCHETYPE;
const getNPCArchetype      = window.NPC_SYSTEM.getArchetype;
const calcFormMult         = window.NPC_SYSTEM.calcFormMult;
// Stato runtime (persistito in save)
const npcForm = {};          // {[npcId]: float 0.75-1.20}
const npcPersonalLevel = {}; // {[npcId]: float}  — attrattore MR
const npcCareerPhase = {};   // {[npcId]: "steady"|"breakthrough"|"slump"}
const npcYearsOutside150 = {}; // {[npcId]: int}
const npcYearsOutside250 = {}; // {[npcId]: int}
const TRAVEL_COSTS_BASE={Slam:8000,M1000:4000,ATP500:2000,ATPFinals:2000,ATP250:1200,ChallengerA:550,ChallengerB:380,ITF:200};
const ENTRY_FEE={ITF:30,ChallengerB:80,ChallengerA:300,ATP250:1000,ATP500:2700,ATPFinals:2700,M1000:6000,Slam:10000};
const LODGE_BASE={ChallengerA:100,ChallengerB:75,ITF:50,ATP250:400,ATP500:1000,ATPFinals:1000,M1000:2500,Slam:5000};
const LODGE_COLLAB={ChallengerA:40,ChallengerB:20,ITF:10,ATP250:70,ATP500:150,ATPFinals:150,M1000:350,Slam:700};

const TOUR_FLAG={
  // Grand Slam
  "Australian Open":"🇦🇺","Roland Garros":"🇫🇷","Wimbledon":"🇬🇧","US Open":"🇺🇸",
  // Masters 1000
  "Indian Wells Masters":"🇺🇸","Miami Open":"🇺🇸","Monte-Carlo Masters":"🇲🇨",
  "Madrid Open":"🇪🇸","Italian Open":"🇮🇹","Canadian Open":"🇨🇦",
  "Cincinnati Masters":"🇺🇸","Shanghai Masters":"🇨🇳","Paris Masters":"🇫🇷",
  // ATP 500
  "Rotterdam Open":"🇳🇱","Dubai Tennis Championships":"🇦🇪","Acapulco Open":"🇲🇽",
  "Barcelona Open":"🇪🇸","Hamburg Open":"🇩🇪","Vienna Open":"🇦🇹",
  "Basel Indoor":"🇨🇭","Beijing Open":"🇨🇳","Tokyo Indoor":"🇯🇵",
  "Washington Open":"🇺🇸","Halle Open":"🇩🇪","Queen's Club":"🇬🇧",
  // ATP 250 (principali)
  "Brisbane International":"🇦🇺","Auckland Open":"🇳🇿","Adelaide International":"🇦🇺","Hong Kong Open":"🇭🇰",
  "Montpellier Open":"🇫🇷","Cordoba Open":"🇦🇷","Dallas Open":"🇺🇸",
  "Buenos Aires Open":"🇦🇷","Delray Beach Open":"🇺🇸","Open Sud de France":"🇫🇷",
  "Sofia Open":"🇧🇬","Marseille Open":"🇫🇷","Doha Open":"🇶🇦",
  "Santiago Open":"🇨🇱","Estoril Open":"🇵🇹","Munich Open":"🇩🇪",
  "Geneva Open":"🇨🇭","Lyon Open":"🇫🇷","Eastbourne International":"🇬🇧",
  "Mallorca Championships":"🇪🇸","Newport Open":"🇺🇸","Umag Open":"🇭🇷",
  "Kitzbuhel Open":"🇦🇹","Los Cabos Open":"🇲🇽","Winston-Salem Open":"🇺🇸",
  "Chengdu Open":"🇨🇳","Hangzhou Open":"🇨🇳","Zhuhai Championships":"🇨🇳",
  "Stockholm Open":"🇸🇪","Antwerp Open":"🇧🇪","Gijon Open":"🇪🇸",
  "Canberra Challenger":"🇦🇺","Traralgon Challenger":"🇦🇺","Pune Challenger":"🇮🇳",
  "Bengaluru Challenger":"🇮🇳","Murcia Challenger":"🇪🇸","Phoenix Challenger":"🇺🇸",
  "Ismaning Challenger":"🇩🇪","Lima Challenger":"🇵🇪","Santiago Challenger":"🇨🇱",
  "Lille Challenger":"🇫🇷","Casablanca Challenger":"🇲🇦","Bogota Challenger":"🇨🇴",
  "Marbella Challenger":"🇪🇸","Barletta Challenger":"🇮🇹","Kosice Challenger":"🇸🇰",
  "Lyon Challenger":"🇫🇷","Parma Challenger":"🇮🇹","Perugia Challenger":"🇮🇹",
  "Bergamo Challenger":"🇮🇹","Verona Challenger":"🇮🇹","Prostejov Challenger":"🇨🇿",
  "Bucarest Challenger":"🇷🇴","Szczecin Challenger":"🇵🇱","Zagreb Challenger":"🇭🇷",
  "Brno Challenger":"🇨🇿","Augsburg Challenger":"🇩🇪",
  "Poznan Challenger":"🇵🇱","Surbiton Challenger":"🇬🇧","Nottingham Challenger":"🇬🇧",
  "Ilkley Challenger":"🇬🇧","Brest Challenger":"🇫🇷","Croissy Challenger":"🇫🇷",
  "Mouilleron Challenger":"🇫🇷","Mouilleron-le-Captif Chall":"🇫🇷",
  "Newport Challenger":"🇺🇸","Granby Challenger":"🇨🇦","Columbus Challenger":"🇺🇸",
  "Medellin Challenger":"🇨🇴","Asuncion Challenger":"🇵🇾","Winnipeg Challenger":"🇨🇦",
  "Indianapolis Challenger":"🇺🇸",
  "Savannah Challenger":"🇺🇸","Tallahassee Challenger":"🇺🇸","Lexington Challenger":"🇺🇸",
  "Orlando Challenger":"🇺🇸","Adelanto Challenger":"🇺🇸","Tenerife Challenger":"🇪🇸",
  "Montevideo Challenger":"🇺🇾","Almaty Challenger":"🇰🇿","Astana Challenger":"🇰🇿",
  "Astana Challenger":"🇰🇿",
  // Challenger Africa-MO
  "Nairobi Challenger":"🇰🇪","Nairobi Challenger A":"🇰🇪","Nairobi B Challenger":"🇰🇪",
  "Cairo Challenger":"🇪🇬","Cairo Open Challenger":"🇪🇬","Alexandria Challenger":"🇪🇬",
  "Casablanca Challenger A":"🇲🇦","Casablanca B Challenger":"🇲🇦",
  "Agadir Challenger":"🇲🇦","Fes Challenger":"🇲🇦",
  "Marrakech Challenger":"🇲🇦","Marrakech Open":"🇲🇦",
  "Meknes Challenger":"🇲🇦","Rabat Challenger":"🇲🇦","Rabat B Challenger":"🇲🇦",
  "Monastir Challenger":"🇹🇳","Tunis Challenger":"🇹🇳","Tunis Open Challenger":"🇹🇳",
  "Tunis Challenger A":"🇹🇳","Tunis Challenger B":"🇹🇳","Tunis B Challenger":"🇹🇳",
  "Sousse Challenger":"🇹🇳","Sfax Challenger":"🇹🇳",
  "Abidjan Challenger":"🇨🇮","Dakar Challenger":"🇸🇳","Accra Challenger":"🇬🇭",
  "Kampala Challenger":"🇺🇬","Mombasa Challenger":"🇰🇪","Entebbe Challenger":"🇺🇬",
  "Amman Challenger":"🇯🇴","Algeri Challenger":"🇩🇿",
  "Johannesburg Challenger":"🇿🇦",
  // Challenger Americas
  "Buenos Aires Challenger":"🇦🇷","Bogota B Challenger":"🇨🇴",
  "Guayaquil Challenger":"🇪🇨","Cancun Challenger":"🇲🇽",
  "Lima Challenger A":"🇵🇪",
  "Houston Challenger":"🇺🇸","Houston Open":"🇺🇸","Dallas Challenger":"🇺🇸",
  "Atlanta Challenger":"🇺🇸","Atlanta B Challenger":"🇺🇸",
  "Champaign Challenger":"🇺🇸","Knoxville Challenger":"🇺🇸",
  "Lexington B Challenger":"🇺🇸","Winnetka Challenger":"🇺🇸","Sarasota Challenger":"🇺🇸",
  // Challenger Europa
  "Biella Challenger":"🇮🇹","Genova Challenger":"🇮🇹","Torino Challenger":"🇮🇹",
  "Ortisei Challenger":"🇮🇹","Cordenons Challenger":"🇮🇹",
  "Stuttgart Challenger":"🇩🇪","Salzburg Challenger":"🇦🇹",
  "Bratislava Challenger":"🇸🇰","Prague Challenger":"🇨🇿",
  "Gstaad Open":"🇨🇭",
  "Maiorca Open":"🇪🇸","Umago Open":"🇭🇷","Bastad Open":"🇸🇪",
  "Metz Open":"🇫🇷",
  // Challenger Asia-Pacifico
  "Bangkok Challenger":"🇹🇭","Kuala Lumpur Challenger":"🇲🇾","Kuala Lumpur Open":"🇲🇾",
  "Taipei Challenger":"🇹🇼","Taipei Challenger B":"🇹🇼","Taipei B Challenger":"🇹🇼",
  "Chiang Rai Challenger":"🇹🇭","Ho Chi Minh Challenger":"🇻🇳","Hanoi Challenger":"🇻🇳",
  "Pattaya Challenger":"🇹🇭",
  "Manila Challenger":"🇵🇭","Busan Challenger":"🇰🇷","Seoul Challenger":"🇰🇷",
  "Incheon Challenger":"🇰🇷","Gwangju Challenger":"🇰🇷",
  "Osaka Challenger":"🇯🇵","Nagoya Challenger":"🇯🇵","Yokohama Challenger":"🇯🇵",
  "Fukuoka Challenger":"🇯🇵",
  "Tokyo Indoor":"🇯🇵","Japan Open Tokyo":"🇯🇵","Seoul Open":"🇰🇷",
  "Guangzhou Challenger":"🇨🇳","Shenzhen Challenger":"🇨🇳","Wuhan Challenger":"🇨🇳",
  "Hangzhou Open":"🇨🇳","Nanchang Open":"🇨🇳",
  "Sydney Challenger":"🇦🇺",
  "Almaty Challenger A":"🇰🇿","Almaty Open":"🇰🇿","Aktau Challenger":"🇰🇿",
  "Tashkent Challenger":"🇺🇿",
  // ITF Europa
  "Milano ITF":"🇮🇹","Madrid ITF":"🇪🇸","Praga ITF":"🇨🇿","Varsavia ITF":"🇵🇱",
  "Roma ITF":"🇮🇹","Barcellona ITF":"🇪🇸","Vienna ITF":"🇦🇹","Amsterdam ITF":"🇳🇱",
  "Berlino ITF":"🇩🇪","Budapest ITF":"🇭🇺","Belgrado ITF":"🇷🇸","Lione ITF":"🇫🇷",
  "Londra ITF":"🇬🇧","Bucarest ITF":"🇷🇴",
  // ITF Americas
  "Bogota ITF":"🇨🇴","Lima ITF":"🇵🇪","Santiago ITF":"🇨🇱","Buenos Aires ITF":"🇦🇷",
  "Caracas ITF":"🇻🇪","Miami ITF":"🇺🇸","Houston ITF":"🇺🇸","New York ITF":"🇺🇸",
  "Los Angeles ITF":"🇺🇸","Montreal ITF":"🇨🇦","Città del Messico ITF":"🇲🇽",
  "San Paolo ITF":"🇧🇷","Asuncion ITF":"🇵🇾","Montevideo ITF":"🇺🇾",
  // ITF Asia-Pacifico
  "Bangkok ITF":"🇹🇭","Jakarta ITF":"🇮🇩","Kuala Lumpur ITF":"🇲🇾","Seoul ITF":"🇰🇷",
  "Tokyo ITF":"🇯🇵","Mumbai ITF":"🇮🇳","Manila ITF":"🇵🇭","Shanghai ITF":"🇨🇳",
  "Auckland ITF":"🇳🇿","Melbourne ITF":"🇦🇺","Ho Chi Minh ITF":"🇻🇳","Osaka ITF":"🇯🇵",
  "Taipei ITF":"🇹🇼","Bangalore ITF":"🇮🇳",
  // ITF Africa-MO
  "Cairo ITF":"🇪🇬","Casablanca ITF":"🇲🇦","Tunisi ITF":"🇹🇳","Nairobi ITF":"🇰🇪",
  "Dakar ITF":"🇸🇳","Marrakech ITF":"🇲🇦","Algeri ITF":"🇩🇿","Johannesburg ITF":"🇿🇦",
  "Accra ITF":"🇬🇭","Rabat ITF":"🇲🇦","Kampala ITF":"🇺🇬","Abidjan ITF":"🇨🇮",
  "Amman ITF":"🇯🇴","Mombasa ITF":"🇰🇪",
  // ATP / altri mancanti
  "Bogota Open":"🇨🇴","Atlanta Open":"🇺🇸",
  "Tunisi Open":"🇹🇳","Casablanca Open":"🇲🇦","Rabat Open":"🇲🇦","Accra Open":"🇬🇭","Amman Open":"🇯🇴",
  "Shenzhen Open":"🇨🇳","Cairo Open":"🇪🇬",
  "Rio Open":"🇧🇷","Dubai Championships":"🇦🇪","Italian Open Roma":"🇮🇹",
  "New Haven Open":"🇺🇸","Newport Hall of Fame":"🇺🇸",
  "ATP Finals":"🇬🇧",
};
function getTourFlag(name){return TOUR_FLAG[name]||"🎾";}

// TOUR_CITY: nome citta per torneo
const TOUR_CITY={
  "Australian Open":"Melbourne","Roland Garros":"Parigi","Wimbledon":"Londra",
  "US Open":"New York","Indian Wells Masters":"Indian Wells","Miami Open":"Miami",
  "Monte Carlo Masters":"Monte Carlo","Madrid Open":"Madrid","Italian Open Roma":"Roma",
  "Canadian Open":"Toronto","Western & Southern Open":"Cincinnati",
  "Shanghai Masters":"Shanghai","Paris Masters":"Parigi","ATP Finals":"Londra",
  "Rotterdam Open":"Rotterdam","Dubai Championships":"Dubai","Acapulco Open":"Acapulco",
  "Rio Open":"Rio de Janeiro","Buenos Aires Open":"Buenos Aires",
  "Delray Beach Open":"Delray Beach","Open Sud de France":"Montpellier",
  "Marseille Open":"Marsiglia","Sofia Open":"Sofia","Doha Open":"Doha",
  "Dallas Open":"Dallas","Montpellier Open":"Montpellier","Cordoba Open":"Cordoba",
  "Houston Open":"Houston","Barcelona Open":"Barcellona","Munich Open":"Monaco",
  "Geneva Open":"Ginevra","Lyon Open":"Lione","Eastbourne International":"Eastbourne",
  "Mallorca Championships":"Maiorca","Newport Open":"Newport",
  "Washington Open":"Washington","Los Cabos Open":"Los Cabos",
  "Winston-Salem Open":"Winston-Salem","Chengdu Open":"Chengdu",
  "Hangzhou Open":"Hangzhou","Zhuhai Championships":"Zhuhai",
  "Kuala Lumpur Open":"Kuala Lumpur","Nanchang Open":"Nanchang",
  "Bucarest Challenger":"Bucarest","Szczecin Challenger":"Szczecin",
  "Zagreb Challenger":"Zagabria","Brno Challenger":"Brno","Augsburg Challenger":"Augsburg",
  "Medellin Challenger":"Medellin","Asuncion Challenger":"Asuncion",
  "Winnipeg Challenger":"Winnipeg","Indianapolis Challenger":"Indianapolis",
  "Agadir Challenger":"Agadir","Fes Challenger":"Fes","Sfax Challenger":"Sfax",
  "Alexandria Challenger":"Alessandria d'Egitto","Entebbe Challenger":"Entebbe",
  "Incheon Challenger":"Incheon","Gwangju Challenger":"Gwangju",
  "Wuhan Challenger":"Wuhan","Fukuoka Challenger":"Fukuoka",
  "Pattaya Challenger":"Pattaya","Aktau Challenger":"Aktau","Hanoi Challenger":"Hanoi",
  "Japan Open Tokyo":"Tokyo","Seoul Open":"Seoul","Almaty Open":"Almaty",
  "Vienna Open":"Vienna","Stockholm Open":"Stoccolma","Antwerp Open":"Anversa",
  "Basel Indoor":"Basilea","Kitzbuhel Open":"Kitzbuhel","Gstaad Open":"Gstaad",
  "Marrakech Open":"Marrakech","Umag Open":"Umago","Bastad Open":"Bastad",
  "Bogota Open":"Bogotá","Atlanta Open":"Atlanta","Rabat Open":"Rabat","Accra Open":"Accra","Amman Open":"Amman","Shenzhen Open":"Shenzhen","Cairo Open":"Il Cairo",
  "Tunisi Open":"Tunisi","Casablanca Open":"Casablanca",
  "Metz Open":"Metz","Gijon Open":"Gijon","Lyon Challenger":"Lione",
};
function getTourCity(name){
  if(TOUR_CITY[name]) return TOUR_CITY[name];
  // Fallback: rimuovi suffissi comuni e restituisci prima parte
  // Rimuovi prima 'B/A Challenger' (con word boundary), poi altri suffissi
  return name
    .replace(/\s+[AB]\s+(Challenger|Chall).*$/i,"")
    .replace(/\s+(Open|Challenger|Chall|Masters|Championships|International|Indoor).*$/i,"")
    .trim()||name;
}

// TRAVEL LEVEL:
// 0=stesso torneo, 1=auto(stessa nazione), 2=treno(stessa zona naz.diversa),
// 3=aereo+auto(zone adiacenti), 4=aereo lungo raggio(intercontinentale)
function getTravelLevel(fromTourName,toTourName,fromZone,toZone){
  if(!fromTourName) return 3;
  if(fromTourName===toTourName) return 0;
  const fromFlag=TOUR_FLAG[fromTourName]||"";
  const toFlag=TOUR_FLAG[toTourName]||"";
  const sameZone=fromZone===toZone;
  const sameNation=fromFlag&&toFlag&&fromFlag===toFlag;
  if(sameZone&&sameNation) return 1;
  if(sameZone&&!sameNation) return 2;
  const intercont=[["Americas","Asia-Pacifico"],["Asia-Pacifico","Americas"],["Americas","Africa-MO"],["Africa-MO","Americas"]];
  return intercont.some(([a,b])=>a===fromZone&&b===toZone)?4:3;
}

// ACCOMMODATION: icona e label in base a tier + rank
function getAccommodation(tourType,rank){
  const r=rank||500;
  if(tourType==="Slam")              return {icon:"🏰",label:"Suite ufficiale torneo"};
  if(tourType==="M1000"){
    if(r<=50)                        return {icon:"🏰",label:"Suite di lusso"};
                                     return {icon:"🏬",label:"Hotel 5★ Superior"};
  }
  if(tourType==="ATP500"||tourType==="ATP250"){
    if(r<=50)                        return {icon:"🏪",label:"Hotel 5★"};
    if(r<=150)                       return {icon:"🏩",label:"Hotel 4★"};
                                     return {icon:"🏨",label:"Hotel 3★"};
  }
  // Challenger
  if(r<=150)                         return {icon:"🏡",label:"Appartamento con giardino"};
  if(r<=250)                         return {icon:"🏠",label:"Appartamento"};
  if(r<=350)                         return {icon:"🛖",label:"B&B locale"};
                                     return {icon:"⛺",label:"Ostello condiviso"};
}

const ZONE_COORDS={"Europa":{x:48,y:30},"Americas":{x:20,y:42},"Asia-Pacifico":{x:74,y:36},"Africa-MO":{x:52,y:50}};
const ZONE_COLOR={"Europa":"#3b82f6","Americas":"#10b981","Asia-Pacifico":"#f59e0b","Africa-MO":"#ef4444"};
const ZONE_EMOJI={"Europa":"🇪🇺","Americas":"🌎","Asia-Pacifico":"🌏","Africa-MO":"🌍"};


const TT = {
  Slam:      {label:"Grand Slam",   pts:2000,prize:700000, rounds:7,color:"#f59e0b",minRank:104, rankFloor:1},
  M1000:     {label:"Masters 1000", pts:1000,prize:300000, rounds:6,color:"#8b5cf6",minRank:100, rankFloor:1},
  ATP500:    {label:"ATP 500",      pts:500, prize:180000, rounds:6,color:"#3b82f6",minRank:150, rankFloor:30},
  ATP250:    {label:"ATP 250",      pts:250, prize:120000, rounds:6,color:"#10b981",minRank:315, rankFloor:30,  rankCeiling:60},
  ChallengerA:{label:"Challenger",   pts:125, prize:35000,  rounds:5,color:"#94a3b8",minRank:370, rankFloor:100, rankCeiling:150},
  ChallengerB:{label:"Challenger B",  pts:60,  prize:15000,  rounds:5,color:"#7a8fa6",minRank:450, rankFloor:250, rankCeiling:250},
  ITF:        {label:"ITF",            pts:6,   prize:8000,   rounds:4,color:"#c2680a",minRank:500, rankFloor:350, rankCeiling:370},
  ATPFinals:  {label:"ATP Finals",   pts:1500,prize:500000, rounds:5,color:"#f59e0b",minRank:12,  rankFloor:1, format:"roundRobin", drawSize:8},
};

const CAL = [
  // ══ SETT 1 — gen, pre-Australian Open ══
  {week:1,  name:"Brisbane International",    type:"ATP500",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:6,  name:"Auckland Open",             type:"ATP250",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:1,  name:"Adelaide International",    type:"ATP250",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:1,  name:"Canberra Challenger",       type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:1,  name:"Traralgon Challenger",      type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:1,  name:"Nairobi Challenger",        type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 2 — Australian Open settimana 1 ══
  {week:2,  name:"Australian Open",           type:"Slam",       surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:2,  name:"Pune Challenger",           type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:2,  name:"Cairo Challenger",          type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:2,  name:"Biella Challenger",         type:"ChallengerB",surface:"Cemento",     zone:"Europa"},

  // ══ SETT 3 — Australian Open settimana 2 ══
  {week:3,  name:"Australian Open",           type:"Slam",       surface:"Cemento",     zone:"Asia-Pacifico", slamWeek2:true},
  {week:3,  name:"Bengaluru Challenger",      type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:3,  name:"Tunis Challenger",          type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 4 — indoor europeo / sudamerica ══
  {week:4,  name:"Montpellier Open",          type:"ATP250",     surface:"Cemento",     zone:"Europa"},
  {week:4,  name:"Cordoba Open",              type:"ATP250",     surface:"Terra Rossa", zone:"Americas"},
  {week:4,  name:"Dallas Open",               type:"ATP250",     surface:"Cemento",     zone:"Americas"},
  {week:4,  name:"Murcia Challenger",         type:"ChallengerA",surface:"Terra Rossa", zone:"Europa"},
  {week:4,  name:"Phoenix Challenger",        type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:4,  name:"Bangkok Challenger",        type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 5 ══
  {week:5,  name:"Rotterdam Open",            type:"ATP500",     surface:"Cemento",     zone:"Europa"},
  {week:5,  name:"Buenos Aires Open",         type:"ATP250",     surface:"Terra Rossa", zone:"Americas"},
  {week:5,  name:"Delray Beach Open",         type:"ATP250",     surface:"Cemento",     zone:"Americas"},
  {week:5,  name:"Ismaning Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Europa"},
  {week:5,  name:"Lima Challenger",           type:"ChallengerA",surface:"Terra Rossa", zone:"Americas"},
  {week:5,  name:"Johannesburg Challenger",   type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 6 ══
  {week:9,  name:"Open Sud de France",        type:"ATP250",     surface:"Cemento",     zone:"Europa"},
  {week:6,  name:"Marseille Open",            type:"ATP250",     surface:"Cemento",     zone:"Europa"},
  {week:6,  name:"Rio Open",                  type:"ATP500",     surface:"Terra Rossa", zone:"Americas"},
  {week:6,  name:"Santiago Challenger",       type:"ChallengerB",surface:"Terra Rossa", zone:"Americas"},
  {week:6,  name:"Lille Challenger",          type:"ChallengerB",surface:"Cemento",     zone:"Europa"},
  {week:6,  name:"Kuala Lumpur Challenger",   type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 7 — Dubai / Doha / Acapulco ══
  {week:7,  name:"Dubai Championships",       type:"ATP500",     surface:"Cemento",     zone:"Africa-MO"},
  {week:7,  name:"Doha Open",                 type:"ATP250",     surface:"Cemento",     zone:"Africa-MO"},
  {week:7,  name:"Acapulco Open",             type:"ATP500",     surface:"Cemento",     zone:"Americas"},
  {week:7,  name:"Casablanca Challenger",     type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:7,  name:"Bogota Challenger",         type:"ChallengerB",surface:"Terra Rossa", zone:"Americas"},
  {week:7,  name:"Taipei Challenger",         type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 8 — Indian Wells sett 1 ══
  {week:8,  name:"Indian Wells Masters",      type:"M1000",      surface:"Cemento",     zone:"Americas"},
  {week:8,  name:"Columbus Challenger",       type:"ChallengerA",surface:"Cemento",     zone:"Americas"},
  {week:8,  name:"Amman Challenger",          type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:8,  name:"Chiang Rai Challenger",     type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:8,  name:"Salzburg Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Europa"},

  // ══ SETT 9 — Indian Wells sett 2 ══
  {week:9,  name:"Indian Wells Masters",      type:"M1000",      surface:"Cemento",     zone:"Americas", m1000Week2:true},
  {week:9,  name:"Tallahassee Challenger",    type:"ChallengerB",surface:"Terra Rossa", zone:"Americas"},
  {week:9,  name:"Rabat Challenger",          type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 10 — Miami sett 1 ══
  {week:10, name:"Miami Open",                type:"M1000",      surface:"Cemento",     zone:"Americas"},
  {week:10, name:"Savannah Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:10, name:"Seoul Challenger",          type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:10, name:"Genova Challenger",         type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},

  // ══ SETT 11 — Miami sett 2 ══
  {week:11, name:"Miami Open",                type:"M1000",      surface:"Cemento",     zone:"Americas", m1000Week2:true},
  {week:11, name:"Orlando Challenger",        type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:11, name:"Algeri Challenger",         type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 12 — terra rossa europa / africa / americas ══
  {week:12, name:"Marrakech Open",            type:"ATP250",     surface:"Terra Rossa", zone:"Africa-MO"},
  {week:12, name:"Houston Open",              type:"ATP250",     surface:"Terra Rossa", zone:"Americas"},
  {week:12, name:"Estoril Open",              type:"ATP250",     surface:"Terra Rossa", zone:"Europa"},
  {week:12, name:"Barletta Challenger",       type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},
  {week:14, name:"Sarasota Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:17, name:"Houston Challenger",        type:"ChallengerA",surface:"Terra Rossa", zone:"Americas"},
  {week:20, name:"Lexington B Challenger",    type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:23, name:"Winnetka Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:12, name:"Montevideo Challenger",     type:"ChallengerB",surface:"Terra Rossa", zone:"Americas"},
  {week:12, name:"Dakar Challenger",          type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 13 — Monte-Carlo sett 1 ══
  {week:13, name:"Monte-Carlo Masters",       type:"M1000",      surface:"Terra Rossa", zone:"Europa"},
  {week:13, name:"Bergamo Challenger",        type:"ChallengerA",surface:"Terra Rossa", zone:"Europa"},
  {week:13, name:"Osaka Challenger",          type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 14 — Monte-Carlo sett 2 / Barcelona ══
  {week:14, name:"Monte-Carlo Masters",       type:"M1000",      surface:"Terra Rossa", zone:"Europa", m1000Week2:true},
  {week:14, name:"Barcelona Open",            type:"ATP500",     surface:"Terra Rossa", zone:"Europa"},
  {week:14, name:"Parma Challenger",          type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},
  {week:14, name:"Abidjan Challenger",        type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 15 — Madrid sett 1 / Munich ══
  {week:15, name:"Madrid Open",               type:"M1000",      surface:"Terra Rossa", zone:"Europa"},
  {week:15, name:"Munich Open",               type:"ATP250",     surface:"Terra Rossa", zone:"Europa"},
  {week:15, name:"Marbella Challenger",       type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},
  {week:15, name:"Guangzhou Challenger",      type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 16 — Madrid sett 2 ══
  {week:16, name:"Madrid Open",               type:"M1000",      surface:"Terra Rossa", zone:"Europa", m1000Week2:true},
  {week:16, name:"Verona Challenger",         type:"ChallengerA",surface:"Terra Rossa", zone:"Europa"},
  {week:16, name:"Tunis Open Challenger",     type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 17 — Roma sett 1 ══
  {week:17, name:"Italian Open Roma",         type:"M1000",      surface:"Terra Rossa", zone:"Europa"},
  {week:17, name:"Poznan Challenger",         type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},
  {week:17, name:"Wuhan Challenger",          type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 18 — Roma sett 2 / Geneva ══
  {week:18, name:"Italian Open Roma",         type:"M1000",      surface:"Terra Rossa", zone:"Europa", m1000Week2:true},
  {week:18, name:"Geneva Open",               type:"ATP250",     surface:"Terra Rossa", zone:"Europa"},
  {week:18, name:"Agadir Challenger",         type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 19 — pre Roland Garros ══
  {week:19, name:"Lyon Open",                 type:"ATP250",     surface:"Terra Rossa", zone:"Europa"},
  {week:19, name:"Torino Challenger",         type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},
  {week:19, name:"Kosice Challenger",         type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},
  {week:19, name:"Nagoya Challenger",         type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 20 — Roland Garros sett 1 ══
  {week:20, name:"Roland Garros",             type:"Slam",       surface:"Terra Rossa", zone:"Europa"},
  {week:20, name:"Szczecin Challenger",       type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},
  {week:20, name:"Monastir Challenger",       type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 21 — Roland Garros sett 2 ══
  {week:21, name:"Roland Garros",             type:"Slam",       surface:"Terra Rossa", zone:"Europa", slamWeek2:true},
  {week:21, name:"Perugia Challenger",        type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},
  {week:21, name:"Busan Challenger",          type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 22 — erba pre-Wimbledon ══
  {week:22, name:"Queen's Club",              type:"ATP500",     surface:"Erba",        zone:"Europa"},
  {week:22, name:"Halle Open",                type:"ATP500",     surface:"Erba",        zone:"Europa"},
  {week:22, name:"Surbiton Challenger",       type:"ChallengerA",surface:"Erba",        zone:"Europa"},
  {week:22, name:"Nottingham Challenger",     type:"ChallengerA",surface:"Erba",        zone:"Europa"},

  // ══ SETT 23 — erba pre-Wimbledon ══
  {week:23, name:"Eastbourne International",  type:"ATP250",     surface:"Erba",        zone:"Europa"},
  {week:23, name:"Ilkley Challenger",         type:"ChallengerA",surface:"Erba",        zone:"Europa"},

  // ══ SETT 24 — Wimbledon sett 1 ══
  {week:24, name:"Wimbledon",                 type:"Slam",       surface:"Erba",        zone:"Europa"},
  {week:24, name:"Newport Challenger",        type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:24, name:"Kampala Challenger",        type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:26, name:"Prostejov Challenger",      type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},

  // ══ SETT 25 — Wimbledon sett 2 ══
  {week:25, name:"Wimbledon",                 type:"Slam",       surface:"Erba",        zone:"Europa", slamWeek2:true},
  {week:25, name:"Granby Challenger",         type:"ChallengerA",surface:"Cemento",     zone:"Americas"},
  {week:25, name:"Taipei Challenger B",       type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 26 — post-Wimbledon ══
  {week:26, name:"Umago Open",                type:"ATP250",     surface:"Terra Rossa", zone:"Europa"},
  {week:30, name:"Gstaad Open",               type:"ATP250",     surface:"Terra Rossa", zone:"Europa"},
  {week:26, name:"Newport Hall of Fame",      type:"ATP250",     surface:"Erba",        zone:"Americas"},
  {week:26, name:"Adelanto Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:26, name:"Accra Challenger",          type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 27 — Hamburg / Washington / Los Cabos ══
  {week:27, name:"Hamburg Open",              type:"ATP500",     surface:"Terra Rossa", zone:"Europa"},
  {week:27, name:"Washington Open",           type:"ATP500",     surface:"Cemento",     zone:"Americas"},
  {week:27, name:"Los Cabos Open",            type:"ATP250",     surface:"Cemento",     zone:"Americas"},
  {week:27, name:"Asuncion Challenger",       type:"ChallengerB",surface:"Terra Rossa", zone:"Americas"},
  {week:27, name:"Manila Challenger",         type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 28 — Canadian Open / Winston-Salem ══
  {week:28, name:"Canadian Open",             type:"M1000",      surface:"Cemento",     zone:"Americas"},
  {week:28, name:"Tenerife Challenger",       type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},
  {week:28, name:"Cairo Open Challenger",     type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 29 — Cincinnati sett 1 ══
  {week:29, name:"Cincinnati Masters",        type:"M1000",      surface:"Cemento",     zone:"Americas"},
  {week:29, name:"New Haven Open",            type:"ATP250",     surface:"Cemento",     zone:"Americas"},
  {week:29, name:"Lexington Challenger",      type:"ChallengerA",surface:"Cemento",     zone:"Americas"},
  {week:29, name:"Ho Chi Minh Challenger",    type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:30, name:"Cordenons Challenger",      type:"ChallengerB",surface:"Terra Rossa", zone:"Europa"},

  // ══ SETT 30 — Cincinnati sett 2 ══
  {week:30, name:"Cincinnati Masters",        type:"M1000",      surface:"Cemento",     zone:"Americas", m1000Week2:true},
  {week:30, name:"Indianapolis Challenger",   type:"ChallengerA",surface:"Cemento",     zone:"Americas"},
  {week:33, name:"Atlanta Challenger",        type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:36, name:"Knoxville Challenger",      type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:39, name:"Champaign Challenger",      type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:30, name:"Mombasa Challenger",        type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 31 — US Open sett 1 ══
  {week:31, name:"US Open",                   type:"Slam",       surface:"Cemento",     zone:"Americas"},
  {week:31, name:"Astana Challenger",         type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:31, name:"Casablanca B Challenger",   type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:32, name:"Ortisei Challenger",        type:"ChallengerB",surface:"Cemento",     zone:"Europa"},

  // ══ SETT 32 — US Open sett 2 ══
  {week:32, name:"US Open",                   type:"Slam",       surface:"Cemento",     zone:"Americas", slamWeek2:true},
  {week:32, name:"Almaty Challenger",         type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:32, name:"Tunis B Challenger",        type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 33 — post US Open / tour asiatico ══
  {week:11, name:"Chengdu Open",              type:"ATP250",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:26, name:"Zhuhai Championships",      type:"ATP250",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:33, name:"Metz Open",                 type:"ATP250",     surface:"Cemento",     zone:"Europa"},
  {week:33, name:"Mouilleron Challenger",     type:"ChallengerA",surface:"Cemento",     zone:"Europa"},
  {week:33, name:"Entebbe Challenger",        type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 34 — Japan Open / Shanghai sett 1 / Seoul ══
  {week:34, name:"Japan Open Tokyo",          type:"ATP500",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:34, name:"Seoul Open",                type:"ATP250",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:34, name:"Shanghai Masters",          type:"M1000",      surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:34, name:"Rabat B Challenger",        type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:36, name:"Sousse Challenger",         type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:39, name:"Marrakech Challenger",      type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},

  // ══ SETT 35 — Shanghai sett 2 / Almaty ══
  {week:35, name:"Shanghai Masters",          type:"M1000",      surface:"Cemento",     zone:"Asia-Pacifico", m1000Week2:true},
  {week:35, name:"Almaty Open",               type:"ATP250",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:35, name:"Aktau Challenger",          type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:37, name:"Tashkent Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:40, name:"Yokohama Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},

  // ══ SETT 36 — indoor europeo ══
  {week:36, name:"Vienna Open",               type:"ATP500",     surface:"Cemento",     zone:"Europa"},
  {week:39, name:"Stockholm Open",            type:"ATP250",     surface:"Cemento",     zone:"Europa"},
  {week:36, name:"Antwerp Open",              type:"ATP250",     surface:"Cemento",     zone:"Europa"},
  {week:36, name:"Croissy Challenger",        type:"ChallengerB",surface:"Cemento",     zone:"Europa"},

  // ══ SETT 37 — Basel ══
  {week:37, name:"Basel Indoor",              type:"ATP500",     surface:"Cemento",     zone:"Europa"},
  {week:37, name:"Lyon Challenger",           type:"ChallengerA",surface:"Cemento",     zone:"Europa"},
  {week:37, name:"Brest Challenger",          type:"ChallengerB",surface:"Cemento",     zone:"Europa"},

  // ══ SETT 38 — Bercy sett 1 ══
  {week:38, name:"Paris Masters",             type:"M1000",      surface:"Cemento",     zone:"Europa"},
  {week:38, name:"Mouilleron-le-Captif Chall",type:"ChallengerB",surface:"Cemento",     zone:"Europa"},

  // ══ SETT 39 — Bercy sett 2 ══
  {week:39, name:"Paris Masters",             type:"M1000",      surface:"Cemento",     zone:"Europa", m1000Week2:true},
  {week:39, name:"Augsburg Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Europa"},
  {week:40, name:"Brno Challenger",           type:"ChallengerB",surface:"Cemento",     zone:"Europa"},

  // ══ SETT 41 — ATP Finals sett 1 (gironi) — 1 settimana di riposo dopo Bercy ══
  {week:41, name:"ATP Finals",                type:"ATPFinals",  surface:"Cemento",     zone:"Europa"},

  // ══ SETT 42 — ATP Finals sett 2 (SF + Finale, accesso automatico) ══
  {week:42, name:"ATP Finals",                type:"ATPFinals",  surface:"Cemento",     zone:"Europa", atpFinalsWeek2:true},
  {week:8,  name:"Stuttgart Challenger",     type:"ChallengerA",surface:"Terra Rossa",  zone:"Europa"},
  {week:28, name:"Zagreb Challenger",        type:"ChallengerA",surface:"Terra Rossa",  zone:"Europa"},
  {week:39, name:"Bratislava Challenger",    type:"ChallengerA",surface:"Cemento",      zone:"Europa"},
  {week:35, name:"Winnipeg Challenger",      type:"ChallengerA",surface:"Cemento",      zone:"Americas"},
  {week:32, name:"Gwangju Challenger",       type:"ChallengerA",surface:"Cemento",      zone:"Asia-Pacifico"},
  {week:34, name:"Tunis Challenger B",       type:"ChallengerA",surface:"Terra Rossa",  zone:"Africa-MO"},
  // Nuovi ChallengerA sess.27 — riequilibrio zone a 11 ciascuna
  {week:14, name:"Tunis Challenger A",      type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:24, name:"Casablanca Challenger A", type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:12, name:"Medellin Challenger",     type:"ChallengerA",surface:"Terra Rossa", zone:"Americas"},
  {week:6,  name:"Sydney Challenger",       type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:23, name:"Incheon Challenger",      type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},
  // Copertura sett.36-41
  {week:36, name:"Dallas Challenger",        type:"ChallengerA",surface:"Cemento",     zone:"Americas"},
  {week:36, name:"Fukuoka Challenger",       type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:37, name:"Alexandria Challenger",    type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:38, name:"Buenos Aires Challenger",  type:"ChallengerA",surface:"Terra Rossa", zone:"Americas"},
  {week:38, name:"Almaty Challenger A",      type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:39, name:"Meknes Challenger",        type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:40, name:"Guayaquil Challenger",     type:"ChallengerA",surface:"Terra Rossa", zone:"Americas"},
  {week:40, name:"Pattaya Challenger",       type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:41, name:"Fes Challenger",           type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},

  // Nuovi ChallengerA sess.27b — 12 per zona, max gap 5
  {week:17, name:"Nairobi Challenger A",    type:"ChallengerA",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:21, name:"Lima Challenger A",       type:"ChallengerA",surface:"Terra Rossa", zone:"Americas"},
  {week:10, name:"Shenzhen Challenger",     type:"ChallengerA",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:19, name:"Prague Challenger",       type:"ChallengerA",surface:"Terra Rossa", zone:"Europa"},
  // Nuovi ChallengerB sess.27b — parificazione zone a ~19
  {week:21, name:"Sfax Challenger",         type:"ChallengerB",surface:"Terra Rossa", zone:"Africa-MO"},
  {week:17, name:"Bogota B Challenger",     type:"ChallengerB",surface:"Terra Rossa", zone:"Americas"},
  {week:29, name:"Atlanta B Challenger",    type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:41, name:"Cancun Challenger",       type:"ChallengerB",surface:"Cemento",     zone:"Americas"},
  {week:22, name:"Taipei B Challenger",     type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:39, name:"Hanoi Challenger",        type:"ChallengerB",surface:"Cemento",     zone:"Asia-Pacifico"},

  {week:10, name:"Kuala Lumpur Open",          type:"ATP250",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:19, name:"Hangzhou Open",               type:"ATP250",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:25, name:"Nanchang Open",               type:"ATP250",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:15, name:"Bogota Open",                  type:"ATP250",     surface:"Terra Rossa", zone:"Americas"},
  {week:22, name:"Atlanta Open",                 type:"ATP250",     surface:"Cemento",     zone:"Americas"},
  {week:20, name:"Tunisi Open",                  type:"ATP250",     surface:"Terra Rossa", zone:"Africa-MO"},
  {week:33, name:"Casablanca Open",              type:"ATP250",     surface:"Cemento",     zone:"Africa-MO"},

  // ATP250 nuovi Africa-MO (sess.43)
  {week:17, name:"Rabat Open",                  type:"ATP250",     surface:"Terra Rossa", zone:"Africa-MO"},
  {week:26, name:"Accra Open",                  type:"ATP250",     surface:"Terra Rossa", zone:"Africa-MO"},
  {week:38, name:"Amman Open",                  type:"ATP250",     surface:"Cemento",     zone:"Africa-MO"},
  // ATP500 nuovi Asia-Pac e Africa-MO (sess.43)
  {week:33, name:"Shenzhen Open",               type:"ATP500",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:15, name:"Hong Kong Open",               type:"ATP500",     surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:19, name:"Cairo Open",                  type:"ATP500",     surface:"Terra Rossa", zone:"Africa-MO"},


  // ══ TORNEI ITF — circa ogni 3 settimane per zona ══
  // Europa (~14 tornei)
  {week:1,  name:"Milano ITF",           type:"ITF", surface:"Cemento",     zone:"Europa"},
  {week:4,  name:"Madrid ITF",           type:"ITF", surface:"Terra Rossa", zone:"Europa"},
  {week:7,  name:"Praga ITF",            type:"ITF", surface:"Cemento",     zone:"Europa"},
  {week:10, name:"Varsavia ITF",         type:"ITF", surface:"Cemento",     zone:"Europa"},
  {week:13, name:"Roma ITF",             type:"ITF", surface:"Terra Rossa", zone:"Europa"},
  {week:16, name:"Barcellona ITF",       type:"ITF", surface:"Terra Rossa", zone:"Europa"},
  {week:19, name:"Vienna ITF",           type:"ITF", surface:"Terra Rossa", zone:"Europa"},
  {week:22, name:"Amsterdam ITF",        type:"ITF", surface:"Erba",        zone:"Europa"},
  {week:25, name:"Berlino ITF",          type:"ITF", surface:"Terra Rossa", zone:"Europa"},
  {week:28, name:"Budapest ITF",         type:"ITF", surface:"Terra Rossa", zone:"Europa"},
  {week:31, name:"Belgrado ITF",         type:"ITF", surface:"Terra Rossa", zone:"Europa"},
  {week:34, name:"Lione ITF",            type:"ITF", surface:"Cemento",     zone:"Europa"},
  {week:37, name:"Londra ITF",           type:"ITF", surface:"Cemento",     zone:"Europa"},
  {week:40, name:"Bucarest ITF",         type:"ITF", surface:"Cemento",     zone:"Europa"},
  // Americas (~14 tornei)
  {week:2,  name:"Bogota ITF",           type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  {week:5,  name:"Lima ITF",             type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  {week:8,  name:"Santiago ITF",         type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  {week:11, name:"Buenos Aires ITF",     type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  {week:14, name:"Caracas ITF",          type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  {week:17, name:"Miami ITF",            type:"ITF", surface:"Cemento",     zone:"Americas"},
  {week:20, name:"Houston ITF",          type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  {week:23, name:"New York ITF",         type:"ITF", surface:"Cemento",     zone:"Americas"},
  {week:26, name:"Los Angeles ITF",      type:"ITF", surface:"Cemento",     zone:"Americas"},
  {week:29, name:"Montreal ITF",         type:"ITF", surface:"Cemento",     zone:"Americas"},
  {week:32, name:"Città del Messico ITF",type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  {week:35, name:"San Paolo ITF",        type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  {week:38, name:"Asuncion ITF",         type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  {week:41, name:"Montevideo ITF",       type:"ITF", surface:"Terra Rossa", zone:"Americas"},
  // Asia-Pacifico (~14 tornei)
  {week:1,  name:"Bangkok ITF",          type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:4,  name:"Jakarta ITF",          type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:7,  name:"Kuala Lumpur ITF",     type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:10, name:"Seoul ITF",            type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:13, name:"Tokyo ITF",            type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:16, name:"Mumbai ITF",           type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:19, name:"Manila ITF",           type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:22, name:"Shanghai ITF",         type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:25, name:"Auckland ITF",         type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:28, name:"Melbourne ITF",        type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:31, name:"Ho Chi Minh ITF",      type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:34, name:"Osaka ITF",            type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:37, name:"Taipei ITF",           type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  {week:40, name:"Bangalore ITF",        type:"ITF", surface:"Cemento",     zone:"Asia-Pacifico"},
  // Africa-MO (~14 tornei)
  {week:2,  name:"Cairo ITF",            type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:5,  name:"Casablanca ITF",       type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:8,  name:"Tunisi ITF",           type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:11, name:"Nairobi ITF",          type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:14, name:"Dakar ITF",            type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:17, name:"Marrakech ITF",        type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:20, name:"Algeri ITF",           type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:23, name:"Johannesburg ITF",     type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:26, name:"Accra ITF",            type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:29, name:"Rabat ITF",            type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:32, name:"Kampala ITF",          type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:35, name:"Abidjan ITF",          type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:38, name:"Amman ITF",            type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},
  {week:41, name:"Mombasa ITF",          type:"ITF", surface:"Terra Rossa", zone:"Africa-MO"},

  // SETT 42-51: PAUSA INVERNALE (gestita da advanceWeek)
];

// ═══════════════════════════════════════════════════
// SPONSOR SYSTEM
// ═══════════════════════════════════════════════════
const SPONSOR_COMPANIES = [
  "Virtus Sport","NovaStar AG","Elysian Group","Kronos Capital","Apex Ventures",
  "Meridian Sports","Solaris Fund","Titan Partners","Aurora Holding","Crest Capital",
  "Vanguard Sport","Zenith Investors","Polaris Group","Summit Fund","Atlas Capital",
  "Helios Ventures","Stratos Sport","Nexus Group","Pinnacle AG","Orion Capital"
];
// Genera 3 nomi azienda unici deterministici dal nome giocatore
function pickSponsorNames(playerName){
  const seed=playerName.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const pool=[...SPONSOR_COMPANIES];
  const pick=(s)=>{const i=s%pool.length;const n=pool[i];pool.splice(i,1);return n;};
  return[pick(seed),pick(seed*7+13),pick(seed*3+29)];
}
// SPONSOR SYSTEM — importi per fascia rank, meccanismo corretto:
// fallimento = restituisci anticipo intero + penale% extra
// successo   = tieni anticipo + bonus% extra
// Rank >300:  Cauto 3k / Graduale 4k / Ambizioso 6k
// Rank 151-250: 18k / 24k / 34k
// Rank 51-150:  40k / 54k / 72k
// Rank <=50:    76k / 105k / 140k
// Penale fallimento: Cauto +8% / Graduale +15% / Ambizioso +25%
// Bonus successo:    Cauto +10% / Graduale +20% / Ambizioso +35%
function calcSponsorAmounts(pts){
  // Restituisce {cauto, graduale, ambizioso} — basato su punti ATP (non rank)
  // Soglie ricalibrate sulla nuova curva (sess.41):
  //   < 110 pts  ≈ rank >300  (fascia entry)
  //   110-265    ≈ rank 150-300
  //   265-800    ≈ rank 50-150
  //   > 800      ≈ rank <=50
  if(pts<110)  return {cauto:3000,  graduale:4000,  ambizioso:6000};
  if(pts<265)  return {cauto:18000, graduale:24000, ambizioso:34000};
  if(pts<800)  return {cauto:40000, graduale:54000, ambizioso:72000};
  return              {cauto:76000, graduale:105000,ambizioso:140000};
}
function buildSponsorOffers(names, rank, week, year, atpPts){
  const r = rank||500;
  const pts = atpPts||0;
  const w = week||1;
  const y = year||1;
  // Obiettivi sponsor in PUNTI ATP — formula con bonus fisso per rendere
  // gli obiettivi raggiungibili anche da 0 pts (età 15) e sfidanti per chi parte avanti
  // Formula: max(pts, 5) * mult + bonus_fisso
  // Cauto: +8% + 8pts · Graduale: +15% + 15pts · Ambizioso: +25% + 25pts
  // Checkpoint graduale: +5% + 6pts
  const curPts=Math.max(pts,5);
  const tgtCautoPts   = Math.round(curPts * 1.08 + 8);
  const tgtAmbiziPts  = Math.round(curPts * 1.25 + 25);
  const tgtGradPts    = Math.round(curPts * 1.15 + 15);
  const tgtGradChkPts = Math.round(curPts * 1.05 + 6);
  // targetRank equivalente per compatibilità col check in advanceWeek
  const tgtCauto    = rankForAtpPts(tgtCautoPts);
  const tgtAmbiz    = rankForAtpPts(tgtAmbiziPts);
  const tgtGrad     = rankForAtpPts(tgtGradPts);
  const tgtGradChk  = rankForAtpPts(tgtGradChkPts);
  // Scadenze: protezione zona proibita (pausa 43-51, pre-stagione 1-13)
  const isPausa = w >= 43;
  const baseW = isPausa ? 1 : w;
  const baseY = isPausa ? y+1 : y;
  function rawAdd(dw){
    let nw=baseW+dw, ny=baseY;
    if(nw>51){nw=nw-51;ny=ny+1;}
    return {week:nw, year:ny};
  }
  function snapToSafe(wk, yr){
    if(wk >= 42 && wk <= 51) return {week:14, year:yr+1};
    if(wk >= 1  && wk <= 13) return {week:14, year:yr};
    return {week:wk, year:yr};
  }
  function addAfterAnchor(anchor, delta){
    let nw=anchor.week+delta, ny=anchor.year;
    if(nw>51){nw=nw-51;ny=ny+1;}
    return snapToSafe(nw,ny);
  }
  const raw7       = rawAdd(7);
  const anchorShort = snapToSafe(raw7.week, raw7.year);
  const anchorLong  = addAfterAnchor(anchorShort, 7);
  const dlAmbiz   = anchorShort;
  const dlGradChk = anchorShort;
  const dlCauto   = anchorLong;
  const dlGrad    = anchorLong;
  // Importi per fascia
  const amts = calcSponsorAmounts(pts);
  const amtA = amts.cauto;
  const amtB = amts.ambizioso;
  const amtC = amts.graduale;
  // Penale fallimento: restituisci anticipo intero + penale% extra
  // restitution = anticipo + penale% * anticipo = anticipo * (1 + penale%)
  // Il campo restitution contiene SOLO la penale extra (il codice sottrae gia' l'anticipo separatamente)
  // Per coerenza col sistema esistente: restitution = anticipo * penale%
  // Il check in simWeek deduce: updPlayer.money -= sponsor.restitution (penale extra)
  // + ha gia' ricevuto l'anticipo, quindi il netto e' -(penale extra)
  // NUOVO: restitution = anticipo intero + penale extra (dedotto in una sola operazione)
  const penA = Math.round(amtA * 0.65);  // Cauto: restituisce 65% anticipo
  const penB = Math.round(amtB * 1.05);  // Ambizioso: restituisce 105% anticipo (tutto +5%)
  const penC = Math.round(amtC * 0.95);  // Graduale: restituisce 95% anticipo
  const bonA = Math.round(amtA * 0.10);  // bonus +10%
  const bonB = Math.round(amtB * 0.35);  // bonus +35%
  const bonC = Math.round(amtC * 0.20);  // bonus +20%
  return[
    {
      id:"A", company:names[0], type:"Cauto",
      desc:"Supporto stabile, orizzonte lungo. Obiettivo rank morbido, finestra 14 settimane.",
      amount:amtA, deadline:dlCauto, targetRank:tgtCauto, targetPts:tgtCautoPts,
      restitution:penA, bonus:bonA,
      checkpoints:null,
      color:"#10b981"
    },
    {
      id:"B", company:names[1], type:"Ambizioso",
      desc:"Scommessa aggressiva, scadenza stretta. Obiettivo punti esigente, finestra 7 settimane.",
      amount:amtB, deadline:dlAmbiz, targetRank:tgtAmbiz, targetPts:tgtAmbiziPts,
      restitution:penB, bonus:bonB,
      checkpoints:null,
      color:"#f59e0b"
    },
    {
      id:"C", company:names[2], type:"Graduale",
      desc:"Due tappe con checkpoint intermedio. Obiettivo punti progressivo, finestra 14 settimane.",
      amount:amtC, deadline:dlGrad, targetRank:tgtGrad, targetPts:tgtGradPts,
      restitution:penC, bonus:bonC,
      checkpoints:[
        {year:dlGradChk.year,week:dlGradChk.week,targetRank:tgtGradChk,targetPts:tgtGradChkPts,restitution:Math.round(amtC*0.15),
         label:"Check sett."+dlGradChk.week+" A"+dlGradChk.year+" — "+tgtGradChkPts+"pts"},
      ],
      color:"#818cf8"
    },
  ];
}

const BONUS_CARDS = [
  {id:"ace",name:"Ace Boost",desc:"Solo sui tuoi game servizio (2 game)",icon:"🚀",b:{servizio:6},serviceOnly:true},
  {id:"clutch",name:"Break Clutch",desc:"Nervi d'acciaio sui punti chiave",icon:"💎",b:{mentale:8}},
  {id:"rally",name:"Rally King",desc:"Domina gli scambi lunghi",icon:"👑",b:{resistenza:5,dritto:4}},
  {id:"speed",name:"Speed Burst",desc:"Recuperi impossibili",icon:"⚡",b:{velocita:10}},
  {id:"net",name:"Net Attack",desc:"Salita a rete perfetta",icon:"🥅",b:{volee:9}},
  {id:"wind",name:"Secondo Fiato",desc:"Recupera energie nel set",icon:"🌬️",b:{resistenza:10}},
];

const TRAIN = [
  {id:"srv",label:"Servizio",    stat:"servizio",  gain:[0.08,0.17],fat:11,icon:"🎾"},
  {id:"drt",label:"Dritto",      stat:"dritto",    gain:[0.08,0.17],fat:11,icon:"💥"},
  {id:"rov",label:"Rovescio",    stat:"rovescio",  gain:[0.08,0.17],fat:11,icon:"🔄"},
  {id:"vol",label:"Rete & Volee",stat:"volee",     gain:[0.08,0.17],fat:11,icon:"🥅"},
  {id:"fit",label:"Fitness",     stat:"velocita",  gain:[0.07,0.13],fat:14,icon:"🏃"},
  {id:"res",label:"Resistenza",  stat:"resistenza",gain:[0.07,0.13],fat:14,icon:"💪"},
  {id:"men",label:"Focus Mentale",stat:"mentale",  gain:[0.05,0.10],fat:7, icon:"🧠"},
  {id:"rst",label:"Riposo",      stat:null,        gain:[0,0],    fat:-45,icon:"😴",moraleGain:4},
];

const ARCH = [
  {id:"baseline",name:"Baseliner",icon:"🎯",desc:"Resistenza dal fondo.",s:{servizio:5,dritto:10,rovescio:9,volee:3,velocita:8,resistenza:10,mentale:5}},
  {id:"sv",name:"Serve & Volley",icon:"⚡",desc:"Servizio e rete.",s:{servizio:11,dritto:6,rovescio:5,volee:10,velocita:6,resistenza:4,mentale:8}},
  {id:"all",name:"All-Rounder",icon:"🌟",desc:"Equilibrato.",s:{servizio:7,dritto:7,rovescio:7,volee:6,velocita:7,resistenza:7,mentale:9}},
  {id:"att",name:"Attaccante",icon:"🔥",desc:"Colpi potenti.",s:{servizio:8,dritto:12,rovescio:8,volee:5,velocita:5,resistenza:4,mentale:8}},
  {id:"cust",name:"Personalizzato",icon:"✏️",desc:"Distribuisci i 50 punti.",s:{servizio:7,dritto:7,rovescio:7,volee:7,velocita:7,resistenza:8,mentale:7}},
];

const SURF_MOD = {
  Cemento:{servizio:1.0,dritto:1.0,rovescio:1.0,volee:0.9,velocita:1.0},
  "Terra Rossa":{servizio:0.85,dritto:1.1,rovescio:1.1,volee:0.8,velocita:0.9},
  Erba:{servizio:1.15,dritto:0.95,rovescio:0.9,volee:1.2,velocita:1.1},
};

const RN = ["Primo Turno","Secondo Turno","Terzo Turno","Ottavi","Quarti","Semifinale","Finale"];
const PF = [0.02,0.03,0.05,0.08,0.12,0.22,0.50];
// Punti ATP reali per categoria e posizione (tabella ufficiale ATP)
// Indice fromEnd: 0=finale, 1=SF, 2=QF, 3=Ott, 4=T2, 5+=T1
// [titolo, finale_persa, SF_persa, QF_persa, Ott_persa, T2/Seds_persa, T2_persa, T1_persa] (Slam=8, altri=7)
const PTS_TABLE = {
  ITF:        [  6,  3,  1,  0, null, null, null],
  Challenger:[ 90, 50, 25,  8,  4, null, 1],
  ChallengerA:[ 90, 50, 25,  8,  4, null, 1],
  ChallengerB:[ 44, 24, 12,  4,  2, null, 0],
  ATP250:    [250,150, 80, 30, 15,    5, 2],
  ATP500:    [500,300,160, 90, 45,   20, 5],
  // ATPFinals (rounds=5, round-robin): [Titolo, Finalista, SF_persa, Eliminato_girone_3RR, Eliminato_girone_2RR, Eliminato_girone_1RR]
  ATPFinals: [1500,1000, 600, 400, 200, 0],
  M1000:     [1000,600,360,180, 90,  45,10],
  Slam:      [2000,1200,720,360,180, 90,45,10], // 8 valori: T1/T2/Seds separati
};
// Coefficienti premi (PF rimane per i soldi)
const QF_PTS = [0.01,0.02,0.04,0.08,0.16,0.32,1.0]; // solo per premi in denaro
// Premi in euro fissi per ChalB (T1 ridotto, Ott/QF alzati rispetto al proporzionale PF)
// [Tit, Fin, SF, QF, Ott, T2, T1]
const PRIZE_MONEY = {
  // ITF (rounds=4): pfIdx 1=T1perso, 2=Ottperso, 3=SFpersa, 4=Finpersa, 5=Tit
  ITF:        [null,    0,  150,  300,   800,  1500],
  // ChallengerA (rounds=5): pfIdx 1=T1perso..6=Tit (indice 0=unused/null)
  ChallengerA:[null,  405,  900, 2000,  4500,  9000, 17500],
  // ChallengerB (rounds=5): pfIdx 1=T1perso..6=Tit (indice 0=unused/null)
  ChallengerB:[null,  300,  795, 1600,  2500,  3300,  7500],
  // ATP250/ATP500 (rounds=6): pfIdx 0=T1perso..6=Tit
  ATP250:     [2000, 3500, 6000, 10000, 18000, 35000,  60000],
  ATP500:     [3000, 5500,10000, 16000, 30000, 60000, 100000],
  // ATPFinals (rounds=5, round-robin): pfIdx 0=RR1elim..5=Titolo
  ATPFinals:  [15000, 35000, 65000, 120000, 220000, 500000],
  // Slam (rounds=7): pfIdx 0=T1..7=Tit (8 slot) — T1=9000 > M1000(6000), < T2(21000)
  Slam:       [9000,21000,35000, 56000, 84000,154000, 280000, 500000],
};
function getMatchMoney(type, prize, pfIdx){
  const tbl=PRIZE_MONEY[type];
  if(!tbl) return Math.round(prize*PF[Math.min(pfIdx,6)]);
  // tabelle con >7 slot (es. Slam=8): pfIdx già mappato su round direttamente
  const v=tbl[Math.min(pfIdx,tbl.length-1)];
  return (v===null||v===undefined)?0:v;
}
function getMatchPts(type, fromEnd, won){
  const t=PTS_TABLE[type]||PTS_TABLE.ATP250;
  if(won && fromEnd===0) return t[0]; // titolo
  // persa: cap dinamico sulla lunghezza della tabella (Slam ha 8 elementi, altri 7)
  const maxIdx=t.length-1;
  const idx=Math.min(fromEnd+(won?0:1),maxIdx);
  const v=t[idx]; return (v===null||v===undefined)?( t[6]===null||t[6]===undefined?0:t[6] ):v;
}
const SK = "atp_career_v3";

const STAFF_LEVELS={
  coach:{name:"Coach Tecnico",icon:"🎓",levels:[
    {label:"Base",   cost:280,  desc:"Allenamento +40% · Match +1.5%", trainBonus:1.61, matchBonus:1.015},
    {label:"Esperto",cost:560,  desc:"Allenamento +65% · Match +3%",   trainBonus:1.90, matchBonus:1.030},
    {label:"Elite",  cost:1100, desc:"Allenamento +95% · Match +5%",   trainBonus:2.24, matchBonus:1.050},
  ]},
  prep:{name:"Preparatore",icon:"💪",levels:[
    {label:"Base",   cost:210, desc:"Stanchezza -10%",  fatigueReduce:0.90},
    {label:"Esperto",cost:420, desc:"Stanchezza -20%",  fatigueReduce:0.80},
    {label:"Elite",  cost:840, desc:"Stanchezza -30%",  fatigueReduce:0.70},
  ]},
  mental:{name:"Mental Coach",icon:"🧠",levels:[
    {label:"Base",   cost:350,  desc:"Bonus +50% efficacia", bonusBoost:1.50},
    {label:"Esperto",cost:700,  desc:"Bonus +80% efficacia", bonusBoost:1.80},
    {label:"Elite",  cost:1400, desc:"Bonus +120% efficacia",bonusBoost:2.20},
  ]},
  sparring:{name:"Sparring Partner",icon:"🎾",levels:[
    {label:"Base",   cost:175, desc:"+0.15 stat/sett · rank ≤250", weeklyGain:0.15},
    {label:"Esperto",cost:350, desc:"+0.30 stat/sett · rank ≤250", weeklyGain:0.30},
    {label:"Elite",  cost:700, desc:"+0.45 stat/sett · rank ≤250", weeklyGain:0.45},
  ]},
  physio:{name:"Fisioterapista",icon:"🏥",levels:[
    {label:"Base",   cost:245, desc:"Jet lag -30% · Recupero +3/sett", jetLagReduce:0.30, recoveryBonus:3},
    {label:"Esperto",cost:490, desc:"Jet lag -55% · Recupero +6/sett", jetLagReduce:0.55, recoveryBonus:6},
    {label:"Elite",  cost:980, desc:"Jet lag -75% · Recupero +10/sett",jetLagReduce:0.75, recoveryBonus:10},
  ]},
};
function getStaffLevel(staff,key){const lv=staff[key]||0;if(!lv)return null;return{...STAFF_LEVELS[key].levels[lv-1],key,lv};}
function getStaffWeeklyCost(staff){return Object.keys(STAFF_LEVELS).reduce((t,k)=>{const lv=staff[k]||0;return t+(lv>0?STAFF_LEVELS[k].levels[lv-1].cost:0);},0);}

// ═══════════════════════════════════════════════════
// INVESTIMENTI & LEGACY
// Tre categorie: Infrastruttura (one-shot), Team esteso (costo settimanale),
// Legacy/Brand (mista, alcune con rendita passiva differita).
// Il valore stored per ogni chiave è l'anno di acquisto (null/undefined = non posseduto).
// ═══════════════════════════════════════════════════
// refundPct: quota rimborsata alla dismissione (0 = servizio senza asset)
// dismissMorale: malus morale applicato alla dismissione (0 = nessuno)
// Servizi (team) si interrompono senza rimborso; asset (infra/academy/brand) si vendono a perdita;
// la fondazione è l'unica con costo narrativo esplicito perché chiuderla è un danno reputazionale.
const INVESTMENTS={
  center:{
    icon:"🏟️", name:"Centro di allenamento privato", category:"infra",
    cost:300000, weeklyCost:0, rankGate:150, refundPct:0.50, dismissMorale:0,
    summary:"Struttura di proprietà, allenamenti mirati.",
    pros:["+1 crescita stat/settimana (come sparring base)","Fatica -1/sett aggiuntiva"],
    cons:[],
  },
  residence:{
    icon:"🏡", name:"Residenza con campi", category:"infra",
    cost:400000, weeklyCost:0, rankGate:100, refundPct:0.50, dismissMorale:0,
    summary:"Casa con campi privati.",
    pros:["Vitto & alloggio = 0 nelle settimane senza torneo"],
    cons:[],
  },
  jet:{
    icon:"✈️", name:"Jet privato", category:"infra",
    cost:1000000, weeklyCost:0, rankGate:30, refundPct:0.50, dismissMorale:0,
    summary:"Voli su misura, zero imprevisti.",
    pros:["Immunità a 'Volo cancellato'","Jet-lag dimezzato su ogni spostamento"],
    cons:[],
  },
  nutritionist:{
    icon:"🥗", name:"Nutrizionista personale", category:"team",
    cost:50000, weeklyCost:577, rankGate:200, refundPct:0, dismissMorale:0,
    summary:"Piano alimentare dedicato, longevità.",
    pros:["-50% decadimento stat età","+1 recupero fatica/sett"],
    cons:["Costo ricorrente ~€30k/anno"],
  },
  conditioner:{
    icon:"🏃", name:"Preparatore atletico senior", category:"team",
    cost:80000, weeklyCost:1538, rankGate:150, refundPct:0, dismissMorale:0,
    summary:"Preparazione d'élite, meno infortuni.",
    pros:["-40% probabilità trigger infortuni","Prestazione fisica più stabile"],
    cons:["Costo ricorrente ~€80k/anno"],
  },
  biomech:{
    icon:"🔬", name:"Biomeccanico / video team", category:"team",
    cost:60000, weeklyCost:962, rankGate:100, refundPct:0, dismissMorale:0,
    summary:"Analisi tecnica costante.",
    pros:["Immunità a 'Regressione tecnica'","'Dubbi sul gioco' −50% probabilità"],
    cons:["Costo ricorrente ~€50k/anno"],
  },
  foundation:{
    icon:"🌟", name:"Fondazione benefica", category:"legacy",
    cost:250000, weeklyCost:577, rankGate:50, refundPct:0, dismissMorale:-8,
    summary:"Progetto sociale di lungo periodo.",
    pros:["+5 morale a inizio stagione","Floor morale a 35 (non scende sotto)"],
    cons:["Costo ricorrente ~€30k/anno","Chiuderla costa −8 morale (danno reputazionale)"],
  },
  academy:{
    icon:"🎾", name:"Accademia giovanile", category:"legacy",
    cost:300000, weeklyCost:0, weeklyIncome:1538, incomeDelayYears:2, rankGate:80, refundPct:0.50, dismissMorale:0,
    summary:"Formazione nuove leve, ritorno passivo dopo avviamento.",
    pros:["+€80k/anno dopo 2 anni di avviamento","Prestigio e networking","Rivendita al 70% se già in rendita (≥2 anni)"],
    cons:["Investimento lungo, ROI dal 3° anno"],
  },
  brand:{
    icon:"👕", name:"Linea di abbigliamento", category:"legacy",
    cost:200000, weeklyCost:0, weeklyIncome:769, rankGate:50, refundPct:0.40, dismissMorale:0,
    summary:"Brand personale, rendita immediata ma più esposizione.",
    pros:["+€40k/anno da subito"],
    cons:["Raddoppia la probabilità di 'Scandalo mediatico'"],
  },
};
// Cooldown di ri-acquisto dopo dismissione (in settimane). Evita gaming buy-sell.
const INVESTMENT_REBUY_COOLDOWN=26;
// 0 se disponibile, altrimenti settimane rimanenti prima di poter riacquistare
function investmentRebuyCooldown(player,id,currentYear,currentWeek){
  const cd=(player.investmentsCooldown||{})[id];
  if(!cd) return 0;
  const nowGlobal=currentYear*51+currentWeek;
  return Math.max(0,cd-nowGlobal);
}
// Calcola rimborso dismissione — tiene conto della regola speciale Accademia ≥2 anni
function computeDismissRefund(player,id,currentYear){
  const def=INVESTMENTS[id]; if(!def) return 0;
  let pct=def.refundPct||0;
  if(id==="academy"){
    const purchaseYear=(player.investments||{})[id]||currentYear;
    if((currentYear-purchaseYear)>=2) pct=0.70;
  }
  return Math.round(def.cost*pct);
}

// Quali investimenti possiede? Ritorna mappa id → anno-acquisto (o null).
function getInvestments(player){return player?.investments||{};}
function hasInvestment(player,id){const inv=getInvestments(player);return !!(inv&&inv[id]);}
// Anni trascorsi dall'acquisto (0 se acquistato nell'anno corrente)
function investmentAge(player,id,currentYear){const y=getInvestments(player)[id];return y?Math.max(0,currentYear-y):null;}
// Costo settimanale ricorrente totale
function getInvestmentsWeeklyCost(player){const inv=getInvestments(player);return Object.entries(INVESTMENTS).reduce((t,[k,def])=>t+(inv[k]?(def.weeklyCost||0):0),0);}
// Rendita passiva settimanale totale (rispetta incomeDelayYears)
function getInvestmentsWeeklyIncome(player,currentYear){
  const inv=getInvestments(player);
  return Object.entries(INVESTMENTS).reduce((t,[k,def])=>{
    if(!inv[k]||!def.weeklyIncome)return t;
    const yrs=currentYear-inv[k];
    if((def.incomeDelayYears||0)>yrs)return t;
    return t+(def.weeklyIncome||0);
  },0);
}


