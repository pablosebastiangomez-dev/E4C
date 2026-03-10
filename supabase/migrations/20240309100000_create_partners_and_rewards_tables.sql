
-- migrations/20240309100000_create_partners_and_rewards_tables.sql

-- Create the partners table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    contact_email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the rewards table
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cost_e4c INTEGER NOT NULL CHECK (cost_e4c > 0),
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add indexes for performance
CREATE INDEX idx_rewards_partner_id ON rewards (partner_id);
CREATE INDEX idx_rewards_is_featured ON rewards (is_featured);
