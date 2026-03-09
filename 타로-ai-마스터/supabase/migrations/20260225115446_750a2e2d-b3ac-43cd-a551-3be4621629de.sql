
-- Create tarot_readings table for storing consultation records
CREATE TABLE public.tarot_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  cards JSONB NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public inserts (no auth required for this app)
ALTER TABLE public.tarot_readings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert readings
CREATE POLICY "Anyone can insert readings" ON public.tarot_readings
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read their own session readings
CREATE POLICY "Anyone can read readings" ON public.tarot_readings
  FOR SELECT USING (true);
