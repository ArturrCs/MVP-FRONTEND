import { useSyncExternalStore } from "react";
import { supabase, configured } from "./supabase";
import { demo } from "./demoData";
import { resizeImage } from "./image";

export { toggleFav, useFavs, toggleEv, useEvs } from "./local";
export const demoMode = !configured;

// ---------- Tradução banco (snake_case) <-> app ----------
const MAP = {
  attractions: { condition: "trail_condition", desc: "description" },
  events: { date: "event_date", time: "event_time" },
  seasons: { from: "date_from", to: "date_to" },
  news: { text: "body" },
  alerts: { text: "message" },
  reports: { text: "body" },
};
const ORDER = {
  attractions: ["id", true], events: ["event_date", true], seasons: ["date_from", true],
  news: ["id", false], alerts: ["id", true], reports: ["id", false],
};
const toApp = (t, r) => {
  const o = { ...r };
  for (const [app, db] of Object.entries(MAP[t] || {})) { o[app] = o[db]; delete o[db]; }
  if (t === "reports") { o.date = (r.created_at || "").slice(0, 10); }
  if (t === "attractions") { o.gallery = o.gallery || []; o.sources = o.sources || []; }
  return o;
};
const toDb = (t, o) => {
  const r = { ...o };
  for (const [app, db] of Object.entries(MAP[t] || {})) if (app in r) { r[db] = r[app]; delete r[app]; }
  delete r.id; delete r.date; delete r.created_at;
  if (t === "events") r.event_date = o.date ?? r.event_date;
  return r;
};

// ---------- Estado ----------
const empty = { attractions: [], events: [], seasons: [], news: [], alerts: [], reports: [], loading: true, error: "" };
let data = demoMode ? { ...demo, reports: [], loading: false, error: "" } : empty;
const subs = new Set();
const set = (patch) => { data = { ...data, ...patch }; subs.forEach((f) => f()); };
export const useData = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => data);

const fetchTable = async (t) => {
  const [col, asc] = ORDER[t];
  const { data: rows, error } = await supabase.from(t).select("*").order(col, { ascending: asc });
  if (error) throw error;
  return rows.map((r) => toApp(t, r));
};

export const reload = async () => {
  if (demoMode) return;
  try {
    const pub = ["attractions", "events", "seasons", "news", "alerts"];
    const res = await Promise.all(pub.map(fetchTable));
    const patch = { loading: false, error: "" };
    pub.forEach((t, i) => { patch[t] = res[i]; });
    if (auth.admin) patch.reports = await fetchTable("reports");
    set(patch);
  } catch (e) {
    set({ loading: false, error: "Não foi possível carregar os dados. Verifique a conexão e tente novamente." });
    console.error(e);
  }
};

// ---------- Escrita (somente administrador; o banco confere de novo via RLS) ----------
const guard = () => { if (demoMode) throw new Error("Modo demonstração: conecte o Supabase para salvar alterações."); };
// Mensagens amigáveis para as validações do banco (supabase/melhorias-v2.2.sql)
const RULES = {
  seasons_datas_ok: "A data de fim não pode ser antes da data de início.",
  attractions_status_ok: "Status de atração inválido.",
  attractions_dificuldade_ok: "Dificuldade inválida.",
  attractions_tipo_ok: "Tipo de atração inválido.",
  events_status_ok: "Status de evento inválido.",
  reports_status_ok: "Status de relato inválido.",
  news_texto_ok: "O texto da novidade passou do limite de 5000 caracteres.",
  alerts_mensagem_ok: "O aviso deve ter entre 1 e 300 caracteres.",
  _nome_ok: "O nome deve ter entre 1 e 200 caracteres.",
  _titulo_ok: "O título deve ter entre 1 e 200 caracteres.",
};
const msg = (e) => {
  const m = e?.message || "";
  if (m.includes("row-level security")) return "Sem permissão para esta ação.";
  const rule = Object.keys(RULES).find((k) => m.includes(k));
  return rule ? RULES[rule] : m || "Erro ao salvar.";
};

