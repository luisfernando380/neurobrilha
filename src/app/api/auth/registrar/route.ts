import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminClient } from '@/lib/supabase';
import { crearSesion } from '@/lib/session';

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  const correo = String(email || '').trim().toLowerCase();
  const clave = String(password || '');

  if (!correo) return NextResponse.json({ error: 'Ingresa tu correo.' }, { status: 400 });
  if (clave.length < 6) return NextResponse.json({ error: 'La contrasena debe tener al menos 6 caracteres.' }, { status: 400 });

  const db = getAdminClient();
  const { data: fila, error } = await db
    .from('compradoras')
    .select('id, email, password_hash, nombre')
    .eq('email', correo)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  if (!fila) {
    return NextResponse.json(
      { error: 'Este correo no aparece en nuestra lista de compras. Usa el correo de tu compra.' },
      { status: 404 },
    );
  }
  if (fila.password_hash) {
    return NextResponse.json(
      { error: 'Esta cuenta ya tiene contrasena. Inicia sesion normalmente.' },
      { status: 409 },
    );
  }

  const hash = await bcrypt.hash(clave, 10);
  const { error: upErr } = await db
    .from('compradoras')
    .update({ password_hash: hash, activada_en: new Date().toISOString() })
    .eq('id', fila.id);
  if (upErr) return NextResponse.json({ error: 'No se pudo guardar la contrasena.' }, { status: 500 });

  await crearSesion({ uid: fila.id, email: fila.email, nombre: fila.nombre });
  return NextResponse.json({ ok: true });
}
