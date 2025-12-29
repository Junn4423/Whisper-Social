-- =============================================
-- WhisperPay Schema Update - Major Refactor
-- Date: 2025-12-29
-- Modules: Dynamic Pricing, Trust & Safety
-- =============================================

-- =============================================
-- MODULE 3: TRUST & SAFETY - REPORTS TABLE
-- =============================================

-- Create report_status enum type
DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create report_reason enum type for better data integrity
DO $$ BEGIN
    CREATE TYPE report_reason AS ENUM (
        'OFFENSIVE_CONTENT',    -- Nội dung thô tục
        'SCAM',                 -- Lừa đảo
        'EXPLICIT_IMAGE',       -- Ảnh nhạy cảm không che
        'HARASSMENT',           -- Quấy rối
        'SPAM',                 -- Spam
        'OTHER'                 -- Khác
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
    reason report_reason NOT NULL,
    description TEXT, -- Optional additional description
    status report_status DEFAULT 'PENDING' NOT NULL,
    admin_notes TEXT, -- Notes from admin handling the report
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Prevent duplicate reports from same user for same confession
    UNIQUE(reporter_id, target_id)
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);

-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- REPORTS RLS POLICIES
-- =============================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Authenticated users can report"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Only admins can update reports (status changes)
-- Note: In production, you'd check against an admin role
CREATE POLICY "System can update reports"
    ON reports FOR UPDATE
    USING (auth.uid() IS NULL OR auth.role() = 'service_role');

-- =============================================
-- HIDDEN CONFESSIONS TABLE
-- Track which confessions each user has hidden (from reports)
-- =============================================

CREATE TABLE IF NOT EXISTS hidden_confessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
    hidden_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, confession_id)
);

CREATE INDEX IF NOT EXISTS idx_hidden_confessions_user ON hidden_confessions(user_id);

ALTER TABLE hidden_confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hidden confessions"
    ON hidden_confessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can hide confessions"
    ON hidden_confessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unhide confessions"
    ON hidden_confessions FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- FUNCTION: Create report and hide confession
-- =============================================

CREATE OR REPLACE FUNCTION create_report_and_hide(
    p_reporter_id UUID,
    p_target_id UUID,
    p_reason report_reason,
    p_description TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    report_id UUID;
BEGIN
    -- Check if already reported
    IF EXISTS (
        SELECT 1 FROM reports
        WHERE reporter_id = p_reporter_id AND target_id = p_target_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already reported');
    END IF;

    -- Create report
    INSERT INTO reports (reporter_id, target_id, reason, description)
    VALUES (p_reporter_id, p_target_id, p_reason, p_description)
    RETURNING id INTO report_id;

    -- Hide the confession for this user
    INSERT INTO hidden_confessions (user_id, confession_id)
    VALUES (p_reporter_id, p_target_id)
    ON CONFLICT (user_id, confession_id) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'report_id', report_id,
        'message', 'Report submitted successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Get user's hidden confession IDs
-- =============================================

CREATE OR REPLACE FUNCTION get_hidden_confessions(p_user_id UUID)
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT confession_id FROM hidden_confessions
        WHERE user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Add updated_at trigger for reports
-- =============================================

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MODULE 1: Verify unlock_price and chat_price constraints
-- These columns already exist, just verify constraints
-- =============================================

-- Ensure proper constraints on pricing columns (already exist in schema)
-- unlock_price: Min 0, Max 100
-- chat_price: Min 0, Max 50

DO $$ 
BEGIN
    -- Add constraints if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'confessions_unlock_price_max'
    ) THEN
        ALTER TABLE confessions 
        ADD CONSTRAINT confessions_unlock_price_max 
        CHECK (unlock_price >= 0 AND unlock_price <= 100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'confessions_chat_price_max'
    ) THEN
        ALTER TABLE confessions 
        ADD CONSTRAINT confessions_chat_price_max 
        CHECK (chat_price >= 0 AND chat_price <= 50);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN check_violation THEN 
        -- If existing data violates constraint, update it first
        UPDATE confessions SET unlock_price = LEAST(unlock_price, 100) WHERE unlock_price > 100;
        UPDATE confessions SET chat_price = LEAST(chat_price, 50) WHERE chat_price > 50;
END $$;

-- Enable realtime for reports table
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
