// ═══════════════════════════════════════════════════════════════════
// ATP CAREER MANAGER — MOTORE DI SIMULAZIONE
// Helpers, formule forza/probabilità, morale, buildWorld, generazione
// NPC, tabelloni (KO + round robin ATP Finals), simWeek (avanzamento
// settimanale del mondo), ranking, save/load/export/import.
// Script classico (no JSX, no moduli): le dichiarazioni top-level sono
// globali per il blocco Babel di index.html.
// Richiede: js/npc_system.js e js/game_data.js caricati prima.
// Eseguibile anche in Node (vedi tools/sim_harness.js).
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
const rng=(a,b)=>Math.random()*(b-a)+a;
const rngI=(a,b)=>Math.floor(rng(a,b+1));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=n=>(n||0).toLocaleString("it-IT");

function sv(seed){
  let h=seed*2654435761>>>0;h^=h>>>16;h=Math.imul(h,0x45d9f3b)>>>0;h^=h>>>16;
  return(h>>>0)/0xFFFFFFFF;
}
function pStr(stats,surface,bonusMods={},morale=50,fatigue=0,coachMatchMult=1.0,activeEvts=[]){
  const mod=SURF_MOD[surface]||SURF_MOD.Cemento;
  const s={...stats};
  Object.entries(bonusMods).forEach(([k,v])=>{if(s[k]!==undefined)s[k]=clamp(s[k]+v/3,1,35);});
  // Fatica: penalità attiva da 40%, max -25% a 100%
  const fatPen=Math.max(0,(fatigue-40)/60)*0.25;
  const base=s.servizio*mod.servizio*0.18+s.dritto*mod.dritto*0.16+s.rovescio*mod.rovescio*0.14
        +s.volee*mod.volee*0.10+s.velocita*mod.velocita*0.12+s.resistenza*0.15+s.mentale*0.15;
  // Morale asimmetrico: il crollo psicologico penalizza più della spinta positiva
  // sotto 50: ×0.06 (morale 0→×0.94) | sopra 50: ×0.05 (morale 100→×1.05)
  // Ridotto da 0.08/0.10 per evitare circolo vizioso morale→winP→morale
  const moraleCoeff=morale>=50?0.05:0.06;
  const moraleMult=1+(morale-50)/50*moraleCoeff;
  // Coach Tecnico: bonus permanente su pStr anche in torneo (1.5/3/5%)
  // Penalità/bonus da eventi attivi (clampato 0.65–1.15)
  let evtMult=1.0;
  for(const ae of (activeEvts||[])){
    if(ae.pStrPenalty) evtMult-=ae.pStrPenalty;
    if(ae.pStrBonus)   evtMult+=ae.pStrBonus;
  }
  evtMult=Math.max(0.65,Math.min(1.15,evtMult));
  return base*moraleMult*(1-fatPen)*coachMatchMult*evtMult;
}
function winP(a,b){const ak=Math.pow(a,2.5),bk=Math.pow(b,2.5);return clamp(ak/(ak+bk),0.05,0.95);}
// Calcola variazione morale dopo una partita
// won: bool, isExit: finisce torneo, r: round (0=T1), totalRounds, oppRank vs playerRank
function calcMoraleShift(won,isExit,r,totalRounds,oppRank,playerRank,startWinPct,startMorale,pureWinPct){
  // Formula: nextMorale = startMorale + shift
  // startWinPct: win% calcolata col morale corrente (già gonfiata)
  // pureWinPct:  win% calcolata a morale=50, fatica=0 — misura obiettiva del vantaggio tecnico
  //              Driver principale dell'upset: se eri favorito tecnico e perdi = colpo basso
  // startMorale: morale di partenza — scala il calo proporzionalmente
  let delta=0;
  const fromEnd=totalRounds-1-r;
  const wp=startWinPct!=null?startWinPct:50;
  const pwp=pureWinPct!=null?pureWinPct:wp;  // fallback a wp se pureWinPct mancante
  const sm=startMorale!=null?startMorale:50;
  const rankEff=Math.min(500,Math.max(1,playerRank||500));

  if(won){
    // Shift base vittoria per turno
    if(fromEnd===0)      delta=10;  // finale
    else if(fromEnd===1) delta=8;   // semi
    else if(fromEnd===2) delta=6;   // quarti
    else                 delta=4;   // T1/T2/ottavi

    // Bonus upset da win% PURA — upset veri quando eri sfavorito tecnicamente
    if(pwp<25)      delta+=7;
    else if(pwp<35) delta+=5;
    else if(pwp<42) delta+=3;
    else if(pwp<50) delta+=1;

    // Bonus rank relativo con scala radice (efficace anche per rd piccoli)
    if(oppRank>0&&rankEff>0){
      const rd=rankEff-oppRank;
      if(rd>0) delta+=Math.min(Math.round(3*Math.sqrt(rd/30)),6);
    }

    // Vittorie non finali: shift ridotto
    if(!isExit){
      delta=delta>=9?Math.round(delta*0.75):Math.round(delta*0.60);
    }

    // Cap contestuale vittoria: rendimento decrescente ad alto morale
    // <65: pieno · 65-80: →50% · 80-90: →35% · >90: →15%
    if(sm>65){
      const capF=sm<=80?1.0-((sm-65)/15)*0.50:sm<=90?0.35:0.15;
      delta=Math.max(1,Math.round(delta*capF));
    }

  } else {
    // Shift base sconfitta — uguale per tutti i turni
    delta=-3;

    // DRIVER PRINCIPALE: pureWinPct — misura obiettiva di quanto eri favorito
    // Soglie: <55 / 55-60 / 60-68 / >68
    // Il calo è proporzionale al morale di partenza: più eri su, più cadi
    if(pwp>=68){
      // Netto favorito: calo severo, porta morale verso 45-52
      const upset=Math.round((sm-47)*0.85);
      delta-=Math.max(upset,8);
    } else if(pwp>=60){
      // Favorito: calo che porta morale verso 57-64
      const upset=Math.round((sm-57)*0.75);
      delta-=Math.max(upset,5);
    } else if(pwp>=55){
      // Lieve favorito: calo moderato, porta morale verso 65-72
      const upset=Math.max(0,Math.round((sm-67)*0.60));
      delta-=Math.max(upset,2);
    }
    // pwp<55: solo base -3 (equilibrata o sfavorito — perdere era plausibile)

    // Rank relativo con scala radice quadrata
    if(oppRank>0&&rankEff>0){
      const rd=oppRank-rankEff;
      if(rd>0) delta-=Math.min(Math.round(3*Math.sqrt(rd/30)),6);
    }

    // Smorzamento sconfitta quando morale già basso (sotto 35)
    if(sm<35){
      const dampFactor=0.50+(sm/35)*0.50;
      delta=Math.round(delta*dampFactor);
    }
  }
  return delta;
}
function getStatColor(v){const p=v/35*100;return p>=80?"#10b981":p>=60?"#3b82f6":p>=40?"#f59e0b":"#ef4444";}
function getRankLabel(r){
  if(r===1)return"🏆 N°1 al Mondo";if(r<=4)return"🥇 Top 4";if(r<=10)return"🌟 Top 10";
  if(r<=20)return"💎 Top 20";if(r<=50)return"💪 Top 50";if(r<=100)return"✅ Top 100";
  if(r<=200)return"📈 Top 200";if(r<=300)return"🔰 Top 300";if(r<=400)return"⬇️ Top 400";
  return"🌱 Fuori classifica";
}
// Restituisce il rank da mostrare nella UI: ">400" se sotto il floor della nuova curva
function rankDisplay(player){
  // Mostra rank esatto sempre — ">400" solo se completamente fuori classifica (<5pts)
  if((player.atpPoints||0)<5)return"FC";
  return "#"+(player.rank||500);
}
// True se il giocatore è fuori dal ranking ufficiale (< 40 pts con nuova curva)
function isOutOfRanking(player){
  return (player.atpPoints||0)<5;
}
function canEnter(rank,type,outOfRanking=false){
  const tt=TT[type];if(!tt)return false;
  // Giocatori fuori ranking (pts < floor) possono entrare solo nei ChallengerB
  if(outOfRanking) return type==="ITF";
  const ok=rank<=tt.minRank;const ceil=tt.rankCeiling;
  return ok&&(ceil===undefined||rank>=ceil);
}


