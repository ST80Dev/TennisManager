// ═══════════════════════════════════════════════════════════════════
// CLOUD SAVES — salvataggio su Supabase (progetto "TennisManager")
// 5 slot (s1..s5), nessun salvataggio locale: la persistenza è SOLO
// sul cloud. Chiamate REST (PostgREST) via fetch, nessuna libreria.
// Script classico senza JSX: deve restare eseguibile con node --check.
//
// Tabella public.saves — 1 riga per slot:
//   slot pk ('s1'..'s5') · name (nome del salvataggio, scelto dall'utente)
//   payload jsonb (state completo, bracket ripuliti con stripBrackets)
//   player_name / player_age / player_rank / game_year / game_week
//   updated_at (gestito da trigger server-side, non inviarlo)
// ═══════════════════════════════════════════════════════════════════

const CLOUD_URL = "https://tslpnxjlilankbncliqx.supabase.co";
const CLOUD_KEY = "sb_publishable_1xArmc7QyNGp-dgNEouErQ_HIh2NJdy";
const CLOUD_SLOTS = ["s1", "s2", "s3", "s4", "s5"];
// Colonne di metadato mostrate nella lista slot (mai il payload: pesa MB)
const CLOUD_META_COLS = "slot,name,player_name,player_age,player_rank,game_year,game_week,updated_at";

function cloudEndpoint(query) {
  return CLOUD_URL + "/rest/v1/saves" + (query || "");
}

function cloudHeaders(extra) {
  return Object.assign({
    "apikey": CLOUD_KEY,
    "Content-Type": "application/json",
  }, extra || {});
}

// Estrae dallo state i dettagli mostrati nella lista degli slot
function cloudMetaFromState(state) {
  const p = (state && state.player) || {};
  return {
    player_name: p.name || "—",
    player_age: p.age || p.startAge || null,
    player_rank: p.rank || null,
    game_year: state.year || 1,
    game_week: state.week || 1,
  };
}

async function cloudFetch(query, opts) {
  let res;
  try {
    res = await fetch(cloudEndpoint(query), opts);
  } catch (e) {
    throw new Error("Cloud non raggiungibile: controlla la connessione a internet.");
  }
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).message || ""; } catch (e) { /* corpo non JSON */ }
    throw new Error("Errore cloud HTTP " + res.status + (detail ? " — " + detail : ""));
  }
  return res;
}

// Lista dei 5 slot: ritorna una mappa {s1:{name,player_name,...}, ...}
// con SOLO i metadati (il payload non viene scaricato). Slot vuoti assenti.
async function cloudListSaves() {
  const res = await cloudFetch("?select=" + CLOUD_META_COLS + "&order=slot.asc", {
    headers: cloudHeaders(),
  });
  const rows = await res.json();
  const map = {};
  rows.forEach(r => { map[r.slot] = r; });
  return map;
}

// Carica un salvataggio: ritorna {payload,name} o null se lo slot è vuoto
async function cloudLoadSave(slot) {
  const res = await cloudFetch("?slot=eq." + slot + "&select=payload,name", {
    headers: cloudHeaders(),
  });
  const rows = await res.json();
  if (!rows.length || !rows[0].payload) return null;
  return { payload: rows[0].payload, name: rows[0].name || "Salvataggio" };
}

// Salva (upsert) uno state su uno slot. Il nome va passato sempre:
// chi sovrascrive uno slot esistente mantiene il nome precedente
// a meno che l'utente non lo cambi esplicitamente (gestito dalla UI).
async function cloudSaveGame(slot, name, state) {
  if (CLOUD_SLOTS.indexOf(slot) < 0) throw new Error("Slot non valido: " + slot);
  const payload = Object.assign({}, state, {
    brackets: typeof stripBrackets === "function" ? stripBrackets(state.brackets) : {},
  });
  const row = Object.assign({
    slot: slot,
    name: String(name || "Salvataggio").slice(0, 60),
    payload: payload,
  }, cloudMetaFromState(state));
  await cloudFetch("?on_conflict=slot", {
    method: "POST",
    headers: cloudHeaders({ "Prefer": "resolution=merge-duplicates" }),
    body: JSON.stringify([row]),
  });
}

// Svuota uno slot
async function cloudDeleteSave(slot) {
  await cloudFetch("?slot=eq." + slot, {
    method: "DELETE",
    headers: cloudHeaders(),
  });
}
