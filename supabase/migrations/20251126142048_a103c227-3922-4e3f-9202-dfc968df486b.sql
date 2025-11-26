-- Create email_subscribers table for newsletter subscriptions
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS on email_subscribers
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
CREATE POLICY "Allow public to subscribe" ON public.email_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Only allow authenticated users to read subscribers
CREATE POLICY "Allow authenticated to read subscribers" ON public.email_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster email lookups
CREATE INDEX idx_email_subscribers_email ON public.email_subscribers(email);
CREATE INDEX idx_email_subscribers_active ON public.email_subscribers(is_active) WHERE is_active = true;