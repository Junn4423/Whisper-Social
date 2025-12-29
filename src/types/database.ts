// Database types generated from Supabase schema
// These types ensure type-safety across the application

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UnlockType = 'PHOTO' | 'CHAT';

export type TransactionType =
  | 'INITIAL_BONUS'
  | 'UNLOCK_PHOTO'
  | 'UNLOCK_CHAT'
  | 'TOP_UP'
  | 'EARNED_FROM_UNLOCK'
  | 'REFUND'
  | 'BONUS';

export type Gender = 'Nam' | 'Nữ' | 'Khác';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          coins: number;
          is_verified: boolean;
          gender: Gender | null;
          age: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          coins?: number;
          is_verified?: boolean;
          gender?: Gender | null;
          age?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          coins?: number;
          is_verified?: boolean;
          gender?: Gender | null;
          age?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      confessions: {
        Row: {
          id: string;
          author_id: string | null;
          content: string;
          image_url: string | null;
          blurred_image_url: string | null;
          is_anonymous: boolean;
          gender: Gender;
          age: number;
          unlock_price: number;
          chat_price: number;
          view_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          content: string;
          image_url?: string | null;
          blurred_image_url?: string | null;
          is_anonymous?: boolean;
          gender: Gender;
          age: number;
          unlock_price?: number;
          chat_price?: number;
          view_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          content?: string;
          image_url?: string | null;
          blurred_image_url?: string | null;
          is_anonymous?: boolean;
          gender?: Gender;
          age?: number;
          unlock_price?: number;
          chat_price?: number;
          view_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "confessions_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      unlocks: {
        Row: {
          id: string;
          user_id: string;
          target_id: string;
          target_type: UnlockType;
          coins_spent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_id: string;
          target_type: UnlockType;
          coins_spent: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_id?: string;
          target_type?: UnlockType;
          coins_spent?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "unlocks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          confession_id: string | null;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          confession_id?: string | null;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          confession_id?: string | null;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_confession_id_fkey";
            columns: ["confession_id"];
            isOneToOne: false;
            referencedRelation: "confessions";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          description: string | null;
          reference_id: string | null;
          balance_after: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          description?: string | null;
          reference_id?: string | null;
          balance_after: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: TransactionType;
          description?: string | null;
          reference_id?: string | null;
          balance_after?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      chat_rooms: {
        Row: {
          id: string;
          confession_id: string | null;
          participant_1: string;
          participant_2: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          confession_id?: string | null;
          participant_1: string;
          participant_2: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          confession_id?: string | null;
          participant_1?: string;
          participant_2?: string;
          last_message_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_rooms_participant_1_fkey";
            columns: ["participant_1"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_rooms_participant_2_fkey";
            columns: ["participant_2"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_rooms_confession_id_fkey";
            columns: ["confession_id"];
            isOneToOne: false;
            referencedRelation: "confessions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      process_unlock: {
        Args: {
          p_user_id: string;
          p_target_id: string;
          p_target_type: UnlockType;
          p_cost: number;
        };
        Returns: Json;
      };
      has_unlocked: {
        Args: {
          p_user_id: string;
          p_target_id: string;
          p_target_type: UnlockType;
        };
        Returns: boolean;
      };
      get_unread_count: {
        Args: {
          p_user_id: string;
        };
        Returns: number;
      };
    };
    Enums: {
      unlock_type: UnlockType;
      transaction_type: TransactionType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper type aliases
type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

// Convenience types for use in components
export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type Confession = Tables<'confessions'>;
export type ConfessionInsert = TablesInsert<'confessions'>;
export type ConfessionUpdate = TablesUpdate<'confessions'>;

export type Unlock = Tables<'unlocks'>;
export type UnlockInsert = TablesInsert<'unlocks'>;

export type Message = Tables<'messages'>;
export type MessageInsert = TablesInsert<'messages'>;

export type Transaction = Tables<'transactions'>;

export type ChatRoom = Tables<'chat_rooms'>;

// Extended types with relations
export interface ConfessionWithAuthor extends Confession {
  author?: Pick<Profile, 'id' | 'username' | 'avatar_url'> | null;
}

export interface MessageWithSender extends Message {
  sender?: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
}

export interface ChatRoomWithParticipants extends ChatRoom {
  participant_1_profile?: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
  participant_2_profile?: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
  confession?: Confession;
  last_message?: Message;
}
