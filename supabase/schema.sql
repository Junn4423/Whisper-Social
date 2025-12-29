-- =============================================
-- WhisperPay Database Schema
-- Phase 2: Real Backend with Supabase
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- Linked to auth.users, stores user profile data
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  coins INTEGER DEFAULT 20 NOT NULL CHECK (coins >= 0),
  is_verified BOOLEAN DEFAULT FALSE,
  gender TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
  age INTEGER CHECK (age >= 13 AND age <= 120),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- =============================================
-- 2. CONFESSIONS TABLE
-- Stores all confession posts
-- =============================================
CREATE TABLE IF NOT EXISTS confessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 2000),
  image_url TEXT,
  blurred_image_url TEXT, -- Pre-generated blurred version for performance
  is_anonymous BOOLEAN DEFAULT TRUE,
  gender TEXT NOT NULL CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
  unlock_price INTEGER DEFAULT 10 NOT NULL CHECK (unlock_price >= 0),
  chat_price INTEGER DEFAULT 5 NOT NULL CHECK (chat_price >= 0),
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for confessions
CREATE INDEX IF NOT EXISTS idx_confessions_author ON confessions(author_id);
CREATE INDEX IF NOT EXISTS idx_confessions_created ON confessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_active ON confessions(is_active) WHERE is_active = TRUE;

-- =============================================
-- 3. UNLOCKS TABLE
-- Tracks who unlocked which confession/chat
-- =============================================
CREATE TYPE unlock_type AS ENUM ('PHOTO', 'CHAT');

CREATE TABLE IF NOT EXISTS unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL, -- Can be confession_id or profile_id depending on type
  target_type unlock_type NOT NULL,
  coins_spent INTEGER NOT NULL CHECK (coins_spent >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure unique unlock per user per target per type
  UNIQUE(user_id, target_id, target_type)
);

-- Indexes for unlocks
CREATE INDEX IF NOT EXISTS idx_unlocks_user ON unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocks_target ON unlocks(target_id, target_type);

-- =============================================
-- 4. MESSAGES TABLE
-- Stores chat messages between users
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  confession_id UUID REFERENCES confessions(id) ON DELETE SET NULL, -- Context of the chat
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 5000),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraint: sender and receiver must be different
  CONSTRAINT different_users CHECK (sender_id != receiver_id)
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_confession ON messages(confession_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;

-- =============================================
-- 5. TRANSACTIONS TABLE
-- History of all coin transactions
-- =============================================
CREATE TYPE transaction_type AS ENUM (
  'INITIAL_BONUS',
  'UNLOCK_PHOTO',
  'UNLOCK_CHAT',
  'TOP_UP',
  'EARNED_FROM_UNLOCK',
  'REFUND',
  'BONUS'
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for credits, negative for debits
  type transaction_type NOT NULL,
  description TEXT,
  reference_id UUID, -- ID of related unlock/confession
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);

-- =============================================
-- 6. CHAT ROOMS TABLE (Optional: for tracking active chats)
-- =============================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE,
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint for chat room between two users about a confession
  UNIQUE(confession_id, participant_1, participant_2)
);

-- Index for chat rooms
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participants ON chat_rooms(participant_1, participant_2);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Anyone can view basic profile info
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but backup policy)
-- Also allow trigger-based inserts where auth.uid() is null
CREATE POLICY "Users or system can insert profile"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR auth.uid() IS NULL
    OR auth.role() = 'service_role'
  );

-- =============================================
-- CONFESSIONS POLICIES
-- =============================================

-- Anyone can view active confessions (public data only)
CREATE POLICY "Active confessions are viewable by everyone"
  ON confessions FOR SELECT
  USING (is_active = true);

-- Authenticated users can create confessions
CREATE POLICY "Authenticated users can create confessions"
  ON confessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authors can update their own confessions
CREATE POLICY "Authors can update own confessions"
  ON confessions FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Authors can delete (soft delete) their own confessions
CREATE POLICY "Authors can delete own confessions"
  ON confessions FOR DELETE
  USING (auth.uid() = author_id);

-- =============================================
-- UNLOCKS POLICIES
-- =============================================

-- Users can view their own unlocks
CREATE POLICY "Users can view own unlocks"
  ON unlocks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create unlocks (controlled by server action with coin check)
CREATE POLICY "Authenticated users can create unlocks"
  ON unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- MESSAGES POLICIES
-- =============================================

-- Users can only view messages they sent or received
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages (additional chat unlock check in application logic)
CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update their sent messages (mark as read for received)
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- =============================================
-- TRANSACTIONS POLICIES
-- =============================================

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Inserts happen via triggers (auth.uid() is null) and service role
CREATE POLICY "System can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() IS NULL
    OR auth.role() = 'service_role'
  );

-- =============================================
-- CHAT ROOMS POLICIES
-- =============================================

-- Users can view chat rooms they're part of
CREATE POLICY "Users can view own chat rooms"
  ON chat_rooms FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to generate random anonymous username
CREATE OR REPLACE FUNCTION generate_anonymous_username()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY['Hidden', 'Shadow', 'Secret', 'Mystery', 'Whisper', 'Silent', 'Ghost', 'Night', 'Dark', 'Mystic', 'Phantom', 'Dream', 'Star', 'Moon', 'Cyber'];
  nouns TEXT[] := ARRAY['Stranger', 'Soul', 'Spirit', 'Voice', 'Heart', 'Mind', 'Walker', 'Seeker', 'Wanderer', 'Dreamer', 'Phoenix', 'Wolf', 'Fox', 'Raven', 'Tiger'];
  random_adj TEXT;
  random_noun TEXT;
  random_num TEXT;
  new_username TEXT;
