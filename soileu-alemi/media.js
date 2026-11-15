/* Дыбыс, микрофон, камера, сөйлеуді тану */
const $ = (s, r = document) => r.querySelector(s);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ---------- Мәтінді нормалау (сөйлеуді салыстыру үшін) ---------- */
const KZ2RU = { 'ә': 'а', 'ғ': 'г', 'қ': 'к', 'ң': 'н', 'ө': 'о', 'ұ': 'у', 'ү': 'у', 'і': 'и', 'һ': 'х' };
function norm(s) {
  s = (s || '').toLowerCase().replace(/[әғқңөұүіһ]/g, c => KZ2RU[c]);
  s = s.replace(/ё/g, 'о').replace(/ы/g, 'и').replace(/й/g, 'и').replace(/э/g, 'е').replace(/я/g, 'иа').replace(/ю/g, 'иу').replace(/ц/g, 'с').replace(/щ/g, 'ш').replace(/[ъь]/g, '');
  s = s.replace(/ф/g, 'п').replace(/в/g, 'б').replace(/г/g, 'к').replace(/д/g, 'т').replace(/з/g, 'с').replace(/ж/g, 'ш');
  s = s.replace(/[^а-я\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return s.replace(/(.)\1+/g, '$1');
}
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let p = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const c = [i];
    for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    p = c;
  }
  return p[n];
}
function similar(a, b) {
  a = norm(a).replace(/\s/g, ''); b = norm(b).replace(/\s/g, '');
  if (!a || !b) return false;
  if (b.includes(a) || (a.length > 3 && a.includes(b))) return true;
  return lev(a, b) / Math.max(a.length, b.length) <= 0.34;
}
function wordCount(t) { return (t || '').trim().split(/\s+/).filter(Boolean).length; }

/* ---------- Дауыспен оқу (TTS) ---------- */
const TTS = {
  on: true, rate: 0.82, voice: null, kk: false, ready: false,
  init() {
    if (!('speechSynthesis' in window)) return;
    const pick = () => {
      const v = speechSynthesis.getVoices(); if (!v.length) return;
      const kk = v.find(x => /^kk/i.test(x.lang));
      const ru = v.find(x => /^ru/i.test(x.lang));
      this.voice = kk || ru || v[0]; this.kk = !!kk; this.ready = true;
    };
    pick(); speechSynthesis.onvoiceschanged = pick;
  },
  prep(t) { return this.kk ? t : t.replace(/[әғқңөұүіһӘҒҚҢӨҰҮІҺ]/g, c => KZ2RU[c.toLowerCase()] || c); },
  say(text, opt = {}) {
    return new Promise(res => {
      if (!this.on || !('speechSynthesis' in window) || !text) return res();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(this.prep(text));
      if (this.voice) { u.voice = this.voice; u.lang = this.voice.lang; } else u.lang = 'ru-RU';
      u.rate = opt.rate || this.rate; u.pitch = 1.1;
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 20000);
      speechSynthesis.speak(u);
    });
  },
  stop() { try { speechSynthesis.cancel(); } catch (e) { } },
};
TTS.init();