// Name pools per nationality — 20 nomi per pool per ridurre collisioni
const NAT_NAMES={
  ITA:{fn:["Lorenzo","Matteo","Luca","Marco","Andrea","Filippo","Gianluca","Stefano","Federico","Alessandro","Davide","Simone","Nicolo","Fabio","Riccardo","Giorgio","Paolo","Enzo","Tommaso","Cristian"],
       ln:["Rossi","Ferrari","Conti","Ricci","Mancini","Greco","Pellegrini","Vitali","Fabbri","Ferrara","Romano","Colombo","Esposito","Marchetti","Barbieri","Caruso","Gentile","Leone","Monti","Palumbo"]},
  ESP:{fn:["Pablo","Alejandro","Roberto","Javier","Diego","Miguel","Sergio","Pedro","Antonio","Marcos","Carlos","Andres","Rafael","Alvaro","Ivan","David","Adrian","Jorge","Victor","Ruben"],
       ln:["Garcia","Lopez","Martinez","Sanchez","Romero","Torres","Navarro","Molina","Castro","Herrera","Jimenez","Moreno","Ruiz","Fernandez","Diaz","Alonso","Vega","Ramos","Reyes","Ortega"]},
  FRA:{fn:["Antoine","Hugo","Theo","Maxime","Clement","Baptiste","Romain","Julien","Pierre","Nicolas","Lucas","Tom","Mathis","Enzo","Kevin","Quentin","Alexis","Vincent","Simon","Florian"],
       ln:["Martin","Bernard","Dupont","Lefebvre","Moreau","Laurent","Michel","Blanc","Perrin","Garnier","Fontaine","Chevalier","Robin","Girard","Rousseau","Lecomte","Boyer","Renard","Clement","Marchand"]},
  GER:{fn:["Felix","Maximilian","Jonas","Leon","Niklas","Tobias","Stefan","Florian","Kai","Marc","Lukas","Jan","Fabian","Sebastian","Moritz","Philipp","Alexander","Simon","Daniel","Christian"],
       ln:["Muller","Schmidt","Becker","Koch","Weber","Wagner","Fischer","Zimmermann","Hartmann","Hoffmann","Richter","Klein","Wolf","Schroeder","Neumann","Schwarz","Braun","Krause","Werner","Lehmann"]},
  GBR:{fn:["Jack","Oliver","Harry","James","George","Charlie","Alfie","Liam","Noah","Oscar","Ethan","Leo","Freddie","Archie","Henry","Louis","Theo","Arthur","Max","Finley"],
       ln:["Smith","Jones","Taylor","Brown","Wilson","Evans","Davies","Roberts","Hughes","Johnson","Walker","Wright","Green","Hall","Wood","Clarke","Hill","White","Thompson","Morris"]},
  SRB:{fn:["Nikola","Stefan","Aleksandar","Lazar","Milos","Marko","Dusan","Uros","Jovan","Nemanja","Bogdan","Dejan","Nenad","Predrag","Vuk","Petar","Dragan","Filip","Vladan","Zoran"],
       ln:["Jovic","Petrovic","Nikolic","Markovic","Pavlovic","Stojanovic","Ivanovic","Rakic","Djordjevic","Lazic","Milosevic","Stankovic","Todorovic","Popovic","Milovanovic","Radovic","Vukovic","Stevanovic","Djukic","Andric"]},
  AUT:{fn:["Lukas","Florian","Tobias","Stefan","Dominik","Markus","Christoph","Michael","Thomas","Alexander","Bernhard","Patrick","Andreas","Klaus","Georg","Matthias","Hans","Kurt","Rene","Peter"],
       ln:["Huber","Gruber","Wagner","Pichler","Steiner","Schwarz","Hofer","Bauer","Wimmer","Moser","Reiter","Leitner","Maier","Haas","Winkler","Egger","Berger","Fuchs","Auer","Mayer"]},
  CZE:{fn:["Tomas","Jakub","Ondrej","Jan","Lukas","Pavel","Martin","Michal","Jiri","David","Adam","Filip","Vojtech","Petr","Radek","Zdenek","Vaclav","Milan","Stanislav","Marek"],
       ln:["Blazik","Dvorak","Horacek","Cerny","Blazek","Kolar","Pospisil","Benes","Masaryk","Kadlec","Novotny","Svoboda","Novak","Kratochvil","Havel","Mares","Sedlacek","Vlcek","Ruzicka","Prochazka"]},
  POL:{fn:["Kamil","Michal","Piotr","Lukasz","Pawel","Marcin","Tomasz","Jakub","Mateusz","Kacper","Bartosz","Maciej","Rafal","Adrian","Artur","Marek","Szymon","Dawid","Radoslaw","Krzysztof"],
       ln:["Kowalski","Nowak","Wozniak","Wojcik","Kwiatkowski","Jankowski","Zielinski","Wisniewski","Duda","Wieczorek","Lewandowski","Kaminski","Szymanski","Wojciechowski","Kaczmarek","Piotrowiak","Grabowski","Pawlak","Michalski","Ostrowski"]},
  HUN:{fn:["Balazs","Attila","Gergely","Bence","Tamas","Zoltan","Gabor","Andras","Miklos","Peter","Adam","Akos","Botond","Csaba","Ferencz","Gusztav","Istvan","Krisztian","Levente","Roland"],
       ln:["Nagy","Kovacs","Toth","Szabo","Horvath","Varga","Kiss","Molnar","Fekete","Papp","Balogh","Nemeth","Farkas","Orban","Simon","Lakatos","Hegedus","Takacs","Vincze","Pinter"]},
  ROU:{fn:["Alexandru","Mihai","Andrei","Florin","Bogdan","Cristian","Marius","Radu","Cosmin","Tudor","Catalin","Dragos","Gabriel","Octavian","Razvan","Sorin","Vlad","Ciprian","Laurentiu","Silviu"],
       ln:["Popescu","Ionescu","Popa","Stanescu","Gheorghe","Marin","Dumitrescu","Stoica","Barbu","Moldovan","Constantin","Dinu","Avram","Luca","Matei","Neagu","Costea","Apostol","Draghici","Rusu"]},
  RUS:{fn:["Andrei","Dmitri","Alexei","Ivan","Pavel","Nikita","Artem","Kirill","Roman","Sergei","Maxim","Evgeny","Mikhail","Alexei","Vladislav","Denis","Oleg","Vitaly","Stanislav","Yaroslav"],
       ln:["Ivanov","Petrov","Sidorov","Volkonsky","Sokolov","Volkov","Kozlov","Novikov","Morozov","Fedorov","Orlov","Smirnov","Kuznetsov","Popov","Lebedev","Nikolaev","Stepanov","Borisov","Frolov","Andreev"]},
  USA:{fn:["Tyler","Brandon","Cody","Kyle","Austin","Ryan","Dylan","Chase","Tanner","Blake","Jordan","Ethan","Logan","Hunter","Nathan","Caleb","Derek","Garrett","Spencer","Zachary"],
       ln:["Johnson","Williams","Brown","Davis","Miller","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson","Clark","Lewis"]},
  ARG:{fn:["Santiago","Matias","Nicolas","Ezequiel","Leandro","Ignacio","Agustin","Rodrigo","Lucas","Maxi","Franco","Facundo","Emiliano","Tomas","Joaquin","Patricio","Hernan","Sebastian","Claudio","Marcelo"],
       ln:["Gonzalez","Rodriguez","Fernandez","Lopez","Perez","Alvarez","Romero","Torres","Gimenez","Acosta","Benitez","Suarez","Castro","Sosa","Blanco","Medina","Rojas","Gutierrez","Rios","Cardozo"]},
  BRA:{fn:["Gustavo","Thiago","Vinicius","Rodrigo","Felipe","Bruno","Rafael","Leonardo","Matheus","Gabriel","Caio","Leandro","Henrique","Renan","Igor","Murilo","Luciano","Adriano","Edson","Renato"],
       ln:["Silva","Santos","Oliveira","Souza","Costa","Ferreira","Rodrigues","Cavalcanti","Nascimento","Lima","Alves","Barbosa","Carvalho","Martins","Gomes","Ribeiro","Almeida","Machado","Moreira","Lopes"]},
  CHI:{fn:["Cristobal","Matias","Sebastian","Nicolas","Diego","Felipe","Bastian","Ignacio","Martin","Andres","Joaquin","Tomas","Gabriel","Pablo","Roberto","Rodrigo","Patricio","Marcos","Hernan","Jaime"],
       ln:["Gonzalez","Rojas","Fuentes","Morales","Contreras","Castillo","Vargas","Sepulveda","Valdes","Espinoza","Munoz","Reyes","Diaz","Soto","Araya","Flores","Mendez","Nunez","Pizarro","Sanchez"]},
  COL:{fn:["Sebastian","Alejandro","Camilo","Nicolas","Felipe","Andres","Santiago","Daniel","Mateo","Sergio","Juan","Carlos","David","Miguel","Luis","Ivan","Diego","Cristian","Jhon","Fabian"],
       ln:["Gomez","Hernandez","Torres","Ramirez","Jimenez","Castro","Vargas","Gutierrez","Moreno","Rios","Lopez","Martinez","Perez","Suarez","Cardona","Ospina","Molina","Restrepo","Salazar","Trujillo"]},
  AUS:{fn:["Liam","Noah","Oliver","William","Jack","Lucas","Henry","Owen","Ethan","James","Mason","Elijah","Aiden","Logan","Sebastian","Nathan","Caleb","Ryan","Tyler","Connor"],
       ln:["Smith","Jones","Williams","Brown","Wilson","Taylor","Johnson","White","Martin","Davis","Thompson","Anderson","Harris","Walker","Clarke","Robinson","Mitchell","Cooper","Ward","Morgan"]},
  JPN:{fn:["Ryoto","Kenji","Takashi","Hiroshi","Daiki","Yuki","Sota","Ren","Haruto","Yuto","Kaito","Riku","Sora","Hayato","Naoki","Shota","Yusei","Taichi","Kento","Ryusei"],
       ln:["Suzuki","Tanaka","Yamamoto","Nakamura","Watanabe","Ito","Kobayashi","Saito","Kato","Yamada","Hayashi","Inoue","Kimura","Matsumoto","Fujita","Ogawa","Nishimura","Hashimoto","Shimizu","Mori"]},
  KOR:{fn:["Minjun","Jiwon","Seunghyun","Jaehyun","Hyunwoo","Taehoon","Woojin","Jihoon","Yoonsik","Dohyun","Jungho","Seungwoo","Minseok","Donghyun","Jinyoung","Kyungjae","Sangmin","Taejun","Wonsuk","Hyunseok"],
       ln:["Kim","Lee","Park","Choi","Jung","Kang","Cho","Yoon","Jang","Lim","Han","Oh","Seo","Shin","Kwon","Na","Ryu","Bae","Ahn","Song"]},
  CHN:{fn:["Wei","Jianyu","Hao","Bolin","Cheng","Yifan","Minghao","Ruijie","Pengfei","Junhao","Xiang","Jiahao","Zihao","Haoran","Wenbo","Tianhao","Xinyu","Jingwei","Bowen","Zhenyu"],
       ln:["Liang","Li","Wang","Liu","Chen","Yang","Huang","Zhou","Wu","Xu","Sun","Ma","Zhu","Guo","He","Lin","Zheng","Cao","Xie","Peng"]},
  KAZ:{fn:["Timur","Aibek","Dauren","Aslan","Ruslan","Alibek","Daniyar","Arman","Sanzhar","Dias","Nursultan","Berik","Azamat","Yerlan","Bolat","Marat","Temirlan","Aidar","Zhandos","Adil"],
       ln:["Akhmetov","Bekzhanov","Kassymov","Omarov","Tulegenov","Bazarov","Seitenov","Abenov","Serikov","Issabekov","Dzhaksybekov","Nurmagambetov","Baisalov","Seidalin","Konysbayev","Akhanov","Amanov","Iskakov","Nurgaliev","Suleimenov"]},
  RSA:{fn:["Luca","Kyle","Ruan","Heinrich","Ricky","Anton","Zander","Dean","Marco","Bradley","Wynand","Jaco","Daan","Pieter","Riaan","Francois","Adriaan","Stefan","Werner","Leon"],
       ln:["van Schalkwyk","du Plessis","van der Merwe","Botha","Pretorius","Engelbrecht","Erasmus","Lombard","Joubert","Steyn","Coetzee","Fourie","Nel","Visser","du Toit","van Niekerk","Swanepoel","Strauss","Louw","de Villiers"]},
};
NAT_NAMES.DEFAULT={fn:["Alexis","Damian","Stefan","Lukas","Marco","David","Thomas","Jonas","Anton","Viktor","Mikael","Emil","Lars","Erik","Sven","Bjorn","Kai","Nils","Rolf","Hans"],
                   ln:["Petrov","Moreau","Garcia","Ionescu","Kovacs","Werner","Silva","Lopez","Torres","Blanc","Lindqvist","Eriksson","Andersen","Bergstrom","Gustafsson","Halvorsen","Jansen","Magnusson","Nielsen","Sorensen"]};

function genNameForRank(rank){
  const pool=["ESP","FRA","GER","ARG","BRA","CHI","RUS","AUT","CZE","POL","HUN","SRB","AUS","USA","JPN","CHN","KOR","KAZ","GBR","ITA","RSA","ROU","COL"];
  const nc=pool[Math.floor(sv(rank*31+7)*pool.length)];
  const p=NAT_NAMES[nc]||NAT_NAMES.DEFAULT;
  const fi=Math.floor(sv(rank*53+3)*p.fn.length);
  const li=Math.floor(sv(rank*97+11)*p.ln.length);
  const no=NATS.find(n=>n.c===nc)||NATS[0];
  return{name:p.fn[fi][0]+". "+p.ln[li],nat:no.f,age:Math.floor(18+sv(rank*13+5)*15)};
}
// Genera nome da seed arbitrario (usato per NPC replacement — evita collisioni di nome)
function genNameFromSeed(seed){
  const pool=["ESP","FRA","GER","ARG","BRA","CHI","RUS","AUT","CZE","POL","HUN","SRB","AUS","USA","JPN","CHN","KOR","KAZ","GBR","ITA","RSA","ROU","COL"];
  const nc=pool[Math.floor(sv(seed*31+7)*pool.length)];
  const p=NAT_NAMES[nc]||NAT_NAMES.DEFAULT;
  const fi=Math.floor(sv(seed*53+3)*p.fn.length);
  const li=Math.floor(sv(seed*97+11)*p.ln.length);
  const no=NATS.find(n=>n.c===nc)||NATS[0];
  return{name:p.fn[fi][0]+". "+p.ln[li],nat:no.f,age:Math.floor(18+sv(seed*13+5)*15)};
}

