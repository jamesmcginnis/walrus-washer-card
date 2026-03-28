# 🫧 Walrus Washer Card

A Home Assistant Dashboard card that shows your washing machine's cycle status and remaining time as a smooth animated progress ring — with phase detection, colour-coded status pill, and tap-to-inspect popups.

---

## ✨ Features

- **Animated progress ring** — fills as the cycle elapses, driven by remaining time vs. your configured max cycle duration
- **Rocking drum animation** — the washing machine icon rocks back and forth while a cycle is active
- **Status pill** — shows Washing, Rinsing, Spinning, Pre-wash, Heating, Paused, Done, and more with a matching colour-coded dot
- **Cycle label** — displays the current phase and percentage complete (e.g. `Washing · 64% done`) below the ring
- **Done state** — ring fills completely, icon pulses, label shows `Cycle complete` in green
- **Tap the ring or pill** — opens a polished popup with cycle status, remaining time, entity IDs, and last-updated time
- **Tap the card title** — opens the native Home Assistant More Info dialog for the machine entity
- **Optional friendly name** — displayed in the card header
- **Full visual editor** — smart entity auto-detection, colour pickers, max cycle duration, and background opacity slider

---

## 📸 Preview

<p align="center">
  <img src="preview1.png" alt="Walrus Washer Card — active cycle" width="380">
  &nbsp;&nbsp;
  <img src="preview2.png" alt="Walrus Washer Card — status popup" width="380">
</p>

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

The editor automatically detects likely washing machine entities and sensors, surfacing them at the top of each dropdown with a ★. Keywords like `wash`, `laundry`, `cycle`, `remaining`, and `countdown` are used to score and rank your entities automatically.

### YAML

```yaml
type: custom:walrus-washer-card
machine_entity: sensor.washing_machine
status_entity: sensor.wash_cycle_status
time_entity: sensor.wash_cycle_remaining_time
friendly_name: Washing Machine
show_name: true
max_cycle_minutes: 90
card_bg: "#1c1c1e"
card_bg_opacity: 80
text_color: "#ffffff"
ring_color: "#007AFF"
time_text_color: "#ffffff"
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `machine_entity` | `string` | — | Entity ID for the washing machine (any domain) — used for More Info tap |
| `status_entity` | `string` | — | Sensor reporting the current cycle phase (e.g. `Washing`, `Rinsing`, `Spinning`) |
| `time_entity` | `string` | — | Sensor reporting remaining time in minutes (numeric) |
| `friendly_name` | `string` | `"Washing Machine"` | Name shown in the card header |
| `show_name` | `boolean` | `true` | Show or hide the friendly name |
| `max_cycle_minutes` | `number` | `90` | Maximum cycle duration in minutes — used to calculate ring fill progress |
| `card_bg` | `string` | `#1c1c1e` | Card background colour (hex) |
| `card_bg_opacity` | `number` | `80` | Background opacity 0–100 |
| `text_color` | `string` | `#ffffff` | Primary text colour |
| `ring_color` | `string` | `#007AFF` | Base progress ring colour (overridden per phase when status is known) |
| `time_text_color` | `string` | `#ffffff` | Colour of the remaining time value inside the ring |

---

## 🎨 Interactions

| Action | Result |
|---|---|
| **Tap** the ring | Opens a cycle status popup with entity details |
| **Tap** the status pill | Opens the cycle status popup |
| **Tap** the card title | Opens the native HA More Info dialog for the machine entity |

---

## 🌈 Cycle Phase Colours

The status pill and popup ring automatically colour-code based on the reported cycle phase:

| Phase | Colour |
|---|---|
| Washing | `#007AFF` Blue |
| Rinsing | `#5AC8FA` Light Blue |
| Spinning / Draining | `#FF9500` Amber |
| Pre-wash / Soaking | `#BF5AF2` Purple |
| Heating | `#FF6B35` Orange |
| Done / Finished | `#34C759` Green |
| Paused | `#FF9500` Amber |
| Idle / Standby | Grey |
| Error / Fault | `#FF3B30` Red |
| Offline / Unavailable | Dim white |

---

## 🫧 Supported Integrations

Any integration that exposes washing machine state as sensor entities will work, including:

- [Home Connect](https://www.home-assistant.io/integrations/home_connect/)
- [SmartThings](https://www.home-assistant.io/integrations/smartthings/)
- [Meross](https://www.home-assistant.io/integrations/meross/)
- Custom REST / MQTT sensors

---

## 📄 License

[MIT](LICENSE)

---

<p align="center">Made with 🫧 by <a href="https://github.com/jamesmcginnis">jamesmcginnis</a></p>
