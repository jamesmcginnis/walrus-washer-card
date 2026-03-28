/**
 * Walrus Washer Card
 * Displays washing machine cycle status, remaining time, and progress as an animated ring.
 * For Home Assistant — https://github.com/jamesmcginnis/walrus-washer-card
 */

// ═══════════════════════════════════════════════════════════════════
//  CARD
// ═══════════════════════════════════════════════════════════════════

class WalrusWasherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._popupOverlay = null;
  }

  static getConfigElement() {
    return document.createElement('walrus-washer-card-editor');
  }

  static getStubConfig() {
    return {
      machine_entity:     '',
      status_entity:      '',
      time_entity:        '',
      friendly_name:      '',
      show_name:          true,
      max_cycle_minutes:  90,
      card_bg:            '#1c1c1e',
      card_bg_opacity:    80,
      text_color:         '#ffffff',
      ring_color:         '#007AFF',
      time_text_color:    '#ffffff',
    };
  }

  setConfig(config) {
    this._config = { ...WalrusWasherCard.getStubConfig(), ...config };
    if (this.shadowRoot.innerHTML) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot.innerHTML) this._render();
    else this._updateCard();
  }

  connectedCallback() {}
  disconnectedCallback() {}

  // ── Render ─────────────────────────────────────────────────────────

  _render() {
    if (!this._config) return;
    const cfg  = this._config;
    const circ = 2 * Math.PI * 54;

    const hexBg = cfg.card_bg || '#1c1c1e';
    let r = 28, g = 28, b = 30, op = (parseInt(cfg.card_bg_opacity) || 80) / 100;
    try {
      r = parseInt(hexBg.slice(1,3),16);
      g = parseInt(hexBg.slice(3,5),16);
      b = parseInt(hexBg.slice(5,7),16);
      if (/^#[0-9a-fA-F]{8}$/.test(hexBg)) op = parseInt(hexBg.slice(7,9),16) / 255;
    } catch(e) {}
    const bgCss    = `rgba(${r},${g},${b},${op.toFixed(3)})`;
    const tc       = cfg.text_color  || '#ffffff';
    const ringCol  = cfg.ring_color  || '#007AFF';
    const showName = cfg.show_name !== false;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; }

        ha-card {
          background: ${bgCss} !important;
          backdrop-filter: blur(40px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(40px) saturate(180%) !important;
          color: ${tc} !important;
          border-radius: 20px !important;
          border: 1px solid rgba(255,255,255,0.11) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.45) !important;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
        }

        .ww-inner { padding: 14px 16px 22px; }

        /* ── Header ──────────────────────────────────── */
        .ww-header {
          display: flex;
          align-items: center;
          justify-content: ${showName ? 'space-between' : 'flex-end'};
          margin-bottom: 20px;
          gap: 8px;
          min-height: 28px;
        }

        .ww-title {
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.80);
          cursor: pointer; user-select: none; -webkit-user-select: none;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          flex: 1; min-width: 0;
          letter-spacing: 0.01em; transition: color 0.15s;
        }
        .ww-title:hover { color: rgba(255,255,255,1); }

        .ww-status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px 4px 7px; border-radius: 20px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
          cursor: pointer; user-select: none; -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s, border-color 0.3s;
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.80);
          letter-spacing: 0.04em; white-space: nowrap; flex-shrink: 0;
        }
        .ww-status-pill:hover  { background: rgba(255,255,255,0.15); }
        .ww-status-pill:active { background: rgba(255,255,255,0.18); }

        .ww-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,0.35); flex-shrink: 0;
          transition: background 0.35s;
        }

        /* ── Ring area ───────────────────────────────── */
        .ww-ring-area {
          display: flex; flex-direction: column;
          align-items: center; gap: 14px;
        }

        .ww-ring-wrap {
          position: relative; width: 140px; height: 140px;
          cursor: pointer; -webkit-tap-highlight-color: transparent;
        }
        .ww-ring-wrap svg { display: block; }

        .ww-ring-center {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          pointer-events: none; gap: 3px;
        }

        /* Washing machine icon (SVG inline) */
        .ww-icon-wrap {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.3s;
        }
        .ww-icon-wrap svg { width: 28px; height: 28px; }

        .ww-time-val {
          font-size: 24px; font-weight: 700;
          letter-spacing: -0.5px; line-height: 1;
          color: ${cfg.time_text_color || '#ffffff'};
          transition: color 0.4s;
        }
        .ww-time-unit {
          font-size: 10px; font-weight: 500;
          color: rgba(255,255,255,0.32); line-height: 1;
          letter-spacing: 0.03em;
        }

        /* ── Cycle label below ring ───────────────────── */
        .ww-cycle-label {
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.50);
          letter-spacing: 0.02em; text-align: center;
          min-height: 16px; transition: color 0.4s;
        }

        /* ── Animations ──────────────────────────────── */
        @keyframes wwBreath {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.65; }
        }
        @keyframes wwGlow {
          0%,100% { filter: drop-shadow(0 0 3px ${ringCol}); }
          50%      { filter: drop-shadow(0 0 9px ${ringCol}); }
        }
        @keyframes wwDrumRock {
          0%,100% { transform: rotate(-12deg) scale(1);   }
          25%     { transform: rotate( 0deg)  scale(1.05);}
          50%     { transform: rotate( 12deg) scale(1);   }
          75%     { transform: rotate( 0deg)  scale(1.05);}
        }
        @keyframes wwDonePulse {
          0%,100% { transform: scale(1);   opacity: 1; }
          50%     { transform: scale(1.12); opacity: 0.85; }
        }

        .ww-ring-wrap.is-active .ww-arc-track {
          animation: wwBreath 2.2s ease-in-out infinite,
                     wwGlow   2.2s ease-in-out infinite;
        }
        .ww-ring-wrap.is-active .ww-icon-wrap {
          animation: wwDrumRock 1.4s ease-in-out infinite;
        }
        .ww-ring-wrap.is-done .ww-icon-wrap {
          animation: wwDonePulse 1.8s ease-in-out infinite;
        }
      </style>

      <ha-card>
        <div class="ww-inner">

          <!-- Header -->
          <div class="ww-header">
            ${showName ? `<span class="ww-title" id="ww-title">${cfg.friendly_name || 'Washing Machine'}</span>` : ''}
            <div class="ww-status-pill" id="ww-pill">
              <span class="ww-status-dot" id="ww-dot"></span>
              <span id="ww-pill-text">--</span>
            </div>
          </div>

          <!-- Ring -->
          <div class="ww-ring-area">
            <div class="ww-ring-wrap" id="ww-ring-wrap">
              <svg viewBox="0 0 140 140" width="140" height="140">
                <!-- Track -->
                <circle cx="70" cy="70" r="54"
                  fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="7"/>
                <!-- Progress arc -->
                <circle id="ww-arc" class="ww-arc-track"
                  cx="70" cy="70" r="54"
                  fill="none"
                  stroke="${ringCol}"
                  stroke-width="7"
                  stroke-linecap="round"
                  style="stroke-dasharray:${circ.toFixed(2)};
                         stroke-dashoffset:${circ.toFixed(2)};
                         transform:rotate(-90deg);
                         transform-origin:70px 70px;
                         transition:stroke-dashoffset 1.2s cubic-bezier(0.34,1,0.64,1),
                                    stroke 0.4s ease;"/>
              </svg>
              <div class="ww-ring-center">
                <!-- Washing machine icon -->
                <div class="ww-icon-wrap" id="ww-icon-wrap">
                  <svg id="ww-machine-icon" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Body -->
                    <rect x="2" y="3" width="24" height="22" rx="3" fill="none"
                      stroke="rgba(255,255,255,0.70)" stroke-width="1.6"/>
                    <!-- Control panel line -->
                    <line x1="2" y1="9" x2="26" y2="9"
                      stroke="rgba(255,255,255,0.35)" stroke-width="1.2"/>
                    <!-- Buttons -->
                    <circle cx="7"  cy="6" r="1.2" fill="rgba(255,255,255,0.50)"/>
                    <circle cx="11" cy="6" r="1.2" fill="rgba(255,255,255,0.30)"/>
                    <!-- Door circle outer -->
                    <circle cx="14" cy="18" r="6.5"
                      stroke="rgba(255,255,255,0.55)" stroke-width="1.4" fill="none"/>
                    <!-- Door glass inner -->
                    <circle id="ww-drum-inner" cx="14" cy="18" r="4.2"
                      stroke="rgba(255,255,255,0.22)" stroke-width="1" fill="rgba(255,255,255,0.04)"/>
                    <!-- Drum paddles (rotate when active) -->
                    <g id="ww-drum-paddles" style="transform-origin:14px 18px;">
                      <line x1="14" y1="14.2" x2="14" y2="21.8"
                        stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-linecap="round"/>
                      <line x1="10.2" y1="18" x2="17.8" y2="18"
                        stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-linecap="round"/>
                    </g>
                  </svg>
                </div>
                <span class="ww-time-val" id="ww-time">--</span>
                <span class="ww-time-unit" id="ww-time-unit">remaining</span>
              </div>
            </div>

            <!-- Status label -->
            <div class="ww-cycle-label" id="ww-cycle-label">--</div>
          </div>

        </div>
      </ha-card>`;

    this._setupInteractions();
    this._updateCard();
  }

  // ── Update ─────────────────────────────────────────────────────────

  _updateCard() {
    if (!this._hass || !this._config) return;
    const cfg  = this._config;
    const hass = this._hass;
    const root = this.shadowRoot;
    const circ = 2 * Math.PI * 54;

    const machineStateObj = cfg.machine_entity ? hass.states[cfg.machine_entity] : null;
    const statusStateObj  = cfg.status_entity  ? hass.states[cfg.status_entity]  : null;
    const timeStateObj    = cfg.time_entity    ? hass.states[cfg.time_entity]    : null;

    // Resolve status — prefer dedicated status entity, fall back to machine entity
    const statusRaw  = statusStateObj?.state || machineStateObj?.state || '';
    const statusInfo = this._getStatusInfo(statusRaw);
    const active     = this._isActive(statusRaw);
    const isDone     = this._isDone(statusRaw);

    // Remaining time (minutes)
    let remainMins = null;
    if (timeStateObj) {
      const n = parseFloat(timeStateObj.state);
      if (!isNaN(n)) remainMins = Math.max(0, n);
    }

    // Progress arc offset
    const maxMins  = parseFloat(cfg.max_cycle_minutes) || 90;
    let arcOffset  = circ; // default: empty
    if (isDone) {
      arcOffset = 0;                                            // full ring when done
    } else if (active && remainMins !== null) {
      const elapsed = Math.max(0, maxMins - remainMins);
      arcOffset = circ * (1 - Math.min(1, elapsed / maxMins)); // fill as time elapses
    } else if (active) {
      arcOffset = circ * 0.25;                                  // partial fill if no time data
    }

    // ── Status pill ──
    const pillTextEl = root.getElementById('ww-pill-text');
    const dotEl      = root.getElementById('ww-dot');
    const pillEl     = root.getElementById('ww-pill');
    if (pillTextEl) pillTextEl.textContent  = statusInfo.label;
    if (dotEl)      dotEl.style.background  = statusInfo.dotColor;
    if (pillEl)     pillEl.style.borderColor = `${statusInfo.color}66`;

    // ── Arc ──
    const arcEl = root.getElementById('ww-arc');
    if (arcEl) {
      arcEl.style.stroke           = statusInfo.color;
      arcEl.style.strokeDashoffset = arcOffset.toFixed(2);
    }

    // ── Ring wrap state classes ──
    const wrapEl = root.getElementById('ww-ring-wrap');
    if (wrapEl) {
      wrapEl.classList.toggle('is-active', active && !isDone);
      wrapEl.classList.toggle('is-done',   isDone);
    }

    // ── Drum paddles rotation (CSS animation handles rocking; rotate for "done") ──
    const paddlesEl = root.getElementById('ww-drum-paddles');
    if (paddlesEl) {
      paddlesEl.style.transition = 'transform 0.8s ease';
      paddlesEl.style.transform  = isDone ? 'rotate(45deg)' : '';
    }

    // ── Time display ──
    const timeEl     = root.getElementById('ww-time');
    const timeUnitEl = root.getElementById('ww-time-unit');
    if (timeEl) {
      if (isDone) {
        timeEl.textContent = '✓';
        if (timeUnitEl) timeUnitEl.textContent = 'done';
      } else if (remainMins !== null && active) {
        timeEl.textContent = this._formatTime(remainMins);
        if (timeUnitEl) timeUnitEl.textContent = 'remaining';
      } else {
        timeEl.textContent = '--';
        if (timeUnitEl) timeUnitEl.textContent = '';
      }
    }

    // ── Cycle label ──
    const labelEl = root.getElementById('ww-cycle-label');
    if (labelEl) {
      if (isDone) {
        labelEl.textContent  = 'Cycle complete';
        labelEl.style.color  = '#34C759';
      } else if (active && remainMins !== null) {
        const pct = Math.round(Math.min(100, ((maxMins - remainMins) / maxMins) * 100));
        labelEl.textContent  = `${statusInfo.label} · ${pct}% done`;
        labelEl.style.color  = statusInfo.color;
      } else if (active) {
        labelEl.textContent  = statusInfo.label;
        labelEl.style.color  = statusInfo.color;
      } else if (statusInfo.label === '--') {
        labelEl.textContent  = 'No data';
        labelEl.style.color  = 'rgba(255,255,255,0.30)';
      } else {
        labelEl.textContent  = statusInfo.label;
        labelEl.style.color  = 'rgba(255,255,255,0.40)';
      }
    }

    // ── Title ──
    const titleEl = root.getElementById('ww-title');
    if (titleEl && cfg.friendly_name) titleEl.textContent = cfg.friendly_name;
  }

  // ── Helpers ────────────────────────────────────────────────────────

  _getStatusInfo(raw) {
    if (!raw) return { label: '--', color: 'rgba(255,255,255,0.30)', dotColor: 'rgba(255,255,255,0.22)' };
    const s = raw.toLowerCase().trim();

    if (['unavailable','unknown'].includes(s))
      return { label: 'Offline',   color: 'rgba(255,255,255,0.28)', dotColor: 'rgba(255,255,255,0.18)' };
    if (['idle','standby','off','ready'].includes(s))
      return { label: 'Idle',      color: 'rgba(255,255,255,0.55)', dotColor: '#888' };
    if (['washing','wash'].includes(s))
      return { label: 'Washing',   color: '#007AFF', dotColor: '#007AFF' };
    if (['rinsing','rinse'].includes(s))
      return { label: 'Rinsing',   color: '#5AC8FA', dotColor: '#5AC8FA' };
    if (['spinning','spin','draining'].includes(s))
      return { label: s === 'draining' ? 'Draining' : 'Spinning', color: '#FF9500', dotColor: '#FF9500' };
    if (['pre_wash','prewash','pre-wash','soaking','soak'].includes(s))
      return { label: 'Pre-wash',  color: '#BF5AF2', dotColor: '#BF5AF2' };
    if (['heating','heat'].includes(s))
      return { label: 'Heating',   color: '#FF6B35', dotColor: '#FF6B35' };
    if (['done','finished','complete','end','ended'].includes(s))
      return { label: 'Done',      color: '#34C759', dotColor: '#34C759' };
    if (['paused','pause'].includes(s))
      return { label: 'Paused',    color: '#FF9500', dotColor: '#FF9500' };
    if (['error','fault','fail'].includes(s))
      return { label: 'Error',     color: '#FF3B30', dotColor: '#FF3B30' };

    // Generic — format snake_case nicely
    const fmt = raw.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return { label: fmt, color: '#007AFF', dotColor: '#007AFF' };
  }

  _isActive(raw) {
    const s = (raw || '').toLowerCase().trim();
    return !['idle','done','finished','complete','end','ended','standby','off',
             'ready','unavailable','unknown','','paused'].includes(s);
  }

  _isDone(raw) {
    const s = (raw || '').toLowerCase().trim();
    return ['done','finished','complete','end','ended'].includes(s);
  }

  _formatTime(minutes) {
    if (minutes === null || isNaN(minutes)) return '--';
    const total = Math.round(parseFloat(minutes));
    if (total <= 0) return '0m';
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  _timeAgo(isoStr) {
    if (!isoStr) return '--';
    const mins = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
    if (mins < 1)    return 'Just now';
    if (mins === 1)  return '1 min ago';
    if (mins < 60)   return `${mins} mins ago`;
    if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
    return `${Math.floor(mins/1440)}d ago`;
  }

  // ── Interactions ───────────────────────────────────────────────────

  _setupInteractions() {
    const root    = this.shadowRoot;
    const pill    = root.getElementById('ww-pill');
    const ring    = root.getElementById('ww-ring-wrap');
    const titleEl = root.getElementById('ww-title');

    if (pill)    pill.addEventListener('click',  () => this._openStatusPopup());
    if (ring)    ring.addEventListener('click',  () => this._openStatusPopup());
    if (titleEl) titleEl.addEventListener('click', () => {
      const id = this._config?.machine_entity || this._config?.status_entity;
      if (id) this._fireMoreInfo(id);
    });
  }

  _fireMoreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true, detail: { entityId }
    }));
  }

  // ── Popup ──────────────────────────────────────────────────────────

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

    const cfg   = this._config;
    const hexBg = cfg.card_bg || '#1c1c1e';
    let r = 22, g = 22, b = 24;
    try {
      r = Math.max(0, parseInt(hexBg.slice(1,3),16) - 8);
      g = Math.max(0, parseInt(hexBg.slice(3,5),16) - 8);
      b = Math.max(0, parseInt(hexBg.slice(5,7),16) - 8);
    } catch(e) {}
    const op  = Math.min(1, (parseInt(cfg.card_bg_opacity) || 80) / 100 + 0.14);
    const bg  = `rgba(${r},${g},${b},${op})`;
    const tc  = cfg.text_color || '#ffffff';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      display:flex;align-items:center;justify-content:center;padding:16px;
      background:rgba(0,0,0,0.60);
      backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
      animation:wwFadeIn 0.2s ease;`;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes wwFadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes wwSlideUp { from{transform:translateY(20px) scale(0.97);opacity:0} to{transform:none;opacity:1} }
      .ww-popup { animation: wwSlideUp 0.28s cubic-bezier(0.34,1.28,0.64,1); }
      .ww-info-row { display:flex;align-items:flex-start;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.07); }
      .ww-info-row:last-child { border-bottom:none; }
      .ww-info-label { font-size:12px;color:rgba(255,255,255,0.40);font-weight:500;flex-shrink:0;padding-right:14px; }
      .ww-info-value { font-size:12px;font-weight:600;color:rgba(255,255,255,0.88);text-align:right;word-break:break-all; }
      .ww-close-btn:hover  { background:rgba(255,255,255,0.22)!important; }
      .ww-close-btn:active { background:rgba(255,255,255,0.28)!important; }
    `;
    overlay.appendChild(style);
    overlay.addEventListener('click', e => { if (e.target === overlay) this._closePopup(); });

    const popup = document.createElement('div');
    popup.className    = 'ww-popup';
    popup.style.cssText = `
      background:${bg};
      backdrop-filter:blur(40px) saturate(180%);
      -webkit-backdrop-filter:blur(40px) saturate(180%);
      border:1px solid rgba(255,255,255,0.14);
      border-radius:24px;
      box-shadow:0 24px 64px rgba(0,0,0,0.65);
      padding:20px;
      width:100%;max-width:380px;max-height:88vh;overflow-y:auto;
      font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;
      color:${tc};`;
    popup.addEventListener('touchmove', e => e.stopPropagation(), { passive: true });
    popup.addEventListener('click', e => e.stopPropagation());

    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;';
    hdr.innerHTML = `
      <span style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.40);">${titleText}</span>
      <button class="ww-close-btn" style="background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);font-size:15px;padding:0;transition:background 0.15s;flex-shrink:0;font-family:inherit;">✕</button>`;
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
    row.innerHTML = `<span class="ww-info-label">${label}</span><span class="ww-info-value">${String(value)}</span>`;
    parent.appendChild(row);
  }

  _openStatusPopup() {
    const cfg  = this._config;
    const hass = this._hass;
    const name = cfg.friendly_name || 'Washing Machine';

    const statusStateObj  = cfg.status_entity  ? hass?.states[cfg.status_entity]  : null;
    const machineStateObj = cfg.machine_entity ? hass?.states[cfg.machine_entity] : null;
    const timeStateObj    = cfg.time_entity    ? hass?.states[cfg.time_entity]    : null;
    const statusRaw       = statusStateObj?.state || machineStateObj?.state || '';
    const statusInfo      = this._getStatusInfo(statusRaw);

    const popup = this._createPopupBase(name);
    if (!popup) return;

    // Hero
    const circ      = 2 * Math.PI * 34;
    const maxMins   = parseFloat(cfg.max_cycle_minutes) || 90;
    let remainMins  = null;
    if (timeStateObj) {
      const n = parseFloat(timeStateObj.state);
      if (!isNaN(n)) remainMins = Math.max(0, n);
    }
    const isDone    = this._isDone(statusRaw);
    const active    = this._isActive(statusRaw);
    let arcOffset   = circ;
    if (isDone) {
      arcOffset = 0;
    } else if (active && remainMins !== null) {
      const elapsed = Math.max(0, maxMins - remainMins);
      arcOffset     = circ * (1 - Math.min(1, elapsed / maxMins));
    }

    const hero = document.createElement('div');
    hero.style.cssText = 'display:flex;align-items:center;gap:18px;margin-bottom:20px;';
    hero.innerHTML = `
      <div style="position:relative;width:80px;height:80px;flex-shrink:0;">
        <svg viewBox="0 0 88 88" width="80" height="80" style="display:block;">
          <circle cx="44" cy="44" r="34" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="5.5"/>
          <circle cx="44" cy="44" r="34" fill="none" stroke="${statusInfo.color}" stroke-width="5.5" stroke-linecap="round"
            style="stroke-dasharray:${circ.toFixed(2)};stroke-dashoffset:${arcOffset.toFixed(2)};transform:rotate(-90deg);transform-origin:44px 44px;"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;">
          <span style="font-size:18px;font-weight:700;color:${cfg.time_text_color || '#ffffff'};line-height:1;">
            ${isDone ? '✓' : (remainMins !== null ? this._formatTime(remainMins) : '--')}
          </span>
          ${remainMins !== null && !isDone ? `<span style="font-size:9px;color:rgba(255,255,255,0.32);">remaining</span>` : ''}
        </div>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:22px;font-weight:700;color:#ffffff;margin-bottom:8px;line-height:1;">${statusInfo.label}</div>
        <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.04em;background:${statusInfo.color}22;color:${statusInfo.color};border:1px solid ${statusInfo.color}44;">${name}</span>
      </div>`;
    popup.appendChild(hero);

    const table = document.createElement('div');
    table.style.cssText = 'border-top:1px solid rgba(255,255,255,0.08);padding-top:4px;';
    popup.appendChild(table);

    // Machine entity rows
    const primaryObj = statusStateObj || machineStateObj;
    if (primaryObj) {
      const attrs = primaryObj.attributes || {};
      if (attrs.friendly_name) this._addInfoRow(table, 'Device', attrs.friendly_name);
      this._addInfoRow(table, 'Status', primaryObj.state);
    }
    if (timeStateObj) {
      const unit = timeStateObj.attributes?.unit_of_measurement || 'min';
      this._addInfoRow(table, 'Remaining', `${timeStateObj.state} ${unit}`);
    }
    if (cfg.max_cycle_minutes) {
      this._addInfoRow(table, 'Max Cycle', `${cfg.max_cycle_minutes} min`);
    }
    if (cfg.machine_entity)  this._addInfoRow(table, 'Machine Entity', cfg.machine_entity);
    if (cfg.status_entity)   this._addInfoRow(table, 'Status Entity',  cfg.status_entity);
    if (cfg.time_entity)     this._addInfoRow(table, 'Time Entity',    cfg.time_entity);

    if (primaryObj) {
      this._addInfoRow(table, 'Last Changed', this._timeAgo(primaryObj.last_changed));
      this._addInfoRow(table, 'Last Updated', this._timeAgo(primaryObj.last_updated));
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
}


// ═══════════════════════════════════════════════════════════════════
//  EDITOR
// ═══════════════════════════════════════════════════════════════════

class WalrusWasherCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...WalrusWasherCard.getStubConfig(), ...config };
    if (this.shadowRoot.innerHTML) this.updateUI();
    else this.connectedCallback();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot.innerHTML) this.connectedCallback();
  }

  connectedCallback() {
    if (!this._hass) return;
    this._buildEditor();
  }

  _updateConfig(key, value) {
    if (!this._config) return;
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }, bubbles: true, composed: true
    }));
  }

  updateUI() {
    const root = this.shadowRoot;
    const cfg  = this._config;

    const setVal = (id, val) => { const el = root.getElementById(id); if (el) el.value = val ?? ''; };
    const setChk = (id, val) => { const el = root.getElementById(id); if (el) el.checked = !!val; };

    setVal('machine_entity',    cfg.machine_entity    || '');
    setVal('status_entity',     cfg.status_entity     || '');
    setVal('time_entity',       cfg.time_entity       || '');
    setVal('friendly_name',     cfg.friendly_name     || '');
    setVal('max_cycle_minutes', cfg.max_cycle_minutes ?? 90);
    setVal('card_bg_opacity',   cfg.card_bg_opacity   ?? 80);
    setChk('show_name',         cfg.show_name !== false);

    const opLabel = root.getElementById('opacity-val');
    if (opLabel) opLabel.textContent = `${cfg.card_bg_opacity ?? 80}%`;

    const nameRow = root.getElementById('friendly_name_row');
    if (nameRow) nameRow.style.display = cfg.show_name !== false ? '' : 'none';

    for (const field of this._getColourFields()) {
      const card = root.querySelector(`.colour-card[data-key="${field.key}"]`);
      if (!card) continue;
      const val     = cfg[field.key] || field.default;
      const preview = card.querySelector('.colour-swatch-preview');
      const dot     = card.querySelector('.colour-dot');
      const hexIn   = card.querySelector('.colour-hex');
      const picker  = card.querySelector('input[type=color]');
      if (preview) preview.style.background = val;
      if (dot)     dot.style.background     = val;
      if (hexIn)   hexIn.value              = val;
      if (picker && /^#[0-9a-fA-F]{6}$/.test(val)) picker.value = val;
    }
  }

  _getColourFields() {
    return [
      { key: 'ring_color',       label: 'Ring / Arc',       desc: 'Progress ring colour (base; overridden by cycle status)',  default: '#007AFF', maxlen: 7 },
      { key: 'time_text_color',  label: 'Time Text',        desc: 'Remaining time number in ring centre',                     default: '#ffffff', maxlen: 7 },
      { key: 'card_bg',          label: 'Card Background',  desc: '#00000000 = glass · 8-digit hex sets opacity e.g. #1c1c1e80', default: '#1c1c1e', maxlen: 9 },
      { key: 'text_color',       label: 'Text',             desc: 'Primary text colour',                                      default: '#ffffff', maxlen: 7 },
    ];
  }

  _buildEditor() {
    const hass = this._hass;
    const cfg  = this._config;

    // ── Entity auto-detection ───────────────────────────────────────

    const allEntities = Object.keys(hass.states).sort();
    const allSensors  = allEntities.filter(e => e.startsWith('sensor.'));
    const getName     = e => hass.states[e]?.attributes?.friendly_name || e;

    const scoreEntity = (id, friendlyName, keywords) => {
      const id2   = id.toLowerCase();
      const name2 = friendlyName.toLowerCase();
      return keywords.reduce((s, k) => s + (id2.includes(k) || name2.includes(k) ? 1 : 0), 0);
    };

    // Keyword sets
    const washKws    = ['wash','washer','washing','laundry','laundrie'];
    const machineKws = [...washKws, 'machine','appliance'];
    const statusKws  = [...washKws, 'cycle','status','state','program','programme','phase'];
    const timeKws    = [...washKws, 'remaining','time','duration','countdown','minutes','min'];

    // Score all sensors/entities and pick best candidates
    const scoredAll = (pool, kws) =>
      pool
        .map(e => ({ e, score: scoreEntity(e, getName(e), kws) }))
        .sort((a, b) => b.score - a.score || a.e.localeCompare(b.e));

    const machineCandidates = scoredAll(allEntities, machineKws);
    const statusCandidates  = scoredAll(allSensors,  statusKws);
    const timeCandidates    = scoredAll(allSensors,  timeKws);

    // Auto-select entities that haven't been set yet
    const autoSelect = (cfgKey, candidates) => {
      if (!cfg[cfgKey]) {
        const best = candidates.find(x => x.score > 0);
        if (best) {
          cfg[cfgKey] = best.e;
          this._updateConfig(cfgKey, best.e);
        }
      }
    };
    autoSelect('machine_entity', machineCandidates);
    autoSelect('status_entity',  statusCandidates);
    autoSelect('time_entity',    timeCandidates);

    // Build <option> HTML — suggested (★) first, then rest
    const buildOptions = (candidates, pool, selectedVal) => {
      const candSet   = new Set(candidates.map(c => c.e));
      const suggested = candidates.map(({ e, score }) =>
        `<option value="${e}" ${e === selectedVal ? 'selected' : ''}>${score > 0 ? '★ ' : ''}${getName(e)} (${e})</option>`
      ).join('');
      const rest = pool.filter(e => !candSet.has(e)).map(e =>
        `<option value="${e}" ${e === selectedVal ? 'selected' : ''}>${getName(e)} (${e})</option>`
      ).join('');
      const divider = suggested && rest ? `<option disabled>──────────────────</option>` : '';
      return `<option value="">— None —</option>${suggested}${divider}${rest}`;
    };

    const machineOpts = buildOptions(machineCandidates, allEntities, cfg.machine_entity || '');
    const statusOpts  = buildOptions(statusCandidates,  allSensors,  cfg.status_entity  || '');
    const timeOpts    = buildOptions(timeCandidates,    allSensors,  cfg.time_entity    || '');

    const COLOUR_FIELDS = this._getColourFields();

    // ── Build HTML ──────────────────────────────────────────────────
    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .container { display: flex; flex-direction: column; gap: 16px; padding: 4px 0 8px; }

        .section-title {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #888; margin-bottom: 4px;
        }

        .card-block {
          background: var(--card-background-color, #1c1c1e);
          border: 1px solid rgba(128,128,128,0.18);
          border-radius: 12px; overflow: hidden;
        }

        .select-row {
          padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;
          border-bottom: 1px solid rgba(128,128,128,0.12);
        }
        .select-row:last-child { border-bottom: none; }

        .select-row label {
          font-size: 12px; font-weight: 600;
          color: var(--primary-text-color, #e5e5e7);
        }
        .select-row .hint {
          font-size: 10px; color: #888; line-height: 1.4;
        }

        select, input[type=text], input[type=number] {
          width: 100%; padding: 7px 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          color: var(--primary-text-color, #e5e5e7);
          font-size: 13px; font-family: inherit;
          outline: none; appearance: none;
        }
        select:focus, input:focus {
          border-color: #007AFF; background: rgba(0,122,255,0.08);
        }
        select option { background: #1c1c1e; color: #e5e5e7; }

        .entity-search {
          font-size: 12px !important; padding: 5px 10px !important;
        }

        /* Toggles */
        .toggle-list  { padding: 4px 0; }
        .toggle-item  {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; gap: 12px;
          border-bottom: 1px solid rgba(128,128,128,0.10);
        }
        .toggle-item:last-child { border-bottom: none; }
        .toggle-label { font-size: 13px; font-weight: 500; color: var(--primary-text-color, #e5e5e7); }
        .toggle-sub   { font-size: 11px; color: #888; margin-top: 2px; }

        .toggle-switch { position: relative; display: inline-block; width: 42px; height: 24px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider {
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.15); border-radius: 24px;
          cursor: pointer; transition: background 0.25s;
        }
        .toggle-slider::before {
          content: ''; position: absolute;
          width: 18px; height: 18px; border-radius: 50%; background: #fff;
          left: 3px; top: 3px; transition: transform 0.25s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.35);
        }
        .toggle-switch input:checked + .toggle-slider             { background: #007AFF; }
        .toggle-switch input:checked + .toggle-slider::before     { transform: translateX(18px); }

        .input-row { padding: 4px 12px 10px; }
        .input-row input { margin-top: 4px; }

        /* Opacity */
        .opacity-row {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px;
        }
        .opacity-row label { font-size: 12px; font-weight: 600; color: var(--primary-text-color, #e5e5e7); flex-shrink: 0; }
        .opacity-row input[type=range] { flex: 1; accent-color: #007AFF; }
        .opacity-val { font-size: 12px; font-weight: 600; color: #007AFF; min-width: 36px; text-align: right; }

        /* Colour cards */
        .colour-card {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(128,128,128,0.10);
        }
        .colour-card:last-child { border-bottom: none; }

        .colour-swatch { position: relative; cursor: pointer; flex-shrink: 0; }
        .colour-swatch-preview {
          width: 40px; height: 40px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .colour-swatch input[type=color] {
          position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%;
          cursor: pointer; padding: 0; border: none; background: none;
        }

        .colour-info  { flex: 1; min-width: 0; }
        .colour-label { font-size: 12px; font-weight: 600; color: var(--primary-text-color, #e5e5e7); }
        .colour-desc  { font-size: 10px; color: #777; margin-top: 2px; }
        .colour-hex-row { display: flex; align-items: center; gap: 6px; margin-top: 5px; }
        .colour-dot   { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15); }
        .colour-hex   { font-size: 11px !important; padding: 3px 7px !important; font-family: 'SF Mono', monospace !important;
                        width: 90px !important; letter-spacing: 0.04em; }
        .colour-edit-icon { font-size: 13px; color: #555; cursor: default; }
      </style>

      <div class="container">

        <!-- Entities -->
        <div>
          <div class="section-title">Entities</div>
          <div class="card-block">

            <!-- Machine / Power entity -->
            <div class="select-row">
              <label for="machine_entity">Washing Machine Entity</label>
              <input class="entity-search" type="text" id="machine_search" placeholder="Search…">
              <select id="machine_entity">${machineOpts}</select>
              <span class="hint">★ = auto-detected · any entity domain · used for more-info tap</span>
            </div>

            <!-- Status entity -->
            <div class="select-row">
              <label for="status_entity">Cycle Status Entity</label>
              <input class="entity-search" type="text" id="status_search" placeholder="Search sensors…">
              <select id="status_entity">${statusOpts}</select>
              <span class="hint">★ = auto-detected · sensor reporting the current cycle phase (Washing, Rinsing, Spinning…)</span>
            </div>

            <!-- Time remaining entity -->
            <div class="select-row">
              <label for="time_entity">Remaining Time Entity</label>
              <input class="entity-search" type="text" id="time_search" placeholder="Search sensors…">
              <select id="time_entity">${timeOpts}</select>
              <span class="hint">★ = auto-detected · sensor reporting time remaining (numeric, in minutes)</span>
            </div>

          </div>
        </div>

        <!-- Cycle Settings -->
        <div>
          <div class="section-title">Cycle Settings</div>
          <div class="card-block">
            <div class="select-row" style="border-bottom:none;">
              <label for="max_cycle_minutes">Maximum Cycle Duration (minutes)</label>
              <input type="number" id="max_cycle_minutes" min="1" max="600"
                value="${cfg.max_cycle_minutes ?? 90}" placeholder="90">
              <span class="hint">Used to calculate ring fill progress. Default: 90 min.</span>
            </div>
          </div>
        </div>

        <!-- Display -->
        <div>
          <div class="section-title">Display</div>
          <div class="card-block">
            <div class="toggle-list">
              <div class="toggle-item">
                <div>
                  <div class="toggle-label">Show Name</div>
                  <div class="toggle-sub">Display card title above ring</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="show_name" ${cfg.show_name !== false ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div class="input-row" id="friendly_name_row" style="${cfg.show_name !== false ? '' : 'display:none'}">
              <input type="text" id="friendly_name" placeholder="e.g. Washing Machine" value="${cfg.friendly_name || ''}">
            </div>
          </div>
        </div>

        <!-- Colours -->
        <div>
          <div class="section-title">Colours</div>
          <div class="card-block">
            <div id="ww-colour-grid"></div>
          </div>
        </div>

        <!-- Opacity -->
        <div>
          <div class="section-title">Card Background Opacity</div>
          <div class="card-block">
            <div class="opacity-row">
              <label>Opacity</label>
              <input type="range" id="card_bg_opacity" min="0" max="100" value="${cfg.card_bg_opacity ?? 80}">
              <span class="opacity-val" id="opacity-val">${cfg.card_bg_opacity ?? 80}%</span>
            </div>
          </div>
        </div>

      </div>`;

    // ── Build colour picker cards ───────────────────────────────────
    const grid = this.shadowRoot.getElementById('ww-colour-grid');
    for (const field of COLOUR_FIELDS) {
      const savedVal  = cfg[field.key] || '';
      const swatchVal = savedVal || field.default;
      const pickerHex = /^#[0-9a-fA-F]{6}$/.test(swatchVal) ? swatchVal : swatchVal.substring(0, 7);

      const card = document.createElement('div');
      card.className   = 'colour-card';
      card.dataset.key = field.key;
      card.innerHTML = `
        <label class="colour-swatch">
          <div class="colour-swatch-preview" style="background:${swatchVal}"></div>
          <input type="color" value="${pickerHex}">
        </label>
        <div class="colour-info">
          <div class="colour-label">${field.label}</div>
          <div class="colour-desc">${field.desc}</div>
          <div class="colour-hex-row">
            <div class="colour-dot" style="background:${swatchVal}"></div>
            <input class="colour-hex" type="text" value="${savedVal}"
              maxlength="${field.maxlen}" placeholder="${field.default}" spellcheck="false">
            <span class="colour-edit-icon">✎</span>
          </div>
        </div>`;

      const picker  = card.querySelector('input[type=color]');
      const hexIn   = card.querySelector('.colour-hex');
      const preview = card.querySelector('.colour-swatch-preview');
      const dot     = card.querySelector('.colour-dot');

      const apply = val => {
        preview.style.background = val;
        dot.style.background     = val;
        if (/^#[0-9a-fA-F]{6}$/.test(val)) picker.value = val;
        hexIn.value = val;
        this._updateConfig(field.key, val);
      };

      picker.addEventListener('input',  () => apply(picker.value));
      picker.addEventListener('change', () => apply(picker.value));
      hexIn.addEventListener('input', () => {
        const v = hexIn.value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(v) || /^#[0-9a-fA-F]{8}$/.test(v)) apply(v);
      });
      hexIn.addEventListener('blur', () => {
        const cur = this._config[field.key] || field.default;
        if (!/^#[0-9a-fA-F]{6,8}$/.test(hexIn.value.trim())) hexIn.value = cur;
      });
      hexIn.addEventListener('keydown', e => { if (e.key === 'Enter') hexIn.blur(); });

      grid.appendChild(card);
    }

    this._setupListeners();

    // ── Live search wiring ─────────────────────────────────────────
    const root2 = this.shadowRoot;

    const wireSearch = (searchId, selectId, allData) => {
      const searchEl = root2.getElementById(searchId);
      const selectEl = root2.getElementById(selectId);
      if (!searchEl || !selectEl) return;
      searchEl.addEventListener('input', () => {
        const term    = searchEl.value.toLowerCase().trim();
        const current = selectEl.value;
        const matches = term
          ? allData.filter(d => d.id.toLowerCase().includes(term) || d.name.toLowerCase().includes(term))
          : allData;
        const suggested = matches.filter(d => d.suggested);
        const rest      = matches.filter(d => !d.suggested);
        const divider   = suggested.length && rest.length ? `<option disabled>──────────────────</option>` : '';
        selectEl.innerHTML =
          `<option value="">— None —</option>` +
          suggested.map(d => `<option value="${d.id}" ${d.id === current ? 'selected' : ''}>★ ${d.name} (${d.id})</option>`).join('') +
          divider +
          rest.map(d => `<option value="${d.id}" ${d.id === current ? 'selected' : ''}>${d.name} (${d.id})</option>`).join('');
      });
    };

    const makeData = (candidates, pool) => {
      const candSet   = new Set(candidates.map(c => c.e));
      const suggested = candidates.map(({ e, score }) => ({ id: e, name: getName(e), suggested: score > 0 }));
      const rest      = pool.filter(e => !candSet.has(e)).map(e => ({ id: e, name: getName(e), suggested: false }));
      return [...suggested, ...rest];
    };

    wireSearch('machine_search', 'machine_entity', makeData(machineCandidates, allEntities));
    wireSearch('status_search',  'status_entity',  makeData(statusCandidates,  allSensors));
    wireSearch('time_search',    'time_entity',     makeData(timeCandidates,    allSensors));
  }

  _setupListeners() {
    const root = this.shadowRoot;
    const get  = id => root.getElementById(id);

    get('machine_entity').onchange = e => this._updateConfig('machine_entity', e.target.value);
    get('status_entity').onchange  = e => this._updateConfig('status_entity',  e.target.value);
    get('time_entity').onchange    = e => this._updateConfig('time_entity',    e.target.value);

    get('friendly_name').oninput     = e => this._updateConfig('friendly_name',     e.target.value);
    get('max_cycle_minutes').oninput = e => this._updateConfig('max_cycle_minutes', parseInt(e.target.value) || 90);

    get('show_name').onchange = e => {
      this._updateConfig('show_name', e.target.checked);
      const nameRow = root.getElementById('friendly_name_row');
      if (nameRow) nameRow.style.display = e.target.checked ? '' : 'none';
    };

    get('card_bg_opacity').oninput = e => {
      const val = parseInt(e.target.value);
      root.getElementById('opacity-val').textContent = val + '%';
      this._updateConfig('card_bg_opacity', val);
    };
  }
}


// ── Registration ──────────────────────────────────────────────────

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
    preview:     true,
    description: 'Displays washing machine cycle status and remaining time with an animated progress ring.',
  });
}