// Punti ATP reali per rank — interpolazione lineare su breakpoint reali 2026
function atpPtsForRank(rank){
  // Curva ricalibrata su dati reali ATP 2026 (sess.41)
  // Scala ~×0.80 della realtà. Rank 1=12000 · 100=390 · 200=195 · 400=40
  // Estesa fino a rank 500 per gli NPC "fuori top 400" (rank 401-500 < 40 pts)
  const bp=[
    [1,12000],[2,10000],[3,7500],[4,6500],[5,5800],
    [6,5200],[7,4800],[8,4400],[9,4100],[10,3800],
    [12,3300],[15,2700],[18,2200],[20,1900],
    [25,1640],[30,1380],
    [35,1200],[40,1000],[45,880],[50,800],
    [60,660],[70,560],[80,480],
    [90,430],[100,390],
    [115,335],[130,290],[150,265],
    [165,240],[175,225],[185,215],[200,195],
    [220,175],[240,158],[260,142],[265,138],
    [275,128],[290,118],[300,110],
    [315,100],[330,90],[345,81],
    [360,72],[375,62],[390,51],[400,40],
    [420,33],[440,26],[460,19],[480,12],[500,5]
  ];
  if(rank<=bp[0][0])return bp[0][1];
  if(rank>=bp[bp.length-1][0])return bp[bp.length-1][1];
  for(let i=0;i<bp.length-1;i++){
    const[r1,p1]=bp[i],[r2,p2]=bp[i+1];
    if(r1<=rank&&rank<=r2){
      const t=(rank-r1)/(r2-r1);
      return Math.max(1,Math.round(p1+t*(p2-p1)));
    }
  }
  return 1;
}
// Dato un totale di punti, restituisce il rank approssimativo
// Ritorna 400 se i punti sono sotto il floor del rank 400 (display ">400" gestito in UI)
// Pool teorico fisso: sum(atpPtsForRank(1..500)) — usato per normalizzazione stabile
const NPC_FIXED_POOL=(()=>{let s=0;for(let r=1;r<=500;r++)s+=atpPtsForRank(r);return s;})();
function rankForAtpPts(pts){
  if(pts<40)return 400; // sotto floor = rank 400 (display ">400" in UI)
  for(let r=1;r<=400;r++){if(atpPtsForRank(r)<=pts)return r;}
  return 400;
}

function buildWorld(){
  const w={};
  // Rank 1-200: nomi reali da ATP400
  ATP400.forEach(([rank,name,age,nat])=>{
    const base=rank<=4?33.5:rank<=8?31.5-(rank-4)*0.30:rank<=20?30.2-(rank-8)*0.35:rank<=50?26.0-(rank-20)*0.18:rank<=80?19.5-(rank-50)*0.117:rank<=100?12.5+(100-rank)*0.35:rank<=150?12.5-(rank-100)*0.030:rank<=200?11.0-(rank-150)*0.020:rank<=250?10.0-(rank-200)*0.010:rank<=300?9.5-(rank-250)*0.010:rank<=350?9.0-(rank-300)*0.010:Math.max(8.0,8.5-(rank-350)*0.010);
    const floor=rank<=4?28:rank<=8?25:rank<=20?21:rank<=50?16:rank<=100?12:rank<=150?10:rank<=200?9:rank<=250?8:7;
    const stats={};
    STAT_KEYS.forEach((k,i)=>{stats[k]=clamp(Math.round(base+sv(rank*100+i*17)*3-1.5),floor,35);});
    w[rank]={id:`p${rank}`,rank,initRank:rank,initAge:age,name,age,nat,stats,atpPoints:atpPtsForRank(rank)};
  });
  // Rank 201-500: nomi fittizi con genNameForRank
  for(let rank=201;rank<=500;rank++){
    if(w[rank])continue;
    const base=rank<=250?10.0-(rank-200)*0.010:rank<=300?9.5-(rank-250)*0.010:rank<=350?9.0-(rank-300)*0.010:rank<=400?Math.max(8.0,8.5-(rank-350)*0.010):Math.max(5.5,8.0-(rank-400)*0.025);
    const floor=rank<=250?8:rank<=400?7:Math.max(5,Math.floor(base-1.5));
    const stats={};
    STAT_KEYS.forEach((k,i)=>{stats[k]=clamp(Math.round(base+sv(rank*100+i*17)*3-1.5),floor,35);});
    const g=genNameForRank(rank);
    w[rank]={id:`p${rank}`,rank,initRank:rank,initAge:g.age,name:g.name,age:g.age,nat:g.nat,stats,atpPoints:atpPtsForRank(rank)};
  }
  return w;
}

function getATPPlayer(world,rank){
  if(world[rank])return world[rank];
  // World con gap al rank del giocatore (sess.50): ritorna NPC adiacente
  // invece di generare un NPC fittizio che collliderebbe col giocatore.
  if(world && Object.keys(world).length>100){
    if(world[rank+1]) return world[rank+1];
    if(world[rank-1]) return world[rank-1];
  }
  const base=rank<=4?33.5:rank<=8?31.5-(rank-4)*0.30:rank<=20?30.2-(rank-8)*0.35:rank<=50?27.5-(rank-20)*0.22:rank<=80?21.5-(rank-50)*0.133:rank<=100?14.5+(100-rank)*0.40:rank<=150?14.5-(rank-100)*0.055:rank<=200?11.75-(rank-150)*0.035:rank<=250?10.0-(rank-200)*0.018:rank<=300?9.1-(rank-250)*0.016:rank<=350?8.3-(rank-300)*0.014:rank<=400?Math.max(7.0,7.6-(rank-350)*0.012):Math.max(5.5,8.0-(rank-400)*0.025);
  const floor=rank<=4?28:rank<=8?25:rank<=20?21:rank<=50?17:rank<=100?13:rank<=150?11:rank<=200?9:rank<=250?8:rank<=400?7:Math.max(5,Math.floor(base-1.5));
  const stats={};
  STAT_KEYS.forEach((k,i)=>{stats[k]=clamp(Math.round(base+sv(rank*100+i*17)*3-1.5),floor,35);});
  const g=genNameForRank(rank);return{id:`p${rank}`,rank,name:g.name,age:g.age,nat:g.nat,stats,atpPoints:atpPtsForRank(rank)};
}

// Calcola stat effettive NPC basate sul RANK CORRENTE (non quello di origine)
// Il seed usa l'ID originale per preservare la "firma" del giocatore (chi è forte in servizio
// rimane relativamente più forte in servizio) ma i valori assoluti seguono il rank corrente.
// Risolve il bug: un ex-rank-50 sceso a rank-140 non deve avere stat da rank-50.
function npcEffectiveStat(id, currentRank){
  const origRank=parseInt((id||"p400").replace("p",""))||currentRank;
  const r=currentRank;
  const base=r<=4?33.5:r<=8?31.5-(r-4)*0.30:r<=20?30.2-(r-8)*0.35:r<=50?27.5-(r-20)*0.22:r<=80?21.5-(r-50)*0.133:r<=100?14.5+(100-r)*0.40:r<=150?14.5-(r-100)*0.055:r<=200?11.75-(r-150)*0.035:r<=250?10.0-(r-200)*0.018:r<=300?9.1-(r-250)*0.016:r<=350?8.3-(r-300)*0.014:r<=400?Math.max(7.0,7.6-(r-350)*0.012):Math.max(5.5,8.0-(r-400)*0.025);
  const floor=r<=4?28:r<=8?25:r<=20?21:r<=50?17:r<=100?13:r<=150?11:r<=200?9:r<=250?8:r<=400?7:Math.max(5,Math.floor(base-1.5));
  const stats={};
  STAT_KEYS.forEach((k,i)=>{stats[k]=clamp(Math.round(base+sv(origRank*100+i*17)*3-1.5),floor,35);});
  return stats;
}

// ── NPC LIFECYCLE / TALENT — alias da NPC_SYSTEM (vedi npc_system.js) ──
const getNPCRetireAge = window.NPC_SYSTEM.getRetireAge;
const getNPCAgeParams = window.NPC_SYSTEM.getAgeParams;
const getNPCGainCap   = window.NPC_SYSTEM.getGainCap;

// Moltiplicatori guadagno punti per tier
const NPC_PTS_MULT={Slam:0.22,M1000:0.24,ATP500:0.30,ATPFinals:0.30,ATP250:0.40,ChallengerA:0.68,ChallengerB:0.78,ITF:0.88};

// Ceiling/Floor di carriera basati sul TALENTO (sess.50).
// Sostituisce la vecchia logica initRank/3 (ceiling) e initRank*8 (floor):
// un rank 80 "Good" può raggiungere #35, un rank 40 "VeryGood" può arrivare #15,
// un rank 10 "Elite" se perde momentum può cadere a #35.
// Hidden talent 10% nella fascia 41-200 → upgrade di un tier.
function getNPCCareerBounds(npcId, initRank, initAge){
  // Newgen riconosciuti dall'id "pR..." (sess.51). PRIMA: isNewgen=initRank>=300,
  // ma dalla sess.50 i newgen di talento partono a rank 180-330 → i Legend/Elite
  // venivano riclassificati da tierFromInitRank come Journeyman (ceiling 180!):
  // nessun newgen poteva più sfondare. Conflitto sess.50 risolto.
  const isNewgen=String(npcId).startsWith("pR")||initRank>=300;
  const t=window.NPC_SYSTEM.getTalent(npcId, initRank, isNewgen, initAge);
  return {
    tier: t.tier,
    ceilPts: atpPtsForRank(Math.max(1, t.ceilRank)),
    floorPts: atpPtsForRank(Math.min(500, t.floorRank)),
  };
}

// Genera un NPC di sostituzione giovane.
// Rank di partenza graduato dal talento (sess.50):
// Legend 180-250 · Elite 240-330 · Great 280-370 · VeryGood 320-390
// Good 350-400 · Solid/Journeyman 370-400.
// Età 16-19 — talenti generazionali possono entrare a 16.
let _npcReplacementCounter=0;
function generateReplacementNPC(year,week){
  _npcReplacementCounter++;
  const seed=year*10000+week*100+_npcReplacementCounter;
  const id=`pR${year}_${_npcReplacementCounter}`;
  // Roll del tier prima del rank → coerenza tier ↔ rank di partenza
  const tier=window.NPC_SYSTEM.tierFromRandom(id);
  const rank=window.NPC_SYSTEM.newgenStartingRank(tier, seed);
  // Età: talenti top entrano più giovani (16-19 vs 17-19)
  const ageH=window.NPC_SYSTEM.mix(seed*911+17);
  const ageRange=(tier==="Legend"||tier==="Elite")?4:3;
  const ageBase=(tier==="Legend"||tier==="Elite")?16:17;
  const age=ageBase+Math.floor((ageH%ageRange));
  const pts=atpPtsForRank(rank);
  const g=genNameFromSeed(seed);
  const stats=npcEffectiveStat(id,rank);
  return{id,rank,initRank:rank,initAge:age,name:g.name,age,nat:g.nat,stats,atpPoints:pts,isReplacement:true,talentTier:tier};
}

