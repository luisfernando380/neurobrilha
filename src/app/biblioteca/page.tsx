'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb, urlPublicaPdf, lerToken, limparToken } from '@/lib/config';

type Material = { id: string; titulo: string; descripcion: string | null; emoji: string | null; archivo: string; orden: number };

export default function Biblioteca() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState<string | null>(null);
  const [materiales, setMateriales] = useState<Material[]>([]);

  useEffect(() => {
    const tok = lerToken();
    if (!tok) { router.replace('/'); return; }
    sb.rpc('me_materiales', { tok }).then(({ data, error }) => {
      if (error || !data || data.error) { limparToken(); router.replace('/'); return; }
      setNombre(data.nombre || null);
      setMateriales(data.materiales || []);
      setCargando(false);
    });
  }, [router]);

  function salir() { limparToken(); router.replace('/'); }

  if (cargando) return <div className="cargando">Cargando tu contenido…</div>;
  const primerNombre = nombre?.split(' ')[0];

  return (
    <>
      <header className="top">
        <div className="id"><span className="dot" /> Mujeres Edifican</div>
        <button className="salir" onClick={salir}>Salir</button>
      </header>

      <section className="hero">
        <h2>Hola{primerNombre ? `, ${primerNombre}` : ''} 🌸</h2>
        <p>Este es tu espacio. Aquí encontrarás todo tu contenido para leer y descargar cuando quieras.</p>
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
                <a className="abrir" href={urlPublicaPdf(m.archivo)} target="_blank" rel="noopener noreferrer">Abrir PDF</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
