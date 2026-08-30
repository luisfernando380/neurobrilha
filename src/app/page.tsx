'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb, guardarToken } from '@/lib/config';

type Paso = 'email' | 'crear' | 'login' | 'recuperar';

const PREGUNTAS = [
  '¿Cómo se llamaba tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál es tu comida favorita?',
  '¿Cuál es el nombre de tu mejor amiga?',
  '¿Cuál es tu versículo o libro favorito de la Biblia?',
];

export default function Login() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>('email');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  // seguridad
  const [pregunta, setPregunta] = useState(PREGUNTAS[0]);
  const [respuesta, setRespuesta] = useState('');
  // recuperación
  const [preguntaRec, setPreguntaRec] = useState('');
  const [respuestaRec, setRespuestaRec] = useState('');
  const [nueva, setNueva] = useState('');

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setCargando(true);
    const { data, error: err } = await sb.rpc('me_verificar', { correo: email });
    setCargando(false);
    if (err) { setError('Error de conexión. Intenta de nuevo.'); return; }
    if (!data?.habilitada) { setError(data?.error || 'No pudimos verificar tu correo.'); return; }
    setNombre(data.nombre || null);
    setPaso(data.tieneSenha ? 'login' : 'crear');
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres.'); return; }
    if (password !== password2) { setError('Las contrasenas no coinciden.'); return; }
    if (respuesta.trim().length < 2) { setError('Escribe la respuesta de tu pregunta de seguridad.'); return; }
    setCargando(true);
    const { data, error: err } = await sb.rpc('me_registrar', { correo: email, clave: password, pregunta, respuesta });
    setCargando(false);
    if (err) { setError('Error de conexión. Intenta de nuevo.'); return; }
    if (data?.error) { setError(data.error); return; }
    guardarToken(data.token);
    router.push('/biblioteca');
  }

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setCargando(true);
    const { data, error: err } = await sb.rpc('me_login', { correo: email, clave: password });
    setCargando(false);
    if (err) { setError('Error de conexión. Intenta de nuevo.'); return; }
    if (data?.error) { setError(data.error); return; }
    guardarToken(data.token);
    router.push('/biblioteca');
  }

  async function irARecuperar() {
    setError(''); setCargando(true);
    const { data, error: err } = await sb.rpc('me_pregunta', { correo: email });
    setCargando(false);
    if (err) { setError('Error de conexión. Intenta de nuevo.'); return; }
    if (data?.error) { setError(data.error); return; }
    setPreguntaRec(data.pregunta);
    setRespuestaRec(''); setNueva('');
    setPaso('recuperar');
  }

  async function recuperar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (nueva.length < 6) { setError('La nueva contrasena debe tener al menos 6 caracteres.'); return; }
    setCargando(true);
    const { data, error: err } = await sb.rpc('me_recuperar', { correo: email, respuesta: respuestaRec, nueva });
    setCargando(false);
    if (err) { setError('Error de conexión. Intenta de nuevo.'); return; }
    if (data?.error) { setError(data.error); return; }
    guardarToken(data.token);
    router.push('/biblioteca');
  }

  function volver() {
    setPaso('email'); setPassword(''); setPassword2(''); setRespuesta('');
    setRespuestaRec(''); setNueva(''); setError('');
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="marca">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-img" src="/logo.png" alt="Mujeres Edifican" />
          <h1>Mujeres Edifican</h1>
          <div className="sub">Área exclusiva de miembros</div>
        </div>

        {paso === 'email' && (
          <form onSubmit={verificar}>
            <div className="paso-titulo">Ingresa a tu contenido</div>
            <div className="paso-desc">Escribe tu correo para entrar o crear tu acceso.</div>
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
            <div className="paso-desc">Es tu primer acceso. Crea una contrasena para <b>{email}</b> y una pregunta de seguridad (te servirá si olvidas tu contrasena).</div>
            <label htmlFor="p1">Nueva contrasena</label>
            <input id="p1" type="password" required autoComplete="new-password" placeholder="Mínimo 6 caracteres"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="p2">Repite la contrasena</label>
            <input id="p2" type="password" required autoComplete="new-password" placeholder="Repite tu contrasena"
              value={password2} onChange={(e) => setPassword2(e.target.value)} />
            <label htmlFor="preg">Pregunta de seguridad</label>
            <select id="preg" className="select" value={pregunta} onChange={(e) => setPregunta(e.target.value)}>
              {PREGUNTAS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
            <label htmlFor="resp">Tu respuesta</label>
            <input id="resp" type="text" required placeholder="Escribe tu respuesta"
              value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
            <div className="hint-clave">Guarda tu contrasena y recuerda tu respuesta.</div>
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
            <div className="pie">
              <button type="button" className="btn-link" onClick={irARecuperar} disabled={cargando}>¿Olvidaste tu contrasena?</button>
            </div>
            <div className="pie">¿Otro correo?<button type="button" className="btn-link" onClick={volver}>Cambiar correo</button></div>
          </form>
        )}

        {paso === 'recuperar' && (
          <form onSubmit={recuperar}>
            <div className="paso-titulo">Recuperar acceso 🔑</div>
            <div className="paso-desc">Responde tu pregunta de seguridad para crear una nueva contrasena de <b>{email}</b>.</div>
            <label>Pregunta de seguridad</label>
            <input type="text" value={preguntaRec} disabled />
            <label htmlFor="rr">Tu respuesta</label>
            <input id="rr" type="text" required placeholder="Escribe tu respuesta"
              value={respuestaRec} onChange={(e) => setRespuestaRec(e.target.value)} />
            <label htmlFor="nn">Nueva contrasena</label>
            <input id="nn" type="password" required autoComplete="new-password" placeholder="Mínimo 6 caracteres"
              value={nueva} onChange={(e) => setNueva(e.target.value)} />
            {error && <div className="aviso error">{error}</div>}
            <button className="btn" disabled={cargando}>{cargando ? 'Guardando…' : 'Cambiar contrasena y entrar'}</button>
            <div className="pie"><button type="button" className="btn-link" onClick={() => { setPaso('login'); setError(''); }}>Volver</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
