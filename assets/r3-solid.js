/* kumi-web2's round-3 helpers for the Solid Light variants (52b–52f). Load after kit/shell.js.

   Layout   SL.stage(aspect)       the largest rectangle of that aspect (default 16:9) clear of the shell's controls, CSS px: { x, y, w, h }
            SL.aspect(video)       the video's width / height once known, else 16:9
            SL.box(el, pad)        an element's rectangle grown by pad, CSS px: { x, y, w, h } (null when hidden)
            SL.hero()              the shell's words (logos above the headline, headline, sub, install) as one rectangle
            SL.phone(), SL.toTop() the stacked phone layout is on; scroll back up so the picture is in view
   Time     SL.loop(fn(t, dt)), SL.approach(v, to, k, dt), SL.ready(video), SL.reduced()
   WebGL2   SL.prog(gl, vs, fs), SL.vao(gl, data, index), SL.sheet(NS, NR), SL.persp(aspect, tan), SL.tex(gl),
            SL.upload(gl, tex, video) (flipped, so uv (0,0) is the picture's bottom left), SL.target(gl, w, h, half)
   Logos    SL.outline(i, n)       DAW mark i as one path of n points: { xy: Float32Array(2n), pen: Float32Array(n) }, centred,
                                   height 1 (times the mark's optical size), y up; pen is 0 where the path jumps between contours */
