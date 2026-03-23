-- Create users table for storing user profiles and roles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  location TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('Swedish', 'Shiatsu', 'Thai', 'Combination')),
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration INT NOT NULL DEFAULT 60,
  extra_minutes INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'client')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Bookings table policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
CREATE POLICY "Users can insert their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
CREATE POLICY "Admins can update all bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Messages table policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
CREATE POLICY "Users can insert their own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can insert messages for any user" ON public.messages;
CREATE POLICY "Admins can insert messages for any user" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
