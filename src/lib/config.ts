// Valores PUBLICOS do Supabase (seguros para o navegador).
// A protecao real esta nas funcoes SECURITY DEFINER do banco + token de sessao.
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://shsjumzatlwvpyqnkrnt.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_7kXP4RuoJNp4R5GJo3NFnQ_c3g9V0Rx';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export const urlPublicaPdf = (archivo: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/materiales/${encodeURIComponent(archivo)}`;

const LS = 'me_token';
export const guardarToken = (t: string) => { try { localStorage.setItem(LS, t); } catch {} };
export const lerToken = () => { try { return localStorage.getItem(LS); } catch { return null; } };
export const limparToken = () => { try { localStorage.removeItem(LS); } catch {} };
