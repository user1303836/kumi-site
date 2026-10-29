/* KumiShell: the round-2 page chrome. The words, the install command, the links and a quiet list of demos,
   over a full-screen visual that the page draws itself.

   <link rel="stylesheet" href="../kit/shell.css">
   <script src="../kit/kumi.js"></script>
   <script src="../kit/shell.js"></script>
   const shell = KumiShell.mount({
     layout: 'left',          // left | right | bottom | center | top
     theme: 'dark',           // dark | light (sets the default colours)
     font: 'geist',           // geist | inter-tight | instrument | mona | onest | hanken | schibsted | host | funnel | figtree | albert | manrope,
                              //   or a monospace key below to set the whole page in it; ?font= overrides
     mono: 'jetbrains',       // jetbrains | geist-mono | roboto-mono | plex | dm | source | redhat | spline
     colors: { fg, dim, faint, accent, panel, line },   // any subset overrides the theme
     headline: ['An AI agent', 'that works alongside you', 'in your DAW.'],
     kicker: 'Ableton Live · REAPER · Renoise',
     sub: '…',
     stage: 'self',           // 'self': your visual shows shell.video itself; 'panel': the shell shows it in a frame
     daws: 'marks',           // how the DAWs show: 'text' (the kicker, the default) | 'marks' (a row of logos; the name on hover)
                              //   | 'cycle' (one logo and its name at a time, rolling) | 'dots' (logos built from drifting points)
     dawsAt: 'kicker',        // where: 'kicker' (above the headline) | 'top' (the header bar) | 'foot' (beside the licence) | 'after' (under the install)
     dawSize: 18,             // px height of a logo
     onDaw(i, daw) {},        // a logo was hovered or focused (i = -1 when it is left), for the visual to answer
     dawFocus: false,         // while a logo is hovered the words step back (for a visual that draws the logo behind them)
     line: 0,                 // the line under the headline: KUMI.lines[n] (0 = sub, or the default); ?line=n overrides
     head: 0,                 // the headline: KUMI.headlines[n] (0 = headline, or the default); ?head=n overrides
     headStyle: 'tri',        // 'tri' | 'two' | 'one' | 'label' | 'giant' | 'weight' (see mount); ?hs= overrides
     demoStyle: 'list',       // the demo buttons: 'list' | 'bright' (larger, brighter) | 'chips' (boxed) | 'icons' (glyphs, title on hover)
                              //   | 'squares' (a joined grid of square buttons; on phones one row beside the logos); ?demos= overrides
     onDemo(i, demo, video) {},   // a demo was picked: turn the visual into the video (video is playing, with sound)
     onRelease() {}               // the visitor clicked elsewhere or pressed Escape: go back
   });
   shell.video, shell.playing (-1 when idle), shell.play(i), shell.release(), shell.root

   No instructions on the page: the demos are a plain numbered list, picking one plays it, clicking anywhere else returns. */
