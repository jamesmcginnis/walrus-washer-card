/**
 * Walrus Washer Card
 * Washing machine cycle progress card for Home Assistant.
 * For Home Assistant — https://github.com/jamesmcginnis/walrus-washer-card
 */

// ═══════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════

const STYLES = `
  :host { display: block; }
  ha-card {
    padding: 0; overflow: hidden;
    font-family: var(--primary-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
  }

  /* ── Header ──────────────────────────────────────────────────── */
  .ww-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px 0; gap: 8px;
  }
  .ww-name {
    font-size: 12px; font-weight: 600;
    color: var(--primary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    cursor: pointer; flex: 1; min-width: 0;
    letter-spacing: 0.01em;
  }
  .ww-name:hover { opacity: 0.75; }

  /* ── Status pill — possum style ──────────────────────────────── */
  .ww-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px 4px 7px; border-radius: 20px;
    background: rgba(255,255,255,0.09);
    border: 1px solid rgba(255,255,255,0.14);
    cursor: pointer; user-select: none; -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s, border-color 0.3s, color 0.3s;
    font-size: 11px; font-weight: 600;
    color: rgba(255,255,255,0.80);
    letter-spacing: 0.04em; white-space: nowrap; flex-shrink: 0;
  }
  .ww-pill:hover  { background: rgba(255,255,255,0.15); }
  .ww-pill:active { background: rgba(255,255,255,0.20); }

  .ww-pill-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(255,255,255,0.35); flex-shrink: 0;
    transition: background 0.35s;
  }

  /* ── Body ────────────────────────────────────────────────────── */
  .ww-body {
    display: flex; justify-content: center;
    padding: 8px 12px 10px;
  }

  /* Ring wrapper */
  .ww-ring-wrap {
    position: relative; width: 80px; height: 80px;
    cursor: pointer; -webkit-tap-highlight-color: transparent;
  }
  .ww-ring-wrap svg { display: block; }

  /* Centre content over the ring */
  .ww-ring-center {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    pointer-events: none; gap: 1px;
  }

  .ww-machine-icon {
    display: flex; align-items: center; justify-content: center;
    transform-origin: center;
  }

  .ww-time-val {
    font-size: 16px; font-weight: 700; line-height: 1;
    letter-spacing: -0.4px;
    color: var(--primary-text-color);
  }
  .ww-time-unit {
    font-size: 8px; font-weight: 500; letter-spacing: 0.03em;
    color: var(--secondary-text-color);
    line-height: 1;
  }

  /* ── Animations ──────────────────────────────────────────────── */
  /* Gentle arc breathe while a cycle is running */
  @keyframes ww-breathe {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.55; }
  }
  /* Spin for active phases — identical rhythm to raccoon cleaning ring */
  @keyframes ww-icon-spin {
    0%   { transform: rotate(0deg)   scale(1);    opacity: 1;   }
    25%  { transform: rotate(90deg)  scale(1.14); opacity: 0.7; }
    50%  { transform: rotate(180deg) scale(1);    opacity: 1;   }
    75%  { transform: rotate(270deg) scale(1.14); opacity: 0.7; }
    100% { transform: rotate(360deg) scale(1);    opacity: 1;   }
  }
  /* Done pulse */
  @keyframes ww-done-pulse {
    0%,100% { opacity: 1;    transform: scale(1);    }
    50%      { opacity: 0.7;  transform: scale(1.10); }
  }

  .ww-ring-wrap.is-active #ww-arc {
    animation: ww-breathe 2.4s ease-in-out infinite;
  }
  .ww-ring-wrap.is-active .ww-machine-icon {
    animation: ww-icon-spin 1.6s ease-in-out infinite;
  }
  .ww-ring-wrap.is-done .ww-time-val {
    animation: ww-done-pulse 1.8s ease-in-out infinite;
  }


`;

// ═══════════════════════════════════════════════════════════════════
//  EDITOR STYLES
// ═══════════════════════════════════════════════════════════════════

const EDITOR_STYLES = `
  .container {
    display: flex; flex-direction: column; gap: 20px;
    padding: 12px;
    color: var(--primary-text-color);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .section-title {
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: #888; margin-bottom: 2px;
  }
  .card-block {
    background: var(--card-background-color);
    border: 1px solid rgba(128,128,128,0.15);
    border-radius: 12px; overflow: hidden;
  }
  .text-row { padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
  .text-row label { font-size: 14px; font-weight: 500; }
  .text-row .hint { font-size: 11px; color: #888; margin-top: -2px; }

  .select-row { padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
  .select-row label { font-size: 14px; font-weight: 500; }
  .select-row .hint { font-size: 11px; color: #888; margin-top: -2px; }
  .select-row + .select-row { border-top: 1px solid rgba(128,128,128,0.10); }

  input[type="text"], input[type="number"] {
    width: 100%; box-sizing: border-box;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    border: 1px solid rgba(128,128,128,0.20);
    border-radius: 8px; padding: 10px 12px; font-size: 14px;
    font-family: inherit;
  }
  input[type="text"]:focus, input[type="number"]:focus { outline: none; border-color: #007AFF; }

  .entity-search {
    padding: 7px 12px !important; font-size: 12px !important;
    background: rgba(128,128,128,0.06) !important;
  }

  select {
    width: 100%;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    border: 1px solid rgba(128,128,128,0.20);
    border-radius: 8px; padding: 10px 12px; font-size: 14px;
    cursor: pointer; -webkit-appearance: none; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 32px;
  }
  select:focus { outline: none; border-color: #007AFF; }
  select option { background: var(--card-background-color); }

  .toggle-list { display: flex; flex-direction: column; }
  .toggle-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 16px;
    border-bottom: 1px solid rgba(128,128,128,0.08);
    min-height: 52px;
  }
  .toggle-item:last-child { border-bottom: none; }
  .toggle-label { font-size: 14px; font-weight: 500; flex: 1; padding-right: 12px; }
  .toggle-desc  { font-size: 11px; color: #888; margin-top: 2px; }

  /* iOS-style toggle */
  .toggle-switch { position: relative; width: 51px; height: 31px; flex-shrink: 0; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .toggle-track {
    position: absolute; inset: 0; border-radius: 31px;
    background: rgba(120,120,128,0.32); cursor: pointer;
    transition: background 0.25s ease;
  }
  .toggle-track::after {
    content: ''; position: absolute;
    width: 27px; height: 27px; border-radius: 50%;
    background: #fff; top: 2px; left: 2px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transition: transform 0.25s ease;
  }
  .toggle-switch input:checked + .toggle-track { background: #34C759; }
  .toggle-switch input:checked + .toggle-track::after { transform: translateX(20px); }

  .badge-optional {
    display: inline-block;
    font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
    text-transform: uppercase;
    background: rgba(128,128,128,0.12); color: #888;
    border: 1px solid rgba(128,128,128,0.25);
    border-radius: 4px; padding: 1px 5px;
    margin-left: 6px; vertical-align: middle;
  }
  .badge-required {
    display: inline-block;
    font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
    text-transform: uppercase;
    background: rgba(0,122,255,0.15); color: #007AFF;
    border: 1px solid rgba(0,122,255,0.30);
    border-radius: 4px; padding: 1px 5px;
    margin-left: 6px; vertical-align: middle;
  }
`;

