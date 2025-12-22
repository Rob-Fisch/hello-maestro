import { supabase } from './supabase';

export type TableName = 'blocks' | 'routines' | 'events' | 'categories' | 'people' | 'learning_paths' | 'user_progress' | 'proof_of_work';

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
        userId: 'user_id',
        pathId: 'path_id',
        nodeId: 'node_id',
        completedAt: 'completed_at',
        proofUrl: 'proof_url',
        proofType: 'proof_type',
        updatedAt: 'updated_at',
    };





    const mapped: any = {};
    for (const key in data) {
        const dbKey = mapping[key] || key;
        mapped[dbKey] = data[key];
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

    try {
        const { error } = await supabase
            .from(table)
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            console.warn(`[Sync Error] ${table}:`, error.message);
        }
    } catch (err) {
        console.warn(`[Sync Exception] ${table}:`, err);
    }
}


/**
 * Specifically for deletions
 */
export async function deleteFromCloud(table: TableName, id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) {
            console.warn(`[Sync Delete Error] ${table}:`, error.message);
        }
    } catch (err) {
        console.warn(`[Sync Delete Exception] ${table}:`, err);
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
function mapFromDb(data: any): any {
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
        user_id: 'userId',
        path_id: 'pathId',
        node_id: 'nodeId',
        completed_at: 'completedAt',
        proof_url: 'proofUrl',
        proof_type: 'proofType',
        updated_at: 'updatedAt',
    };





    const mapped: any = {};
    for (const key in data) {
        const localKey = mapping[key] || key;
        mapped[localKey] = data[key];
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
    } catch (err) {
        console.warn(`[Push Exception] ${table}:`, err);
        throw err;
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
    };
}

/**
 * Fetches all user data from cloud for reconciliation
 */
export async function pullFromCloud() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const tables: TableName[] = ['blocks', 'routines', 'events', 'categories', 'people', 'learning_paths', 'user_progress', 'proof_of_work'];
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


