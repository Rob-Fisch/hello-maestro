---
description: UI theming standards and color usage
---

# OpusMode Theming Standards

## Theme System

The app uses `lib/theme.ts` with a single "vibrant" dark theme. Key insight: `theme.primary` is **white** for text, not for button backgrounds.

## Color Palette

### Button Colors (Use explicit colors, not theme.primary)

| Purpose | Color | Hex |
|---------|-------|-----|
| **Primary Action** | Indigo-600 | `#4f46e5` |
| **Success/Grant** | Green-600 | `#16a34a` |
| **Danger/Delete** | Red-600 | `#dc2626` |
| **Secondary/Cancel** | White/10 | `rgba(255,255,255,0.1)` |

### Text Colors

| Purpose | Source |
|---------|--------|
| Primary text | `theme.text` (white) |
| Muted/secondary | `theme.mutedText` (#94a3b8) |
| Labels | `text-slate-400` or `text-slate-500` |

### Backgrounds

| Purpose | Source |
|---------|--------|
| Page background | `theme.background` (#020617) |
| Card/panel | `theme.card` (rgba white 5%) |
| Input fields | `bg-black/20` or `theme.card` |
| Borders | `theme.border` (rgba white 10%) |

## Common Patterns

### Action Buttons
```tsx
// Primary action (indigo)
<TouchableOpacity style={{ backgroundColor: '#4f46e5' }}>

// Success action (green)  
<TouchableOpacity style={{ backgroundColor: '#16a34a' }}>

// Danger action (red)
<TouchableOpacity style={{ backgroundColor: '#dc2626' }}>

// Secondary/cancel
<TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
```

### Text Inputs
```tsx
<TextInput
    style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        color: theme.text,
    }}
    placeholderTextColor={theme.mutedText}
/>
```

### Cards
```tsx
<View style={{
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
}}>
```

## Common Mistakes

❌ `backgroundColor: theme.primary` for buttons (this is white!)
✅ `backgroundColor: '#4f46e5'` for action buttons

❌ Hardcoding white text: `color: 'white'`
✅ Using theme: `color: theme.text`

❌ Missing placeholder color on inputs
✅ Always add: `placeholderTextColor={theme.mutedText}`
