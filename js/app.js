(function () {
  'use strict';
  const C = window.Chart, T = window.Tools, $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  function el(n, a, t) { const e = document.createElementNS(NS, n); for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; return e; }

  /* ---------- STEP1 ---------- */
  let pts = [], inCnt = 0;
  const S = 340, PAD = 18;
  const PX = v => PAD + v * (S - PAD * 2);
  const PY = v => S - PAD - v * (S - PAD * 2);

  function drawMC() {
    const box = $('mcBox'); box.innerHTML = '';
    const svg = el('svg', { viewBox: `0 0 ${S} ${S}`, width: '100%', role: 'img', 'aria-label': '正方形と四分円に打った点' });
    svg.appendChild(el('rect', { x: PX(0), y: PY(1), width: PX(1) - PX(0), height: PY(0) - PY(1), class: 'sq' }));
    svg.appendChild(el('path', { d: 'M ' + PX(1) + ' ' + PY(0) + ' A ' + (PX(1) - PX(0)) + ' ' + (PY(0) - PY(1)) +
      ' 0 0 0 ' + PX(0) + ' ' + PY(1), class: 'arc' }));
    const show = pts.slice(-1500);
    show.forEach(p => svg.appendChild(el('circle', { cx: PX(p[0]), cy: PY(p[1]), r: pts.length > 400 ? 1.6 : 3,
      class: p[2] ? 'pin' : 'pout' })));
    if (pts.length && pts.length <= 200) {
      const l = pts[pts.length - 1];
      svg.appendChild(el('circle', { cx: PX(l[0]), cy: PY(l[1]), r: 6, class: 'last' }));
      svg.appendChild(el('line', { x1: PX(0), y1: PY(0), x2: PX(l[0]), y2: PY(l[1]),
        stroke: '#8a5a00', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }));
    }
    svg.appendChild(el('text', { x: PX(0), y: PY(0) + 14, 'font-size': 11, fill: '#858a92', 'font-family': 'monospace' }, 'O'));
    svg.appendChild(el('text', { x: PX(1), y: PY(0) + 14, 'font-size': 11, fill: '#858a92', 'text-anchor': 'end', 'font-family': 'monospace' }, '1'));
    box.appendChild(svg);

    $('mAll').textContent = pts.length;
    $('mIn').textContent = inCnt;
    const pi = pts.length ? 4 * inCnt / pts.length : 0;
    $('piNow').innerHTML = (pts.length ? pi.toFixed(4) : '—') + '<small>円周率の近似値（正しい値は 3.14159…）</small>';
    const n = $('mcNote');
    if (!pts.length) { n.className = 'note info'; n.textContent = 'ボタンを押して点を打ってください。'; return; }
    const err = Math.abs(pi - Math.PI) / Math.PI * 100;
    n.className = err < 1 ? 'note ok' : err < 5 ? 'note info' : 'note warn';
    n.innerHTML = '4 × ' + inCnt + ' ÷ ' + pts.length + ' ＝ <strong>' + pi.toFixed(4) + '</strong>（誤差 ' + err.toFixed(2) + '％）。' +
      (pts.length < 200 ? '<strong>点が少ないうちは値が大きくぶれます。</strong>もっと打ってみましょう。'
                        : '点を増やすほど 3.14159… に近づきます。');
    if (pts.length) {
      const l = pts[pts.length - 1];
      const d = Math.sqrt(l[0] * l[0] + l[1] * l[1]);
      $('lastPoint').innerHTML = '点 (' + l[0].toFixed(3) + ', ' + l[1].toFixed(3) + ')<br>' +
        '原点からの距離 ＝ √(' + l[0].toFixed(3) + '² ＋ ' + l[1].toFixed(3) + '²) ＝ <strong>' + d.toFixed(3) + '</strong><br>' +
        '<span style="color:' + (l[2] ? 'var(--ok)' : 'var(--ng)') + '">' +
        (l[2] ? '1以下なので四分円の内側' : '1より大きいので四分円の外側') + '</span>';
    }
  }
  function addPts(n) {
    for (let i = 0; i < n; i++) {
      const x = Math.random(), y = Math.random();
      const ins = x * x + y * y <= 1;
      if (ins) inCnt++;
      pts.push([x, y, ins]);
    }
    if (pts.length > 20000) pts = pts.slice(-20000);
    drawMC();
  }

  /* ---------- STEP2 収束 ---------- */
  function runConv() {
    const vals = [], labels = [];
    let ins = 0;
    const marks = [];
    for (let i = 1; i <= 10000; i++) {
      const x = Math.random(), y = Math.random();
      if (x * x + y * y <= 1) ins++;
      if (i % 100 === 0) { vals.push(4 * ins / i); labels.push(i % 2000 === 0 ? String(i) : ''); marks.push(i); }
    }
    C.line($('convChart'), { W: 780, H: 340, labels,
      series: [
        { name: '近似値', values: vals, color: '#123a6b' },
        { name: '3.14159…', values: vals.map(() => Math.PI), color: '#b3261e' }
      ], yMin: 2.9, yMax: 3.4 });
    const last = vals[vals.length - 1];
    const early = vals.slice(0, 5), late = vals.slice(-5);
    const spread = a => Math.max(...a) - Math.min(...a);
    const n = $('convNote');
    n.className = 'note ok';
    n.innerHTML = '10000点での近似値は <strong>' + last.toFixed(4) + '</strong>（誤差 ' +
      (Math.abs(last - Math.PI) / Math.PI * 100).toFixed(2) + '％）。<br>' +
      '最初のころ（100〜500点）は値の幅が ' + spread(early).toFixed(3) + ' もありましたが、' +
      '終わりごろ（9600〜10000点）は ' + spread(late).toFixed(3) + ' に落ち着いています。' +
      '<strong>点を増やすほど値が安定します。</strong>';
    $('convTools').innerHTML = '';
    $('convTools').appendChild(T.saveButton(() => $('convChart').querySelector('svg'), '円周率の収束'));
  }

  /* ---------- STEP3 ばらつき ---------- */
  function estimate(n) {
    let ins = 0;
    for (let i = 0; i < n; i++) { const x = Math.random(), y = Math.random(); if (x * x + y * y <= 1) ins++; }
    return 4 * ins / n;
  }
  function runSpread() {
    const sets = [100, 1000, 10000];
    const rows = sets.map(n => {
      const v = [];
      for (let k = 0; k < 50; k++) v.push(estimate(n));
      v.sort((a, b) => a - b);
      const q = p => v[Math.floor((v.length - 1) * p)];
      const mean = v.reduce((a, b) => a + b, 0) / v.length;
      const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
      return { n, v, min: v[0], q1: q(.25), med: q(.5), q3: q(.75), max: v[v.length - 1], mean, sd };
    });
    C.box5($('spreadChart'), { W: 700, H: 220, labelW: 90,
      xMin: Math.min(...rows.map(r => r.min)) - .05, xMax: Math.max(...rows.map(r => r.max)) + .05,
      rows: rows.map(r => ({ name: r.n + '点', min: r.min, q1: r.q1, med: r.med, q3: r.q3, max: r.max, mean: r.mean })) });
    $('spreadTable').innerHTML = '<thead><tr><th>点の数</th><th>平均</th><th>標準偏差</th><th>最小</th><th>最大</th><th>幅</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td>' + r.n + '</td><td class="mono">' + r.mean.toFixed(4) + '</td><td class="mono">' +
        r.sd.toFixed(4) + '</td><td class="mono">' + r.min.toFixed(3) + '</td><td class="mono">' + r.max.toFixed(3) +
        '</td><td class="mono">' + (r.max - r.min).toFixed(3) + '</td></tr>').join('') + '</tbody>';
    const n = $('spreadNote');
    n.hidden = false; n.className = 'note ok';
    n.innerHTML = '各条件で50回ずつ実行しました。点の数が100倍になると、標準偏差はおよそ <strong>10分の1</strong>（' +
      rows[0].sd.toFixed(4) + ' → ' + rows[2].sd.toFixed(4) + '）になります。<br>' +
      '<strong>精度は点の数の平方根に比例してしか上がりません。</strong>10倍打っても誤差は約3分の1にしかなりません。';
  }

  /* ---------- STEP4 面積 ---------- */
  const FIGS = {
    quarter: { name: '四分円', f: (x, y) => x * x + y * y <= 1, area: Math.PI / 4,
      curve: t => Math.sqrt(Math.max(0, 1 - t * t)) },
    parab: { name: 'y ＝ x² の下側', f: (x, y) => y <= x * x, area: 1 / 3, curve: t => t * t },
    tri: { name: '三角形（y ≦ x）', f: (x, y) => y <= x, area: 0.5, curve: t => t },
    wave: { name: 'y ＝ (sin(5x)+1)/2 の下側', f: (x, y) => y <= (Math.sin(5 * x) + 1) / 2, area: null,
      curve: t => (Math.sin(5 * t) + 1) / 2 }
  };
  let figKey = 'quarter';
  function drawArea() {
    const n = +$('areaN').value;
    $('areaNv').textContent = n;
    const fg = FIGS[figKey];
    document.querySelectorAll('[data-fig]').forEach(b => b.setAttribute('aria-pressed', b.dataset.fig === figKey));
    let ins = 0;
    const list = [];
    for (let i = 0; i < n; i++) {
      const x = Math.random(), y = Math.random();
      const t = fg.f(x, y);
      if (t) ins++;
      if (list.length < 2500) list.push([x, y, t]);
    }
    const box = $('areaBox'); box.innerHTML = '';
    const svg = el('svg', { viewBox: `0 0 ${S} ${S}`, width: '100%', role: 'img', 'aria-label': fg.name });
    svg.appendChild(el('rect', { x: PX(0), y: PY(1), width: PX(1) - PX(0), height: PY(0) - PY(1), class: 'sq' }));
    const d = [];
    for (let k = 0; k <= 100; k++) { const t = k / 100; d.push((k ? 'L' : 'M') + PX(t) + ' ' + PY(Math.min(1, fg.curve(t)))); }
    svg.appendChild(el('path', { d: d.join(' '), class: 'arc' }));
    list.forEach(p => svg.appendChild(el('circle', { cx: PX(p[0]), cy: PY(p[1]), r: n > 800 ? 1.5 : 2.6, class: p[2] ? 'pin' : 'pout' })));
    box.appendChild(svg);
    const est = ins / n;
    $('aEst').textContent = est.toFixed(4);
    $('aTrue').textContent = fg.area == null ? '—' : fg.area.toFixed(4);
    $('aErr').textContent = fg.area == null ? '—' : (Math.abs(est - fg.area) / fg.area * 100).toFixed(2);
    const nt = $('areaNote');
    nt.className = 'note info';
    nt.innerHTML = '正方形の面積は1なので、<strong>内側の点の割合がそのまま面積</strong>になります（' +
      ins + ' ÷ ' + n + ' ＝ ' + est.toFixed(4) + '）。' +
      (fg.area == null
        ? 'この図形は式で面積を求めるのが大変ですが、<strong>モンテカルロ法なら同じやり方で求められます</strong>。'
        : '正しい面積は ' + fg.area.toFixed(4) + '。' + (figKey === 'quarter' ? 'これを4倍すると円周率になります。' : ''));
  }

  /* ---------- STEP5 クイズ ---------- */
  const QUIZ = [
    { t: '円周率の近似値をより正確にするにはどうすればよいか。',
      choices: ['正方形内に生成させる点の数を増やす', '正方形の1辺の長さを長くする',
                '正方形の1辺の長さを短くする', '正方形内に生成させる点の数を減らす'],
      a: '正方形内に生成させる点の数を増やす',
      why: '点の数が多いほど、点の比が面積の比に近づきます。正方形の大きさは比に影響しないので、精度は変わりません。' },
    { t: '3000個の点を打ったところ、2355個が四分円内にあった。円周率の近似値はいくらか。',
      choices: ['3.14', '3.12', '3.13', '3.15'], a: '3.14',
      why: '4 × 2355 ÷ 3000 ＝ 3.14 です。「4倍する」のを忘れないようにしましょう。' },
    { t: '点が四分円の内部にあるかどうかは、どう判定するか。',
      choices: ['原点からの距離が1以下かどうか', 'x座標が0.5以下かどうか',
                'x＋y が1以下かどうか', 'x×y が1以下かどうか'], a: '原点からの距離が1以下かどうか',
      why: '半径1の四分円なので、√(x²＋y²) ≦ 1、つまり x²＋y² ≦ 1 で判定します。境界線上の点は内側に含めます。' },
    { t: '点を100倍に増やすと、誤差はおよそどうなるか。',
      choices: ['10分の1程度になる', '100分の1になる', '変わらない', '10倍になる'], a: '10分の1程度になる',
      why: 'モンテカルロ法の精度は<strong>点の数の平方根に比例</strong>します。100倍打つと誤差は √100 ＝ 10分の1程度です。' },
    { t: '同じ点の数で2回実行したら、ちがう値になった。これはなぜか。',
      choices: ['乱数を使う確率的モデルだから', 'プログラムのまちがい',
                'コンピュータの性能のちがい', '点の数が足りないから'], a: '乱数を使う確率的モデルだから',
      why: '毎回ちがう乱数を使うので、結果もばらつきます。何度も実行して平均やばらつきを見るのが基本です。' },
    { t: 'モンテカルロ法が使えるのはどんなときか。',
      choices: ['式では求めにくい面積や確率を近似したいとき', '正確な値を1回で求めたいとき',
                'データが1つしかないとき', '計算を速くしたいとき'], a: '式では求めにくい面積や確率を近似したいとき',
      why: '複雑な形の面積や、条件が入り組んだ確率の計算に使われます。あくまで近似値であり、正確な値ではありません。' }
  ];
  let qList = [], qi = 0, qScore = 0;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function startQuiz() { qList = shuffle(QUIZ); qi = 0; qScore = 0; renderQ(); }
  function renderQ() {
    if (qi >= qList.length) {
      $('qText').textContent = qScore + ' / ' + qList.length + ' 問正解';
      $('qChoices').innerHTML = ''; $('qFb').hidden = true; $('qNext').disabled = true;
      $('qProgress').textContent = qList.length + ' / ' + qList.length; return;
    }
    const it = qList[qi];
    $('qProgress').textContent = (qi + 1) + ' / ' + qList.length;
    $('qScore').textContent = qScore;
    $('qText').textContent = it.t;
    const box = $('qChoices'); box.className = 'choice4'; box.innerHTML = '';
    shuffle(it.choices).forEach(c => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = c; b.dataset.c = c;
      b.addEventListener('click', () => answerQ(c));
      box.appendChild(b);
    });
    $('qFb').hidden = true; $('qNext').disabled = true;
    $('qNext').textContent = (qi === qList.length - 1) ? '結果を見る' : '次の問題';
  }
  function answerQ(c) {
    const it = qList[qi], ok = c === it.a, box = $('qChoices');
    box.classList.add('locked');
    [...box.children].forEach(b => {
      if (b.dataset.c === it.a) b.classList.add('correct');
      else if (b.dataset.c === c) b.classList.add('wrong');
    });
    if (ok) qScore++;
    const fb = $('qFb');
    fb.className = 'note ' + (ok ? 'ok' : 'ng');
    fb.innerHTML = (ok ? '正解。' : '正解は「<strong>' + it.a + '</strong>」。') + it.why;
    fb.hidden = false;
    $('qScore').textContent = qScore; $('qNext').disabled = false;
  }

  /* 本文の問題 */
  function drawBook() {
    if (!document.getElementById('bookBox')) return;
    window.Quiz.choice('bookBox', 'bookNote', [{"k": "ア", "q": "円周率πの近似値をより正確にするにはどうすればよいか。", "ch": ["正方形の1辺の長さを長くする", "正方形の1辺の長さを短くする", "正方形内に生成させる点の数を減らす", "正方形内に生成させる点の数を増やす"], "a": 3, "why": "点の数を増やすほど、面積の比が真の値に近づきます（<strong>大数の法則</strong>）。正方形の大きさは比なので結果に影響しません。"}, {"k": "イ", "q": "3000個の点のうち2355個が四分円内にあったとき、円周率の近似値は。", "ch": ["3.12", "3.13", "3.14", "3.15"], "a": 2, "why": "四分円の面積の比＝π/4 なので、π ≒ 4 × 2355 ÷ 3000 ＝ <strong>3.14</strong> です。"}], "本文の答えは【ア】③　【イ】② です。");
  }

  function init() {
    $('add1').addEventListener('click', () => addPts(1));
    $('add10').addEventListener('click', () => addPts(10));
    $('add100').addEventListener('click', () => addPts(100));
    $('add1000').addEventListener('click', () => addPts(1000));
    $('clearPts').addEventListener('click', () => { pts = []; inCnt = 0; drawMC(); });
    $('runConv').addEventListener('click', runConv);
    $('clearConv').addEventListener('click', () => { $('convChart').innerHTML = ''; $('convNote').className = 'note info'; $('convNote').textContent = 'ボタンを押してください。'; });
    $('runSpread').addEventListener('click', runSpread);
    document.querySelectorAll('[data-fig]').forEach(b => b.addEventListener('click', () => { figKey = b.dataset.fig; drawArea(); }));
    $('areaN').addEventListener('input', drawArea);
    $('qNext').addEventListener('click', () => { qi++; renderQ(); });
    $('qReset').addEventListener('click', startQuiz);
    window.Terms.glossary($('glossBox'), ['モンテカルロ法', '乱数', '確率的モデル', 'シミュレーション', '標準偏差', 'パラメータ']);
    drawMC(); drawArea(); startQuiz();
    drawBook();
    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
