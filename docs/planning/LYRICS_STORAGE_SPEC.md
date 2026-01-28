# Lyrics Storage / Teleprompter Specification

> Feature spec for storing and displaying lyrics with a scrollable teleprompter mode.

---

## Why It Makes Sense

- **Natural extension of Song Library** — Songs already exist, lyrics are a missing attribute
- **Rehearsal → Performance continuity** — Same data used in Studio (rehearse) and Stage (perform)
- **Scrollable lyrics on iPhone = teleprompter** — Real utility, not gimmicky

---

## Architecture Options

| Approach | Pros | Cons |
|----------|------|------|
| **A) Add `lyrics` field to Songs** | Simple, lyrics live with the song | Mixing practice artifacts with performance needs |
| **B) Lyrics as a Block type** | Consistent with existing artifact system | Extra step to attach to song |
| **C) Dedicated Lyrics view on Song detail** | Clear UX, purpose-built display | New screen/component |

### Recommendation

**A + C combined**: Store lyrics on the song record, but provide a dedicated "Lyric View" mode optimized for reading/scrolling (large text, dark mode, maybe auto-scroll).

---

## Value-Adds Beyond "Just a Notes App"

| Feature | Description |
|---------|-------------|
| **Linked to setlist order** | Swipe through lyrics in set order |
| **Performance Mode** | Big text, no distractions, maybe auto-scroll tempo |
| **Chord charts inline (optional)** | `[Am] Lyrics here [G] more lyrics` |
| **Quick search** | "What song has 'river' in it?" |

---

## Performance Mode Features

- Large, readable text
- Dark mode optimized
- Auto-scroll at configurable tempo
- Swipe left/right for next/previous song in setlist
- No distractions — minimal chrome

---

## Technical Complexity

**Low** — A text field + a display mode. Auto-scroll adds a bit more, but manageable.

| Component | Effort |
|-----------|--------|
| Add `lyrics` field to Songs | Low — schema + form update |
| Lyrics display view | Low — text rendering |
| Performance Mode (big text, dark) | Low |
| Auto-scroll | Medium — timing/tempo logic |
| Setlist integration | Medium — navigation between songs |
| Inline chord parsing | Medium — regex for `[Chord]` notation |
| **Total estimate** | **~2-3 days for MVP** |

---

## Relationship to Chord Chart Builder

| Approach | Description |
|----------|-------------|
| **Separate** | Lyrics view = text only. Chart Builder = chords + structure. |
| **Combined** | Chart Builder supports optional lyrics under chord lines. |
| **Flexible** | User chooses: Chords only? Lyrics only? Both? |

The Lyrics Storage feature focuses on vocalists who just need text. Chord Chart Builder serves instrumentalists who need structure. Consider both, with optional integration.

---

## Open Questions

1. Should Performance Mode be available from Setlist view directly?
2. Auto-scroll tempo — BPM based, or fixed "slow/medium/fast" presets?
3. How to handle songs with both lyrics AND chord charts?

---

*Created: 2026-01-25*
