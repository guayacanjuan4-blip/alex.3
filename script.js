/* ============================================================
   Para Alex — lógica de la página
   1) Mensajes que cruzan la pantalla solos
   2) Pétalos de girasol cayendo
   3) Toque en pantalla -> aparece un "te quiero más"
   4) Carrusel: se puede girar con el dedo
   5) Contador de veces
   ============================================================ */

const capa      = document.getElementById('capaFlotante');
const carrusel  = document.getElementById('carrusel');
const contador  = document.getElementById('contador');
const boton     = document.getElementById('botonQuiero');

/* Frases que van subiendo de intensidad con cada toque */
const frases = [
  'te quiero',
  'te quiero más',
  'y más',
  'muchísimo más',
  'te estimo un montón',
  'sos increíble, Alex',
  'gracias por existir',
  'te quiero infinito 💚'
];

let veces = 0;

/* ---------- 1) Mensajes que cruzan la pantalla ---------- */
function mensajeQueCruza() {
  const el = document.createElement('span');
  el.className = 'mensaje cruza';
  el.textContent = Math.random() > .5 ? 'te quiero' : 'te quiero, Alex 💚';
  el.style.top = (10 + Math.random() * 80) + 'vh';
  el.style.animationDuration = (9 + Math.random() * 7) + 's';
  capa.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}
setInterval(mensajeQueCruza, 2600);
mensajeQueCruza();

/* ---------- 2) Pétalos / girasoles cayendo ---------- */
function petalo() {
  const el = document.createElement('span');
  el.className = 'petalo';
  el.textContent = Math.random() > .35 ? '🌻' : '🌼';
  el.style.left = Math.random() * 100 + 'vw';
  el.style.animationDuration = (7 + Math.random() * 6) + 's';
  capa.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}
setInterval(petalo, 1800);

/* ---------- 3) Toque en la pantalla ---------- */
function brotarMensaje(x, y) {
  veces++;
  if (contador) contador.textContent = veces;

  const el = document.createElement('span');
  el.className = 'mensaje toque';
  el.textContent = frases[Math.min(veces - 1, frases.length - 1)];
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  el.style.fontSize = (1.2 + Math.min(veces, 10) * 0.07) + 'rem';
  capa.appendChild(el);
  el.addEventListener('animationend', () => el.remove());

  if (navigator.vibrate) navigator.vibrate(12);
}

document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.boton')) return;   // el botón tiene su propio manejo
  brotarMensaje(e.clientX, e.clientY);
});

if (boton) {
  boton.addEventListener('click', () => {
    const r = boton.getBoundingClientRect();
    brotarMensaje(r.left + r.width / 2, r.top);
  });
}

/* ---------- 4) Girar el carrusel con el dedo ---------- */
let anguloBase = 0;   // ángulo acumulado
let xInicial   = null;

if (carrusel) {
  const escena = carrusel.parentElement;

  escena.addEventListener('pointerdown', (e) => {
    xInicial = e.clientX;
    carrusel.classList.add('tocado');          // pausa el giro automático
    carrusel.style.transition = 'none';
  });

  escena.addEventListener('pointermove', (e) => {
    if (xInicial === null) return;
    const angulo = anguloBase + (e.clientX - xInicial) * 0.5;
    carrusel.style.transform = `rotateY(${angulo}deg)`;
  });

  const soltar = (e) => {
    if (xInicial === null) return;
    anguloBase += (e.clientX - xInicial) * 0.5;
    // se acomoda a la foto más cercana (cada 90°)
    anguloBase = Math.round(anguloBase / 90) * 90;
    carrusel.style.transition = 'transform .45s ease-out';
    carrusel.style.transform  = `rotateY(${anguloBase}deg)`;
    xInicial = null;
  };

  escena.addEventListener('pointerup', soltar);
  escena.addEventListener('pointercancel', soltar);
  escena.addEventListener('pointerleave', soltar);
}

/* ---------- 5) Audio de fondo ---------- */
const cancion    = document.getElementById('cancion');
const botonAudio = document.getElementById('botonAudio');
let sonando = false;

function actualizarBotonAudio() {
  if (!botonAudio) return;
  botonAudio.textContent = sonando ? '🔊' : '🔇';
  botonAudio.setAttribute('aria-label', sonando ? 'Silenciar música' : 'Reproducir música');
}

if (botonAudio && cancion) {
  botonAudio.addEventListener('click', (e) => {
    e.stopPropagation();   // que no cuente como un toque de "te quiero"
    if (sonando) {
      cancion.pause();
      sonando = false;
    } else {
      cancion.play().then(() => { sonando = true; }).catch(() => {});
    }
    actualizarBotonAudio();
  });
}

/* La primera vez que ella toca la pantalla, si el audio nunca arrancó, lo prendemos */
document.addEventListener('pointerdown', () => {
  if (!sonando && cancion) {
    cancion.play().then(() => {
      sonando = true;
      actualizarBotonAudio();
    }).catch(() => {});
  }
}, { once: true });