// Costruisce un draw con seeding ATP corretto — sess.43
// Struttura a gruppi reale ATP/Slam:
// draw=128 (Slam): S1@0, S2@127, S3-4 metà, S5-8 quarti, S9-16 ottavi (1 per ottavo), S17-32 sedicesimi
// draw=64  (M1000/500/250): S1@0, S2@63, S3-4 metà, S5-8 quarti, S9-16 ottavi (1 per ottavo)
// draw=32  (Challenger): S1@0, S2@31, S3-4 metà, S5-8 quarti
function buildSeededDraw(players,drawSize){
  const draw=new Array(drawSize).fill(null);
  const rnd=(a)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const pl=(i)=>players[i]||null;

  // ── S1, S2: posizioni fisse agli estremi ──
  draw[0]=pl(0); draw[drawSize-1]=pl(1);

  // ── S3-4: uno per metà (estratti) ──
  const h=drawSize/2;
  const s34=rnd([pl(2),pl(3)]);
  draw[h-1]=s34[0]; draw[h]=s34[1];

  // ── S5-8: uno per quarto (estratti) ──
  const q=drawSize/4;
  if(drawSize>=16&&players.length>=8){
    const s58=rnd([pl(4),pl(5),pl(6),pl(7)]);
    // Le 4 posizioni "coda quarto": fondo del Q1, testa del Q2, fondo Q3, testa Q4
    [q-1, q, drawSize-q-1, drawSize-q].forEach((pos,i)=>{
      if(draw[pos]===null) draw[pos]=s58[i];
    });
  }

  // ── S9-16: uno per ottavo (draw=64 e draw=128) ──
  if(drawSize>=64&&players.length>=16){
    const ott=drawSize/8;
    // Posizioni "coda ottavo" — una per ottavo, escludendo quelle già occupate
    // Per draw=64: ottavi di 8 giocatori, code in pos 7,8,15,16,23,24,31,32 (escluse quelle con seed 1-8)
    // Per draw=128: ottavi di 16 giocatori
    const ottCandidates=[];
    for(let o=0;o<8;o++){
      const ottStart=o*ott, ottEnd=(o+1)*ott-1;
      // Posizioni "coda" dell'ottavo: le due posizioni centrali o i due estremi liberi
      for(const pos of [ottEnd, ottStart]){
        if(pos>=0&&pos<drawSize&&draw[pos]===null){
          ottCandidates.push(pos); break;
        }
      }
    }
    const s916=rnd([pl(8),pl(9),pl(10),pl(11),pl(12),pl(13),pl(14),pl(15)].filter(Boolean));
    // Distribuisci uno per ottavo (ottCandidates può avere meno di 8 slot liberi)
    s916.forEach((s,i)=>{ if(i<ottCandidates.length&&draw[ottCandidates[i]]===null) draw[ottCandidates[i]]=s; });
  }

  // ── S17-32: uno per sedicesima (solo draw=128 Slam) ──
  if(drawSize>=128&&players.length>=32){
    const sed=drawSize/16;
    const sedCandidates=[];
    for(let s=0;s<16;s++){
      const sedEnd=(s+1)*sed-1;
      for(const pos of [sedEnd, s*sed]){
        if(pos>=0&&pos<drawSize&&draw[pos]===null){
          sedCandidates.push(pos); break;
        }
      }
    }
    const s1732=rnd([pl(16),pl(17),pl(18),pl(19),pl(20),pl(21),pl(22),pl(23),
                     pl(24),pl(25),pl(26),pl(27),pl(28),pl(29),pl(30),pl(31)].filter(Boolean));
    s1732.forEach((s,i)=>{ if(i<sedCandidates.length&&draw[sedCandidates[i]]===null) draw[sedCandidates[i]]=s; });
  }

  // ── Resto: posizioni libere rimanenti ──
  const seedCount=drawSize===128?32:drawSize===64?16:8;
  const rest=rnd([...players.slice(seedCount)]);
  let ri=0;
  for(let i=0;i<drawSize;i++){if(draw[i]===null&&ri<rest.length)draw[i]=rest[ri++];}
  return draw;
}

// Costruisce pool eligibili per un draw — sess.43 completo
// Usa weighted sampling: i rank migliori nella fascia hanno più probabilità
// di essere selezionati, simulando che non tutti partecipino sempre.
// skipFactor per tipo: Slam~0.10 (quasi tutti), ATP500~0.45, ATP250~0.60
// Pool sempre ordinato per rank prima di passarlo a buildSeededDraw.
function buildEligPool(world, tt, needCount, excludeId){
  const npcFloor = tt.rankFloor||1;
  const bandLow = tt.rankCeiling ? Math.max(npcFloor, tt.rankCeiling) : npcFloor;
  const rangeSize = tt.minRank - bandLow;

  // ATP Finals: pool quasi sempre i primi 8, con piccole probabilità di rinuncia
  // (infortunio/indisponibilità) che fanno entrare il 9°-12° al loro posto.
  if(tt.label==="ATP Finals"){
    const candidates = Object.values(world)
      .filter(p=>p.rank>=1 && p.rank<=12 && p.id!==excludeId)
      .sort((a,b)=>a.rank-b.rank);
    const pool=[];
    const remaining=[...candidates];
    while(pool.length<needCount && remaining.length>0){
      // 88% accetta il miglior rank disponibile; 12% è "forfait" e passa al successivo.
      // Forza accettazione quando servono tutti i restanti per completare il pool.
      if(Math.random()<0.88 || remaining.length<=needCount-pool.length){
        pool.push(remaining.shift());
      } else {
        remaining.shift();
      }
    }
    // Fill se serve ancora (extreme safety — non dovrebbe accadere)
    let fillR=13;
    while(pool.length<needCount){
      const fp=getATPPlayer(world,fillR++);
      if(fp && fp.id!==excludeId && !pool.find(x=>x.id===fp.id)) pool.push(fp);
      if(fillR>30) break;
    }
    pool.sort((a,b)=>a.rank-b.rank);
    return pool;
  }

  // skipFactor: quanto i "peggiori" della fascia tendono a non partecipare
  // 0=tutti equiprobabili, 1=solo il migliore partecipa
  const tLabel=tt.label||'';
  const skipF= tLabel.includes('Grand')?0.10:tLabel.includes('1000')?0.20:
    tLabel.includes('Finals')?0.05:tLabel.includes('500')?0.40:
    tLabel.includes('250')?0.60:0.55;
  const skipFactor=skipF;

  // Tutti i giocatori eligibili nella fascia
  const eligible = Object.values(world)
    .filter(p=>p.rank<=tt.minRank&&p.rank>=bandLow&&p.id!==excludeId)
    .sort((a,b)=>a.rank-b.rank);

  let pool=[];
  if(eligible.length<=needCount){
    // Non abbastanza giocatori — prendi tutti + fill
    pool=[...eligible];
    while(pool.length<needCount){
      const fillRank=clamp(tt.minRank+pool.length-eligible.length+1,bandLow,tt.minRank+30);
      pool.push(getATPPlayer(world,fillRank));
    }
  } else {
    // Weighted sampling senza rimpiazzo: peso decrescente per rank peggiori
    const usedIds=new Set(); if(excludeId) usedIds.add(excludeId);
    const candidates=[...eligible];
    // Pre-calcola pesi
    const weights=candidates.map((p,i)=>{
      const t=rangeSize>0?(p.rank-bandLow)/rangeSize:0;
      return Math.max(0.05, 1.0 - t*skipFactor);
    });
    for(let n=0;n<needCount&&candidates.length>0;n++){
      const total=weights.reduce((s,w,i)=>candidates[i]?s+w:s,0);
      let rv=Math.random()*total, cumul=0;
      let chosen=null,chosenIdx=-1;
      for(let i=0;i<candidates.length;i++){
        if(!candidates[i]) continue;
        cumul+=weights[i];
        if(cumul>=rv){chosen=candidates[i];chosenIdx=i;break;}
      }
      if(!chosen){chosen=candidates[candidates.length-1];chosenIdx=candidates.length-1;}
      if(chosen&&!usedIds.has(chosen.id)){
        usedIds.add(chosen.id); pool.push(chosen);
        candidates[chosenIdx]=null; // marca come usato
      }
    }
    // Fill se necessario (non dovrebbe mai servire con eligible.length>needCount)
    while(pool.length<needCount){
      const fr=clamp(tt.minRank-Math.floor(pool.length/2),bandLow,tt.minRank);
      pool.push(getATPPlayer(world,fr+pool.length));
    }
  }
  // Ordina per rank → seed1=miglior rank nel pool
  pool.sort((a,b)=>a.rank-b.rank);
  return pool;
}

function simNPCBracket(tourn,world){
  const tt=TT[tourn.type]||TT.ATP250;
  if(tt.format==="roundRobin"){
    return simNPCBracketRR(tourn,world);
  }
  const drawSize=Math.pow(2,tt.rounds);
  const elig=buildEligPool(world,tt,drawSize,null);
  const draw=buildSeededDraw(elig,drawSize);
  const rounds=[];let cur=[...draw];
  for(let r=0;r<tt.rounds;r++){
    if(cur.length<2)break;
    const matches=[],next=[];
    for(let m=0;m<cur.length;m+=2){
      const p1=cur[m],p2=cur[m+1]||cur[m];
      // win_mod età (sess.51, prima calcolato ma mai usato): i giovani
      // sovraperformano il proprio rank nei tornei, i veterani sottoperformano.
      const wm1=1+getNPCAgeParams(p1.id,p1.age||25).win_mod;
      const wm2=1+getNPCAgeParams(p2.id,p2.age||25).win_mod;
      const s1=pStr(p1.stats,tourn.surface)*wm1,s2=pStr(p2.stats,tourn.surface)*wm2;
      const bo=tourn.type==="Slam"?5:3;const tw=Math.ceil(bo/2);
      const sets=[];let c1=0,c2=0;
      while(c1<tw&&c2<tw){
        const w=Math.random()<winP(s1,s2);
        let pg,og;if(w){pg=6;og=rngI(0,5);if(og===5)og=7;}else{og=6;pg=rngI(0,5);if(pg===5)pg=7;}
        sets.push({pg,og});if(w)c1++;else c2++;
      }
      const p1w=c1===tw;
      matches.push({p1:p1.name,p2:p2.name,p1r:p1.rank,p2r:p2.rank,winner:p1w?p1.name:p2.name,wr:p1w?p1.rank:p2.rank,p1id:p1.id,p2id:p2.id,wid:p1w?p1.id:p2.id,sets,done:true});
      next.push(p1w?p1:p2);
    }
    const rName=r===tt.rounds-1?"Finale":r===tt.rounds-2?"Semifinale":r===tt.rounds-3?"Quarti":r===tt.rounds-4?"Ottavi":RN[r]||`T${r+1}`;
    rounds.push({ri:r,rName,matches});
    cur=next;
  }
  const w=cur[0];
  return{tourn,rounds,winner:w?.name,wr:w?.rank,wid:w?.id,completed:true};
}

