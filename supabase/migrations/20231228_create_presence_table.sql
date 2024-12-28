-- Create user_presence table
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    status TEXT DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Allow users to view all presence data
CREATE POLICY "User presence data is viewable by authenticated users"
    ON user_presence FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to update their own presence
CREATE POLICY "Users can update their own presence"
    ON user_presence FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own presence
CREATE POLICY "Users can insert their own presence"
    ON user_presence FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_presence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER user_presence_updated_at
    BEFORE UPDATE ON user_presence
    FOR EACH ROW
    EXECUTE PROCEDURE handle_presence_updated_at();
