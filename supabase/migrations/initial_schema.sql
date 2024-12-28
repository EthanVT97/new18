-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT auth.uid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chat rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view other users"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage users"
    ON public.users FOR ALL
    TO authenticated
    USING (is_admin = true);

CREATE POLICY "Users can view chat rooms"
    ON public.chat_rooms FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage chat rooms"
    ON public.chat_rooms FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.is_admin = true
    ));

CREATE POLICY "Users can view messages"
    ON public.messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert messages"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
        NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.is_blocked = true
        )
    );

-- Create functions for realtime
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, username)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