// Simulazione NPC full per ATP Finals: 2 gironi (3 turni round robin) + SF incrociate + Finale
function simNPCBracketRR(tourn,world){
  const tt=TT[tourn.type];
  const drawSize=tt.drawSize||8;
  const elig=buildEligPool(world,tt,drawSize,null);
  const groups=atpFinalsBuildGroups(elig);
  const standings={A:atpFinalsInitStandings(groups.A), B:atpFinalsInitStandings(groups.B)};
  const rounds=[];
  // 3 turni round robin
  for(let r=0;r<3;r++){
    const matches=[];
    ['A','B'].forEach(gKey=>{
      ATP_FINALS_RR[r].forEach(pr=>{
        const p1=groups[gKey][pr[0]], p2=groups[gKey][pr[1]];
        const m={...atpFinalsSimMatch(p1,p2,tourn.surface),group:gKey};
        atpFinalsUpdateStandings(standings[gKey],m);
        matches.push(m);
      });
    });
    rounds.push({ri:r,rName:atpFinalsRoundName(r),matches});
  }
  // Semifinali incrociate
  const rankA=atpFinalsRankGroup(groups.A,standings.A);
  const rankB=atpFinalsRankGroup(groups.B,standings.B);
  const sf1=atpFinalsSimMatch(rankA[0],rankB[1],tourn.surface);
  const sf2=atpFinalsSimMatch(rankB[0],rankA[1],tourn.surface);
  rounds.push({ri:3,rName:atpFinalsRoundName(3),matches:[{...sf1,stage:"SF"},{...sf2,stage:"SF"}]});
  // Finale
  const w1=sf1.wid===rankA[0].id?rankA[0]:rankB[1];
  const w2=sf2.wid===rankB[0].id?rankB[0]:rankA[1];
  const fin=atpFinalsSimMatch(w1,w2,tourn.surface);
  rounds.push({ri:4,rName:atpFinalsRoundName(4),matches:[{...fin,stage:"F"}]});
  const champ=fin.wid===w1.id?w1:w2;
  return{tourn,rounds,groups,standings,groupRanking:{A:rankA,B:rankB},format:"roundRobin",
    winner:champ.name,wr:champ.rank,wid:champ.id,completed:true};
}

// ═══════════════════════════════════════════════════
// ATP FINALS — helpers per formato a gironi (round robin + KO)
// ═══════════════════════════════════════════════════
// Seed reale ATP Finals: S1→gruppo A, S2→gruppo B; S3/S4 estratti 1 per girone;
// S5/S6 estratti 1 per girone; S7/S8 estratti 1 per girone.
// Ritorna {A:[4 giocatori in ordine di seed],B:[4 giocatori in ordine di seed]}
function atpFinalsBuildGroups(seededPool){
  const A=[],B=[];
  A.push(seededPool[0]); B.push(seededPool[1]);
  const pairs=[[seededPool[2],seededPool[3]],[seededPool[4],seededPool[5]],[seededPool[6],seededPool[7]]];
  pairs.forEach(pr=>{
    if(Math.random()<0.5){A.push(pr[0]);B.push(pr[1]);}
    else {A.push(pr[1]);B.push(pr[0]);}
  });
  return {A,B};
}
// Calendario round robin per 4 giocatori (posizioni 0..3 nel gruppo)
// Round 0: 0v1, 2v3; Round 1: 0v2, 1v3; Round 2: 0v3, 1v2
const ATP_FINALS_RR = [[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]];

// Simula un singolo match (best-of-3) e ritorna oggetto match strutturato
function atpFinalsSimMatch(p1,p2,surface){
  // win_mod età (sess.51): coerente con simNPCBracket
  const wm1=1+getNPCAgeParams(p1.id,p1.age||25).win_mod;
  const wm2=1+getNPCAgeParams(p2.id,p2.age||25).win_mod;
  const s1=pStr(p1.stats,surface)*wm1,s2=pStr(p2.stats,surface)*wm2;
  const bo=3;const tw=Math.ceil(bo/2);
  const sets=[];let c1=0,c2=0;
  while(c1<tw&&c2<tw){
    const w=Math.random()<winP(s1,s2);
    let pg,og;if(w){pg=6;og=rngI(0,5);if(og===5)og=7;}else{og=6;pg=rngI(0,5);if(pg===5)pg=7;}
    sets.push({pg,og});if(w)c1++;else c2++;
  }
  const p1w=c1===tw;
  return {p1:p1.name,p2:p2.name,p1r:p1.rank,p2r:p2.rank,p1id:p1.id,p2id:p2.id,
    winner:p1w?p1.name:p2.name,wr:p1w?p1.rank:p2.rank,wid:p1w?p1.id:p2.id,
    sets,done:true,p1obj:p1,p2obj:p2,setsFor:{[p1.id]:c1,[p2.id]:c2}};
}
// Inizializza struttura standings per un gruppo
function atpFinalsInitStandings(group){
  const st={};
  group.forEach(p=>{st[p.id]={id:p.id,name:p.name,rank:p.rank,w:0,l:0,sw:0,sl:0};});
  return st;
}
// Aggiorna standings dopo un match
function atpFinalsUpdateStandings(st, match){
  const {p1id,p2id,wid,setsFor}=match;
  if(!st[p1id]||!st[p2id])return;
  const sf1=setsFor?setsFor[p1id]:0, sf2=setsFor?setsFor[p2id]:0;
  st[p1id].sw+=sf1; st[p1id].sl+=sf2;
  st[p2id].sw+=sf2; st[p2id].sl+=sf1;
  if(wid===p1id){st[p1id].w++; st[p2id].l++;}
  else {st[p2id].w++; st[p1id].l++;}
}
// Ritorna array ordinato di 4 giocatori (1°,2°,3°,4° posto) dal gruppo
// Tiebreak: vittorie desc, set-ratio desc, rank asc (simula head-to-head/game-ratio)
function atpFinalsRankGroup(group, standings){
  return [...group].sort((a,b)=>{
    const sa=standings[a.id], sb=standings[b.id];
    if(sb.w!==sa.w) return sb.w-sa.w;
    const ra=sa.sw/(sa.sw+sa.sl||1), rb=sb.sw/(sb.sw+sb.sl||1);
    if(rb!==ra) return rb-ra;
    return (a.rank||500)-(b.rank||500);
  });
}
// Premi/punti per ATP Finals basati su fase di uscita e vittorie girone
// Scala reale: RR win=200, SF win=400, F win=500 → max 1500 (3 RR + SF + F)
function atpFinalsReward(groupWins, exitStage, wonCurrent){
  const pm = PRIZE_MONEY.ATPFinals;
  const gw = Math.min(Math.max(groupWins,0),3);
  if(exitStage==="group"){
    // Eliminato nei gironi — premio e punti scalano con le vittorie
    return {pts: gw*200, prize: pm[Math.min(gw,2)]};
  }
  if(exitStage==="sf"){
    // Sconfitta in SF
    return {pts: gw*200, prize: pm[3]};
  }
  if(exitStage==="f"){
    if(wonCurrent){
      // Campione
      return {pts: gw*200 + 400 + 500, prize: pm[5]};
    }
    // Finalista (ha vinto SF, perso F)
    return {pts: gw*200 + 400, prize: pm[4]};
  }
  return {pts: 0, prize: 0};
}
// Calcola vittorie del giocatore nei round robin del bracket corrente (round 0..rMax-1)
function atpFinalsCountGroupWins(brkt, playerId, rMax){
  let wins=0;
  const upTo=Math.min(rMax, 3);
  for(let pr=0;pr<upTo;pr++){
    const rd=brkt?.rounds?.[pr];
    if(!rd?.matches) continue;
    const pm=rd.matches.find(m=>(m.p1id===playerId||m.p2id===playerId||m.isPlayerMatch));
    if(pm && pm.done && pm.wid===playerId) wins++;
  }
  return wins;
}
// Dopo il match del giocatore al turno r (0..2), ritorna true se il giocatore si qualifica
// (1° o 2° nel girone). Simula le standings includendo il risultato del match corrente.
function atpFinalsPlayerQualifies(brkt, player, won, sets, matchData){
  if(!brkt || !brkt.standings || !brkt.groups) return true;
  const pid = player.id;
  const standings = {A:{}, B:{}};
  Object.keys(brkt.standings.A).forEach(k=>{standings.A[k]={...brkt.standings.A[k]};});
  Object.keys(brkt.standings.B).forEach(k=>{standings.B[k]={...brkt.standings.B[k]};});
  const rd = brkt.rounds[2];
  const pm = rd?.matches?.find(m=>m.isPlayerMatch);
  if(pm){
    const gKey = pm.group;
    const oppId = pm.p1id===pid?pm.p2id:pm.p1id;
    const setsP = (sets||[]).filter(s=>s.pg>s.og).length;
    const setsO = (sets||[]).length - setsP;
    if(standings[gKey] && standings[gKey][pid] && standings[gKey][oppId]){
      standings[gKey][pid].sw+=setsP; standings[gKey][pid].sl+=setsO;
      standings[gKey][oppId].sw+=setsO; standings[gKey][oppId].sl+=setsP;
      if(won){standings[gKey][pid].w++; standings[gKey][oppId].l++;}
      else   {standings[gKey][oppId].w++; standings[gKey][pid].l++;}
    }
  }
  const gKey = brkt.playerGroupKey;
  const group = brkt.groups[gKey];
  const ranking = atpFinalsRankGroup(group, standings[gKey]);
  const pos = ranking.findIndex(p=>p.id===pid);
  return pos>=0 && pos<2;
}
// Nome round per ATP Finals (rounds=5, format roundRobin)
function atpFinalsRoundName(r){
  if(r===0) return "Girone · Match 1";
  if(r===1) return "Girone · Match 2";
  if(r===2) return "Girone · Match 3";
  if(r===3) return "Semifinale";
  return "Finale";
}
// Costruisce i 4 match di un turno del girone (2 per gruppo)
function atpFinalsBuildRRRound(groups,r,playerId,surface){
  const pairs=ATP_FINALS_RR[r];
  const matches=[];
  ['A','B'].forEach(gKey=>{
    pairs.forEach(pr=>{
      const p1=groups[gKey][pr[0]], p2=groups[gKey][pr[1]];
      const hasPlayer=p1.id===playerId||p2.id===playerId;
      if(hasPlayer){
        matches.push({p1:p1.name,p2:p2.name,p1r:p1.rank,p2r:p2.rank,p1id:p1.id,p2id:p2.id,
          pending:true,isPlayerMatch:true,sets:[],winner:null,wid:null,p1obj:p1,p2obj:p2,group:gKey});
      } else {
        matches.push({...atpFinalsSimMatch(p1,p2,surface),group:gKey});
      }
    });
  });
  return matches;
}

