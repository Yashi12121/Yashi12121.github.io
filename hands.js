import * as THREE from 'three'

// The two hands of the Creation of Adam, cut from the fresco (see assets/SOURCE.md). The cut spans
// x 535 to 1236 of a 2576 wide copy; it is drawn so x 1232 meets the right edge of the screen and
// both arms run out of view. The hands never move; all of the life is in the glyphs.
const SOURCE = 'assets/hands.png'
const SPAN = 701
const ASPECT = 206 / SPAN
const GAP = [(976 - 535) / SPAN, 0.485]
const EDGE = (1232 - 535) / SPAN

// Candidate characters, measured for ink. Each level of the ramp gets two of near equal weight.
const POOL = ` .·',:;-~^"=+*!?/\\|()<>ilrcxzvo17349258$%#&@`
const LEVELS = 15
const FONT = '"IBM Plex Mono", ui-monospace, monospace'

const armVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const armFrag = /* glsl */ `
  uniform sampler2D tArm;
  varying vec2 vUv;
  void main() {
    vec4 t = texture2D(tArm, vUv);
    gl_FragColor = vec4(t.r * t.a, 0.0, 0.0, t.a);
  }
`

const fullVert = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`

const glyphFrag = /* glsl */ `
  uniform sampler2D tScene;
  uniform sampler2D tGlyph;
  uniform vec2 uCells;
  uniform vec2 uCell;
  uniform float uLevels;
  uniform float uTime;
  uniform float uBorn;
  uniform float uAspect;
  uniform vec2 uGap;
  uniform float uRipple;
  uniform float uCharge;
  uniform vec2 uMouse;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  // Mother of pearl: rose, lilac, a cool green and champagne, kept pale.
  vec3 nacre(float t) {
    vec3 a = vec3(1.00, 0.80, 0.86);
    vec3 b = vec3(0.82, 0.80, 1.00);
    vec3 c = vec3(0.78, 0.96, 0.90);
    vec3 d = vec3(1.00, 0.92, 0.78);
    float x = fract(t) * 4.0;
    vec3 col = mix(a, b, smoothstep(0.0, 1.0, x));
    col = mix(col, c, smoothstep(1.0, 2.0, x));
    col = mix(col, d, smoothstep(2.0, 3.0, x));
    return mix(col, a, smoothstep(3.0, 4.0, x));
  }

  // Light of a neighbour and whether it is part of the hands, so edges are only compared with
  // the hands and never brightened against the empty background.
  vec2 lightAt(vec2 uv) {
    vec4 s = texture2D(tScene, uv);
    return s.a > 0.3 ? vec2(s.r / s.a, 1.0) : vec2(0.0);
  }

  void main() {
    vec2 f = gl_FragCoord.xy;
    vec2 cell = floor(f / uCell);
    vec2 local = (f - cell * uCell) / uCell;
    vec2 uv = (cell + 0.5) / uCells;
    vec2 q = 0.25 / uCells;
    vec4 s = 0.25 * (texture2D(tScene, uv + vec2(-q.x, -q.y)) + texture2D(tScene, uv + vec2(q.x, -q.y))
      + texture2D(tScene, uv + vec2(-q.x, q.y)) + texture2D(tScene, uv + vec2(q.x, q.y)));
    if (s.a < 0.06) { gl_FragColor = vec4(0.0); return; }

    // Light pushed away from its neighbourhood average, so knuckles and tendons read.
    float lum = s.r / s.a;
    vec2 r = 4.0 / uCells;
    vec2 near4 = lightAt(uv + vec2(r.x, 0.0)) + lightAt(uv - vec2(r.x, 0.0)) + lightAt(uv + vec2(0.0, r.y)) + lightAt(uv - vec2(0.0, r.y));
    float around = near4.y > 0.0 ? near4.x / near4.y : lum;
    lum = max(lum + 0.7 * (lum - around), 0.0);
    // Alpha only thins the far end of each forearm; everywhere else the paint's own light decides.
    float body = smoothstep(0.06, 0.45, s.a);
    float tone = mix(0.32, 1.0, pow(smoothstep(0.12, 0.95, lum), 1.15)) * body;

    // Arrival: cells appear from the fingertips outward, each flickering through a few glyphs
    // before it settles on its own.
    float h = hash(cell);
    float d = length((uv - uGap) * vec2(uAspect, 1.0));
    float age = uBorn - (d * 1.1 + h * 0.55);
    if (age < 0.0) { gl_FragColor = vec4(0.0); return; }
    float settling = 1.0 - smoothstep(0.0, 0.22, age);

    // Luster: a broad soft band of light crosses now and then. Its core goes toward white, its
    // edges pick up a pale nacre fringe, and the shadows stay as they are.
    float pass = fract(uTime / 9.0);
    float front = mix(-0.4, 1.4, smoothstep(0.0, 0.7, pass));
    float across = uv.x * 0.8 + uv.y * 0.9;
    float band = exp(-pow((across - front) / 0.14, 2.0));
    float lit = smoothstep(0.25, 0.8, tone);
    float core = band * band * lit;
    float fringe = band * (1.0 - band) * 4.0 * lit;

    float ring = 0.0;
    if (uRipple > 0.0) {
      ring = exp(-pow((d - uRipple * 0.8) / 0.035, 2.0)) * (1.0 - uRipple) * lit;
    }

    // Breathing: slow waves of light drift through the hands and a soft pulse leaves the fingertips.
    vec2 wide = uv * vec2(uAspect, 1.0);
    float breath = noise(wide * 5.0 + vec2(uTime * 0.11, -uTime * 0.07)) - 0.5;
    float pulse = sin(uTime * 0.9 - d * 7.0);

    // Copying sends a charge along both arms toward the gap.
    float travel = 1.0 - abs(uv.x - 0.5) * 2.0;
    float charge = uCharge > 0.0 ? exp(-pow((travel - uCharge) / 0.07, 2.0)) * (1.0 - uCharge * 0.4) : 0.0;

    float near = 1.0 - smoothstep(0.0, 0.12, length((uv - uMouse) * vec2(uAspect, 1.0)));

    // Each cell keeps its own clock and every few seconds trades its glyph for a neighbour in
    // density, faster near the cursor, so the texture stays alive while the hands stay put.
    float tick = floor(uTime * (0.35 + h * 0.5 + near * 2.5) + h * 10.0);
    float jitter = hash(cell + tick * 3.1) - 0.5 + (hash(cell * 1.37) - 0.5) * 0.9;

    float level = clamp(tone + breath * 0.2 * body + pulse * 0.035 * body + core * 0.2 + ring * 0.3 + charge * 0.45 * body + near * 0.12 * body, 0.0, 1.0);
    float idx = clamp(floor(mix(1.0, uLevels - 1.0, level) + 0.5 + jitter * 1.4), 1.0, uLevels - 1.0);
    if (settling > 0.0) idx = mix(idx, floor(1.0 + hash(cell + floor(uBorn * 18.0)) * (uLevels - 1.0)), step(0.35, settling));
    if (s.a < 0.55 && hash(cell + tick * 1.3) > s.a * 1.7) { gl_FragColor = vec4(0.0); return; }
    // No grid: every glyph sits a little off its cell's centre and has its own size, so rows and
    // columns dissolve into a scatter.
    float alt = floor(hash(cell + tick * 1.7) * 4.0);
    vec2 shift = (vec2(hash(cell + 11.0), hash(cell + 23.0)) - 0.5) * vec2(0.3, 0.5);
    float size = 0.72 + 0.42 * hash(cell + 31.0);
    vec2 g = (local - 0.5 - shift) / size + 0.5;
    float inside = step(0.0, g.x) * step(g.x, 1.0) * step(0.0, g.y) * step(g.y, 1.0);
    float ink = inside * texture2D(tGlyph, vec2((idx + clamp(g.x, 0.0, 1.0)) / uLevels, (3.0 - alt + clamp(g.y, 0.0, 1.0)) / 4.0)).r;

    vec3 col = vec3(0.93, 0.92, 0.89) * (0.06 + 1.0 * pow(level, 1.5));
    col = mix(col, vec3(1.0, 0.99, 0.97) * (0.6 + 0.5 * level), clamp(core * 0.8 + ring * 0.6 + charge * 0.7, 0.0, 1.0));
    col = mix(col, nacre(across * 5.0 - front * 5.0 + lum) * (0.5 + 0.6 * level), clamp(fringe * 0.55 + ring * 0.4, 0.0, 1.0));
    col *= 1.0 + settling * 0.6;

    gl_FragColor = vec4(col * ink, ink);
  }
