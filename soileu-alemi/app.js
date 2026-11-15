/* «Сөйлеу әлемі» — негізгі қолданба */
'use strict';

/* ---------- Көмекші ---------- */
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const k in (props || {})) {
    const v = props[k]; if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k.startsWith('on')) e[k] = v; else e.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(9).forEach(c => { if (c == null || c === false) return; e.append(c.nodeType ? c : document.createTextNode(c)); });
  return e;
}
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const stars = n => '⭐'.repeat(n) + '☆'.repeat(3 - n);

/* ---------- Сақтау (localStorage) ---------- */
const Store = {
  d: null,
  load() { try { this.d = JSON.parse(localStorage.getItem('soileu') || 'null'); } catch (e) { } if (!this.d) this.d = { cur: 'Бала 1', kids: { 'Бала 1': { prog: {}, obs: [] } }, labels: true, voice: true }; return this; },
  save() { try { localStorage.setItem('soileu', JSON.stringify(this.d)); } catch (e) { } },
  get kid() { return this.d.kids[this.d.cur]; },
  setLevel(id, lv, r) { const p = this.kid.prog[id] = this.kid.prog[id] || {}; const o = p[lv]; if (!o || r.stars >= o.stars) p[lv] = { ...r, date: new Date().toISOString() }; this.save(); },
};
Store.load(); TTS.on = Store.d.voice;

/* ---------- Бағыттау ---------- */
const root = document.getElementById('app');
let cleanups = [];
const onLeave = f => cleanups.push(f);
function route() {
  cleanups.forEach(f => { try { f(); } catch (e) { } }); cleanups = []; TTS.stop();
  const p = (location.hash.replace(/^#\/?/, '') || '').split('/');
  root.innerHTML = ''; window.scrollTo(0, 0);
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === (p[0] === 'game' ? gameKind(p[1]) : (p[0] || 'home'))));
  const v = { '': viewHome, home: viewHome, setup: viewSetup, prep: () => p[1] ? viewPrepItem(p[1]) : viewPrep(), sens: () => viewList('sens'), mot: () => viewList('mot'), game: () => viewGame(+p[1], +p[2] || 0), results: viewResults }[p[0]] || viewHome;
  v(); root.append(footer());
}
function gameKind(n) { const g = GAMES.find(x => x.id === +n); return g ? g.kind : 'home'; }
window.addEventListener('hashchange', route);

/* ---------- Қаңқа: шапка, төменгі жол ---------- */
function header() {
  const nav = [['home', 'Басты бет', '🏠'], ['prep', 'Дайындық', '🌱'], ['sens', 'Сенсорлық', '👂'], ['mot', 'Моторлық', '🗣️'], ['results', 'Нәтиже', '📊']];
  const sel = h('select', { 'aria-label': 'Бала', onchange: e => { Store.d.cur = e.target.value; Store.save(); route(); } }, Object.keys(Store.d.kids).map(k => h('option', { value: k, selected: k === Store.d.cur }, k)));
  const add = h('button', { class: 'ic', title: 'Бала қосу', onclick: () => askName('Баланың аты', n => { if (n && !Store.d.kids[n]) { Store.d.kids[n] = { prog: {}, obs: [] }; Store.d.cur = n; Store.save(); route(); } }) }, '＋');
  const vo = h('button', { class: 'ic' + (TTS.on ? '' : ' off'), title: 'Дауыспен оқу', onclick: e => { TTS.on = !TTS.on; Store.d.voice = TTS.on; Store.save(); e.target.classList.toggle('off', !TTS.on); if (TTS.on) TTS.say('Сәлем'); } }, '🔊');
  const lb = h('button', { class: 'ic' + (Store.d.labels ? '' : ' off'), title: 'Суреттердің астындағы жазулар', onclick: e => { Store.d.labels = !Store.d.labels; Store.save(); e.target.classList.toggle('off', !Store.d.labels); document.body.classList.toggle('nolabels', !Store.d.labels); } }, 'Аа');
  document.body.classList.toggle('nolabels', !Store.d.labels);
  return h('header', {}, h('a', { href: '#/', class: 'logo' }, h('span', {}, '💬'), h('b', {}, 'Сөйлеу әлемі')),
    h('nav', {}, nav.map(([r, t, i]) => h('a', { href: '#/' + (r === 'home' ? '' : r), 'data-r': r }, h('span', {}, i), ' ', t))),
    h('div', { class: 'tools' }, h('span', { class: 'kid' }, '👤 ', sel, add), vo, lb));
}
function footer() {
  return h('footer', {}, h('div', { class: 'warn' }, h('b', {}, '⚠️ Маңызды ескерту. '), 'Артикуляциялық жаттығулар баланың сөйлеу аппаратының нақты жағдайына қарай таңдалады. Барлық жаттығуды міндетті түрде бірдей орындату қажет емес. Сенсорлық және моторлық алалия кезіндегі түзету жұмысының мазмұны баланың жеке сөйлеу профиліне, қабылдауына және сөйлеу мүмкіндіктеріне сәйкес логопедтің бағалауы негізінде бейімделуі керек.'),
    h('p', { class: 'small' }, 'Бұл бағдарлама логопедтің жұмысын алмастырмайды, тек көмекші құрал. Микрофон мен камера деректері құрылғыдан сыртқа жіберілмейді (сөйлеуді тану функциясын браузер өзі қолданады).'));
}
document.body.prepend(header());
function askName(title, cb) {
  const m = h('div', { class: 'modal' }, h('div', { class: 'box' }, h('h3', {}, title), h('input', { type: 'text', id: 'nm', maxlength: 30, autofocus: true }),
    h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => m.remove() }, 'Бас тарту'), h('button', { class: 'btn', onclick: () => { const v = $('#nm', m).value.trim(); m.remove(); cb(v); } }, 'Сақтау'))));
  document.body.append(m); setTimeout(() => $('#nm', m).focus(), 50);
}

/* ---------- Прогресс көмекшілері ---------- */
const lvStars = (id, lv) => ((Store.kid.prog[id] || {})[lv] || {}).stars || 0;
const gameStars = id => [0, 1, 2].reduce((a, l) => a + lvStars(id, l), 0);

/* ================= БАСТЫ БЕТ ================= */
function viewHome() {
  const done = GAMES.reduce((a, g) => a + [0, 1, 2].filter(l => lvStars(g.id, l)).length, 0);
  root.append(
    h('section', { class: 'hero' }, h('div', {}, h('h1', {}, '«Сөйлеу әлемі»'), h('p', { class: 'lead' }, 'Логопедиялық түзету-дамыту жаттығулары мен ойындары'), h('p', {}, '6 жастағы балаларға арналған материал. Сенсорлық және моторлық алалияны түзетуге бағытталған 30 ойын, әрқайсысы үш деңгейден тұрады.'),
      h('div', { class: 'row' }, h('a', { class: 'btn big', href: '#/prep' }, '🌱 Дайындықтан бастау'), h('a', { class: 'btn big alt', href: '#/setup' }, '🎤 Камера мен микрофонды тексеру'))),
      h('div', { class: 'heroart' }, '🗣️ 👂 🎈 ⭐')),
    h('div', { class: 'grid cards' },
      card('🌱', 'I. Дайындық кезеңі', 'Сөйлеу тынысы, артикуляция, дауыс, есту зейіні, ұсақ моторика, еліктеу', '#/prep', '6 бөлім'),
      card('👂', 'II. Сенсорлық алалия', 'Сөйлеуді түсіну, сөз мағынасын ажырату, нұсқауды орындау', '#/sens', '15 ойын'),
      card('🗣️', 'III. Моторлық алалия', 'Белсенді сөйлеу, буын, сөздік қор, сөйлем, әңгіме', '#/mot', '15 ойын'),
      card('📊', 'V. Нәтижені бақылау', 'Автоматты нәтижелер және логопедтің бақылау кестесі', '#/results', `${done}/90 деңгей`)),
    h('section', { class: 'panel' }, h('h2', {}, '🎤📷 Камера мен микрофон қайда жұмыс істейді'),
      h('div', { class: 'grid two' },
        h('div', {}, h('h3', {}, '🎤 Микрофон'), h('ul', {}, h('li', {}, 'Сөйлеу тынысы: үрлегенде көпіршік, қауырсын, жапырақ қозғалады'), h('li', {}, 'Дауыс жаттығулары: дыбысты қанша уақыт созғаны, ақырын/қатты'), h('li', {}, 'Есту: шапалақ ырғағын қайталау'), h('li', {}, 'Моторлық ойындар: баланың сөзін тану, жазып қайта тыңдату'))),
        h('div', {}, h('h3', {}, '📷 Камера'), h('ul', {}, h('li', {}, 'Артикуляциялық жаттығулар: бала айнадағыдай өз бетін көреді'), h('li', {}, 'Сөйлеу ойындарында «Айна» — ерін мен тілдің қимылын бақылау'), h('li', {}, 'Сурет түсіру: баланың орындаған қалпын салыстыру'), h('li', {}, 'Ермексаздан жасаған жұмысты көрсету'))))));
}
function card(e, t, d, href, tag) { return h('a', { class: 'card', href }, h('div', { class: 'ce' }, e), h('h3', {}, t), h('p', {}, d), h('span', { class: 'tag' }, tag)); }

