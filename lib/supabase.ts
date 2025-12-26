import { platformStorage } from '@/lib/storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://iwobmkglhkuzwouheviu.supabase.co';
const supabaseAnonKey = 'sb_publishable_ihQj8dkL4EPeYB9fDf1EcA_y6LNLf7j';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: platformStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
