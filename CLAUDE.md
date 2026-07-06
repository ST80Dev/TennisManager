# ATP Career Manager — Istruzioni di lavoro

Gioco browser di gestione carriera tennistica ATP. Nessun server proprio,
nessun build step: HTML + React 18 (CDN) + Babel standalone. Salvataggio SOLO
su cloud: Supabase, 5 slot nominabili (`js/cloud_saves.js`, tabella
`public.saves` del progetto `tslpnxjlilankbncliqx`). Nessun salvataggio locale.
Deve funzionare aprendo `index.html` con doppio click (`file://`) e su Safari iOS.

## Struttura del repository

```
index.html            UI React (JSX) + CSS + bootstrap — unico file con JSX
js/
  cloud_saves.js      Salvataggio cloud: client REST Supabase (5 slot s1-s5)
  npc_system.js       Sistema NPC: archetipi, talento, career phase, ritiri, newgen
  game_data.js        Dati di gioco: tornei (TT/CAL/ATP400), punti, premi, sponsor,
                      staff, investimenti, nazioni, zone e costi di viaggio
  engine.js           Motore: formule forza/probabilità, morale, buildWorld,
                      tabelloni (KO + round robin Finals), simWeek, ranking NPC,
                      migrazioni save, export/import file di backup
tools/
  sim_harness.js      Simula N anni di mondo solo-NPC col codice reale (Node)
  sim_debug_top5.js   Debug rapido: top-5 anno per anno (Node)
docs/
  architettura.md     Mappa del codice: file, funzioni chiave, strutture dati, flussi
  note_progetto.md    Storico tecnico: bug risolti, decisioni di design, cronologia
  guida_gioco.md      Guida al gioco per l'utente (regole, costi, consigli)
saves/                Salvataggi di esempio (.json esportati dal gioco)
```

### Ordine di caricamento (dipendenze in una sola direzione)

```
js/npc_system.js  →  window.NPC_SYSTEM
js/game_data.js   →  costanti globali (usa NPC_SYSTEM)
js/engine.js      →  funzioni globali (usa game_data)
js/cloud_saves.js →  funzioni cloud* globali (usa stripBrackets di engine)
index.html        →  blocco <script type="text/babel"> con la UI (usa tutto)
```

I file in `js/` sono script classici (non moduli ES): le dichiarazioni top-level
sono visibili globalmente agli script successivi e al blocco Babel.

## Vincoli critici — NON violare

- **Niente bundler, niente ES modules, niente build step**: il gioco deve
  aprirsi con `file://`. Babel standalone non può caricare file JSX esterni
  (XHR bloccato su `file://`), quindi **tutto il JSX resta in `index.html`**.
- **Niente JSX nei file `js/`**: devono restare eseguibili in Node puro
  (i tool in `tools/` li caricano direttamente).
- **Formato salvataggio**: il salvataggio è SOLO su cloud (Supabase, 5 slot,
  vedi `js/cloud_saves.js`). Non rimuovere campi dallo state senza migrazione
  (vedi `migrateWorldPool`); nuove colonne di metadato nella tabella
  `public.saves` richiedono una migrazione SQL sul progetto Supabase.
  Non reintrodurre localStorage.
- **React hooks**: mai `useState`/`useEffect` dentro IIFE, object literal o
  blocchi condizionali. Le variabili di stato di `GameScreen` non sono
  accessibili nei componenti figli: passarle sempre come props.
- **Sostituzioni stringa su JSX**: su blocchi lunghi con emoji/caratteri
  non-ASCII usare Python (`python3 - << 'PYEOF'`), i replace dei tool
  falliscono spesso.
- Prima di modificare il motore o gli NPC, leggere **BUG RISOLTI** in
  `docs/note_progetto.md` per evitare regressioni note.

## Verifiche dopo ogni modifica

```bash
node --check js/game_data.js && node --check js/engine.js && node --check js/npc_system.js && node --check js/cloud_saves.js

# Motore/NPC: il harness deve girare senza errori (deterministico a parità di seed)
node tools/sim_harness.js 5 2 777

# UI: smoke test nel browser (Babel compila a runtime: gli errori JSX
# emergono solo qui, node --check non basta)
python3 -m http.server 8000   # poi aprire http://localhost:8000
```

Per modifiche al bilanciamento (formule, drift NPC, punti): confrontare le
metriche del harness prima/dopo (retention top10/top100, ritiri/anno, newgen
in top50) — i target realistici sono in `docs/note_progetto.md`, sezione
"VALIDAZIONE".

## Workflow git

- Ogni modifica su un **branch dedicato**, poi **Pull Request verso `main`**.
- Non committare mai direttamente su `main`.
- Commit chiari e descrittivi in italiano.
- Dopo ogni pacchetto sostanziale di modifiche: aggiornare
  `docs/note_progetto.md` (cronologia + eventuali bug risolti).

## Riferimenti

| Documento | Quando consultarlo |
|---|---|
| [docs/architettura.md](docs/architettura.md) | Prima di toccare il codice: dove sta cosa, strutture dati, flusso settimanale |
| [docs/note_progetto.md](docs/note_progetto.md) | Prima di modificare motore/NPC: bug risolti, decisioni di design, parametri validati |
| [docs/guida_gioco.md](docs/guida_gioco.md) | Regole di gioco lato utente: costi, punti, soglie di accesso ai tornei |