/* ================= ҚҰРЫЛҒЫНЫ ТЕКСЕРУ ================= */
function viewSetup() {
  const cam = camPanel(); const micBar = h('div', { class: 'meter' }, h('i')), micMsg = h('div', { class: 'msg', hidden: true });
  let mic = null, raf;
  const start = async () => {
    try { mic = await openMic(false); micMsg.hidden = true; } catch (e) { micMsg.hidden = false; micMsg.textContent = mediaError(e); return; }
    mb.textContent = '⏹ Тоқтату'; const loop = () => { if (!mic) return; $('i', micBar).style.width = Math.min(100, mic.level() * 400) + '%'; raf = requestAnimationFrame(loop); }; loop();
  };
  const stop = () => { if (mic) { mic.close(); mic = null; cancelAnimationFrame(raf); $('i', micBar).style.width = 0; mb.textContent = '🎤 Микрофонды қосу'; } };
  const mb = h('button', { class: 'btn', onclick: () => mic ? stop() : start() }, '🎤 Микрофонды қосу');
  onLeave(() => { stop(); cam.stop(); });
  root.append(h('h1', {}, '🎤📷 Құрылғыны тексеру'), h('p', { class: 'lead' }, 'Ойынды бастамас бұрын микрофон мен камераның жұмыс істейтінін тексеріңіз. Браузер рұқсат сұрағанда «Рұқсат ету» батырмасын басыңыз.'),
    h('div', { class: 'grid two' },
      h('section', { class: 'panel' }, h('h2', {}, 'Микрофон'), h('p', {}, 'Бірдеңе айтыңыз немесе қол шапалақтаңыз — жолақ қозғалуы керек.'), micBar, mb, micMsg),
      h('section', { class: 'panel' }, h('h2', {}, 'Камера (айна)'), cam.el),
      h('section', { class: 'panel' }, h('h2', {}, 'Дауыспен оқу'), h('p', {}, TTS.kk ? 'Құрылғыда қазақша дауыс табылды ✅' : 'Құрылғыда қазақша дауыс жоқ — орысша дауыс қолданылады (айтылуы жуық болады). Логопед нұсқауды өзі де айта алады.'), h('button', { class: 'btn', onclick: () => TTS.say('Сәлем! Мен сөйлеу әлеміне қош келдіңдер деймін') }, '🔊 Тексеру')),
      h('section', { class: 'panel' }, h('h2', {}, 'Сөйлеуді тану'), h('p', {}, speechSupported ? 'Браузер сөйлеуді танымды қолдайды ✅ (интернет қажет, Chrome/Edge ұсынылады).' : 'Бұл браузер сөйлеуді танымайды. Ойындарда дыбыс ұзақтығы өлшенеді де, дұрыс айтқанын логопед «✔» батырмасымен растайды. Толық функция үшін Chrome немесе Edge қолданыңыз.'))),
    h('p', { class: 'small' }, 'Кеңес: камера мен микрофон тек https:// не localhost мекенжайында жұмыс істейді.'));
}

/* ================= ТІЗІМДЕР ================= */
function viewList(kind) {
  const list = GAMES.filter(g => g.kind === kind);
  const t = kind === 'sens' ? ['II. Сенсорлық алалияны түзетуге арналған 15 ойын', 'Негізгі бағыт: сөйлеуді түсіну, сөз мағынасын ажырату, есту арқылы қабылдау және нұсқауды орындау.'] : ['III. Моторлық алалияны түзетуге арналған 15 ойын', 'Негізгі бағыт: белсенді сөйлеу, дыбыстық еліктеу, буындық құрылым, сөздік қор, грамматикалық құрылым және байланыстырып сөйлеу.'];
  root.append(h('h1', {}, t[0]), h('p', { class: 'lead' }, t[1]), h('div', { class: 'grid games' }, list.map(g => h('a', { class: 'gcard ' + kind, href: `#/game/${g.id}` }, h('div', { class: 'gn' }, g.id), h('div', { class: 'ge' }, g.emoji), h('h3', {}, g.title), h('div', { class: 'st' }, [0, 1, 2].map(l => h('span', {}, lvStars(g.id, l) ? '⭐' : '☆'))), h('small', {}, g.vis)))));
}

/* ================= ОЙЫН БЕТІ ================= */
function viewGame(id, lv) {
  const g = GAMES.find(x => x.id === id); if (!g) return viewHome();
  const idx = GAMES.indexOf(g); const prev = GAMES[idx - 1], nxt = GAMES[idx + 1];
  const box = h('div', { class: 'stage' });
  const tabs = h('div', { class: 'tabs' }, [0, 1, 2].map(l => h('a', { class: 'tab' + (l === lv ? ' on' : ''), href: `#/game/${id}/${l}` }, `${l + 1}-деңгей `, h('small', {}, stars(lvStars(id, l))))));
  root.append(h('div', { class: 'crumb' }, h('a', { href: '#/' + g.kind }, '← Ойындар тізімі')),
    h('div', { class: 'gh ' + g.kind }, h('span', { class: 'gn' }, g.id + '-ойын'), h('h1', {}, `«${g.title}»`), h('p', { class: 'vis' }, '🖼️ ', g.vis)),
    tabs, h('p', { class: 'task' }, h('b', {}, `${lv + 1}-деңгей: `), g.desc[lv]), box);
  const steps = g.levels[lv];
  const r = Runner(box, steps, {
    onDone(stats) {
      Store.setLevel(id, lv, stats);
      const bar = h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => route() }, '↻ Қайта ойнау'),
        lv < 2 ? h('a', { class: 'btn', href: `#/game/${id}/${lv + 1}` }, 'Келесі деңгей ➜') : (nxt ? h('a', { class: 'btn', href: `#/game/${nxt.id}/0` }, `${nxt.id}-ойын ➜`) : h('a', { class: 'btn', href: '#/results' }, '📊 Нәтижелер')),
        h('a', { class: 'btn ghost', href: '#/' + g.kind }, 'Тізімге'));
      return bar;
    },
  });
  onLeave(() => r.stop());
}

