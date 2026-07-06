// ═══════════════════════════════════════════════════════════════════
// HARNESS — simula N anni di solo-NPC world usando il codice REALE
// del gioco: js/game_data.js + js/engine.js + js/npc_system.js
// Uso: node tools/sim_harness.js [anni] [repliche] [seed]
// ═══════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO_DIR || path.join(__dirname, '..');

global.window = global;
global.React = { useState: () => {}, useEffect: () => {}, useRef: () => {} };
require(path.join(REPO, 'js/npc_system.js'));

// Codice reale del gioco (script classici senza JSX, eval-uati in un unico
// scope insieme all'esperimento per condividere const/let top-level)
const src = fs.readFileSync(path.join(REPO, 'js/game_data.js'), 'utf8') + '\n' +
            fs.readFileSync(path.join(REPO, 'js/engine.js'), 'utf8');

const YEARS = parseInt(process.argv[2] || '10', 10);
const REPS = parseInt(process.argv[3] || '3', 10);
const BASESEED = parseInt(process.argv[4] || '12345', 10);

// PRNG seedabile per Math.random (riproducibilità dei tornei)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EXPERIMENT = `
;(function(){
  const YEARS=${YEARS}, REPS=${REPS};
  const spearman=(a,b)=>{ // a,b: array di rank appaiati
    const n=a.length; if(!n) return NaN;
    const ma=a.reduce((s,x)=>s+x,0)/n, mb=b.reduce((s,x)=>s+x,0)/n;
    let num=0,da=0,db=0;
    for(let i=0;i<n;i++){num+=(a[i]-ma)*(b[i]-mb);da+=(a[i]-ma)**2;db+=(b[i]-mb)**2;}
    return num/Math.sqrt(da*db);
  };
  const agg={};
  const addM=(k,v)=>{(agg[k]=agg[k]||[]).push(v);};

  for(let rep=0; rep<REPS; rep++){
    Math.random=global.__mkRng(${BASESEED}+rep*7919);
    // reset stato modulo
    for(const d of [npcForm,npcPersonalLevel,npcCareerPhase,npcYearsOutside150,npcYearsOutside250])
      Object.keys(d).forEach(k=>delete d[k]);
    let world=buildWorld();
    // snapshot iniziale
    const snap=(w)=>{const m={};Object.values(w).forEach(p=>{m[p.id]={rank:p.rank,pts:p.atpPoints,age:p.age,init:p.initRank,isRep:!!p.isReplacement};});return m;};
    const yearly=[snap(world)];
    let retiredTot=0;
    const no1Weekly=new Set(), top10Weekly=new Set();
    for(let y=1;y<=YEARS;y++){
      for(let wk=1;wk<=51;wk++){
        const r=simWeek(wk,world,y,{});
        world=r.newWorld;
        retiredTot+=r.retiredCount||0;
        no1Weekly.add(world[1].id);
        for(let rk=1;rk<=10;rk++) top10Weekly.add(world[rk].id);
      }
      yearly.push(snap(world));
    }
    // ── metriche ──
    const topSet=(s,n)=>new Set(Object.entries(s).filter(([,v])=>v.rank<=n).map(([id])=>id));
    const inter=(A,B)=>[...A].filter(x=>B.has(x)).length;
    for(const N of [10,20,50,100]){
      const t0=topSet(yearly[0],N);
      for(const Y of [1,3,5,Math.min(10,YEARS)]){
        if(Y>YEARS) continue;
        addM('top'+N+'_ret_y'+Y, inter(t0,topSet(yearly[Y],N))/N);
      }
    }
    // spearman anno-su-anno (giocatori presenti in entrambi)
    for(let y=1;y<=YEARS;y++){
      const A=yearly[y-1],B=yearly[y];
      const ids=Object.keys(A).filter(id=>B[id]);
      addM('spearman_yoy', spearman(ids.map(id=>A[id].rank), ids.map(id=>B[id].rank)));
    }
    // mobilità media |Δrank|/anno per fasce
    for(let y=1;y<=YEARS;y++){
      const A=yearly[y-1],B=yearly[y];
      let s=0,c=0,sT50=0,cT50=0;
      Object.keys(A).forEach(id=>{ if(!B[id])return;
        const d=Math.abs(A[id].rank-B[id].rank); s+=d;c++;
        if(A[id].rank<=50){sT50+=d;cT50++;}
      });
      addM('absDrank_all', s/c); addM('absDrank_top50', sT50/cT50);
    }
    // numero di #1 distinti e membri top10 distinti nell'arco
    addM('distinct_no1', no1Weekly.size); addM('distinct_top10', top10Weekly.size);
    // giovani: quota di under-22 iniziali (rank 30-300) che guadagnano ≥60 posizioni in 3 anni
    if(YEARS>=3){
      const A=yearly[0],B=yearly[3];
      let up=0,tot=0;
      Object.keys(A).forEach(id=>{const a=A[id]; if(a.age<22&&a.rank>=30&&a.rank<=300){tot++;
        if(B[id]&&a.rank-B[id].rank>=60)up++;}});
      addM('young_breakout_3y', tot?up/tot:NaN);
    }
    // anziani: quota dei 30+ iniziali top-100 che perdono ≥30 posizioni in 3 anni (o ritirati)
    if(YEARS>=3){
      const A=yearly[0],B=yearly[3];
      let down=0,tot=0;
      Object.keys(A).forEach(id=>{const a=A[id]; if(a.age>=30&&a.rank<=100){tot++;
        if(!B[id]||B[id].rank-a.rank>=30)down++;}});
      addM('old_decline_3y', tot?down/tot:NaN);
    }
    // newgen: miglior rank raggiunto da replacement entro fine periodo
    const last=yearly[YEARS];
    const repRanks=Object.values(last).filter(v=>v.isRep).map(v=>v.rank).sort((a,b)=>a-b);
    addM('best_newgen_rank', repRanks[0]||999);
    addM('newgen_in_top50', repRanks.filter(r=>r<=50).length);
    addM('retired_per_year', retiredTot/YEARS);
  }
  const fmt=x=>Number.isFinite(x)?(Math.abs(x)>=10?x.toFixed(1):x.toFixed(3)):'—';
  const out={};
  Object.keys(agg).forEach(k=>{
    const v=agg[k]; const m=v.reduce((s,x)=>s+x,0)/v.length;
    const sd=Math.sqrt(v.reduce((s,x)=>s+(x-m)**2,0)/v.length);
    out[k]={mean:+fmt(m), sd:+fmt(sd)};
  });
  console.log(JSON.stringify(out,null,1));
})();
`;

global.__mkRng = mulberry32;
// eslint-disable-next-line no-eval
eval(src + '\n' + EXPERIMENT);
