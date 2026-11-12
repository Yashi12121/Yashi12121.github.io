// Small glyph figures for the sections below the hero. Every agent is drawn in its own alphabet,
// the same ones the app uses, so a figure reads as "Codex is doing this" without a label.
const ALPHA = {
  claude: '.:-=+*#%@',
  codex: '.-01',
  grok: '.:/\\|X#',
  gemini: '.,oO0@',
}
const FPS = 12

const esc = c => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c)

function hash(x, y, s = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453
  return n - Math.floor(n)
}

// A grid of characters with an optional class per cell; joined into HTML once per frame.
function grid(w, h) {
  const ch = Array.from({ length: h }, () => Array(w).fill(' '))
  const cls = Array.from({ length: h }, () => Array(w).fill(''))
  return {
    put(x, y, c, k = '') {
      if (y < 0 || y >= h || x < 0 || x >= w) return
      ch[y][x] = c
      cls[y][x] = k
    },
    text(x, y, s, k = '') {
      for (let i = 0; i < s.length; i++) this.put(x + i, y, s[i], k)
    },
    html() {
      return ch.map((row, y) => {
        let out = ''
        let open = ''
        row.forEach((c, x) => {
          const k = cls[y][x]
          if (k !== open) {
            if (open) out += '</span>'
            if (k) out += `<span class="${k}">`
            open = k
          }
          out += esc(c)
        })
        return out + (open ? '</span>' : '')
      }).join('\n')
    },
  }
}

// An elliptical patch of an agent's glyphs that breathes; level 0..1 sets how dense it is.
function blob(g, cx, cy, rx, ry, alpha, t, level, seed) {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
      if (d > 1) continue
      const wave = 0.5 + 0.5 * Math.sin(t * 2.2 + x * 0.7 + y * 1.3 + seed)
      const v = Math.max(0, Math.min(0.999, level * (1.15 - d) * (0.65 + 0.35 * wave) + hash(x, y, Math.floor(t * 3) + seed) * 0.18))
      g.put(x, y, alpha[Math.floor(v * alpha.length)], level > 0.6 ? 's' : '')
    }
  }
}

const figures = {
  crew(t) {
    const g = grid(32, 10)
    const mates = [['codex', 2], ['grok', 5], ['gemini', 8]]
    const active = Math.floor(t / 2.6) % mates.length
    blob(g, 6, 4, 5.5, 3.6, ALPHA.claude, t, 0.95, 1)
    mates.forEach(([name, y], i) => blob(g, 27, y - 1, 3.4, 1.2, ALPHA[name], t, i === active ? 0.95 : 0.35, i * 9))
    const [, ty] = mates[active]
    const phase = (t % 2.6) / 2.6
    for (let x = 13; x <= 22; x++) {
      const y = Math.round(4 + ((ty - 1 - 4) * (x - 13)) / 9)
      const lit = Math.abs((x - 13) / 9 - phase) < 0.12
      g.put(x, y, lit ? '+' : '·', lit ? 's' : 'd')
    }
    g.text(1, 9, 'claude leads', 'd')
    g.text(20, 9, `asks ${mates[active][0]}`.padEnd(11), 's')
    return g
  },

  brief(t) {
    const g = grid(32, 10)
    const cycle = 5
    const p = (t % cycle) / cycle
    const lines = ['goal', 'learned', 'files', 'task']
    lines.forEach((label, i) => {
      const y = 1 + i * 2
      g.text(0, y, label.padEnd(8), 'd')
      const fill = Math.max(0, Math.min(1, p * 5 - i * 0.8))
      const n = Math.round(fill * 12)
      for (let x = 0; x < 12; x++) {
        const c = x < n ? ALPHA.claude[3 + Math.floor(hash(x, y, Math.floor(t * 4)) * 6)] : '.'
        g.put(8 + x, y, c, x < n ? 's' : 'd')
      }
    })
    const ready = Math.max(0, Math.min(1, p * 5 - 3.6))
    blob(g, 27, 4, 3.6, 3.2, ALPHA.codex, t, 0.25 + ready * 0.7, 4)
    g.text(20, 9, ready > 0.5 ? 'codex starts' : 'codex       ', ready > 0.5 ? 's' : 'd')
    return g
  },

  limit(t) {
    const g = grid(32, 10)
    const cycle = 7
    const p = (t % cycle) / cycle
    const claudeLeft = p < 0.45 ? 1 - p / 0.45 : p > 0.9 ? (p - 0.9) / 0.1 : 0
    const codexOn = p >= 0.45 && p <= 0.9
    const bar = (y, name, left, alpha, on) => {
      g.text(0, y, (on ? '> ' : '  ') + name.padEnd(7), on ? 's' : 'd')
      g.put(9, y, '[', 'd')
      const n = Math.round(left * 16)
      for (let x = 0; x < 16; x++) {
        const c = x < n ? alpha[1 + Math.floor(hash(x, y, Math.floor(t * 5)) * (alpha.length - 1))] : '.'
        g.put(10 + x, y, c, x < n ? (on ? 's' : '') : 'd')
      }
      g.put(26, y, ']', 'd')
    }
    bar(2, 'claude', claudeLeft, ALPHA.claude, !codexOn)
    bar(5, 'codex', codexOn ? 0.85 - (p - 0.45) * 0.4 : 0.85, ALPHA.codex, codexOn)
    if (codexOn) {
      g.text(2, 3, 'out of usage, resets 14:20', 'a')
      g.text(2, 6, 'took the task with a briefing', 's')
    } else {
      g.text(2, 3, '5 hour window', 'd')
      g.text(2, 6, 'waiting', 'd')
    }
    g.text(0, 9, codexOn ? 'same task, next agent' : 'claude has the task  ', 'd')
    return g
  },

  proof(t) {
    const g = grid(32, 10)
    const cycle = 9
    const p = (t % cycle) / cycle
    const withTest = p < 0.5
    const q = withTest ? p / 0.5 : (p - 0.5) / 0.5
    const type = (x, y, s, from, k = '') => g.text(x, y, s.slice(0, Math.max(0, Math.floor((q - from) * 60))), k)
    if (withTest) {
      type(0, 0, '$ npm test', 0, 's')
      type(0, 1, '  18 passed, 0 failed', 0.18, '')
      type(0, 3, 'claim   tests pass', 0.35, '')
      type(0, 4, 'proof   npm test after the', 0.5, 'd')
      type(0, 5, '        last edit', 0.62, 'd')
      type(0, 7, '        verified', 0.75, 's')
    } else {
      type(0, 0, 'edit src/page.ts', 0, 's')
      type(0, 1, '  1 file changed', 0.18, '')
      type(0, 3, 'claim   tests pass', 0.35, '')
      type(0, 4, 'proof   no command after', 0.5, 'd')
      type(0, 5, '        the last edit', 0.62, 'd')
      type(0, 7, '        waiting for you', 0.75, 'a')
    }
    return g
  },
}

