import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminClient } from '@/lib/supabase';
import { crearSesion } from '@/lib/session';

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  const correo = String(email || '').trim().toLowerCase();
  const clave = String(password || '');
  if (!correo || !clave) return NextResponse.json({ error: 'Ingresa correo y contrasena.' }, { status: 400 });

  const db = getAdminClient();
  const { data: fila } = await db
    .from('compradoras')
    .select('id, email, password_hash, nombre')
    .eq('email', correo)
    .maybeSingle();

  if (!fila || !fila.password_hash) {
    return NextResponse.json({ error: 'Correo o contrasena incorrectos.' }, { status: 401 });
  }
  const ok = await bcrypt.compare(clave, fila.password_hash);
  if (!ok) return NextResponse.json({ error: 'Correo o contrasena incorrectos.' }, { status: 401 });

  await crearSesion({ uid: fila.id, email: fila.email, nombre: fila.nombre });
  return NextResponse.json({ ok: true });
}
