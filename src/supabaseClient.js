// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Ganti dengan URL dan KEY dari project Supabase kamu
const supabaseUrl = 'https://ilujebkblmdssudiifku.supabase.co'
const supabaseKey = 'sb_publishable_1MvKTTUWhcCS95Uo7voDCg_Bs6AKd_R'

export const supabase = createClient(supabaseUrl, supabaseKey)