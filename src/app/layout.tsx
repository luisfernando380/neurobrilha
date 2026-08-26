import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mujeres Edifican · Área de Miembros',
  description: 'Acceso a tus materiales exclusivos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
