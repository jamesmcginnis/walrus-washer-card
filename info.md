# 🫧 Walrus Washer Card

A Home Assistant Dashboard card that displays your washing machine's cycle status and remaining time as a smooth animated progress ring — with smart plug control, a live status pill, and tap-to-inspect popups.

---

## ✨ What it does

- **Animated progress ring** — starts full when a cycle begins and drains to empty as time runs out; the cycle length is tracked automatically, no setup needed
- **Drum icon animation** — spins only while the machine is actively running; completely still when idle or offline
- **Status pill** — shows the live cycle phase (Washing, Rinsing, Spinning, Pre-wash, Heating, Paused, Done…) with a colour-coded dot
- **Smart plug control** — 🟢 green dot = plug on, 🔴 red dot = plug off; tap to turn on instantly or confirm before turning off
  - Plug off → pill shows **Off**
  - Plug on + machine booting → pill shows **Starting…**
  - Plug on → pill shows the actual wash status
- **Tap the ring** for a detailed popup: status, remaining time, entity IDs, and last-updated time
- **Tap the card title** to open the native Home Assistant More Info panel
- **Visual editor** with smart auto-detection — washing machine, status sensor, time sensor, and smart plug all surfaced with ★ suggestions

---

## 🚀 Quick Start

After downloading through HACS, drop the card into your dashboard via the UI or YAML:

```yaml
type: custom:walrus-washer-card
machine_entity: sensor.washing_machine
status_entity: sensor.wash_cycle_status
time_entity: sensor.wash_cycle_remaining_time
friendly_name: Washing Machine
smart_plug_enabled: true
smart_plug_entity: switch.washing_machine_plug
```

---

## ➕ Add to Home Assistant

<p align="center">
  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=jamesmcginnis&repository=walrus-washer-card&category=plugin">
    <img
      src="https://my.home-assistant.io/badges/hacs_repository.svg"
      alt="Open your Home Assistant instance and open a repository inside the Home Assistant Community Store."
      style="height:48px;"
    />
  </a>
</p>

<p align="center">
  Or add <code>https://github.com/jamesmcginnis/walrus-washer-card</code> as a custom HACS Dashboard repository.
</p>