function swatch(alpha, t, seed) {
  const g = grid(18, 2)
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 18; x++) {
      const v = 0.5 + 0.5 * Math.sin(t * 1.8 + x * 0.55 + y * 1.7 + seed)
      const i = Math.min(alpha.length - 1, Math.floor((v * 0.8 + hash(x, y, Math.floor(t * 2) + seed) * 0.2) * alpha.length))
      g.put(x, y, alpha[i], v > 0.7 ? 's' : '')
    }
  }
  return g
}

const POOL = [
  ['Claude', 'claude', 0.62, 0.48, '2 h 10 m'],
  ['Codex', 'codex', 0.85, 0.7, '4 h 02 m'],
  ['Grok', 'grok', 0.31, 0.55, '0 h 48 m'],
  ['Gemini', 'gemini', 0.94, 0.9, '3 h 30 m'],
]

function meterRow(left, alpha, t, seed, cells = 20) {
  const g = grid(cells, 1)
  const n = Math.round(left * cells)
  for (let x = 0; x < cells; x++) {
    if (x < n) {
      const i = 1 + Math.floor(hash(x, seed, Math.floor(t * 2.5)) * (alpha.length - 1))
      g.put(x, 0, alpha[i], 's')
    } else g.put(x, 0, '.', 'd')
  }
  return g.html()
}


// Six messages in one room. Each sends the room so far, which the provider has cached (dim), plus a
// little new text at full price (solid). The label is what that message cost less than full price.
function cacheFig(t, width) {
  const w = Math.max(30, Math.min(72, width))
  const g = grid(w, 7)
  const label = 7
  const span = w - label - 12
  const sizes = [0.12, 0.4, 0.58, 0.74, 0.88, 1]
  sizes.forEach((size, i) => {
    const total = Math.round(size * span)
    const old = i ? Math.round(sizes[i - 1] * span) : 0
    g.text(0, i, `msg ${i + 1}`, 'd')
    for (let x = 0; x < total; x++) {
      const fresh = x >= old
      const alpha = fresh ? ALPHA.claude.slice(5) : '.:'
      g.put(label + x, i, alpha[Math.floor(hash(x, i, Math.floor(t * 3)) * alpha.length)], fresh ? 's' : 'd')
    }
    const saved = (0.9 * old) / total
    g.text(label + span + 2, i, i ? `${Math.round(saved * 100)}% saved`.padStart(10) : 'full price'.padStart(10), i ? 's' : 'd')
  })
  return g.html()
}

