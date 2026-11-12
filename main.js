import { mountSwarmCanvas } from './swarm-canvas.js'

// 1. Initialize Interactive Swarm Canvas in Hero
const canvas = document.getElementById('swarmCanvas')
if (canvas) {
  mountSwarmCanvas(canvas)
}

// 2. Install Bar OS Tab Switching & Clipboard Copy
const CMDS = {
  win: 'irm https://raw.githubusercontent.com/Yashi12121/YashiX/main/install.ps1 | iex',
  mac: 'curl -fsSL https://raw.githubusercontent.com/Yashi12121/YashiX/main/install.sh | bash',
  linux: 'curl -fsSL https://raw.githubusercontent.com/Yashi12121/YashiX/main/install.sh | bash',
}

let activeOS = 'win'

// Detect visitor OS
const ua = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase()
if (ua.includes('mac')) activeOS = 'mac'
else if (ua.includes('linux')) activeOS = 'linux'
else activeOS = 'win'

const cmdDisplay = document.getElementById('cmdDisplay')
const btnCopyCmd = document.getElementById('btnCopyCmd')
const copyLabel = document.getElementById('copyLabel')
const osTabs = document.querySelectorAll('.os-tab')

function switchTab(os) {
  activeOS = os
  if (cmdDisplay) cmdDisplay.textContent = CMDS[os]
  osTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === os))
}

osTabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab))
})
switchTab(activeOS)

if (btnCopyCmd) {
  let timer
  btnCopyCmd.addEventListener('click', async () => {
    const text = CMDS[activeOS]
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      }
      btnCopyCmd.classList.add('copied')
      if (copyLabel) copyLabel.textContent = 'Copied!'
      clearTimeout(timer)
      timer = setTimeout(() => {
        btnCopyCmd.classList.remove('copied')
        if (copyLabel) copyLabel.textContent = 'Copy'
      }, 2000)
    } catch {
      // Fallback
    }
  })
}

// 3. Real App Screenshot Tab Switcher
const tabWorkspace = document.getElementById('tabWorkspace')
const tabPool = document.getElementById('tabPool')
const appScreenshotImg = document.getElementById('appScreenshotImg')
const windowTitleText = document.getElementById('windowTitleText')

if (tabWorkspace && tabPool && appScreenshotImg && windowTitleText) {
  tabWorkspace.addEventListener('click', () => {
    tabWorkspace.classList.add('active')
    tabPool.classList.remove('active')
    appScreenshotImg.src = 'assets/app-preview.jpg'
    windowTitleText.innerHTML = 'YashiX Desktop &mdash; What are we working on?'
  })

  tabPool.addEventListener('click', () => {
    tabPool.classList.add('active')
    tabWorkspace.classList.remove('active')
    appScreenshotImg.src = 'assets/screen-pool.jpg'
    windowTitleText.innerHTML = 'YashiX Desktop &mdash; Pool &amp; Allowance Dashboard'
  })
}
