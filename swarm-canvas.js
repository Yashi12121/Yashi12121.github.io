/**
 * YashiX Swarm Constellation Background Canvas
 * Interactive multi-agent neural network visualization
 */
export function mountSwarmCanvas(canvas) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let width = (canvas.width = canvas.offsetWidth)
  let height = (canvas.height = canvas.offsetHeight)

  const AGENTS = [
    { name: 'Claude', color: '#f59e0b', glyph: 'CL' },
    { name: 'Codex', color: '#10b981', glyph: 'CX' },
    { name: 'Gemini', color: '#3b82f6', glyph: 'GM' },
    { name: 'Grok', color: '#ec4899', glyph: 'GK' },
    { name: 'DeepSeek', color: '#06b6d4', glyph: 'DS' },
    { name: 'Ollama', color: '#a855f7', glyph: 'OL' },
  ]

  const NODE_COUNT = 38
  const nodes = []

  for (let i = 0; i < NODE_COUNT; i++) {
    const isNamed = i < AGENTS.length
    const agent = isNamed ? AGENTS[i] : null
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: isNamed ? 3.5 : 2,
      color: isNamed ? agent.color : 'rgba(255, 255, 255, 0.25)',
      isNamed,
      agent,
      pulse: Math.random() * Math.PI * 2,
    })
  }

  let mouse = { x: -1000, y: -1000, active: false }

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth
    height = canvas.height = canvas.offsetHeight
  })

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
    mouse.active = true
  })

  window.addEventListener('mouseleave', () => {
    mouse.active = false
  })

  let lastTime = performance.now()

  function render(now) {
    requestAnimationFrame(render)
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    ctx.clearRect(0, 0, width, height)

    // Update nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      n.x += n.vx
      n.y += n.vy
      n.pulse += dt * 2

      // Wrap edges
      if (n.x < 0) n.x = width
      if (n.x > width) n.x = 0
      if (n.y < 0) n.y = height
      if (n.y > height) n.y = 0

      // Mouse attraction
      if (mouse.active) {
        const dx = mouse.x - n.x
        const dy = mouse.y - n.y
        const dist = Math.hypot(dx, dy)
        if (dist < 180 && dist > 10) {
          const force = (180 - dist) / 180 * 0.08
          n.x += (dx / dist) * force
          n.y += (dy / dist) * force
        }
      }
    }

    // Draw connection lines between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.hypot(dx, dy)
        const maxDist = 130

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()

          // Occasional data packet moving between nodes
          if (a.isNamed || b.isNamed) {
            const t = (Math.sin(now * 0.0018 + i + j) + 1) / 2
            const px = a.x + (b.x - a.x) * t
            const py = a.y + (b.y - a.y) * t
            ctx.fillStyle = a.isNamed ? a.color : b.color
            ctx.beginPath()
            ctx.arc(px, py, 1.2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      ctx.fillStyle = n.color
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
      ctx.fill()

      if (n.isNamed) {
        // Subtle outer pulse glow
        const glowRadius = n.radius + 3 + Math.sin(n.pulse) * 1.5
        ctx.fillStyle = n.color.replace(')', ', 0.18)').replace('rgb', 'rgba')
        ctx.beginPath()
        ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Tiny label
        ctx.font = '500 9px "IBM Plex Mono", monospace'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
        ctx.fillText(n.agent.name, n.x + 8, n.y + 3)
      }
    }
  }

  requestAnimationFrame(render)
}