/* ================= ҚОЗҒАЛТҚЫШ (Runner) ================= */
function Runner(host, steps, { onDone } = {}) {
  let i = 0, runId = 0, speakTok = 0, cam = null, stopSig = null; const rec = [];
  const stop = () => { runId++; TTS.stop(); if (stopSig) stopSig.stop = true; if (cam) cam.stop(); };
  function head() {
    return h('div', { class: 'dots' }, steps.map((_, k) => h('i', { class: k < i ? 'done' : k === i ? 'cur' : '' })), h('span', {}, `${Math.min(i + 1, steps.length)} / ${steps.length}`));
  }
  function nextBtn(cb) { return h('button', { class: 'btn big next', onclick: cb }, i === steps.length - 1 ? 'Аяқтау 🏁' : 'Келесі ➜'); }
  function advance() { i++; i >= steps.length ? finish() : show(); }
  function promptRow(s, my, extra) {
    const speak = async () => { const tok = ++speakTok; await TTS.say(s.speakOnly ? s.say + '. ' + s.speakOnly : s.say); if (tok !== speakTok || my !== runId) return; if (s.snd) await playSeq(s.snd); };
    const row = h('div', { class: 'prompt' }, h('button', { class: 'ic big', title: 'Қайта тыңдау', onclick: () => { stopListening(); speak(); } }, '🔊'), h('div', { class: 'ptxt' }, s.say));
    return { row, speak };
  }
  function stopListening() { if (stopSig) stopSig.stop = true; }

  function show() {
    const my = ++runId; stopListening(); host.innerHTML = '';
    const s = steps[i]; const r = rec[i] = { tries: 0, assisted: false, ok: false };
    const wrap = h('div', { class: 'step' }); host.append(head(), wrap);
    const pr = promptRow(s, my);
    const sndBtn = s.snd ? h('button', { class: 'btn sm', onclick: () => playSeq(s.snd) }, '🎵 Дыбысты қайта тыңдау') : null;
    (s.t === 'pick' ? pick : say)(s, wrap, r, my, pr, sndBtn);
    if (s.t === 'pick' || s.listen == null) (async () => { await sleep(250); if (my !== runId) return; await TTS.say(s.speakOnly ? s.say + '. ' + s.speakOnly : s.say); if (my !== runId) return; if (s.snd) await playSeq(s.snd); })();
  }

  /* ----- таңдау қадамы ----- */
  function pick(s, wrap, r, my, pr, sndBtn) {
    const sel = []; let locked = false;
    const opts = shuffle(s.opts);
    const fb = h('div', { class: 'fb' }), built = s.assemble ? h('div', { class: 'built' }) : null;
    const nb = h('button', { class: 'btn big ok', onclick: check }, 'Тексеру ✔');
    const grid = h('div', { class: 'opts n' + opts.length }, opts.map(o => {
      const b = h('button', { class: 'opt', 'data-k': o.k, onclick: () => toggle(o.k) }, h('div', { class: 'oe', html: o.e }), h('div', { class: 'ol' }, o.l), h('span', { class: 'badge' }));
      return b;
    }));
    function paint() {
      grid.querySelectorAll('.opt').forEach(b => { const n = sel.indexOf(b.dataset.k); b.classList.toggle('sel', n >= 0); $('.badge', b).textContent = (s.ord && n >= 0) ? n + 1 : (n >= 0 ? '✓' : ''); });
      if (built) built.textContent = sel.length ? sel.map(k => (opts.find(o => o.k === k) || {}).l).join(' ') : '…';
    }
    function toggle(k) {
      if (locked) return; TTS.stop();
      if (sel.includes(k)) sel.splice(sel.indexOf(k), 1);
      else if (!s.ord && s.ans.length <= 1) { sel.length = 0; sel.push(k); } else sel.push(k);
      paint(); fb.textContent = '';
    }
    function check() {
      if (locked) return;
      if (!sel.length) { fb.className = 'fb info'; fb.textContent = 'Алдымен суретті таңда 👆'; return; }
      const ok = s.any ? true : s.ord ? sel.length === s.ans.length && sel.every((k, n) => k === s.ans[n]) : (sel.length === s.ans.length && s.ans.every(k => sel.includes(k)));
      if (ok) { locked = true; r.ok = true; success(fb, wrap); nb.hidden = true; wrap.append(nextBtn(advance)); grid.querySelectorAll('.opt').forEach(b => { if (!sel.includes(b.dataset.k)) b.classList.add('dim'); }); }
      else {
        r.tries++; playSound('no'); fb.className = 'fb bad'; fb.textContent = 'Қайта байқап көр 🙂';
        grid.classList.add('shake'); setTimeout(() => grid.classList.remove('shake'), 500);
        if (r.tries >= 2) { r.assisted = true; fb.textContent = 'Қайта байқап көр 🙂 Көмек: жыпылықтаған суретке қара'; s.ans.forEach(k => grid.querySelector(`[data-k="${CSS.escape(k)}"]`).classList.add('hint')); }
        setTimeout(() => { if (!locked) { sel.length = 0; paint(); } }, 700);
      }
    }
    wrap.append(...[pr.row, sndBtn, built, grid, fb, h('div', { class: 'row' }, nb)].filter(Boolean)); paint();
  }

  /* ----- айту қадамы ----- */
  function say(s, wrap, r, my, pr) {
    const targets = [].concat(s.target || []);
    const shown = s.hide ? null : (s.show || (s.free ? null : targets[0]));
    const listenTxt = s.listen != null ? s.listen : null;
    const pic = h('div', { class: 'bigpic', html: s.pic });
    const meter = h('div', { class: 'meter' }, h('i')), status = h('div', { class: 'status' }, 'Микрофон түймесін басып, айтып көр'), heard = h('div', { class: 'heard' });
    const res = h('div', { class: 'fb' }), playBtn = h('button', { class: 'btn sm ghost', hidden: true }, '▶ Өзіңді тыңда');
    const confirmRow = h('div', { class: 'row confirm', hidden: true },
      h('button', { class: 'btn sm ok', onclick: () => pass(false) }, '✔ Дұрыс айтты (өздігінен)'), h('button', { class: 'btn sm', onclick: () => pass(true) }, '🤝 Көмекпен айтты'));
    let busy = false, audio = null;
    const mic = h('button', { class: 'btn big mic', onclick: go }, '🎤 Айтып көр');
    const modelBtn = (listenTxt != null || targets.length) ? h('button', { class: 'btn sm ghost', onclick: () => { stopListening(); TTS.say(listenTxt != null ? listenTxt : targets[0]); } }, '🔊 Үлгі тыңдау') : null;
    if (!cam) cam = camPanel({ small: true }); const mirrorToggle = h('button', { class: 'btn sm ghost', onclick: () => { cam.el.classList.toggle('show'); if (cam.el.classList.contains('show') && !cam.video.srcObject) cam.start(); } }, '📷 Айна');
    function pass(assisted) {
      if (r.ok) return; r.ok = true; if (assisted) r.assisted = true; success(res, wrap); mic.hidden = true; confirmRow.hidden = true; wrap.append(nextBtn(advance));
    }
    async function go() {
      if (busy) { stopSig.stop = true; return; }
      TTS.stop(); busy = true; stopSig = { stop: false }; mic.textContent = '⏹ Тоқтату'; mic.classList.add('rec'); res.textContent = ''; res.className = 'fb'; heard.textContent = ''; confirmRow.hidden = true;
      const maxMs = s.maxMs || (s.free ? Math.max(9000, s.free * 2500) : s.voice ? 7000 : 8000);
      let out;
      try {
        out = await listen({
          maxMs, silenceMs: s.free && s.free >= 5 ? 2800 : s.voice ? 1200 : 1700, stopSignal: stopSig,
          onLevel: (l, thr) => { $('i', meter).style.width = Math.min(100, l / (thr * 4) * 100) + '%'; },
          onState: (k, t) => { if (k === 'listening') status.textContent = '👂 Тыңдап тұрмын… айтыңыз'; else if (k === 'speaking') status.textContent = '🎙️ Естіп жатырмын…'; else if (k === 'text') heard.textContent = '«' + t + '»'; },
        });
      } catch (e) { busy = false; mic.textContent = '🎤 Айтып көр'; mic.classList.remove('rec'); res.className = 'fb bad'; res.textContent = mediaError(e); return; }
      busy = false; mic.textContent = '🎤 Қайта айту'; mic.classList.remove('rec'); $('i', meter).style.width = 0;
      if (my !== runId) return;
      if (out.blob) { playBtn.hidden = false; playBtn.onclick = () => { if (audio) audio.pause(); audio = new Audio(URL.createObjectURL(out.blob)); audio.play(); }; }
      if (out.text) heard.textContent = '«' + out.text + '»';
      evaluate(out);
    }
    function evaluate(out) {
      const t = out.text, secs = (out.voicedMs / 1000).toFixed(1);
      if (!out.started && out.voicedMs < 150) { status.textContent = 'Дыбыс естілмеді. Микрофонға жақынырақ айтып көр.'; res.className = 'fb info'; return; }
      let ok = false, unver = false;
      if (s.voice) { ok = out.voicedMs >= s.voice * 1000 * 0.7; status.textContent = `Дауыс ұзақтығы: ${secs} с (мақсат ${s.voice} с)`; }
      else if (!out.recognized || !t) { unver = true; status.textContent = `Дыбыс жазылды (${secs} с), бірақ сөз танылмады.`; }
      else if (s.starts) { ok = t.split(/\s+/).some(w => norm(w).length >= 2 && norm(w)[0] === norm(s.starts)); }
      else if (s.free) { ok = wordCount(t) >= s.free; if (!ok) status.textContent = `Тағы айтып көр: ${wordCount(t)} / ${s.free} сөз`; }
      else ok = targets.some(x => similar(x, t) || t.split(/\s+/).some(w => similar(x, w)));
      if (ok) { pass(r.tries >= 2); return; }
      r.tries++;
      if (unver) { res.className = 'fb info'; res.textContent = speechSupported ? 'Сөзді тани алмадым. Дұрыс айтса — логопед «✔» батырмасын бассын, немесе қайта айтыңыз.' : 'Бұл браузер сөзді танымайды. Дұрыс айтса — логопед «✔» батырмасын бассын.'; confirmRow.hidden = false; return; }
      playSound('no'); res.className = 'fb bad'; res.textContent = s.voice ? 'Дауысты ұзағырақ созып көр 🙂' : 'Қайта байқап көр 🙂';
      confirmRow.hidden = false; if (r.tries >= 2) { r.assisted = true; if (modelBtn) TTS.say(listenTxt != null ? listenTxt : targets[0] || ''); }
    }
    wrap.append(...[pr.row, pic, shown ? h('div', { class: 'target' }, shown) : null, s.hint ? h('div', { class: 'hintline' }, '💡 ', s.hint) : null,
      h('div', { class: 'row' }, modelBtn, mirrorToggle), cam.el, h('div', { class: 'row' }, mic), meter, status, heard, h('div', { class: 'row' }, playBtn), res, confirmRow].filter(Boolean));
    if (listenTxt != null && s.t === 'say') (async () => { await sleep(250); if (my !== runId) return; await TTS.say(s.say); if (my !== runId) return; await TTS.say(listenTxt); })();
  }

  function finish() {
    runId++; if (cam) cam.stop(); host.innerHTML = '';
    const total = steps.length, indep = rec.filter(x => x && x.ok && !x.assisted).length;
    const ratio = indep / total, st = ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : 1;
    const stats = { stars: st, indep, total };
    const extra = onDone ? onDone(stats) : null;
    const msg = ['Жақсы!', 'Керемет!', 'Тамаша! Сен нағыз шебер!'][st - 1];
    const box = h('div', { class: 'finish' }, h('div', { class: 'trophy' }, '🏆'), h('h2', {}, 'Жарайсың!'), h('div', { class: 'bigstars' }, stars(st)), h('p', {}, msg), h('p', { class: 'small' }, `Өздігінен орындалған: ${indep} / ${total}`), extra);
    host.append(box); confetti(box); playSound('ok'); TTS.say('Жарайсың!');
  }
  show();
  return { stop };
}
function success(fb, host) {
  fb.className = 'fb good'; fb.textContent = 'Жарайсың! 🎉'; playSound('ok'); confetti(host); TTS.say('Жарайсың');
}

