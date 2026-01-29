# Safe Multi-Device Sync Implementation Plan

## Problem Statement

The current `fullSync` pushes ALL local data via upsert, regardless of whether the cloud has newer versions. This causes data loss when:

1. Edit on Device A → syncs
2. Edit same record on Device B → syncs  
3. Open Device A (stale cache) → edit something else → sync
4. **Result**: Device A overwrites Device B's changes

---

## Proposed Solution

### 1. Dirty Tracking

Only push records that were actually modified locally.

#### Implementation

Add to Zustand store state:
```typescript
dirtyRecords: { table: TableName, id: string }[]
```

Modify all `update*` actions to mark records dirty:
```typescript
updateEvent: (id, updates) => {
    set((state) => ({
        events: state.events.map(e => e.id === id ? {...e, ...updates} : e),
        dirtyRecords: [...state.dirtyRecords, { table: 'events', id }]
    }));
}
```

Clear dirty flag after successful push.

---

### 2. Timestamp Comparison (Check Before Push)

#### On Individual Save (Online)

When user saves a record:

1. Fetch cloud version's `updatedAt`
2. Compare:
   - **Local ≥ Cloud** → Safe to push
   - **Local < Cloud** → Show conflict dialog

#### Conflict Dialog

> **"This record was updated on another device"**
>
> | Option | Action |
> |--------|--------|
> | **Keep Mine** | Push local version, overwrite cloud |
> | **Keep Theirs** | Pull cloud version, discard local changes |
> | **Cancel** | Return to editor, no action |

---

### 3. Batch Sync (Offline → Online)

When device comes online and runs `fullSync`:

```
For each record in dirtyRecords:
  1. Fetch cloud version's updatedAt
  2. If local >= cloud:
       → Push to cloud
       → Remove from dirtyRecords
  3. If local < cloud:
       → Skip push
       → Add to conflictLog
       
After sync:
  If conflictLog.length > 0:
    → Show notification: "X records have conflicts"
```

#### Conflict Log Structure

```typescript
interface SyncConflict {
    id: string;
    table: TableName;
    recordId: string;
    localVersion: any;        // Snapshot of local data
    localUpdatedAt: string;
    cloudUpdatedAt: string;
    createdAt: string;        // When conflict was detected
}

// Store state
conflictLog: SyncConflict[]
```

---

### 4. Conflict Resolution UI

New screen: `/modal/sync-conflicts`

| Element | Description |
|---------|-------------|
| List of conflicts | Shows record name, table, and timestamps |
| Per-conflict actions | "Keep Mine" / "Keep Theirs" / "View Details" |
| Bulk actions | "Keep All Mine" / "Keep All Theirs" |
| Badge | Show count on Settings or Home if conflicts exist |

---

## Implementation Phases

### Phase 1: Dirty Tracking + Check-on-Save
- Add `dirtyRecords` to store
- Modify update actions to mark dirty
- On save, fetch cloud timestamp and compare
- Show simple "Keep Mine / Keep Theirs" dialog
- **Estimated effort**: 4-6 hours

### Phase 2: Batch Sync Safety
- Modify `pushAllToCloud` to only push dirty records
- Pre-fetch cloud timestamps for dirty records
- Skip stale pushes, log conflicts
- **Estimated effort**: 2-3 hours

### Phase 3: Conflict Resolution UI
- Create conflict log in store
- Build `/modal/sync-conflicts` screen
- Add notification badge
- **Estimated effort**: 3-4 hours

---

## Files to Modify

| File | Changes |
|------|---------|
| `store/contentStore.ts` | Add `dirtyRecords`, `conflictLog`, modify update actions |
| `lib/sync.ts` | Add `checkForConflict()`, modify `pushAllToCloud()` |
| `app/modal/sync-conflicts.tsx` | [NEW] Conflict resolution UI |
| Components using save | Call conflict check before push |

---

## Risks & Considerations

1. **Clock Skew**: Devices with incorrect clocks could cause false conflicts. Mitigation: Use server timestamps only.

2. **Network Latency**: Checking cloud timestamp adds latency to saves. Mitigation: Cache recent cloud timestamps, refresh periodically.

3. **Merge Conflicts**: "Keep Mine / Keep Theirs" is coarse. Future enhancement: field-level merge for complex records.

4. **Offline Duration**: Long offline periods = many potential conflicts. UX should handle bulk resolution gracefully.

---

## Success Criteria

- [ ] Editing on Device A, then Device B, does NOT cause data loss
- [ ] User is notified of conflicts before data is overwritten
- [ ] Conflicts can be resolved per-record
- [ ] Sync performance is not significantly degraded
