// Debug rapido: top-5 del ranking NPC anno per anno (10 anni, seed fisso).
// Uso: node tools/sim_debug_top5.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO_DIR || path.join(__dirname, '..');
global.window = global;
global.React = { useState: () => {}, useEffect: () => {}, useRef: () => {} };
require(path.join(REPO, 'js/npc_system.js'));
const src = fs.readFileSync(path.join(REPO, 'js/game_data.js'), 'utf8') + '\n' +
            fs.readFileSync(path.join(REPO, 'js/engine.js'), 'utf8');
function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
global.__mkRng = mulberry32;
const EXP = `
;(function(){
  Math.random=global.__mkRng(999);
  let world=buildWorld();
  const no1Weekly=new Set();
  for(let y=1;y<=10;y++){
    for(let wk=1;wk<=51;wk++){
      const r=simWeek(wk,world,y,{});
      world=r.newWorld;
      no1Weekly.add(world[1].id);
    }
    const top=[1,2,3,4,5].map(rk=>{
      const p=world[rk];
      const lvl=Math.round(npcPersonalLevel[p.id]||0);
      return p.name.split(' ').pop()+'(id '+p.id+' eta '+p.age+' pts '+p.atpPoints+' lvl '+lvl+' ph '+(npcCareerPhase[p.id]||'st').slice(0,2)+')';
    }).join(' | ');
    console.log('Y'+y+': '+top);
  }
  console.log('#1 distinti (settimanali, 10 anni):', [...no1Weekly].join(', '));
})();
`;
eval(src + '\n' + EXP);
