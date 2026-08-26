import { NextResponse } from 'next/server';
import { leerSesion } from '@/lib/session';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Entrega o PDF apenas para membros logados, via URL assinada temporaria.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const sesion = await leerSesion();
  if (!sesion) return NextResponse.redirect(new URL('/', _req.url));

  const { id } = await ctx.params;
  const db = getAdminClient();
  const { data: material } = await db
    .from('materiales')
    .select('archivo, activo')
    .eq('id', id)
    .maybeSingle();

  if (!material || !material.activo) {
    return NextResponse.json({ error: 'Material no encontrado.' }, { status: 404 });
  }

  const { data: firmado, error } = await db.storage
    .from('materiales')
    .createSignedUrl(material.archivo, 60 * 10); // 10 minutos

  if (error || !firmado) {
    return NextResponse.json({ error: 'No se pudo generar el enlace.' }, { status: 500 });
  }
  return NextResponse.redirect(firmado.signedUrl);
}
