import { createClient } from '@supabase/supabase-js'

// 1. Paste the "Project URL" found on the same API page
const supabaseUrl = 'https://eoicszzkovlvvgiyeqhd.supabase.co' 

// 2. Paste the "anon" "public" key here
const supabaseKey = 'sb_publishable_1fKMZQ_ahXPdSdUaMYoLGQ_gVpTngCy' 

export const supabase = createClient(supabaseUrl, supabaseKey)