// Build live bracket — simula solo T1 (turno 0). I turni successivi
// vengono simulati progressivamente in handleMatchDone dopo ogni vittoria.
function buildLiveBracket(tourn,world,playerObj){
  const tt=TT[tourn.type]||TT.ATP250;
  // ATP Finals: formato round robin + KO (2 gironi da 4, SF incrociate, Finale)
  if(tt.format==="roundRobin"){
    return buildLiveBracketRR(tourn,world,playerObj);
  }
  const drawSize=Math.pow(2,tt.rounds);
  const elig=buildEligPool(world,tt,drawSize-1,playerObj.id);
  // FIX B sess.43: inserisce il player nella posizione corretta del pool ordinato
  // (non in fondo come prima → non viene più trattato come "resto casuale")
  // Trova l'indice dove il player si inserisce per rank crescente
  const pObj={...playerObj,isPlayer:true};
  const pRank=playerObj.rank||500;
  let insertIdx=elig.findIndex(p=>p.rank>pRank);
  if(insertIdx===-1) insertIdx=elig.length;
  const playersForDraw=[...elig.slice(0,insertIdx),pObj,...elig.slice(insertIdx)];
  const draw=buildSeededDraw(playersForDraw,drawSize);
  // Simula solo il turno 0 (T1) — gli altri turni vengono costruiti dopo
  const rounds=[];
  const rName0=tt.rounds<=1?"Finale":tt.rounds===2?"Semifinale":tt.rounds===3?"Quarti":tt.rounds===4?"Ottavi":RN[0]||"T1";
  const matches0=[],survivors0=[];
  for(let m=0;m<draw.length;m+=2){
    const p1=draw[m],p2=draw[m+1]||draw[m];
    const hasPlayer=p1?.isPlayer||p2?.isPlayer;
    if(hasPlayer){
      matches0.push({p1:p1?.name,p2:p2?.name,p1r:p1?.rank,p2r:p2?.rank,pending:true,isPlayerMatch:true,sets:[],winner:null,wid:null,p1obj:p1,p2obj:p2});
      survivors0.push(null);
    } else {
      const s1=pStr(p1.stats,tourn.surface),s2=pStr(p2.stats,tourn.surface);
      const bo=tourn.type==="Slam"?5:3;const tw=Math.ceil(bo/2);
      const sets=[];let c1=0,c2=0;
      while(c1<tw&&c2<tw){
        const w=Math.random()<winP(s1,s2);
        let pg,og;if(w){pg=6;og=rngI(0,5);if(og===5)og=7;}else{og=6;pg=rngI(0,5);if(pg===5)pg=7;}
        sets.push({pg,og});if(w)c1++;else c2++;
      }
      const p1w=c1===tw;
      matches0.push({p1:p1.name,p2:p2.name,p1r:p1.rank,p2r:p2.rank,winner:p1w?p1.name:p2.name,wr:p1w?p1.rank:p2.rank,p1id:p1.id,p2id:p2.id,wid:p1w?p1.id:p2.id,sets,done:true,p1obj:p1,p2obj:p2});
      survivors0.push(p1w?p1:p2);
    }
  }
  rounds.push({ri:0,rName:rName0,matches:matches0,survivors:survivors0});
  // Turni futuri: placeholder vuoto (verranno costruiti progressivamente)
  for(let r=1;r<tt.rounds;r++){
    const rn=r===tt.rounds-1?"Finale":r===tt.rounds-2?"Semifinale":r===tt.rounds-3?"Quarti":r===tt.rounds-4?"Ottavi":RN[r]||`T${r+1}`;
    rounds.push({ri:r,rName:rn,matches:[],survivors:[],pending:true});
  }
  return{tourn,rounds,completed:false,winner:null,simulatedUpTo:0};
}

// Build live bracket per ATP Finals (formato round robin + KO)
function buildLiveBracketRR(tourn,world,playerObj){
  const tt=TT[tourn.type];
  const drawSize=tt.drawSize||8;
  const elig=buildEligPool(world,tt,drawSize-1,playerObj.id);
  const pObj={...playerObj,isPlayer:true};
  const pRank=playerObj.rank||500;
  let insertIdx=elig.findIndex(p=>p.rank>pRank);
  if(insertIdx===-1) insertIdx=elig.length;
  const seeded=[...elig.slice(0,insertIdx),pObj,...elig.slice(insertIdx)];
  const groups=atpFinalsBuildGroups(seeded);
  const playerGroupKey=groups.A.find(p=>p.isPlayer)?'A':'B';
  const standings={A:atpFinalsInitStandings(groups.A), B:atpFinalsInitStandings(groups.B)};
  // Costruisci turno 0 (primo giro del girone) e simula i match NPC
  const matches0=atpFinalsBuildRRRound(groups,0,pObj.id,tourn.surface);
  matches0.forEach(m=>{if(m.done) atpFinalsUpdateStandings(standings[m.group],m);});
  const rounds=[{ri:0,rName:atpFinalsRoundName(0),matches:matches0,pending:false}];
  for(let r=1;r<tt.rounds;r++){
    rounds.push({ri:r,rName:atpFinalsRoundName(r),matches:[],pending:true});
  }
  return {tourn,rounds,groups,standings,playerGroupKey,format:"roundRobin",
    completed:false,winner:null,wr:null,wid:null,simulatedUpTo:0};
}

// Simula il turno 'r' del bracket live, usando i sopravvissuti del turno r-1
// Chiamato da handleMatchDone dopo ogni vittoria del giocatore
function advanceLiveBracket(brkt,playerObj,r){
  if(brkt.format==="roundRobin"){
    return advanceLiveBracketRR(brkt,playerObj,r);
  }
  const tt=TT[brkt.tourn.type]||TT.ATP250;
  const prevRound=brkt.rounds[r-1];
  if(!prevRound)return brkt;
  // Raccoglie sopravvissuti del turno precedente (incluso giocatore come null)
  const survivors=prevRound.survivors;
  const matches=[],nextSurvivors=[];
  for(let m=0;m<survivors.length;m+=2){
    const p1=survivors[m],p2=survivors[m+1];
    // Se uno dei due è il giocatore (null o isPlayer:true) → match pending
    const p1IsPlayer=p1===null||(p1&&p1.isPlayer);
    const p2IsPlayer=p2===null||(p2&&p2.isPlayer);
    if(p1IsPlayer||p2IsPlayer){
      // Il giocatore è in questo match — pending
      const pSlot=p1IsPlayer?0:1;
      const oppObj=pSlot===0?p2:p1;
      matches.push({p1:pSlot===0?playerObj?.name:oppObj?.name,p2:pSlot===0?oppObj?.name:playerObj?.name,p1r:pSlot===0?playerObj?.rank:oppObj?.rank,p2r:pSlot===0?oppObj?.rank:playerObj?.rank,pending:true,isPlayerMatch:true,sets:[],winner:null,wid:null,p1obj:pSlot===0?{...playerObj,isPlayer:true}:oppObj,p2obj:pSlot===0?oppObj:{...playerObj,isPlayer:true}});
      nextSurvivors.push(null);
    } else if(!p1||!p2){
      nextSurvivors.push(p1||p2);
    } else {
      const s1=pStr(p1.stats,brkt.tourn.surface),s2=pStr(p2.stats,brkt.tourn.surface);
      const bo=brkt.tourn.type==="Slam"?5:3;const tw=Math.ceil(bo/2);
      const sets=[];let c1=0,c2=0;
      while(c1<tw&&c2<tw){
        const w=Math.random()<winP(s1,s2);
        let pg,og;if(w){pg=6;og=rngI(0,5);if(og===5)og=7;}else{og=6;pg=rngI(0,5);if(pg===5)pg=7;}
        sets.push({pg,og});if(w)c1++;else c2++;
      }
      const p1w=c1===tw;
      matches.push({p1:p1.name,p2:p2.name,p1r:p1.rank,p2r:p2.rank,winner:p1w?p1.name:p2.name,wr:p1w?p1.rank:p2.rank,p1id:p1.id,p2id:p2.id,wid:p1w?p1.id:p2.id,sets,done:true,p1obj:p1,p2obj:p2});
      nextSurvivors.push(p1w?p1:p2);
    }
  }
  const newRounds=brkt.rounds.map((rd,i)=>i===r?{...rd,matches,survivors:nextSurvivors,pending:false}:rd);
  return{...brkt,rounds:newRounds,simulatedUpTo:r};
}

// Avanza bracket ATP Finals (gironi + SF incrociate + Finale)
// r=1,2  → prossimo turno di girone
// r=3    → semifinale (usa ranking finale gironi)
// r=4    → finale
function advanceLiveBracketRR(brkt,playerObj,r){
  const tt=TT[brkt.tourn.type];
  const surface=brkt.tourn.surface;
  const pObj={...playerObj,isPlayer:true};
  // Le standings sono gia' aggiornate in handleMatchDone (inclusi match NPC + match giocatore)
  const standings={A:{...brkt.standings.A}, B:{...brkt.standings.B}};
  Object.keys(standings.A).forEach(k=>standings.A[k]={...standings.A[k]});
  Object.keys(standings.B).forEach(k=>standings.B[k]={...standings.B[k]});
  let matches=[];
  let groupRanking=brkt.groupRanking||null;
  if(r<3){
    // Prossimo turno girone — sostituisci player object con pObj aggiornato
    const groupsNow={A:brkt.groups.A.map(p=>p.id===pObj.id?pObj:p), B:brkt.groups.B.map(p=>p.id===pObj.id?pObj:p)};
    matches=atpFinalsBuildRRRound(groupsNow,r,pObj.id,surface);
    matches.forEach(m=>{if(m.done&&m.group&&standings[m.group]) atpFinalsUpdateStandings(standings[m.group],m);});
  } else if(r===3){
    // Calcola ranking finali gironi ora che le 3 giornate sono complete
    const rankA=atpFinalsRankGroup(brkt.groups.A,standings.A);
    const rankB=atpFinalsRankGroup(brkt.groups.B,standings.B);
    groupRanking={A:rankA, B:rankB};
    // SF incrociate: 1A vs 2B, 1B vs 2A
    const sfPairs=[[rankA[0],rankB[1]],[rankB[0],rankA[1]]];
    sfPairs.forEach(([p1,p2])=>{
      const hasPlayer=p1.id===pObj.id||p2.id===pObj.id;
      if(hasPlayer){
        const pp1=p1.id===pObj.id?pObj:p1, pp2=p2.id===pObj.id?pObj:p2;
        matches.push({p1:pp1.name,p2:pp2.name,p1r:pp1.rank,p2r:pp2.rank,p1id:pp1.id,p2id:pp2.id,
          pending:true,isPlayerMatch:true,sets:[],winner:null,wid:null,p1obj:pp1,p2obj:pp2,stage:"SF"});
      } else {
        matches.push({...atpFinalsSimMatch(p1,p2,surface),stage:"SF"});
      }
    });
  } else if(r===4){
    // Finale: vincitori delle 2 SF
    const sfRound=brkt.rounds[3];
    const winners=(sfRound&&sfRound.matches)?sfRound.matches.map(m=>{
      if(m.isPlayerMatch) return m.winner===pObj.name?pObj:(m.p1obj?.id===m.wid?m.p1obj:m.p2obj);
      return m.p1id===m.wid?m.p1obj:m.p2obj;
    }):[];
    if(winners.length>=2){
      const [w1,w2]=winners;
      const hasPlayer=w1.id===pObj.id||w2.id===pObj.id;
      if(hasPlayer){
        const pp1=w1.id===pObj.id?pObj:w1, pp2=w2.id===pObj.id?pObj:w2;
        matches.push({p1:pp1.name,p2:pp2.name,p1r:pp1.rank,p2r:pp2.rank,p1id:pp1.id,p2id:pp2.id,
          pending:true,isPlayerMatch:true,sets:[],winner:null,wid:null,p1obj:pp1,p2obj:pp2,stage:"F"});
      } else {
        matches.push({...atpFinalsSimMatch(w1,w2,surface),stage:"F"});
      }
    }
  }
  const newRounds=brkt.rounds.map((rd,i)=>i===r?{...rd,matches,pending:false}:rd);
  return{...brkt,rounds:newRounds,standings,groupRanking:groupRanking||brkt.groupRanking,simulatedUpTo:r};
}

