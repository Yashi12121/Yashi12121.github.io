// Interactive 3D YashiX Desktop App Simulator
// Renders the high-fidelity multi-agent workspace directly in the browser with 3D tilt & tab exploration.

export function mountAppMockup(container) {
  if (!container) return

  container.innerHTML = `
    <div class="app-3d-toolbar">
      <div class="app-tabs-nav" data-view-nav>
        <button type="button" class="app-tab-btn active" data-view="room">Swarm Room</button>
        <button type="button" class="app-tab-btn" data-view="newroom">New Room</button>
        <button type="button" class="app-tab-btn" data-view="pool">Pool</button>
        <button type="button" class="app-tab-btn" data-view="flows">Flows</button>
        <button type="button" class="app-tab-btn" data-view="skills">Skills</button>
        <button type="button" class="app-tab-btn" data-view="settings">Settings</button>
      </div>
      <button type="button" class="app-tilt-toggle active" id="tiltToggle">3D Tilt: ON</button>
    </div>

    <div class="app-window tilted" id="appMockWindow">
      <div class="app-window-glare" id="appGlare"></div>

      <!-- App Titlebar -->
      <div class="app-titlebar">
        <div class="app-titlebar-left">
          <div class="app-traffic-lights">
            <span class="app-light close"></span>
            <span class="app-light min"></span>
            <span class="app-light max"></span>
          </div>
          <span class="app-titlebar-name">
            <svg width="12" height="12" viewBox="0 0 32 32" fill="currentColor"><path d="M5 5L13.5 16.5V27H18.5V16.5L27 5H21.2L16 12.4L10.8 5H5Z"/></svg>
            <span id="titlebarHeading">YashiX Desktop &mdash; backend-core</span>
          </span>
        </div>
        <div class="app-titlebar-right">
          <span class="app-live-indicator">
            <span class="app-live-dot"></span>
            <span>4 Agents Active</span>
          </span>
          <span style="opacity: 0.4;">|</span>
          <span style="color: #10b981;">90% Cache Hit</span>
        </div>
      </div>

      <!-- App Main Layout -->
      <div class="app-body">
        <!-- Sidebar -->
        <aside class="app-sidebar">
          <div>
            <div class="app-sidebar-logo">
              <svg viewBox="0 0 32 32"><path d="M5 5L13.5 16.5V27H18.5V16.5L27 5H21.2L16 12.4L10.8 5H5Z"/></svg>
              <span>YashiX</span>
            </div>

            <div class="app-nav-group">
              <div class="app-nav-item" data-sidebar-view="newroom">
                <div class="app-nav-item-left">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 3v10M3 8h10"/></svg>
                  <span>New room</span>
                </div>
                <span class="app-nav-shortcut">Ctrl+N</span>
              </div>
              <div class="app-nav-item" data-sidebar-view="search">
                <div class="app-nav-item-left">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="7" cy="7" r="4.25"/><path d="M10.2 10.2 13 13"/></svg>
                  <span>Search</span>
                </div>
                <span class="app-nav-shortcut">Ctrl+K</span>
              </div>
            </div>

            <div class="app-nav-group">
              <div class="app-nav-item" data-sidebar-view="flows">
                <div class="app-nav-item-left">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="4" cy="4" r="1.5"/><circle cx="12" cy="8" r="1.5"/><circle cx="4" cy="12" r="1.5"/><path d="M5.5 4h2.5c1.5 0 2 1 2.3 2.6M5.5 12h2.5c1.5 0 2-1 2.3-2.6"/></svg>
                  <span>Flows</span>
                </div>
              </div>
              <div class="app-nav-item" data-sidebar-view="pool">
                <div class="app-nav-item-left">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 13.5h11"/><rect x="3.5" y="8" width="2" height="3.5"/><rect x="7" y="5" width="2" height="6.5"/><rect x="10.5" y="2.5" width="2" height="9"/></svg>
                  <span>Pool</span>
                </div>
              </div>
              <div class="app-nav-item" data-sidebar-view="skills">
                <div class="app-nav-item-left">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><polygon points="9 1.5 3.5 9 8 9 7 14.5 13 7 9 7"/></svg>
                  <span>Skills</span>
                </div>
              </div>
            </div>

            <div class="app-sidebar-section-title">Rooms</div>
            <div class="app-room-item active" data-sidebar-view="room">
              <span class="app-room-dot"></span>
              <span>backend-core</span>
            </div>
            <div class="app-room-item" data-sidebar-view="newroom">
              <span style="opacity: 0.3; font-size: 14px;">#</span>
              <span>frontend-design</span>
            </div>
          </div>

          <div class="app-sidebar-footer">
            <div class="app-nav-item" data-sidebar-view="room">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1"/><rect x="9" y="9" width="4.5" height="4.5" rx="1"/></svg>
                <span>Agents 4</span>
              </div>
            </div>
            <div class="app-nav-item" data-sidebar-view="settings">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 5h6M11.5 5h2M2.5 11h2M7.5 11h6"/><circle cx="10" cy="5" r="1.5"/><circle cx="6" cy="11" r="1.5"/></svg>
                <span>Settings</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Viewport -->
        <main class="app-view-viewport" id="appViewport">
          <!-- VIEW 1: ACTIVE ROOM -->
          <div class="app-view-panel active" id="view-room">
            <div class="app-room-topbar">
              <div><strong>backend-core</strong> &nbsp;|&nbsp; Refactor Auth Service &amp; Rate Limiter</div>
              <div>Mode: <strong>Swarm Autonomous</strong></div>
            </div>

            <div class="app-room-layout">
              <!-- Crew Column -->
              <div class="app-crew-column">
                <div class="app-crew-title">Room Crew</div>

                <div class="app-agent-badge highlight" data-crew-agent="claude">
                  <div class="app-agent-name"><span style="color: #d97706;">●</span> Claude Sonnet 4.6</div>
                  <div class="app-agent-role">Lead Architect &amp; Planner</div>
                </div>

                <div class="app-agent-badge" data-crew-agent="gemini">
                  <div class="app-agent-name"><span style="color: #3b82f6;">●</span> Gemini 3.8 Flash</div>
                  <div class="app-agent-role">Fast Context &amp; QA</div>
                </div>

                <div class="app-agent-badge" data-crew-agent="codex">
                  <div class="app-agent-name"><span style="color: #10b981;">●</span> Codex GPT-6</div>
                  <div class="app-agent-role">Implementation IC</div>
                </div>

                <div class="app-agent-badge" data-crew-agent="grok">
                  <div class="app-agent-name"><span style="color: #ef4444;">●</span> Grok 3</div>
                  <div class="app-agent-role">Adversarial Critic</div>
                </div>

                <div class="app-crew-ledger">
                  <div><strong>TOKEN LEDGER</strong></div>
                  <div style="display: flex; justify-content: space-between; margin-top: 4px;"><span>Cached:</span> <span>48.2k (90%)</span></div>
                  <div style="display: flex; justify-content: space-between;"><span>Fresh:</span> <span>5.1k</span></div>
                  <div style="display: flex; justify-content: space-between; color: #10b981; margin-top: 4px;"><span>Net Savings:</span> <span>$0.23/turn</span></div>
                </div>
              </div>

              <!-- Chat Message Stream -->
              <div class="app-chat-stream" id="chatStream">
                <!-- User Msg -->
                <div class="app-msg-card user" id="msg-0000">
                  <div class="app-msg-header"><strong>You</strong> &bull; <span style="opacity: 0.5;">00:00</span></div>
                  <div>Implement high-throughput token bucket rate limiting on the OAuth API, and benchmark it with concurrent unit tests.</div>
                </div>

                <!-- Claude Msg -->
                <div class="app-msg-card" id="msg-0009">
                  <div class="app-msg-header">
                    <span class="app-msg-avatar claude">CL</span>
                    <strong>Claude Sonnet 4.6</strong> &bull; Lead Architect &bull; <span style="opacity: 0.5;">00:09</span>
                  </div>
                  <div>I have decomposed the problem and provisioned the architecture roadmap:</div>
                  <div style="font-family: var(--mono); font-size: 11px; margin: 8px 0; color: #fbbf24;">
                    <div>&check; 1. Extract existing Redis client configuration and fallback memory store</div>
                    <div>&check; 2. Delegate leaky-bucket implementation to @codex</div>
                    <div>&check; 3. Delegate concurrency load test suite to @gemini</div>
                  </div>
                  <div style="font-size: 11px; color: #d97706;">&rarr; Handed off component implementation to Codex GPT-6</div>
                </div>

                <!-- Grok Msg -->
                <div class="app-msg-card" id="msg-0019">
                  <div class="app-msg-header">
                    <span class="app-msg-avatar grok">GK</span>
                    <strong>Grok 3</strong> &bull; Adversarial Critic &bull; <span style="opacity: 0.5;">00:19</span>
                  </div>
                  <div>Audit notice: Identified race conditions under Redis cluster failover. Ensure atomic LUA script evaluation with local memory ring buffer to avoid request starvation.</div>
                </div>

                <!-- Codex Msg -->
                <div class="app-msg-card" id="msg-0023">
                  <div class="app-msg-header">
                    <span class="app-msg-avatar codex">CX</span>
                    <strong>Codex GPT-6</strong> &bull; Implementation IC &bull; <span style="opacity: 0.5;">00:23</span>
                  </div>
                  <div>Implemented atomic token bucket rate limiter with zero-copy ring buffer:</div>
                  <pre class="app-code-box"><code>export class TokenBucketLimiter {
  constructor(private capacity = 100, private refillRate = 20) {}
  async acquire(tokens = 1): Promise&lt;boolean&gt; {
    return redis.eval(LUA_BUCKET_SCRIPT, [this.key], [this.capacity, tokens])
  }
}</code></pre>
                </div>

                <!-- Gemini Msg -->
                <div class="app-msg-card" id="msg-0034">
                  <div class="app-msg-header">
                    <span class="app-msg-avatar gemini">GM</span>
                    <strong>Gemini 3.8 Flash</strong> &bull; Verification &bull; <span style="opacity: 0.5;">00:34</span>
                  </div>
                  <div>Executed 5,000 concurrent mock bursts against the rate limiter. Latency: 0.82ms. 0 dropped requests.</div>
                  <div class="app-proof-pass">&check; rate_limiter_burst_recovery (0.82ms) pass</div>
                  <div class="app-proof-pass">&check; redis_partition_failover_memory (1.14ms) pass</div>
                </div>

                <!-- Proof check -->
                <div class="app-msg-card" id="msg-0041" style="border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.05);">
                  <div class="app-msg-header" style="color: #10b981;">
                    <strong>PROOF VERIFICATION COMPLETE</strong> &bull; <span style="opacity: 0.7;">00:41</span>
                  </div>
                  <div style="font-size: 12px; color: #a7f3d0;">
                    All 18 edge assertions passed with exit code 0. Zero memory leaks detected. Ready to commit.
                  </div>
                </div>
              </div>

              <!-- Chat Input Bar -->
              <form class="app-chat-input-bar" id="chatDemoForm">
                <input type="text" class="app-chat-input" id="chatInput" placeholder="Message the room. @ to address one agent, ! to run a command." />
                <button type="submit" class="app-chat-send">Send</button>
              </form>
            </div>
          </div>

          <!-- VIEW 2: NEW ROOM -->
          <div class="app-view-panel" id="view-newroom">
            <div class="app-newroom-container">
              <pre class="app-newroom-ascii">
    fl})/&gt;&lt;&lt;!!\&lt;&lt;+=====----+-&gt;(1fYnSee2n7vvrrfccx3YY3Y?i(&lt;=-;;;:::--&gt;(1f3un257r[/+~-::::~+\{j?7YYvjt[|!
    c[])/&gt;&gt;&gt;&gt;&gt;&gt;&gt;&lt;&lt;++===---++\[1zneee05Yzft[]}{11rx204Z4ex[&lt;=-;;--+&gt;|rz3Y7Y?r}|&lt;=-;;;;~+![c?353Yxt}{(!
    codex + gemini (dynamic budget) | 90% cache hit</pre>
              <h2 class="app-newroom-title">What are we working on?</h2>
              
              <div class="app-newroom-box">
                <textarea class="app-newroom-textarea" placeholder="Describe the goal in your own words. The crew plans it, splits it up and checks each other's work."></textarea>
                <div class="app-newroom-tools">
                  <div>✦ 4 agents &nbsp;|&nbsp; Swarm Mode &nbsp;|&nbsp; Auto</div>
                  <div>Full access</div>
                </div>
              </div>

              <div class="app-chip-list">
                <div class="app-chip-row">
                  <button type="button" class="app-chip" data-preset="review">Review this folder and tell me what to fix first</button>
                  <button type="button" class="app-chip" data-preset="research">Research a topic with sources</button>
                </div>
                <div class="app-chip-row">
                  <button type="button" class="app-chip" data-preset="tool">Build a small tool and test it</button>
                  <button type="button" class="app-chip" data-preset="audit">Audit rate limiting &amp; race conditions</button>
                </div>
              </div>
            </div>
          </div>

          <!-- VIEW 3: POOL -->
          <div class="app-view-panel" id="view-pool">
            <div class="app-pool-container">
              <div class="app-pool-header">
                <h2>Pool</h2>
                <p>Every plan, key and local model you have, as one allowance. Work goes to whoever is best at it.</p>
              </div>

              <div class="app-pool-stats-grid">
                <div class="app-pool-stat-card">
                  <label>Today</label>
                  <div class="val">26¢</div>
                  <div class="sub">106k tokens</div>
                </div>
                <div class="app-pool-stat-card">
                  <label>Last 7 days</label>
                  <div class="val">26¢</div>
                  <div class="sub">106k tokens</div>
                </div>
                <div class="app-pool-stat-card">
                  <label>Served from cache</label>
                  <div class="val" style="color: #10b981;">45%</div>
                  <div class="sub">84k tokens saved</div>
                </div>
                <div class="app-pool-stat-card">
                  <label>Your weekly pool</label>
                  <div class="val">312k</div>
                  <div class="sub">265k left this week</div>
                </div>
              </div>

              <div>
                <div style="font: 500 12px/1 var(--mono); color: var(--faint); margin-bottom: 8px;">Two weeks cost per day</div>
                <div class="app-chart-bars">
                  <div class="app-chart-col" style="height: 18%;"></div>
                  <div class="app-chart-col" style="height: 25%;"></div>
                  <div class="app-chart-col" style="height: 14%;"></div>
                  <div class="app-chart-col" style="height: 38%;"></div>
                  <div class="app-chart-col" style="height: 52%;"></div>
                  <div class="app-chart-col" style="height: 40%;"></div>
                  <div class="app-chart-col" style="height: 60%;"></div>
                  <div class="app-chart-col" style="height: 30%;"></div>
                  <div class="app-chart-col" style="height: 45%;"></div>
                  <div class="app-chart-col" style="height: 70%;"></div>
                  <div class="app-chart-col" style="height: 55%;"></div>
                  <div class="app-chart-col" style="height: 80%;"></div>
                  <div class="app-chart-col" style="height: 65%;"></div>
                  <div class="app-chart-col today" style="height: 90%;"></div>
                </div>
              </div>

              <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 16px;">
                <div style="font: 500 12px/1 var(--mono); margin-bottom: 12px; color: var(--fg);">Connected Providers</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
                  <span>Codex Plus plan</span>
                  <span style="color: #10b981;">85% week left (265k of 312k)</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span>Antigravity CLI (Google Account)</span>
                  <span style="color: #10b981;">100% left (1,000 / 1,000 reqs)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- VIEW 4: FLOWS -->
          <div class="app-view-panel" id="view-flows">
            <div class="app-flows-container">
              <div>
                <h2 style="font: 600 20px/1.2 var(--sans); color: var(--fg); margin-bottom: 4px;">Flows</h2>
                <p style="color: var(--faint); font-size: 13px;">Autonomous multi-agent DAG pipelines executed in isolated workspaces.</p>
              </div>

              <div class="app-flow-pipeline">
                <div class="app-flow-node active">
                  <div style="font: 600 12px/1 var(--mono); color: #d97706;">1. PLAN</div>
                  <div style="font-size: 11px; color: var(--faint); margin-top: 4px;">Claude Sonnet</div>
                </div>
                <div class="app-flow-arrow">&rarr;</div>
                <div class="app-flow-node active">
                  <div style="font: 600 12px/1 var(--mono); color: #10b981;">2. CODE</div>
                  <div style="font-size: 11px; color: var(--faint); margin-top: 4px;">Codex GPT-6</div>
                </div>
                <div class="app-flow-arrow">&rarr;</div>
                <div class="app-flow-node active">
                  <div style="font: 600 12px/1 var(--mono); color: #ef4444;">3. AUDIT</div>
                  <div style="font-size: 11px; color: var(--faint); margin-top: 4px;">Grok 3</div>
                </div>
                <div class="app-flow-arrow">&rarr;</div>
                <div class="app-flow-node active">
                  <div style="font: 600 12px/1 var(--mono); color: #3b82f6;">4. VERIFY</div>
                  <div style="font-size: 11px; color: var(--faint); margin-top: 4px;">Gemini Flash</div>
                </div>
                <div class="app-flow-arrow">&rarr;</div>
                <div class="app-flow-node">
                  <div style="font: 600 12px/1 var(--mono); color: var(--fg);">5. COMMIT</div>
                  <div style="font-size: 11px; color: var(--faint); margin-top: 4px;">Git Worktree</div>
                </div>
              </div>
            </div>
          </div>

          <!-- VIEW 5: SKILLS -->
          <div class="app-skills-container" id="view-skills">
            <div>
              <h2 style="font: 600 20px/1.2 var(--sans); color: var(--fg); margin-bottom: 4px;">Installed Skills</h2>
              <p style="color: var(--faint); font-size: 13px;">Specialized agent capabilities bundled with scripts, schemas and guidelines.</p>
            </div>

            <div class="app-skills-grid">
              <div class="app-skill-card">
                <h4>ui-ux-pro-max</h4>
                <p>54 design systems, typography hierarchy, component polish and styling rules.</p>
              </div>
              <div class="app-skill-card">
                <h4>agent-browser</h4>
                <p>Sandboxed Chromium browser automation CLI with visual element snapshotting.</p>
              </div>
              <div class="app-skill-card">
                <h4>brainstorming</h4>
                <p>Design alignment, requirements interrogation and stress-testing before code.</p>
              </div>
              <div class="app-skill-card">
                <h4>caveman-compress</h4>
                <p>Ultra-dense token compression mode: saves ~75% prompt context budget.</p>
              </div>
            </div>
          </div>

          <!-- VIEW 6: SETTINGS -->
          <div class="app-view-panel" id="view-settings">
            <div class="app-pool-container">
              <div>
                <h2 style="font: 600 20px/1.2 var(--sans); color: var(--fg); margin-bottom: 4px;">Settings</h2>
                <p style="color: var(--faint); font-size: 13px;">Manage model providers, sandbox boundaries and performance caching.</p>
              </div>

              <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="color: var(--fg); font-weight: 500;">Aggressive Context Cache</div>
                    <div style="color: var(--faint); font-size: 11px;">Reuse prompt tokens across turns up to 90% cache hit</div>
                  </div>
                  <span style="color: #10b981; font-weight: 600;">ENABLED</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="color: var(--fg); font-weight: 500;">Local LLMs (Ollama / vLLM)</div>
                    <div style="color: var(--faint); font-size: 11px;">http://localhost:11434</div>
                  </div>
                  <span style="color: var(--dim);">DISCOVERED (3 models)</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Toast Feedback -->
      <div class="app-toast" id="appToast">Interactive Preview: Explore all screens via sidebar &amp; chapters!</div>
    </div>
  `

  // Interactive Logic
  const appWindow = document.getElementById('appMockWindow')
  const appGlare = document.getElementById('appGlare')
  const tiltToggle = document.getElementById('tiltToggle')
  const titlebarHeading = document.getElementById('titlebarHeading')
  const toast = document.getElementById('appToast')
  const chatStream = document.getElementById('chatStream')

  let is3D = true

  // View Switching
  function switchView(viewName) {
    document.querySelectorAll('.app-view-panel').forEach(p => p.classList.remove('active'))
    document.querySelectorAll('.app-tab-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.app-nav-item').forEach(b => b.classList.remove('active'))

    const targetPanel = document.getElementById(`view-${viewName}`)
    if (targetPanel) targetPanel.classList.add('active')

    const topBtn = document.querySelector(`.app-tab-btn[data-view="${viewName}"]`)
    if (topBtn) topBtn.classList.add('active')

    const sideBtn = document.querySelector(`.app-nav-item[data-sidebar-view="${viewName}"]`)
    if (sideBtn) sideBtn.classList.add('active')

    if (titlebarHeading) {
      const titles = {
        room: 'YashiX Desktop — backend-core [Swarm]',
        newroom: 'YashiX Desktop — New room',
        pool: 'YashiX Desktop — Pool & Token Allowance',
        flows: 'YashiX Desktop — Autonomous Flows',
        skills: 'YashiX Desktop — Skills Catalog',
        settings: 'YashiX Desktop — Settings',
      }
      titlebarHeading.textContent = titles[viewName] || 'YashiX Desktop'
    }
  }

  // Top Nav clicks
  container.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view))
  })

  // Sidebar clicks
  container.querySelectorAll('[data-sidebar-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.sidebarView))
  })

  // Prompt Preset chips
  container.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Launching simulated multi-agent swarm run...')
      switchView('room')
      if (chatStream) {
        chatStream.scrollTop = 0
      }
    })
  })

  // Simulated Chat Submission (No external API calls)
  const chatForm = document.getElementById('chatDemoForm')
  const chatInput = document.getElementById('chatInput')
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', e => {
      e.preventDefault()
      const val = chatInput.value.trim()
      if (!val) return
      chatInput.value = ''
      showToast('Simulated Sandbox: Claude analyzes requirements -> Codex drafts implementation -> Gemini verifies proof.')
      
      const newCard = document.createElement('div')
      newCard.className = 'app-msg-card user'
      newCard.innerHTML = `<div class="app-msg-header"><strong>You</strong> &bull; Just now</div><div>${escapeHtml(val)}</div>`
      chatStream.appendChild(newCard)
      chatStream.scrollTop = chatStream.scrollHeight
    })
  }

  function showToast(msg) {
    if (!toast) return
    toast.textContent = msg
    toast.classList.add('show')
    setTimeout(() => toast.classList.remove('show'), 2800)
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
  }

  // 3D Tilt Toggle
  if (tiltToggle && appWindow) {
    tiltToggle.addEventListener('click', () => {
      is3D = !is3D
      if (is3D) {
        tiltToggle.textContent = '3D Tilt: ON'
        tiltToggle.classList.add('active')
        appWindow.classList.add('tilted')
      } else {
        tiltToggle.textContent = '3D Tilt: OFF'
        tiltToggle.classList.remove('active')
        appWindow.classList.remove('tilted')
        appWindow.style.transform = 'none'
      }
    })
  }

  // Mouse Move Tilt Tracker
  let targetRotX = 4
  let targetRotY = -4
  let currentRotX = 4
  let currentRotY = -4
  let animId = null

  function updateTilt() {
    if (!is3D || !appWindow) return
    currentRotX += (targetRotX - currentRotX) * 0.1
    currentRotY += (targetRotY - currentRotY) * 0.1
    appWindow.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`
    animId = requestAnimationFrame(updateTilt)
  }
  animId = requestAnimationFrame(updateTilt)

  container.addEventListener('mousemove', e => {
    if (!is3D) return
    const rect = container.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    targetRotY = (x - 0.5) * 12
    targetRotX = -(y - 0.5) * 10

    if (appGlare) {
      appGlare.style.background = `radial-gradient(circle at ${(x * 100).toFixed(0)}% ${(y * 100).toFixed(0)}%, rgba(255, 255, 255, 0.08), transparent 60%)`
    }
  })

  container.addEventListener('mouseleave', () => {
    if (!is3D) return
    targetRotX = 4
    targetRotY = -4
    if (appGlare) {
      appGlare.style.background = 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.06), transparent 70%)'
    }
  })

  // Hook into chapter clicks from the main page
  const chapters = document.querySelector('[data-chapters]')
  if (chapters) {
    chapters.addEventListener('click', e => {
      const btn = e.target.closest('.chapter-btn')
      if (!btn) return
      const tc = btn.querySelector('.tc')?.textContent?.trim()
      switchView('room')

      // Highlight target message
      document.querySelectorAll('.app-msg-card').forEach(c => c.classList.remove('highlight'))
      let targetId = 'msg-0000'
      if (tc === '00:09') targetId = 'msg-0009'
      else if (tc === '00:19') targetId = 'msg-0019'
      else if (tc === '00:23') targetId = 'msg-0023'
      else if (tc === '00:34') targetId = 'msg-0034'
      else if (tc === '00:41') targetId = 'msg-0041'

      const targetEl = document.getElementById(targetId)
      if (targetEl && chatStream) {
        targetEl.classList.add('highlight')
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  }
}
