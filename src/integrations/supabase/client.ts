// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zxnlfejhnxbrsnuoohfg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bmxmZWpobnhicnNudW9vaGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzYyMTIsImV4cCI6MjA2NDcxMjIxMn0.Vn7ITpMVlmL_KUmL57gxi0QLuRsV2-kWMT-3j3o07fc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);