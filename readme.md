# 🫧 Walrus Washer Card

A Home Assistant Dashboard card that shows your washing machine's cycle status and remaining time as a smooth animated progress ring — with smart plug control, a live status pill, and tap-to-inspect popups.

---

## ✨ Features

- **Animated progress ring** — starts full when a cycle begins and drains to empty as time runs out, driven by your remaining time sensor
- **Drum icon animation** — the washing machine icon spins only while the machine is actively running; completely still when idle or offline
- **Status pill** — shows the current cycle phase (Washing, Rinsing, Spinning, Pre-wash, Heating, Paused, Done…) with a colour-coded dot
- **Smart plug control** — link any switch or plug entity; tap the pill to turn the machine on or off
  - **Green dot** = plug is on · **Red dot** = plug is off
  - Plug off → pill shows **Off** (not Idle)
  - Plug on + machine still booting → pill shows **Starting…**
  - Plug on → pill shows the live wash status
  - Tap when off → turns plug on immediately
  - Tap when on → friendly confirmation popup before turning off
- **Tap the ring** — opens a detailed popup with cycle status, remaining time, entity IDs, and last-updated time
- **Tap the card title** — opens the native Home Assistant More Info dialog for the machine entity
- **Visual editor** — auto-detects your washing machine, status, time, and plug entities with ★ suggestions; no YAML required

---

## 🚀 Installation

### Via HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jamesmcginnis&repository=walrus-washer-card&category=plugin)

1. Click the button above, or open HACS → **Frontend** → **⋮** → **Custom repositories**
2. Add `https://github.com/jamesmcginnis/walrus-washer-card` as a **Dashboard** repository
3. Find **Walrus Washer Card** and click **Download**
4. Reload your browser

### Manual

1. Download `walrus-washer-card.js` from the [latest release](https://github.com/jamesmcginnis/walrus-washer-card/releases/latest)
2. Copy it to `/config/www/walrus-washer-card.js`
3. In Home Assistant, go to **Settings → Dashboards → Resources** and add:
   ```
   URL:  /local/walrus-washer-card.js
   Type: JavaScript module
   ```
4. Reload your browser

---

## ⚙️ Configuration

### Visual Editor

The card ships with a full visual editor. Open any dashboard, click **Add Card**, search for **Walrus Washer Card**, and configure everything without touching YAML.

The editor automatically detects your washing machine, status sensor, remaining time sensor, and smart plug using keyword scoring — entities are surfaced at the top of each dropdown with a ★.

### YAML

```yaml
type: custom:walrus-washer-card
machine_entity: sensor.washing_machine
status_entity: sensor.wash_cycle_status
time_entity: sensor.wash_cycle_remaining_time
friendly_name: Washing Machine
show_name: true
max_cycle_minutes: 90
smart_plug_enabled: true
smart_plug_entity: switch.washing_machine_plug
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `machine_entity` | `string` | — | Main washing machine entity (any domain) — title tap opens More Info |
| `status_entity` | `string` | — | Sensor reporting the current cycle phase (e.g. `washing`, `rinsing`, `spinning`) |
| `time_entity` | `string` | — | Sensor reporting minutes remaining (numeric) — drives the ring drain |
| `friendly_name` | `string` | `"Washing Machine"` | Name shown in the card header |
| `show_name` | `boolean` | `true` | Show or hide the friendly name |
| `max_cycle_minutes` | `number` | `90` | Maximum cycle duration in minutes — ring is full at this value |
| `smart_plug_enabled` | `boolean` | `false` | Enable smart plug control via the status pill |
| `smart_plug_entity` | `string` | — | `switch.*` or `input_boolean.*` entity to control |

---

## 🎨 Interactions

| Action | Result |
|---|---|
| **Tap** the ring | Opens a cycle status popup with entity details and last-updated time |
| **Tap** the pill — plug off | Turns the smart plug on immediately |
| **Tap** the pill — plug on | Opens a friendly confirmation before turning the plug off |
| **Tap** the pill — no plug configured | Opens the cycle status popup |
| **Tap** the card title | Opens the native HA More Info dialog for the machine entity |

---

## 🌈 Cycle Phase Colours

The status pill dot and progress ring automatically colour-code based on the reported cycle phase:

| Phase | Colour |
|---|---|
| Washing | `#378ADD` Blue |
| Rinsing | `#5AC8FA` Light Blue |
| Spinning / Draining | `#FF9500` Amber |
| Pre-wash / Soaking | `#BF5AF2` Purple |
| Heating | `#FF6B35` Orange |
| Done / Finished | `#34C759` Green |
| Paused | `#FF9500` Amber |
| Idle / Standby | Grey |
| Error / Fault | `#FF3B30` Red |
| Offline / Unavailable | Dim |

---

## 🫧 Supported Integrations

Any integration that exposes washing machine state as sensor entities will work, including:

- [Home Connect](https://www.home-assistant.io/integrations/home_connect/)
- [SmartThings](https://www.home-assistant.io/integrations/smartthings/)
- [Meross](https://www.home-assistant.io/integrations/meross/)
- Custom REST / MQTT sensors

The card handles numeric status codes (e.g. `0`, `1`) gracefully, mapping them to Idle when no recognised phase is detected.

---

## 📄 License

[MIT](LICENSE)

---

<p align="center">Made with 🫧 by <a href="https://github.com/jamesmcginnis">jamesmcginnis</a></p>