`

// Measures each candidate's ink and draws the ramp darkest first. Each level gets four glyphs of
// near equal ink, one per row, so neighbouring cells of the same tone do not repeat.
function ramp(cw, ch) {
  const W = 30
  const H = 54
  const probe = document.createElement('canvas')
  probe.width = W
  probe.height = H
  const p = probe.getContext('2d', { willReadFrequently: true })
  p.font = `500 ${Math.round(H * 0.64)}px ${FONT}`
  p.textAlign = 'center'
  p.textBaseline = 'middle'
  const ink = [...POOL].map((s) => {
    p.fillStyle = '#000'
    p.fillRect(0, 0, W, H)
    p.fillStyle = '#fff'
    p.fillText(s, W / 2, H / 2)
    const d = p.getImageData(0, 0, W, H).data
    let sum = 0
    for (let i = 0; i < d.length; i += 4) sum += d[i]
    return { s, ink: sum / (255 * W * H) }
  })
  ink.sort((a, b) => a.ink - b.ink)
  const top = ink[ink.length - 1].ink
  const rows = [[' '], [' '], [' '], [' ']]
  const used = new Set([' '])
  for (let i = 1; i < LEVELS; i++) {
    const want = (top * i) / (LEVELS - 1)
    const near = ink.filter((g) => !used.has(g.s)).sort((a, b) => Math.abs(a.ink - want) - Math.abs(b.ink - want))
    rows[0].push(near[0].s)
    rows[1].push((near[1] ?? near[0]).s)
    rows[2].push((near[2] ?? near[0]).s)
    rows[3].push((near[3] ?? near[1] ?? near[0]).s)
    used.add(near[0].s)
  }

  const strip = document.createElement('canvas')
  strip.width = cw * LEVELS
  strip.height = ch * 4
  const g = strip.getContext('2d')
  g.fillStyle = '#000'
  g.fillRect(0, 0, strip.width, strip.height)
  g.fillStyle = '#fff'
  g.font = `500 ${Math.round(ch * 0.64)}px ${FONT}`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  rows.forEach((row, r) => row.forEach((s, i) => g.fillText(s, i * cw + cw / 2, r * ch + ch / 2 + ch * 0.04)))
  const tex = new THREE.CanvasTexture(strip)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  return tex
}

export function mountHands(canvas, { reduced = false } = {}) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1)
  const lit = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, depthBuffer: false })
  const show = new THREE.ShaderMaterial({
    vertexShader: fullVert,
    fragmentShader: glyphFrag,
    transparent: true,
    depthTest: false,
    uniforms: {
      tScene: { value: lit.texture },
      tGlyph: { value: null },
      uCells: { value: new THREE.Vector2() },
      uCell: { value: new THREE.Vector2() },
      uLevels: { value: LEVELS },
      uTime: { value: 0 },
      uBorn: { value: reduced ? 99 : 0 },
      uAspect: { value: 1 },
      uGap: { value: new THREE.Vector2(0.5, 0.5) },
      uRipple: { value: 0 },
      uCharge: { value: 0 },
      uMouse: { value: new THREE.Vector2(-1, -1) },
    },
  })
  const post = new THREE.Scene()
  post.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), show))
  const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const material = new THREE.ShaderMaterial({
    vertexShader: armVert,
    fragmentShader: armFrag,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    uniforms: { tArm: { value: null } },
  })
  const hands = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
  scene.add(hands)

  const mouse = { x: -1, y: -1 }
  const frame = { w: 0, h: 0 }
  let charge = -1
  let wave = -1
  let ready = false

  function layout() {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(rect.width * dpr)
    const h = Math.round(rect.height * dpr)
    if (!w || !h || (w === frame.w && h === frame.h)) return
    Object.assign(frame, { w, h })
    renderer.setPixelRatio(1)
    renderer.setSize(w, h, false)

    const narrow = rect.width < 820
    const cw = Math.round(5 * dpr)
    const ch = Math.round(8 * dpr)
    const cols = Math.ceil(w / cw)
    const rows = Math.ceil(h / ch)
    lit.setSize(cols * 2, rows * 2)
    show.uniforms.tGlyph.value?.dispose()
    show.uniforms.tGlyph.value = ramp(cw, ch)
    show.uniforms.uCells.value.set(cols, rows)
    show.uniforms.uCell.value.set(cw, ch)
    show.uniforms.uAspect.value = w / h

    camera.right = w
    camera.top = h
    camera.updateProjectionMatrix()

    // The fingertip gap sits in the middle and the cut's right end just past the screen edge. A phone
    // is too narrow for both arms, so there the two hands fill the width and sit in a band at the foot.
    const width = narrow ? w * 2.5 : w / 2 / (EDGE - GAP[0])
    const height = width * ASPECT
    const tip = narrow ? 1 - (175 * dpr) / h : 0.68
    const left = w / 2 - GAP[0] * width
    const top = h * (1 - tip) + GAP[1] * height
    hands.scale.set(width, height, 1)
    hands.position.set(left + width / 2, top - height / 2, 0)
    show.uniforms.uGap.value.set(0.5, 1 - tip)
    if (reduced) draw(performance.now())
  }

  // Copying sends a charge of light along both arms; when it reaches the gap, a ripple leaves it.
  function touch() {
    if (!reduced && ready) charge = 0
  }

  let last = performance.now()
  let start = last
  function draw(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    const t = (now - start) / 1000

    if (!reduced) {
      if (charge >= 0) {
        charge += dt / 0.9
        show.uniforms.uCharge.value = charge < 1 ? charge : 0
        if (charge >= 1) {
          charge = -1
          wave = 0
        }
      }
      if (wave >= 0) {
        wave += dt / 1.4
        show.uniforms.uRipple.value = wave < 1 ? wave : 0
        if (wave >= 1) wave = -1
      }
      show.uniforms.uBorn.value = t
      show.uniforms.uTime.value = t
      const m = show.uniforms.uMouse.value
      const k = Math.min(1, dt * 8)
      m.set(m.x + (mouse.x - m.x) * k, m.y + (mouse.y - m.y) * k)
    }

    renderer.setRenderTarget(lit)
    renderer.clear()
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.clear()
    renderer.render(post, flat)
  }

  let running = false
  let visible = true
  function loop(now) {
    if (!running) return
    draw(now)
    requestAnimationFrame(loop)
  }
  function run() {
    const should = ready && visible && !document.hidden && !reduced
    if (should && !running) {
      running = true
      last = performance.now()
      requestAnimationFrame(loop)
    } else if (!should) {
      running = false
    }
  }

  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect()
    mouse.x = (e.clientX - r.left) / r.width
    mouse.y = 1 - (e.clientY - r.top) / r.height
  })
  new ResizeObserver(() => ready && layout()).observe(canvas)
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    run()
  }).observe(canvas)
  document.addEventListener('visibilitychange', run)

  const loader = new THREE.TextureLoader()
  Promise.all([document.fonts.load(`500 20px ${FONT}`), loader.loadAsync(SOURCE)])
    .then(([, tex]) => {
      tex.colorSpace = THREE.NoColorSpace
      material.uniforms.tArm.value = tex
      ready = true
      start = performance.now()
      layout()
      if (reduced) draw(performance.now())
      run()
    })
    .catch(() => canvas.remove())

  return { touch }
}
