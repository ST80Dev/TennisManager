# ATP Career Manager — Architettura del codice

Mappa del codice: dove sta cosa, come fluiscono i dati, dove intervenire per
ogni tipo di modifica. Le istruzioni operative sono in [CLAUDE.md](../CLAUDE.md);
lo storico tecnico (bug risolti, decisioni) in [note_progetto.md](note_progetto.md).

## Vista d'insieme

```
┌────────────────────────────────────────────────────────────┐
│ index.html (~7.100 righe)                                  │
│   CSS · UI React in <script type="text/babel"> · bootstrap │
└──────────────────────────┬─────────────────────────────────┘
                           │ usa (globali di script classici)
┌──────────────────────────▼─────────────────────────────────┐
│ js/cloud_saves.js (~110) — client REST Supabase (5 slot)   │
└──────────────────────────┬─────────────────────────────────┘
┌──────────────────────────▼─────────────────────────────────┐
│ js/engine.js (~1.340) — motore di simulazione              │
└──────────────────────────┬─────────────────────────────────┘
┌──────────────────────────▼─────────────────────────────────┐
│ js/game_data.js (~1.160) — costanti e tabelle di gioco     │
└──────────────────────────┬─────────────────────────────────┘
┌──────────────────────────▼─────────────────────────────────┐
│ js/npc_system.js (~390) — window.NPC_SYSTEM (v1.1.0)       │
└────────────────────────────────────────────────────────────┘
```

Le dipendenze vanno solo verso il basso. I file `js/` sono script classici:
le dichiarazioni top-level (`const`, `function`) sono nel global lexical scope
e quindi visibili agli script successivi e al blocco Babel. Nessun modulo ES,
nessun build step (vincolo `file://`, vedi CLAUDE.md).

## js/game_data.js — dati di gioco

| Gruppo | Simboli principali |
|---|---|
| Giocatori reali | `ATP400` (top 400 fine 2025, con età/archetipo) |
| Stat | `STAT_KEYS`, `STAT_LABELS`, `STAT_ICONS`, superfici `SURF_COL`/`SURF_COURT`/`SURF_MOD` |
| Nazioni e zone | `NATS`, `NAT_NAMES`, `ZONE_COORDS`/`ZONE_COLOR`/`ZONE_EMOJI`, `getZoneMult`, `calcTravelCost`, `calcJetLag`, `getTravelLevel`, `getAccommodation` |
| Tornei | `TT` (tipi: rounds, prize, pts, minRank/rankFloor/rankCeiling), `CAL` (calendario 52 settimane), `TOUR_FLAG`/`TOUR_CITY` |
| Economia tornei | `ENTRY_FEE`, `LODGE_BASE`, `LODGE_COLLAB`, `TRAVEL_COSTS_BASE` |
| Punti e premi | `PTS_TABLE`, `PRIZE_MONEY`, `PF`, `QF_PTS`, `getMatchMoney`, `getMatchPts`, `RN` (nomi turni) |
| Sponsor | `SPONSOR_COMPANIES`, `pickSponsorNames`, `calcSponsorAmounts`, `buildSponsorOffers` |
| Staff | `STAFF_LEVELS` (5 ruoli × 3 livelli), `getStaffLevel`, `getStaffWeeklyCost` |
| Investimenti | `INVESTMENTS`, `getInvestments*`, `hasInvestment`, `computeDismissRefund` |
| Allenamento | `TRAIN` (slot e gain), `ARCH` (archetipi giocatore), `BONUS_CARDS` (carte match) |
| Alias NPC | `NPC_ARCHETYPES` ecc. destrutturati da `window.NPC_SYSTEM` |

## js/cloud_saves.js — persistenza cloud (Supabase)

Unica persistenza del gioco: 5 slot su Supabase (progetto "TennisManager",
`tslpnxjlilankbncliqx`, tabella `public.saves`, 1 riga per slot `s1`..`s5`).
Nessun salvataggio locale (localStorage rimosso). Chiamate REST PostgREST
via `fetch`, nessuna libreria esterna; script classico senza JSX.

