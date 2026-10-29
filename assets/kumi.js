/* Kumi site lab kit: the page content every candidate shares, plus small helpers.
   Load with <script src="../kit/kumi.js"></script> before your own scripts; it defines window.KUMI. */
(function () {
  'use strict';
  var here = document.currentScript && document.currentScript.src ? document.currentScript.src : location.href;
  var media = new URL('../media/', here).href;

  var LOGO = {"word":[[0,0,24,12],[336,0,24,12],[0,12,24,12],[0,24,24,12],[48,24,24,12],[96,24,24,12],[144,24,24,12],[192,24,108,12],[336,24,24,12],[0,36,24,12],[36,36,24,12],[96,36,24,12],[144,36,24,12],[192,36,24,12],[240,36,24,12],[288,36,24,12],[336,36,24,12],[0,48,48,12],[96,48,24,12],[144,48,24,12],[192,48,24,12],[240,48,24,12],[288,48,24,12],[336,48,24,12],[0,60,24,12],[36,60,24,12],[96,60,24,12],[144,60,24,12],[192,60,24,12],[240,60,24,12],[288,60,24,12],[336,60,24,12],[0,72,24,12],[48,72,24,12],[108,72,60,12],[192,72,24,12],[240,72,24,12],[288,72,24,12],[336,72,24,12]],"rule":[[36,120,288,24],[0,120,6,6],[6,132,6,6],[12,120,6,6],[18,126,6,6],[12,132,6,6],[18,138,6,6],[24,120,6,6],[24,126,6,6],[24,138,6,6],[30,126,6,6],[30,132,6,6],[30,138,6,6],[330,120,6,6],[330,126,6,6],[330,138,6,6],[324,126,6,6],[324,132,6,6],[324,138,6,6],[342,120,6,6],[336,126,6,6],[342,132,6,6],[336,138,6,6],[354,120,6,6],[348,132,6,6]]}; // rects [x, y, w, h] from docs/assets/kumi-logo.svg (viewBox 0 0 360 144)

  var DEMOS = [
    { id: 'loop', title: 'An Autechre-style loop', ask: 'I’m a huge fan of Autechre. Make me an 8 bar loop that sounds like LCC.', src: 'demo-1.mp4', poster: 'demo-1.jpg', real: true },
    { id: 'tutorial', title: 'Build a sound from a tutorial', ask: 'Watch this video and build the bass it makes on a new track.', src: 'demo-2.mp4', poster: 'demo-2.jpg' },
    { id: 'mix', title: 'Fix the mix', ask: 'Is the bass muddy?', src: 'demo-3.mp4', poster: 'demo-3.jpg' },
    { id: 'reference', title: 'Match a reference', ask: 'Make the drums hit like this track.', src: 'demo-4.mp4', poster: 'demo-4.jpg' },
    { id: 'device', title: 'Make a device', ask: 'Build me a Max for Live delay that stutters on the off-beats.', src: 'demo-5.mp4', poster: 'demo-5.jpg' },
    { id: 'sounds', title: 'Find your sounds', ask: 'A dusty snare like this one, from my own samples.', src: 'demo-6.mp4', poster: 'demo-6.jpg' }
  ];
  DEMOS.forEach(function (d) { d.src = media + d.src; d.poster = media + d.poster; });
  // an abstract glyph per demo (20x20, currentColor), for the shell's 'icons' demo style
  var G = function (inner) { return '<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; };
  var DOT = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 1.25) + '" fill="currentColor" stroke="none"/>'; };
  [
    G('<circle cx="10" cy="10" r="6.2"/>' + DOT(16.2, 10, 1.7)),
    G('<rect x="3" y="4.5" width="14" height="11" rx="1.2"/><path d="M8.6 7.7l3.6 2.3-3.6 2.3z" fill="currentColor" stroke="none"/>'),
    G('<path d="M4 6h12M6.5 10h7M3 14h14"/>'),
    G('<circle cx="8" cy="10" r="4.6"/><circle cx="12" cy="10" r="4.6"/>'),
    G('<path d="M10 3.4l6.6 6.6-6.6 6.6-6.6-6.6z"/>' + DOT(10, 10, 1.5)),
    G(DOT(4.6, 5.6) + DOT(14.8, 4.8) + DOT(5.4, 15) + DOT(15.4, 14.6) + '<circle cx="10.4" cy="10" r="3.1"/>' + DOT(10.4, 10, 1))
  ].forEach(function (g, i) { DEMOS[i].glyph = g; });

  var ICONS = {
    github: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="currentColor"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.86-.61 1.25a18.27 18.27 0 0 0-5.49 0 12.64 12.64 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13c.13-.09.25-.19.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01c.12.1.25.2.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.23 1.99a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z"/></svg>',
    copy: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5.5" y="5.5" width="8" height="8" rx="1"/><path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/></svg>',
    check: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8.5l3 3 7-7"/></svg>',
    sound: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" fill="currentColor"><path d="M2 6h3l4-3v10L5 10H2z"/><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.8a6 6 0 0 1 0 8.4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
    mute: '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" fill="currentColor"><path d="M2 6h3l4-3v10L5 10H2z"/><path d="M11 6l4 4M15 6l-4 4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>'
  };

  function os() {
    var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
    return /win/i.test(p) ? 'win' : 'mac';
  }

  // Copy text from inside a click handler. Falls back to selecting `selectEl` so the visitor can press Cmd/Ctrl+C.
  function copy(text, button, selectEl) {
    var done = function (ok) {
      if (button) {
        if (!button.hasAttribute('data-label')) button.setAttribute('data-label', button.innerHTML);
        button.innerHTML = ok ? (button.getAttribute('data-copied') || 'Copied') : (os() === 'win' ? 'Press Ctrl+C' : 'Press ⌘C');
        button.classList.add(ok ? 'is-copied' : 'is-select');
        clearTimeout(button._kumiT);
        button._kumiT = setTimeout(function () {
          button.innerHTML = button.getAttribute('data-label');
          button.classList.remove('is-copied', 'is-select');
        }, 1600);
      }
      if (!ok && selectEl) {
        var r = document.createRange();
        r.selectNodeContents(selectEl);
        var s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
      }
      return ok;
    };
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return done(ok);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function () { return done(true); }, fallback);
      }
    } catch (e) { /* fall through */ }
    return Promise.resolve(fallback());
  }

  // Wires an install widget. Inside `root`:
  //   [data-os="mac"|"win"]  tabs that switch the command (get aria-selected and .is-on)
  //   [data-cmd]             elements whose text becomes the current command
  //   [data-shell]           elements whose text becomes "Terminal" or "PowerShell"
  //   [data-oslabel]         elements whose text becomes "macOS / Linux" or "Windows"
  //   [data-copy]            buttons that copy the current command
  // root.dataset.os holds the current choice. Returns { set(os), get(), cmd() }.
  function wireInstall(root, opts) {
    opts = opts || {};
    var cur = opts.os || os();
    var q = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
    function set(o) {
      cur = o === 'win' ? 'win' : 'mac';
      root.dataset.os = cur;
      var it = INSTALL[cur];
      q('[data-os]').forEach(function (b) {
        var on = b.getAttribute('data-os') === cur;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.classList.toggle('is-on', on);
      });
      q('[data-cmd]').forEach(function (el) { el.textContent = it.cmd; });
      q('[data-shell]').forEach(function (el) { el.textContent = it.shell; });
      q('[data-oslabel]').forEach(function (el) { el.textContent = it.label; });
      if (opts.onChange) opts.onChange(cur, it);
    }
    q('[data-os]').forEach(function (b) {
      b.addEventListener('click', function () { set(b.getAttribute('data-os')); });
    });
    q('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var target = root.querySelector('[data-cmd]');
        copy(INSTALL[cur].cmd, b, target);
        if (opts.onCopy) opts.onCopy(cur);
      });
    });
    set(cur);
    return { set: set, get: function () { return cur; }, cmd: function () { return INSTALL[cur].cmd; } };
  }

  // The pixel wordmark as SVG markup. opts: { fill, rule (bar under the word), ruleFill, className }
  function logoSVG(opts) {
    opts = opts || {};
    var fill = opts.fill || 'currentColor';
    var withRule = opts.rule !== false;
    var h = withRule ? 144 : 84;
    var r = function (a) { return '<rect x="' + a[0] + '" y="' + a[1] + '" width="' + a[2] + '" height="' + a[3] + '"/>'; };
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ' + h + '" role="img" aria-label="kumi"' +
      (opts.className ? ' class="' + opts.className + '"' : '') + ' shape-rendering="crispEdges">' +
      '<g fill="' + fill + '">' + LOGO.word.map(r).join('') + '</g>' +
      (withRule ? '<g fill="' + (opts.ruleFill || fill) + '" opacity="' + (opts.ruleFill ? 1 : 0.45) + '">' + LOGO.rule.map(r).join('') + '</g>' : '') +
      '</svg>';
  }

  // The word part of the logo as a 30x7 grid of 0/1 (12px cells), for building it out of anything.
  var GRID = (function () {
    var g = [];
    for (var y = 0; y < 7; y++) { g.push(new Array(30).fill(0)); }
    LOGO.word.forEach(function (a) {
      for (var x = a[0] / 12; x < (a[0] + a[2]) / 12; x++)
        for (var y = a[1] / 12; y < (a[1] + a[3]) / 12; y++) g[y][x] = 1;
    });
    return g;
  })();

  // Draws the wordmark into a new canvas: logoCanvas({ cell: 8, fill: '#fff', pad: 0, rule: false })
  function logoCanvas(opts) {
    opts = opts || {};
    var cell = opts.cell || 8, pad = opts.pad || 0, s = cell / 12;
    var h = opts.rule ? 144 : 84;
    var c = document.createElement('canvas');
    c.width = Math.round(360 * s + pad * 2);
    c.height = Math.round(h * s + pad * 2);
    var x = c.getContext('2d');
    x.fillStyle = opts.fill || '#fff';
    LOGO.word.forEach(function (a) { x.fillRect(pad + a[0] * s, pad + a[1] * s, a[2] * s, a[3] * s); });
    if (opts.rule) LOGO.rule.forEach(function (a) { x.fillRect(pad + a[0] * s, pad + a[1] * s, a[2] * s, a[3] * s); });
    return c;
  }

  // A muted, looping, inline <video> for a demo. Call el.play() yourself (or pass autoplay: true).
  function video(demo, opts) {
    opts = opts || {};
    var v = document.createElement('video');
    v.muted = opts.muted !== false;
    v.defaultMuted = v.muted;
    v.loop = opts.loop !== false;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('muted', '');
    v.preload = opts.preload || 'metadata';
    if (opts.poster !== false) v.poster = demo.poster;
    if (opts.crossOrigin) v.crossOrigin = opts.crossOrigin;
    v.src = demo.src;
    if (opts.autoplay) { v.autoplay = true; v.play().catch(function () {}); }
    return v;
  }

  // The DAWs Kumi works in, as single-colour marks traced from each maker's own logo.
  // vb is the mark's box in its path's units; h its height in a row, relative to the others, so the three look the same size.
  var DAWS = [
    { id: 'live', name: 'Ableton Live', ver: '12', h: 0.66, vb: [0, 0, 45, 21],
      d: 'M0 0h3v21H0zM6 0h3v21H6zM12 0h3v21h-3zM18 0h3v21h-3zM24 18h21v3H24zM24 12h21v3H24zM24 6h21v3H24zM24 0h21v3H24z' },
    { id: 'reaper', name: 'REAPER', ver: '7+', h: 1, rule: 'evenodd', vb: [127.35, 0, 405.05, 431.08],
      d: "M 329.88,0 C 274.35,0 127.35,31 127.35,161.45 127.35,280.92 263.82,431.08 329.88,431.08 395.93,431.08 532.4,280.77 532.4,161.45 532.55,30.84 385.4,0 329.88,0 Z M 293.46,162.95 c 0,0 -0.15,-0.15 0,0 -1.05,-1.05 -1.96,-1.96 -2.71,-2.71 l -0.15,-0.15 c -13.39,-13.54 -24.83,-29.19 -33.7,-46.34 27.23,-13.09 57.78,-20.46 89.98,-20.46 50.26,0 96.15,17.75 132.11,47.4 C 433.09,96.75 370.95,69.82 302.49,69.82 c -20.76,0 -40.93,2.41 -60.34,7.22 -14.29,3.46 -27.99,8.12 -41.23,13.84 3.31,7.97 7.07,15.8 11.13,23.47 3.61,6.62 7.52,13.09 11.74,19.26 11.29,16.7 24.83,31.75 39.87,44.99 0.15,0.15 0.45,0.45 0.6,0.6 0.75,0.6 1.35,1.2 2.11,1.81 0,0 0,0 0.15,0.15 40.02,35.21 65.3,86.82 65.3,144.29 0,23.17 -4.06,45.44 -11.59,66.05 17.15,-28.29 26.93,-61.39 26.93,-96.9 0,-26.48 -5.42,-51.61 -15.35,-74.33 -9.18,-21.67 -22.27,-40.93 -38.37,-57.33 z" },
    { id: 'renoise', name: 'Renoise', ver: '3.5+', h: 1.04, rule: 'evenodd', vb: [486.05, 147.74, 101.46, 104.24],
      d: "m486.05,209.29,0,1.06c0,2.25,1.49,4.35,2.44,5.86l3.21,5.26,2.29-23.99-4.52,5.36c-1.28,1.72-3.42,3.62-3.42,6.46zM500.52,189.71l4.04-0.35-2.81,41.48-4.94-0.73,9.48,16.26c1.62,2.78,3.87,5.49,6.57,5.61h0.35c2.27-0.36,4.46-2.16,5.5-3.5l13.2-13.79-0.54,0.04-13.98-1.81,0.4-17.99c-0.2-2.12-3.28-1.89-4.52-1.88l-6.08-0.06-1.9,0,0.49-8.49,9.01-0.31c1.89-0.07,3.35-0.55,3.35-3.02v-3.17c0-1.72-1.54-2.42-3.52-2.25l-8.29,0.67,0.35-7.42,16.77-2.1h2.29c1.79,0,3.87,1.92,4.72,3.04,1.27,1.68,1.46,3.42,1.46,6.3,0,8.2,0.79,6.96-2.82,12.35,1.08,1.61,1.99,1.92,2.71,4.34,0.65,2.19,0.64,3.85,0.64,6.59,0,4.95,0.18,9.32,0.18,14.29l51.74-52.7c1.66-1.69,3.14-3.83,3.14-5.86v-0.35c0-3.53-2.83-5.72-5.85-7.18l-38.5-18.68c-1.36-0.66-2.66-1.3-4.18-1.3-5.05,0-8.64,5.9-11.16,8.95l-27.3,33.03" }
  ];

  // A DAW's mark as SVG markup, as tall as the text around it (1em) times its h. opts: { className, title }
  function dawSVG(i, opts) {
    opts = opts || {};
    var m = DAWS[i];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + m.vb.join(' ') + '" style="height:' + m.h + 'em;width:auto"' +
      (opts.className ? ' class="' + opts.className + '"' : '') + ' role="img" aria-label="' + (opts.title || m.name) + '">' +
      '<path fill="currentColor"' + (m.rule ? ' fill-rule="' + m.rule + '"' : '') + ' d="' + m.d + '"/></svg>';
  }

  // A DAW's mark drawn white on transparent into a size x size canvas, centred and fitted to `fill` of it,
  // for building it out of points. opts: { size: 256, fill: 0.86, color: '#fff' }
  function dawMask(i, opts) {
    opts = opts || {};
    var m = DAWS[i], size = opts.size || 256, fill = opts.fill || 0.86;
    var c = document.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d');
    var s = size * fill / Math.max(m.vb[2], m.vb[3]);
    x.translate(size / 2, size / 2); x.scale(s, s); x.translate(-m.vb[0] - m.vb[2] / 2, -m.vb[1] - m.vb[3] / 2);
    x.fillStyle = opts.color || '#fff';
    x.fill(new Path2D(m.d), m.rule || 'nonzero');
    return c;
  }

  var INSTALL = {
    mac: { label: 'macOS / Linux', shell: 'Terminal', cmd: 'curl -fsSL https://github.com/user1303836/kumi/releases/latest/download/install.sh | sh' },
    win: { label: 'Windows', shell: 'PowerShell', cmd: 'irm https://github.com/user1303836/kumi/releases/latest/download/install.ps1 | iex' }
  };

  window.KUMI = {
    name: 'kumi',
    pitch: 'Kumi is a general-purpose AI agent that works alongside you in your DAW.',
    pitchShort: 'An AI agent that works alongside you in your DAW.',
    sub: 'It reads your project, changes almost anything in it, listens to the result and learns your sounds, your taste and your habits. Ask in plain words: Kumi plans the change, makes it, and lists every step in its history with an undo.',
    subShort: 'It reads your project, changes almost anything in it, listens to the result and learns how you work.',
    // Candidate headlines (three lines: white, grey, accent), for comparing in place: ?head=n (0 = the page's own).
    headlines: [
      null,
      ['An AI agent', 'that works with you', 'and learns your taste.'],
      ['An AI agent', 'that learns your taste', 'the longer you use it.'],
      ['An AI agent', 'that riffs with you', 'and learns your ear.'],
      ['An AI agent', 'in your studio,', 'tuned to you.'],
      ['An AI agent', 'that keeps up with you', 'and learns how you work.'],
      ['An AI agent', 'that hands you ideas', 'and learns your taste.'],
      ['An AI agent', 'shaped by your taste,', 'session after session.'],
      ['An AI agent', 'that takes the busywork', 'and learns your taste.'],
      ['The more you use it,', 'the more it works', 'like you.'],
      ['An AI agent', 'that gets you to the idea', 'faster.'],
      ['An AI agent', 'that gets you from idea', 'to sound, faster.'],
      ['An AI agent', 'that skips you ahead', 'to the good part.'],
      ['An AI agent', 'that keeps you', 'in the idea.'],
      ['An AI agent', 'that gets you back', 'to the music.'],
      ['An AI agent in your DAW,', 'shaped by your taste,', 'session after session.'],
      ['An AI agent for your DAW,', 'shaped by your taste,', 'session after session.'],
      ['Your DAW’s AI agent,', 'shaped by your taste,', 'session after session.'],
      ['An AI agent in your DAW.', 'Shaped by your taste,', 'session after session.'],
      ['An AI agent in your DAW', 'that learns your taste,', 'session after session.'],
      ['Inside your DAW, an AI agent', 'shaped by your taste,', 'session after session.'],
      // 21–25 (2026-10-29): "Kumi is …" and "uniquely yours"; one string each, *starred* = accent
      'Kumi is an AI agent that works in your DAW. It becomes uniquely yours, shaped by your taste and workflow, *session after session.*',
      'Kumi is an AI agent that works in your DAW. It becomes *uniquely yours*, shaped by your taste and workflow, session after session.',
      'Kumi is an AI agent that works in your DAW, and it’s *uniquely yours*: shaped by your taste and the way you work, session after session.',
      'Kumi is an AI agent that works in your DAW. It’s uniquely yours, shaped by your taste and workflow, *session after session.*',
      'Kumi is an AI agent that works in your DAW and *becomes yours*, shaped by your taste and workflow, session after session.',
      // 26–29: the same wordings with no highlight (A, C, D, E)
      'Kumi is an AI agent that works in your DAW. It becomes uniquely yours, shaped by your taste and workflow, session after session.',
      'Kumi is an AI agent that works in your DAW, and it’s uniquely yours: shaped by your taste and the way you work, session after session.',
      'Kumi is an AI agent that works in your DAW. It’s uniquely yours, shaped by your taste and workflow, session after session.',
      'Kumi is an AI agent that works in your DAW and becomes yours, shaped by your taste and workflow, session after session.',
      // 30–34 (F–J): "… for your DAW that’s uniquely yours." and how it grows with you
      'Kumi is an AI agent for your DAW that’s uniquely yours. It grows with you, shaped by your taste, session after session.',
      'Kumi is an AI agent for your DAW that’s uniquely yours. It learns your taste and grows with you, session after session.',
      'Kumi is an AI agent for your DAW that’s uniquely yours. The longer you work together, the more it works like you.',
      'Kumi is an AI agent for your DAW that’s uniquely yours. Every session, it learns a little more of your taste.',
      'Kumi is an AI agent for your DAW that’s uniquely yours, and it grows with your taste, session after session.'
    ],
    // Candidate lines under the headline, for comparing in place: a page shows lines[n] with ?line=n (0 = its own).
    lines: [
      '',
      'Ask for the sound in your head, a mix like a track you love, or the patch from a tutorial. Kumi builds it in your project and listens until it’s right.',
      'It listens. Kumi hears your mix, your references and its own changes, and keeps only the ones that make the track better.',
      'Name an artist, paste a tutorial, point at a track you love. Kumi builds it in your session, checks it by ear and learns your taste as it goes.',
      'Sounds, fixes, loops, whole devices: Kumi makes them in your project from a sentence, listens to what it made, and remembers what you keep.',
      'Describe it the way you’d tell a friend. Kumi makes the real changes in your project, hears whether they worked, and learns how you like things done.'
    ],
    daws: ['Ableton Live', 'REAPER', 'Renoise'],
    dawMarks: DAWS,
    dawSVG: dawSVG,
    dawMask: dawMask,
    license: 'Free and open source (MIT)',
    after: 'Then follow Kumi’s guided setup. Next time, just type kumi.',
    install: INSTALL,
    links: {
      github: 'https://github.com/user1303836/kumi',
      discord: 'https://discord.gg/5vFA5n7um',
      guide: 'https://github.com/user1303836/kumi/blob/main/docs/en/KUMI_GUIDE.md',
      releases: 'https://github.com/user1303836/kumi/releases/latest'
    },
    demos: DEMOS,
    media: media,
    icons: ICONS,
    logo: LOGO,
    grid: GRID,
    logoSVG: logoSVG,
    logoCanvas: logoCanvas,
    os: os,
    copy: copy,
    wireInstall: wireInstall,
    video: video,
    reducedMotion: function () { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  };
})();
