/**
 * YashiX Website Interactive Logic
 * Clean, lightweight, zero dependencies
 */

// GitHub repository URL placeholder - user will provide their repo link
let GITHUB_REPO_URL = 'https://github.com/yashix/yashix'

// OS configuration dictionary
const OS_CONFIG = {
  windows: {
    label: 'Windows',
    tag: 'PowerShell',
    command: 'irm https://yashix.dev/install.ps1 | iex',
    note: 'Run this in PowerShell. It installs YashiX and configures all agent CLIs automatically.',
    downloadText: 'Or download .exe installer',
    downloadUrl: '#download',
  },
  macos: {
    label: 'macOS',
    tag: 'Apple Silicon & Intel',
    command: 'curl -fsSL https://yashix.dev/install.sh | bash',
    note: 'Run this in Terminal. Installs YashiX for macOS (Universal binary for M1-M4 & Intel).',
    downloadText: 'Or download .dmg file',
    downloadUrl: '#download',
  },
  linux: {
    label: 'Linux',
    tag: 'AppImage / Bash',
    command: 'curl -fsSL https://yashix.dev/install.sh | bash',
    note: 'Run this in bash. Installs YashiX AppImage and registers the desktop icon.',
    downloadText: 'Or download AppImage',
    downloadUrl: '#download',
  },
}

// Auto-detect client operating system
function detectClientOS() {
  const ua = window.navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac')) return 'macos'
  if (ua.includes('linux')) return 'linux'
  return 'windows'
}

let currentOS = 'windows'

document.addEventListener('DOMContentLoaded', () => {
  // Update GitHub links
  updateGithubLinks(GITHUB_REPO_URL)

  // Initialize OS detection
  currentOS = detectClientOS()
  applyOS(currentOS)

  // Setup OS dropdown
  setupOsDropdown()

  // Setup copy button
  setupCopyButton()

  // Setup mobile navigation
  setupMobileNav()
})

function applyOS(osKey) {
  const cfg = OS_CONFIG[osKey] || OS_CONFIG.windows
  currentOS = osKey

  // Update label
  const labelEl = document.getElementById('selectedOsLabel')
  if (labelEl) labelEl.textContent = cfg.label

  // Update command
  const cmdEl = document.getElementById('installCommand')
  if (cmdEl) cmdEl.textContent = cfg.command

  // Update footnote
  const noteEl = document.getElementById('osNoteText')
  if (noteEl) noteEl.textContent = cfg.note

  // Update direct download link text
  const directLink = document.getElementById('directDownloadLink')
  if (directLink) {
    directLink.textContent = cfg.downloadText
    directLink.href = cfg.downloadUrl
  }

  // Update active item in dropdown menu
  document.querySelectorAll('.os-item').forEach((item) => {
    const isTarget = item.getAttribute('data-os') === osKey
    item.classList.toggle('active', isTarget)
    item.setAttribute('aria-selected', isTarget ? 'true' : 'false')
  })
}

function setupOsDropdown() {
  const dropdown = document.getElementById('osDropdown')
  const trigger = document.getElementById('osTrigger')
  const menu = document.getElementById('osMenu')

  if (!dropdown || !trigger || !menu) return

  // Toggle dropdown
  trigger.addEventListener('click', (e) => {
    e.stopPropagation()
    const isOpen = dropdown.classList.toggle('open')
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
  })

  // Select item
  document.querySelectorAll('.os-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation()
      const os = item.getAttribute('data-os')
      if (os && OS_CONFIG[os]) {
        applyOS(os)
      }
      dropdown.classList.remove('open')
      trigger.setAttribute('aria-expanded', 'false')
    })
  })

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open')
      trigger.setAttribute('aria-expanded', 'false')
    }
  })

  // Escape key closes dropdown
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      dropdown.classList.remove('open')
      trigger.setAttribute('aria-expanded', 'false')
      trigger.focus()
    }
  })
}

function setupCopyButton() {
  const copyBtn = document.getElementById('copyBtn')
  const cmdEl = document.getElementById('installCommand')
  const tooltip = document.getElementById('copiedTooltip')

  if (!copyBtn || !cmdEl || !tooltip) return

  copyBtn.addEventListener('click', async () => {
    const textToCopy = cmdEl.textContent.trim()
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        // Fallback for older environments
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      // Show toast
      tooltip.classList.add('show')
      setTimeout(() => {
        tooltip.classList.remove('show')
      }, 2000)
    } catch (err) {
      console.error('Failed to copy command:', err)
    }
  })
}

function setupMobileNav() {
  const toggle = document.getElementById('mobileToggle')
  const navLinks = document.getElementById('navLinks')

  if (!toggle || !navLinks) return

  toggle.addEventListener('click', () => {
    const isVisible = navLinks.style.display === 'flex'
    navLinks.style.display = isVisible ? 'none' : 'flex'
    if (!isVisible) {
      navLinks.style.position = 'absolute'
      navLinks.style.top = '64px'
      navLinks.style.left = '0'
      navLinks.style.width = '100%'
      navLinks.style.background = 'rgba(14, 13, 11, 0.98)'
      navLinks.style.flexDirection = 'column'
      navLinks.style.padding = '20px'
      navLinks.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)'
    }
  })
}

function updateGithubLinks(url) {
  GITHUB_REPO_URL = url
  const ids = ['navGithubLink', 'bannerGithubBtn', 'footerGithubLink']
  ids.forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.href = url
  })
}

// Global hook so user can update the GitHub URL easily at runtime or via console
window.setGithubUrl = updateGithubLinks