| Simbolo | Ruolo |
|---|---|
| `CLOUD_URL`, `CLOUD_KEY`, `CLOUD_SLOTS` | Config progetto Supabase + lista slot |
| `cloudListSaves()` | Mappa `{slot→metadati}` (name, player_name, player_age, player_rank, game_year, game_week, updated_at) — non scarica i payload |
| `cloudLoadSave(slot)` | `{payload,name}` o `null` se vuoto |
| `cloudSaveGame(slot,name,state)` | Upsert: payload = state con `stripBrackets`; il nome va sempre ripassato (sovrascrittura = nome mantenuto) |
| `cloudDeleteSave(slot)` | Svuota lo slot |

Lato DB: RLS attiva con policy permissiva per il ruolo `anon` (gioco personale
a giocatore singolo, stesso pattern del progetto OrionEmpires); `updated_at`
aggiornato da trigger `moddatetime` server-side.

## js/engine.js — motore di simulazione

| Gruppo | Funzioni chiave |
|---|---|
| Helpers | `rng`, `rngI`, `clamp`, `fmt`, `sv(seed)` (rumore deterministico) |
| Forza e match | `pStr(stats,surface,…)` forza effettiva; `winP(a,b)` probabilità; `calcMoraleShift` |
| Ranking | `atpPtsForRank` (curva 39 breakpoint), `rankForAtpPts`, `getRankLabel`, `rankDisplay`, `isOutOfRanking`, `canEnter` |
| Mondo NPC | `buildWorld` (init 500 NPC), `getATPPlayer`, `npcEffectiveStat`, `getNPCCareerBounds`, `generateReplacementNPC`, `genNameForRank`/`genNameFromSeed` |
| Tabelloni | `buildSeededDraw`, `buildEligPool`, `simNPCBracket` (KO), `simNPCBracketRR` + famiglia `atpFinals*` (round robin), `buildLiveBracket(RR)`, `advanceLiveBracket(RR)` |
| Avanzamento | `simWeek(weekNum,world,yearNum,extraOpts)` — cuore del gioco: aging/ritiri (Phase 0), drift+growth livelli (Phase 1), rinormalizzazione pool (Phase 1b), tornei NPC, punti rolling. `extraOpts.legendMode` congela gli NPC |
| Persistenza | `exportSave`/`importSave` (file .json di backup), `stripBrackets`, `migrateWorldPool`, `shiftNpcRanksForPlayer` (anti-collisione rank giocatore/NPC). Il salvataggio vero è in `js/cloud_saves.js` |

## js/npc_system.js — window.NPC_SYSTEM

Archetipi NPC, sistema talento (7 tier con ceiling/floor assoluti, hidden
talent), career phase pluriennale (steady/breakthrough/slump), distribuzione
ritiri + early retirement stocastica, generazione newgen, `youngGrowthRate`,
`talentRealization`, `getEffectiveFloorPts`, parametri età (`drift_mod`,
`win_mod`). Dettagli e validazione in note_progetto.md.

## index.html — UI React

Blocco unico `<script type="text/babel" data-presets="react,env">`, organizzato
in sezioni marcate `SEZIONE N` (cercare `SEZIONE` nel file):

| Sezione | Componenti |
|---|---|
| 1 · COMPONENTI BASE | `StatBar`, `Card`, `Badge`, `STitle`, `Notif`, `getRoundName` |
| 2 · TORNEO | `BracketViewer`, `RecoveryPackPanel`, `BracketTransition`, `DrawScreen`, `BracketUpdateScreen`, `MatchScreen` |
| 3 · MONDO E VIAGGI | `FullCalendarViewer`, `ZONE_FULLNAME`/`ZONE_FLAGS`, `WorldMap`, `CityTransitionHUD` |
| 4 · GESTIONE | `WinterBlockScreen`, `TrainingScreen`, `SponsorScreen`, `NewsFlashScreen`, `StaffScreen` |
| 5 · CREAZIONE PERSONAGGIO | `SlotPickerModal` (scelta slot cloud + nome), `CharCreation` (con lista 5 slot cloud) |
| 6 · GAME SCREEN | `CalendarView`, `RankingView`, `HistoryView`, `ProfileView`, `GameScreen` |
| 7 · APP | `App`, bootstrap `ReactDOM.createRoot` |

### GameScreen: stato e router

`GameScreen` possiede TUTTO lo stato di gioco (~46 useState: week/year/player/
world/brackets/staff/morale/sponsor/eventi/…) e le funzioni di avanzamento
(`advanceWeek`, `handleMatchDone`, `enterTournament`, hire/fire staff, ecc.).
Un `useEffect` serializza lo stato a ogni cambiamento e lo salva sul cloud
(slot attivo, debounce 1.5s, nome mantenuto); un handler su
`visibilitychange`/`pagehide` fa il flush del salvataggio in sospeso quando
l'app va in background.

