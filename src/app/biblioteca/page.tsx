'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { sb, urlPublicaPdf, lerToken, limparToken } from '@/lib/config';

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

type Material = {
  id: string; titulo: string; descripcion: string | null; emoji: string | null;
  archivo: string; categoria: string | null; orden: number; orden_categoria: number;
};
type Seccion = { nombre: string; items: Material[] };

// Agrupa los materiales por categoria manteniendo el orden que viene del banco
function agrupar(mats: Material[]): Seccion[] {
  const secciones: Seccion[] = [];
  for (const m of mats) {
    const nombre = (m.categoria && m.categoria.trim()) || 'Materiales';
    let sec = secciones.find((s) => s.nombre === nombre);
    if (!sec) { sec = { nombre, items: [] }; secciones.push(sec); }
    sec.items.push(m);
  }
  return secciones;
}

export default function Biblioteca() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState<string | null>(null);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [abierto, setAbierto] = useState<Material | null>(null);

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

  // Cerrar el visor con la tecla Esc y bloquear el scroll del fondo
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(null); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [abierto]);

  function salir() { limparToken(); router.replace('/'); }

  if (cargando) return <div className="cargando">Cargando tu contenido…</div>;
  const primerNombre = nombre?.split(' ')[0];
  const secciones = agrupar(materiales);

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
        <div className="secciones">
          {secciones.map((sec) => (
            <section className="seccion" key={sec.nombre}>
              <h3 className="seccion-titulo">{sec.nombre}</h3>
              <div className="grid">
                {sec.items.map((m) => (
                  <article className="card" key={m.id}>
                    <div className="cover">{m.emoji || '📖'}</div>
                    <div className="body">
                      <h4>{m.titulo}</h4>
                      {m.descripcion && <p>{m.descripcion}</p>}
                      <button className="abrir" onClick={() => setAbierto(m)}>Ver PDF</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {abierto && (
        <div className="visor" role="dialog" aria-modal="true" onClick={() => setAbierto(null)}>
          <div className="visor-caja" onClick={(e) => e.stopPropagation()}>
            <div className="visor-top">
              <span className="visor-titulo">{abierto.emoji} {abierto.titulo}</span>
              <div className="visor-acciones">
                <a className="visor-btn" href={urlPublicaPdf(abierto.archivo)} download target="_blank" rel="noopener noreferrer">Descargar</a>
                <button className="visor-cerrar" onClick={() => setAbierto(null)} aria-label="Cerrar">✕</button>
              </div>
            </div>
            <PdfViewer url={urlPublicaPdf(abierto.archivo)} />
          </div>
        </div>
      )}
    </>
  );
}