// How many characters fit across a pre, measured once from its own font.
function cols(el) {
  const probe = Object.assign(document.createElement('span'), { textContent: '0'.repeat(10) })
  el.append(probe)
  const charW = probe.getBoundingClientRect().width / 10 || 8
  probe.remove()
  const style = getComputedStyle(el)
  const pad = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
  return () => Math.floor((el.clientWidth - pad) / charW)
}

export function mountFigures({ reduced }) {
  const jobs = []
  for (const el of document.querySelectorAll('[data-fig]')) {
    const draw = figures[el.dataset.fig]
    jobs.push({ el, run: t => (el.innerHTML = draw(t).html()) })
  }
  document.querySelectorAll('[data-glyphs]').forEach((el, i) => {
    jobs.push({ el, run: t => (el.innerHTML = swatch(el.dataset.glyphs, t, i * 5).html()) })
  })
  const meter = document.querySelector('[data-meter]')
  if (meter) {
    meter.innerHTML =
      '<div class="mrow mhead"><span>Agent</span><span>5 hour window left</span><span>Week left</span><span>Resets in</span></div>' +
      POOL.map(([name, key, h5, wk, reset]) =>
        `<div class="mrow"><span>${name}</span><pre data-bar="${key}:${h5}"></pre><pre data-bar="${key}:${wk}"></pre><span class="num">${reset}</span></div>`).join('')
    meter.querySelectorAll('[data-bar]').forEach((el, i) => {
      const [key, left] = el.dataset.bar.split(':')
      jobs.push({ el, run: t => (el.innerHTML = meterRow(+left, ALPHA[key], t, i * 3)) })
    })
  }
  const cacheEl = document.querySelector('[data-fig-wide="cache"]')
  if (cacheEl) {
    const width = cols(cacheEl)
    jobs.push({ el: cacheEl, run: t => (cacheEl.innerHTML = cacheFig(reduced ? 99 : t, width())) })
  }

  const start = performance.now()
  const clock = () => (performance.now() - start) / 1000
  jobs.forEach(j => j.run(reduced ? 2.2 : 0))
  if (reduced) return

  const visible = new Set()
  const io = new IntersectionObserver(entries => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)
  }, { rootMargin: '80px' })
  jobs.forEach(j => io.observe(j.el))

  let last = 0
  function frame(now) {
    requestAnimationFrame(frame)
    if (document.hidden || now - last < 1000 / FPS) return
    last = now
    const t = clock()
    for (const j of jobs) if (visible.has(j.el)) j.run(t)
  }
  requestAnimationFrame(frame)
}

// The furoshiki mark, sampled from its SVG into glyphs. Each quarter around the knot is drawn in a
// different agent's alphabet, so the box is literally made of the four of them.
export async function mountMark(el, { reduced }) {
  if (!el) return
  const img = new Image()
  img.src = 'assets/mark.svg'
  await img.decode().catch(() => {})
  const cols = 64
  const rows = 34
  const c = document.createElement('canvas')
  c.width = cols
  c.height = rows
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, cols, rows)
  const data = ctx.getImageData(0, 0, cols, rows).data
  const order = [ALPHA.claude, ALPHA.codex, ALPHA.grok, ALPHA.gemini]
  const cx = cols / 2
  const cy = rows * 0.52

  function draw(t) {
    let out = ''
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const a = data[(y * cols + x) * 4 + 3] / 255
        if (a < 0.2) { out += ' '; continue }
        const q = (Math.floor(((Math.atan2(y - cy, (x - cx) * 0.5) + Math.PI) / (Math.PI / 2)) + 0.5) % 4 + 4) % 4
        const alpha = order[q]
        const wave = 0.5 + 0.5 * Math.sin(t * 1.4 + x * 0.21 - y * 0.33)
        const v = Math.min(0.999, a * (0.55 + 0.45 * wave) + hash(x, y, Math.floor(t * 2)) * 0.12)
        const ch = esc(alpha[Math.floor(v * alpha.length)])
        out += v > 0.82 ? `<span class="s">${ch}</span>` : ch
      }
      out += '\n'
    }
    el.innerHTML = out
  }

  draw(2)
  if (reduced) return
  let visible = false
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el)
  let last = 0
  ;(function frame(now) {
    requestAnimationFrame(frame)
    if (!visible || document.hidden || now - last < 1000 / 10) return
    last = now
    draw(now / 1000)
  })(0)
}

