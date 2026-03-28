# 🫧 Walrus Washer Card

A Home Assistant Dashboard card that displays your washing machine's cycle status and remaining time as a smooth animated progress ring — with phase-aware colour coding, a rocking drum animation, and tap-to-inspect popups.

---

<p align="center">
  <img src="https://raw.githubusercontent.com/jamesmcginnis/walrus-washer-card/main/preview1.png" alt="Walrus Washer Card preview" width="380">
  &nbsp;
  <img src="https://raw.githubusercontent.com/jamesmcginnis/walrus-washer-card/main/preview2.png" alt="Walrus Washer Card popup" width="380">
</p>

---

## ✨ What it does

- **Animated progress ring** showing elapsed cycle time with a breathing glow effect while active
- **Rocking drum icon** — the washing machine illustration rocks back and forth during an active cycle
- **Status pill** — Washing, Rinsing, Spinning, Pre-wash, Heating, Paused, Done — each with a colour-coded dot
- **Cycle label** — shows phase and percentage complete below the ring (e.g. `Washing · 64% done`)
- **Done state** — ring fills solid green, icon pulses, label reads `Cycle complete`
- **Tap the ring or pill** for a detailed popup: cycle status, remaining time, entity IDs, and last-updated time
- **Tap the card title** to open the native Home Assistant More Info panel for the machine entity
- **Visual editor** with smart entity detection — machine entity, status sensor, and remaining time sensor all auto-detected with ★ suggestions

---

## 🚀 Quick Start

After downloading through HACS, add the resource and drop the card into your dashboard via the UI or YAML:

```yaml
type: custom:walrus-washer-card
machine_entity: sensor.washing_machine
status_entity: sensor.wash_cycle_status
time_entity: sensor.wash_cycle_remaining_time
friendly_name: Washing Machine
max_cycle_minutes: 90
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
  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=jamesmcginnis&repository=walrus-washer-card&category=plugin">
    Or add <code>https://github.com/jamesmcginnis/walrus-washer-card</code> as a custom HACS Dashboard repository.
  </a>
</p>
