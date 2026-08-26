import { redirect } from 'next/navigation';
import { leerSesion } from '@/lib/session';
import { getAdminClient } from '@/lib/supabase';
import Salir from './salir';

export const dynamic = 'force-dynamic';

type Material = {
  id: string;
  titulo: string;
  descripcion: string | null;
  emoji: string | null;
  archivo: string;
  orden: number;
};

export default async function Biblioteca() {
  const sesion = await leerSesion();
  if (!sesion) redirect('/');

  const db = getAdminClient();
  const { data } = await db
    .from('materiales')
    .select('id, titulo, descripcion, emoji, archivo, orden')
    .eq('activo', true)
    .order('orden', { ascending: true });
  const materiales = (data || []) as Material[];

  const primerNombre = sesion.nombre?.split(' ')[0];

  return (
    <>
      <header className="top">
        <div className="id"><span className="dot" /> Mujeres Edifican</div>
        <Salir />
      </header>

      <section className="hero">
        <h2>Hola{primerNombre ? `, ${primerNombre}` : ''} 🌸</h2>
        <p>Este es tu espacio. Aquí encontrarás todo tu contenido para descargar y leer cuando quieras.</p>
      </section>

      {materiales.length === 0 ? (
        <div className="vacio">
          <p>Muy pronto encontrarás aquí tus materiales. ¡Estamos preparándolos con cariño! 💗</p>
        </div>
      ) : (
        <div className="grid">
          {materiales.map((m) => (
            <article className="card" key={m.id}>
              <div className="cover">{m.emoji || '📖'}</div>
              <div className="body">
                <h3>{m.titulo}</h3>
                {m.descripcion && <p>{m.descripcion}</p>}
                <a className="abrir" href={`/api/material/${m.id}`} target="_blank" rel="noopener noreferrer">Abrir PDF</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