(function () {
  'use strict';
  var FONTS = {
    geist: ['Geist', 'Geist:wght@300..700'],
    'inter-tight': ['Inter Tight', 'Inter+Tight:wght@300..700'],
    instrument: ['Instrument Sans', 'Instrument+Sans:wght@400..700'],
    mona: ['Mona Sans', 'Mona+Sans:wght@300..800'],
    onest: ['Onest', 'Onest:wght@300..700'],
    hanken: ['Hanken Grotesk', 'Hanken+Grotesk:wght@300..700'],
    schibsted: ['Schibsted Grotesk', 'Schibsted+Grotesk:wght@400..700'],
    host: ['Host Grotesk', 'Host+Grotesk:wght@300..700'],
    funnel: ['Funnel Display', 'Funnel+Display:wght@300..700'],
    figtree: ['Figtree', 'Figtree:wght@300..700'],
    albert: ['Albert Sans', 'Albert+Sans:wght@300..700'],
    manrope: ['Manrope', 'Manrope:wght@300..700']
  };
  // monospaces; any of these can also be the page's `font`, and then the whole page is set in it
  var MONOS = {
    jetbrains: ['JetBrains Mono', 'JetBrains+Mono:wght@300..700'],
    'geist-mono': ['Geist Mono', 'Geist+Mono:wght@300..700'],
    'roboto-mono': ['Roboto Mono', 'Roboto+Mono:wght@300..700'],
    plex: ['IBM Plex Mono', 'IBM+Plex+Mono:wght@300;400;500;600'],
    dm: ['DM Mono', 'DM+Mono:wght@300;400;500'],
    source: ['Source Code Pro', 'Source+Code+Pro:wght@300..700'],
    redhat: ['Red Hat Mono', 'Red+Hat+Mono:wght@300..700'],
    spline: ['Spline Sans Mono', 'Spline+Sans+Mono:wght@300..700']
  };
  var THEMES = {
    dark: { fg: '#f2f2ef', dim: '#a6a6a2', faint: '#6e6e6b', accent: '#ff4f7b', panel: 'rgba(10,10,10,0.66)', line: 'rgba(255,255,255,0.14)' },
    light: { fg: '#121212', dim: '#55554f', faint: '#8a8a84', accent: '#e8361c', panel: 'rgba(255,255,255,0.72)', line: 'rgba(0,0,0,0.14)' }
  };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  // The DAWs as logos: a row, a rolling slot, or logos built from drifting points.
  function mountDaws(style, o, root, hero, top, foot) {
    var K = window.KUMI, M = K.dawMarks;
    if (K.reducedMotion() && style !== 'marks') style = 'marks';
    var label = function (m) { return m.name + ' ' + m.ver; };
    var wrap = el('div', 'ks-daws');
    wrap.dataset.style = style;
    wrap.style.setProperty('--ks-dh', (o.dawSize || 18) + 'px');
    wrap.style.color = 'var(--ks-' + (o.dawColor || 'dim') + ')';
    wrap.setAttribute('role', 'list');
    wrap.setAttribute('aria-label', 'Works in ' + M.map(label).join(', '));
    var name = el('span', 'ks-daw-name'); name.setAttribute('aria-hidden', 'true');
    var cur = -1, dotsAlign = null;
    function hover(i) {
      if (i >= 0) name.textContent = label(M[i]);
      wrap.classList.toggle('has-hover', i >= 0);
      if (o.dawFocus) root.classList.toggle('ks-daw-focus', i >= 0);
      if (i === cur) return;
      cur = i;
      if (o.onDaw) o.onDaw(i, i >= 0 ? M[i] : null);
    }

    if (style === 'marks') {
      var items = M.map(function (m, i) {
        var s = el('span', 'ks-daw', K.dawSVG(i, { title: label(m) }));
        s.setAttribute('role', 'listitem'); s.tabIndex = 0;
        var on = function () { items.forEach(function (x, j) { x.classList.toggle('is-on', j === i); }); hover(i); };
        var off = function () { s.classList.remove('is-on'); if (cur === i) hover(-1); };
        s.addEventListener('pointerenter', on); s.addEventListener('pointerleave', off);
        s.addEventListener('focus', on); s.addEventListener('blur', off);
        wrap.appendChild(s);
        return s;
      });
      wrap.appendChild(name);
    } else if (style === 'cycle') {
      var win = el('span', 'ks-cycle');
      var cyc = M.map(function (m, i) {
        var s = el('span', 'ks-cyc', K.dawSVG(i) + '<span class="nm"></span>');
        s.querySelector('.nm').textContent = label(m);
        s.setAttribute('role', 'listitem');
        win.appendChild(s);
        return s;
      });
      wrap.appendChild(win);
      var at = 0, paused = false;
      cyc[0].classList.add('is-on');
      wrap.addEventListener('pointerenter', function () { paused = true; hover(at); wrap.classList.remove('has-hover'); });
      wrap.addEventListener('pointerleave', function () { paused = false; hover(-1); });
      setInterval(function () {
        if (paused || document.hidden) return;
        var prev = at; at = (at + 1) % M.length;
        cyc[prev].classList.remove('is-on'); cyc[prev].classList.add('is-off');
        cyc[at].classList.remove('is-off'); cyc[at].classList.add('is-on');
        setTimeout(function () { cyc[prev].classList.remove('is-off'); }, 800);
      }, o.dawEvery || 2800);
    } else if (style === 'dots') {
      var cv = el('canvas', 'ks-dotcv'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', M.map(label).join(', ')); cv.tabIndex = 0;
      wrap.appendChild(cv); wrap.appendChild(name);
      var dh = o.dawSize || 18, CH = Math.round(dh * 2.3), CW = Math.round(CH * 2.4), dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(CW * dpr); cv.height = Math.round(CH * dpr); cv.style.width = CW + 'px'; cv.style.height = CH + 'px';
      // each logo as a fine grid of dots, in canvas px, as tall as its h says, centred in the canvas or (beside left-aligned
      // words) at its left edge; every logo gets P dots (the sparser repeat some)
      var MS = 256, pitch = o.dawPitch || (dpr >= 2 ? 1.35 : 2), masks = M.map(function (m, i) { return K.dawMask(i, { size: MS, fill: 1 }).getContext('2d').getImageData(0, 0, MS, MS).data; });
      var fit = M.map(function (m) { var big = Math.max(m.vb[2], m.vb[3]), sc = CH * 0.78 * m.h / (m.vb[3] / big * MS); return { sc: sc, w: m.vb[2] / big * MS * sc }; });
      function grid(i, centred) {
        var data = masks[i], sc = fit[i].sc, cx = centred ? CW / 2 : fit[i].w / 2 + 1, pts = [];
        for (var gy = pitch / 2; gy < CH; gy += pitch) for (var gx = pitch / 2; gx < CW; gx += pitch) {
          var u = (gx - cx) / sc + MS / 2, v = (gy - CH / 2) / sc + MS / 2;
          if (u >= 0 && v >= 0 && u < MS && v < MS && data[((v | 0) * MS + (u | 0)) * 4 + 3] >= 128) pts.push(gx, gy);
        }
        return pts;
      }
      var goal = [], P = 0, centredNow = null;
      function build(centred) {
        if (centred === centredNow) return;
        centredNow = centred;
        var grids = M.map(function (m, i) { return grid(i, centred); });
        P = P || Math.max.apply(null, grids.map(function (g) { return g.length / 2; }));
        goal = grids.map(function (g) {
          var n = g.length / 2, pts = new Float32Array(P * 2), order = [];
          for (var k = 0; k < P; k++) order.push(k < n ? k : (Math.random() * n) | 0);
          for (var k2 = P - 1; k2 > 0; k2--) { var r = (Math.random() * (k2 + 1)) | 0, tmp = order[k2]; order[k2] = order[r]; order[r] = tmp; }
          order.forEach(function (src, k3) { pts[k3 * 2] = g[src * 2]; pts[k3 * 2 + 1] = g[src * 2 + 1]; });
          return pts;
        });
      }
      dotsAlign = function (centred) { build(centred); name.style.left = centred ? '' : (Math.round(fit[mark].w) + 18) + 'px'; };
      build(true);
      var x = new Float32Array(P), y = new Float32Array(P), vx = new Float32Array(P), vy = new Float32Array(P), kk = new Float32Array(P);
      for (var j = 0; j < P; j++) { x[j] = Math.random() * CW; y[j] = Math.random() * CH; kk[j] = 0.025 + Math.random() * 0.07; }
      var ctx = cv.getContext('2d'), mark = 0, mode = 0, clock = 0, t = 0, held = false, color = null, last = performance.now();
      var HOLD = (o.dawEvery || 3200) / 1000, LOOSE = 0.9;
      var grab = function () { held = true; mode = 0; dotsAlign(centredNow); hover(mark); };
      var drop = function () { held = false; clock = 0; hover(-1); };
      wrap.addEventListener('pointerenter', grab); wrap.addEventListener('pointerleave', drop);
      cv.addEventListener('focus', grab); cv.addEventListener('blur', drop);
      (function frame(now) {
        requestAnimationFrame(frame);
        if (document.hidden) { last = now; return; }
        var dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt; clock += dt;
        if (!held) {
          if (mode === 0 && clock > HOLD) { mode = 1; clock = 0; }
          else if (mode === 1 && clock > LOOSE) { mode = 0; clock = 0; mark = (mark + 1) % M.length; }
        }
        var g = goal[mark], f = dt * 60;
        for (var j = 0; j < P; j++) {
          if (mode === 0) {
            vx[j] = (vx[j] + (g[j * 2] - x[j]) * kk[j] * f) * 0.8;
            vy[j] = (vy[j] + (g[j * 2 + 1] - y[j]) * kk[j] * f) * 0.8;
          } else {
            var a = Math.sin(x[j] * 0.09 + t * 1.3) * 2.2 + Math.cos(y[j] * 0.13 - t) * 2.2;
            vx[j] = vx[j] * 0.93 + Math.cos(a) * 0.085 * f + (x[j] - CW / 2) * 0.0008 * f;
            vy[j] = vy[j] * 0.93 + Math.sin(a) * 0.085 * f;
          }
          x[j] += vx[j] * f; y[j] += vy[j] * f;
        }
        if (!color) color = getComputedStyle(wrap).color;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, CW, CH);
        ctx.fillStyle = color;
        var s = pitch * 0.66;
        for (var j2 = 0; j2 < P; j2++) ctx.fillRect(x[j2] - s / 2, y[j2] - s / 2, s, s);
      })(last);
    }

    // where it sits; on phones always above the headline
    var where = o.dawsAt || 'kicker';
    function place() {
      var w = innerWidth <= 820 ? 'kicker' : where;
      wrap.dataset.at = w;
      if (dotsAlign) dotsAlign(w === 'top' || (root.dataset.layout === 'center' && innerWidth > 820 && w !== 'foot'));
      if (w === 'top') { if (wrap.parentNode !== top) top.insertBefore(wrap, top.lastChild); }
      else if (w === 'foot') { if (wrap.parentNode !== foot) foot.insertBefore(wrap, foot.firstChild); }
      else if (w === 'after') { if (wrap.parentNode !== hero || wrap.nextSibling) hero.appendChild(wrap); }
      else if (hero.firstChild !== wrap) hero.insertBefore(wrap, hero.firstChild);
      foot.classList.toggle('has-daws', w === 'foot');
    }
    place();
    addEventListener('resize', place);
  }

  function mount(o) {
    o = o || {};
    var K = window.KUMI;
    var params = new URLSearchParams(location.search);
    // ?font= picks the face for comparing; a monospace there sets the whole page in it
    var fontKey = (FONTS[params.get('font')] || MONOS[params.get('font')]) ? params.get('font') : o.font;
    var allMono = !!MONOS[fontKey];
    var font = allMono ? MONOS[fontKey] : FONTS[fontKey] || FONTS.geist, mono = allMono ? MONOS[fontKey] : MONOS[o.mono] || MONOS.jetbrains;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + font[1] + (mono !== font ? '&family=' + mono[1] : '') + '&display=swap';
    document.head.appendChild(link);
    document.documentElement.classList.add('ks-root');

    var theme = THEMES[o.theme === 'light' ? 'light' : 'dark'];
    var c = Object.assign({}, theme, o.colors || {});
    var root = el('div', 'ks');
    root.dataset.layout = o.layout || 'left';
    root.dataset.theme = o.theme === 'light' ? 'light' : 'dark';
    root.dataset.type = allMono ? 'mono' : 'sans';
    root.style.setProperty('--ks-sans', '"' + font[0] + '", "Helvetica Neue", Arial, sans-serif');
    root.style.setProperty('--ks-mono', '"' + mono[0] + '", ui-monospace, SFMono-Regular, Menlo, monospace');
    ['fg', 'dim', 'faint', 'accent', 'panel', 'line'].forEach(function (k) { root.style.setProperty('--ks-' + k, c[k]); });

    var head = +(params.get('head') || o.head || 0);
    var lines = ((head && K.headlines && K.headlines[head]) || o.headline || ['An AI agent', 'that works alongside you', 'in your DAW.']).slice();
    // how the headline is set: 'tri' (three lines: white, grey, accent), 'two' (the first two parts on one line, the payoff
    // below), 'one' (one flowing sentence), 'label' (the first part as a small label over a statement), 'giant' (the same,
    // the statement very large), 'weight' (three lines in one colour, light to bold)
    var headStyle = params.get('hs') || o.headStyle || 'tri';
    root.dataset.head = headStyle;
    if ((headStyle === 'label' || headStyle === 'giant') && lines.length === 3) {
      lines[1] = lines[1].replace(/^that /i, '');
      lines[1] = lines[1].charAt(0).toUpperCase() + lines[1].slice(1);
    }
    var top = el('header', 'ks-top');
    var mark = el('a', 'ks-mark', K.logoSVG({ rule: false, fill: 'currentColor' }));
    mark.href = K.links.github; mark.target = '_blank'; mark.rel = 'noopener'; mark.setAttribute('aria-label', 'kumi on GitHub');
    var links = el('nav', 'ks-links');
    links.innerHTML = '<a target="_blank" rel="noopener" href="' + K.links.github + '">' + K.icons.github + 'GitHub</a>' +
      '<a target="_blank" rel="noopener" href="' + K.links.discord + '">' + K.icons.discord + 'Discord</a>';
    top.appendChild(mark); top.appendChild(links);

    var hero = el('main', 'ks-hero');
    var kicker = el('p', 'ks-kicker'); kicker.textContent = o.kicker != null ? o.kicker : 'Ableton Live · REAPER · Renoise';
    var h1 = el('h1', 'ks-h1');
    lines.forEach(function (l, i) { var s = el('span', 'ks-l' + (i === lines.length - 1 ? 3 : i === 0 ? 1 : 2)); s.textContent = l; h1.appendChild(s); h1.appendChild(document.createTextNode(' ')); });
    var sub = el('p', 'ks-sub'); sub.textContent = o.sub || 'Kumi reads your project, changes almost anything in it, listens to the result and learns how you work. You ask in plain words; every step lands in its history with an undo.';
    var line = +(params.get('line') || o.line || 0);
    if (line && K.lines && K.lines[line]) sub.textContent = K.lines[line];
    var install = el('div', 'ks-install');
    install.innerHTML = '<div class="ks-tabs" role="tablist" aria-label="Your system"><button data-os="mac" role="tab">macOS / Linux</button><button data-os="win" role="tab">Windows</button><span data-shell></span></div>' +
      '<div class="ks-cmd"><span class="ks-prompt" aria-hidden="true">$</span><code data-cmd tabindex="0"></code><button class="ks-copy" data-copy aria-label="Copy the install command">Copy</button></div>' +
      '<p class="ks-after">Then follow Kumi’s guided setup.</p>';
    var dawStyle = o.daws || 'text';
    if (o.kicker !== false && dawStyle === 'text') hero.appendChild(kicker);
    hero.appendChild(h1); hero.appendChild(sub); hero.appendChild(install);

    // the demos: a numbered list ('list'), the same brighter and larger ('bright'), boxed buttons ('chips'),
    // or a row of abstract glyphs whose title shows on hover ('icons')
    root.dataset.demos = params.get('demos') || o.demoStyle || 'list';
    var demos = el('nav', 'ks-demos'); demos.setAttribute('aria-label', 'Demos');
    var demoName = el('span', 'ks-demo-name'); demoName.setAttribute('aria-hidden', 'true');
    function nameDemo(i) { var j = i >= 0 ? i : api.playing; demoName.textContent = j >= 0 ? K.demos[j].title : ''; demos.classList.toggle('has-name', j >= 0); }
    var buttons = K.demos.map(function (d, i) {
      var b = el('button', null, '<span class="g" aria-hidden="true">' + (d.glyph || '') + '</span><span class="n">' + String(i + 1).padStart(2, '0') + '</span><span class="t"></span>');
      b.querySelector('.t').textContent = d.title;
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', 'Play demo: ' + d.title);
      b.addEventListener('click', function (e) { e.stopPropagation(); if (api.playing === i) release(); else play(i); });
      b.addEventListener('pointerenter', function () { nameDemo(i); }); b.addEventListener('pointerleave', function () { nameDemo(-1); });
      b.addEventListener('focus', function () { nameDemo(i); }); b.addEventListener('blur', function () { nameDemo(-1); });
      demos.appendChild(b);
      return b;
    });
    demos.appendChild(demoName);
    var foot = el('footer', 'ks-foot'); foot.textContent = o.foot || 'Free and open source · MIT';
    var now = el('div', 'ks-now'); now.hidden = true;
    now.innerHTML = '<span class="n"></span><span class="t"></span><button class="ks-snd" aria-label="Sound"></button><button class="ks-x" aria-label="Back">✕</button>';
    var stage = el('div', 'ks-stage');
    var video = document.createElement('video');
    video.playsInline = true; video.setAttribute('playsinline', ''); video.preload = 'auto'; video.loop = true;
    if (o.stage === 'panel') stage.appendChild(video);

    root.appendChild(stage); root.appendChild(top); root.appendChild(hero); root.appendChild(demos); root.appendChild(foot); root.appendChild(now);
    document.body.appendChild(root);
    K.wireInstall(install);
    // squares join the words: on phones beside the logos, in the bottom layout in the install's column above it.
    // While a demo plays they stay, so another can be picked; the rest of the words step back.
    var placeDemos = function () {
      var inHero = root.dataset.demos === 'squares' && (innerWidth <= 820 || root.dataset.layout === 'bottom');
      if (inHero && demos.parentNode !== hero) hero.appendChild(demos);
      else if (!inHero && demos.parentNode !== root) root.insertBefore(demos, foot);
      hero.classList.toggle('has-demos', inHero);
    };
    placeDemos();
    addEventListener('resize', placeDemos);
    // 'one': the line under the headline takes the headline's measure, so the two end at the same right edge
    if (headStyle === 'one') {
      var measure = function () {
        sub.style.maxWidth = '';
        if (innerWidth <= 820) return;
        var r = document.createRange(); r.selectNodeContents(h1);
        var w = r.getBoundingClientRect().width;
        if (w > 0) sub.style.maxWidth = Math.ceil(w) + 'px';
      };
      measure();
      addEventListener('resize', measure);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    }
    if (dawStyle !== 'text') mountDaws(dawStyle, o, root, hero, top, foot);

    var snd = now.querySelector('.ks-snd');
    function sndLabel() { snd.innerHTML = video.muted ? K.icons.mute : K.icons.sound; snd.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off'); }
    snd.addEventListener('click', function (e) { e.stopPropagation(); video.muted = !video.muted; if (!video.muted) video.play().catch(function () {}); sndLabel(); });
    now.querySelector('.ks-x').addEventListener('click', function (e) { e.stopPropagation(); release(); });

    function play(i) {
      var d = K.demos[i];
      if (video.getAttribute('src') !== d.src) { video.src = d.src; }
      video.currentTime = 0;
      video.muted = false;
      video.play().catch(function () { video.muted = true; video.play().catch(function () {}); sndLabel(); });
      api.playing = i;
      root.classList.add('is-playing');
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      now.querySelector('.n').textContent = String(i + 1).padStart(2, '0');
      now.querySelector('.t').textContent = d.title;
      now.hidden = false;
      sndLabel();
      nameDemo(-1);
      if (o.onDemo) o.onDemo(i, d, video);
    }
    function release() {
      if (api.playing < 0) return;
      api.playing = -1;
      video.pause();
      root.classList.remove('is-playing');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      now.hidden = true;
      nameDemo(-1);
      if (o.onRelease) o.onRelease();
    }
    // Anywhere that is not a control brings the visual back (a drag does not).
    var down = null;
    addEventListener('pointerdown', function (e) { down = [e.clientX, e.clientY]; }, true);
    addEventListener('click', function (e) {
      if (api.playing < 0) return;
      if (e.target.closest && e.target.closest('a, button, code, .ks-install, .ks-demos, .ks-now, .ks-stage video')) return;
      if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
      release();
    }, true);
    addEventListener('keydown', function (e) { if (e.key === 'Escape') release(); });

    var api = { root: root, video: video, playing: -1, play: play, release: release, colors: c, font: font[0], mono: mono[0] };
    return api;
  }

  window.KumiShell = { mount: mount, fonts: Object.keys(FONTS), monos: Object.keys(MONOS) };
})();
