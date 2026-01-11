import { Platform } from 'react-native';
import { supabase } from './supabase';

export type TableName = 'blocks' | 'routines' | 'events' | 'categories' | 'people' | 'learning_paths' | 'user_progress' | 'proof_of_work' | 'gear_assets' | 'pack_lists' | 'transactions' | 'songs' | 'set_lists';

/**
 * Helper to map camelCase local types to snake_case DB columns
 */
function mapToDb(data: any): any {
    const mapping: Record<string, string> = {
        categoryId: 'category_id',
        mediaUri: 'media_uri',
        linkUrl: 'link_url',
        createdAt: 'created_at',
        personnelIds: 'personnel_ids',
        isRecurring: 'is_recurring',
        nativeId: 'native_id',
        firstName: 'first_name',
        lastName: 'last_name',
        studentName: 'student_name',
        schedule: 'schedule',
        venue: 'venue',
        fee: 'fee',
        slots: 'slots',
        verifiedPhone: 'verified_phone',
        instruments: 'instruments',
        totalFee: 'total_fee',
        musicianFee: 'musician_fee',
        duration: 'duration',
        ownerId: 'owner_id',
        treeData: 'tree_data',
        routineId: 'routine_id',
        forkedFromId: 'forked_from_id',
        rootOriginId: 'root_origin_id',
        originatorName: 'originator_name',
        originatorPathTitle: 'originator_path_title',
        isPublic: 'is_public',
        originalRoutineId: 'original_routine_id',
        clonedFromUserId: 'cloned_from_user_id',
        socialLink: 'social_link',
        userId: 'user_id',
        pathId: 'path_id',
        nodeId: 'node_id',
        completedAt: 'completed_at',
        proofUrl: 'proof_url',
        proofType: 'proof_type',
        updatedAt: 'updated_at',
        serialNumber: 'serial_number',
        manufactureYear: 'manufacture_year',
        isWishlist: 'is_wishlist',
        loanDetails: 'loan_details',
        eventId: 'event_id',
        itemIds: 'item_ids',
        checkedItemIds: 'checked_item_ids',
        relatedEventId: 'related_event_id',
        expiresAt: 'expires_at',
        receiptUri: 'receipt_uri',
        isPublicStagePlot: 'is_public_stage_plot',
        publicDescription: 'public_description',
        showSetlist: 'show_setlist',
        deletedAt: 'deleted_at',
        // Songs
        durationSeconds: 'duration_seconds',
        lastSyncedAt: 'last_synced_at',
        // Set Lists
        items: 'items',
    };




    const mapped: any = {};
    for (const key in data) {
        const dbKey = mapping[key] || key;
        const value = data[key];
        // CRITICAL: Do not send null/undefined for deletedAt, otherwise we resurrect zombies!
        // We generally want to avoid sending nulls to allow DB defaults or existing values (like soft deletes) to persist.
        if (value !== undefined && value !== null) {
            mapped[dbKey] = value;
        }
    }
    return mapped;
}

export async function syncToCloud(table: TableName, data: any) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; // User not logged in, skip cloud sync

    // Add user_id and map keys to snake_case
    const payload = {
        ...mapToDb(data),
        user_id: session.user.id,
        last_synced_at: new Date().toISOString(),
    };

    // Debug logging for routines to verify is_public status
    if (table === 'routines') {
        console.log(`[Sync Debug] Pushing routine update: id=${payload.id}, is_public=${payload.is_public}`);
    }

    try {
        const { error } = await supabase
            .from(table)
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            console.warn(`[Sync Error] ${table}:`, error.message);
            // Alert user so they know data isn't saving!
            // import { Alert } from 'react-native'; // Ensure this is imported at top or used from checking Platform
            // But this function is in lib/sync.ts, simple console.warn might be hidden.
            // Let's re-throw or validly log.
            // Actually, let's just use console for now but make it error so it shows in red
            console.error(`[Sync Error] ${table}:`, error.message);
        }
    } catch (err) {
        console.warn(`[Sync Exception] ${table}:`, err);
    }
}


/**
 * Specifically for deletions (Soft Delete)
 */
