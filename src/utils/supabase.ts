import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  recipient: string;
  delivery_status: 'pending' | 'sent' | 'failed';
  delivery_provider: string | null;
  created_at: string;
}

export interface ContactMessageInsert {
  name: string;
  email: string;
  message: string;
  recipient?: string;
  delivery_status?: 'pending' | 'sent' | 'failed';
  delivery_provider?: string | null;
}

export interface Database {
  public: {
    Tables: {
      contact_messages: {
        Row: ContactMessageRow;
        Insert: ContactMessageInsert;
        Update: Partial<ContactMessageInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient<Database> | null =
  supabaseUrl && supabaseKey ? createClient<Database>(supabaseUrl, supabaseKey) : null;
