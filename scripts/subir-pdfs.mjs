// Uso: node scripts/subir-pdfs.mjs ./pdfs
// Sobe todos os .pdf da pasta para o bucket 'materiales' e cria/atualiza
// um registro na tabela 'materiales' para cada um.
// Titulo = nome do arquivo sem extensao. Ordem = ordem alfabetica.
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const carpeta = process.argv[2] || './pdfs';
const db = createClient(url, key, { auth: { persistSession: false } });

const archivos = fs.readdirSync(carpeta).filter((f) => f.toLowerCase().endsWith('.pdf')).sort();
if (!archivos.length) { console.error('No hay PDFs en', carpeta); process.exit(1); }

let orden = 0;
for (const nombre of archivos) {
  orden += 1;
  const ruta = path.join(carpeta, nombre);
  const buf = fs.readFileSync(ruta);
  const destino = nombre; // caminho dentro do bucket
  const { error: upErr } = await db.storage.from('materiales').upload(destino, buf, {
    contentType: 'application/pdf', upsert: true,
  });
  if (upErr) { console.error('Error subiendo', nombre, upErr.message); continue; }

  const titulo = nombre.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
  // upsert por 'archivo'
  const { data: existente } = await db.from('materiales').select('id').eq('archivo', destino).maybeSingle();
  if (existente) {
    await db.from('materiales').update({ titulo, orden, activo: true }).eq('id', existente.id);
  } else {
    await db.from('materiales').insert({ titulo, archivo: destino, orden, emoji: '📖', activo: true });
  }
  console.log(`✔ ${nombre}`);
}
console.log('Listo ✅  ', archivos.length, 'PDFs procesados.');
