import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE = 'me_sesion';
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret-cambia-esto');

export type Sesion = { uid: string; email: string; nombre: string | null };

export async function crearSesion(data: Sesion) {
  const token = await new SignJWT(data as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function leerSesion(): Promise<Sesion | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { uid: payload.uid as string, email: payload.email as string, nombre: (payload.nombre as string) ?? null };
  } catch {
    return null;
  }
}

export async function cerrarSesion() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