/* ================= ДАЙЫНДЫҚ ================= */
const PREP = [
  { id: 'breath', e: '🫧', t: '1. Сөйлеу тынысын дамыту', d: 'Сабын көпіршіктері, мақта немесе қауырсын, қағаз жапырақтар мен желпуіш.', m: '🎤 микрофон' },
  { id: 'artic', e: '👅', t: '2. Артикуляциялық жаттығулар', d: 'Ерін мен тілдің қимылдарын көрсететін артикуляциялық жаттығу суреттері.', m: '📷 камера (айна)' },
  { id: 'voice', e: '🎶', t: '3. Дауыс жаттығулары', d: 'Ән айтып тұрған бала және дауысты дыбыстарды бейнелейтін карточкалар.', m: '🎤 микрофон' },
  { id: 'hear', e: '👂', t: '4. Есту зейінін дамыту', d: 'Қоңырау, барабан, сылдырмақ және жануарлардың сурет-карточкалары.', m: '🎤 микрофон' },
  { id: 'fine', e: '🧶', t: '5. Ұсақ моториканы дамыту', d: 'Түрлі түсті моншақтар, түймелер, сұрыптауға арналған заттар және ермексаз.', m: '📷 камера' },
  { id: 'imit', e: '🐱', t: '6. Сөйлеуге еліктеуді дамыту', d: 'Жануарлар, көлік және буын карточкалары.', m: '🎤📷 микрофон + айна' },
];
function viewPrep() {
  root.append(h('h1', {}, 'I. Дайындық кезеңі'), h('p', { class: 'lead' }, 'Бұл кезең негізгі ойындарға дейін орындалады. Баланың сөйлеу аппараты, тыныс алуы, есту зейіні және сөйлеуге дайындығы қалыптастырылады.'),
    h('div', { class: 'grid cards' }, PREP.map(p => h('a', { class: 'card', href: '#/prep/' + p.id }, h('div', { class: 'ce' }, p.e), h('h3', {}, p.t), h('p', {}, h('b', {}, 'Көрнекілік: '), p.d), h('span', { class: 'tag' }, p.m)))));
}
function viewPrepItem(id) {
  const p = PREP.find(x => x.id === id); if (!p) return viewPrep();
  const body = h('div', {});
  root.append(h('div', { class: 'crumb' }, h('a', { href: '#/prep' }, '← Дайындық')), h('div', { class: 'gh prep' }, h('h1', {}, p.e + ' ' + p.t), h('p', { class: 'vis' }, '🖼️ Көрнекілікке ұсыныс: ', p.d)), body);
  ({ breath: prepBreath, artic: prepArtic, voice: prepVoice, hear: prepHear, fine: prepFine, imit: prepImit })[id](body);
}
function tabset(host, items, initial = 0) {
  const bar = h('div', { class: 'tabs' }), pane = h('div', { class: 'pane' }); let cl = null;
  items.forEach((it, k) => { const b = h('button', { class: 'tab', onclick: () => sel(k) }, it[0]); bar.append(b); it.b = b; });
  function sel(k) { if (cl) { try { cl(); } catch (e) { } cl = null; } items.forEach((it, n) => it.b.classList.toggle('on', n === k)); pane.innerHTML = ''; const out = items[k][1](pane); if (typeof out === 'function') cl = out; }
  host.append(bar, pane); onLeave(() => { if (cl) try { cl(); } catch (e) { } }); sel(initial);
}
function runSteps(pane, steps, id, title) {
  const r = Runner(pane, steps, { onDone(st) { Store.setLevel('p:' + id, 0, st); return h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => { pane.innerHTML = ''; runSteps(pane, steps.map(x => x), id, title); } }, '↻ Қайта')); } });
  return () => r.stop();
}

/* ----- 1. Сөйлеу тынысы ----- */
function prepBreath(host) {
  const scenes = [
    ['🫧 Көпіршіктер', 'Бала мұрынмен дем алып, ауызбен жайлап үрлейді. Сабын көпіршіктерін ұшырады.', 'bubbles'],
    ['🪶 Қауырсынды ұшыр', 'Үстел үстіндегі қауырсынды немесе мақтаны үрлеп қозғалтады. Демді бірқалыпты шығаруға үйренеді.', 'feather'],
    ['🍃 Жел соқты', 'Қағаздан жасалған жапырақтарды үрлеп қозғалтады. Ұзақ және біркелкі дем шығаруды жаттықтырады.', 'wind'],
  ];
  tabset(host, scenes.map(([t, d, kind]) => [t, pane => breathScene(pane, d, kind)]));
}
function breathScene(pane, desc, kind) {
  const GOAL = 4;
  const err = h('div', { class: 'msg', hidden: true }), scene = h('div', { class: 'scene ' + kind }), meter = h('div', { class: 'meter' }, h('i')), timer = h('div', { class: 'timer' }, '0.0 с'), best = h('div', { class: 'small' }, 'Ең ұзақ дем: 0.0 с'), starsEl = h('div', { class: 'bigstars' }, '☆☆☆');
  const sens = h('input', { type: 'range', min: 0.5, max: 3, step: 0.1, value: 1.5 });
  let mic = null, raf = 0, thr = 0.05, sm = 0, cur = 0, grace = 0, bestT = 0, got = 0, feather = 0.05, last = 0, goalHit = false, leaf = [0, 0, 0, 0];
  if (kind === 'feather') scene.append(h('div', { class: 'zone' }, 'мақсат'), h('div', { class: 'feath' }, '🪶'));
  if (kind === 'wind') { for (let k = 0; k < 4; k++) scene.append(h('div', { class: 'leaf', style: `top:${12 + k * 22}%` }, '🍃')); scene.append(h('div', { class: 'flag' }, '🏁')); }
  const btn = h('button', { class: 'btn big', onclick: toggle }, '🎤 Бастау');
  async function toggle() {
    if (mic) return stop();
    try { mic = await openMic(true); } catch (e) { err.hidden = false; err.textContent = mediaError(e); return; }
    err.hidden = true; btn.textContent = '⏳ Калибрация… тыныш тұр'; const base = await mic.calibrate(1000);
    if (!mic) return; thr = Math.max(0.02, base.max * 2.5 + 0.01); btn.textContent = '⏹ Тоқтату'; last = performance.now(); loop();
  }
  function stop() { if (mic) { mic.close(); mic = null; } cancelAnimationFrame(raf); btn.textContent = '🎤 Бастау'; $('i', meter).style.width = 0; }
  function loop() {
    if (!mic) return; const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    const l = mic.level(); sm = sm * 0.6 + l * 0.4; const T = thr * (3.2 - sens.value + 0.5) / 1.5, blow = sm > T, power = Math.min(2.5, sm / T);
    $('i', meter).style.width = Math.min(100, sm / (T * 3) * 100) + '%';
    if (blow) { cur += dt; grace = 0; } else { grace += dt; if (grace > 0.4) { if (cur > bestT) bestT = cur; if (cur >= GOAL && got < 3) { got++; starsEl.textContent = stars(got); playSound('ok'); confetti(pane0); } cur = 0; goalHit = false; } }
    timer.textContent = cur.toFixed(1) + ' с'; best.textContent = `Ең ұзақ дем: ${Math.max(bestT, cur).toFixed(1)} с · Мақсат: ${GOAL} с үздіксіз`;
    timer.classList.toggle('goal', cur >= GOAL);
    if (kind === 'bubbles' && blow && Math.random() < 0.25 * power) { const b = h('div', { class: 'bub', style: `left:${42 + Math.random() * 16}%;--s:${30 + Math.random() * 40}px;--x:${(Math.random() - 0.5) * 160}px` }, '🫧'); scene.append(b); setTimeout(() => b.remove(), 3200); }
    if (kind === 'feather') { feather += (blow ? 0.55 * power : -0.45) * dt; feather = Math.max(0.03, Math.min(0.92, feather)); const f = $('.feath', scene); f.style.bottom = feather * 85 + '%'; f.style.transform = `translateX(-50%) rotate(${Math.sin(now / 200) * 12 * (blow ? 1 : 0.3)}deg)`; }
    if (kind === 'wind') { $$leaf(); }
    raf = requestAnimationFrame(loop);
  }
  function $$leaf() { scene.querySelectorAll('.leaf').forEach((el, k) => { const blow = sm > thr * (3.2 - sens.value + 0.5) / 1.5; leaf[k] += (blow ? 0.22 * (0.7 + k * 0.15) * Math.min(2, sm / thr) : -0.01) * 0.016 * 3.2; leaf[k] = Math.max(0, leaf[k]); if (leaf[k] >= 0.86) { leaf[k] = 0; got = Math.min(3, got + (k === 3 ? 1 : 0)); starsEl.textContent = stars(got); if (k === 3) { playSound('ok'); confetti(pane0); } } el.style.left = 3 + leaf[k] * 100 + '%'; el.style.transform = `rotate(${leaf[k] * 900}deg)`; }); }
  const pane0 = h('div', { class: 'panel breathpane' }, h('p', { class: 'task' }, desc), h('p', { class: 'small' }, 'Алдымен мұрынмен терең дем ал, содан кейін микрофонға қарай ауызбен ұзақ үрле (микрофоннан ~10 см алыс).'), scene, h('div', { class: 'row center' }, timer), meter, h('div', { class: 'row' }, btn), h('label', { class: 'slider' }, 'Сезімталдық: ', sens), best, starsEl, err);
  pane.append(pane0); TTS.say(desc);
  return stop;
}

