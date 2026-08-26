'use client';
import { useRouter } from 'next/navigation';

export default function Salir() {
  const router = useRouter();
  async function salir() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }
  return <button className="salir" onClick={salir}>Salir</button>;
}