function simWeek(weekNum,world,yearNum,extraOpts={}){
  const ts=CAL.filter(t=>t.week===weekNum);
  const isNewYear=weekNum===1;

  // ── Phase 0: avanzamento eta, ritiri, transizioni career phase ──
  const retiredIds=new Set();
  const replacements=[];
  // In modalità Leggenda gli NPC non invecchiano né si ritirano mai
  const isLegendMode=(extraOpts&&extraOpts.legendMode)||false;
  if(isNewYear&&yearNum>1&&!isLegendMode){
    Object.values(world).forEach(p=>{
      const newAge=(p.age||25)+1;
      world[p.rank]={...p,age:newAge};
    });
    // Ritiri: età base + stocastici (infortuni, burnout mentale, decisione)
    Object.values(world).forEach(p=>{
      const age=p.age||25;
      const retireAge=getNPCRetireAge(p.id);
      let isRetired=false;
      if(age>=retireAge){
        isRetired=true;
      } else if(age>=25){
        // Aggiorna contatori anni-fuori
        const rk=p.rank||500;
        npcYearsOutside150[p.id]=rk>150?(npcYearsOutside150[p.id]||0)+1:0;
        npcYearsOutside250[p.id]=rk>250?(npcYearsOutside250[p.id]||0)+1:0;
        // Seed deterministico per decisione di ritiro questo anno
        const rngH=window.NPC_SYSTEM.mix((window.NPC_SYSTEM.parseIdInt(p.id))*13007+yearNum*9137);
        const rngValue=(rngH%100000)/100000;
        if(window.NPC_SYSTEM.shouldEarlyRetire({
          npcId:p.id, age, rank:rk,
          yearsOutsideTop150:npcYearsOutside150[p.id]||0,
          yearsOutsideTop250:npcYearsOutside250[p.id]||0,
          rngValue,
        })){
          isRetired=true;
        }
      }
      if(isRetired){
        retiredIds.add(p.id);
        const rep=generateReplacementNPC(yearNum,weekNum);
        replacements.push(rep);
        delete npcYearsOutside150[p.id];
        delete npcYearsOutside250[p.id];
        delete npcCareerPhase[p.id];
        // sess.51: anche form/personalLevel — prima restavano per sempre nel
        // save (leak) e falsavano la rinormalizzazione livelli
        delete npcForm[p.id];
        delete npcPersonalLevel[p.id];
      }
    });
    // Transizioni career phase per NPC sopravvissuti (sess.50)
    Object.values(world).forEach(p=>{
      if(retiredIds.has(p.id)) return;
      const cur=npcCareerPhase[p.id]||"steady";
      const age=p.age||25;
      const phH=window.NPC_SYSTEM.mix((window.NPC_SYSTEM.parseIdInt(p.id))*2131+yearNum*4093);
      const phR=(phH%100000)/100000;
      npcCareerPhase[p.id]=window.NPC_SYSTEM.rollPhaseTransition(cur, age, phR);
    });
  }

  // ── Phase 1: MR asimmetrica + rumore età (sostituisce decay fisso) ──
  // Pool conservato dalla normalizzazione in Phase 3b.
  // MR più forte nelle fasce basse per mantenere distribuzione realistica.
  const byId={};
  Object.values(world).forEach(p=>{
    if(retiredIds.has(p.id)) return;
    const age=p.age||25;
    const {skip_prob,drift_mod}=getNPCAgeParams(p.id,age);

    // Forma (mantenuta per compatibilita draw)
    const arch=getNPCArchetype(p.rank||400);
    const formTarget=calcFormMult(p,arch);
    const prevForm=npcForm[p.id]||formTarget;
    const jitter=(sv((p.rank||1)*weekNum*17)-0.5)*arch.volatility*0.08;
    const newForm=Math.max(0.80,Math.min(1.15,prevForm*0.75+formTarget*0.25+jitter));
    npcForm[p.id]=newForm;

    // Skip torneo per veterani (mantenuto per compatibilita draw)
    const skipSeed=((p.rank||1)*weekNum*3131)%10000/10000;
    const isSkip=skipSeed<skip_prob;

    // personalLevel: attrattore MR annuale. Ceiling/floor ora derivano dal TALENTO
    // (tier determinato da initRank + hidden bonus), non più da initRank/3.
    // Un rank 80 "Good" può raggiungere #35; un rank 40 "VeryGood" può arrivare #15.
    const rank=p.rank||400;
    const initRankB=p.initRank||rank;
    if(npcPersonalLevel[p.id]==null){
      npcPersonalLevel[p.id]=atpPtsForRank(initRankB);
    }
    const bounds=getNPCCareerBounds(p.id,initRankB,p.initAge);
    // Floor di talento con fade oltre i 30 anni (sess.51): i veterani perdono
    // progressivamente la protezione del tier e possono uscire dal top 20/100.
    // In modalità Leggenda niente fade: NPC cristallizzati.
    const floorPtsAbs=isLegendMode?bounds.floorPts:window.NPC_SYSTEM.getEffectiveFloorPts(bounds.floorPts,age);
    const ceilPtsAbs=bounds.ceilPts;
    if(isNewYear&&!isLegendMode){
      const archB=getNPCArchetype(initRankB);
      // Ampiezze alzate (sess.51, era 0.08-0.20): più varianza strutturale annua
      const driftPctB=archB.volatility<=0.08?0.10:archB.volatility<=0.10?0.13:archB.volatility<=0.12?0.15:archB.volatility<=0.18?0.19:0.25;
      // Seed con yearNum (sess.51): prima usava weekNum che a isNewYear vale
      // sempre 1 → drift IDENTICO ogni anno per lo stesso NPC (classifica congelata).
      const driftSeedB=sv((window.NPC_SYSTEM.parseIdInt(p.id))*3571+yearNum*7717+99);
      // Career phase (sess.50): steady/breakthrough/slump modulano drift
      const phase=npcCareerPhase[p.id]||"steady";
      const mod=window.NPC_SYSTEM.phaseDriftModifier(phase);
      // Drift = base random + bias del phase — componente random a piena ampiezza (sess.51)
      const rawDrift=(driftSeedB*2-1);
      const biasedDrift=Math.max(-1,Math.min(1,rawDrift*0.7+mod.signBias*0.5));
      const driftB=biasedDrift*driftPctB*mod.magnitude*npcPersonalLevel[p.id];
      npcPersonalLevel[p.id]=Math.max(floorPtsAbs,Math.min(ceilPtsAbs,npcPersonalLevel[p.id]+driftB));
    }
    // Evoluzione settimanale del personalLevel (sess.51):
    // 1) giovani: crescita verso il ceiling REALIZZATO (floor + r×(ceil−floor),
    //    r∈[0.45,1] personale — non tutti i talenti sfondano). In breakthrough
    //    il target sale al ceiling pieno → le career phase decidono chi esplode.
    // 2) drift_mod età (getAgeParams, prima calcolato ma MAI usato): declino
    //    progressivo dei veterani, personalizzato dal char [-1,+1]
    // In modalità Leggenda i personalLevel restano cristallizzati.
    if(!isLegendMode){
      let lvl=npcPersonalLevel[p.id];
      const growthW=window.NPC_SYSTEM.youngGrowthRate(age)/51;
      if(growthW>0){
        const rReal=window.NPC_SYSTEM.talentRealization(p.id);
        const phaseG=npcCareerPhase[p.id]||"steady";
        const effCeil=phaseG==="breakthrough"?ceilPtsAbs:
          bounds.floorPts+rReal*(ceilPtsAbs-bounds.floorPts);
        if(lvl<effCeil) lvl+=(effCeil-lvl)*growthW;
      }
      lvl*=(1+drift_mod);
      npcPersonalLevel[p.id]=Math.max(floorPtsAbs,Math.min(ceilPtsAbs,lvl));
    }
    const targetPts=npcPersonalLevel[p.id];
    // MR asimmetrica verso personalLevel.
    // RIMOSSO ageBias sulla MR (sess.51): rallentare la MR dei veterani li
    // teneva in alto PIÙ a lungo (target sotto i punti correnti → convergenza
    // lenta = declino lento). L'effetto età ora agisce sul target (drift_mod).
    const mr=rank<=20?0.050:rank<=100?0.035:rank<=300?0.045:0.060;
    // Rumore forma settimanale (sess.51, raddoppiato: era 0.3/0.6/1.0%):
    // rank≤30: ±0.6% · rank≤100: ±1.0% · altri: ±1.4%
    // Fix (sess.51): p.id è una STRINGA ("p42") → "p42"*weekNum=NaN → sv(NaN)=0
    // → il rumore era un drag costante -noisePct identico per tutti (zero varianza).
    const noisePct=rank<=30?0.006:rank<=100?0.010:0.014;
    const noiseSeed=sv((window.NPC_SYSTEM.parseIdInt(p.id))*weekNum*7919+13);
    const noise=(noiseSeed*2-1)*noisePct*targetPts;
    const newPts=Math.max(5,Math.round((p.atpPoints||5)+noise+(targetPts-(p.atpPoints||5))*mr));
    byId[p.id]={...p,atpPoints:newPts,form:newForm,_skipThisWeek:isSkip};
  });

  // ── Phase 1b: rinormalizza i personalLevel al pool fisso (sess.51) ──
  // La crescita dei giovani immette più "livello" di quanto il declino dei
  // veterani ne tolga: senza rescale la somma dei level si gonfia, la
  // normalizzazione punti (Phase 3b) comprime la curva e i punti NPC si
  // scollano dalla scala atpPtsForRank (torneo/sponsor target sballati).
  // Rescale uniforme → dinamica ordinale INVARIATA, scala punti preservata.
  {
    let lvlSum=0;
    Object.keys(byId).forEach(id=>{lvlSum+=npcPersonalLevel[id]||0;});
    if(lvlSum>0){
      const lf=NPC_FIXED_POOL/lvlSum;
      Object.keys(byId).forEach(id=>{
        if(npcPersonalLevel[id]!=null) npcPersonalLevel[id]=Math.max(5,npcPersonalLevel[id]*lf);
      });
    }
  }

  // Aggiungi sostituti
  replacements.forEach(rep=>{
    byId[rep.id]={...rep,form:1.0,_skipThisWeek:false};
  });

  // ── Phase 2: punti torneo — tutti i tier, moltiplicatori realistici ─
  const brks={};
  ts.forEach(tourn=>{
    // ATP Finals: la 2a settimana è gia' coperta dalla simulazione completa
    // (gironi + SF + Finale) eseguita alla 1a settimana. Evita doppia simulazione.
    if(tourn.atpFinalsWeek2) return;
    const tmpWorld={};
    Object.values(byId).forEach(p=>{tmpWorld[p.rank]={...p};});
    const b=simNPCBracket(tourn,tmpWorld);
    brks[`${tourn.name}_${weekNum}`]=b;
    const tt2=TT[tourn.type];if(!tt2)return;
    const mult=NPC_PTS_MULT[tourn.type]||0.25;
    const isGrand=tourn.type==="Slam"||tourn.type==="M1000";
    if(isGrand){
      const ptsTbl=PTS_TABLE[tourn.type]||PTS_TABLE.ATP250;
      const totalR=tt2.rounds;
      b.rounds.forEach(rd=>{
        const fromEnd=totalR-1-rd.ri;
        const loserIdx=Math.min(fromEnd+1,6);
        const loserPts=(ptsTbl[loserIdx]||0);
        const winnerIdx=fromEnd===0?0:Math.min(fromEnd,6);
        const winnerPts=(ptsTbl[winnerIdx]||0);
        rd.matches.forEach(m=>{
          if(!m.done)return;
          const losId=m.wid===m.p1id?m.p2id:m.p1id;
          if(losId&&byId[losId]&&loserPts>0){
            const cap=getNPCGainCap(byId[losId].rank||400,byId[losId].age);
            const gain=Math.min(Math.round(loserPts*mult),cap);
            byId[losId]={...byId[losId],atpPoints:(byId[losId].atpPoints||0)+gain};
          }
          if(fromEnd>0){
            const winId=m.wid;
            if(winId&&byId[winId]&&winnerPts>loserPts){
              const cap=getNPCGainCap(byId[winId].rank||400,byId[winId].age);
              const gain=Math.min(Math.round((winnerPts-loserPts)*mult),cap);
              byId[winId]={...byId[winId],atpPoints:(byId[winId].atpPoints||0)+gain};
            }
          }
        });
      });
      if(b.wid&&byId[b.wid]){
        const cap=getNPCGainCap(byId[b.wid].rank||400,byId[b.wid].age);
        const gain=Math.min(Math.round((ptsTbl[0]||0)*mult),cap);
        byId[b.wid]={...byId[b.wid],atpPoints:(byId[b.wid].atpPoints||0)+gain};
      }
    } else {
      // ATP500/250/Challenger: tabelle punti reali per round (come Slam/M1000)
      const ptsTbl2=PTS_TABLE[tourn.type]||PTS_TABLE.ChallengerB;
      const totalR2=tt2.rounds;
      b.rounds.forEach(rd=>{
        const fromEnd2=totalR2-1-rd.ri;
        const loserIdx2=Math.min(fromEnd2+1,6);
        const loserPts2=(ptsTbl2[loserIdx2]||0);
        const winnerIdx2=fromEnd2===0?0:Math.min(fromEnd2,6);
        const winnerPts2=(ptsTbl2[winnerIdx2]||0);
        rd.matches&&rd.matches.forEach(m=>{
          if(!m.done)return;
          const losId=m.wid===m.p1id?m.p2id:m.p1id;
          if(losId&&byId[losId]&&loserPts2>0){
            const cap=getNPCGainCap(byId[losId].rank||400,byId[losId].age);
            const gain=Math.min(Math.round(loserPts2*mult),cap);
            byId[losId]={...byId[losId],atpPoints:(byId[losId].atpPoints||0)+gain};
          }
          if(fromEnd2>0){
            const winId=m.wid;
            if(winId&&byId[winId]&&winnerPts2>loserPts2){
              const cap=getNPCGainCap(byId[winId].rank||400,byId[winId].age);
              const gain=Math.min(Math.round((winnerPts2-loserPts2)*mult),cap);
              byId[winId]={...byId[winId],atpPoints:(byId[winId].atpPoints||0)+gain};
            }
          }
        });
      });
      if(b.wid&&byId[b.wid]){
        const cap=getNPCGainCap(byId[b.wid].rank||400,byId[b.wid].age);
        const gain=Math.min(Math.round((ptsTbl2[0]||0)*mult),cap);
        byId[b.wid]={...byId[b.wid],atpPoints:(byId[b.wid].atpPoints||0)+gain};
      }
    }
  });

  // ── Phase 3b: normalizzazione pool verso target FISSO ────────────────
  // Target fisso = sum(atpPtsForRank(1..500)) calcolato sui rank TEORICI
  // NON sui rank correnti post-riordino — evita compressione strutturale dei top
  {
    const TARGET_NPC_POOL=NPC_FIXED_POOL;
    const poolNow=Object.values(byId).reduce((s,p)=>s+(p.atpPoints||5),0);
    if(poolNow>0){
      const factor=TARGET_NPC_POOL/poolNow;
      Object.values(byId).forEach(p=>{
        byId[p.id]={...byId[p.id],atpPoints:Math.max(5,Math.round((p.atpPoints||5)*factor))};
      });
    }
  }

  // ── Phase 3: riordina per punti, riassegna rank ────────────────────
  const sorted=Object.values(byId).sort((a,b2)=>b2.atpPoints-a.atpPoints);
  const final={};
  sorted.forEach((p,i)=>{
    const newRank=i+1;
    const updStats=npcEffectiveStat(p.id,newRank);
    const {_skipThisWeek,...cleanP}=p;
    final[newRank]={...cleanP,rank:newRank,atpPoints:Math.max(5,p.atpPoints||5),stats:updStats};
  });
  return{newWorld:final,brks,retiredCount:retiredIds.size,newNPCCount:replacements.length};
}

