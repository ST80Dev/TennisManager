// ═══════════════════════════════════════════════════════════════════════════
// NPC SYSTEM — gestione evoluzione, talento, ritiro e carriera NPC
// ═══════════════════════════════════════════════════════════════════════════
// Caricato come <script src="npc_system.js"> PRIMA del blocco Babel.
// Esporta window.NPC_SYSTEM. Il blocco Babel destruttura i simboli
// sotto i vecchi nomi per minimizzare l'impatto sul codice UI.
//
// Sottosistemi:
//   • Archetypes    — profili di carriera (peak, declino, volatilità)
//   • Lifecycle     — età di ritiro base + parametri età per settimana
//   • Talent        — talento nascosto → ceiling/floor ASSOLUTI di carriera
//                     (sostituisce la vecchia logica initRank/3 e initRank*8)
//   • CareerPhase   — fasi pluriennali: steady/breakthrough/slump
//   • EarlyRetire   — ritiro anticipato stocastico (infortunio, burnout)
// ═══════════════════════════════════════════════════════════════════════════

(function(global){
  'use strict';

  // ── ARCHETIPI NPC ─────────────────────────────────────────────────────
  const ARCHETYPES = {
    Precoce:     {peak_age:22, decline_onset:26, resilience:0.55, volatility:0.18},
    Progressivo: {peak_age:26, decline_onset:30, resilience:0.70, volatility:0.12},
    Tardivo:     {peak_age:28, decline_onset:33, resilience:0.75, volatility:0.10},
    Costante:    {peak_age:25, decline_onset:31, resilience:0.80, volatility:0.08},
    Volatile:    {peak_age:24, decline_onset:29, resilience:0.50, volatility:0.30},
  };
  const FIXED_ARCHETYPE = {
    1:"Progressivo", 2:"Precoce",   3:"Tardivo",     4:"Costante",
    5:"Costante",    6:"Progressivo", 7:"Precoce",    8:"Volatile",
    9:"Costante",   10:"Progressivo",
  };
  function getArchetype(rank){
    if(FIXED_ARCHETYPE[rank]) return ARCHETYPES[FIXED_ARCHETYPE[rank]];
    const keys=Object.keys(ARCHETYPES);
    return ARCHETYPES[keys[Math.abs(rank*31+7)%keys.length]];
  }
  function calcFormMult(p, arch){
    const age = p.age || 25;
    const dist = age - arch.peak_age;
    let base;
    if(dist <= 0){
      base = 1.0 + Math.min(0.12, (-dist) * 0.015);
    } else if(age <= arch.decline_onset){
      base = 1.0 - dist * 0.02;
    } else {
      const overDecline = age - arch.decline_onset;
      base = (1.0 - dist * 0.02) - overDecline * arch.resilience * 0.03;
    }
    return Math.max(0.75, Math.min(1.20, base));
  }

  // ── HASH DETERMINISTICO PER NPC ID ───────────────────────────────────
  // Estrae la parte numerica dell'id ("p42", "pR2_3") e restituisce un intero.
  function parseIdInt(npcId){
    if(!npcId) return 400;
    const m=String(npcId).match(/(\d+)/g);
    if(!m||!m.length) return 400;
    let n=0;
    m.forEach((s,i)=>{ n+=parseInt(s,10)*(i===0?1:1000); });
    return n||400;
  }
  function mix(seed){
    let h=seed|0;
    h=(h^(h>>>16))*0x45d9f3b|0;
    h=(h^(h>>>13))*0x45d9f3b|0;
    h=(h^(h>>>16))&0x7fffffff;
    return h;
  }

  // ── RETIRE AGE — distribuzione più ampia (sess.50) ────────────────────
  // Vecchia: 25% 33-35 · 65% 36-38 · 10% 39-41
  // Nuova:   30% 32-34 · 55% 35-37 · 12% 38-40 · 3% 41-43
  function getRetireAge(npcId){
    const id=parseIdInt(npcId);
    const h=mix(id*6173+99991);
    const r=(h%10000)/10000;
    const extra=Math.floor((h>>>8)%3);
    if(r<0.30) return 32+extra;
    if(r<0.85) return 35+extra;
    if(r<0.97) return 38+extra;
    return 41+extra;
  }

  // ── AGE PARAMS ────────────────────────────────────────────────────────
  // win_mod / drift_mod / skip_prob per fascia età + char personale [-1,+1]
  function getAgeParams(npcId, age){
    const id=parseIdInt(npcId);
    const h=mix(id*7919+31337);
    const char=((h%1000)/500)-1.0;
    let bw,sw;
    if(age<20)      {bw=+0.020;sw=0.035;}
    else if(age<22) {bw=+0.018;sw=0.025;}
    else if(age<24) {bw=+0.006;sw=0.016;}
    else if(age<27) {bw= 0.000;sw=0.010;}
    else if(age<30) {bw=-0.018;sw=0.014;}
    else if(age<32) {bw=-0.038;sw=0.020;}
    else if(age<35) {bw=-0.062;sw=0.028;}
    else            {bw=-0.095;sw=0.040;}
    const win_mod=bw+char*sw;
    let bd,sd;
    if(age<20)      {bd=+0.0018;sd=0.0018;}
    else if(age<22) {bd=+0.0010;sd=0.0012;}
    else if(age<24) {bd=+0.0003;sd=0.0007;}
    else if(age<27) {bd= 0.0000;sd=0.0005;}
    else if(age<30) {bd=-0.0009;sd=0.0007;}
    else if(age<32) {bd=-0.0020;sd=0.0012;}
    else if(age<35) {bd=-0.0035;sd=0.0018;}
    else            {bd=-0.0055;sd=0.0025;}
    const drift_mod=bd+char*sd;
    let bs,ss;
    if(age<27)      {bs=0.00;ss=0.00;}
    else if(age<30) {bs=0.06;ss=0.04;}
    else if(age<32) {bs=0.15;ss=0.07;}
    else if(age<35) {bs=0.27;ss=0.11;}
    else if(age<38) {bs=0.42;ss=0.15;}
    else            {bs=0.58;ss=0.18;}
    const skip_prob=Math.max(0,Math.min(0.80,bs-char*ss));
    return {win_mod,drift_mod,skip_prob,char};
  }

  // getDecayRate RIMOSSO (sess.51): decay fisso superseded dalla MR verso
  // personalLevel in simWeek Phase 1 — era codice morto mai chiamato.

  // ── CRESCITA GIOVANI (sess.51) ────────────────────────────────────────
  // Frazione ANNUA del gap (ceiling - personalLevel) recuperata da un giovane.
  // È il motore principale del ricambio generazionale: un newgen Elite/Legend
  // scala la classifica in 3-5 anni (traiettoria alla Sinner/Alcaraz),
  // un Journeyman si assesta nelle retrovie. Applicata settimanalmente
  // in simWeek come rate/51.
  // Picco di crescita a 19-20 anni (traiettoria reale: esplosione a 18-20,
  // non a 16-17 — un 17enne non deve entrare in top-5).
  function youngGrowthRate(age){
    if(age==null) return 0;
    if(age<18) return 0.10;
    if(age<19) return 0.20;
    if(age<21) return 0.30;
    if(age<23) return 0.20;
    if(age<25) return 0.12;
    if(age<27) return 0.06;
    return 0;
  }

  // ── FLOOR EFFETTIVO PER ETÀ (sess.51) ────────────────────────────────
  // Il floor di talento protegge la carriera SOLO fino ai 30 anni: dopo,
  // sfuma esponenzialmente (×0.60 per anno oltre i 30) così i veterani
  // possono davvero uscire dal top 20/50/100 prima del ritiro.
  // Senza questo fade un Legend restava top-18 a vita (lock-in della vetta).
  function getEffectiveFloorPts(floorPts, age){
    if(age==null || age<=30) return floorPts;
    return Math.max(5, floorPts*Math.pow(0.60, age-30));
  }

  // Cap guadagno settimanale in punti — bonus giovani più aggressivo (sess.50)
  function getGainCap(rank,age){
    let cap;
    if(rank<=10)  cap=500;
    else if(rank<=30)  cap=200;
    else if(rank<=80)  cap=95;
    else if(rank<=150) cap=42;
    else if(rank<=250) cap=22;
    else cap=14;
    // Giovani: bonus più alto e più esteso (sess.50)
    // <21: ×3.0 (era 2.5) · <24: ×2.0 (era 1.8) · <27: ×1.3 (nuovo)
    if(age!=null&&age<21) return Math.round(cap*3.0);
    if(age!=null&&age<24) return Math.round(cap*2.0);
    if(age!=null&&age<27) return Math.round(cap*1.3);
    return cap;
  }

  // ── TALENTO — determina ceiling/floor ASSOLUTI di carriera ─────────────
  // Sostituisce la vecchia logica initRank/3 (ceiling) e initRank*8 (floor).
  // 7 tiers. Distribuzione per NEWGEN (replacement): pesata da random id.
  // Per ORIGINALI (ATP400): dedotta dall'initRank (osservabile dalla classifica reale).
  //
  // Il talento è la CAPACITÀ di carriera, non il livello attuale.
  // Un rank 80 "Great" può nel tempo raggiungere #8.
  // Un rank 30 "VeryGood" può raggiungere #15.
  // Un rank 10 "Elite" se perde momentum può cadere a #30.
  const TALENT_TIERS = {
    Legend:    {ceilRank:1,   floorRank:18},
    Elite:     {ceilRank:3,   floorRank:35},
    Great:     {ceilRank:8,   floorRank:65},
    VeryGood:  {ceilRank:15,  floorRank:130},
    Good:      {ceilRank:35,  floorRank:220},
    Solid:     {ceilRank:85,  floorRank:360},
    Journeyman:{ceilRank:180, floorRank:500},
  };
  // Tier dal rank iniziale (giocatori reali ATP400)
  function tierFromInitRank(initRank){
    if(initRank<=3)   return "Legend";
    if(initRank<=10)  return "Elite";
    if(initRank<=20)  return "Great";
    if(initRank<=40)  return "VeryGood";
    if(initRank<=80)  return "Good";
    if(initRank<=150) return "Solid";
    return "Journeyman";
  }
  // Hidden talent upgrade: 10% degli NPC in fascia 41-200 hanno talento
  // nascosto (1 tier sopra la baseline) — produce "breakout candidates".
  function hasHiddenTalent(npcId,initRank){
    if(initRank<41||initRank>200) return false;
    const id=parseIdInt(npcId);
    const h=mix(id*5281+41453);
    return (h%100)<10; // 10%
  }
  // Tier random pesato per NEWGEN — ricalibrata (sess.51, prima 3%/6%/11%):
  // con ~36 ritiri/anno la vecchia distribuzione produceva ~1 Legend e ~2 Elite
  // OGNI anno → vetta affollata di predestinati e curva punti compressa.
  // Ora: 1% Legend (~1 ogni 3 anni) · 3% Elite (~1/anno) · 7% Great ·
  // 14% VeryGood · 22% Good · 28% Solid · 25% Journeyman
  function tierFromRandom(npcId){
    const id=parseIdInt(npcId);
    const h=mix(id*8291+55771);
    const r=(h%10000)/10000;
    if(r<0.01) return "Legend";
    if(r<0.04) return "Elite";
    if(r<0.11) return "Great";
    if(r<0.25) return "VeryGood";
    if(r<0.47) return "Good";
    if(r<0.75) return "Solid";
    return "Journeyman";
  }
  // ── REALIZZAZIONE DEL TALENTO (sess.51) ───────────────────────────────
  // Non tutti realizzano il pieno potenziale: la crescita giovanile punta a
  // floor + r×(ceiling−floor) con r∈[0.45,1.0] personale. Durante un
  // "breakthrough" il target sale al ceiling pieno → le fasi di carriera
  // decidono CHI tra i talenti sfonda davvero.
  function talentRealization(npcId){
    const id=parseIdInt(npcId);
    const h=mix(id*9433+77143);
    return 0.45+((h%1000)/1000)*0.55;
  }
  // API principale: restituisce {tier, ceilRank, floorRank}
  // isNewgen=true → tier da random. Altrimenti → tier da initRank (+ upgrades).
  // initAge (opzionale, sess.51): età al momento dell'ingresso nel world.
  // Un ORIGINALE giovane a rank modesto ha upside reale (i 18enni a rank 250
  // non sono journeyman a vita): upgrade probabilistico del tier per initAge.
  function getTalent(npcId, initRank, isNewgen, initAge){
    const order=["Journeyman","Solid","Good","VeryGood","Great","Elite","Legend"];
    const up=(tier,steps)=>{
      const idx=order.indexOf(tier);
      return order[Math.min(order.length-1, Math.max(0,idx)+steps)];
    };
    let tier;
    if(isNewgen){
      tier=tierFromRandom(npcId);
    } else {
      tier=tierFromInitRank(initRank);
      if(hasHiddenTalent(npcId,initRank)) tier=up(tier,1);
      // Upgrade giovinezza (sess.51): initAge≤21 → 45% +1 tier (di cui 15% +2)
      // · 22-24 → 25% +1 tier. Deterministico per id.
      if(initAge!=null && initAge<=24 && initRank>20){
        const h=mix(parseIdInt(npcId)*3907+66403);
        const r=(h%1000)/1000;
        if(initAge<=21){
          if(r<0.15) tier=up(tier,2);
          else if(r<0.45) tier=up(tier,1);
        } else if(r<0.25){
          tier=up(tier,1);
        }
      }
    }
    const t=TALENT_TIERS[tier]||TALENT_TIERS.Journeyman;
    return {tier, ceilRank:t.ceilRank, floorRank:t.floorRank};
  }

  // ── CAREER PHASE — trend pluriennali ──────────────────────────────────
  // Ogni NPC ha una fase che modula il drift annuale:
  //   "steady"       — default, drift normale
  //   "breakthrough" — +drift, bias upward (×1.5, segno +)
  //   "slump"        — -drift, bias downward (×1.4, segno -)
  //   "peak"         — bloccato vicino al ceiling (rare, per hype top)
  //
  // Transizioni a isNewYear:
  //   steady → breakthrough: 9% (under 26) · 4% (26-29) · 1% (30+)
  //   steady → slump:        3% (under 28) · 6% (28-31) · 9% (32+)
  //   breakthrough → steady: 28%/anno (media 3.5 anni)
  //   slump → steady:        22%/anno (media 4.5 anni)
  //
  // Lo stato persiste in npcCareerPhase[id] = {phase, yearsIn}.
  function rollPhaseTransition(currentPhase, age, rngValue){
    const r=rngValue; // [0,1)
    if(currentPhase==="breakthrough"){
      if(r<0.28) return "steady";
      return "breakthrough";
    }
    if(currentPhase==="slump"){
      if(r<0.22) return "steady";
      return "slump";
    }
    // steady o undefined
    const pBreak=age<26?0.09:age<30?0.04:0.01;
    const pSlump=age<28?0.03:age<32?0.06:0.09;
    if(r<pBreak) return "breakthrough";
    if(r<pBreak+pSlump) return "slump";
    return "steady";
  }
  // Modulatore drift basato su fase
  function phaseDriftModifier(phase){
    if(phase==="breakthrough") return {magnitude:1.6, signBias:+0.65};
    if(phase==="slump")        return {magnitude:1.5, signBias:-0.65};
    return {magnitude:1.0, signBias:0.0};
  }

  // ── EARLY RETIREMENT — ritiri stocastici ──────────────────────────────
  // Oltre alla soglia d'età base, ogni anno un NPC può ritirarsi per:
  //   • infortunio di carriera (base 0.4%/anno se age≥25, raddoppia se age≥30)
  //   • burnout mentale se fuori dai top 150 da 3+ anni e age≥27
  //   • decisione personale se rank > 250 stabilmente e age≥29
  //
  // rngValue: numero deterministico in [0,1) — chiama con seed {id, year}.
  function shouldEarlyRetire({npcId, age, rank, yearsOutsideTop150, yearsOutsideTop250, rngValue}){
    if(age<25) return false;
    // Infortunio di carriera (cumulativo nell'anno)
    let p=0;
    if(age>=25) p+=0.004;
    if(age>=30) p+=0.006;
    if(age>=33) p+=0.010;
    // Burnout mentale
    if(age>=27 && (yearsOutsideTop150||0)>=3) p+=0.12;
    // Decisione personale
    if(age>=29 && (yearsOutsideTop250||0)>=2) p+=0.18;
    // Rank corrente molto basso per età avanzata
    if(age>=32 && rank>200) p+=0.10;
    if(age>=35 && rank>100) p+=0.15;
    return rngValue < p;
  }

  // ── GENERAZIONE NEWGEN — rank di partenza graduato dal talento (sess.50) ─
  // Vecchia: sempre rank 370-400 indipendentemente dal talento.
  // Nuova: talenti generazionali entrano a 180-250, talenti grandi a 250-330,
  // la maggioranza resta filler 350-400.
  function newgenStartingRank(tier, seed){
    const h=mix(seed);
    const r=(h%1000)/1000;
    switch(tier){
      case "Legend":    return 180+Math.floor(r*70); // 180-250
      case "Elite":     return 240+Math.floor(r*90); // 240-330
      case "Great":     return 280+Math.floor(r*90); // 280-370
      case "VeryGood":  return 320+Math.floor(r*70); // 320-390
      case "Good":      return 350+Math.floor(r*50); // 350-400
      case "Solid":     return 370+Math.floor(r*30); // 370-400
      default:          return 385+Math.floor(r*15); // 385-400
    }
  }

  // ── DISPLAY RANK — inserimento coerente del giocatore nella classifica ─
  // L'NPC world è sempre internamente numerato 1..500. Quando il giocatore
  // occupa una posizione, gli NPC a quella posizione e sotto vengono
  // visualizzati con rank +1 per evitare collisioni visive.
  //
  // playerRank: posizione unificata del giocatore (1..501)
  // npcInternalRank: rank dell'NPC nel world (1..500, solo NPC)
  function effectiveNpcDisplayRank(npcInternalRank, playerRank){
    if(!playerRank || playerRank<=0) return npcInternalRank;
    return npcInternalRank >= playerRank ? npcInternalRank+1 : npcInternalRank;
  }

  // ── API ESPORTATA ─────────────────────────────────────────────────────
  global.NPC_SYSTEM = {
    // Archetypes
    ARCHETYPES, FIXED_ARCHETYPE,
    getArchetype, calcFormMult,
    // Lifecycle
    getRetireAge, getAgeParams, getGainCap,
    youngGrowthRate, getEffectiveFloorPts,
    // Talent
    TALENT_TIERS,
    getTalent, hasHiddenTalent, tierFromInitRank, tierFromRandom,
    talentRealization,
    // Career phase
    rollPhaseTransition, phaseDriftModifier,
    // Early retirement
    shouldEarlyRetire,
    // Newgen
    newgenStartingRank,
    // Display
    effectiveNpcDisplayRank,
    // Utility
    parseIdInt, mix,
    // Versione (per migrate save / debug)
    VERSION: "1.1.0",
  };

})(typeof window!=="undefined"?window:globalThis);