/* ---------- Синтезделген дыбыстар (Web Audio) ---------- */
let _ac;
function AC() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function noiseBuf(ac, dur) { const b = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
function env(g, t, a, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
function tone(ac, t, type, f0, f1, dur, peak, filt) {
  const o = ac.createOscillator(), g = ac.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, 0.02, peak, dur);
  let n = o; if (filt) { const f = ac.createBiquadFilter(); f.type = filt[0]; f.frequency.value = filt[1]; f.Q.value = filt[2] || 1; o.connect(f); n = f; }
  n.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.05); return o;
}
function burst(ac, t, dur, peak, hz, q) {
  const s = ac.createBufferSource(); s.buffer = noiseBuf(ac, dur + 0.05); const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = hz; f.Q.value = q || 1;
  const g = ac.createGain(); env(g, t, 0.005, peak, dur); s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + dur + 0.05);
}
const SOUNDS = {
  bell: [1.6, (ac, t) => { [0, 0.7].forEach(d => { tone(ac, t + d, 'sine', 880, 0, 0.9, 0.35); tone(ac, t + d, 'sine', 1760, 0, 0.6, 0.15); tone(ac, t + d, 'sine', 2640, 0, 0.4, 0.07); }); }],
  drum: [1.0, (ac, t) => { [0, 0.45].forEach(d => { tone(ac, t + d, 'sine', 160, 55, 0.35, 0.9); burst(ac, t + d, 0.1, 0.3, 300, 0.7); }); }],
  rattle: [1.0, (ac, t) => { for (let i = 0; i < 9; i++) burst(ac, t + i * 0.06 + (i % 2) * 0.01, 0.05, 0.28, 5500, 1.5); }],
  whistle: [0.9, (ac, t) => { const o = tone(ac, t, 'sine', 2000, 2800, 0.7, 0.3); }],
  clap: [0.2, (ac, t) => { burst(ac, t, 0.07, 0.9, 1500, 0.6); burst(ac, t + 0.012, 0.05, 0.6, 2500, 0.8); }],
  cat: [1.1, (ac, t) => { tone(ac, t, 'sawtooth', 520, 880, 0.35, 0.28, ['bandpass', 1400, 2]); tone(ac, t + 0.35, 'sawtooth', 880, 450, 0.55, 0.28, ['bandpass', 1100, 2]); }],
  dog: [1.0, (ac, t) => { [0, 0.4].forEach(d => { tone(ac, t + d, 'sawtooth', 300, 140, 0.18, 0.5, ['lowpass', 1100, 1]); burst(ac, t + d, 0.08, 0.25, 800, 1); }); }],
  cow: [1.7, (ac, t) => { const o = tone(ac, t, 'sawtooth', 135, 100, 1.4, 0.55, ['lowpass', 520, 3]); const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5; lg.gain.value = 6; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + 1.5); }],
  sheep: [1.2, (ac, t) => { const o = tone(ac, t, 'sawtooth', 330, 290, 0.95, 0.5, ['bandpass', 950, 4]); const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 26; lg.gain.value = 40; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + 1); }],
  ok: [0.7, (ac, t) => { [523, 659, 784, 1047].forEach((f, i) => tone(ac, t + i * 0.09, 'triangle', f, 0, 0.3, 0.25)); }],
  no: [0.4, (ac, t) => { tone(ac, t, 'sine', 300, 200, 0.3, 0.25); }],
  tick: [0.1, (ac, t) => { tone(ac, t, 'sine', 900, 0, 0.08, 0.2); }],
};
function playSound(name) {
  const s = SOUNDS[name]; if (!s) return Promise.resolve();
  const ac = AC(); s[1](ac, ac.currentTime + 0.03); return sleep(s[0] * 1000);
}
async function playSeq(list) { for (const n of [].concat(list)) { await playSound(n); await sleep(250); } }

/* ---------- Микрофон ---------- */
function mediaError(e) {
  const n = e && e.name;
  if (!navigator.mediaDevices) return 'Бұл браузерде камера/микрофон қолжетімсіз. Сайтты https:// немесе localhost арқылы ашыңыз.';
  if (n === 'NotAllowedError' || n === 'SecurityError') return 'Рұқсат берілмеді. Мекенжай жолағындағы 🔒 белгісін басып, камера/микрофонға рұқсат беріңіз де, бетті жаңартыңыз.';
  if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'Құрылғы табылмады. Камера немесе микрофон қосылғанын тексеріңіз.';
  if (n === 'NotReadableError') return 'Құрылғыны басқа бағдарлама пайдаланып тұр. Оны жауып, қайталаңыз.';
  return 'Құрылғыға қосыла алмады: ' + (n || e);
}
async function openMic(raw = true) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw { name: 'NoApi' };
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: !raw, noiseSuppression: !raw, autoGainControl: false } });
  const ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') await ac.resume();
  const src = ac.createMediaStreamSource(stream), an = ac.createAnalyser(); an.fftSize = 1024; src.connect(an);
  const buf = new Float32Array(an.fftSize);
  return {
    stream, ac,
    level() { an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; return Math.sqrt(s / buf.length); },
    async calibrate(ms = 900) { let mx = 0, sum = 0, n = 0; const t0 = performance.now(); while (performance.now() - t0 < ms) { const l = this.level(); sum += l; n++; mx = Math.max(mx, l); await sleep(30); } return { avg: sum / n, max: mx }; },
    close() { try { stream.getTracks().forEach(t => t.stop()); ac.close(); } catch (e) { } },
  };
}

