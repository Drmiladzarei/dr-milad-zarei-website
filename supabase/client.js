// Supabase client loader
// Include supabase-js CDN before this file when using it.
window.MZSupabase = null;
if (window.supabase && window.SUPABASE_CONFIG) {
  window.MZSupabase = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
  );
}
