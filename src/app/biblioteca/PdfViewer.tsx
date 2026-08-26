'use client';
import { useEffect, useRef, useState } from 'react';

// Renderiza um PDF pagina a pagina (canvas) para funcionar em qualquer
// celular ou computador, sem sair do app. Usa PDF.js (pdfjs-dist).
export default function PdfViewer({ url }: { url: string }) {
  const contRef = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'erro'>('carregando');

  useEffect(() => {
    let cancelado = false;
    let pdfDoc: { numPages: number; getPage: (n: number) => Promise<unknown>; destroy: () => void } | null = null;

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        // Worker do proprio pacote (emitido pelo bundler)
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const doc = await pdfjs.getDocument({ url }).promise;
        if (cancelado) { doc.destroy(); return; }
        pdfDoc = doc as unknown as typeof pdfDoc;
        const cont = contRef.current;
        if (!cont) return;
        cont.innerHTML = '';
        const ancho = Math.min(cont.clientWidth, 900);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let n = 1; n <= doc.numPages; n++) {
          if (cancelado) return;
          const page = await doc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const escala = ancho / base.width;
          const vp = page.getViewport({ scale: escala });

          const canvas = document.createElement('canvas');
          canvas.className = 'pdf-pagina';
          canvas.width = Math.floor(vp.width * dpr);
          canvas.height = Math.floor(vp.height * dpr);
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          cont.appendChild(canvas);
          await page.render({ canvasContext: ctx, viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined }).promise;
          if (n === 1 && !cancelado) setEstado('ok');
        }
        if (!cancelado) setEstado('ok');
      } catch {
        if (!cancelado) setEstado('erro');
      }
    })();

    return () => { cancelado = true; if (pdfDoc) try { pdfDoc.destroy(); } catch {} };
  }, [url]);

  return (
    <div className="pdf-scroll">
      {estado === 'carregando' && <div className="pdf-aviso">Cargando PDF…</div>}
      {estado === 'erro' && <div className="pdf-aviso">No se pudo mostrar el PDF aquí. Usa el botón Descargar.</div>}
      <div ref={contRef} className="pdf-lienzos" />
    </div>
  );
}
