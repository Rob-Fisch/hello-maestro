# Chord Chart Builder Specification

> Feature spec for a "cheat sheet generator" for gigging musicians.  
> **Positioning**: "Arranger Friendly" — the missing link between Routine Builder and SetList.

---

## The Problem

Many popular bands don't use traditional musical notation or even jazz fakebook style lead sheets. They use chord symbols, often with inaccurate measure depictions and cryptic AABBACCA indicators.

Good ones at least have bar lines in the right places and the right number of measures:

```
|  C7         |  F7      |   C7      |   C7      F#7|
|  F7          |  F#o    |  C7      |   Em7    A7  |
```

**Current pain points:**
- Scribble on napkins
- Fight with Word/Google Docs formatting
- Pay for iReal Pro (which is overkill for many)

---

## Strategic Positioning

**We are NOT competing with iReal Pro or ForScore.**

We're filling the gap in OpusMode's workflow:

```
Routine Builder → [Chord Chart Builder] → SetList
   (practice)         (learn the tune)      (perform)
```

A simple, focused tool that:
- Lets you jot down chord changes quickly
- Stores them with your songs (future integration)
- Prints a readable chart for the gig

---

## Core Philosophy: Click-First Data Entry

**iReal Pro's data entry is painful. That's our gap.**

| iReal Pro Pain | OpusMode Solution |
|----------------|-------------------|
| Tiny fiddly chord picker | Big tap targets — chord palette at bottom |
| Endless scrolling through chord types | Smart defaults — 12 qualities total |
| Confusing navigation | Grid-first — see 4/8/16 bars at once |
| No templates | Start from forms — 12-bar blues, AABA, etc. |

---

## Dual Rendering: Screen vs Print

**One source of truth, two renderings.**

| Format | Optimized For | Characteristics |
|--------|---------------|-----------------|
| **Screen View** | Editing, rehearsal, quick reference | Condensed, uses repeat signs, fits on screen |
| **Print View** | Performance, stands, aging eyes 👀 | Expanded, no cryptic symbols, linear flow, large text |

### Screen View (Condensed)
```
MUSTANG SALLY (Key: C)

[Verse] ×3
│ C7  │ C7  │ C7  │ C7  │
│ F7  │ F7  │ C7  │ C7  │
│ G7  │ F7  │ C7  │ G7  │

[Chorus]
│ F7  │ F7  │ F7  │ F7  │

Form: Verse → Verse → Chorus → Verse → Chorus → Chorus
```

### Print View (Expanded)
```
MUSTANG SALLY                                Key: C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VERSE 1
│ C7        │ C7        │ C7        │ C7        │
│ F7        │ F7        │ C7        │ C7        │
│ G7        │ F7        │ C7        │ G7        │

VERSE 2
│ C7        │ C7        │ C7        │ C7        │
... (fully expanded, no repeat notation)
```

---

## Zoom Modes (Overview ↔ Detail)

### Overview Mode (Minimap)
- See whole song structure at a glance
- Compressed rows, small but legible
- Tap any section to zoom in

### Detail Mode (Performance View)
- One section fills the screen
- BIG chord symbols
- Swipe left/right for next/previous section
- "Overview" button to zoom back out

**Toggle gesture**: Pinch to zoom out, spread to zoom in (+ explicit button for discoverability)

---

## Section & Arrangement Model

The chart stores:
1. **Sections** — Named chunks (Verse, Chorus, Bridge, Intro, Outro)
2. **Section content** — The actual chord grid for each section
3. **Arrangement** — The order sections are played, including repeats

```json
{
  "title": "Mustang Sally",
  "key": "C",
  "sections": {
    "verse": [["C7","C7","C7","C7"], ["F7","F7","C7","C7"], ["G7","F7","C7","G7"]],
    "chorus": [["F7","F7","F7","F7"]]
  },
  "arrangement": ["verse", "verse", "chorus", "verse", "chorus", "chorus"]
}
```

---

## Chord Entry Flow

### Step 1: Set the Key
- User sets primary key at chart level (e.g., **C major** or **A minor**)
- Enables smart predictions for the rest of the chart

### Step 2: Tap a Measure to Edit
- Selected measure **expands** into larger edit zone above the grid
- Shows 4 beat slots clearly (or per time signature)

```
┌─────────────────────────────────────────────┐
│  EDITING BAR 5                              │
│  ┌──────┬──────┬──────┬──────┐              │
│  │  1   │  2   │  3   │  4   │  ← Tap beat  │
│  │ C7   │      │  F7  │      │              │
│  └──────┴──────┴──────┴──────┘              │
└─────────────────────────────────────────────┘
```

