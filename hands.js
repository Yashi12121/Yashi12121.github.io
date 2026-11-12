// Swarm Constellation ASCII Background (o/o/ glyphs)
// An interconnected multi-agent constellation built entirely with ASCII glyphs:
// Nodes: 'o', 'o/o', '(o)', '[o]'
// Connections: Continuous alternating streams of 'o/o/o/' and 'o\o\o\'
// Hubs: Claude, Codex, Grok, Gemini, Coordinator
// Data Pulses: Glowing packets zipping between agent nodes

const FONT = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'

export function mountHands(canvas, { reduced = false } = {}) {
  if (!canvas) return { touch: () => {}, destroy: () => {} }

  const ctx = canvas.getContext('2d')
  if (!ctx) return { touch: () => {}, destroy: () => {} }

  let width = 0
  let height = 0
  let dpr = 1
  let running = false
  let visible = true
  let animationId = null
  let lastTime = performance.now()

  // 4 Major Agent Hubs flanking the hero
  const HUBS_CONFIG = [
    { name: 'CLAUDE', role: 'PLANNER', color: '#f59e0b', relX: 0.10, relY: 0.32 },
    { name: 'CODEX',  role: 'BUILDER', color: '#10b981', relX: 0.90, relY: 0.30 },
    { name: 'GROK',   role: 'TESTER',  color: '#f43f5e', relX: 0.11, relY: 0.78 },
    { name: 'GEMINI', role: 'PROVER',  color: '#38bdf8', relX: 0.89, relY: 0.76 },
  ]

  const CODE_TAGS = [
    'auth.rs', 'bus.rx', 'ast.parse', 'eval.run', 'diff.patch',
    'z3.solver', 'cache.l2', 'pool.exec', 'stream.rx', 'token.ctx',
    'worker.0', 'worker.1', 'state.kv', 'mem.128k', 'task.dag',
    'proof.ok', 'swarm.sh', 'bench.ops',
  ]

  let hubs = []
  let nodes = []
  let stars = []
  let packets = []
  let ripples = []

  const mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    active: false,
    radius: 190,
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = rect.width || window.innerWidth
    height = rect.height || window.innerHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    initConstellation()
  }

  function initConstellation() {
    hubs = []
    nodes = []
    stars = []
    packets = []

    // 1. Initialize Hubs
    hubs = HUBS_CONFIG.map((cfg, idx) => {
      const hx = width * cfg.relX
      const hy = height * cfg.relY
      return {
        id: `hub_${idx}`,
        isHub: true,
        name: cfg.name,
        role: cfg.role,
        color: cfg.color,
        baseX: hx,
        baseY: hy,
        x: hx,
        y: hy,
        vx: 0,
        vy: 0,
        char: '[o]',
        orbitAngle: (idx * Math.PI) / 2,
        orbitSpeed: 0.007 + idx * 0.002,
        glow: 1.0,
        neighbors: [],
      }
    })

    // 2. Ambient background stars (faint floating '·', '.', 'o')
    const starCount = Math.max(35, Math.min(65, Math.round((width * height) / 26000)))
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        char: Math.random() < 0.6 ? '·' : (Math.random() < 0.5 ? '.' : 'o'),
        alpha: 0.08 + Math.random() * 0.14,
      })
    }

    // 3. Worker swarm nodes
    const nodeCount = Math.max(65, Math.min(110, Math.round((width * height) / 12000)))
    const cx = width * 0.5
    const cy = height * 0.38
    const rx = Math.min(440, width * 0.36)
    const ry = Math.min(240, height * 0.28)

    for (let i = 0; i < nodeCount; i++) {
      let nx = Math.random() * width
      let ny = Math.random() * height

      // Check distance to center copy box
      const normDist = Math.hypot((nx - cx) / rx, (ny - cy) / ry)
      if (normDist < 1.0) {
        const ang = Math.atan2((ny - cy) / ry, (nx - cx) / rx)
        nx = cx + Math.cos(ang) * rx * (1.05 + Math.random() * 0.4)
        ny = cy + Math.sin(ang) * ry * (1.05 + Math.random() * 0.4)
      }

      const glyphTypes = ['o', 'o', 'o', '0', '(o)', 'o/o', '*']
      const char = glyphTypes[Math.floor(Math.random() * glyphTypes.length)]
      const hasTag = Math.random() < 0.22
      const tag = hasTag ? CODE_TAGS[Math.floor(Math.random() * CODE_TAGS.length)] : null

      nodes.push({
        id: `node_${i}`,
        isHub: false,
        x: Math.max(12, Math.min(width - 12, nx)),
        y: Math.max(12, Math.min(height - 12, ny)),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        baseAlpha: 0.32 + Math.random() * 0.45,
        glow: 0,
        char,
        tag,
        phase: Math.random() * Math.PI * 2,
        freq: 0.0015 + Math.random() * 0.002,
        neighbors: [],
      })
    }

    updateNeighbors()
  }

  function updateNeighbors() {
    const all = [...hubs, ...nodes]
    const maxDist = Math.min(175, Math.max(135, width * 0.14))

    for (let i = 0; i < all.length; i++) {
      all[i].neighbors = []
    }

    for (let i = 0; i < all.length; i++) {
      const a = all[i]
      for (let j = i + 1; j < all.length; j++) {
        const b = all[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy)
        if (dist < maxDist) {
          a.neighbors.push({ node: b, dist })
          b.neighbors.push({ node: a, dist })
        }
      }
    }
  }

  function spawnPacket(fromNode, toNode, color = null) {
    if (!fromNode || !toNode) return
    packets.push({
      from: fromNode,
      to: toNode,
      progress: 0,
      speed: 0.015 + Math.random() * 0.018,
      char: Math.random() < 0.5 ? 'o' : '0',
      color: color || fromNode.color || 'rgba(255, 255, 255, 0.95)',
    })
  }

  let lastPacketSpawn = 0
  function checkPacketSpawning(now) {
    if (packets.length > 34) return
    if (now - lastPacketSpawn > 150) {
      lastPacketSpawn = now
      const sources = Math.random() < 0.55 ? hubs : nodes
      if (sources.length === 0) return
      const src = sources[Math.floor(Math.random() * sources.length)]
      if (src.neighbors.length > 0) {
        const dest = src.neighbors[Math.floor(Math.random() * src.neighbors.length)].node
        spawnPacket(src, dest, src.color)
      }
    }
  }

  function touch(x, y) {
    const originX = (typeof x === 'number' && !isNaN(x)) ? x : (mouse.active ? mouse.x : width / 2)
    const originY = (typeof y === 'number' && !isNaN(y)) ? y : (mouse.active ? mouse.y : height / 2)

    ripples.push({
      x: originX,
      y: originY,
      radius: 0,
      maxRadius: Math.max(width, height) * 0.9,
      alpha: 1.0,
    })

    const all = [...hubs, ...nodes]
    for (const n of all) {
      const dist = Math.hypot(n.x - originX, n.y - originY)
      if (dist < 450) {
        n.glow = 1.0
        const push = (1 - dist / 450) * 4.2
        const angle = Math.atan2(n.y - originY, n.x - originX)
        n.vx += Math.cos(angle) * push
        n.vy += Math.sin(angle) * push

        if (n.neighbors.length > 0 && Math.random() < 0.8) {
          const dest = n.neighbors[Math.floor(Math.random() * n.neighbors.length)].node
          spawnPacket(n, dest, n.color || '#f59e0b')
        }
      }
    }
  }

  function update(dt, now) {
    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.16
      mouse.y += (mouse.targetY - mouse.y) * 0.16
    }

    // Update Hubs (breathing hover)
    for (const h of hubs) {
      h.orbitAngle += h.orbitSpeed
      const hoverX = Math.cos(h.orbitAngle) * 16
      const hoverY = Math.sin(h.orbitAngle * 1.4) * 14
      h.x = h.baseX + hoverX
      h.y = h.baseY + hoverY
      h.glow = Math.max(0.65, h.glow - dt * 0.5)
    }

    // Update Ambient Stars
    for (const s of stars) {
      s.x += s.vx
      s.y += s.vy
      if (s.x < 0) s.x = width
      if (s.x > width) s.x = 0
      if (s.y < 0) s.y = height
      if (s.y > height) s.y = 0
    }

    // Update Nodes
    const cx = width * 0.5
    const cy = height * 0.38
    const rx = Math.min(440, width * 0.36)
    const ry = Math.min(240, height * 0.28)

    for (const n of nodes) {
      n.phase += n.freq * dt * 60
      n.x += n.vx + Math.cos(n.phase) * 0.16
      n.y += n.vy + Math.sin(n.phase * 0.8) * 0.16

      n.vx *= 0.982
      n.vy *= 0.982

      // Keep center hero area clear of clutter
      const normDist = Math.hypot((n.x - cx) / rx, (n.y - cy) / ry)
      if (normDist < 1.0) {
        const repelForce = (1.0 - normDist) * 0.35
        const ang = Math.atan2((n.y - cy) / ry, (n.x - cx) / rx)
        n.vx += Math.cos(ang) * repelForce
        n.vy += Math.sin(ang) * repelForce
      }

      // Mouse attractor
      if (mouse.active) {
        const mdx = n.x - mouse.x
        const mdy = n.y - mouse.y
        const mdist = Math.hypot(mdx, mdy)
        if (mdist < mouse.radius && mdist > 2) {
          const force = (1 - mdist / mouse.radius) * 0.48
          n.vx += (mdx / mdist) * force
          n.vy += (mdy / mdist) * force
          n.glow = Math.max(n.glow, 0.7)
        }
      }

      // Screen boundary wrap/bounce
      const margin = 16
      if (n.x < margin) { n.x = margin; n.vx = Math.abs(n.vx) * 0.75; }
      if (n.x > width - margin) { n.x = width - margin; n.vx = -Math.abs(n.vx) * 0.75; }
      if (n.y < margin) { n.y = margin; n.vy = Math.abs(n.vy) * 0.75; }
      if (n.y > height - margin) { n.y = height - margin; n.vy = -Math.abs(n.vy) * 0.75; }

      n.glow = Math.max(0, n.glow - dt * 0.65)
    }

    // Update Packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i]
      p.progress += p.speed * (dt * 60)
      if (p.progress >= 1) {
        p.to.glow = 1.0
        if (Math.random() < 0.45 && p.to.neighbors && p.to.neighbors.length > 1) {
          const valid = p.to.neighbors.filter(nbr => nbr.node !== p.from)
          if (valid.length > 0) {
            const next = valid[Math.floor(Math.random() * valid.length)].node
            spawnPacket(p.to, next, p.color)
          }
        }
        packets.splice(i, 1)
      }
    }

    // Update Ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]
      r.radius += dt * 600
      r.alpha = Math.max(0, 1 - (r.radius / r.maxRadius))
      if (r.radius >= r.maxRadius || r.alpha <= 0) {
        ripples.splice(i, 1)
      }
    }

    updateNeighbors()
    checkPacketSpawning(now)
  }

  function render() {
    ctx.clearRect(0, 0, width, height)
    ctx.font = `11px ${FONT}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    const maxDist = Math.min(175, Math.max(135, width * 0.14))
    const stepSize = 11

    // 0. Ambient Stars
    for (const s of stars) {
      ctx.fillStyle = `rgba(240, 238, 230, ${s.alpha})`
      ctx.fillText(s.char, s.x, s.y)
    }

    // 1. Connection Links: Repeating ASCII streams of 'o/o/o/' and 'o\o\o\'
    const all = [...hubs, ...nodes]
    const drawnPairs = new Set()

    for (const a of all) {
      for (const nbr of a.neighbors) {
        const b = nbr.node
        const pairKey = a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`
        if (drawnPairs.has(pairKey)) continue
        drawnPairs.add(pairKey)

        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = nbr.dist
        if (dist > maxDist) continue

        const ratio = 1 - dist / maxDist
        const linkAlpha = Math.pow(ratio, 1.3) * 0.55

        const angle = Math.atan2(dy, dx)
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        let slashChar = '/'
        if (Math.abs(cos) > 0.88) {
          slashChar = '-'
        } else if (Math.abs(sin) > 0.88) {
          slashChar = '|'
        } else if (cos * sin > 0) {
          slashChar = '\\'
        } else {
          slashChar = '/'
        }

        // Faint underlying wire
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(240, 238, 230, ${linkAlpha * 0.12})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw the sequence: 'o / o / o / o /'
        const steps = Math.floor(dist / stepSize)
        if (steps >= 2) {
          for (let s = 1; s < steps; s++) {
            const t = s / steps
            const gx = a.x + dx * t
            const gy = a.y + dy * t

            const glyph = (s % 2 === 0) ? 'o' : slashChar
            const glyphAlpha = linkAlpha * Math.sin(t * Math.PI) * 0.9

            if (glyphAlpha > 0.03) {
              ctx.fillStyle = `rgba(240, 238, 230, ${glyphAlpha})`
              ctx.fillText(glyph, gx, gy)
            }
          }
        }
      }
    }

    // 2. Mouse Coordinator Links ('o / o /' streams connected to cursor)
    if (mouse.active) {
      const mouseNeighbors = all
        .map(n => ({ node: n, dist: Math.hypot(n.x - mouse.x, n.y - mouse.y) }))
        .filter(item => item.dist < mouse.radius)
        .sort((x, y) => x.dist - y.dist)
        .slice(0, 7)

      for (const item of mouseNeighbors) {
        const b = item.node
        const dx = b.x - mouse.x
        const dy = b.y - mouse.y
        const dist = item.dist
        const ratio = 1 - dist / mouse.radius
        const linkAlpha = ratio * 0.75

        const angle = Math.atan2(dy, dx)
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        let slashChar = '/'
        if (Math.abs(cos) > 0.88) slashChar = '-'
        else if (Math.abs(sin) > 0.88) slashChar = '|'
        else if (cos * sin > 0) slashChar = '\\'
        else slashChar = '/'

        const steps = Math.floor(dist / stepSize)
        for (let s = 1; s < steps; s++) {
          const t = s / steps
          const gx = mouse.x + dx * t
          const gy = mouse.y + dy * t
          const glyph = (s % 2 === 0) ? 'o' : slashChar
          ctx.fillStyle = `rgba(245, 158, 11, ${linkAlpha * Math.sin(t * Math.PI) * 0.95})`
          ctx.fillText(glyph, gx, gy)
        }
      }

      ctx.fillStyle = '#ffffff'
      ctx.fillText('[o] COORDINATOR', mouse.x, mouse.y - 15)
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('o', mouse.x, mouse.y)
    }

    // 3. Data Packets (Glowing traveling signals)
    for (const p of packets) {
      const px = p.from.x + (p.to.x - p.from.x) * p.progress
      const py = p.from.y + (p.to.y - p.from.y) * p.progress

      ctx.save()
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 8
      ctx.fillText(p.char, px, py)
      ctx.restore()
    }

    // 4. Ripple shockwaves (Expanding circular 'o / o / \ o \' rings)
    for (const r of ripples) {
      if (r.alpha <= 0) continue
      const count = Math.max(16, Math.floor((2 * Math.PI * r.radius) / 20))
      const dTheta = (Math.PI * 2) / count

      for (let i = 0; i < count; i++) {
        const theta = i * dTheta
        const rx = r.x + Math.cos(theta) * r.radius
        const ry = r.y + Math.sin(theta) * r.radius
        if (rx < -20 || rx > width + 20 || ry < -20 || ry > height + 20) continue

        const glyph = (i % 2 === 0) ? 'o' : (i % 4 === 1 ? '/' : '\\')
        ctx.fillStyle = `rgba(245, 158, 11, ${r.alpha * 0.5})`
        ctx.fillText(glyph, rx, ry)
      }
    }

    // 5. Worker Nodes ('o', 'o/o', '(o)', '0')
    for (const n of nodes) {
      const alpha = Math.min(1.0, n.baseAlpha + n.glow * 0.55)

      if (n.glow > 0.15) {
        ctx.save()
        ctx.shadowColor = 'rgba(255, 255, 255, 0.85)'
        ctx.shadowBlur = Math.round(n.glow * 9)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fillText(n.char, n.x, n.y)
        ctx.restore()
      } else {
        ctx.fillStyle = `rgba(240, 238, 230, ${alpha})`
        ctx.fillText(n.char, n.x, n.y)
      }

      if (n.tag) {
        ctx.fillStyle = `rgba(180, 180, 170, ${alpha * 0.55})`
        ctx.textAlign = 'left'
        ctx.fillText(n.tag, n.x + 8, n.y)
        ctx.textAlign = 'center'
      }
    }

    // 6. Major Hubs (Claude, Codex, Grok, Gemini)
    for (const h of hubs) {
      ctx.save()
      ctx.shadowColor = h.color
      ctx.shadowBlur = 12

      ctx.fillStyle = h.color
      ctx.fillText('[o]', h.x, h.y)

      ctx.fillStyle = '#f2f0ea'
      ctx.font = `600 11px ${FONT}`
      ctx.fillText(h.name, h.x, h.y - 15)

      ctx.fillStyle = h.color
      ctx.font = `9px ${FONT}`
      ctx.fillText(h.role, h.x, h.y + 15)

      const ox1 = h.x + Math.cos(h.orbitAngle * 2) * 20
      const oy1 = h.y + Math.sin(h.orbitAngle * 2) * 20
      const ox2 = h.x - Math.cos(h.orbitAngle * 2) * 20
      const oy2 = h.y - Math.sin(h.orbitAngle * 2) * 20
      ctx.font = `10px ${FONT}`
      ctx.fillStyle = `rgba(240, 238, 230, 0.45)`
      ctx.fillText('o', ox1, oy1)
      ctx.fillText('/', ox2, oy2)

      ctx.restore()
    }
  }

  function loop(now) {
    if (!running) return
    const dt = Math.min((now - lastTime) / 1000, 1 / 30)
    lastTime = now

    update(dt, now)
    render()

    animationId = requestAnimationFrame(loop)
  }

  function start() {
    if (running || !visible || document.hidden || reduced) return
    running = true
    lastTime = performance.now()
    animationId = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect()
    mouse.targetX = e.clientX - rect.left
    mouse.targetY = e.clientY - rect.top
    mouse.active = true
    if (mouse.x < -1000) {
      mouse.x = mouse.targetX
      mouse.y = mouse.targetY
    }
  }

  function onPointerLeave() {
    mouse.active = false
  }

  function onPointerDown(e) {
    const rect = canvas.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    touch(px, py)
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  canvas.addEventListener('pointerleave', onPointerLeave, { passive: true })
  canvas.addEventListener('pointerdown', onPointerDown, { passive: true })

  const resizeObserver = new ResizeObserver(() => {
    resize()
    if (reduced) render()
  })
  resizeObserver.observe(canvas)

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) start()
    else stop()
  })
  intersectionObserver.observe(canvas)

  function onVisibilityChange() {
    if (document.hidden) stop()
    else if (visible) start()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  resize()
  if (reduced) {
    render()
  } else {
    start()
  }

  function destroy() {
    stop()
    window.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerleave', onPointerLeave)
    canvas.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
  }

  return { touch, destroy }
}
