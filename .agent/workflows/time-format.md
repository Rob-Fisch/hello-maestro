---
description: How to format time displays in the app (always use 12-hour AM/PM)
---

# Time Display Rule

**All time displays in the app should use 12-hour format with AM/PM.**

## Correct
- `8:00 PM`
- `10:30 AM`
- `7:00 PM`

## Incorrect
- `20:00`
- `22:30`
- `19:00`

## Implementation

When displaying times stored as 24-hour strings (e.g., `"20:00"`), convert to 12-hour format:

```typescript
const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};
```

Or use `Date.toLocaleTimeString()` with options:

```typescript
const date = new Date(`2000-01-01T${time}`);
const formatted = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
});
```