### Step 3: Smart Picker (Key-Aware)
Based on the key, show **diatonic chords** as quick picks:
- For C major: `C` `Dm` `Em` `F` `G` `Am` `Bdim`
- Plus recent chords (last 5 used)

```
┌─────────────────────────────────────────────┐
│  SMART PICKS (Key of C)                     │
│  ┌────┬────┬────┬────┬────┬────┬─────┐     │
│  │ C  │ Dm │ Em │ F  │ G  │ Am │Bdim │     │
│                                             │
│  RECENT: G7 │ C7 │ F7                       │
│                                             │
│  [ ♯♭ Circle of 5ths ]  ← For chromatic    │
└─────────────────────────────────────────────┘
```

### Step 4: Circle of 5ths (For Non-Diatonic Chords)
- Tap **♯♭ button** to open Circle of 5ths picker
- Select ANY root (C, C♯/D♭, D, etc.)
- Then pick chord quality

---

## Chord Qualities (12 Total)

### Primary Row (6) — One Tap
```
┌─────┬─────┬─────┬─────┬─────┬─────┐
│ maj │ min │  7  │ m7  │maj7 │ dim │
└─────┴─────┴─────┴─────┴─────┴─────┘
```

### Secondary Row (6) — Tap "More"
```
┌─────┬─────┬─────┬─────┬─────┬─────┐
│ m7♭5│ aug │sus4 │  9  │ m9  │ 6   │
└─────┴─────┴─────┴─────┴─────┴─────┘
```

> **Note**: Half-diminished (m7♭5, also written ø7) is essential for ii-V-I progressions in minor keys. Keep it prominent in the secondary row.

### Slash Chords (Exception)
For voicings like `B♭/C` (sus sound), allow optional bass note override:
1. Pick chord normally → `Bb`
2. Tap "/ bass" toggle
3. Select bass note → `C`
4. Result: `Bb/C`

---

## Section Names

Section names are **fully customizable** (free text input). Users can type whatever they need:

- Common: `Intro`, `Verse`, `Chorus`, `Bridge`, `Outro`
- Jazz: `A Section`, `B Section`, `Head`, `Solos`, `Shout Chorus`
- Other: `Tag`, `Coda`, `Turnaround`, `Vamp`, `Pre-Chorus`

Preset suggestions offered, but not enforced.

---

## Templates

Starting templates for common forms:

- 12-bar blues
- 8-bar verse
- AABA (standard jazz form)
- Verse-Chorus-Bridge
- Custom (blank)

---

## Print Options

| Setting | Options |
|---------|---------|
| **Expand repeats** | Yes (default) / No |
| **Font size** | Small / Medium / Large / Extra Large |
| **Bars per line** | 4 (default) / 2 / 8 |
| **Include lyrics** | Yes / No |

---

## Technical Complexity

| Component | Effort | Status |
|-----------|--------|--------|
| Section/arrangement data model | 1 day | ✅ Done |
| Grid editor UI | 2-3 days | ✅ Done |
| Chord picker (key-aware) | 1-2 days | ✅ Done |
| Print view rendering | 1 day | Planned |
| Zoom modes (Overview ↔ Detail) | 1 day | Phase 2 |
| PDF export | 0.5 day | Phase 2 |
| **Transposition** | 0.5 day | Phase 2 |

---

## Phase 2 Features (Future)

- **Major/Minor Mode** — Key selector shows "D" or "Dm", Smart Picks adjust accordingly
- **Transposition** — Shift all chords up/down by semitones, automatically updates key
- **Subdivide Bar** — Tap "Subdivide" to split selected bar into beat slots:
  - 4/4 → 4 beat slots
  - 3/4 → 3 beat slots  
  - 6/8, 2/4 → 2 beat slots
  - Context row shows mini-section with selected bar highlighted
- **Zoom modes** — Overview (whole song) ↔ Detail (one section)
- **PDF export** — Client-side PDF generation
- **Song Library integration** — Attach charts to songs
- **Templates** — 12-bar blues, AABA, etc.
- **Recent chords** — Quick access to last 5 used chords
- **Individual bar add/delete** — Add 1 bar at a time, delete single bars

---

## Resolved Questions

| Question | Decision |
|----------|----------|
| Where in the app? | **The Stage** — alongside SetLists |
| Song Library integration? | Phase 2 — standalone for now |
| Transposition? | Phase 2 — data model supports it |
| Multi-chord bars? | Phase 2 — "Subdivide Bar" feature |

---

*Created: 2026-01-25*  
*Updated: 2026-01-25 — MVP implementation complete, added Phase 2 roadmap*
