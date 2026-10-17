
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://sbexrwmvdtmntptvpxaa.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fDkx5-f4U1UZo2c6lI_lHg_-vsLKkOI";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
