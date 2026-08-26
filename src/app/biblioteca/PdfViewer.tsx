'use client';
import { useEffect, useRef, useState } from 'react';

// Visor de PDF leve para movil y escritorio:
// renderiza cada pagina SOLO cuando entra en pantalla (lazy) y libera las que
// se alejan, para no saturar la memoria del telefono (que causaba paginas
// "bugadas" e imagenes que no aparecian). Usa PDF.js.
export default function PdfViewer({ url }: { url: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'erro'>('carregando');

  useEffect(() => {
    let cancelado = false;
    let doc: any = null;
    let observer: IntersectionObserver | null = null;
    const renderTasks = new Map<number, any>();
    let cola: Promise<void> = Promise.resolve();

    (async () => {
      try {
        const pdfjs: any = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        doc = await pdfjs.getDocument({ url }).promise;
        if (cancelado) { doc.destroy(); return; }

        const scroll = scrollRef.current;
        if (!scroll) return;
        const ancho = Math.min(scroll.clientWidth - 28, 900); // menos el padding
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        // Proporcion aproximada a partir de la primera pagina
        const p1 = await doc.getPage(1);
        const base = p1.getViewport({ scale: 1 });
        const escala = ancho / base.width;
        const altoAprox = Math.round(base.height * escala);

        // Contenedor de paginas
        const lienzos = document.createElement('div');
        lienzos.className = 'pdf-lienzos';
        scroll.appendChild(lienzos);

        // Crear placeholders con altura estimada
        const slots: HTMLDivElement[] = [];
        for (let n = 1; n <= doc.numPages; n++) {
          const slot = document.createElement('div');
          slot.className = 'pdf-slot';
          slot.style.width = ancho + 'px';
          slot.style.minHeight = altoAprox + 'px';
          slot.dataset.page = String(n);
          lienzos.appendChild(slot);
          slots.push(slot);
        }
        setEstado('ok');

        async function renderPagina(slot: HTMLDivElement) {
          const n = Number(slot.dataset.page);
          if (slot.dataset.rendered === '1' || renderTasks.has(n)) return;
          slot.dataset.rendered = '1';
          try {
            const page = await doc.getPage(n);
            if (cancelado) return;
            const vp = page.getViewport({ scale: escala });
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-pagina';
            canvas.width = Math.floor(vp.width * dpr);
            canvas.height = Math.floor(vp.height * dpr);
            canvas.style.width = ancho + 'px';
            canvas.style.height = 'auto';
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            slot.innerHTML = '';
            slot.appendChild(canvas);
            slot.style.minHeight = '0';
            const task = page.render({
              canvasContext: ctx,
              viewport: vp,
              transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
            });
            renderTasks.set(n, task);
            await task.promise;
            renderTasks.delete(n);
          } catch {
            slot.dataset.rendered = '';
          }
        }

        function liberar(slot: HTMLDivElement) {
          const n = Number(slot.dataset.page);
          const task = renderTasks.get(n);
          if (task) { try { task.cancel(); } catch {} renderTasks.delete(n); }
          slot.innerHTML = '';
          slot.dataset.rendered = '';
          slot.style.minHeight = altoAprox + 'px';
        }

        observer = new IntersectionObserver((entradas) => {
          for (const e of entradas) {
            const slot = e.target as HTMLDivElement;
            if (e.isIntersecting) {
              cola = cola.then(() => (cancelado ? Promise.resolve() : renderPagina(slot)));
            } else {
              liberar(slot);
            }
          }
        }, { root: scroll, rootMargin: '800px 0px', threshold: 0.01 });

        slots.forEach((s) => observer!.observe(s));
      } catch {
        if (!cancelado) setEstado('erro');
      }
    })();

    return () => {
      cancelado = true;
      if (observer) observer.disconnect();
      renderTasks.forEach((t) => { try { t.cancel(); } catch {} });
      if (doc) { try { doc.destroy(); } catch {} }
    };
  }, [url]);

  return (
    <div ref={scrollRef} className="pdf-scroll">
      {estado === 'carregando' && <div className="pdf-aviso">Cargando PDF…</div>}
      {estado === 'erro' && <div className="pdf-aviso">No se pudo mostrar el PDF aquí. Usa el botón Descargar.</div>}
    </div>
  );
}