(function () {
  'use strict';
  function phone() { return innerWidth <= 820; }
  function q(sel) { return document.querySelector(sel); }
  function box(el, pad) {
    if (!el) return null;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    pad = pad || 0;
    return { x: r.left - pad, y: r.top - pad, w: r.width + 2 * pad, h: r.height + 2 * pad };
  }
  function union(list) {
    var a = list.filter(Boolean);
    if (!a.length) return null;
    var x0 = Math.min.apply(null, a.map(function (b) { return b.x; })), y0 = Math.min.apply(null, a.map(function (b) { return b.y; }));
    var x1 = Math.max.apply(null, a.map(function (b) { return b.x + b.w; })), y1 = Math.max.apply(null, a.map(function (b) { return b.y + b.h; }));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function hero() {
    return union(['.ks-hero > .ks-daws', '.ks-kicker', '.ks-h1', '.ks-sub', '.ks-install'].map(function (s) { return box(q(s)); }));
  }
  function fit(r, ar) {
    if (!r || r.w < 40 || r.h < 40) return null;
    var w = Math.min(r.w, r.h * ar), h = w / ar;
    return { x: r.x + (r.w - w) / 2, y: r.y + (r.h - h) / 2, w: w, h: h };
  }
  function aspect(v) { return v && v.videoWidth > 0 && v.videoHeight > 0 ? v.videoWidth / v.videoHeight : 16 / 9; }
  function stage(ar) {
    ar = ar > 0.2 && ar < 5 ? ar : 16 / 9;
    var W = innerWidth, H = innerHeight;
    var top = box(q('.ks-top'));
    var y0 = (top ? top.y + top.h : 60) + (phone() ? 16 : 22);
    if (phone()) {
      var pw = W - 32;
      return { x: 16, y: Math.max(y0, 64), w: pw, h: pw / ar };
    }
    var padX = Math.max(18, Math.min(72, W * 0.042)), padY = Math.max(16, Math.min(34, H * 0.034));
    var now = box(q('.ks-now'));
    var y1 = (now ? now.y : H - padY - 36) - 16;
    var F = { x: padX, y: y0, w: W - 2 * padX, h: y1 - y0 };
    var D = box(q('.ks-demos'), 18);
    var cands = [];
    if (!D) cands.push(F);
    else {
      if (D.y > F.y + 40) cands.push({ x: F.x, y: F.y, w: F.w, h: Math.min(y1, D.y) - F.y });
      if (D.y + D.h < y1 - 40) cands.push({ x: F.x, y: Math.max(F.y, D.y + D.h), w: F.w, h: y1 - Math.max(F.y, D.y + D.h) });
      if (D.x > F.x + 200) cands.push({ x: F.x, y: F.y, w: D.x - F.x, h: F.h });
      if (D.x + D.w < F.x + F.w - 200) cands.push({ x: D.x + D.w, y: F.y, w: F.x + F.w - D.x - D.w, h: F.h });
    }
    var best = null;
    cands.forEach(function (c) { var r = fit(c, ar); if (r && (!best || r.w * r.h > best.w * best.h)) best = r; });
    return best || fit(F, ar) || { x: W * 0.15, y: H * 0.15, w: W * 0.7, h: W * 0.7 / ar };
  }
  function loop(fn) {
    var last = performance.now(), t0 = last;
    function f(now) {
      requestAnimationFrame(f);
      if (document.hidden) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fn((now - t0) / 1000, dt);
    }
    requestAnimationFrame(f);
  }
  function approach(v, to, k, dt) { return to + (v - to) * Math.exp(-k * dt); }
  function ready(v) { return !!v && v.readyState >= 2 && v.videoWidth > 0; }
  function reduced() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function toTop() { if (phone() && scrollY > 0) scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); }

  function prog(gl, vs, fs) {
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
    return { p: p, u: u };
  }
  function vao(gl, data, index) {
    var o = gl.createVertexArray(); gl.bindVertexArray(o);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    if (index) { var e = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, e); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW); }
    gl.bindVertexArray(null); return o;
  }
  // A ruled sheet: NS columns along the drawing (a.x = s in 0..1), NR rows from the projector (a.y = r, denser near it)
  function sheet(NS, NR) {
    var verts = new Float32Array(NS * NR * 2), idx = new Uint32Array((NS - 1) * (NR - 1) * 6), vi = 0, ii = 0;
    for (var r = 0; r < NR; r++) for (var s = 0; s < NS; s++) { verts[vi++] = s / (NS - 1); verts[vi++] = Math.pow(r / (NR - 1), 0.8); }
    for (r = 0; r < NR - 1; r++) for (s = 0; s < NS - 1; s++) { var i0 = r * NS + s; idx.set([i0, i0 + 1, i0 + NS, i0 + 1, i0 + NS + 1, i0 + NS], ii); ii += 6; }
    return { verts: verts, idx: idx };
  }
  function persp(aspect, tan) {
    var f = 1 / tan, n = 0.05, fa = 60;
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, 2 * fa * n / (n - fa), 0]);
  }
  function params(gl, filter) {
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(function (p) { gl.texParameteri(gl.TEXTURE_2D, p, filter || gl.LINEAR); });
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(function (p) { gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE); });
  }
  function tex(gl) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    params(gl);
    return t;
  }
  function upload(gl, t, video) {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video); } catch (e) {}
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }
  // A light buffer to draw into (fb) and read from (tex). With samples > 1 it is multisampled where the format allows,
  // so the sheets' one-pixel silhouettes stay smooth; call resolve() after drawing.
  function target(gl, w, h, half, samples) {
    var fmt = half ? gl.RGBA16F : gl.RGBA8;
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt, w, h, 0, gl.RGBA, half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    params(gl);
    var fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    var ms = null, rb = null, n = 0;
    try {
      var sup = gl.getInternalformatParameter(gl.RENDERBUFFER, fmt, gl.SAMPLES) || [];
      for (var i = 0; i < sup.length; i++) if (sup[i] <= (samples || 0) && sup[i] > n) n = sup[i];
    } catch (e) { n = 0; }
    if (n > 1) {
      rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, n, fmt, w, h);
      ms = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, ms); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { gl.deleteFramebuffer(ms); gl.deleteRenderbuffer(rb); ms = rb = null; }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return {
      tex: t, fb: ms || fb, w: w, h: h, samples: ms ? n : 1,
      resolve: function () {
        if (!ms) return;
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, ms); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fb);
        gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
      },
      free: function () { gl.deleteTexture(t); gl.deleteFramebuffer(fb); if (ms) { gl.deleteFramebuffer(ms); gl.deleteRenderbuffer(rb); } }
    };
  }

  // A DAW's mark as one path through all its contours, resampled to n points by arc length.
  // Each contour is entered and left by a pen-up point at the same place, so the jump between contours draws nothing.
  function outline(i, n) {
    var m = KUMI.dawMarks[i], NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', m.d);
    svg.appendChild(path); document.body.appendChild(svg);
    var L = path.getTotalLength(), F = n * 8, step = L / F, subs = [], cur = null, prev = null;
    for (var j = 0; j <= F; j++) {
      var p = path.getPointAtLength(Math.min(L, j * step)), d = prev ? Math.hypot(p.x - prev.x, p.y - prev.y) : Infinity;
      if (d > step * 4) { cur = { pts: [[p.x, p.y]], acc: [0] }; subs.push(cur); }
      else { cur.pts.push([p.x, p.y]); cur.acc.push(cur.acc[cur.acc.length - 1] + d); }
      prev = p;
    }
    document.body.removeChild(svg);
    subs = subs.filter(function (s) { return s.acc[s.acc.length - 1] > step * 3; });
    // share the n points by length (each contour gets two pen-up points and at least three drawn)
    var K = subs.length, free = n - 2 * K, total = subs.reduce(function (a, s) { return a + s.acc[s.acc.length - 1]; }, 0);
    var share = subs.map(function (s) { var x = Math.max(3, free * s.acc[s.acc.length - 1] / total); return { n: Math.floor(x), r: x - Math.floor(x) }; });
    var left = free - share.reduce(function (a, s) { return a + s.n; }, 0);
    share.map(function (s, k) { return k; }).sort(function (a, b) { return share[b].r - share[a].r; }).forEach(function (k) { if (left > 0) { share[k].n++; left--; } });
    while (left < 0) { var big = share.reduce(function (b, s, k) { return s.n > share[b].n ? k : b; }, 0); share[big].n--; left++; }
    var xy = new Float32Array(n * 2), pen = new Float32Array(n), o = 0;
    var cx = m.vb[0] + m.vb[2] / 2, cy = m.vb[1] + m.vb[3] / 2, sc = m.h / m.vb[3];
    function put(x, y, pn) { if (o >= n) return; xy[o * 2] = (x - cx) * sc; xy[o * 2 + 1] = -(y - cy) * sc; pen[o] = pn; o++; }
    subs.forEach(function (s, k) {
      var cnt = share[k].n, len = s.acc[s.acc.length - 1], seg = 0;
      put(s.pts[0][0], s.pts[0][1], 0);
      for (var c = 0; c < cnt; c++) {
        var at = len * c / Math.max(1, cnt - 1);
        while (seg < s.acc.length - 2 && s.acc[seg + 1] < at) seg++;
        var a = s.acc[seg], b = s.acc[seg + 1], f = b > a ? (at - a) / (b - a) : 0;
        put(s.pts[seg][0] + (s.pts[seg + 1][0] - s.pts[seg][0]) * f, s.pts[seg][1] + (s.pts[seg + 1][1] - s.pts[seg][1]) * f, 1);
      }
      var e = s.pts[s.pts.length - 1];
      put(e[0], e[1], 0);
    });
    while (o < n) { xy[o * 2] = xy[o * 2 - 2]; xy[o * 2 + 1] = xy[o * 2 - 1]; pen[o] = 0; o++; }
    return { xy: xy, pen: pen };
  }

  window.SL = {
    stage: stage, aspect: aspect, box: box, union: union, hero: hero, phone: phone, toTop: toTop,
    loop: loop, approach: approach, ready: ready, reduced: reduced,
    prog: prog, vao: vao, sheet: sheet, persp: persp, tex: tex, upload: upload, target: target, outline: outline
  };
})();
