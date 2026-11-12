import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sem as variáveis no .env o site roda em MODO DEMONSTRAÇÃO (somente leitura, dados de exemplo).
export const configured = Boolean(url && key && !url.includes("SEU-PROJETO"));

export const supabase = configured
  ? createClient(url, key, {
      // A sessão do admin fica só na aba (sessionStorage): fecha a aba, sai do painel.
      auth: { storage: window.sessionStorage, persistSession: true, autoRefreshToken: true },
    })
  : null;