/* ----- 2. Артикуляция ----- */
function faceSVG(id) {
  const base = `<circle cx="100" cy="105" r="82" fill="#ffd9a8" stroke="#e0a96d" stroke-width="3"/><circle cx="70" cy="80" r="7" fill="#3b2a20"/><circle cx="130" cy="80" r="7" fill="#3b2a20"/><path d="M58 64q12-10 24 0M118 64q12-10 24 0" stroke="#7a4b2a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M96 100q4 8 8 0" stroke="#d99a6a" stroke-width="3" fill="none"/><circle cx="52" cy="112" r="9" fill="#ffb4a0" opacity=".6"/><circle cx="148" cy="112" r="9" fill="#ffb4a0" opacity=".6"/>`;
  const mouth = {
    smile: `<path d="M56 130Q100 176 144 130Q100 150 56 130Z" fill="#fff" stroke="#c0392b" stroke-width="8" stroke-linejoin="round"/>`,
    tube: `<ellipse cx="100" cy="142" rx="16" ry="18" fill="#6b1a27" stroke="#d64550" stroke-width="10"/><path d="M100 118v-8M82 122l-6-6M118 122l6-6" stroke="#d64550" stroke-width="3" stroke-linecap="round"/>`,
    clock: `<ellipse cx="100" cy="142" rx="34" ry="19" fill="#6b1a27" stroke="#c0392b" stroke-width="5"/><g class="a-swing" style="transform-origin:100px 142px"><rect x="89" y="136" width="22" height="42" rx="11" fill="#ff8fa3"/></g>`,
    horse: `<ellipse cx="100" cy="144" rx="36" ry="24" fill="#6b1a27" stroke="#c0392b" stroke-width="5"/><g class="a-click"><ellipse cx="100" cy="150" rx="20" ry="9" fill="#ff8fa3"/></g>`,
    jam: `<ellipse cx="100" cy="145" rx="30" ry="18" fill="#6b1a27" stroke="#c0392b" stroke-width="5"/><g class="a-lick" style="transform-origin:100px 150px"><rect x="90" y="120" width="20" height="40" rx="10" fill="#ff8fa3"/></g>`,
    spat: `<ellipse cx="100" cy="142" rx="32" ry="16" fill="#6b1a27" stroke="#c0392b" stroke-width="5"/><path d="M66 150Q100 148 134 150Q128 176 100 178Q72 176 66 150Z" fill="#ff8fa3" stroke="#e86b86" stroke-width="3"/><path d="M100 152v20" stroke="#e86b86" stroke-width="3"/>`,
  }[id];
  return `<svg viewBox="0 0 200 200" class="face">${base}${mouth}</svg>`;
}
function prepArtic(host) {
  const key = 'p:artic'; const doneSet = new Set((Store.kid.prog[key] || {}).done || []);
  const cam = camPanel(); onLeave(() => cam.stop());
  const main = h('div', { class: 'panel' }); let cur = 0, timerId = null;
  const list = h('div', { class: 'exlist' });
  function renderList() { list.innerHTML = ''; ARTIC.forEach((a, k) => list.append(h('button', { class: 'ex' + (k === cur ? ' on' : ''), onclick: () => { cur = k; renderAll(); } }, doneSet.has(a.id) ? '✅ ' : '👅 ', `«${a.t}»`))); }
  function renderMain() {
    clearInterval(timerId); const a = ARTIC[cur];
    const num = h('div', { class: 'count' }, a.sec), bar = h('div', { class: 'meter prog' }, h('i')), bt = h('button', { class: 'btn big', onclick: startT }, '▶ Бастау · ' + a.sec + ' с');
    function startT() {
      clearInterval(timerId); let left = a.sec; bt.disabled = true; num.textContent = left; $('i', bar).style.width = '0%'; playSound('tick');
      timerId = setInterval(() => { left--; num.textContent = Math.max(left, 0); $('i', bar).style.width = ((a.sec - left) / a.sec * 100) + '%'; if (left > 0) playSound('tick'); else { clearInterval(timerId); bt.disabled = false; finishEx(); } }, 1000);
    }
    function finishEx() {
      playSound('ok'); confetti(main); TTS.say('Жарайсың!'); doneSet.add(a.id);
      const all = doneSet.size; Store.kid.prog[key] = { stars: all >= 6 ? 3 : all >= 3 ? 2 : 1, indep: all, total: 6, done: [...doneSet] }; Store.save(); renderList();
    }
    main.innerHTML = ''; main.append(h('h2', {}, `«${a.t}»`), h('div', { class: 'artic' }, h('div', { class: 'demo', html: faceSVG(a.id) }), h('div', {}, h('p', { class: 'task' }, a.d), h('div', { class: 'row' }, h('button', { class: 'btn sm ghost', onclick: () => TTS.say(a.d) }, '🔊 Оқу')), num, bar, h('div', { class: 'row' }, bt),
      h('div', { class: 'row' }, h('button', { class: 'btn sm ghost', onclick: () => { cur = (cur + 1) % ARTIC.length; renderAll(); } }, 'Келесі жаттығу ➜')))));
  }
  function renderAll() { renderList(); renderMain(); }
  onLeave(() => clearInterval(timerId));
  host.append(h('p', { class: 'task' }, '📷 Камераны қосып, бала өзін айнадағыдай көреді: суреттегі қалыпты қайталап, санақ біткенше ұстап тұрады. «Сурет» батырмасы қалыпты түсіріп алады.'),
    h('div', { class: 'grid artgrid' }, h('div', {}, list), h('div', {}, main, h('div', { class: 'panel' }, h('h3', {}, '📷 Айна'), cam.el))));
  renderAll();
}

