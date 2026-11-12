import { useSyncExternalStore } from "react";

// Preferências do visitante, guardadas só neste navegador (não vão para o banco).
const mk = (key) => {
  let v = (() => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } })();
  const subs = new Set();
  return {
    toggle(id) {
      v = v.includes(id) ? v.filter((x) => x !== id) : [...v, id];
      try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
      subs.forEach((f) => f());
    },
    use: () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => v),
  };
};

const favs = mk("sv_favs");
const evs = mk("sv_evs");
export const toggleFav = favs.toggle;
export const useFavs = favs.use;
export const toggleEv = evs.toggle;
export const useEvs = evs.use;