export async function deleteFromCloud(table: TableName, id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
        // Soft Delete: Mark as deleted instead of removing row
        const { error } = await supabase
            .from(table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) {
            console.warn(`[Sync Soft-Delete Error] ${table}:`, error.message);
        }
    } catch (err) {
        console.warn(`[Sync Soft-Delete Exception] ${table}:`, err);
    }
}

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadMediaToCloud(localUri: string, filename: string): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    try {
        const formData = new FormData();
        // In React Native, we need a special blob-like object for FormData
        const response = await fetch(localUri);
        const blob = await response.blob();

        // ---------------------------------------------------------
        // TOTAL STORAGE QUOTA CHECK
        // ---------------------------------------------------------
        const fileSize = blob.size;
        const isPro = session.user.user_metadata?.is_premium === true; // "Pro"
        const isProPlus = session.user.user_metadata?.is_pro_plus === true; // "Pro+"

        // TOTAL QUOTAS (in Bytes)
        const QUOTA_FREE = 500 * 1024 * 1024;        // 500 MB
        const QUOTA_PRO = 10 * 1024 * 1024 * 1024;   // 10 GB
        const QUOTA_PRO_PLUS = 100 * 1024 * 1024 * 1024; // 100 GB

        let quota = QUOTA_FREE;
        if (isProPlus) quota = QUOTA_PRO_PLUS;
        else if (isPro) quota = QUOTA_PRO;

        // Check current usage via RPC
        const { data: currentUsage, error: usageError } = await supabase.rpc('get_user_storage_usage');

        if (!usageError) {
            const totalProjected = (currentUsage || 0) + fileSize;
            if (totalProjected > quota) {
                const quotaGB = (quota / (1024 * 1024 * 1024)).toFixed(1);
                const usedMB = ((currentUsage || 0) / (1024 * 1024)).toFixed(1);

                const msg = isProPlus
                    ? `Storage Limit Reached. You have used ${usedMB}MB of your ${quotaGB}GB limit.`
                    : isPro
                        ? `Storage Limit Reached. Upgrade to Pro+ for 100GB of storage.`
                        : `Storage Limit Reached. Upgrade to Pro for 10GB of storage.`;

                throw new Error(msg);
            }
        }
        // ---------------------------------------------------------

        const fileExt = filename.split('.').pop();
        const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('media')
            .upload(filePath, blob, {
                contentType: blob.type,
                upsert: true,
            });

        if (error) {
            console.warn('[Storage Error]:', error.message);
            return null;
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (err) {
        console.warn('[Storage Exception]:', err);
        return null;
    }
}

/**
 * Helper to map snake_case DB columns back to camelCase local types
 */
export function mapFromDb(data: any): any {
    const mapping: Record<string, string> = {
        category_id: 'categoryId',
        media_uri: 'mediaUri',
        link_url: 'linkUrl',
        created_at: 'createdAt',
        personnel_ids: 'personnelIds',
        is_recurring: 'isRecurring',
        native_id: 'nativeId',
        first_name: 'firstName',
        last_name: 'lastName',
        student_name: 'studentName',
        schedule: 'schedule',
        venue: 'venue',
        fee: 'fee',
        slots: 'slots',
        verified_phone: 'verifiedPhone',
        instruments: 'instruments',
        total_fee: 'totalFee',
        musician_fee: 'musicianFee',
        duration: 'duration',
        owner_id: 'ownerId',
        tree_data: 'treeData',
        routine_id: 'routineId',
        forked_from_id: 'forkedFromId',
        root_origin_id: 'rootOriginId',
        originator_name: 'originatorName',
        originator_path_title: 'originatorPathTitle',
        is_public: 'isPublic',
        original_routine_id: 'originalRoutineId',
        cloned_from_user_id: 'clonedFromUserId',
        social_link: 'socialLink',
        user_id: 'userId',
        path_id: 'pathId',
        node_id: 'nodeId',
        completed_at: 'completedAt',
        proof_url: 'proofUrl',
        proof_type: 'proofType',
        updated_at: 'updatedAt',
        serial_number: 'serialNumber',
        manufacture_year: 'manufactureYear',
        is_wishlist: 'isWishlist',
        loan_details: 'loanDetails',
        event_id: 'eventId',
        item_ids: 'itemIds',
        checked_item_ids: 'checkedItemIds',
        related_event_id: 'relatedEventId',
        expires_at: 'expiresAt',
        receipt_uri: 'receiptUri',
        is_public_stage_plot: 'isPublicStagePlot',
        public_description: 'publicDescription',
        show_setlist: 'showSetlist',
        deleted_at: 'deletedAt',
    };





    const mapped: any = {};
    for (const key in data) {
        const localKey = mapping[key] || key;
        // Fix for Postgres 'numeric' type returning as string
        if (localKey === 'amount') {
            mapped[localKey] = Number(data[key]);
        } else {
            mapped[localKey] = data[key];
        }
    }
    return mapped;
}

/**
 * Pushes all local data for a table to the cloud
 */
export async function pushAllToCloud(table: TableName, dataArray: any[]) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !dataArray.length) return;

    const payloads = dataArray.map(item => ({
        ...mapToDb(item),
        user_id: session.user.id,
        last_synced_at: new Date().toISOString(),
    }));

    try {
        const { error } = await supabase
            .from(table)
            .upsert(payloads, { onConflict: 'id' });

        if (error) {
            throw new Error(`[Push Error] ${table}: ${error.message}`);
        }
    } catch (err: any) {
        console.warn(`[Push Exception] ${table}:`, err);
        if (Platform.OS === 'web') {
            console.warn(`Sync Error (${table}): ${err.message || err}`);
        } else {
            console.warn(`Sync Error (${table})`, err.message || JSON.stringify(err));
        }
    }
}


/**
 * Fetches the latest user profile metadata from Supabase Auth
 */
export async function pullProfileFromCloud() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    return {
        id: user.id,
        email: user.email || '',
        displayName: user.user_metadata?.display_name || 'Maestro',
        avatarUrl: user.user_metadata?.avatar_url,
        isPremium: !!user.user_metadata?.is_premium,
    };
}

/**
 * Fetches all user data from cloud for reconciliation
 */
export async function pullFromCloud() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const tables: TableName[] = ['blocks', 'routines', 'events', 'categories', 'people', 'learning_paths', 'user_progress', 'proof_of_work', 'gear_assets', 'pack_lists', 'transactions', 'songs', 'set_lists'];
    const results: any = {};

    try {
        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('user_id', session.user.id);

            if (error) {
                throw new Error(`[Pull Error] ${table}: ${error.message}`);
            } else {
                results[table] = (data || []).map(mapFromDb);
            }
        }
        return results;
    } catch (err) {
        console.warn('[Pull Exception]:', err);
        throw err;
    }
}


