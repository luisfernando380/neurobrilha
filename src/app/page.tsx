'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Paso = 'email' | 'crear' | 'login';

export default function Login() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>('email');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setCargando(true);
    try {
      const r = await fetch('/api/auth/verificar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'No pudimos verificar tu correo.'); return; }
      setNombre(d.nombre || null);
      setPaso(d.tieneSenha ? 'login' : 'crear');
    } catch { setError('Error de conexion. Intenta de nuevo.'); }
    finally { setCargando(false); }
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres.'); return; }
    if (password !== password2) { setError('Las contrasenas no coinciden.'); return; }
    setCargando(true);
    try {
      const r = await fetch('/api/auth/registrar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'No pudimos crear tu cuenta.'); return; }
      router.push('/biblioteca');
    } catch { setError('Error de conexion. Intenta de nuevo.'); }
    finally { setCargando(false); }
  }

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setCargando(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'No pudimos iniciar sesion.'); return; }
      router.push('/biblioteca');
    } catch { setError('Error de conexion. Intenta de nuevo.'); }
    finally { setCargando(false); }
  }

  function volver() {
    setPaso('email'); setPassword(''); setPassword2(''); setError('');
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="marca">
          <div className="logo">✦</div>
          <h1>Mujeres Edifican</h1>
          <div className="sub">Área exclusiva de miembros</div>
        </div>

        {paso === 'email' && (
          <form onSubmit={verificar}>
            <div className="paso-titulo">Ingresa a tu contenido</div>
            <div className="paso-desc">Usa el correo con el que realizaste tu compra.</div>
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" required autoComplete="email" placeholder="tucorreo@ejemplo.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <div className="aviso error">{error}</div>}
            <button className="btn" disabled={cargando}>{cargando ? 'Verificando…' : 'Continuar'}</button>
          </form>
        )}

        {paso === 'crear' && (
          <form onSubmit={crear}>
            <div className="paso-titulo">¡Bienvenida{nombre ? `, ${nombre}` : ''}! 🌸</div>
            <div className="paso-desc">Es tu primer acceso. Crea una contrasena para <b>{email}</b>. La usarás en tus próximos ingresos.</div>
            <label htmlFor="p1">Nueva contrasena</label>
            <input id="p1" type="password" required autoComplete="new-password" placeholder="Mínimo 6 caracteres"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="p2">Repite la contrasena</label>
            <input id="p2" type="password" required autoComplete="new-password" placeholder="Repite tu contrasena"
              value={password2} onChange={(e) => setPassword2(e.target.value)} />
            <div className="hint-clave">Guárdala en un lugar seguro.</div>
            {error && <div className="aviso error">{error}</div>}
            <button className="btn" disabled={cargando}>{cargando ? 'Creando…' : 'Crear cuenta y entrar'}</button>
            <div className="pie">¿No eres tú?<button type="button" className="btn-link" onClick={volver}>Cambiar correo</button></div>
          </form>
        )}

        {paso === 'login' && (
          <form onSubmit={entrar}>
            <div className="paso-titulo">Hola de nuevo{nombre ? `, ${nombre}` : ''} 🌸</div>
            <div className="paso-desc">Ingresa la contrasena de <b>{email}</b>.</div>
            <label htmlFor="pl">Contrasena</label>
            <input id="pl" type="password" required autoComplete="current-password" placeholder="Tu contrasena"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <div className="aviso error">{error}</div>}
            <button className="btn" disabled={cargando}>{cargando ? 'Entrando…' : 'Entrar'}</button>
            <div className="pie">¿Otro correo?<button type="button" className="btn-link" onClick={volver}>Cambiar correo</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