/* ----- 3. Дауыс ----- */
function prepVoice(host) {
  tabset(host, [
    ['Дауысты дыбыстар', pane => voiceVowels(pane)],
    ['Дауысымды өзгертемін', pane => voiceLoud(pane)],
    ['Жаңғырық', pane => voiceEcho(pane)],
  ]);
}
function voiceVowels(pane) {
  const GOAL = 3; let letterSel = 'А', mic = null, raf, cur = 0, best = 0, got = 0, last = 0, thr = 0.04;
  const err = h('div', { class: 'msg', hidden: true }), meter = h('div', { class: 'meter' }, h('i')), L = h('div', { class: 'bigletter vl' }, 'А'), timer = h('div', { class: 'timer' }, '0.0 с'), bestEl = h('div', { class: 'small' }, 'Ең ұзақ: 0.0 с'), starsEl = h('div', { class: 'bigstars' }, '☆☆☆');
  const sel = h('div', { class: 'row' }, ['А', 'О', 'У'].map(c => h('button', { class: 'btn' + (c === letterSel ? '' : ' ghost'), onclick: e => { letterSel = c; L.textContent = c; sel.querySelectorAll('button').forEach(b => b.classList.toggle('ghost', b.textContent !== c)); TTS.say(c + ' ' + c + ' ' + c); } }, c)));
  const btn = h('button', { class: 'btn big', onclick: toggle }, '🎤 Бастау');
  async function toggle() {
    if (mic) return stop();
    try { mic = await openMic(false); } catch (e) { err.hidden = false; err.textContent = mediaError(e); return; }
    btn.textContent = '⏳ Калибрация…'; const b = await mic.calibrate(800); if (!mic) return; thr = Math.max(0.02, b.max * 2.2); btn.textContent = '⏹ Тоқтату'; last = performance.now(); let grace = 0;
    const loop = () => { if (!mic) return; const now = performance.now(), dt = (now - last) / 1000; last = now; const l = mic.level(), v = l > thr; $('i', meter).style.width = Math.min(100, l / (thr * 5) * 100) + '%';
      L.style.transform = `scale(${1 + Math.min(1, l / (thr * 6))})`; L.style.opacity = v ? 1 : 0.45;
      if (v) { cur += dt; grace = 0; } else { grace += dt; if (grace > 0.35) { if (cur > best) best = cur; if (cur >= GOAL && got < 3) { got++; starsEl.textContent = stars(got); playSound('ok'); confetti(pane); Store.kid.prog['p:voice'] = { stars: got, indep: got, total: 3 }; Store.save(); } cur = 0; } }
      timer.textContent = cur.toFixed(1) + ' с'; timer.classList.toggle('goal', cur >= GOAL); bestEl.textContent = `Ең ұзақ: ${Math.max(best, cur).toFixed(1)} с · Мақсат: ${GOAL} с созу`; raf = requestAnimationFrame(loop); };
    loop();
  }
  function stop() { if (mic) { mic.close(); mic = null; } cancelAnimationFrame(raf); btn.textContent = '🎤 Бастау'; L.style.transform = ''; }
  pane.append(h('div', { class: 'panel' }, h('p', { class: 'task' }, 'А-А-А; О-О-О; У-У-У дыбыстарын созып айту. Дыбысты таңда да, дауыстап, ұзақ созып айт: әріп дауысыңа қарай үлкейеді.'), sel, L, h('div', { class: 'row center' }, timer), meter, h('div', { class: 'row' }, btn), bestEl, starsEl, err));
  return stop;
}
function voiceLoud(pane) {
  const phases = [['Қалыпты дауыспен «аааа» де', 'base'], ['Енді ақырын «аааа» де 🤫', 'quiet'], ['Қатты «аааа» де 📢', 'loud'], ['Дыбысты ұзақ созып айт (3 с) 🎵', 'long']];
  let ph = 0, base = 0, busy = false; const err = h('div', { class: 'msg', hidden: true }), meter = h('div', { class: 'meter marked' }, h('i'), h('em')), prompt = h('div', { class: 'ptxt big' }), fb = h('div', { class: 'fb' }), btn = h('button', { class: 'btn big', onclick: run }, '🎤 Бастау');
  let alive = true; const stars_ = [];
  function render() { prompt.textContent = phases[ph] ? phases[ph][0] : 'Жарайсың! Барлық тапсырма орындалды 🎉'; btn.hidden = !phases[ph]; btn.textContent = '🎤 Бастау'; }
  async function run() {
    if (busy) return; busy = true; btn.disabled = true; fb.className = 'fb'; fb.textContent = '';
    let mic; try { mic = await openMic(false); } catch (e) { err.hidden = false; err.textContent = mediaError(e); busy = false; btn.disabled = false; return; }
    const b = await mic.calibrate(500), thr = Math.max(0.02, b.max * 2.2); const key = phases[ph][1]; btn.textContent = '🎙️ Айт…';
    if (key !== 'base') $('em', meter).style.left = Math.min(95, base / (thr * 8) * 100 * (key === 'quiet' ? 0.5 : 1.6)) + '%';
    let vals = [], voiced = 0, longest = 0, curL = 0, last = performance.now(); const t0 = last;
    while (performance.now() - t0 < 4200 && alive) { await sleep(40); const now = performance.now(), dt = now - last; last = now; const l = mic.level(); $('i', meter).style.width = Math.min(100, l / (thr * 8) * 100) + '%'; if (l > thr) { vals.push(l); voiced += dt; curL += dt; longest = Math.max(longest, curL); } else curL = 0; }
    mic.close(); busy = false; btn.disabled = false; if (!alive) return; $('i', meter).style.width = 0;
    const avg = vals.length ? vals.reduce((a, c) => a + c, 0) / vals.length : 0; let ok = false, msg = '';
    if (voiced < 500) msg = 'Дыбыс естілмеді. Қайта көр.';
    else if (key === 'base') { base = avg; ok = true; }
    else if (key === 'quiet') { ok = avg < base * 0.65; msg = ok ? '' : 'Ақырынырақ айтып көр 🤫'; }
    else if (key === 'loud') { ok = avg > base * 1.4; msg = ok ? '' : 'Қаттырақ айтып көр 📢'; }
    else { ok = longest >= 2400; msg = ok ? '' : `Ұзағырақ созып көр (${(longest / 1000).toFixed(1)} с)`; }
    if (ok) { fb.className = 'fb good'; fb.textContent = 'Жарайсың! 🎉'; playSound('ok'); confetti(pane); ph++; if (ph >= phases.length) { Store.kid.prog['p:voice2'] = { stars: 3, indep: 4, total: 4 }; Store.save(); } setTimeout(() => { fb.textContent = ''; fb.className = 'fb'; render(); }, 1200); }
    else { fb.className = 'fb bad'; fb.textContent = msg; playSound('no'); btn.textContent = '🎤 Қайта'; }
  }
  render(); pane.append(h('div', { class: 'panel' }, h('p', { class: 'task' }, 'Дыбысты ақырын айту, қалыпты дауыспен айту және созып айту. Алдымен бала қалыпты дауысын көрсетеді, сосын ақырын мен қатты айтады.'), prompt, meter, h('div', { class: 'row' }, btn), fb, err));
  return () => { alive = false; };
}
function voiceEcho(pane) {
  const sounds = ['А', 'О', 'У', 'М', 'Ы', 'И']; let cur = 'А', audio = null; const err = h('div', { class: 'msg', hidden: true }), meter = h('div', { class: 'meter' }, h('i')), fb = h('div', { class: 'fb' }), play = h('button', { class: 'btn ghost', hidden: true }, '▶ Өзіңді тыңда'); const stopS = { stop: false };
  const pick = h('div', { class: 'row' }, sounds.map(c => h('button', { class: 'btn sm' + (c === cur ? '' : ' ghost'), onclick: e => { cur = c; pick.querySelectorAll('button').forEach(b => b.classList.toggle('ghost', b.textContent !== c)); } }, c)));
  const cam = camPanel({ small: true }); const mirror = h('button', { class: 'btn sm ghost', onclick: () => { cam.el.classList.toggle('show'); if (!cam.video.srcObject) cam.start(); } }, '📷 Айна');
  const go = h('button', { class: 'btn big', onclick: async () => {
    go.disabled = true; fb.className = 'fb'; fb.textContent = '🔊 Тыңда…'; await TTS.say((cur + ' ').repeat(3).trim(), { rate: 0.7 }); fb.textContent = '🎤 Енді сен қайтала!';
    let o; try { o = await listen({ maxMs: 6000, silenceMs: 1100, stopSignal: stopS, onLevel: (l, t) => { $('i', meter).style.width = Math.min(100, l / (t * 5) * 100) + '%'; } }); } catch (e) { err.hidden = false; err.textContent = mediaError(e); go.disabled = false; return; }
    go.disabled = false; $('i', meter).style.width = 0;
    if (o.voicedMs > 300) { fb.className = 'fb good'; fb.textContent = `Жарайсың! Дыбыс ${(o.voicedMs / 1000).toFixed(1)} с созылды 🎉`; playSound('ok'); confetti(pane); Store.kid.prog['p:echo'] = { stars: 3, indep: 1, total: 1 }; Store.save(); } else { fb.className = 'fb bad'; fb.textContent = 'Дауыс естілмеді, қайталап көр 🙂'; }
    if (o.blob) { play.hidden = false; play.onclick = () => { audio && audio.pause(); audio = new Audio(URL.createObjectURL(o.blob)); audio.play(); }; }
  } }, '🔊 Тыңда → 🎤 Қайтала');
  onLeave(() => { stopS.stop = true; cam.stop(); });
  pane.append(h('div', { class: 'panel' }, h('p', { class: 'task' }, '«Жаңғырық»: дыбысты айтады, бала сол дыбысты қайталайды. Жазылған дауысын қайта тыңдап көруге болады.'), pick, h('div', { class: 'row' }, go, mirror), cam.el, meter, fb, h('div', { class: 'row' }, play), err));
}

/* ----- 4. Есту ----- */
function prepHear(host) {
  const ALL = [['bell', 'Қоңырау'], ['drum', 'Барабан'], ['rattle', 'Сылдырмақ'], ['whistle', 'Ысқырық']];
  const hearSteps = () => shuffle([...ALL, ...ALL.slice(0, 2)]).map(([n, l]) => pk('Не естілді?', [BELL, DRUM, RATTLE, WHISTLE], l, { snd: n }));
  const animals = [['cat', 'Мысық'], ['dog', 'Ит'], ['cow', 'Сиыр'], ['sheep', 'Қой']];
  const aSteps = () => shuffle([...animals, ...animals.slice(0, 1)]).map(([n, l]) => pk('Кім дыбыс шығарды?', [MYS, IT, SIYR, QOY], l, { snd: n }));
  tabset(host, [
    ['Не естілді?', pane => { pane.append(h('p', { class: 'task' }, 'Қоңырау, барабан, сылдырмақ дыбыстарын тыңдау. Қай дыбыс шыққанын анықтау.'), h('div', { class: 'stage' })); return runSteps($('.stage', pane), hearSteps(), 'hear1'); }],
    ['Дыбысты қайтала', pane => clapGame(pane)],
    ['Жануарды таны', pane => { pane.append(h('p', { class: 'task' }, 'Жануарлардың дыбыстарын тыңдау. Сәйкес суретті көрсету.'), h('div', { class: 'stage' })); return runSteps($('.stage', pane), aSteps(), 'hear3'); }],
  ]);
}
function clapGame(pane) {
  const pats = [1, 2, 2, 3, 1, 3]; let k = 0, ok = 0, busy = false, alive = true; const err = h('div', { class: 'msg', hidden: true }), fb = h('div', { class: 'fb' }), meter = h('div', { class: 'meter' }, h('i')), info = h('div', { class: 'ptxt big' });
  const dots = () => h('div', { class: 'claps' }, '👏'.repeat(pats[k]));
  const go = h('button', { class: 'btn big', onclick: run }, '▶ Бастау');
  function render() { if (k >= pats.length) { info.textContent = `Дайын! ${ok} / ${pats.length} дұрыс 🎉`; go.hidden = true; Store.kid.prog['p:hear2'] = { stars: ok >= 5 ? 3 : ok >= 3 ? 2 : 1, indep: ok, total: pats.length }; Store.save(); confetti(pane); return; } info.textContent = `${k + 1}-тапсырма: ${pats[k]} рет шапалақтауды тыңда да, қайтала`; go.textContent = '▶ Бастау'; }
  async function run() {
    if (busy) return; busy = true; go.disabled = true; fb.className = 'fb'; fb.textContent = '🔊 Тыңда…'; const n = pats[k];
    for (let i = 0; i < n; i++) { await playSound('clap'); await sleep(450); }
    await sleep(500); let mic; try { mic = await openMic(true); } catch (e) { err.hidden = false; err.textContent = mediaError(e); busy = false; go.disabled = false; return; }
    fb.textContent = '👏 Енді сен шапалақта!'; const b = await mic.calibrate(350), thr = Math.max(0.12, b.max * 4); let cnt = 0, prevHi = false, lastT = 0; const t0 = performance.now();
    while (performance.now() - t0 < 4500 && alive) { await sleep(15); const l = mic.level(), now = performance.now(); $('i', meter).style.width = Math.min(100, l / (thr * 2) * 100) + '%'; const hi = l > thr; if (hi && !prevHi && now - lastT > 170) { cnt++; lastT = now; fb.textContent = '👏'.repeat(cnt); } prevHi = hi; if (cnt >= n + 1) break; if (cnt >= n && now - lastT > 1200) break; }
    mic.close(); busy = false; go.disabled = false; if (!alive) return; $('i', meter).style.width = 0;
    if (cnt === n) { fb.className = 'fb good'; fb.textContent = 'Жарайсың! 🎉'; playSound('ok'); confetti(pane); ok++; k++; setTimeout(render, 900); }
    else { fb.className = 'fb bad'; fb.textContent = cnt === 0 ? 'Шапалақ естілмеді. Қолды микрофонға жақынырақ шапалақта.' : `Сен ${cnt} рет шапалақтадың, керегі — ${n}. Қайта көрелік 🙂`; go.textContent = '↻ Қайта'; }
  }
  render(); pane.append(h('div', { class: 'panel' }, h('p', { class: 'task' }, 'Логопед шапалақпен бір немесе екі рет дыбыс береді. Бала дәл солай қайталайды. Бағдарлама шапалақты микрофонмен санайды.'), info, h('div', { class: 'row center' }, dots()), meter, h('div', { class: 'row' }, go), fb, err,
    h('div', { class: 'row' }, h('button', { class: 'btn sm ghost', onclick: () => { fb.className = 'fb good'; fb.textContent = 'Логопед растады ✔'; ok++; k++; setTimeout(render, 700); } }, '✔ Логопед растады (қолмен)'))));
  return () => { alive = false; };
}

