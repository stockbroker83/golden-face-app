CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  payment_key TEXT,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select" ON public.subscriptions
  FOR SELECT USING (true);