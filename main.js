/**
 * YashiX Terminal Landing Site Logic
 * Hacker minimal, instant response, zero framework bloat
 */

let GITHUB_REPO_URL = 'https://github.com/Yashi12121/YashiX'

const OS_CONFIG = {
  windows: {
    label: 'Windows',
    command: 'irm https://github.com/Yashi12121/YashiX/releases/download/v0.1.9/YashiX-Setup-0.1.9.exe -OutFile YashiX-Setup.exe; .\\YashiX-Setup.exe',
    hint: 'Run this in PowerShell. It downloads YashiX and starts the installer automatically.',
    downloadUrl: 'https://github.com/Yashi12121/YashiX/releases/download/v0.1.9/YashiX-Setup-0.1.9.exe',
  },
  macos: {
    label: 'macOS',
    command: 'curl -fsSL https://github.com/Yashi12121/YashiX/raw/main/install.sh | bash',
    hint: 'Run this in Terminal. Compatible with Apple Silicon (M1-M4) & Intel chips.',
    downloadUrl: 'https://github.com/Yashi12121/YashiX/releases',
  },
  linux: {
    label: 'Linux',
    command: 'curl -fsSL https://github.com/Yashi12121/YashiX/raw/main/install.sh | bash',
    hint: 'Run this in your shell. Installs the AppImage and registers the desktop icon.',
    downloadUrl: 'https://github.com/Yashi12121/YashiX/releases',
  },
}

function detectOS() {
  const ua = window.navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac')) return 'macos'
  if (ua.includes('linux')) return 'linux'
  return 'windows'
}

let activeOS = 'windows'

document.addEventListener('DOMContentLoaded', () => {
  activeOS = detectOS()
  switchOS(activeOS)
  initDropdown()
  initCopy()
  initGithub(GITHUB_REPO_URL)
})

function switchOS(key) {
  const cfg = OS_CONFIG[key] || OS_CONFIG.windows
  activeOS = key

  const label = document.getElementById('selectedOsLabel')
  const code = document.getElementById('cmdCode')
  const hint = document.getElementById('installHint')

  if (label) label.textContent = cfg.label
  if (code) code.textContent = cfg.command
  if (hint) hint.textContent = cfg.hint

  document.querySelectorAll('.os-option').forEach((opt) => {
    opt.classList.toggle('active', opt.getAttribute('data-os') === key)
  })
}

function initDropdown() {
  const dropdown = document.getElementById('osDropdown')
  const trigger = document.getElementById('osTrigger')
  if (!dropdown || !trigger) return

  trigger.addEventListener('click', (e) => {
    e.stopPropagation()
    dropdown.classList.toggle('open')
  })

  document.querySelectorAll('.os-option').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation()
      const os = opt.getAttribute('data-os')
      if (os) switchOS(os)
      dropdown.classList.remove('open')
    })
  })

  document.addEventListener('click', () => {
    dropdown.classList.remove('open')
  })
}

function initCopy() {
  const btn = document.getElementById('cmdBtn')
  const code = document.getElementById('cmdCode')
  if (!btn || !code) return

  btn.addEventListener('click', async () => {
    const text = code.textContent.trim()
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }

      btn.classList.add('copied', 'shine')
      setTimeout(() => {
        btn.classList.remove('copied')
      }, 2000)
      setTimeout(() => {
        btn.classList.remove('shine')
      }, 900)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  })
}

function initGithub(url) {
  GITHUB_REPO_URL = url
  const ids = ['navGithubLink', 'footerGithubLink']
  ids.forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.href = url
  })
}

window.setGithubUrl = initGithub