// ═══════════════════════════════════════════════════════════════════
//  MACHINE SVG ICON (20 × 20)
// ═══════════════════════════════════════════════════════════════════

const MACHINE_SVG = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1.5" width="18" height="17" rx="2"
    fill="none" stroke="var(--secondary-text-color)" stroke-width="1.3" opacity="0.7"/>
  <line x1="1" y1="6" x2="19" y2="6"
    stroke="var(--secondary-text-color)" stroke-width="0.9" opacity="0.35"/>
  <circle cx="4.5" cy="3.75" r="0.9" fill="var(--secondary-text-color)" opacity="0.55"/>
  <circle cx="7"   cy="3.75" r="0.9" fill="var(--secondary-text-color)" opacity="0.28"/>
  <circle cx="10" cy="12.5" r="4.5"
    stroke="var(--secondary-text-color)" stroke-width="1.1" fill="none" opacity="0.55"/>
  <circle cx="10" cy="12.5" r="2.7"
    stroke="var(--secondary-text-color)" stroke-width="0.8" fill="none" opacity="0.20"/>
  <line x1="10" y1="10.3" x2="10" y2="14.7"
    stroke="var(--secondary-text-color)" stroke-width="0.8" stroke-linecap="round" opacity="0.30"/>
  <line x1="7.8" y1="12.5" x2="12.2" y2="12.5"
    stroke="var(--secondary-text-color)" stroke-width="0.8" stroke-linecap="round" opacity="0.30"/>
