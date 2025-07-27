
// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://paqpnxpvvahcqkkxefxx.supabase.co'; // 🟢 Replace with your URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcXBueHB2dmFoY3Fra3hlZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODQ5NzMsImV4cCI6MjA2OTE2MDk3M30.KvJ03Hc48hp6YK3WLSfbG2xFQE8yLomVJab_Nx8-xYM'; 


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