/* ---------- Сөйлеуді тану + жазу ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SR;
/** Тыңдау: дауыс басталғанша күтіп, үнсіздікте тоқтайды. Қайтарады: {text, voicedMs, blob, recognized} */
async function listen({ maxMs = 8000, silenceMs = 1500, onLevel, onState, stopSignal } = {}) {
  const mic = await openMic(false);
  let recog = null, text = '', recOk = false, lang = 'kk-KZ';
  const chunks = []; let mr = null;
  try { mr = new MediaRecorder(mic.stream); mr.ondataavailable = e => e.data.size && chunks.push(e.data); mr.start(); } catch (e) { mr = null; }
  const startRecog = () => {
    if (!SR) return;
    try {
      recog = new SR(); recog.lang = lang; recog.continuous = true; recog.interimResults = true;
      recog.onresult = e => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' '; text = t.trim(); recOk = true; onState && onState('text', text); };
      recog.onerror = e => { if (e.error === 'language-not-supported' && lang !== 'ru-RU') { lang = 'ru-RU'; try { recog.stop(); } catch (_) { } startRecog(); } };
      recog.start();
    } catch (e) { recog = null; }
  };
  startRecog();
  const base = await mic.calibrate(500);
  const thr = Math.max(0.02, base.max * 2.2);
  const t0 = performance.now(); let voicedMs = 0, last = performance.now(), lastVoice = null, started = false;
  onState && onState('listening');
  while (true) {
    await sleep(40);
    const now = performance.now(), l = mic.level(), v = l > thr;
    onLevel && onLevel(l, thr, v);
    if (v) { if (!started) { started = true; onState && onState('speaking'); } voicedMs += now - last; lastVoice = now; }
    last = now;
    if (stopSignal && stopSignal.stop) break;
    if (started && now - lastVoice > silenceMs) break;
    if (now - t0 > maxMs) break;
    if (!started && now - t0 > 7000) break;
  }
  await sleep(450); // тану нәтижесі келіп үлгеруі үшін
  try { recog && recog.stop(); } catch (e) { }
  let blob = null;
  if (mr && mr.state !== 'inactive') { await new Promise(r => { mr.onstop = r; mr.stop(); }); blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' }); }
  await sleep(250);
  mic.close();
  return { text, voicedMs, blob, recognized: recOk, started };
}

/* ---------- Камера ---------- */
const CamStore = []; // сессия бойы түсірілген суреттер
function camPanel({ small = false, onSnap } = {}) {
  const wrap = document.createElement('div'); wrap.className = 'cam' + (small ? ' small' : '');
  wrap.innerHTML = `<div class="camframe"><video playsinline muted></video><div class="camoff">📷<br><span>Камера өшірулі</span></div></div>
  <div class="camctl"><button class="btn sm" data-a="on">📷 Айнаны қосу</button><button class="btn sm ghost" data-a="snap" hidden>📸 Сурет</button><button class="btn sm ghost" data-a="off" hidden>⏹ Өшіру</button></div>
  <div class="msg" hidden></div><div class="snaps"></div>`;
  const v = $('video', wrap), msg = $('.msg', wrap), snaps = $('.snaps', wrap), off = $('.camoff', wrap);
  let stream = null;
  const btn = a => $(`[data-a=${a}]`, wrap);
  const ui = on => { btn('on').hidden = on; btn('snap').hidden = !on; btn('off').hidden = !on; off.hidden = on; };
  const api = {
    el: wrap, video: v,
    async start() {
      msg.hidden = true;
      try {
        if (!navigator.mediaDevices) throw { name: 'NoApi' };
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
        v.srcObject = stream; await v.play(); ui(true);
      } catch (e) { msg.hidden = false; msg.textContent = mediaError(e); ui(false); }
    },
    stop() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } v.srcObject = null; ui(false); },
    snap() {
      if (!stream || !v.videoWidth) return;
      const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
      const x = c.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(v, 0, 0);
      const url = c.toDataURL('image/jpeg', 0.85); CamStore.push({ url, t: Date.now() });
      const a = document.createElement('a'); a.href = url; a.download = 'foto-' + Date.now() + '.jpg'; a.title = 'Жүктеп алу'; a.innerHTML = `<img src="${url}" alt="сурет">`;
      snaps.prepend(a); playSound('tick'); onSnap && onSnap(url);
    },
  };
  btn('on').onclick = () => api.start(); btn('off').onclick = () => api.stop(); btn('snap').onclick = () => api.snap();
  ui(false); return api;
}

/* ---------- Конфетти ---------- */
function confetti(host) {
  const box = document.createElement('div'); box.className = 'confetti'; const cols = ['#ff6b6b', '#ffd23f', '#3ddc97', '#4dabf7', '#b18cff', '#ff9f43'];
  for (let i = 0; i < 36; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length]; p.style.animationDelay = Math.random() * 0.3 + 's'; p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px'); box.appendChild(p); }
  host.appendChild(box); setTimeout(() => box.remove(), 1800);
}
