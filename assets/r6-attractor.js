/* KumiAttractor (round 4): a million points on a strange attractor that morphs from one attractor to the next,
   unravels into a flat video when asked, and gathers into a DAW's logo while that logo is hovered.
   Round 4 adds `morphWhileLogo`: the points that stay behind keep morphing while a logo shows.
   Round 6 adds ten more attractors (the pages show fifteen of the seventeen), `shuffle`, the 'custom' rhythm (`holds`, `morphs`) and
   `flow`: every shape's points move at the same speed, times `flow`. A fresh simulation is seeded across its shape's
   own extent and settles at a larger step before it shows, so a new shape arrives formed.

   const a = KumiAttractor(canvas, {
     bg: [0.94, 0.93, 0.90],          // clear colour
     blend: 'multiply' | 'add' | 'alpha',
     ink: 'video' | 'mono' | 'heat' | 'depth' | 'glow',   // how points are coloured while they are a shape
                                      //   glow: the demo's colours lifted out of a haze of color2, like 39c
     color: [r, g, b], color2: [r, g, b],         // for mono / heat / depth
     alpha: 0.5,                      // point opacity (alpha / add)
     sequence: ['aizawa', 'thomas', 'halvorsen', 'fourwing'],   // any of TYPES' names
     shuffle: false,                  // true: a random order, every shape once before any comes back, never one twice running
     rhythm: 'steady',                // how morphs are timed:
                                      //   steady   hold `hold` s, morph over `morph` s, again and again (round 2)
                                      //   varied   holds of 2.5–16 s and morphs of 1–11 s, each drawn anew
                                      //   hesitant sometimes starts to morph, stops partway, falls back, then goes
                                      //   sudden   long stillness, then a morph in under a second (now and then two in a row)
                                      //   restless short holds and quick morphs
                                      //   slow     very long holds and very slow morphs
                                      //   custom   holds and morphs drawn from `holds` and `morphs` ([min, max] s)
     hold: 9, morph: 4,               // for 'steady'
     flow: 1,                         // how fast points move along the shape (1: the round-5 pages' median speed)
     spin: 0.09,                      // idle turn, radians per second
     center: [0.32, 0.0],             // where the shape sits, in NDC (or a function returning it)
     size: 1.0, pointSize: 1.0,       // size may be a function (e.g. smaller on a phone)
     logoSize: 1.0,                   // the logo's box height in NDC (2 = the full height)
     logoCenter: null,                // where the logo forms, in NDC (default: the shape's centre; or a function)
     hole: null,                      // () => [cx, cy, rx, ry, amount] in CSS px: the points thin out inside this ellipse (behind words)
     logoAlpha: 0.55,                 // opacity of the logo's outline points, relative to alpha
     logoFill: 0.35,                  // share of the points inside the logo that show (the outline shows them all)
     logoRim: 0.25, logoShare: 0.75,  // shares of the points that draw the outline / go to the logo at all (the rest stay, dimmed)
     logoStay: 0.3,                   // share of the points that stay in the attractor that still show while a logo does
     morphWhileLogo: false,           // true: the attractor behind a logo keeps morphing and turning instead of waiting
     drag: true,                      // false: the shape can't be turned with the mouse; it only turns by itself
     idleVideo: videoEl               // optional: colours while idle in 'video' ink
   });
   a.flatten(video)   // unravel into the playing video
   a.release()        // pour back into the shape
   a.form(i)          // gather into DAW logo i (KUMI.dawMarks order); a.form(-1) lets go */