function stripBrackets(brackets){
  const out={};
  Object.entries(brackets||{}).forEach(([k,b])=>{
    const hasPlayer=b.rounds&&b.rounds.some(rd=>rd.matches&&rd.matches.some(m=>m.isPlayerMatch));
    if(hasPlayer){
      const cleanRounds=(b.rounds||[]).map(rd=>({
        ...rd,
        survivors:[],
        matches:(rd.matches||[]).map(m=>{
          if(m.done&&!m.pending){
            const{p1obj,p2obj,...rest}=m;
            return rest;
          }
          // match pending: tieni p1obj/p2obj ma strip history dal playerObj embedded
          const clean={...m};
          if(clean.p1obj&&clean.p1obj.isPlayer) clean.p1obj={...clean.p1obj,history:[],rankHistory:[]};
          if(clean.p2obj&&clean.p2obj.isPlayer) clean.p2obj={...clean.p2obj,history:[],rankHistory:[]};
          return clean;
        })
      }));
      out[k]={...b,rounds:cleanRounds};
    }
  });
  return out;
}
// Persistenza: SOLO su cloud (Supabase, vedi js/cloud_saves.js).
// Le vecchie saveL/loadL/delL su localStorage sono state rimosse.

// ── SHIFT NPC RANKS — evita collisione giocatore-NPC ─────────────────
// Il giocatore si INSERISCE nella classifica unificata. Gli NPC a quella
// posizione e sotto vengono visualizzati con rank+1. Applicato dopo ogni
// simWeek e alla rigenerazione NPC (button "Rigenera ATP Rankings").
// Precondizioni: world contiene NPC con rank interno 1..500 (post-simWeek).
// Se playerPts<5 (FC) il giocatore non è in classifica → nessuno shift.
function shiftNpcRanksForPlayer(world, playerRank, playerPts){
  if(!world||!playerRank||playerRank<1||(playerPts||0)<5) return world;
  const shifted={};
  Object.values(world).forEach(p=>{
    const oldRank=p.rank||500;
    const newRank=oldRank>=playerRank?oldRank+1:oldRank;
    shifted[newRank]={...p,rank:newRank};
  });
  return shifted;
}

// ── MIGRAZIONE SAVE: ricalibra pool punti NPC se deflazionato ────────
// Chiamata al caricamento del save. Ridistribuisce i punti NPC
// mantenendo le proporzioni relative ma riportando il pool al valore
// teorico della curva. Non tocca rank, età, stats, history del giocatore.
function migrateWorldPool(world){
  if(!world||Object.keys(world).length===0) return world;
  let npcs=Object.values(world);

  // 1. Integra NPC mancanti (save vecchi con rank 1-400 invece di 1-500)
  const existingRanks=new Set(npcs.map(p=>p.rank));
  for(let rank=401;rank<=500;rank++){
    if(!existingRanks.has(rank)){
      const g=genNameForRank(rank);
      const base=rank<=400?Math.max(7.0,7.6-(rank-350)*0.012):Math.max(5.5,8.0-(rank-400)*0.025);
      const floor=rank<=400?7:Math.max(5,Math.floor(base-1.5));
      const stats={};
      STAT_KEYS.forEach((k,i)=>{stats[k]=clamp(Math.round(base+sv(rank*100+i*17)*3-1.5),floor,35);});
      npcs.push({id:`p${rank}`,rank,name:g.name,age:g.age,nat:g.nat,stats,
                 atpPoints:atpPtsForRank(rank)});
    }
  }

  // 2. Riscala i punti al pool teorico se deflazionato/inflazionato oltre soglia
  const targetPool=npcs.reduce((s,p)=>s+atpPtsForRank(p.rank||400),0);
  const currentPool=npcs.reduce((s,p)=>s+(p.atpPoints||5),0);
  const ratio=currentPool>0?targetPool/currentPool:1;
  // Intervieni se scostamento > 8% in qualsiasi direzione
  const needsRescale=ratio<0.92||ratio>1.08;
  if(needsRescale){
    npcs=npcs.map(p=>({...p,atpPoints:Math.max(5,Math.round((p.atpPoints||5)*ratio))}));
  }

  // 2b. Aggiunge initRank se mancante (save pre-PacchettoB)
  npcs=npcs.map(p=>p.initRank?p:{...p,initRank:p.rank||400});

  // 3. Pulizia nat: rimuove il nome nazione dai save vecchi (es. "🇮🇹 Italia" → "🇮🇹")
  // Un emoji flag Unicode occupa 2 char (coppia surrogate) — tutto ciò che segue è testo
  npcs=npcs.map(p=>{
    if(p.nat&&p.nat.length>3){
      // Estrai solo i primi caratteri fino al primo spazio dopo l'emoji
      const spaceIdx=p.nat.indexOf(" ");
      const cleaned=spaceIdx>0?p.nat.slice(0,spaceIdx):p.nat;
      return{...p,nat:cleaned};
    }
    return p;
  });

  // 4. Riordina per punti e riassegna rank in modo coerente
  npcs.sort((a,b)=>(b.atpPoints||5)-(a.atpPoints||5));
  const migrated={};
  npcs.forEach((p,i)=>{
    const newRank=i+1;
    migrated[newRank]={...p,rank:newRank};
  });
  return migrated;
}
function exportSave(state){
  const blob=new Blob([JSON.stringify({...state,brackets:stripBrackets(state.brackets)})],{type:"application/json"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");
  a.href=url;a.download=`atp_${(state.player?.name||"save").replace(/[\s.]/g,"_")}_A${state.year}S${state.week}.json`;
  a.click();URL.revokeObjectURL(url);
}
function importSave(file,cb){const r=new FileReader();r.onload=e=>{try{cb(JSON.parse(e.target.result));}catch{alert("File non valido.");}};r.readAsText(file);}

