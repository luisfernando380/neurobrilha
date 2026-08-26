import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Cliente admin (server-side apenas). Usa a service_role para ler/escrever
// nas tabelas protegidas por RLS. NUNCA importe isto em componentes de client.
export function getAdminClient() {
  if (!url || !serviceKey) {
    throw new Error('Variaveis do Supabase ausentes (URL / SERVICE_ROLE_KEY).');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