(function () {
  'use strict';
  var TYPES = { aizawa: 0, thomas: 1, halvorsen: 2, dadras: 3, chen: 4, fourwing: 5, sprott: 6, lorenz: 7, rossler: 8,
    threescroll: 9, lorenz84: 10, shimizu: 11, burkeshaw: 12, dequanli: 13, hadley: 14, lorenzmod2: 15, halvorsen14: 16 };
  // c, s: the centre and scale that bring each attractor into roughly a unit ball. dt: the step while a fresh simulation
  // settles onto its shape (the largest that stays stable and true); pace: the step that moves its points at the
  // round-5 pages' median speed with two steps a frame. Measured offline with the shader's own integrator and seeding.
  var NORM = [
    { c: [0.13, 0.02, 0.74], s: 0.48, dt: 0.013, pace: 0.00558 },          // aizawa
    { c: [0, 0, 0], s: 0.155, dt: 0.11, pace: 0.055 },                      // thomas
    { c: [-2.2, -2.2, -2.2], s: 0.062, dt: 0.0084, pace: 0.00275 },        // halvorsen
    { c: [1.1, -0.5, 1.4], s: 0.08, dt: 0.0064, pace: 0.0068 },            // dadras
    { c: [0, 1.8, 4.8], s: 0.034, dt: 0.004, pace: 0.00419 },              // chen
    { c: [-0.2, 0, -0.25], s: 0.37, dt: 0.08, pace: 0.0651 },              // fourwing
    { c: [0.56, 0.17, 0.21], s: 1.19, dt: 0.005, pace: 0.0048 },           // sprott
    { c: [-0.05, 0.04, 24.3], s: 0.0309, dt: 0.008, pace: 0.00219 },       // lorenz
    { c: [0.89, -1.33, 6.5], s: 0.0693, dt: 0.04, pace: 0.0176 },          // rossler
    { c: [0.24, -0.01, 34.17], s: 0.0105, dt: 0.004, pace: 0.011 },        // three-scroll (TSUCS1)
    { c: [0.72, 0.29, 0.34], s: 0.2607, dt: 0.012, pace: 0.00148 },        // lorenz84
    { c: [0, 0, 1.11], s: 0.5383, dt: 0.024, pace: 0.0221 },               // shimizu-morioka
    { c: [0, 0, 0.04], s: 0.3237, dt: 0.004, pace: 0.00244 },              // burke-shaw
    { c: [-2.01, 0.42, 102.41], s: 0.0045, dt: 0.0016, pace: 0.000154 },   // dequan li
    { c: [0.97, -0.1, 0.09], s: 0.474, dt: 0.016, pace: 0.00386 },         // hadley
    { c: [0.27, 0.42, -0.21], s: 0.0639, dt: 0.006, pace: 0.00143 },       // lorenz mod 2
    { c: [-3.12, -3.11, -3.12], s: 0.0665, dt: 0.008, pace: 0.00252 }      // halvorsen at a = 1.4
  ];
  var SEED_BOX = 0.4, SETTLE = 1440;   // seeds fill ±0.4 of the unit ball around the centre; steps before a shape shows
  var S = 1024, N = S * S;

  function KumiAttractor(canvas, o) {
    o = o || {};
    var gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null;
    function prog(vs, fs) {
      function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; }
      var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p: p, u: u };
    }
    var H = '#version 300 es\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\n';
    // an integer hash: three independent uniform numbers in [0, 1) per (x, y, seed)
    var HASH = [
      'vec3 rnd3(uint x, uint y, uint z) {',
      '  uvec3 v = uvec3(x, y, z) * 1664525u + 1013904223u;',
      '  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; v ^= v >> 16u;',
      '  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;',
      '  return vec3(v) * (1.0 / 4294967296.0);',
      '}'].join('\n');
    var QUAD = H + 'in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
    var FIELD = [
      'vec3 field(int t, vec3 p) {',
      '  float x = p.x, y = p.y, z = p.z;',
      '  if (t == 0) return vec3((z - 0.7) * x - 3.5 * y, 3.5 * x + (z - 0.7) * y, 0.6 + 0.95 * z - z * z * z / 3.0 - (x * x + y * y) * (1.0 + 0.25 * z) + 0.1 * z * x * x * x);',
      '  if (t == 1) return vec3(sin(y) - 0.208186 * x, sin(z) - 0.208186 * y, sin(x) - 0.208186 * z);',
      '  if (t == 2) return vec3(-1.89 * x - 4.0 * y - 4.0 * z - y * y, -1.89 * y - 4.0 * z - 4.0 * x - z * z, -1.89 * z - 4.0 * x - 4.0 * y - x * x);',
      '  if (t == 3) return vec3(y - 3.0 * x + 2.7 * y * z, 1.7 * y - x * z + z, 2.0 * x * y - 9.0 * z);',
      '  if (t == 4) return vec3(5.0 * x - y * z, -10.0 * y + x * z, -0.38 * z + x * y / 3.0);',
      '  if (t == 5) return vec3(0.2 * x + y * z, 0.01 * x - 0.4 * y - x * z, -z - x * y);',
      '  if (t == 6) return vec3(y + 2.07 * x * y + x * z, 1.0 - 1.79 * x * x + y * z, x - x * x - y * y);',
      '  if (t == 7) return vec3(10.0 * (y - x), x * (28.0 - z) - y, x * y - 8.0 / 3.0 * z);',
      '  if (t == 8) return vec3(-y - z, x + 0.2 * y, 0.2 + z * (x - 5.7));',
      '  if (t == 9) return vec3(40.0 * (y - x) + 0.5 * x * z, 20.0 * y - x * z, 0.833 * z + x * y - 0.65 * x * x);',
      '  if (t == 10) return vec3(-0.95 * x - y * y - z * z + 0.95 * 4.83, -y + x * y - 7.91 * x * z + 4.66, -z + 7.91 * x * y + x * z);',
      '  if (t == 11) return vec3(y, (1.0 - z) * x - 0.75 * y, -0.45 * z + x * x);',
      '  if (t == 12) return vec3(-10.0 * (x + y), -y - 10.0 * x * z, 10.0 * x * y + 4.272);',
      '  if (t == 13) return vec3(40.0 * (y - x) + 0.16 * x * z, 55.0 * x + 20.0 * y - x * z, 1.833 * z + x * y - 0.65 * x * x);',
      '  if (t == 14) return vec3(-y * y - z * z - 0.2 * x + 1.6, x * y - 4.0 * x * z - y + 1.0, 4.0 * x * y + x * z - z);',
      '  if (t == 15) return vec3(-0.9 * x + y * y - z * z + 8.91, x * (y - 5.0 * z) + 1.0, -z + x * (5.0 * y + z));',
      '  return vec3(-1.4 * x - 4.0 * y - 4.0 * z - y * y, -1.4 * y - 4.0 * z - 4.0 * x - z * z, -1.4 * z - 4.0 * x - 4.0 * y - x * x);',
      '}'].join('\n');
    // a fresh point: anywhere in a box around the shape's centre, so the points start spread over the shape, not in one clump
    var SEED_AT = 'uniform vec3 uSeedC; uniform float uSeedR; vec3 seedAt(vec2 fc, uint s) { return uSeedC + (rnd3(uint(fc.x), uint(fc.y), s) - 0.5) * 2.0 * uSeedR; }';
    var STEP = prog(QUAD, H + HASH + FIELD + SEED_AT + [
      'uniform sampler2D uS; uniform int uT; uniform float uDt, uLimit; uniform uint uSeed; out vec4 o;',
      'void main() {',
      '  vec3 p = texelFetch(uS, ivec2(gl_FragCoord.xy), 0).xyz;',
      '  vec3 k1 = field(uT, p); vec3 k2 = field(uT, p + k1 * uDt * 0.5); p += k2 * uDt;',
      '  vec3 d = p - uSeedC; if (!(dot(d, d) < uLimit)) p = seedAt(gl_FragCoord.xy, uSeed);',
      '  o = vec4(p, 1.0);',
      '}'].join('\n'));
    // a fresh random start for a simulation, on the GPU (no 16 MB upload, no hitch)
    var SEED = prog(QUAD, H + HASH + SEED_AT + 'uniform uint uSeed; out vec4 o; void main() { o = vec4(seedAt(gl_FragCoord.xy, uSeed), 1.0); }');
    var DRAW = prog(H + HASH + [
      'uniform sampler2D uA, uB, uV; uniform int uTA, uTB; uniform vec4 uNA, uNB; uniform float uMorph, uFlat, uSize, uAspect, uVideoAspect, uFlatW;',
      'uniform mat4 uMVP; uniform vec2 uCenter; uniform int uInk; uniform vec3 uC1, uC2; uniform float uAlpha, uOverlap; uniform int uBlend;',
      'uniform float uForm, uSlot, uLogoH, uLogoA, uLogoF, uRim, uShare, uStay, uTime; uniform vec2 uLogoC; uniform vec4 uHole; uniform float uHoleAmt;',
      'uniform sampler2D uL0, uL1; uniform vec2 uN0, uN1;',
      'out vec4 vC;',
      'float h(float n) { return fract(sin(n * 12.9898) * 43758.5453); }',
      // a place in a logo: L lists its outline pixels (the first n.x) and then every pixel inside it (n.y), as 0..1 coordinates
      'vec2 pick(sampler2D L, vec2 n, float r, float rim, ivec2 c, uint salt) {',
      '  int k = rim > 0.5 ? int(r * n.x) : int(n.x) + int(r * n.y);',
      '  k = clamp(k, 0, int(n.x + n.y) - 1);',
      '  vec2 q = texelFetch(L, ivec2(k % 512, k / 512), 0).xy;',
      '  return q + (rnd3(uint(c.x), uint(c.y), salt).xy - 0.5) / 512.0;',
      '}',
      'void main() {',
      '  int id = gl_VertexID; ivec2 c = ivec2(id % ' + S + ', id / ' + S + ');',
      '  vec3 a = (texelFetch(uA, c, 0).xyz - uNA.xyz) * uNA.w;',
      '  vec3 b = (texelFetch(uB, c, 0).xyz - uNB.xyz) * uNB.w;',
      '  vec3 shape = mix(a, b, uMorph) + (h(float(id)) - 0.5) * 0.004;',
      '  vec2 uv = (vec2(c) + 0.5) / ' + S + '.0;',
      // the flat picture: a 16:9 plane facing the viewer, in clip space directly
      '  vec2 plane = (uv - 0.5) * vec2(uFlatW, uFlatW / uVideoAspect * uAspect) + uCenter;',
      '  float delay = h(float(id) * 1.7) * 0.35 + (1.0 - uv.y) * 0.45;',
      '  float f = smoothstep(0.0, 1.0, clamp((uFlat * 1.8 - delay) / 0.9, 0.0, 1.0));',
      '  vec4 cs = uMVP * vec4(shape, 1.0); cs.xy += uCenter * cs.w;',
      '  vec4 pos = cs / cs.w;',
      // Fading is done by showing fewer points, not dimmer ones: a dim point's share rounds away unevenly in an
      // 8-bit framebuffer (faint grey turns blue). `keep` is the chance a point shows; `logoA` scales the outline.
      '  float g = 0.0, logoA = 1.0, keep = 1.0;',
      '  vec3 R = rnd3(uint(c.x), uint(c.y), 7u);',
      '  float rim = step(R.x, uRim), inl = step(R.x, uShare);',
      '  if (uForm > 0.0005 && inl > 0.5) {',
      // the logo: a square box uLogoH tall; each point has a place in it in both slots, and moves between them when the logo changes
      '    float d2 = R.z;',
      '    vec2 l0 = pick(uL0, uN0, R.y, rim, c, 11u), l1 = pick(uL1, uN1, R.y, rim, c, 97u);',
      '    float sw = smoothstep(0.0, 1.0, clamp((uSlot * 1.5 - d2 * 0.5) / 1.0, 0.0, 1.0));',
      '    vec2 l = mix(l0, l1, sw);',
      '    vec2 lp = vec2((l.x - 0.5) * uLogoH / uAspect, (0.5 - l.y) * uLogoH) + uLogoC;',
      '    lp += vec2(sin(uTime * 1.3 + float(id) * 0.37), cos(uTime * 1.1 + float(id) * 0.23)) * 0.0025;',
      '    g = smoothstep(0.0, 1.0, clamp((uForm * 1.45 - d2 * 0.45) / 1.0, 0.0, 1.0));',
      // on the way the points swing out a little, so the gathering reads as a gust rather than a slide
      '    vec2 swing = vec2(cos(float(id) * 0.71), sin(float(id) * 0.71)) * sin(g * 3.14159) * 0.12;',
      '    pos = vec4(mix(pos.xy, lp, g) + swing, mix(pos.z, 0.0, g), 1.0);',
      '    logoA = mix(1.0, uLogoA, g);',
      '    keep = mix(1.0, mix(uLogoF, 1.0, rim), g);',
      '  } else if (uForm > 0.0005) keep = mix(1.0, uStay, smoothstep(0.0, 1.0, uForm));',
      '  vec4 cp = vec4(plane, 0.0, 1.0);',
      '  gl_Position = mix(pos, cp, f);',
      '  gl_PointSize = uSize * (1.0 + f * 0.4);',
      '  vec3 vid = texture(uV, uv).rgb;',
      '  vec3 col;',
      '  if (uInk == 0) col = vid;',
      '  else if (uInk == 1) col = uC1;',
      '  else if (uInk == 2) { float s = length(shape); col = mix(uC1, uC2, smoothstep(0.2, 1.1, s)); }',
      '  else if (uInk == 3) { float d = clamp(0.5 - (cs.z / cs.w) * 0.5, 0.0, 1.0); col = mix(uC2, uC1, smoothstep(0.2, 0.9, d + shape.y * 0.3)); }',
      '  else {',
      '    float l = dot(vid, vec3(0.299, 0.587, 0.114));',
      '    vec3 sat = clamp(mix(vec3(l), vid, 1.8), 0.0, 1.0);',
      '    col = mix(uC2, sat * 0.8 + vec3(0.03, 0.04, 0.09), smoothstep(0.03, 0.3, l));',
      '    col = mix(col, uC1, smoothstep(0.6, 1.0, l) * 0.5) * (0.55 + 1.6 * smoothstep(0.1, 0.7, l));',
      '  }',
      '  vec3 vidF = uBlend == 0 ? pow(max(vid, vec3(0.002)), vec3(1.0 / max(uOverlap, 1.0))) : vid;',
      '  float aF = uBlend == 1 ? 1.15 / max(uOverlap, 1.0) : 1.0;',
      '  float hd = length((gl_Position.xy / gl_Position.w - uHole.xy) / uHole.zw);',
      '  keep *= mix(mix(uHoleAmt, 1.0, smoothstep(0.75, 1.25, hd)), 1.0, max(f, g));',
      '  float shown = step(rnd3(uint(c.x), uint(c.y), 23u).x, keep);',
      '  col = mix(col, uC1, rim * g * 0.6);',
      '  float aS = uAlpha * logoA * shown;',
      '  vC = vec4(mix(col, vidF, f), mix(aS, aF, f));',
      '}'].join('\n'), H + 'in vec4 vC; uniform int uBlend; out vec4 o; void main(){ if (uBlend == 0) o = vec4(mix(vec3(1.0), vC.rgb, vC.a), 1.0); else o = vC; }');

    var tri = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, tri); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var vaoTri = gl.createVertexArray(); gl.bindVertexArray(vaoTri); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var vaoPts = gl.createVertexArray();
    function target() {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, S, S, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      var f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      return { t: t, f: f };
    }
    var seedNo = 1;
    function reseed(sim) {
      var nm = NORM[sim.type];
      gl.bindVertexArray(vaoTri); gl.useProgram(SEED.p);
      gl.uniform3f(SEED.u.uSeedC, nm.c[0], nm.c[1], nm.c[2]); gl.uniform1f(SEED.u.uSeedR, SEED_BOX / nm.s);
      sim.settled = 0;
      gl.bindFramebuffer(gl.FRAMEBUFFER, sim.tex[0].f); gl.viewport(0, 0, S, S);
      gl.uniform1ui(SEED.u.uSeed, (seedNo++ * 7919) >>> 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    var seq = (o.sequence || ['aizawa', 'thomas', 'halvorsen', 'fourwing']).map(function (n) { return TYPES[n] || 0; });
    // the next shape: in order, or with `shuffle` from a shuffled bag (all of them before any comes back), never `not`
    var seqIndex = 0, bag = [];
    function next(not) {
      if (!o.shuffle) {
        seqIndex = (seqIndex + 1) % seq.length;
        if (seq[seqIndex] === not && seq.length > 1) seqIndex = (seqIndex + 1) % seq.length;
        return seq[seqIndex];
      }
      if (!bag.length) {
        bag = seq.slice();
        for (var i = bag.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = bag[i]; bag[i] = bag[j]; bag[j] = x; }
      }
      var k = bag.length - 1;
      if (bag[k] === not && k > 0) k--;
      return bag.splice(k, 1)[0];
    }
    // two simulations: the shape now (A) and the next one (B), each a ping-pong pair
    var simA = { type: o.shuffle ? next(-1) : seq[0], tex: [target(), target()] };
    var simB = { type: o.shuffle ? next(simA.type) : seq[1 % seq.length], tex: [target(), target()] };
    if (!o.shuffle) seqIndex = 1 % seq.length;
    reseed(simA); reseed(simB);
    function tex2d(filter) {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([90, 90, 90, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }
    var vtex = tex2d(gl.LINEAR);
    // each slot holds one logo as a list of places (see pick() in the shader)
    function listTex() {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, 512, 512, 0, gl.RG, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      return t;
    }
    var lists = [listTex(), listTex()], counts = [[1, 1], [1, 1]], maskOf = [-1, -1], places = {};

    function step(sim, n, dt) {
      var nm = NORM[sim.type];
      gl.useProgram(STEP.p);
      gl.uniform3f(STEP.u.uSeedC, nm.c[0], nm.c[1], nm.c[2]); gl.uniform1f(STEP.u.uSeedR, SEED_BOX / nm.s);
      for (var k = 0; k < n; k++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, sim.tex[1].f); gl.viewport(0, 0, S, S);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sim.tex[0].t); gl.uniform1i(STEP.u.uS, 0);
        gl.uniform1i(STEP.u.uT, sim.type); gl.uniform1f(STEP.u.uDt, dt != null ? dt : nm.dt); gl.uniform1ui(STEP.u.uSeed, (seedNo++ * 7919) >>> 0);
        gl.uniform1f(STEP.u.uLimit, Math.pow(4.0 / nm.s, 2));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        sim.tex.reverse();
      }
      if (dt == null) sim.settled += n;
    }
    // a frame's move: a shape still settling takes 12 settling steps; a settled one moves at the shared pace times `flow`
    // (one step, the same speed at any frame rate, never past the settling step)
    var FLOW = o.flow != null ? o.flow : 1;
    function advance(sim, dt) {
      if (sim.settled < SETTLE) { step(sim, 12); return; }
      var nm = NORM[sim.type];
      step(sim, 1, Math.min(nm.dt, nm.pace * 2 * FLOW * dt * 60));
    }

    // warm up enough for a first frame; both finish settling over the first frames (12 steps each) while the canvas
    // fades in, so the page opens on a formed shape without a long first frame
    gl.bindVertexArray(vaoTri);
    step(simA, 480); step(simB, 240);
    canvas.style.opacity = '0'; canvas.style.transition = 'opacity 1.6s ease';
    var shown = false;

    function mul(a, b) { var r = new Float32Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; r[i * 4 + j] = s; } return r; }
    function persp(f, asp, n, fa) { var t = 1 / Math.tan(f / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, 2 * fa * n / (n - fa), 0]); }
    function rotY(r) { var c = Math.cos(r), s = Math.sin(r); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
    function rotX(r) { var c = Math.cos(r), s = Math.sin(r); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
    function trans(x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }

    var W = 1, Hh = 1;
    function resize() { var dpr = Math.min(devicePixelRatio || 1, 1.5); W = Math.round(innerWidth * dpr); Hh = Math.round(innerHeight * dpr); canvas.width = W; canvas.height = Hh; }
    resize(); addEventListener('resize', resize);

    var yaw = 0.6, pitch = 0.3, drag = null;
    if (o.drag !== false) {
      addEventListener('pointerdown', function (e) { if (e.target === canvas) drag = [e.clientX, e.clientY, yaw, pitch]; });
      addEventListener('pointermove', function (e) { if (!drag) return; yaw = drag[2] + (e.clientX - drag[0]) * 0.005; pitch = Math.max(-1.2, Math.min(1.2, drag[3] + (e.clientY - drag[1]) * 0.005)); });
      addEventListener('pointerup', function () { drag = null; });
    }

    // The morph timeline: a cycle is a list of segments that take `morph` from 0 to 1 (holds, false starts, the morph itself).
    // At 1, B becomes A and a fresh B starts converging.
    var rhythm = o.rhythm || 'steady';
    function lu(a, b) { return Math.exp(Math.log(a) + Math.random() * (Math.log(b) - Math.log(a))); }
    var lastHold = 0;
    function cycle() {
      var hold = o.hold || 9, mt = o.morph || 4, s;
      if (rhythm === 'varied') s = [{ to: 0, dur: lu(2.5, 16) }, { to: 1, dur: lu(1, 11), ease: 1.2 + Math.random() * 2.3 }];
      else if (rhythm === 'restless') s = [{ to: 0, dur: lu(0.9, 3.5) }, { to: 1, dur: lu(0.9, 3.2), ease: 2 }];
      else if (rhythm === 'slow') s = [{ to: 0, dur: lu(14, 26) }, { to: 1, dur: lu(9, 16), ease: 2 }];
      else if (rhythm === 'custom') s = [{ to: 0, dur: lu(o.holds[0], o.holds[1]) }, { to: 1, dur: lu(o.morphs[0], o.morphs[1]), ease: 1.8 }];
      else if (rhythm === 'sudden') {
        // now and then a second snap right after the first
        var again = lastHold > 3 && Math.random() < 0.3;
        s = [{ to: 0, dur: again ? lu(0.5, 1.6) : lu(6, 18) }, { to: 1, dur: lu(0.4, 1.2), ease: 3.2 }];
      } else if (rhythm === 'hesitant') {
        s = [{ to: 0, dur: lu(3, 11) }];
        var tries = Math.random() < 0.65 ? (Math.random() < 0.35 ? 2 : 1) : 0;
        for (var k = 0; k < tries; k++) {
          var p = 0.14 + Math.random() * 0.38;
          s.push({ to: p, dur: lu(0.8, 2.6), ease: 2 }, { to: p, dur: lu(0.3, 1.6) }, { to: 0, dur: lu(0.7, 2), ease: 2 }, { to: 0, dur: lu(1, 4) });
        }
        s.push({ to: 1, dur: lu(2.5, 7), ease: 2 });
      } else s = [{ to: 0, dur: hold }, { to: 1, dur: mt, ease: 2 }];
      lastHold = s[0].dur;
      return s;
    }
    function ease(u, p) { if (!p || p === 1) return u; var a = Math.pow(u, p); return a / (a + Math.pow(1 - u, p)); }
    var segs = cycle(), si = 0, segT = 0, from = 0, sinceSwap = 99;
    function swap() {
      var t = simA; simA = simB; simB = t;
      simB.type = next(simA.type);
      reseed(simB); sinceSwap = 0;
    }

    var morph = 0, flat = 0, flatTarget = 0, colorVideo = o.idleVideo || null, reduced = false;
    var form = 0, formTarget = 0, slot = 0, slotTarget = 0, time = 0;
    try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var inkCode = { video: 0, mono: 1, heat: 2, depth: 3, glow: 4 }[o.ink || 'video'];
    var blendCode = { multiply: 0, add: 1, alpha: 2 }[o.blend || 'multiply'];
    var bg = o.bg || [0.94, 0.93, 0.9];
    var last = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
      if (colorVideo && colorVideo.readyState >= 2) {
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, vtex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, colorVideo); } catch (e) {}
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      }
      // the morph waits while the shape is flat (and, unless morphWhileLogo, while it is a logo)
      if (!reduced && flatTarget === 0 && (o.morphWhileLogo || (formTarget === 0 && form < 0.05))) {
        var sg = segs[si];
        segT += dt;
        var u = Math.min(1, segT / sg.dur);
        morph = from + (sg.to - from) * ease(u, sg.ease);
        if (u >= 1) {
          from = sg.to; si++; segT = 0;
          if (si >= segs.length) { swap(); segs = cycle(); si = 0; from = 0; morph = 0; }
        }
      }
      sinceSwap += dt;
      flat += (flatTarget - flat) * (flatTarget ? 0.035 : 0.03);
      form += (formTarget - form) * Math.min(1, dt * (formTarget ? 2.6 : 3.4));
      slot += (slotTarget - slot) * Math.min(1, dt * 3.2);
      gl.bindVertexArray(vaoTri);
      // a fresh B settles fast (twelve steps a frame) so even a quick next morph lands on a formed shape
      if (!reduced) { advance(simA, dt); advance(simB, dt); }
      if (!drag && !reduced) yaw += dt * (o.spin != null ? o.spin : 0.09) * (1 - flat) * (o.morphWhileLogo ? 1 : 1 - form * 0.8);
      var aspect = W / Hh;
      var size = (typeof o.size === 'function' ? o.size() : o.size) || 1;
      var view = mul(trans(0, 0, -3.1 / size), mul(rotX(pitch), rotY(yaw)));
      var mvp = mul(persp(0.72, aspect, 0.1, 50), view);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, Hh);
      gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      if (blendCode === 0) gl.blendFunc(gl.DST_COLOR, gl.ZERO);
      else if (blendCode === 1) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(vaoPts); gl.useProgram(DRAW.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, simA.tex[0].t); gl.uniform1i(DRAW.u.uA, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, simB.tex[0].t); gl.uniform1i(DRAW.u.uB, 1);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, vtex); gl.uniform1i(DRAW.u.uV, 2);
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, lists[0]); gl.uniform1i(DRAW.u.uL0, 3);
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, lists[1]); gl.uniform1i(DRAW.u.uL1, 4);
      gl.uniform2f(DRAW.u.uN0, counts[0][0], counts[0][1]); gl.uniform2f(DRAW.u.uN1, counts[1][0], counts[1][1]);
      gl.uniform1f(DRAW.u.uLogoF, o.logoFill != null ? o.logoFill : 0.35); gl.uniform1f(DRAW.u.uStay, o.logoStay != null ? o.logoStay : 0.3);
      gl.uniform1f(DRAW.u.uRim, o.logoRim != null ? o.logoRim : 0.25); gl.uniform1f(DRAW.u.uShare, o.logoShare != null ? o.logoShare : 0.75);
      var na = NORM[simA.type], nb = NORM[simB.type];
      gl.uniform1i(DRAW.u.uTA, simA.type); gl.uniform1i(DRAW.u.uTB, simB.type);
      gl.uniform4f(DRAW.u.uNA, na.c[0], na.c[1], na.c[2], na.s); gl.uniform4f(DRAW.u.uNB, nb.c[0], nb.c[1], nb.c[2], nb.s);
      gl.uniform1f(DRAW.u.uMorph, morph); gl.uniform1f(DRAW.u.uFlat, flat);
      gl.uniform1f(DRAW.u.uForm, form); gl.uniform1f(DRAW.u.uSlot, slot); gl.uniform1f(DRAW.u.uTime, time);
      gl.uniform1f(DRAW.u.uLogoH, (typeof o.logoSize === 'function' ? o.logoSize() : o.logoSize) || 1.0); gl.uniform1f(DRAW.u.uLogoA, o.logoAlpha != null ? o.logoAlpha : 0.55);
      gl.uniform1f(DRAW.u.uSize, (o.pointSize || 1) * Math.min(devicePixelRatio || 1, 1.5));
      gl.uniform1f(DRAW.u.uAspect, aspect); gl.uniform1f(DRAW.u.uVideoAspect, 16 / 9);
      gl.uniform1f(DRAW.u.uFlatW, o.flatWidth || 1.05);
      gl.uniformMatrix4fv(DRAW.u.uMVP, false, mvp);
      var ctr = (typeof o.center === 'function' ? o.center() : o.center) || [0, 0];
      gl.uniform2f(DRAW.u.uCenter, ctr[0], ctr[1]);
      var lc = (typeof o.logoCenter === 'function' ? o.logoCenter() : o.logoCenter) || ctr;
      gl.uniform2f(DRAW.u.uLogoC, lc[0], lc[1]);
      var ho = o.hole ? o.hole() : null;
      if (ho) gl.uniform4f(DRAW.u.uHole, ho[0] / innerWidth * 2 - 1, 1 - ho[1] / innerHeight * 2, Math.max(1, ho[2]) / innerWidth * 2, Math.max(1, ho[3]) / innerHeight * 2);
      else gl.uniform4f(DRAW.u.uHole, 9, 9, 0.01, 0.01);
      gl.uniform1f(DRAW.u.uHoleAmt, ho ? (ho[4] != null ? ho[4] : 0.25) : 1);
      gl.uniform1i(DRAW.u.uInk, inkCode);
      var c1 = o.color || [0.07, 0.07, 0.07], c2 = o.color2 || c1;
      gl.uniform3f(DRAW.u.uC1, c1[0], c1[1], c1[2]); gl.uniform3f(DRAW.u.uC2, c2[0], c2[1], c2[2]);
      gl.uniform1f(DRAW.u.uAlpha, o.alpha != null ? o.alpha : 0.35);
      gl.uniform1i(DRAW.u.uBlend, blendCode);
      var pw = (o.flatWidth || 1.05) / 2 * W, ph = pw * 9 / 16, ps = (o.pointSize || 1) * Math.min(devicePixelRatio || 1, 1.5) * 1.4;
      gl.uniform1f(DRAW.u.uOverlap, Math.max(1, N * ps * ps / (pw * ph)));
      gl.drawArrays(gl.POINTS, 0, N);
      gl.disable(gl.BLEND);
      if (!shown && simA.settled >= SETTLE) { shown = true; canvas.style.opacity = '1'; }
    }
    requestAnimationFrame(frame);

    // A logo's places: its outline (inside pixels within `rimPx` of the edge), then every inside pixel. Made once per logo.
    function placesOf(i) {
      if (places[i]) return places[i];
      var M = 512, px = window.KUMI.dawMask(i, { size: M, fill: 0.92 }).getContext('2d').getImageData(0, 0, M, M).data;
      var inside = new Uint8Array(M * M), core = new Uint8Array(M * M), k;
      for (k = 0; k < M * M; k++) inside[k] = px[k * 4 + 3] >= 128 ? 1 : 0;
      core.set(inside);
      for (var pass = 0; pass < (o.rimPx || 3); pass++) {
        var next = new Uint8Array(core);
        for (var y = 1; y < M - 1; y++) for (var x = 1; x < M - 1; x++) {
          k = y * M + x;
          if (core[k] && !(core[k - 1] && core[k + 1] && core[k - M] && core[k + M])) next[k] = 0;
        }
        core = next;
      }
      var rim = [], all = [];
      for (k = 0; k < M * M; k++) if (inside[k]) { var q = [(k % M + 0.5) / M, ((k / M | 0) + 0.5) / M]; all.push(q); if (!core[k]) rim.push(q); }
      var data = new Float32Array(M * M * 2), n = 0;
      rim.concat(all).forEach(function (q) { if (n < M * M) { data[n * 2] = q[0]; data[n * 2 + 1] = q[1]; n++; } });
      places[i] = { data: data, rim: rim.length, all: Math.min(all.length, M * M - rim.length) };
      return places[i];
    }
    function loadMask(slotNo, i) {
      var p = placesOf(i);
      gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, lists[slotNo]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, 512, 512, 0, gl.RG, gl.FLOAT, p.data);
      counts[slotNo] = [p.rim, p.all];
      maskOf[slotNo] = i;
    }
    return {
      state: function () { return { morph: morph, form: form, flat: flat, plan: segs.map(function (g) { return [g.to, +g.dur.toFixed(2)]; }), at: si }; },
      flatten: function (video) { colorVideo = video; flatTarget = 1; formTarget = 0; },
      release: function () { flatTarget = 0; colorVideo = o.idleVideo || colorVideo; },
      form: function (i) {
        if (reduced || flatTarget) return;
        if (i == null || i < 0) { formTarget = 0; return; }
        var cur = slotTarget;
        if (form < 0.02) { slot = cur; if (maskOf[cur] !== i) loadMask(cur, i); }
        else if (maskOf[cur] !== i) { loadMask(1 - cur, i); slotTarget = 1 - cur; }   // a different logo: the points fly across
        formTarget = 1;
      }
    };
  }
  window.KumiAttractor = KumiAttractor;
})();