// Side by side: one question, four columns writing their answers in their own alphabets. When they
// settle, a visitor can keep one; otherwise the figure keeps one itself after a pause and moves on.
const ROUNDS = [
  ['Why does the checkout page load slowly?', 'debugging'],
  ['Write the launch post for Build Night.', 'writing'],
  ['What do people on X say about our pricing?', 'research'],
  ['Add tests for the signup form.', 'tests'],
]
const CREW = [['Claude', 'claude'], ['Codex', 'codex'], ['Grok', 'grok'], ['Gemini', 'gemini']]

export function mountArena(root, { reduced }) {
  if (!root) return
  const ask = root.querySelector('[data-arena-ask]')
  const status = root.querySelector('[data-arena-status]')
  const tallyEl = root.querySelector('[data-arena-tally]')
  const colsEl = root.querySelector('[data-arena-cols]')
  const tally = { claude: 12, codex: 9, grok: 4, gemini: 6 }

  const cols = CREW.map(([name, key]) => {
    const col = document.createElement('div')
    col.className = 'arena-col'
    col.innerHTML = `<div class="arena-name">${name}<small></small></div><pre aria-hidden="true"></pre><button type="button" class="arena-keep" disabled>Keep this one</button>`
    colsEl.append(col)
    return { key, name, col, pre: col.querySelector('pre'), time: col.querySelector('small'), keep: col.querySelector('button') }
  })

  function drawTally(bumped) {
    tallyEl.innerHTML = CREW.map(([name, key]) => `<span${key === bumped ? ' class="bump"' : ''}>${name} <b>${tally[key]}</b></span>`).join('')
  }

  let round = 0
  let started = 0
  let kept = null
  let lengths = []
  let speeds = []

  function begin(now) {
    const [q] = ROUNDS[round % ROUNDS.length]
    ask.textContent = q
    kept = null
    started = now
    lengths = cols.map((_, i) => 5 + Math.floor(hash(round, i) * 4))
    speeds = cols.map((_, i) => 1.6 + hash(i, round, 3) * 1.6)
    for (const c of cols) {
      c.col.classList.remove('kept', 'dim')
      c.keep.disabled = true
      c.keep.textContent = 'Keep this one'
      c.time.textContent = ''
    }
    status.textContent = '4 still working'
  }

  function keep(c) {
    if (kept) return
    kept = c
    tally[c.key]++
    for (const x of cols) {
      x.col.classList.toggle('kept', x === c)
      x.col.classList.toggle('dim', x !== c)
      x.keep.disabled = true
    }
    c.keep.textContent = `+1 ${ROUNDS[round % ROUNDS.length][1]}`
    status.textContent = `You kept ${c.name}`
    drawTally(c.key)
  }
  cols.forEach(c => c.keep.addEventListener('click', () => { keep(c); pauseUntil = performance.now() + 2600 }))

  let pauseUntil = 0
  function draw(now) {
    const t = (now - started) / 1000
    let working = 0
    cols.forEach((c, i) => {
      const lines = lengths[i]
      const done = Math.min(lines, t * speeds[i])
      if (done < lines) working++
      const alpha = ALPHA[c.key]
      let out = ''
      for (let y = 0; y < lines; y++) {
        const full = 14 + Math.floor(hash(y, i, round) * 7)
        const len = y < Math.floor(done) ? full : y === Math.floor(done) ? Math.floor((done % 1) * full) : 0
        for (let x = 0; x < len; x++) {
          const word = x > 1 && hash(x >> 2, y, i + round) > 0.82
          out += word ? ' ' : esc(alpha[1 + Math.floor(hash(x, y, i * 7 + round) * (alpha.length - 1))])
        }
        out += '\n'
      }
      c.pre.innerHTML = out
      if (done >= lines && !c.time.textContent) {
        c.time.textContent = `${(lines / speeds[i] + 1.2).toFixed(1)} s`
        if (!kept) c.keep.disabled = false
      }
    })
    if (!kept) status.textContent = working ? `${working} still working` : 'Keep the answer you like best'
    if (!working && !kept && t > 7) keep(cols[Math.floor(hash(round, 9) * cols.length)])
    if (kept && now > pauseUntil && t > 10) {
      round++
      begin(now)
    }
  }

  drawTally()
  begin(performance.now())
  if (reduced) {
    draw(performance.now() + 60000)
    return
  }
  let visible = false
  let seen = false
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible && !seen) {
      seen = true
      begin(performance.now())
    }
  }, { threshold: 0.3 }).observe(root)
  let last = 0
  ;(function frame(now) {
    requestAnimationFrame(frame)
    if (!visible || document.hidden || now - last < 1000 / 15) return
    last = now
    draw(now)
  })(0)
}
