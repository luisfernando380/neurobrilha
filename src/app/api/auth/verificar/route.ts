import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

// Verifica se o email consta na lista de compradoras e se ja tem senha cadastrada.
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: '' }));
  const correo = String(email || '').trim().toLowerCase();
  if (!correo) return NextResponse.json({ error: 'Ingresa tu correo.' }, { status: 400 });

  const db = getAdminClient();
  const { data, error } = await db
    .from('compradoras')
    .select('email, password_hash, nombre')
    .eq('email', correo)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  if (!data) {
    return NextResponse.json(
      { habilitada: false, error: 'Este correo no aparece en nuestra lista de compras. Usa el mismo correo con el que realizaste la compra.' },
      { status: 404 },
    );
  }
  return NextResponse.json({ habilitada: true, tieneSenha: !!data.password_hash, nombre: data.nombre });
}
