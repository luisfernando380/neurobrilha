// Uso: node scripts/importar-compradoras.mjs compradoras.csv
// CSV com cabecalho. Colunas aceitas: email (obrigatoria), nombre (opcional).
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const archivo = process.argv[2];
if (!archivo) { console.error('Uso: node scripts/importar-compradoras.mjs compradoras.csv'); process.exit(1); }

const db = createClient(url, key, { auth: { persistSession: false } });

function parseCSV(txt) {
  const lineas = txt.split(/\r?\n/).filter((l) => l.trim());
  const cab = lineas.shift().split(',').map((c) => c.trim().toLowerCase());
  const iEmail = cab.indexOf('email');
  const iNombre = cab.indexOf('nombre') >= 0 ? cab.indexOf('nombre') : cab.indexOf('nome');
  if (iEmail < 0) throw new Error('El CSV debe tener una columna "email".');
  return lineas.map((l) => {
    const cols = l.split(',');
    return {
      email: (cols[iEmail] || '').trim().toLowerCase(),
      nombre: iNombre >= 0 ? (cols[iNombre] || '').trim() || null : null,
    };
  }).filter((r) => r.email.includes('@'));
}

const filas = parseCSV(fs.readFileSync(archivo, 'utf8'));
console.log(`Importando ${filas.length} compradoras…`);
// upsert por email; nao sobrescreve senha ja existente
const { error } = await db.from('compradoras').upsert(filas, { onConflict: 'email', ignoreDuplicates: false });
if (error) { console.error('Error:', error.message); process.exit(1); }
console.log('Listo ✅');