BEGIN
  random_adj := adjectives[floor(random() * array_length(adjectives, 1)) + 1];
  random_noun := nouns[floor(random() * array_length(nouns, 1)) + 1];
  random_num := floor(random() * 9999)::TEXT;
  new_username := random_adj || random_noun || random_num;
  RETURN new_username;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  username_exists BOOLEAN;
BEGIN
  -- Generate unique username
  LOOP
    new_username := generate_anonymous_username();
    SELECT EXISTS(SELECT 1 FROM profiles WHERE username = new_username) INTO username_exists;
    EXIT WHEN NOT username_exists;
  END LOOP;
  
  -- Create profile with initial coins
  INSERT INTO profiles (id, username, coins, avatar_url)
  VALUES (
    NEW.id,
    new_username,
    20, -- Initial bonus coins
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
  );
  
  -- Record initial bonus transaction
  INSERT INTO transactions (user_id, amount, type, description, balance_after)
  VALUES (
    NEW.id,
    20,
    'INITIAL_BONUS',
    'Xu chào mừng thành viên mới! / Welcome bonus coins!',
    20
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confessions_updated_at
  BEFORE UPDATE ON confessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to process unlock with coin transaction (atomic)
CREATE OR REPLACE FUNCTION process_unlock(
  p_user_id UUID,
  p_target_id UUID,
  p_target_type unlock_type,
  p_cost INTEGER
)
RETURNS JSONB AS $$
DECLARE
  current_coins INTEGER;
  new_balance INTEGER;
  unlock_id UUID;
  author_id UUID;
BEGIN
  -- Get current coins with row lock
  SELECT coins INTO current_coins
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF current_coins IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Check if already unlocked
  IF EXISTS (
    SELECT 1 FROM unlocks
    WHERE user_id = p_user_id
    AND target_id = p_target_id
    AND target_type = p_target_type
  ) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already unlocked', 'already_unlocked', true);
  END IF;
  
  -- Check if enough coins
  IF current_coins < p_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins', 'coins_needed', p_cost, 'coins_available', current_coins);
  END IF;
  
  -- Deduct coins
  new_balance := current_coins - p_cost;
  UPDATE profiles SET coins = new_balance WHERE id = p_user_id;
  
  -- Create unlock record
  INSERT INTO unlocks (user_id, target_id, target_type, coins_spent)
  VALUES (p_user_id, p_target_id, p_target_type, p_cost)
  RETURNING id INTO unlock_id;
  
  -- Record transaction
  INSERT INTO transactions (user_id, amount, type, description, reference_id, balance_after)
  VALUES (
    p_user_id,
    -p_cost,
    CASE p_target_type
      WHEN 'PHOTO' THEN 'UNLOCK_PHOTO'
      WHEN 'CHAT' THEN 'UNLOCK_CHAT'
    END,
    CASE p_target_type
      WHEN 'PHOTO' THEN 'Mở khóa ảnh / Unlock photo'
      WHEN 'CHAT' THEN 'Mở khóa chat / Unlock chat'
    END,
    p_target_id,
    new_balance
  );
  
  -- Give coins to confession author (if applicable and not anonymous)
  IF p_target_type = 'PHOTO' THEN
    SELECT a.author_id INTO author_id
    FROM confessions a
    WHERE a.id = p_target_id;
    
    IF author_id IS NOT NULL AND author_id != p_user_id THEN
      -- Give 50% to author
      UPDATE profiles
      SET coins = coins + (p_cost / 2)
      WHERE id = author_id;
      
      INSERT INTO transactions (user_id, amount, type, description, reference_id, balance_after)
      VALUES (
        author_id,
        p_cost / 2,
        'EARNED_FROM_UNLOCK',
        'Có người mở khóa ảnh của bạn! / Someone unlocked your photo!',
        p_target_id,
        (SELECT coins FROM profiles WHERE id = author_id)
      );
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'unlock_id', unlock_id,
    'new_balance', new_balance,
    'coins_spent', p_cost
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has unlocked content
CREATE OR REPLACE FUNCTION has_unlocked(
  p_user_id UUID,
  p_target_id UUID,
  p_target_type unlock_type
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM unlocks
    WHERE user_id = p_user_id
    AND target_id = p_target_id
    AND target_type = p_target_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's unread message count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages
    WHERE receiver_id = p_user_id
    AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for messages table
-- =============================================

-- Note: Run this in Supabase Dashboard -> Database -> Replication
-- Or use the following:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE confessions;

-- =============================================
-- STORAGE BUCKET CONFIGURATION
-- Run this in Supabase Dashboard or via API
-- =============================================

-- Create bucket for confession media (run in Supabase dashboard)
-- Fix bucket creation: use EXISTS check instead of ON CONFLICT
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    SELECT 'confession-media', 'confession-media', true
    WHERE NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'confession-media'
    );
END $$;

-- Then run Storage policies (to ensure access rights)
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'confession-media');

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'confession-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE USING (bucket_id = 'confession-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment below to insert sample data after running the schema

/*
-- Sample confessions (make sure to replace with valid user IDs after signup)
INSERT INTO confessions (content, image_url, is_anonymous, gender, age) VALUES
('Tôi thầm thích một người trong lớp suốt 3 năm nhưng chưa bao giờ dám thổ lộ. Mỗi lần nhìn thấy người ấy, tim tôi đập thật nhanh... 💕', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', true, 'Nữ', 22),
('Có ai từng cảm thấy cô đơn giữa đám đông chưa? Tôi có rất nhiều bạn bè nhưng không ai thực sự hiểu tôi... 🌙', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', true, 'Nam', 25),
('Tôi vừa chia tay người yêu 5 năm. Đau lắm nhưng biết đây là quyết định đúng đắn. Ai ở đây có thể lắng nghe tôi không? 😢', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', true, 'Nữ', 27);
*/
