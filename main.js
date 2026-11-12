import './nav.js'
import { mountHands } from './hands.js'
import { mountFigures, mountMark, mountArena } from './figures.js'
import { mountAppMockup } from './app-mockup.js'

const RAW = 'https://yashi12121.github.io'
const RELEASES = 'https://api.github.com/repos/Yashi12121/Yashi12121.github.io/releases/latest'

const OS = {
  win: {
    name: 'Windows',
    full: 'irm https://yashi12121.github.io/install.ps1 | iex',
    short: 'irm yashi12121.github.io/install.ps1 | iex',
    note: 'Paste into PowerShell. Downloads and installs YashiX v0.1.9.',
    hint: 'Paste this in PowerShell. It installs YashiX and opens your first swarm room.',
  },
  mac: {
    name: 'macOS',
    full: 'curl -fsSL https://yashi12121.github.io/install.sh | bash',
    short: 'curl -fsSL yashi12121.github.io/install.sh | bash',
    note: 'Installs for Apple Silicon (M1-M4) & Intel.',
    hint: 'Paste this in Terminal on your Mac. It opens the YashiX releases and downloads the .dmg.',
  },
  linux: {
    name: 'Linux',
    full: 'curl -fsSL https://yashi12121.github.io/install.sh | bash',
    short: 'curl -fsSL yashi12121.github.io/install.sh | bash',
    note: 'Installs the deb package or AppImage on any Linux distribution.',
    hint: 'Paste this in a terminal. It opens the YashiX Linux releases.',
  },
}

function detect() {
  const p = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase()
  if (p.includes('win')) return 'win'
  if (p.includes('linux') && !/android/i.test(navigator.userAgent)) return 'linux'
  return 'mac'
}

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const phone = matchMedia('(max-width: 820px) and (pointer: coarse)').matches

// Mount Three.js interactive ASCII hands background
const hands = mountHands(document.querySelector('.hands'), { reduced })
const live = document.querySelector('[data-live]')
const template = document.querySelector('#install-tpl')

// Both install rows share one choice of system
const rows = [...document.querySelectorAll('[data-install]')].map(slot => {
  slot.append(template.content.cloneNode(true))
  const hint = Object.assign(document.createElement('p'), { className: 'install-hint' })
  slot.querySelector('.cmdbox').after(hint)
  return {
    hint,
    cmd: slot.querySelector('.cmd'),
    code: slot.querySelector('code'),
    select: slot.querySelector('[data-os]'),
  }
})

let os = detect()

function show(next) {
  os = next
  const o = OS[os]
  for (const r of rows) {
    r.code.textContent = o.short
    r.cmd.title = `${o.full}\n\n${o.note}`
    r.cmd.setAttribute('aria-label', `Copy the install command for ${o.name}. ${o.note}`)
    r.hint.textContent = phone ? 'YashiX is a desktop app. Open this page on your computer to install it.' : o.hint
    r.select.value = os
  }
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: text })
    document.body.append(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
}

for (const r of rows) {
  let timer
  r.select.addEventListener('change', () => show(r.select.value))
  r.cmd.addEventListener('click', async () => {
    await copy(OS[os].full)
    r.cmd.classList.remove('shine')
    void r.cmd.offsetWidth
    r.cmd.classList.add('copied', 'shine')
    if (live) live.textContent = 'Install command copied'
    hands?.touch()
    clearTimeout(timer)
    timer = setTimeout(() => r.cmd.classList.remove('copied'), 1800)
  })
}

show(os)

// Fetch latest assets from releases API if available
async function loadAssets() {
  try {
    const res = await fetch(RELEASES, { headers: { Accept: 'application/vnd.github+json' } })
    if (!res.ok) return
    const assets = (await res.json()).assets ?? []
    const find = re => assets.find(a => re.test(a.name))?.browser_download_url
    document.querySelectorAll('[data-asset]').forEach(a => {
      const url = find(new RegExp(a.dataset.asset))
      if (url) a.href = url
    })
  } catch {
    // Keep fallback URLs
  }
}
loadAssets()

// Mount 3D App Simulator
mountAppMockup(document.getElementById('appStage'))

// Mount Figures and Benchmark Arena
mountFigures({ reduced })
mountMark(document.querySelector('[data-mark]'), { reduced })
mountArena(document.querySelector('[data-arena]'), { reduced })

// Interactive Room Chapters
const chapterList = document.querySelector('[data-chapters]')
const roomCaption = document.getElementById('roomCaption')
if (chapterList && roomCaption) {
  roomCaption.style.transition = 'opacity 0.15s ease'
  chapterList.addEventListener('click', e => {
    const btn = e.target.closest('.chapter-btn')
    if (!btn) return
    chapterList.querySelectorAll('.chapter-btn').forEach(b => b.removeAttribute('aria-current'))
    btn.setAttribute('aria-current', 'true')
    if (btn.dataset.caption) {
      roomCaption.style.opacity = '0.3'
      setTimeout(() => {
        roomCaption.textContent = btn.dataset.caption
        roomCaption.style.opacity = '1'
      }, 120)
    }
    hands?.touch()
  })
}

// Smooth background ripple on hero interaction
document.querySelector('.hero')?.addEventListener('pointerdown', () => hands?.touch())