/* ----- 5. Ұсақ моторика ----- */
function prepFine(host) {
  tabset(host, [['Моншақ тізу', pane => beads(pane)], ['Түстерді жина', pane => sortColors(pane)], ['Ермексаз әлемі', pane => clay(pane)]]);
}
function beads(pane) {
  const COL = ['🔴', '🔵', '🟡', '🟢', '🟣']; let round = 0; const LEN = [3, 4, 5, 6]; let target = [], mine = [];
  const tg = h('div', { class: 'string' }), mn = h('div', { class: 'string mine' }), fb = h('div', { class: 'fb' }), info = h('div', { class: 'ptxt' });
  function newRound() { if (round >= LEN.length) { info.textContent = 'Барлық жіп дайын! 🎉'; Store.kid.prog['p:beads'] = { stars: 3, indep: 4, total: 4 }; Store.save(); pal.hidden = true; return; } target = Array.from({ length: LEN[round] }, () => rnd(COL.slice(0, 3 + Math.min(2, round)))); mine = []; draw(); info.textContent = `${round + 1}-жіп: сол сияқты моншақтарды тізіп шық`; }
  function draw() { tg.innerHTML = ''; target.forEach(c => tg.append(h('span', { class: 'bead' }, c))); mn.innerHTML = ''; for (let i = 0; i < target.length; i++) mn.append(h('span', { class: 'bead' + (mine[i] ? '' : ' empty') }, mine[i] || '')); }
  const pal = h('div', { class: 'row palette' }, COL.map(c => h('button', { class: 'bead big', onclick: () => { if (mine.length >= target.length) return; mine.push(c); draw(); if (mine.length === target.length) { if (mine.every((x, i) => x === target[i])) { fb.className = 'fb good'; fb.textContent = 'Жарайсың! 🎉'; playSound('ok'); confetti(pane); round++; setTimeout(() => { fb.textContent = ''; newRound(); }, 1100); } else { fb.className = 'fb bad'; fb.textContent = 'Қайта тізіп көр 🙂'; playSound('no'); setTimeout(() => { mine = []; draw(); fb.textContent = ''; }, 900); } } } }, c)), h('button', { class: 'btn sm ghost', onclick: () => { mine.pop(); draw(); } }, '⌫'));
  pane.append(h('div', { class: 'panel' }, h('p', { class: 'task' }, 'Түрлі түсті моншақтарды жіпке тізу. Үлгідегі түстер ретін қайтала.'), info, h('h4', {}, 'Үлгі'), tg, h('h4', {}, 'Сенің жібің'), mn, pal, fb)); newRound();
}
function sortColors(pane) {
  const BINS = [['Қызыл', '#ff6b6b', ['🍎', '🍓', '🍅']], ['Сары', '#ffd23f', ['🍌', '🌞', '🍋']], ['Жасыл', '#3ddc97', ['🍏', '🥒', '🐸']], ['Көк', '#4dabf7', ['🫐', '🐳', '🧢']]];
  let items = [], selItem = null, left = 0;
  const tray = h('div', { class: 'tray' }), bins = h('div', { class: 'bins' }), fb = h('div', { class: 'fb' });
  function start() {
    items = shuffle(BINS.flatMap(b => b[2].slice(0, 2).map(e => ({ e, c: b[0] })))); left = items.length; selItem = null; tray.innerHTML = ''; fb.textContent = '';
    items.forEach(it => { it.el = h('button', { class: 'item', onclick: () => { if (it.done) return; if (selItem) selItem.el.classList.remove('sel'); selItem = it; it.el.classList.add('sel'); } }, it.e); tray.append(it.el); });
    bins.innerHTML = ''; BINS.forEach(b => bins.append(h('button', { class: 'bin', 'data-c': b[0], style: `--c:${b[1]}`, onclick: () => drop(b[0]) }, h('b', {}, b[0]), h('div', { class: 'binin' }))));
  }
  function drop(color) {
    if (!selItem) { fb.className = 'fb info'; fb.textContent = 'Алдымен затты бас 👆'; return; }
    const bin = bins.querySelector(`[data-c="${color}"] .binin`);
    if (selItem.c === color) { bin.append(h('span', {}, selItem.e)); selItem.done = true; selItem.el.remove(); selItem = null; left--; fb.className = 'fb good'; fb.textContent = 'Дұрыс!'; playSound('tick'); if (!left) { fb.textContent = 'Жарайсың! Бәрін сұрыптадың 🎉'; playSound('ok'); confetti(pane); Store.kid.prog['p:sort'] = { stars: 3, indep: 1, total: 1 }; Store.save(); } }
    else { fb.className = 'fb bad'; fb.textContent = 'Бұл басқа түс. Қайта көр 🙂'; playSound('no'); }
  }
  pane.append(h('div', { class: 'panel' }, h('p', { class: 'task' }, 'Түрлі түсті заттарды түстеріне қарай сұрыптау: затты бас, сосын сәйкес түсті себетті бас.'), tray, bins, fb, h('div', { class: 'row' }, h('button', { class: 'btn sm ghost', onclick: start }, '↻ Қайтадан')))); start();
}
function clay(pane) {
  const shapes = [['Доп', '⚪'], ['Алма', '🍎'], ['Жылан', '🐍']]; let shape = 0, col = '#c0763d', drawing = false;
  const cv = h('canvas', { width: 520, height: 360, class: 'clay' }), cx = cv.getContext('2d'); const cam = camPanel(); onLeave(() => cam.stop());
  function guide() { cx.clearRect(0, 0, cv.width, cv.height); cx.fillStyle = '#fffaf0'; cx.fillRect(0, 0, cv.width, cv.height); cx.setLineDash([10, 10]); cx.strokeStyle = '#bbb'; cx.lineWidth = 4; cx.beginPath();
    if (shape === 0) cx.arc(260, 180, 110, 0, 7); else if (shape === 1) { cx.arc(235, 195, 95, 0, 7); cx.moveTo(265, 100); cx.quadraticCurveTo(290, 50, 330, 50); } else { cx.moveTo(60, 250); for (let x = 0; x <= 400; x += 5) cx.lineTo(60 + x, 220 + Math.sin(x / 38) * 55); }
    cx.stroke(); cx.setLineDash([]); }
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  cv.onpointerdown = e => { drawing = true; cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); cx.fillStyle = col; cx.beginPath(); cx.arc(x, y, 14, 0, 7); cx.fill(); cx.lastP = [x, y]; };
  cv.onpointermove = e => { if (!drawing) return; const [x, y] = pos(e); cx.strokeStyle = col; cx.lineWidth = 28; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(...cx.lastP); cx.lineTo(x, y); cx.stroke(); cx.lastP = [x, y]; };
  cv.onpointerup = () => drawing = false;
  const sel = h('div', { class: 'row' }, shapes.map((s, k) => h('button', { class: 'btn sm' + (k === shape ? '' : ' ghost'), onclick: e => { shape = k; sel.querySelectorAll('button').forEach((b, n) => b.classList.toggle('ghost', n !== k)); guide(); } }, s[1] + ' ' + s[0])));
  const colors = h('div', { class: 'row' }, ['#c0763d', '#ff6b6b', '#4dabf7', '#3ddc97', '#ffd23f'].map(c => h('button', { class: 'dot', style: `background:${c}`, onclick: () => col = c })));
  guide();
  pane.append(h('div', { class: 'panel' }, h('p', { class: 'task' }, 'Ермексаздан доп, алма, жылан жасау. Алдымен экранда саусағыңмен «ермексаз жолағымен» пішінді сал, сосын нағыз ермексаздан жасап, камераға көрсет.'), sel, colors, cv, h('div', { class: 'row' }, h('button', { class: 'btn sm ghost', onclick: guide }, '🧽 Тазалау'), h('button', { class: 'btn sm ok', onclick: () => { playSound('ok'); confetti(pane); Store.kid.prog['p:clay'] = { stars: 3, indep: 1, total: 1 }; Store.save(); } }, '✔ Дайын')),
    h('h3', {}, '📷 Нағыз ермексаз жұмысын көрсету'), cam.el));
}

