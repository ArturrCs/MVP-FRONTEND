import { useSyncExternalStore } from "react";

const KEY = "sv_data_v1";
// DEMO: credenciais no front-end NÃO são seguras. Em produção use Supabase Auth.
const ADMIN = { email: "admin@saquaremaverde.com", pass: "verde123" };

// DADOS DE EXEMPLO: substitua pelos oficiais (INEA / Prefeitura) pelo painel admin.
const seed = {
  attractions: [
    { id: 5, name: "Parque Estadual da Costa do Sol", area: "PECS", type: "Parque", difficulty: "Variada", distance: "Vários roteiros", hours: "08h–16h", status: "Aberta", condition: "Consulte a administração", desc: "Unidade de conservação estadual que protege ecossistemas costeiros como restingas e lagoas.", tips: "Respeite a sinalização e mantenha-se nas trilhas autorizadas.", rules: "Proibido fazer fogueira, acampar fora das áreas permitidas e retirar fauna ou flora.", image: "/img/parque.svg", location: "Parque Estadual da Costa do Sol, Saquarema, RJ" },
    { id: 6, name: "Reserva Ecológica Estadual de Jacarepiá", area: "REE Jacarepiá", type: "Parque", difficulty: "Variada", distance: "Vários roteiros", hours: "07h–15h", status: "Aberta", condition: "Consulte a administração", desc: "Reserva com Mata Atlântica, trilhas e cachoeiras, voltada à conservação e à educação ambiental.", tips: "Faça o registro na portaria e leve água suficiente.", rules: "Visitação sujeita às normas da reserva. Não leve animais de estimação.", image: "/img/parque.svg", location: "Reserva Ecológica Estadual de Jacarepiá, Saquarema, RJ" },
    { id: 1, name: "Trilha da Restinga", area: "PECS", type: "Trilha", difficulty: "Fácil", distance: "3 km", hours: "08h–16h", status: "Aberta", condition: "Seca e bem sinalizada", desc: "Caminhada leve entre vegetação de restinga, ideal para observar aves e plantas nativas.", tips: "Leve água, protetor solar e use calçado fechado.", rules: "Proibido deixar lixo, alimentar animais ou retirar plantas.", image: "/img/trilha.svg", location: "Parque Estadual da Costa do Sol, Saquarema, RJ" },
    { id: 2, name: "Mirante da Serra", area: "REE Jacarepiá", type: "Trilha", difficulty: "Moderada", distance: "6 km", hours: "07h–15h", status: "Atenção", condition: "Trecho escorregadio após chuva", desc: "Subida com vista panorâmica das lagoas e do litoral de Saquarema.", tips: "Evite dias de chuva e inicie cedo para voltar antes do fim da tarde.", rules: "Visitação com registro na portaria. Grupos de até 10 pessoas.", image: "/img/trilha.svg", location: "Reserva Ecológica Estadual de Jacarepiá, Saquarema, RJ" },
    { id: 3, name: "Cachoeira do Vale", area: "REE Jacarepiá", type: "Cachoeira", difficulty: "Moderada", distance: "4 km", hours: "08h–15h", status: "Aberta", condition: "Boa, com volume de água médio", desc: "Queda d'água cercada de Mata Atlântica, com poço para contemplação.", tips: "Não pule nas pedras; a superfície é lisa.", rules: "Não é permitido som alto nem sabão/repelente na água.", image: "/img/cachoeira.svg", location: "Reserva Ecológica Estadual de Jacarepiá, Saquarema, RJ" },
    { id: 4, name: "Observação de Aves", area: "PECS", type: "Biodiversidade", difficulty: "Fácil", distance: "2 km", hours: "06h–10h", status: "Aberta", condition: "Ótima para observação pela manhã", desc: "Roteiro curto para registrar aves, borboletas e outros animais da região.", tips: "Fale baixo, use roupas de cores neutras e leve binóculos.", rules: "Proibido o uso de drones.", image: "/img/biodiversidade.svg", location: "Parque Estadual da Costa do Sol, Saquarema, RJ" },
  ],
  events: [
    { id: 1, title: "Mutirão de Limpeza da Restinga", date: "2026-11-21", time: "08h–12h", place: "PECS", status: "Aberto" },
    { id: 2, title: "Caminhada Noturna com Guia", date: "2026-12-05", time: "18h–21h", place: "REE Jacarepiá", status: "Lotado" },
    { id: 3, title: "Oficina de Observação de Aves", date: "2026-12-12", time: "06h–09h", place: "PECS", status: "Aberto" },
  ],
  seasons: [
    { id: 1, name: "Alta temporada (verão)", from: "2026-12-15", to: "2027-03-15", hours: "07h–17h" },
    { id: 2, name: "Baixa temporada", from: "2027-03-16", to: "2027-12-14", hours: "08h–16h" },
  ],
  v: 2,
  alert: { active: true, text: "Trilha do Mirante com trecho em manutenção: use o acesso alternativo." },
  reports: [],
  news: [
    { id: 1, title: "Trilha do Mirante com trecho em manutenção", text: "Equipe do parque faz reparos na escadaria. Use o acesso alternativo." },
    { id: 2, title: "Novas regras de visitação", text: "Grupos acima de 10 pessoas precisam agendar com antecedência." },
  ],
};

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s) return seed;
    if (s.v >= 2) return { ...seed, ...s };
    const base = Object.fromEntries(seed.attractions.map((a) => [a.id, a]));
    const have = new Set(s.attractions.map((a) => a.id));
    const old = s.attractions.map((a) => ({ ...base[a.id], ...a }));
    return { ...seed, ...s, v: 2, attractions: [...old, ...seed.attractions.filter((a) => !have.has(a.id))] };
  } catch { return seed; }
};
let data = load();
const subs = new Set();

export const update = (fn) => {
  data = fn(data);
  let ok = true;
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { ok = false; }
  subs.forEach((x) => x());
  return ok;
};
export const useData = () =>
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => data);

export const uid = () => Date.now() + Math.floor(Math.random() * 1000);
export const login = (e, p) => {
  const ok = e.trim().toLowerCase() === ADMIN.email && p === ADMIN.pass;
  if (ok) sessionStorage.setItem("sv_admin", "1");
  return ok;
};
export const isAdmin = () => sessionStorage.getItem("sv_admin") === "1";
export const logout = () => sessionStorage.removeItem("sv_admin");

// Roteiro favorito (por visitante, neste navegador)
let favs = (() => { try { return JSON.parse(localStorage.getItem("sv_favs")) || []; } catch { return []; } })();
const fsubs = new Set();
export const toggleFav = (id) => {
  favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  try { localStorage.setItem("sv_favs", JSON.stringify(favs)); } catch {}
  fsubs.forEach((x) => x());
};
export const useFavs = () => useSyncExternalStore((f) => { fsubs.add(f); return () => fsubs.delete(f); }, () => favs);