</svg>`;

// ═══════════════════════════════════════════════════════════════════
//  STATE HELPERS
// ═══════════════════════════════════════════════════════════════════

function getWashInfo(raw) {
  if (!raw) return { label: '--',       pillClass: 'ww-pill-idle',    arcColor: 'var(--divider-color)',             dotColor: 'rgba(255,255,255,0.22)', active: false, done: false, offline: false };
  const s = raw.toLowerCase().trim();
  if (['unavailable','unknown'].includes(s))
    return    { label: 'Offline',   pillClass: 'ww-pill-offline',  arcColor: 'var(--error-color,#E24B4A)',       dotColor: '#E24B4A',                active: false, done: false, offline: true  };
  if (['idle','standby','off','ready'].includes(s))
    return    { label: 'Idle',      pillClass: 'ww-pill-idle',     arcColor: 'var(--divider-color)',             dotColor: 'rgba(255,255,255,0.35)', active: false, done: false, offline: false };
  if (['washing','wash'].includes(s))
    return    { label: 'Washing',   pillClass: 'ww-pill-washing',  arcColor: 'var(--info-color,#378ADD)',        dotColor: '#378ADD',                active: true,  done: false, offline: false };
  if (['rinsing','rinse'].includes(s))
    return    { label: 'Rinsing',   pillClass: 'ww-pill-rinsing',  arcColor: '#5AC8FA',                         dotColor: '#5AC8FA',                active: true,  done: false, offline: false };
  if (s === 'draining')
    return    { label: 'Draining',  pillClass: 'ww-pill-spin',     arcColor: 'var(--warning-color,#BA7517)',     dotColor: '#FF9500',                active: true,  done: false, offline: false };
  if (['spinning','spin'].includes(s))
    return    { label: 'Spinning',  pillClass: 'ww-pill-spin',     arcColor: 'var(--warning-color,#BA7517)',     dotColor: '#FF9500',                active: true,  done: false, offline: false };
  if (['pre_wash','prewash','pre-wash','soaking','soak'].includes(s))
    return    { label: 'Pre-wash',  pillClass: 'ww-pill-prewash',  arcColor: '#BF5AF2',                         dotColor: '#BF5AF2',                active: true,  done: false, offline: false };
  if (['heating','heat'].includes(s))
    return    { label: 'Heating',   pillClass: 'ww-pill-heat',     arcColor: '#FF6B35',                         dotColor: '#FF6B35',                active: true,  done: false, offline: false };
  if (['done','finished','complete','end','ended'].includes(s))
    return    { label: 'Done',      pillClass: 'ww-pill-done',     arcColor: 'var(--success-color,#1D9E75)',     dotColor: '#34C759',                active: false, done: true,  offline: false };
  if (['paused','pause'].includes(s))
    return    { label: 'Paused',    pillClass: 'ww-pill-paused',   arcColor: 'var(--warning-color,#BA7517)',     dotColor: '#FF9500',                active: false, done: false, offline: false };
  if (['error','fault','fail'].includes(s))
    return    { label: 'Error',     pillClass: 'ww-pill-error',    arcColor: 'var(--error-color,#E24B4A)',       dotColor: '#FF3B30',                active: false, done: false, offline: false, error: true };
  const fmt = raw.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase());
  return      { label: fmt,         pillClass: 'ww-pill-washing',  arcColor: 'var(--info-color,#378ADD)',        dotColor: '#378ADD',                active: true,  done: false, offline: false };
}

function isOfflineState(raw)  { return ['unavailable','unknown','offline',''].includes((raw||'').toLowerCase().trim()); }
function isIdleState(raw)     { return ['idle','standby','off','ready'].includes((raw||'').toLowerCase().trim()); }
function isDoneState(raw)     { return ['done','finished','complete','end','ended'].includes((raw||'').toLowerCase().trim()); }

function formatTime(minutes) {
  const total = Math.round(parseFloat(minutes));
  if (isNaN(total) || total <= 0) return '0m';
  const h = Math.floor(total / 60), m = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function timeAgo(isoStr) {
  if (!isoStr) return '--';
  const mins = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
  if (mins < 1)    return 'Just now';
  if (mins === 1)  return '1 min ago';
  if (mins < 60)   return `${mins} mins ago`;
  if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
  return `${Math.floor(mins/1440)}d ago`;
}

// ═══════════════════════════════════════════════════════════════════
//  CARD
// ═══════════════════════════════════════════════════════════════════

class WalrusWasherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass              = null;
    this._config            = null;
    this._built             = false;
    this._popupOverlay      = null;
    this._pillFlashState    = null;
    this._pillFlashInterval = null;
  }

  static getConfigElement() { return document.createElement('walrus-washer-card-editor'); }

  static getStubConfig() {
    return {
      machine_entity:     '',
      status_entity:      '',
      time_entity:        '',
      friendly_name:      'Washing Machine',
      show_name:          true,
      max_cycle_minutes:  90,
      smart_plug_enabled: false,
      smart_plug_entity:  '',
    };
  }

  setConfig(config) {
    this._config = { ...WalrusWasherCard.getStubConfig(), ...config };
    if (this._built) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    this._update();
  }

  disconnectedCallback() { this._stopPillFlash(); }

  // ── Build (once) ───────────────────────────────────────────────

  _build() {
    const cfg  = this._config;
    const circ = 2 * Math.PI * 32;                   // r = 32, SVG 80×80

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <ha-card>

        <!-- Header: name left, status pill right -->
        <div class="ww-header">
          ${cfg.show_name !== false
            ? `<span class="ww-name" id="ww-name">${cfg.friendly_name || 'Washing Machine'}</span>`
            : `<span></span>`}
          <div class="ww-pill" id="ww-pill">
            <span class="ww-pill-dot" id="ww-pill-dot"></span>
            <span id="ww-pill-text">--</span>
          </div>
        </div>

        <!-- Body: centred progress ring -->
        <div class="ww-body">
          <div class="ww-ring-wrap" id="ww-ring-wrap">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <!-- Background track -->
              <circle cx="40" cy="40" r="32"
                fill="none"
                stroke="var(--divider-color, rgba(0,0,0,0.10))"
                stroke-width="4"/>
              <!-- Progress arc — full = offset 0, empty = offset circ -->
              <circle id="ww-arc"
                cx="40" cy="40" r="32"
                fill="none"
                stroke="var(--divider-color)"
                stroke-width="4"
                stroke-linecap="round"
                style="stroke-dasharray:${circ.toFixed(2)};
                       stroke-dashoffset:${circ.toFixed(2)};
                       transform:rotate(-90deg);
                       transform-origin:40px 40px;
                       transition:stroke-dashoffset 1.1s cubic-bezier(0.34,1,0.64,1),
                                  stroke 0.35s ease;"/>
            </svg>
            <!-- Centre: icon + time -->
            <div class="ww-ring-center">
              <div class="ww-machine-icon" id="ww-icon">${MACHINE_SVG}</div>
              <span class="ww-time-val"  id="ww-time">--</span>
              <span class="ww-time-unit" id="ww-time-unit"></span>
            </div>
          </div>
        </div>

      </ha-card>`;

    // ── Click handlers ──────────────────────────────────────────
    const pill = this.shadowRoot.getElementById('ww-pill');
    if (pill) pill.addEventListener('click', e => { e.stopPropagation(); this._handlePillClick(); });

    const ring = this.shadowRoot.getElementById('ww-ring-wrap');
    if (ring) ring.addEventListener('click', () => this._openStatusPopup());

    const name = this.shadowRoot.getElementById('ww-name');
    if (name) name.addEventListener('click', () => {
      const id = this._config?.machine_entity || this._config?.status_entity;
      if (id) this._fireMoreInfo(id);
    });
  }

  // ── Update (every hass change) ─────────────────────────────────

  _update() {
    if (!this._hass || !this._config) return;
    const cfg  = this._config;
    const hass = this._hass;
    const root = this.shadowRoot;
    const circ = 2 * Math.PI * 32;

    // Resolve entities
    const machineObj = cfg.machine_entity ? hass.states[cfg.machine_entity] : null;
    const statusObj  = cfg.status_entity  ? hass.states[cfg.status_entity]  : null;
    const timeObj    = cfg.time_entity    ? hass.states[cfg.time_entity]    : null;

    const statusRaw = statusObj?.state || machineObj?.state || '';
    const info      = getWashInfo(statusRaw);

    // Remaining time
    let remainMins = null;
    if (timeObj) { const n = parseFloat(timeObj.state); if (!isNaN(n)) remainMins = Math.max(0, n); }

    // Arc offset: 0 = full ring, circ = empty ring
    // Ring starts FULL when cycle begins (remainMins = maxMins → offset = 0)
    // and drains to EMPTY as time runs out (remainMins = 0 → offset = circ)
    const maxMins = parseFloat(cfg.max_cycle_minutes) || 90;
    let arcOffset = circ; // default: empty (idle / offline / done)
    if (info.active && remainMins !== null) {
      // remainMins/maxMins goes from 1.0 (just started, full) down to 0 (empty)
      arcOffset = circ * (1 - Math.min(1, Math.max(0, remainMins / maxMins)));
    } else if (info.active) {
      // Active but no time entity — show full ring until data arrives
      arcOffset = 0;
    }

    // Stop flash when plug reaches expected state
    if (cfg.smart_plug_enabled && cfg.smart_plug_entity) {
      const plugOn = hass.states[cfg.smart_plug_entity]?.state === 'on';
      if (this._pillFlashState === 'on'  && plugOn)  this._stopPillFlash();
      if (this._pillFlashState === 'off' && !plugOn) this._stopPillFlash();
    }

    // ── Pill — text = wash status; dot = plug state (green/red) or phase colour ─
    if (!this._pillFlashState) {
      const pillEl     = root.getElementById('ww-pill');
      const dotEl      = root.getElementById('ww-pill-dot');
      const pillTextEl = root.getElementById('ww-pill-text');
      if (pillTextEl) pillTextEl.textContent = info.label;
      if (dotEl) {
        if (cfg.smart_plug_enabled && cfg.smart_plug_entity) {
          const plugObj = hass.states[cfg.smart_plug_entity];
          const plugOn  = plugObj?.state === 'on';
          dotEl.style.background = plugOn ? '#34C759' : '#FF3B30';
          if (pillEl) pillEl.style.borderColor = plugOn ? '#34C75966' : '#FF3B3066';
        } else {
          dotEl.style.background = info.dotColor;
          if (pillEl) pillEl.style.borderColor = `${info.dotColor}66`;
        }
      }
    }

    // ── Arc ───────────────────────────────────────────────────────
    const arcEl = root.getElementById('ww-arc');
    if (arcEl) {
      arcEl.style.stroke           = info.arcColor;
      arcEl.style.strokeDashoffset = arcOffset.toFixed(2);
    }

    // ── Ring wrapper classes (drive CSS animations) ───────────────
    const wrapEl = root.getElementById('ww-ring-wrap');
    if (wrapEl) {
      wrapEl.classList.toggle('is-active', info.active);
      wrapEl.classList.toggle('is-done',   info.done);
    }

    // ── Time display ──────────────────────────────────────────────
    const timeEl     = root.getElementById('ww-time');
    const timeUnitEl = root.getElementById('ww-time-unit');
    if (timeEl) {
      if (info.done) {
        timeEl.textContent     = '✓';
        timeUnitEl.textContent = 'done';
      } else if (info.active && remainMins !== null) {
        timeEl.textContent     = formatTime(remainMins);
        timeUnitEl.textContent = 'left';
      } else {
        timeEl.textContent     = '--';
        timeUnitEl.textContent = '';
      }
    }

    // ── Card name ─────────────────────────────────────────────────
    const nameEl = root.getElementById('ww-name');
    if (nameEl && cfg.friendly_name) nameEl.textContent = cfg.friendly_name;

  }

  // ── Pill click ─────────────────────────────────────────────────

  _handlePillClick() {
    const cfg    = this._config;
    const hass   = this._hass;
    const plugId = cfg.smart_plug_entity;

    // No plug configured — open info popup
    if (!cfg.smart_plug_enabled || !plugId) { this._openStatusPopup(); return; }

    const plugObj = hass?.states[plugId];
    const plugOn  = plugObj?.state === 'on';

    if (plugOn) {
      // Plug is on — ask before turning off
      this._openConfirmOffPopup();
    } else {
      // Plug is off — turn on immediately, no confirmation needed
      hass.callService('homeassistant', 'turn_on', { entity_id: plugId });
      this._startPillFlash('on');
    }
  }

  _fireMoreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true, detail: { entityId }
    }));
  }

  // ── Pill flash ─────────────────────────────────────────────────

  _startPillFlash(mode) {
    this._stopPillFlash();
    this._pillFlashState = mode;

    const root       = this.shadowRoot;
    const pillEl     = root.getElementById('ww-pill');
    const dotEl      = root.getElementById('ww-pill-dot');
    const pillTextEl = root.getElementById('ww-pill-text');
    if (!pillEl || !dotEl || !pillTextEl) return;

    const LABEL  = mode === 'on' ? 'Turning On' : 'Turning Off';
    const YELLOW = '#FF9500';
    let flash    = true;

    const apply = () => {
      if (!this._pillFlashState) return;
      pillTextEl.textContent   = LABEL;
      dotEl.style.background   = flash ? YELLOW : 'rgba(255,255,255,0.15)';
      pillEl.style.borderColor = flash ? `${YELLOW}88` : 'rgba(255,255,255,0.08)';
      pillEl.style.color       = flash ? YELLOW : 'rgba(255,255,255,0.30)';
      flash = !flash;
    };

    apply();
    this._pillFlashInterval = setInterval(apply, 600);
  }

  _stopPillFlash() {
    if (this._pillFlashInterval) { clearInterval(this._pillFlashInterval); this._pillFlashInterval = null; }
    this._pillFlashState = null;
    // Clear inline overrides so _update can take over cleanly
    const pillEl = this.shadowRoot.getElementById('ww-pill');
    if (pillEl) { pillEl.style.color = ''; pillEl.style.borderColor = ''; }
  }

  // ── Popup base ─────────────────────────────────────────────────

  _closePopup() {
    if (!this._popupOverlay) return;
    const ov = this._popupOverlay;
    ov.style.transition = 'opacity 0.18s ease';
    ov.style.opacity    = '0';
    setTimeout(() => { ov.parentNode?.removeChild(ov); }, 185);
    this._popupOverlay  = null;
  }

  _createPopupBase(titleText) {
    if (this._popupOverlay) return null;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      display:flex;align-items:center;justify-content:center;padding:16px;
      background:rgba(0,0,0,0.55);
      backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
      animation:wwFadeIn 0.18s ease;`;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes wwFadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes wwSlideUp { from{transform:translateY(16px) scale(0.97);opacity:0} to{transform:none;opacity:1} }
      .ww-popup {
        background:var(--card-background-color,#fff);
        border:1px solid var(--divider-color,rgba(0,0,0,0.12));
        border-radius:20px;
        box-shadow:0 12px 48px rgba(0,0,0,0.22);
        padding:18px;
        width:100%;max-width:340px;max-height:88vh;overflow-y:auto;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        color:var(--primary-text-color);
        animation: wwSlideUp 0.25s cubic-bezier(0.34,1.28,0.64,1);
      }
      .ww-info-row {
        display:flex;align-items:flex-start;justify-content:space-between;
        padding:8px 0;border-bottom:1px solid var(--divider-color,rgba(0,0,0,0.07));
      }
      .ww-info-row:last-child { border-bottom:none; }
      .ww-info-label { font-size:12px;color:var(--secondary-text-color);font-weight:500;flex-shrink:0;padding-right:12px; }
      .ww-info-value { font-size:12px;font-weight:600;color:var(--primary-text-color);text-align:right;word-break:break-all; }
      .ww-close-btn { background:var(--secondary-background-color,rgba(0,0,0,0.06));border:none;border-radius:50%;
                      width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;
                      color:var(--secondary-text-color);font-size:14px;padding:0;transition:background 0.15s;
                      flex-shrink:0;font-family:inherit; }
      .ww-close-btn:hover { background:var(--divider-color,rgba(0,0,0,0.12)); }
      .ww-btn { border:none;border-radius:12px;padding:10px 18px;font-size:14px;font-weight:600;
                cursor:pointer;font-family:inherit;transition:opacity 0.15s,transform 0.1s; }
      .ww-btn:active { transform:scale(0.97); }
      .ww-btn-cancel  { background:var(--secondary-background-color,rgba(0,0,0,0.06));
                        color:var(--primary-text-color); }
      .ww-btn-cancel:hover { opacity:0.75; }
      .ww-btn-confirm { background:var(--error-color,#E24B4A);color:#fff; }
      .ww-btn-confirm:hover { opacity:0.86; }
    `;
    overlay.appendChild(style);
    overlay.addEventListener('click', e => { if (e.target === overlay) this._closePopup(); });

    const popup = document.createElement('div');
    popup.className = 'ww-popup';
    popup.addEventListener('touchmove', e => e.stopPropagation(), { passive: true });
    popup.addEventListener('click',     e => e.stopPropagation());

    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;';
    hdr.innerHTML = `
      <span style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
                   color:var(--secondary-text-color);">${titleText}</span>
      <button class="ww-close-btn">✕</button>`;
    hdr.querySelector('.ww-close-btn').addEventListener('click', () => this._closePopup());
    popup.appendChild(hdr);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    this._popupOverlay = overlay;
    return popup;
  }

  _addInfoRow(parent, label, value) {
    const row = document.createElement('div');
    row.className = 'ww-info-row';
    row.innerHTML = `<span class="ww-info-label">${label}</span>
                     <span class="ww-info-value">${String(value)}</span>`;
    parent.appendChild(row);
  }

  // ── Confirm off popup ──────────────────────────────────────────

  _openConfirmOffPopup() {
    const cfg  = this._config;
    const name = cfg.friendly_name || 'your washing machine';
    const popup = this._createPopupBase('Turn Off');
    if (!popup) return;

    const body = document.createElement('div');
    body.style.cssText = 'text-align:center;padding:6px 0 18px;';
    body.innerHTML = `
      <div style="font-size:42px;line-height:1;margin-bottom:12px;">🫧</div>
      <div style="font-size:16px;font-weight:700;color:var(--primary-text-color);
                  margin-bottom:8px;line-height:1.3;">All done with the laundry?</div>
      <div style="font-size:13px;color:var(--secondary-text-color);line-height:1.55;
                  max-width:260px;margin:0 auto;">
        Just checking — do you want to turn off
        <strong style="color:var(--primary-text-color);">${name}</strong> now?
      </div>`;
    popup.appendChild(body);

    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:8px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.className   = 'ww-btn ww-btn-cancel';
    cancelBtn.textContent = 'Not yet';
    cancelBtn.style.flex  = '1';
    cancelBtn.addEventListener('click', () => this._closePopup());

    const confirmBtn = document.createElement('button');
    confirmBtn.className   = 'ww-btn ww-btn-confirm';
    confirmBtn.textContent = 'Turn Off';
    confirmBtn.style.flex  = '1';
    confirmBtn.addEventListener('click', () => {
      this._closePopup();
      if (cfg.smart_plug_entity && this._hass) {
        this._hass.callService('homeassistant', 'turn_off', { entity_id: cfg.smart_plug_entity });
        this._startPillFlash('off');
      }
    });

    btns.appendChild(cancelBtn);
    btns.appendChild(confirmBtn);
    popup.appendChild(btns);
  }

  // ── Status info popup ──────────────────────────────────────────

  _openStatusPopup() {
    const cfg  = this._config;
    const hass = this._hass;
    const name = cfg.friendly_name || 'Washing Machine';

    const machineObj = cfg.machine_entity ? hass?.states[cfg.machine_entity] : null;
    const statusObj  = cfg.status_entity  ? hass?.states[cfg.status_entity]  : null;
    const timeObj    = cfg.time_entity    ? hass?.states[cfg.time_entity]    : null;
    const statusRaw  = statusObj?.state || machineObj?.state || '';
    const info       = getWashInfo(statusRaw);

    const popup = this._createPopupBase(name);
    if (!popup) return;

    // Mini ring hero
    const circ    = 2 * Math.PI * 24;
    const maxMins = parseFloat(cfg.max_cycle_minutes) || 90;
    let remainMins = null;
    if (timeObj) { const n = parseFloat(timeObj.state); if (!isNaN(n)) remainMins = Math.max(0, n); }
    let arcOffset = circ;
    if (info.active && remainMins !== null) arcOffset = circ * (1 - Math.min(1, remainMins / maxMins));

    const hero = document.createElement('div');
    hero.style.cssText = 'display:flex;align-items:center;gap:14px;margin-bottom:16px;';
    hero.innerHTML = `
      <div style="position:relative;width:60px;height:60px;flex-shrink:0;">
        <svg viewBox="0 0 60 60" width="60" height="60" style="display:block;">
          <circle cx="30" cy="30" r="24" fill="none"
            stroke="var(--divider-color,rgba(0,0,0,0.10))" stroke-width="3.5"/>
          <circle cx="30" cy="30" r="24" fill="none"
            stroke="${info.arcColor}" stroke-width="3.5" stroke-linecap="round"
            style="stroke-dasharray:${circ.toFixed(2)};stroke-dashoffset:${arcOffset.toFixed(2)};
                   transform:rotate(-90deg);transform-origin:30px 30px;"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:1px;">
          <span style="font-size:14px;font-weight:700;color:var(--primary-text-color);line-height:1;">
            ${info.done ? '✓' : (remainMins !== null ? formatTime(remainMins) : '--')}
          </span>
          ${remainMins !== null && !info.done
            ? `<span style="font-size:8px;color:var(--secondary-text-color);">left</span>` : ''}
        </div>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:20px;font-weight:700;color:var(--primary-text-color);
                    margin-bottom:6px;line-height:1;">${info.label}</div>
        <span style="font-size:9px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;
                     padding:2px 7px;border-radius:20px;border:1px solid;
                     color:var(--secondary-text-color);
                     border-color:var(--divider-color);
                     background:var(--secondary-background-color);">${name}</span>
      </div>`;
    popup.appendChild(hero);

    const table = document.createElement('div');
    table.style.cssText = 'border-top:1px solid var(--divider-color,rgba(0,0,0,0.07));padding-top:4px;';
    popup.appendChild(table);

    const primaryObj = statusObj || machineObj;
    if (primaryObj) {
      const attrs = primaryObj.attributes || {};
      if (attrs.friendly_name) this._addInfoRow(table, 'Device',  attrs.friendly_name);
      this._addInfoRow(table, 'Status', primaryObj.state);
    }
    if (timeObj) {
      const unit = timeObj.attributes?.unit_of_measurement || 'min';
      this._addInfoRow(table, 'Remaining', `${timeObj.state} ${unit}`);
    }
    if (cfg.max_cycle_minutes) this._addInfoRow(table, 'Max Cycle',     `${cfg.max_cycle_minutes} min`);
    if (cfg.machine_entity)    this._addInfoRow(table, 'Machine Entity', cfg.machine_entity);
    if (cfg.status_entity)     this._addInfoRow(table, 'Status Entity',  cfg.status_entity);
    if (cfg.time_entity)       this._addInfoRow(table, 'Time Entity',    cfg.time_entity);
    if (cfg.smart_plug_entity) this._addInfoRow(table, 'Smart Plug',     cfg.smart_plug_entity);

    if (primaryObj) {
      this._addInfoRow(table, 'Last Changed', timeAgo(primaryObj.last_changed));
      this._addInfoRow(table, 'Last Updated', timeAgo(primaryObj.last_updated));
      const skip = new Set(['friendly_name','unit_of_measurement','icon','device_class','state_class','restored']);
      Object.entries(primaryObj.attributes || {}).forEach(([k, v]) => {
        if (skip.has(k)) return;
        if (typeof v === 'string' || typeof v === 'number') {
          this._addInfoRow(table, k.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase()), v);
        }
      });
    } else if (!cfg.machine_entity && !cfg.status_entity) {
      this._addInfoRow(table, 'Notice', 'No entities configured');
    }
  }

  getCardSize() { return 2; }
}