Il render è un router a due livelli:

1. **Schermate a pieno schermo** (early return): `DrawScreen`, `MatchScreen`,
   `TrainingScreen`, `StaffScreen`, `SponsorScreen`, `WinterBlockScreen`,
   `NewsFlashScreen`, `BracketUpdateScreen`, `CityTransitionHUD`, game over.
2. **Viste della bottom nav** (`view`: `cal`/`ranking`/`history`/`profile`):
   componenti `CalendarView`, `RankingView`, `HistoryView`, `ProfileView`.

### Le viste estratte (pattern per nuove viste)

Le quattro viste ricevono stato e handler come props con gli stessi nomi
delle variabili di GameScreen, passate con spread di oggetto shorthand:

```jsx
{view==="ranking"&&<RankingView {...{notify,player,rankFilter,setRankFilter,setPlayer,setWorld,week,world}}/>}
```

Per aggiungere una vista: creare `function NuovaView(props){const{…}=props; …}`
nella sezione 6, aggiungere il ramo `{view==="nuova"&&<NuovaView …/>}` nel
return di GameScreen e (se serve) la voce nella bottom nav in fondo al file.
Regola: MAI hook dentro le viste-figlie o dentro IIFE — lo stato vive in GameScreen.

## Strutture dati principali

```
state (payload jsonb dello slot cloud, tabella public.saves su Supabase)
├─ week, year, weekDone, trainCount, winterDone, morale
├─ gameMode: "classic" | "legend"
├─ player { name, nationality, archetype, stats{7}, rank, atpPoints, money,
│           fatigue, age, wins, losses, titles, history[≤30 tornei],
│           rankHistory[], careerStats{}, investments{}, currentZone, homeZone }
├─ atpWorld { [rank]: npc { id, name, nat, age, atpPoints, initRank, isReplacement } }
├─ npcState { form, personalLevel, careerPhase, yearsOut150, yearsOut250 }   ← persistenza drift NPC
├─ brackets { [liveKey]: bracket }, activeTour, tourRound
├─ staff { coach|prep|mental|sparring|physio: 0-3 }, sponsor, careerLog[],
└─ activeEvents[], catCooldown{}, consecutiveTournaments/Losses

bracket (KO)  { tourn, rounds[[match…]…], winner, wr }   match: { p1, p2, w, sets }
bracket (RR)  gironi ATP Finals: vedi atpFinals* in engine.js
```

## Flusso settimanale (avanzamento)

```
advanceWeek (GameScreen)
├─ costi: vita/staff/investimenti · scadenze sponsor · eventi casuali
├─ simWeek(week, world, year, {legendMode})   ← engine.js
│   ├─ Phase 0 (isNewYear): aging, ritiri, newgen
│   ├─ Phase 1: drift annuale + growth giovani + declino veterani
│   ├─ Phase 1b: rinormalizzazione livelli a NPC_FIXED_POOL
│   └─ tornei NPC della settimana → punti rolling 52 settimane
├─ shiftNpcRanksForPlayer (anti-collisione rank)
└─ setState → useEffect → cloudSaveGame (debounce 1.5s, slot attivo)
```

## Dove intervenire, per tipo di modifica

| Modifica | File |
|---|---|
| Nuovo torneo / calendario / premi / punti | `js/game_data.js` (`TT`, `CAL`, `PTS_TABLE`, `PRIZE_MONEY`) |
| Formule match, morale, curva ranking | `js/engine.js` → validare con `tools/sim_harness.js` |
| Comportamento NPC (talento, ritiri, drift) | `js/npc_system.js` + Phase 0/1 di `simWeek` |
| Nuova schermata a pieno schermo | Componente in sezione 2-4 + early return in GameScreen |
| Nuova vista bottom-nav | Sezione 6, pattern viste estratte (sopra) |
| Economia (staff, sponsor, investimenti) | `js/game_data.js` + handler in GameScreen |
| Salvataggio (nuovi campi) | Aggiungere allo state + gestire il default per i vecchi save (vedi `migrateWorldPool`) |
| Salvataggio cloud (slot, metadati) | `js/cloud_saves.js` + tabella `public.saves` su Supabase (nuove colonne ⇒ migrazione SQL) |