/* ----- 6. Еліктеу ----- */
function prepImit(host) {
  const an = [['🐱', 'Мысық', 'мияу', ['мияу', 'мяу', 'миау', 'мау']], ['🐶', 'Ит', 'ав-ав', ['ав ав', 'аф аф', 'гав гав', 'ав']], ['🐮', 'Сиыр', 'мө-ө', ['мо', 'му', 'мөө', 'мое']]];
  const sylls = ['ма', 'мо', 'му', 'ба', 'бо', 'бу'];
  const words = [['👩', 'Ана', 'ана'], ['👴', 'Ата', 'ата'], ['⚽', 'Доп', 'доп'], ['🍎', 'Алма', 'алма']];
  tabset(host, [
    ['Қалай дыбыстайды?', pane => { pane.append(h('p', { class: 'task' }, 'Мысық – мияу; ит – ав-ав; сиыр – мө-ө.'), h('div', { class: 'stage' })); return runSteps($('.stage', pane), an.map(a => sy(a[0], `${a[1]} қалай дыбыстайды?`, a[3], { listen: a[2], show: a[2] })), 'imit1'); }],
    ['Дыбысты қайтала', pane => { pane.append(h('p', { class: 'task' }, 'МА, МО, МУ; БА, БО, БУ буындарын қайталау.'), h('div', { class: 'stage' })); return runSteps($('.stage', pane), sylls.map(s => sy(chip(s.toUpperCase()), `${s.toUpperCase()} буынын қайтала`, [s, s + 'а'], { listen: s })), 'imit2'); }],
    ['Менің алғашқы сөздерім', pane => { pane.append(h('p', { class: 'task' }, 'АНА, АТА, ДОП, АЛМА сөздерін тыңдау, қайталау және суреттерімен сәйкестендіру.'), h('div', { class: 'stage' })); const all = words.map(w => o(w[0], w[1]));
      return runSteps($('.stage', pane), words.flatMap(w => [sy(w[0], `${w[1]} — тыңда да, қайтала`, [w[2]], { listen: w[2], show: w[1].toUpperCase() }), pk(`${w[1]} — суретін тап`, all, w[1])]), 'imit3'); }],
  ]);
}

/* ================= НӘТИЖЕ ================= */
function indicatorStat(ind) {
  let indep = 0, total = 0, any = 0;
  ind.games.forEach(id => [0, 1, 2].forEach(l => { const r = (Store.kid.prog[id] || {})[l]; if (r) { indep += r.indep; total += r.total; any++; } }));
  return { pct: total ? Math.round(indep / total * 100) : null, any };
}
function viewResults() {
  const kid = Store.kid;
  const grid = h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, h('th', {}, '№'), h('th', {}, 'Ойын'), h('th', {}, '1-деңгей'), h('th', {}, '2-деңгей'), h('th', {}, '3-деңгей'))),
    h('tbody', {}, GAMES.map(g => h('tr', {}, h('td', {}, g.id), h('td', {}, h('a', { href: '#/game/' + g.id }, g.title)), [0, 1, 2].map(l => h('td', { class: 'c' }, h('a', { href: `#/game/${g.id}/${l}` }, lvStars(g.id, l) ? stars(lvStars(g.id, l)) : '—')))))));
  const prepRows = [['p:artic', 'Артикуляция'], ['p:voice', 'Дауысты дыбыстар'], ['p:voice2', 'Дауысымды өзгертемін'], ['p:echo', 'Жаңғырық'], ['p:hear1', 'Не естілді?'], ['p:hear2', 'Шапалақ ырғағы'], ['p:hear3', 'Жануарды таны'], ['p:beads', 'Моншақ тізу'], ['p:sort', 'Түстерді жина'], ['p:clay', 'Ермексаз'], ['p:imit1', 'Қалай дыбыстайды?'], ['p:imit2', 'Буындар'], ['p:imit3', 'Алғашқы сөздер']];
  const pst = k => { const r = kid.prog[k]; return r ? (r.stars || (r[0] && r[0].stars) || 0) : 0; };
  const prep = h('div', { class: 'chips' }, prepRows.map(([k, t]) => h('span', { class: 'pill' + (pst(k) ? ' on' : '') }, t, ' ', pst(k) ? stars(pst(k)) : '')));
  const done = GAMES.reduce((a, g) => a + [0, 1, 2].filter(l => lvStars(g.id, l)).length, 0), st = GAMES.reduce((a, g) => a + gameStars(g.id), 0);
  const sum = h('div', { class: 'grid stats' }, stat(`${done}/90`, 'орындалған деңгей'), stat(`${st}/270`, 'жұлдыз'), stat(`${GAMES.filter(g => g.kind === 'sens').reduce((a, g) => a + gameStars(g.id), 0)}/135`, 'сенсорлық'), stat(`${GAMES.filter(g => g.kind === 'mot').reduce((a, g) => a + gameStars(g.id), 0)}/135`, 'моторлық'));
  // бақылау кестесі
  const date = h('input', { type: 'date', value: new Date().toISOString().slice(0, 10) });
  const rows = INDICATORS.map(ind => {
    const s = indicatorStat(ind), sug = s.pct == null ? '' : s.pct >= 70 ? 'Өздігінен' : 'Көмекпен';
    const sel = h('select', {}, h('option', { value: '' }, '—'), ['Өздігінен', 'Көмекпен'].map(v => h('option', { value: v, selected: v === sug }, v)));
    const note = h('input', { type: 'text', placeholder: 'Ескертпе…' });
    return { ind, sel, note, tr: h('tr', {}, h('td', {}, h('b', {}, ind.k)), h('td', {}, sel, s.pct == null ? h('div', { class: 'small' }, 'ойын деректері жоқ') : h('div', { class: 'small' }, `ойындар бойынша: ${s.pct}% өздігінен`)), h('td', {}, note)) };
  });
  const hist = h('div', {}); const renderHist = () => {
    hist.innerHTML = ''; if (!kid.obs.length) { hist.append(h('p', { class: 'small' }, 'Сақталған бақылау әзірге жоқ.')); return; }
    kid.obs.slice().reverse().forEach((o, ri) => { const idx = kid.obs.length - 1 - ri; hist.append(h('div', { class: 'obsrec' }, h('div', { class: 'row' }, h('b', {}, `${o.date} · ${Store.d.cur}`), h('button', { class: 'btn sm ghost', onclick: () => { kid.obs.splice(idx, 1); Store.save(); renderHist(); } }, '🗑')),
      h('table', { class: 'tbl' }, h('tbody', {}, o.rows.map(r => h('tr', {}, h('td', {}, r.k), h('td', {}, r.v || '—'), h('td', {}, r.n || '')))))));
    });
  };
  renderHist();
  const csv = () => { const lines = [['Бала', 'Күні', 'Көрсеткіш', 'Нәтиже', 'Ескертпе'], ...kid.obs.flatMap(o => o.rows.map(r => [Store.d.cur, o.date, r.k, r.v, r.n]))]; const b = new Blob(['﻿' + lines.map(l => l.map(c => '"' + String(c || '').replace(/"/g, '""') + '"').join(',')).join('\n')], { type: 'text/csv' }); const a = h('a', { href: URL.createObjectURL(b), download: 'baqylau.csv' }); document.body.append(a); a.click(); a.remove(); };
  root.append(h('h1', {}, `📊 ${Store.d.cur}: нәтижелер`), sum,
    h('section', { class: 'panel' }, h('h2', {}, 'V. Баланың нәтижесін бақылау'), h('p', { class: 'small' }, 'Нәтиже ойындардағы жауаптарға қарап ұсынылады, бірақ соңғы бағаны логопед қояды.'),
      h('div', { class: 'row' }, h('label', {}, 'Күні: ', date)),
      h('table', { class: 'tbl obs' }, h('thead', {}, h('tr', {}, h('th', {}, 'Бағалау көрсеткіші'), h('th', {}, 'Нәтиже нұсқасы'), h('th', {}, 'Ескертпе'))), h('tbody', {}, rows.map(r => r.tr))),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => { kid.obs.push({ date: date.value, rows: rows.map(r => ({ k: r.ind.k, v: r.sel.value, n: r.note.value })) }); Store.save(); renderHist(); playSound('ok'); } }, '💾 Бақылауды сақтау'), h('button', { class: 'btn ghost', onclick: csv }, '⬇ CSV жүктеу'), h('button', { class: 'btn ghost', onclick: () => print() }, '🖨 Басып шығару'))),
    h('section', { class: 'panel' }, h('h2', {}, 'Сақталған бақылаулар'), hist),
    h('section', { class: 'panel' }, h('h2', {}, 'Ойындар бойынша жұлдыздар'), h('details', { open: true }, h('summary', {}, 'Кестені жасыру/көрсету'), grid)),
    h('section', { class: 'panel' }, h('h2', {}, 'Дайындық кезеңі'), prep),
    h('p', { class: 'small' }, 'Деректер тек осы құрылғының браузерінде сақталады. ', h('button', { class: 'btn sm ghost', onclick: () => { if (confirm(`${Store.d.cur} баласының барлық нәтижесін өшіру керек пе?`)) { kid.prog = {}; kid.obs = []; Store.save(); route(); } } }, 'Нәтижені тазалау')));
}
const stat = (n, t) => h('div', { class: 'stat' }, h('b', {}, n), h('span', {}, t));

route();