// ═══════════════════════════════════════════════════════════════════
//  EDITOR
// ═══════════════════════════════════════════════════════════════════

class WalrusWasherCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config      = {};
    this._hass        = null;
    this._initialized = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) this._render();
  }

  setConfig(config) {
    this._config = { ...WalrusWasherCard.getStubConfig(), ...config };
    if (!this._initialized && this._hass) this._render();
    else if (this._initialized) this._syncUI();
  }

  // ── Helpers ────────────────────────────────────────────────────

  _getName(entityId) {
    return this._hass?.states[entityId]?.attributes?.friendly_name || entityId;
  }

  _scoreEntity(id, fn, kws) {
    const i = id.toLowerCase(), n = fn.toLowerCase();
    return kws.reduce((s, k) => s + (i.includes(k) || n.includes(k) ? 1 : 0), 0);
  }

  _buildOptions(candidates, pool, sel) {
    const cs  = new Set(candidates.map(c => c.e));
    const sug = candidates.map(({ e, score }) =>
      `<option value="${e}" ${e===sel?'selected':''}>${score>0?'★ ':''}${this._getName(e)} (${e})</option>`).join('');
    const rest = pool.filter(e => !cs.has(e)).map(e =>
      `<option value="${e}" ${e===sel?'selected':''}>${this._getName(e)} (${e})</option>`).join('');
    return `<option value="">— None —</option>${sug}${sug&&rest?'<option disabled>──────────────────</option>':''}${rest}`;
  }

  _scored(pool, kws) {
    return pool
      .map(e => ({ e, score: this._scoreEntity(e, this._getName(e), kws) }))
      .sort((a, b) => b.score - a.score || a.e.localeCompare(b.e));
  }

  // ── Render ─────────────────────────────────────────────────────

  _render() {
    if (!this._hass || !this._config) return;
    this._initialized = true;

    const cfg         = this._config;
    const allEntities = Object.keys(this._hass.states).sort();
    const allSensors  = allEntities.filter(e => e.startsWith('sensor.'));
    const allSwitches = allEntities.filter(e => e.startsWith('switch.') || e.startsWith('input_boolean.'));

    const washKws    = ['wash','washer','washing','laundry','laundrie'];
    const machineKws = [...washKws,'machine','appliance'];
    const statusKws  = [...washKws,'cycle','status','state','program','programme','phase'];
    const timeKws    = [...washKws,'remaining','time','duration','countdown','minutes','min'];
    const plugKws    = ['plug','socket','outlet','power','tasmota','shelly','tp_link',
                        'kasa','sonoff','wemo','hue_plug','ikea_outlet','smart_plug'];

    const machineCandidates = this._scored(allEntities, machineKws);
    const statusCandidates  = this._scored(allSensors,  statusKws);
    const timeCandidates    = this._scored(allSensors,  timeKws);

    const machineName = (cfg.machine_entity
      ? (this._hass.states[cfg.machine_entity]?.attributes?.friendly_name || cfg.machine_entity)
      : '').toLowerCase();
    const plugCandidates = allSwitches.map(e => {
      let score = this._scoreEntity(e, this._getName(e), plugKws);
      if (machineName) machineName.split(/\W+/).filter(w => w.length > 3).forEach(w => {
        if (e.toLowerCase().includes(w) || this._getName(e).toLowerCase().includes(w)) score += 2;
      });
      return { e, score };
    }).sort((a, b) => b.score - a.score || a.e.localeCompare(b.e));

    // Auto-select best candidates (plug scored but never forced — too risky to auto-switch)
    const autoSelect = (key, candidates) => {
      if (!cfg[key]) {
        const best = candidates.find(x => x.score > 0);
        if (best) { cfg[key] = best.e; this._dispatch(); }
      }
    };
    autoSelect('machine_entity', machineCandidates);
    autoSelect('status_entity',  statusCandidates);
    autoSelect('time_entity',    timeCandidates);
    autoSelect('smart_plug_entity', plugCandidates);

    const machineOpts = this._buildOptions(machineCandidates, allEntities, cfg.machine_entity   || '');
    const statusOpts  = this._buildOptions(statusCandidates,  allSensors,  cfg.status_entity    || '');
    const timeOpts    = this._buildOptions(timeCandidates,    allSensors,  cfg.time_entity      || '');
    const plugOpts    = this._buildOptions(plugCandidates,    allSwitches, cfg.smart_plug_entity || '');

    this.shadowRoot.innerHTML = `
      <style>${EDITOR_STYLES}</style>
      <div class="container">

        <!-- Display -->
        <div>
          <div class="section-title">Card</div>
          <div class="card-block">
            <div class="toggle-list">
              <div class="toggle-item">
                <div>
                  <div class="toggle-label">Show Name</div>
                  <div class="toggle-desc">Display the machine name in the card header</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="show_name" ${cfg.show_name !== false ? 'checked' : ''}>
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>
            <div class="text-row" id="name_row"
              style="${cfg.show_name !== false ? '' : 'display:none'}">
              <label for="friendly_name">Display Name</label>
              <div class="hint">Shown in the card header</div>
              <input type="text" id="friendly_name"
                placeholder="Washing Machine" value="${cfg.friendly_name || ''}">
            </div>
          </div>
        </div>

        <!-- Entities -->
        <div>
          <div class="section-title">Entities</div>
          <div class="card-block">
            <div class="select-row">
              <label for="machine_entity">Washing Machine</label>
              <div class="hint">★ auto-detected · any domain · name tap opens More Info</div>
              <input type="text" class="entity-search" id="machine_search" placeholder="Search…">
              <select id="machine_entity">${machineOpts}</select>
            </div>
            <div class="select-row">
              <label for="status_entity">Cycle Status <span class="badge-optional">Optional</span></label>
              <div class="hint">★ auto-detected · sensor for phase (Washing, Rinsing, Spinning…)</div>
              <input type="text" class="entity-search" id="status_search" placeholder="Search sensors…">
              <select id="status_entity">${statusOpts}</select>
            </div>
            <div class="select-row">
              <label for="time_entity">Remaining Time <span class="badge-optional">Optional</span></label>
              <div class="hint">★ auto-detected · numeric sensor in minutes · drives ring drain</div>
              <input type="text" class="entity-search" id="time_search" placeholder="Search sensors…">
              <select id="time_entity">${timeOpts}</select>
            </div>
          </div>
        </div>

        <!-- Smart Plug -->
        <div>
          <div class="section-title">Smart Plug <span class="badge-optional">Optional</span></div>
          <div class="card-block">
            <div class="toggle-list">
              <div class="toggle-item">
                <div>
                  <div class="toggle-label">Enable Plug Control</div>
                  <div class="toggle-desc">Tap status pill to power the machine on or off</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="smart_plug_enabled"
                    ${cfg.smart_plug_enabled ? 'checked' : ''}>
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>
            <div id="plug_entity_row"
              style="${cfg.smart_plug_enabled ? '' : 'display:none'}">
              <div class="select-row" style="border-top:1px solid rgba(128,128,128,0.08);">
                <label for="smart_plug_entity">Plug / Switch</label>
                <div class="hint">★ auto-detected · switches &amp; input booleans · green dot = on, red = off</div>
                <input type="text" class="entity-search" id="plug_search" placeholder="Search switches…">
                <select id="smart_plug_entity">${plugOpts}</select>
                <div class="hint" style="margin-top:2px;">
                  Pill tap when <strong>off</strong> → turns plug on &nbsp;·&nbsp;
                  Pill tap when <strong>on</strong> → asks before turning off
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cycle Settings -->
        <div>
          <div class="section-title">Cycle Settings</div>
          <div class="card-block">
            <div class="text-row">
              <label for="max_cycle_minutes">Maximum Cycle Duration (minutes)</label>
              <div class="hint">Ring starts full at this value and drains as time reduces. Default: 90</div>
              <input type="number" id="max_cycle_minutes" min="1" max="600"
                value="${cfg.max_cycle_minutes ?? 90}" placeholder="90">
            </div>
          </div>
        </div>

      </div>`;

    this._syncUI();
    this._attachListeners();
    this._wireSearches(machineCandidates, allEntities,
                       statusCandidates,  allSensors,
                       timeCandidates,    allSensors,
                       plugCandidates,    allSwitches);
  }

  // ── Sync UI to config ──────────────────────────────────────────

  _syncUI() {
    const root = this.shadowRoot;
    const cfg  = this._config;
    const set  = (id, val) => { const el = root.getElementById(id); if (el) el.value = val ?? ''; };
    const chk  = (id, val) => { const el = root.getElementById(id); if (el) el.checked = !!val; };

    set('friendly_name',     cfg.friendly_name     || '');
    set('machine_entity',    cfg.machine_entity    || '');
    set('status_entity',     cfg.status_entity     || '');
    set('time_entity',       cfg.time_entity       || '');
    set('smart_plug_entity', cfg.smart_plug_entity || '');
    set('max_cycle_minutes', cfg.max_cycle_minutes ?? 90);
    chk('show_name',          cfg.show_name !== false);
    chk('smart_plug_enabled', cfg.smart_plug_enabled === true);
  }

  // ── Listeners ──────────────────────────────────────────────────

  _attachListeners() {
    const root = this.shadowRoot;
    const get  = id => root.getElementById(id);

    get('friendly_name').addEventListener('input', e =>
      this._set('friendly_name', e.target.value));
    get('machine_entity').addEventListener('change', e =>
      this._set('machine_entity', e.target.value));
    get('status_entity').addEventListener('change', e =>
      this._set('status_entity',  e.target.value));
    get('time_entity').addEventListener('change', e =>
      this._set('time_entity',    e.target.value));
    get('smart_plug_entity').addEventListener('change', e =>
      this._set('smart_plug_entity', e.target.value || null));
    get('max_cycle_minutes').addEventListener('input', e =>
      this._set('max_cycle_minutes', parseInt(e.target.value) || 90));

    get('show_name').addEventListener('change', e => {
      this._set('show_name', e.target.checked);
      const row = root.getElementById('name_row');
      if (row) row.style.display = e.target.checked ? '' : 'none';
    });

    get('smart_plug_enabled').addEventListener('change', e => {
      this._set('smart_plug_enabled', e.target.checked);
      const row = root.getElementById('plug_entity_row');
      if (row) row.style.display = e.target.checked ? '' : 'none';
    });
  }

  _wireSearches(machineCand, allEnt, statusCand, allSens, timeCand, allSens2, plugCand, allSw) {
    const root = this.shadowRoot;

    const makeData = (candidates, pool) => {
      const cs = new Set(candidates.map(c => c.e));
      return [
        ...candidates.map(({ e, score }) => ({ id: e, name: this._getName(e), suggested: score > 0 })),
        ...pool.filter(e => !cs.has(e)).map(e => ({ id: e, name: this._getName(e), suggested: false })),
      ];
    };

    const wire = (searchId, selectId, data) => {
      const searchEl = root.getElementById(searchId);
      const selectEl = root.getElementById(selectId);
      if (!searchEl || !selectEl) return;
      searchEl.addEventListener('input', () => {
        const term = searchEl.value.toLowerCase().trim();
        const cur  = selectEl.value;
        const hits = term ? data.filter(d =>
          d.id.toLowerCase().includes(term) || d.name.toLowerCase().includes(term)) : data;
        const sug  = hits.filter(d => d.suggested);
        const rest = hits.filter(d => !d.suggested);
        selectEl.innerHTML =
          `<option value="">— None —</option>` +
          sug.map( d => `<option value="${d.id}" ${d.id===cur?'selected':''}>★ ${d.name} (${d.id})</option>`).join('') +
          (sug.length && rest.length ? `<option disabled>──────────────────</option>` : '') +
          rest.map(d => `<option value="${d.id}" ${d.id===cur?'selected':''}>${d.name} (${d.id})</option>`).join('');
      });
    };

    wire('machine_search', 'machine_entity',   makeData(machineCand, allEnt));
    wire('status_search',  'status_entity',    makeData(statusCand,  allSens));
    wire('time_search',    'time_entity',       makeData(timeCand,    allSens2));
    wire('plug_search',    'smart_plug_entity', makeData(plugCand,    allSw));
  }

  _set(key, value) {
    const newConfig = { ...this._config, [key]: value };
    if (value === null || value === '') delete newConfig[key];
    this._config = newConfig;
    this._dispatch();
  }

  _dispatch() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }, bubbles: true, composed: true,
    }));
  }
}


// ═══════════════════════════════════════════════════════════════════
//  REGISTRATION
// ═══════════════════════════════════════════════════════════════════

if (!customElements.get('walrus-washer-card')) {
  customElements.define('walrus-washer-card', WalrusWasherCard);
}
if (!customElements.get('walrus-washer-card-editor')) {
  customElements.define('walrus-washer-card-editor', WalrusWasherCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'walrus-washer-card')) {
  window.customCards.push({
    type:        'walrus-washer-card',
    name:        'Walrus Washer Card',
    preview:     false,
    description: 'Washing machine cycle progress card for Home Assistant.',
  });
}