export async function add(t, obj) {
  guard();
  // Visitante enviando relato: não pode ler a tabela, então grava sem pedir a linha de volta.
  if (t === "reports" && !auth.admin) {
    const { error } = await supabase.from(t).insert(toDb(t, obj));
    if (error) throw new Error(msg(error));
    return null;
  }
  const { data: row, error } = await supabase.from(t).insert(toDb(t, obj)).select().single();
  if (error) throw new Error(msg(error));
  const item = toApp(t, row);
  set({ [t]: ORDER[t][1] ? [...data[t], item] : [item, ...data[t]] });
  return row.id;
}

// Histórico de alterações (somente administrador): últimas 50 ações registradas pelo banco.
export async function fetchAudit() {
  guard();
  const { data: rows, error } = await supabase.from("audit_log").select("*").order("id", { ascending: false }).limit(50);
  if (error) throw new Error(error.code === "42P01" || error.code === "PGRST205" ? "Histórico ainda não instalado: rode supabase/melhorias-v2.2.sql no Supabase." : msg(error));
  return rows;
}

export async function patch(t, id, obj) {
  guard();
  const { data: row, error } = await supabase.from(t).update(toDb(t, obj)).eq("id", id).select().single();
  if (error) throw new Error(msg(error));
  set({ [t]: data[t].map((x) => (x.id === id ? toApp(t, row) : x)) });
}

export async function remove(t, id) {
  guard();
  const { error } = await supabase.from(t).delete().eq("id", id);
  if (error) throw new Error(msg(error));
  set({ [t]: data[t].filter((x) => x.id !== id) });
}

// Envia a foto (já reduzida) ao Storage e devolve a URL pública.
export async function uploadImage(file) {
  guard();
  const blob = await resizeImage(file);
  const name = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("fotos").upload(name, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw new Error(msg(error));
  return supabase.storage.from("fotos").getPublicUrl(name).data.publicUrl;
}

// ---------- Login de administrador (Supabase Auth) ----------
const isAdminUser = (u) => u?.app_metadata?.role === "admin";
let auth = { ready: demoMode, admin: false, email: "" };
const asubs = new Set();
const setAuth = (a) => { auth = a; asubs.forEach((f) => f()); };
export const useAuth = () => useSyncExternalStore((f) => { asubs.add(f); return () => asubs.delete(f); }, () => auth);

// Relatos novos chegam de outros navegadores: com o admin logado, busca de novo a cada 15 s
// (e ao voltar para a aba), para o contador do Painel atualizar sem precisar recarregar.
let reportsTimer = null;
const refreshReports = async () => {
  if (!auth.admin || document.hidden) return;
  try {
    const rows = await fetchTable("reports");
    if (auth.admin && JSON.stringify(rows) !== JSON.stringify(data.reports)) set({ reports: rows });
  } catch (e) { console.error(e); }
};

if (!demoMode) {
  supabase.auth.onAuthStateChange((_ev, session) => {
    const admin = isAdminUser(session?.user);
    const was = auth.admin;
    setAuth({ ready: true, admin, email: admin ? session.user.email : "" });
    if (admin && !was) {
      setTimeout(refreshReports, 0);
      reportsTimer = setInterval(refreshReports, 15000);
    }
    if (!admin && was) { clearInterval(reportsTimer); set({ reports: [] }); }
  });
  document.addEventListener("visibilitychange", refreshReports);
  reload();
}

export async function login(email, pass) {
  if (demoMode) throw new Error("Modo demonstração: configure o Supabase (arquivo .env) para ativar o login.");
  const { data: r, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
  if (error) throw new Error("E-mail ou senha inválidos.");
  if (!isAdminUser(r.user)) {
    await supabase.auth.signOut();
    throw new Error("Esta conta não tem permissão de administrador.");
  }
}
export const logout = () => (demoMode ? Promise.resolve() : supabase.auth.signOut());
