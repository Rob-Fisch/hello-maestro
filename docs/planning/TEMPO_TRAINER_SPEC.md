# Tempo Trainer (Smart Metronome) Specification

> Feature spec for a progressive tempo-building tool in The Studio.

---

## Core Idea

A "smart metronome mode" that automatically speeds up over repetitions, so you progressively build speed without manually adjusting.

---

## Configurable Parameters

| Setting | Example | Notes |
|---------|---------|-------|
| **Starting Tempo** | 60 bpm | Where you begin |
| **Target Tempo** | 120 bpm | Optional end goal |
| **Bars per Rep** | 32 bars | How long before the loop "resets" |
| **Time Signature** | 4/4 | Beats per bar |
| **Increase Amount** | +5 bpm | How much to bump each time |
| **Increase Frequency** | Every 1 rep | Or every 2nd, 3rd rep |

---

## Example Workout

> "32 bars of 4/4 at 60bpm. Every rep, add 5bpm until you hit 120bpm."

| Rep | Tempo | Bars |
|-----|-------|------|
| 1 | 60 bpm | 32 |
| 2 | 65 bpm | 32 |
| 3 | 70 bpm | 32 |
| ... | ... | ... |
| 13 | 120 bpm | 32 |
| Done! | 🎉 | |

---

## UI Sketch

```
┌─────────────────────────────────────────┐
│          TEMPO TRAINER                  │
├─────────────────────────────────────────┤
│                                         │
│              ● 72 bpm                   │
│           [  ▶  START  ]                │
│                                         │
│  Rep 3 / 13      Bar 17 / 32            │
│  ════════════════════░░░░░░░            │
│                                         │
├─────────────────────────────────────────┤
│  Start: 60 bpm    Target: 120 bpm       │
│  +5 bpm every rep                       │
│  32 bars in 4/4                         │
│                    [⚙️ Edit Settings]   │
└─────────────────────────────────────────┘
```

---

## Advanced Options (Future)

| Feature | Description |
|---------|-------------|
| **Decrease mode** | For "coming down" after reaching peak |
| **Random variations** | Occasional tempo surprise to keep you honest |
| **Presets** | "Scales workout", "Jazz head tempo drill" |
| **Accent patterns** | First beat loud, others soft |
| **Audio cue on tempo change** | "Now at 75 bpm" (TTS or chime) |
| **Link to Practice Artifact** | Attach a tempo trainer preset to a specific exercise |

---

## Placement Options

| Option | Description |
|--------|-------------|
| **A) Standalone** | Separate "Tempo Trainer" screen in The Studio |
| **B) Embedded** | Attach tempo trainer settings to individual Practice Artifacts |
| **C) Both** | Standalone tool + optional artifact integration |

**Decision**: Free in The Studio, standalone or linked to routines — both options available.

---

## Technical Complexity

| Component | Effort | Notes |
|-----------|--------|-------|
| Basic metronome engine | 1-2 days | Web Audio API, beat scheduling |
| Tempo ramping logic | 0.5 day | Math for bar counting, auto-increment |
| Settings UI | 1 day | Sliders, inputs, presets |
| Visual feedback | 0.5-1 day | Beat indicator, progress bar, rep counter |
| Integration into Studio | 0.5 day | Navigation, maybe link to artifacts |
| Testing & polish | 1 day | Browser quirks, iOS Safari edge cases |
| **Total estimate** | **~4-6 days** | Solid, polished implementation |

**Complexity**: Medium — The Web Audio API has some learning curve, but it's well-documented. No backend changes needed.

---

## Pricing Tier

**Free** — Basic metronome and tempo ramping available to all users in The Studio.

---

## Open Questions

1. Should presets be saveable and shareable?
2. Visual beat indicator style — flashing circle, bouncing ball, or numeric?
3. Should this integrate with song BPM from the Song Library?

---

*Created: 2026-01-25*
